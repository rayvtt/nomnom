# NomNom Log (daily nutrition journal app)

**Status:** 🟡 Partial. It works end-to-end as an installable iPhone web app. AI parsing works once `ANTHROPIC_API_KEY` is set. Data stays on the device (no account sync yet).

**URL:** `/log/` (e.g. https://nomnom-728.pages.dev/log/)

## Purpose
A companion app to the landing page that makes logging seamless. Open it on your iPhone, tap one button, and say *"Okay, I just had bún bò Huế for lunch"*. NomNom estimates macros, minerals and vitamins and adds them to your day. You can also snap a supplement bottle or a pill box and it reads the label. It tracks daily, weekly and monthly totals against RDA targets. It also reminds you to take your meds and supplements, and you can log a dose with one tap.

## Files
| File | What |
|---|---|
| `log/index.html` | The app: single-file HTML/CSS/JS (ES module), mobile-first, bilingual |
| `log/vn-foods.js` | Shared data: `NUTRIENTS`, `DAILY_VALUES`, ~40 Vietnamese dishes/drinks, 11 supplement presets, `MED_WORDS`. Imported by the app **and** the API function |
| `functions/api/parse.js` | Cloudflare Pages Function `POST /api/parse`: text and/or photo go to Claude with a strict JSON schema and come back as structured log items. `GET /api/parse` reports whether AI is configured |
| `log/manifest.webmanifest`, `log/sw.js`, `log/icon*.{svg,png}`, `log/apple-touch-icon.png` | PWA install + offline shell |

## How it works
1. **Capture** (bottom dock, always visible):
   - 🎙 **Voice**: Web Speech API (`webkitSpeechRecognition`, `vi-VN` / `en-US`) with a live transcript. If the browser doesn't support it (or it's denied), the app falls back to the text composer, where the iPhone keyboard's own 🎙 dictation works everywhere.
   - ⌨️ **Type**: free text, with several items in one sentence.
   - 📷 **Photo**: iOS gives the choice of camera or library. The app resizes the photo to ≤1568 px JPEG on the client before upload and keeps a 120 px thumbnail for the log and cabinet.
2. **Parse**:
   - **AI** (`/api/parse`): Claude (`claude-opus-5-5`, effort `low` for speed) returns `{reply, items[]}` constrained by `output_config.format` JSON schema. The system prompt includes the NomNom reference table so Vietnamese dishes are grounded in our own data (the moat). It is prompt-cached. Server-side refusal fallback is enabled (`fallbacks: "default"`).
   - **Offline fallback** (`localParse`): strips diacritics and matches aliases against `vn-foods.js`. It understands quantities (`2`, `two`, `hai`, `x2`, `half`/`nửa`), size words (`large`/`đặc biệt` ×1.3, `small`/`nhỏ` ×0.7) and medication words. The app uses it when AI isn't configured, the network is down, or the API errors.
3. **Review sheet**: per item you see servings (±0.5 stepper), macros, the top micronutrient %DV chips, confidence, the AI's assumptions, and a delete button. Supplements and meds get a "Save to cabinet, remind at HH:MM" option (pre-checked for photo scans or when a time was mentioned). **Log it** commits the items, with Undo. Settings has an *auto-log without review* toggle.
4. **Views** (tab bar):
   - **Today**: a kcal ring, protein/carbs/fat/water bars, today's doses checklist (Take → logs the dose), the timeline (tap an entry to adjust servings or delete), and Minerals / Vitamins / Macros %DV bars with a "running low on…, try adding…" insight. The date arrows turn this into the **daily** view for any past day. Logging while viewing a past day backfills to that day.
   - **History**: **Week / Month** segments, a per-day bar chart for any nutrient (kcal, protein, fiber, sugar, sodium, calcium, iron, magnesium, vitamin D, vitamin C, water) with the RDA/limit line, days logged, average kcal, med adherence %, and average-per-logged-day %DV with insights. Tapping a bar opens that day.
   - **Cabinet**: saved supplements and meds with photo thumbnail, reminder times, Log now and Edit. You can add one by 📷 scan or by hand (with presets). There is also **Add reminders to iPhone Calendar** (`.ics` with daily `RRULE` + alarm, sent through the share sheet or downloaded), plus in-app notifications while the app is open.
   - **Settings**: sex (picks RDA set), kcal target, auto-log, light mode, AI access code, install-to-home-screen instructions, export JSON/CSV, import JSON, erase.
5. **Deep links**: `/log/#record` opens the recorder and `/log/#type` opens the composer. You can use these from an iOS Shortcut, a Back Tap action or a Home Screen bookmark for one-tap logging.

## Data model (`localStorage["nomnom.<scope>.dailylog"]`)
`scope` = `nomnom.auth.user.id` if signed in on the landing page, else `guest` (same scheme as [persistence.md](./persistence.md)).
```js
{
  version: 1,
  entries: [{ id, ts, kind: 'food'|'drink'|'supplement'|'medication', name, name_vi, brand, serving,
              servings, confidence, assumptions, source, nutrients /* per ONE serving */, thumb?, cabinetId? }],
  cabinet: [{ id, kind, name, name_vi, brand, serving, nutrients, times: ['08:00'], thumb?, createdAt }],
  doses:   { 'YYYY-MM-DD|cabinetId|HH:MM': entryId },
  settings:{ sex, kcal, autoLog, accessCode, notify }
}
```
Nutrient keys (19): `kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, potassium_mg, calcium_mg, iron_mg, magnesium_mg, zinc_mg, vit_a_mcg, vit_c_mg, vit_d_mcg, vit_e_mg, vit_b12_mcg, folate_mcg, water_ml`. Sugar and sodium are treated as **limits** (red when over 100%).

## Deploy / configure AI
Cloudflare Pages auto-detects `functions/`, so no build step is needed. In **Pages → Settings → Environment variables** (Production):
- `ANTHROPIC_API_KEY`: required (encrypt it as a secret).
- `NOMNOM_ACCESS_CODE`: optional. If set, users must enter it in Settings. Use it to keep strangers from spending your API budget while the URL is public.
- `NOMNOM_MODEL` / `NOMNOM_EFFORT`: optional overrides (default `claude-opus-5-5` / `low`).

Without the key, the header pill shows **Offline** and the local parser handles text. Photo parsing needs AI.

## Known limits / TODO
- [ ] **Background push reminders**: iOS only delivers notifications to closed web apps through Web Push (iOS 16.4+, installed to the Home Screen). That needs VAPID keys, a push subscription store and a scheduled sender (e.g. a Cloudflare Worker cron). For now, use the `.ics` calendar export, which works when the app is closed.
- [ ] Speech recognition inside a Home-Screen (standalone) web app is unreliable on some iOS versions. The keyboard-dictation fallback covers it. A native wrapper (Capacitor or React Native) would get `SFSpeechRecognizer` plus Siri/App Intents ("Hey Siri, log bún bò in NomNom").
- [ ] Sync: no backend yet. Move `dailylog` to Supabase with the rest of auth ([auth.md](./auth.md)).
- [ ] Rate limiting on `/api/parse` beyond the access code (Cloudflare WAF rate-limit rule).
- [ ] Apple Health export (dietary energy, macros, water, caffeine) needs a native app; HealthKit isn't reachable from the web.
- [ ] Expand `vn-foods.js` from ~40 to the full 58 `recipeDB` dishes and then to 500+, with lab-verified micronutrients.
- [ ] Edit an entry's nutrients by hand. Retake a photo for a cabinet item.
- [ ] Omega-3 (EPA/DHA), caffeine and cholesterol aren't tracked yet. The AI mentions them in `assumptions`.

## Dependencies
- [persistence.md](./persistence.md): storage scope convention.
- [voice-log.md](./voice-log.md): the landing-page demo of the same idea; this app is the working version.
- [recipe-hub.md](./recipe-hub.md) / [cuisine-db.md](./cuisine-db.md): the dish data that `vn-foods.js` should converge with.
