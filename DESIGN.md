---
name: HIERRO
description: Registro de fuerza que se usa como una app nativa de Apple, en el lenguaje de interfaz iOS 26.
colors:
  tint: "#c93400"
  tint-dark: "#ff7a1a"
  tint-press: "#a82b00"
  tint-press-dark: "#e56a0e"
  tint-text: "#c93400"
  tint-text-dark: "#ff8a33"
  tint-soft: "rgba(201, 52, 0, 0.11)"
  tint-soft-dark: "rgba(255, 122, 26, 0.18)"
  on-tint: "#ffffff"
  on-tint-dark: "#000000"
  green: "#1f9d46"
  green-dark: "#30d158"
  green-text: "#1a7f3a"
  green-soft: "rgba(52, 199, 89, 0.16)"
  switch-on: "#34c759"
  red: "#d70015"
  red-dark: "#ff453a"
  red-icon: "#ff3b30"
  gray-icon: "#8e8e93"
  indigo-icon: "#5856d6"
  bg: "#f2f2f7"
  bg-dark: "#000000"
  cell: "#ffffff"
  cell-dark: "#1c1c1e"
  sheet-cell-dark: "#2c2c2e"
  label: "#000000"
  label-dark: "#ffffff"
  label-2: "#6e6e73"
  label-2-dark: "#98989f"
  label-3: "#8e8e93"
  label-3-dark: "#6c6c70"
  placeholder: "#767679"
  separator: "rgba(60, 60, 67, 0.2)"
  separator-dark: "rgba(84, 84, 88, 0.62)"
  fill: "rgba(120, 120, 128, 0.2)"
  fill-2: "rgba(120, 120, 128, 0.16)"
  fill-3: "rgba(118, 118, 128, 0.12)"
  fill-3-dark: "rgba(118, 118, 128, 0.24)"
  fill-4: "rgba(116, 116, 128, 0.08)"
  press: "rgba(0, 0, 0, 0.06)"
  glass: "rgba(250, 250, 252, 0.74)"
  glass-dark: "rgba(38, 38, 42, 0.66)"
  glass-strong: "rgba(250, 250, 252, 0.9)"
  scrim: "rgba(0, 0, 0, 0.28)"
  heat-base: "rgb(242, 235, 235)"
  heat-mid: "rgb(238, 158, 158)"
  heat-hot: "rgb(165, 14, 22)"
typography:
  large-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "41px"
    letterSpacing: "-0.008em"
  title-1:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "34px"
    letterSpacing: "-0.006em"
  title-2:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
  title-3:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "25px"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "22px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "22px"
  subhead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "20px"
  footnote:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "15px"
  tab-label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.01em"
  numeral-display:
    fontFamily: "ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "40px"
    fontFeature: "'tnum'"
  numeral-field:
    fontFamily: "ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    fontFeature: "'tnum'"
  timer-digits:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(60px, 19vw, 80px)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum'"
rounded:
  capsule: "999px"
  r-sheet: "32px"
  r-group: "22px"
  floating: "18px"
  r-control: "12px"
  segmented: "10px"
  icon-tile: "8px"
spacing:
  hair: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  gutter: "16px"
  section: "24px"
  nav-h: "52px"
  tabbar-h: "62px"
components:
  button-filled:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.on-tint}"
    typography: "{typography.headline}"
    rounded: "{rounded.capsule}"
    padding: "0 18px"
    height: "44px"
  button-filled-active:
    backgroundColor: "{colors.tint-press}"
  button-filled-lg:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.on-tint}"
    rounded: "{rounded.capsule}"
    padding: "0 24px"
    height: "52px"
  button-tinted:
    backgroundColor: "{colors.tint-soft}"
    textColor: "{colors.tint-text}"
    rounded: "{rounded.capsule}"
    height: "44px"
  button-gray:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.label}"
    rounded: "{rounded.capsule}"
    height: "44px"
  button-plain:
    textColor: "{colors.tint-text}"
    typography: "{typography.body}"
    padding: "0 6px"
    height: "44px"
  glass-button:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.label}"
    rounded: "{rounded.capsule}"
    height: "44px"
    width: "44px"
  circle-button:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.label}"
    rounded: "{rounded.capsule}"
    size: "36px"
  chip:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.label}"
    rounded: "{rounded.capsule}"
    padding: "0 14px"
    height: "34px"
  chip-active:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.on-tint}"
  tag-chip:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.label}"
    rounded: "{rounded.capsule}"
    padding: "0 10px"
    height: "30px"
  tag-chip-empty:
    backgroundColor: "{colors.tint-soft}"
    textColor: "{colors.tint-text}"
  group:
    backgroundColor: "{colors.cell}"
    rounded: "{rounded.r-group}"
  row:
    textColor: "{colors.label}"
    typography: "{typography.body}"
    padding: "11px 16px"
    height: "52px"
  field:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.label}"
    rounded: "{rounded.r-control}"
    padding: "10px 14px"
    height: "44px"
  search:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.label-2}"
    rounded: "{rounded.r-control}"
    padding: "0 10px"
    height: "40px"
  stepper:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.label}"
    typography: "{typography.numeral-field}"
    rounded: "{rounded.r-control}"
    height: "40px"
  stepper-done:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.label-2}"
  set-check-done:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-tint}"
    rounded: "{rounded.capsule}"
    size: "40px"
  segmented:
    backgroundColor: "{colors.fill-3}"
    rounded: "{rounded.segmented}"
    padding: "2px"
    height: "36px"
  switch-on:
    backgroundColor: "{colors.switch-on}"
    rounded: "{rounded.capsule}"
    width: "51px"
    height: "31px"
  tabbar:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.label}"
    typography: "{typography.tab-label}"
    rounded: "{rounded.capsule}"
    padding: "4px"
    height: "62px"
  tabbar-active:
    textColor: "{colors.tint-text}"
  sheet:
    backgroundColor: "{colors.bg}"
    rounded: "{rounded.r-sheet}"
    padding: "8px 16px 28px"
  menu:
    backgroundColor: "{colors.glass-strong}"
    rounded: "{rounded.floating}"
    padding: "6px 0"
---

# Design System: HIERRO

## Overview

**Creative North Star: "The Native Logbook"**

HIERRO behaves like an app Apple shipped: the iOS 26 interface language (large titles, inset grouped lists, floating glass chrome, sheets that follow the finger) applied to strength logging. The content field is achromatic and opaque, system grouped backgrounds carrying elevated cells, while a single "iron glowing red" tint marks only what is actionable or current. Colour is confined to meaning: the tint acts, green confirms a done set, red destroys, and the red heat scale lives only on the muscle map.

Density follows Dynamic Type rather than a dashboard: one column capped at 640px on phone, 17px body, 52px rows, 24px between sections, generous hit targets of 40 to 44px for anything tapped between sets with sweaty hands. Every live figure (kg, reps, sets, time) is set in tabular numerals, and the big numerals of a finished session or record use the rounded system face so a PR lands at scale. Appearance follows the system automatically in light and dark, and the build honours increased contrast, reduced transparency and reduced motion as first-class variants rather than afterthoughts.

The system rejects the dark gym dashboard with a neon accent and the grid of identical cards, as confirmed by the direction contract.

**Key Characteristics:**
- System grouped surfaces: #F2F2F7 / #000000 background, #FFFFFF / #1C1C1E cells, hairline separators inset past icons.
- One tint, two appearances: #C93400 in light, #FF7A1A in dark, with a brighter #FF8A33 for tint-coloured text in dark.
- Glass only on chrome (tab bar capsule, navigation buttons, rest accessory, menus); content stays opaque.
- System font stack: SF Pro on Apple, self-hosted Inter only as the non-Apple fallback; SF Pro Rounded for large numerals.
- Capsule controls everywhere a finger lands; 22px continuous-feeling corners on groups; 32px on sheets.
- iOS motion curve cubic-bezier(0.32, 0.72, 0, 1), 200 to 520ms, press states that scale down rather than recolour.

## Colors

An achromatic system field with one warm iron tint and two semantic system colours; everything else is grey, translucent fill, or hairline. Frontmatter keys match the `index.css` custom properties; a `-dark` suffix records the value the same property takes under `prefers-color-scheme: dark`.

### Primary
- **Iron Red-Hot** (`tint`, dark `tint-dark`): the only accent. Filled capsule buttons (Empezar, Terminar), the active chip, the next pending set badge, trained days on the calendar, the session progress bar, chart lines and the rest ring while counting. Pressed state darkens to `tint-press`. Text on it is `on-tint`, white in light and black in dark.
- **Iron Text** (`tint-text`, dark `tint-text-dark`): tint used as type or glyph: plain buttons (Nueva, Añadir serie), active tab label, checkmarks, PR values, row actions. Lifted in dark so thin strokes and 17px text keep contrast on #1C1C1E.
- **Iron Wash** (`tint-soft`): translucent tint behind tinted buttons, an unassigned variant/brand tag chip, tagged set badges, text selection and the focused stepper input.

### Secondary
- **Set Done Green** (`green`, dark `green-dark`; text `green-text`; wash `green-soft`): a completed set and nothing else. Filled check circle, green-washed steppers on done rows, the exercise done tick, the finished rest timer, the finish hero icon. The switch uses the system `switch-on` green because that is the platform control.

### Tertiary
- **Destructive Red** (`red`, dark `red-dark`): destructive labels and actions only (delete rows, menu items marked destructive, remove handles). `red-icon` fills a destructive settings icon tile.
- **Heat Scale** (`heat-base` to `heat-mid` to `heat-hot`): the muscle map fill and its legend bar, interpolated with a 0.65 power curve so a few sets already register. Nowhere else.
- **Settings Icon Tiles** (`gray-icon`, `indigo-icon`): the square icon tiles in grouped settings rows, following iOS Settings. They label a row; they never mark state.

### Neutral
- **Grouped Background** (`bg`, dark `bg-dark`): the page and the status bar theme-color (`#f2f2f7` / `#000000` in `index.html`).
- **Cell** (`cell`, dark `cell-dark`): every grouped list, card-like block (A continuación, exercise card, chart, calendar, body map). Inside sheets, cells rise one step to `sheet-cell-dark` (#2C2C2E) in dark while the sheet itself takes the cell colour.
- **Labels** (`label`, `label-2`, `label-3`, `placeholder`): primary text, secondary text and subtitles, tertiary glyphs (chevrons, grips, empty checks), input placeholders.
- **Separator** (`separator`): hairline dividers, 1px or 0.5px on 2x screens (`--hair`).
- **Fills** (`fill` to `fill-4`): translucent system fills. `fill-3` is the resting background of every gray control (chips, steppers, fields, search, circle buttons, the tab indicator); `fill` is track and grabber; `fill-4` is hover.
- **Glass** (`glass`, `glass-strong`): translucent chrome material; `scrim` dims under sheets.

### Named Rules
**The Color-Is-Meaning Rule.** Tint means actionable or current, green means a set is done, red means destructive. Trend values stay neutral: an improvement is `label` at 600 weight, a decline is `label-2` at 600, never green or red.

**The One Tint Rule.** There is exactly one accent hue. A new screen that needs emphasis uses the tint, weight, or scale, never a second brand colour.

**The Heat Stays Home Rule.** The red heat ramp exists only on the muscle map and its legend and per-muscle bars. It never signals error, trend or intensity anywhere else.

## Typography

**Display Font:** SF Pro via `-apple-system, BlinkMacSystemFont` (Inter self-hosted as the non-Apple fallback, then system-ui, Segoe UI, Roboto)
**Body Font:** same stack
**Numeral Font:** SF Pro Rounded via `ui-rounded, 'SF Pro Rounded'` (then the same fallbacks), for large and editable figures

**Character:** The platform's own voice: neutral, legible, sized by the Dynamic Type ladder rather than a brand ramp. The rounded numerals give weights and reps a friendly, instrument-like solidity.

### Hierarchy
- **Large Title** (700, 34px/41px, -0.008em): the page title under the transparent nav bar ("Hola, Jorge", "Músculos"); drops to 30px/36px under 360px wide. Subtitle below it is Subhead in `label-2`.
- **Title 1** (700, 28px/34px): the day name in A continuación and the finish title.
- **Title 2** (700, 22px/28px): profile name.
- **Title 3** (700, 20px/25px): section titles and empty-state titles; exercise titles in a session use 20px at 600.
- **Headline** (600, 17px/22px): nav bar and sheet titles, filled buttons, calendar month, week label.
- **Body** (400, 17px/22px): row titles, fields, menu items, plain buttons.
- **Subhead** (400, 15px/20px): row subtitles, metadata, chips (500), "última vez" lines.
- **Footnote** (400, 13px/18px): section footers, menu titles, PR "before" lines, notes.
- **Caption** (400 to 600, 12px/15px): set table column heads, stepper labels, accessory label, heat legend. Chart ticks at 11px; tab labels at 10px/600.
- **Numerals** (Rounded 700, 34px/40px): chart readout and finish stats; PR values 30px/36px in `tint-text`; stepper inputs Rounded 600 at 17px. Rest timer digits use the default face at 300, clamp(60px, 19vw, 80px), -0.02em.

### Named Rules
**The Tabular Figures Rule.** Every live figure (kg, reps, set counts, times, dates in grids, chart ticks) sets `font-variant-numeric: tabular-nums` so columns align and values do not jitter while counting.

**The Platform Face Rule.** Never load a display face. SF Pro on Apple devices; Inter only where SF Pro does not exist.

## Layout

A single centred column: `.content` is max 640px with 16px side gutters, top padding of safe area plus `--nav-h` (52px), bottom padding clearing the floating tab bar (`--tabbar-h` 62px plus 40px, or plus 104px when the rest accessory is present). Views stack with a 24px gap; inside a section the head, group and footer sit 8px apart. Rows are 52px minimum with 16px horizontal padding; separators inset 16px, or 58px when the row carries a 30px icon tile. Section heads and large titles are indented 4px so they optically align with cell content.

**Breakpoints.**
- **≤360px:** calendar days shrink to 36px, stepper buttons to 28px, large title to 30px.
- **≥768px (iPad and desktop):** the tab bar moves to the top as a 44px horizontal glass capsule with icon and 15px label side by side and a filled `fill-3` active state; nav buttons drop to the title row; content widens to 1104px with 32px gutters, views to 680px (or 1040px for wide views); sheets become centred 600px cards with full 32px corners that pop in rather than slide; the set table gains an "Anterior" column (190px number columns).
- **≥1024px:** `.split` views become a two-column grid with a sticky left column.

Pointer hover states (`fill-4` on rows, `fill-2` on chips) apply only under `(hover: hover)`.

## Elevation & Depth

Depth is tonal first: grouped background, a lighter cell on top, and in sheets one more step. Shadows are reserved for things that float above content (glass chrome, menus, sheets, a dragged row) and for the one "current" exercise card, which lifts so the next pending work rises and completed work recedes. Glass chrome combines a backdrop blur (20 to 40px, saturate 180 to 190%) with a 0.5px inner top highlight and a 0.5px outline; under reduced transparency the glass becomes the opaque cell colour and the blur is removed.

### Shadow Vocabulary
- **Glass Float** (`--glass-shadow`: `0 10px 30px -10px rgba(0,0,0,0.2), 0 2px 6px -2px rgba(0,0,0,0.08)`; dark at 0.7 / 0.5): tab bar, glass buttons, rest accessory, avatar. Always paired with `inset 0 0.5px 0 var(--glass-edge), 0 0 0 0.5px var(--glass-line)`.
- **Lift** (`--lift`: `0 16px 36px -18px rgba(0,0,0,0.28)`; dark 0.9): the current exercise card, together with an inset 1.5px ring of tint at 60%.
- **Menu** (`0 0 0 0.5px var(--glass-line), 0 22px 50px -12px rgba(0,0,0,0.35)`): context menus.
- **Sheet** (`0 -10px 40px rgba(0,0,0,0.16)` on phone; `0 30px 80px -20px rgba(0,0,0,0.4)` as a centred card at ≥768px).
- **Drag** (`0 18px 44px -12px rgba(0,0,0,0.4)`): a list row being reordered.
- **Control Thumb** (`0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)`): switch and segmented thumbs, as on the platform.

### Named Rules
**The Glass Is Chrome Rule.** Translucent material belongs only to navigation and transient overlays: tab bar, glass nav buttons, rest accessory, menus, the scrolled nav bar fade. Cells, cards, charts and the body map are always opaque.

**The Current Lifts Rule.** Only the exercise in progress gets `--lift` and the tint ring; resting content sits flat on tone.

## Shapes

A capsule-and-continuous-corner language. Anything tapped as a discrete control is a full capsule or circle (999px / 50%): buttons, chips, tag chips, popups, the tab bar and its indicator, set badges, check circles, calendar days. Containers use `--r-group` (22px): grouped lists, the up-next block, exercise cards, chart, calendar, body map. Sheets use `--r-sheet` (32px) on the top corners on phone and all corners on wide screens. Floating overlays and media use 18px (menus, the video frame, the empty-state icon tile). Inline input surfaces use `--r-control` (12px): fields, search, steppers. The segmented control is 10px outside and 8px on its thumb; settings icon tiles are 30px squares at 8px. No borders on containers: separation comes from tone and hairlines, and the only strokes are the 2px focus ring, the empty check circle's inset ring, and the current card's tint ring.

## Components

### Buttons
Tactile and native: everything scales down on press instead of changing colour.
- **Shape:** capsule (999px), 44px tall; large 52px, small 34px at 15px.
- **Filled:** `tint` background, `on-tint` text, 17px/600, 0 18px padding. The single primary action on a screen (Empezar, Terminar). Pressed: `tint-press` and scale 0.97.
- **Tinted:** `tint-soft` background with `tint-text`; secondary emphasis.
- **Gray:** `fill-3` with `label`; neutral secondary.
- **Plain:** no background, `tint-text`, 17px/400 (600 when `is-strong`); section-head actions and "Añadir serie". Destructive variant switches text to `red`.
- **Glass button:** 44px circle or text capsule on `glass` with blur and Glass Float; nav bar actions. Tint variant fills with `tint`. Pressed scale 0.93; disabled 0.4 opacity.
- **Circle button:** 36px `fill-3` circle for secondary icon actions (week switcher, exercise menu); pressed 0.9.
- **Round button:** 86px timer controls in gray, green-soft, tint-soft or filled tint, with a 2px background-coloured inner ring.
- **Focus:** global 2px `tint` outline, 2px offset, only on `:focus-visible`.

### Chips
- **Filter chip:** 34px capsule, `fill-3`, 15px/500. Selected: `tint` with `on-tint` at 600. Soft variant: `tint-soft` with `tint-text`. Horizontal chip rows scroll edge to edge past the 16px gutter.
- **Tag chip:** 30px capsule, 14px/500, with a trailing chevron in `label-2`; the in-place variant and brand selector on each exercise. Empty (unassigned) uses `tint-soft` and `tint-text` to invite a choice.
- **Popup select:** 34px capsule with a native `<select>` overlaid invisibly; large variant is a 52px cell-coloured bar at `r-group`.

### Cards / Containers
- **Corner Style:** `r-group` (22px).
- **Background:** `cell`; never glass.
- **Shadow Strategy:** flat; only the current exercise card lifts (see Elevation).
- **Border:** none; groups divide children with inset hairlines.
- **Internal Padding:** 14 to 18px for blocks (up-next 18px, exercise card 14px 14px 8px, chart 14px 10px 8px 16px); rows 11px 16px.

### Inputs / Fields
- **Field:** 44px, `fill-3`, `r-control`, 10px 14px, 17px; focus is a 2px `tint` outline at 0 offset. Placeholder `placeholder`. Caret is `tint`.
- **Field row:** borderless input inside a grouped cell, 52px; focus shows an inset 2px `tint-soft` ring.
- **Search:** 40px `fill-3` at `r-control` with a leading glyph in `label-2` and an 18px `label-3` clear circle.
- **Stepper (NumberField):** 40px `fill-3` bar at `r-control`, 32px minus/plus buttons, centred Rounded 17px/600 tabular value. Focus washes the input `tint-soft` with `tint-text`. On a done set the whole bar turns `green-soft` and the value retreats to `label-2`.
- **Switch:** 51 by 31px, off `fill`, on `switch-on`, white 27px thumb travelling 20px on the iOS curve.
- **Segmented:** `fill-3` track at 10px with 2px inset, 32px segments at 14px/500 (600 active), a sliding `cell` thumb (#636366 in dark) with the control-thumb shadow.

### Navigation
- **Tab bar (phone):** a floating glass capsule, max 440px, 62px tall, 8px above the safe area, five equal tabs with 24px Lucide icons over 10px/600 labels. The active tab is `tint-text` with a sliding `fill-3` capsule indicator (0.5s iOS curve); a bottom gradient of `bg` at 88% keeps content legible behind it.
- **Tab bar (≥768px):** moves to the top centre as a 44px capsule of icon-plus-label tabs; active tab gets a `fill-3` background.
- **Nav bar:** transparent at rest; once scrolled a blurred `bg` gradient fades in and the compact 17px/600 title slides up while the large title scrolls away. Avatar button (36px grey gradient circle, top right) opens Settings.
- **Rest accessory:** a 54px glass capsule docked 16px above the tab bar while resting: a 38px progress ring (`tint` counting, `green` done), Rounded tabular time, pause and close circle buttons. Enters with a 24px rise and 0.96 scale.

### Sheets
The signature interaction. Bottom sheets at 32px top corners over a `scrim`, with a 36 by 5px `fill` grabber and a three-column bar (leading action, 17px/600 centred title, trailing action). The header is a drag handle: the sheet follows the finger, projects the release velocity, and dismisses past 45% of its height or above 1100px/s, otherwise it springs back; close duration is derived from velocity, clamped 200 to 360ms. Inside, `--bg` and `--cell` are remapped to the sheet surfaces, the body stacks sections at 24px, and a sticky bottom CTA sits on a gradient of the sheet background. At ≥768px sheets become centred cards that pop in (40px rise, 0.97 scale).

### Menu
Context menus on `glass-strong` with a 40px blur at 18px corners, scaling in from 0.55 from their anchor. Items are 44px, 17px, with a leading 22px check column and optional trailing icon; groups separate with an 8px `fill-4` band; destructive items use `red`.

### Set Table
The session core. A four-column grid (30px badge, two stepper columns, 40px check) with 12px/600 `label-2` heads. The set badge is a 30px `fill-3` circle; the next pending set fills with `tint`. The check is a 40px `fill-3` circle with a `label-3` tick that fills `green` with a scale pop when done.

### Line Chart
A cell-coloured block with a Rounded 34px readout, unit and date above an SVG line in `tint` (2.5px, round caps) that draws in over 0.9s. Hairline grid in `separator`, 11px tabular ticks, a dashed `label-3` scrub rule and hollow dots that fill when selected. Touch scrub reads each session.

### Muscle Map
Front and back figures on a `bodymap-bg` cell: muscles filled on the heat ramp with `body-seam` strokes (grey seams in light so a white figure reads on a white cell), non-muscle parts in `body-neutral`, the selected region stroked 5px in `label`. Legend bar and per-muscle 6px bars use the same ramp.

## Do's and Don'ts

### Do:
- **Do** use `tint` for the one primary action per screen and for what is current (next set, active tab, trained day), and nothing decorative.
- **Do** mark a completed set with `green` / `green-soft` and only a completed set.
- **Do** set every live number in tabular figures, and large results in the rounded face (34px/700).
- **Do** build new screens from grouped `cell` blocks at 22px corners on the `bg` field, rows of 52px, gaps of 24px between sections.
- **Do** make every tappable control a capsule or circle of at least 40px, pressed by scaling (0.88 to 0.97) on `cubic-bezier(0.32, 0.72, 0, 1)`.
- **Do** define colours as the existing custom properties so light, dark, increased contrast and reduced transparency all resolve automatically.
- **Do** use Lucide icons at a uniform stroke; 24px in tabs, 18px in icon tiles.

### Don't:
- **Don't** colour trends: improvements and declines stay `label` and `label-2`, never green or red.
- **Don't** use red for anything but destructive actions, or the heat ramp outside the muscle map.
- **Don't** put glass or backdrop blur on content (cells, cards, charts); it belongs to chrome and transient overlays.
- **Don't** introduce a second accent hue, a neon-on-black gym dashboard look, or a grid of identical cards.
- **Don't** load a display typeface or letter-spaced uppercase labels; type is the system stack at Dynamic Type sizes.
- **Don't** hard-code hex values in components when a token exists; the dark, contrast and transparency variants depend on the variables.
- **Don't** add loading choreography; motion stays 200 to 520ms and collapses to fades under reduced motion.
