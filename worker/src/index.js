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

async function vapidHeaders(endpoint, env) {
  const aud = new URL(endpoint).origin
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600
  const enc = new TextEncoder()
  const header = b64url(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = b64url(
    enc.encode(JSON.stringify({ aud, exp, sub: env.VAPID_SUBJECT }))
  )
  const key = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(env.VAPID_PRIVATE_JWK),
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
    Authorization: `vapid t=${header}.${payload}.${b64url(sig)}, k=${env.VAPID_PUBLIC}`,
    TTL: '86400',
    Urgency: 'high'
  }
}

/** Envía un push sin payload. Devuelve el status (404/410 = suscripción muerta). */
async function sendPush(subscription, env) {
  try {
    const headers = await vapidHeaders(subscription.endpoint, env)
    const res = await fetch(subscription.endpoint, { method: 'POST', headers })
    return res.status
  } catch {
    return 0
  }
}

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
      await env.SUBS.put(
        await subKey(subscription.endpoint),
        JSON.stringify({ subscription, hour, tz: tz || 'Europe/Madrid', lastSent: '' })
      )
      return new Response(JSON.stringify({ ok: true }), { headers })
    }

    if (url.pathname === '/unsubscribe') {
      if (body.endpoint) await env.SUBS.delete(await subKey(body.endpoint))
      return new Response(JSON.stringify({ ok: true }), { headers })
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
          // ventana = intervalo del cron (5 min), y solo una vez al día
          if (nowMin >= target && nowMin < target + 5 && sub.lastSent !== today) {
            const status = await sendPush(sub.subscription, env)
            if (status === 404 || status === 410) {
              await env.SUBS.delete(name)
            } else {
              sub.lastSent = today
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
        await sendPush(v.subscription, this.env)
        await this.state.storage.delete(k)
      } else {
        next = next === null ? v.fireAt : Math.min(next, v.fireAt)
      }
    }
    if (next !== null) await this.state.storage.setAlarm(next)
  }
}
