/**
 * hierro-push — servidor de notificaciones de HIERRO (Cloudflare Worker).
 *
 * - POST /subscribe   { subscription, hour: "HH:MM", tz }  → guarda en KV
 * - POST /unsubscribe { endpoint }                          → borra de KV
 * - POST /timer        { subscription, fireAt }             → alarma exacta (DO)
 * - POST /timer-cancel { endpoint }                         → cancela alarmas
 * - cron cada 5 min: envía el push de la creatina a su hora local
 *
 * Los push van SIN payload (no requieren cifrado): el service worker de la
 * app decide el texto. Autenticación VAPID firmada con WebCrypto (ES256).
 */

const ALLOWED_ORIGINS = ['https://jorgelopxz.github.io', 'http://localhost:5173']

// ---------------------------------------------------------------------------
// VAPID
// ---------------------------------------------------------------------------

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// PowerShell añade un BOM (U+FEFF) y a veces \r\n al subir los secrets por
// pipe. Eso corrompe la clave pública y el subject que Apple valida → 403.
// Quitamos cualquier carácter de control/BOM/espacio de los bordes.
function clean(s) {
  return String(s).replace(/^[﻿\s]+/, '').replace(/[﻿\s]+$/, '')
}

async function vapidHeaders(endpoint, env) {
  const aud = new URL(endpoint).origin
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600
  const enc = new TextEncoder()
  const subject = clean(env.VAPID_SUBJECT)
  const publicKey = clean(env.VAPID_PUBLIC)
  const header = b64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = b64url(
    enc.encode(JSON.stringify({ aud, exp, sub: subject }))
  )
  const key = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(clean(env.VAPID_PRIVATE_JWK)),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    enc.encode(`${header}.${payload}`)
  )
  return {
    Authorization: `vapid t=${header}.${payload}.${b64url(sig)}, k=${publicKey}`,
    TTL: '86400',
    Urgency: 'high'
  }
}

// ---------------------------------------------------------------------------
// Cifrado del payload (RFC 8291, aes128gcm) — Apple NO entrega pushes vacíos
// a iOS, así que el mensaje va cifrado de verdad.
// ---------------------------------------------------------------------------

function b64uToBytes(s) {
  let b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  // workerd es estricto con el padding de atob
  while (b64.length % 4 !== 0) b64 += '='
  const raw = atob(b64)
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

function concatBytes(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const a of arrays) {
    out.set(a, off)
    off += a.length
  }
  return out
}

async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  return new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8)
  )
}

async function encryptPayload(subscription, plaintext) {
  const enc = new TextEncoder()
  const uaPublic = b64uToBytes(subscription.keys.p256dh)
  const authSecret = b64uToBytes(subscription.keys.auth)

  const asKeys = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeys.publicKey))
  const uaKey = await crypto.subtle.importKey(
    'raw',
    uaPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
  const ecdh = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, asKeys.privateKey, 256)
  )

  const ikm = await hkdf(
    authSecret,
    ecdh,
    concatBytes(enc.encode('WebPush: info\0'), uaPublic, asPublic),
    32
  )
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12)

  // registro: texto || 0x02 (delimitador de último registro)
  const record = concatBytes(enc.encode(plaintext), new Uint8Array([2]))
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, record)
  )

  // cabecera: salt(16) | rs(4) | idlen(1) | clave pública efímera(65)
  const header = new Uint8Array(16 + 4 + 1 + 65)
  header.set(salt, 0)
  new DataView(header.buffer).setUint32(16, 4096)
  header[20] = 65
  header.set(asPublic, 21)
  return concatBytes(header, ciphertext)
}

/** Envía un push con payload cifrado. Devuelve { status, error? }. */
async function sendPushDetailed(subscription, env, payload) {
  try {
    const headers = await vapidHeaders(subscription.endpoint, env)
    const body = await encryptPayload(subscription, JSON.stringify(payload))
    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Encoding': 'aes128gcm',
        'Content-Type': 'application/octet-stream'
      },
      body
    })
    return { status: res.status }
  } catch (e) {
    return { status: 0, error: String(e && e.message ? e.message : e) }
  }
}

async function sendPush(subscription, env, payload) {
  return (await sendPushDetailed(subscription, env, payload)).status
}

const MSG_CREATINE = { title: '💊 Tómate la creatina', body: 'Recordatorio de HIERRO. Marca «tomada» para dejar de avisar.', kind: 'creatine' }
const MSG_TIMER = { title: '⏱️🔔 ¡DESCANSO TERMINADO!', body: '¡A por la siguiente serie! 💪', kind: 'timer' }

// ---------------------------------------------------------------------------
// HTTP API
// ---------------------------------------------------------------------------

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

async function subKey(endpoint) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint))
  return 'sub:' + b64url(hash)
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? ''
    const headers = { ...cors(origin), 'Content-Type': 'application/json' }
    if (request.method === 'OPTIONS') return new Response(null, { headers })
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ ok: true, service: 'hierro-push' }), { headers })
    }

    const url = new URL(request.url)
    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers })
    }

    if (url.pathname === '/subscribe') {
      const { subscription, hour, tz } = body
      if (!subscription?.endpoint || !/^\d{2}:\d{2}$/.test(hour ?? '')) {
        return new Response(JSON.stringify({ error: 'datos inválidos' }), { status: 400, headers })
      }
      // preserva el estado de "tomada" si ya existía esta suscripción
      const existing = await env.SUBS.get(await subKey(subscription.endpoint))
      const prev = existing ? JSON.parse(existing) : {}
      await env.SUBS.put(
        await subKey(subscription.endpoint),
        JSON.stringify({
          subscription,
          hour,
          tz: tz || 'Europe/Madrid',
          takenDay: prev.takenDay ?? '',
          lastNag: prev.lastNag ?? ''
        })
      )
      return new Response(JSON.stringify({ ok: true }), { headers })
    }

    if (url.pathname === '/unsubscribe') {
      if (body.endpoint) await env.SUBS.delete(await subKey(body.endpoint))
      return new Response(JSON.stringify({ ok: true }), { headers })
    }

    if (url.pathname === '/creatine-taken') {
      // la app avisa de que ya se tomó la creatina hoy: deja de insistir
      if (body.endpoint) {
        const k = await subKey(body.endpoint)
        const raw = await env.SUBS.get(k)
        if (raw) {
          const sub = JSON.parse(raw)
          sub.takenDay = body.day || ''
          await env.SUBS.put(k, JSON.stringify(sub))
        }
      }
      return new Response(JSON.stringify({ ok: true }), { headers })
    }

    if (url.pathname === '/test') {
      // prueba end-to-end inmediata: envía un push real y devuelve el status
      if (!body.endpoint) {
        return new Response(JSON.stringify({ error: 'falta endpoint' }), { status: 400, headers })
      }
      const raw = await env.SUBS.get(await subKey(body.endpoint))
      if (!raw) {
        return new Response(JSON.stringify({ error: 'suscripción no registrada' }), { status: 404, headers })
      }
      const result = await sendPushDetailed(JSON.parse(raw).subscription, env, {
        title: '✅ ¡El push funciona!',
        body: 'HIERRO ya puede avisarte con la app cerrada.',
        kind: 'test'
      })
      return new Response(JSON.stringify(result), { headers })
    }

    if (url.pathname === '/timer' || url.pathname === '/timer-cancel') {
      const stub = env.TIMERS.get(env.TIMERS.idFromName('global'))
      return stub.fetch(new Request(`https://do${url.pathname}`, {
        method: 'POST',
        body: JSON.stringify(body)
      })).then(async (r) => new Response(await r.text(), { headers, status: r.status }))
    }

    return new Response(JSON.stringify({ error: 'no existe' }), { status: 404, headers })
  },

  /** Cron: recordatorio de creatina a la hora local de cada suscriptor. */
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(
      (async () => {
        const list = await env.SUBS.list({ prefix: 'sub:' })
        for (const { name } of list.keys) {
          const raw = await env.SUBS.get(name)
          if (!raw) continue
          const sub = JSON.parse(raw)
          const fmt = new Intl.DateTimeFormat('en-CA', {
            timeZone: sub.tz,
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
          const parts = Object.fromEntries(
            fmt.formatToParts(new Date()).map((p) => [p.type, p.value])
          )
          const today = `${parts.year}-${parts.month}-${parts.day}`
          const nowMin = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10)
          const [h, m] = sub.hour.split(':').map(Number)
          const target = h * 60 + m

          // ya tomada hoy → no insistir
          if (sub.takenDay === today) continue
          // aún no es la hora de empezar
          if (nowMin < target) continue
          // insiste cada hora desde la hora elegida (clave = today + hora actual)
          const nagKey = `${today}#${parts.hour}`
          const onTheHour = nowMin < target + 5 || parseInt(parts.minute, 10) < 5
          if (onTheHour && sub.lastNag !== nagKey) {
            const status = await sendPush(sub.subscription, env, MSG_CREATINE)
            if (status === 404 || status === 410) {
              await env.SUBS.delete(name)
            } else {
              sub.lastNag = nagKey
              await env.SUBS.put(name, JSON.stringify(sub))
            }
          }
        }
      })()
    )
  }
}

// ---------------------------------------------------------------------------
// Alarmas exactas para el temporizador de descanso (Durable Object)
// ---------------------------------------------------------------------------

export class TimerAlarms {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  async fetch(request) {
    const url = new URL(request.url)
    const body = await request.json()

    if (url.pathname === '/timer') {
      const { subscription, fireAt } = body
      if (!subscription?.endpoint || typeof fireAt !== 'number') {
        return new Response('{"error":"datos inválidos"}', { status: 400 })
      }
      await this.state.storage.put(`t:${crypto.randomUUID()}`, { subscription, fireAt })
      const current = await this.state.storage.getAlarm()
      if (current === null || fireAt < current) {
        await this.state.storage.setAlarm(Math.max(fireAt, Date.now() + 1000))
      }
      return new Response('{"ok":true}')
    }

    if (url.pathname === '/timer-cancel') {
      const timers = await this.state.storage.list({ prefix: 't:' })
      for (const [k, v] of timers) {
        if (v.subscription?.endpoint === body.endpoint) await this.state.storage.delete(k)
      }
      return new Response('{"ok":true}')
    }

    return new Response('{"error":"no existe"}', { status: 404 })
  }

  async alarm() {
    const now = Date.now()
    const timers = await this.state.storage.list({ prefix: 't:' })
    let next = null
    for (const [k, v] of timers) {
      if (v.fireAt <= now + 1500) {
        await sendPush(v.subscription, this.env, MSG_TIMER)
        await this.state.storage.delete(k)
      } else {
        next = next === null ? v.fireAt : Math.min(next, v.fireAt)
      }
    }
    if (next !== null) await this.state.storage.setAlarm(next)
  }
}
