# NomNom Log (daily nutrition journal app)

**Status:** 🟡 Partial. It works end-to-end as an installable iPhone web app. AI parsing works once `ANTHROPIC_API_KEY` is set. Data stays on the device (no account sync yet).

**URL:** `/log/`. Test deployments of this branch: https://claude-serene-bardeen-zw6tun.nomnom-728.pages.dev/log/ (behind Cloudflare Access). Production (`nomnom-728.pages.dev`) currently serves the Expo app from `claude/setup-cloud-sync-6TBjC`, not this app. See `mobile/README.md` for the build shim.

## Purpose
A companion app to the landing page that makes logging seamless. Open it on your iPhone, tap **Speak**, and say *"Okay, I just had bún bò Huế for lunch"* or *"I walked for 30 minutes"*. NomNom estimates macros, minerals and vitamins (or calories burned) and adds them to your day. You can also photograph a supplement bottle or a pill box and it reads the label. It tracks daily, weekly and monthly totals against **personal targets** computed from your profile. It also reminds you to take medicines and supplements, and you can log a dose with one tap.

## Design (v2: Apple-style, built for all ages)
This app deliberately departs from the landing page's dark Instrument Serif look. The brief was "super easy for a 60-year-old to read, like iPhone text".
- **Font:** the Apple system font (`-apple-system`, SF Pro on iPhone). No web fonts.
- **Sizes in `rem`**, scaled by (a) the iPhone's own Settings → Display → Text Size (read via `font: -apple-system-body`) and (b) the in-app **Text size**: Standard ×1 / Large ×1.12 (default) / Extra large ×1.25. The bottom dock and tab bar use fixed px sizes, as iOS does, so large text never squeezes the content.
- **Colours:** iOS grouped-list palette. Light by default with automatic dark mode (Profile → Appearance: Automatic / Light / Dark). The accent is the NomNom orange darkened to `#C2410C` for 5:1 contrast on white. All colours are CSS variables.
- **Few icons, always with words:** the bottom buttons are labeled **Nói / Speak**, **Chụp ảnh / Photo**, **Gõ chữ / Type**. List rows use one small line icon per kind (food, drink, pill, exercise).
- **Simple vs Detailed view** (chosen at setup, changeable in Profile):
  - Simple: calories, protein, water, medicines, a plain-language tip, and vitamins and minerals one tap away.
  - Detailed: adds carbs, fat, fiber, sugar, sodium, the full vitamin and mineral list inline, and a per-nutrient chart picker in History.

## Files
| File | What |
|---|---|
| `log/index.html` | The app: single-file HTML/CSS/JS (ES module), bilingual VN/EN |
| `log/vn-foods.js` | Shared data: `NUTRIENTS`, `DAILY_VALUES`, ~40 Vietnamese dishes/drinks, 11 supplement presets, `MED_WORDS`. Imported by the app **and** the API function |
| `functions/api/parse.js` | Cloudflare Pages Function `POST /api/parse`: text and/or photo plus the user's sex/age/weight go to Claude with a strict JSON schema and come back as structured log items. `GET /api/parse` reports whether AI is configured |
| `log/manifest.webmanifest`, `log/sw.js`, `log/icon*.{svg,png}`, `log/apple-touch-icon.png` | PWA install + offline shell |
| `mobile/` | Temporary Cloudflare build shim (see its README) |

## How it works
1. **First launch → profile setup** (6 short screens, large text):
   1. Language.
   2. Name (prefilled from `nomnom.auth.user`), sex, age.
   3. Height and weight. These are prefilled from the landing page's `nomnom.<scope>.profile` if present.
   4. Activity level and goal (lose / keep / gain).
   5. Text size (with a live sample) and Simple/Detailed view.
   6. **Your daily targets**.

   Everything is editable later in **Profile**, which also offers "Redo profile setup".
2. **Daily targets** (`targetsFor(profile)`):
   - **Calories:** Mifflin-St Jeor BMR × activity factor (1.2 / 1.375 / 1.55 / 1.725) + goal (−400 / 0 / +300). The floor is 1,200 (women) or 1,500 (men). A manual override is available.
   - **Protein:** 1.0 g/kg, or 1.2 g/kg at age 60+. ×1.2 for the "gain" goal. Minimum 45 g.
   - **Fat and carbs:** fat is 30% of kcal; carbs are the remainder.
   - **Sugar and water:** sugar limit 10% of kcal (WHO); water 35 ml/kg.
   - **Age-specific RDAs:**
     - Women 51+: calcium 1,200 mg, iron 8 mg, fiber 21 g.
     - Men 51+: fiber 30 g.
     - Everyone 71+: calcium 1,200 mg, vitamin D 20 µg.
3. **Capture** (bottom dock):
   - **Speak**: Web Speech API (`vi-VN` / `en-US`) with a live transcript. If it's not supported, it falls back to the text box, where iPhone keyboard dictation works.
   - **Type**: free text, several items at once.
   - **Photo**: resized client-side to ≤1568 px JPEG, plus a 120 px thumbnail.
4. **Parse**:
   - **AI** (`/api/parse`): Claude (`claude-haiku-5-5`, the cheapest model, at effort `low`) returns `{reply, items[]}` under an `output_config.format` JSON schema.
     - Item kinds: `food | drink | supplement | medication | exercise`. Exercise items carry `minutes` and `kcal_burned`, computed from MET × the user's weight.
     - The system prompt includes the NomNom reference table and is prompt-cached.
     - Server-side refusal fallback is only sent for Opus/Sonnet models.
     - **Errors are shown honestly**: the app re-checks `/api/parse` right before each analysis, and if the AI fails, the message includes the real reason (HTTP status + Anthropic error detail, or "sign-in expired — reload"). Profile → AI analysis shows the live status with a **Check again** button.
   - **Offline fallback** (`localParse`): matches foods, supplements and medicine words from `vn-foods.js`, plus 14 exercises with durations ("đi bộ 30 phút", "walked 1.5 hours", "nửa tiếng", "8000 bước"). It's used for text when AI is unavailable. Photos need AI.
5. **Review sheet**: each item shows its type, serving or duration stepper, calories and protein (more in Detailed), "vitamins & minerals: X% of daily need", the AI's assumptions, and a confidence label. Supplements and medicines can be saved to **Medicines** with a reminder time. **Save to log** has Undo. Profile has an option to skip review.
6. **Tabs**:
   - **Today** (also any past day via ‹ ›):
     - The big **calories left** number and bar, and the equation **Target − Eaten + Exercise**.
     - Key nutrients with plain "good / over" tags and a one-line tip.
     - Today's medicines with **Mark taken**.
     - The day's log (tap a row to adjust or delete).
   - **History**:
     - Week or Month view, with a calories-per-day bar chart. Detailed view adds any nutrient.
     - Days logged, average calories, average exercise minutes, and the percentage of medicines taken on time.
     - Daily averages.
   - **Medicines**: saved supplements and medicines with thumbnails, reminder times, **Log now** and **Edit**. Reminders can be added to iPhone Calendar (`.ics` with a daily alarm), plus in-app alerts while the app is open.
   - **Profile**: about you, daily targets, display (text size, view, appearance, language), quick-save, AI status and access code, install help, export/import/redo setup/erase.
7. **Deep links**: `/log/#record` opens the recorder and `/log/#type` opens the text box (for iOS Shortcuts or Back Tap).

## Data model (`localStorage["nomnom.<scope>.dailylog"]`)
`scope` = `nomnom.auth.user.id` if signed in on the landing page, else `guest` (same scheme as [persistence.md](./persistence.md)).
```js
{
  version: 2,
  profile: { name, sex: 'female'|'male', age, height_cm, weight_kg, activity: 'sedentary'|'light'|'moderate'|'active', goal: 'lose'|'keep'|'gain', createdAt },
  entries: [{ id, ts, kind: 'food'|'drink'|'supplement'|'medication'|'exercise', name, name_vi, brand, serving,
              servings, confidence, assumptions, source, nutrients /* per ONE serving */, minutes?, burned?, thumb?, cabinetId? }],
  cabinet: [{ id, kind, name, name_vi, brand, serving, nutrients, times: ['08:00'], thumb?, createdAt }],
  doses:   { 'YYYY-MM-DD|cabinetId|HH:MM': entryId },
  settings:{ textSize: 'm'|'l'|'xl', view: 'simple'|'detailed', theme: 'auto'|'light'|'dark', autoLog, accessCode, notify, kcalOverride }
}
```
v1 data, which had no profile, is migrated automatically, and the app then runs profile setup. Nutrient keys (19): `kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, potassium_mg, calcium_mg, iron_mg, magnesium_mg, zinc_mg, vit_a_mcg, vit_c_mg, vit_d_mcg, vit_e_mg, vit_b12_mcg, folate_mcg, water_ml`. Sugar and sodium are **limits**.

## Deploy / configure AI
Cloudflare Pages compiles `functions/` automatically. In **Workers & Pages → nomnom → Settings → Variables and Secrets**, set these for **both** the Production and Preview environments (pick the environment in the dropdown at the top right):
- `ANTHROPIC_API_KEY`: required (Secret).
- `NOMNOM_ACCESS_CODE`: optional. Users then enter it in Profile.
- `NOMNOM_MODEL` / `NOMNOM_EFFORT`: optional (default `claude-haiku-5-5` / `low`; use `claude-sonnet-5-5` for more accurate label reading).

A new deployment is needed after changing variables.

## Known limits / TODO
- [ ] **Background push reminders** (Web Push + scheduled sender). For now, use the Calendar export.
- [ ] Speech recognition in Home-Screen web apps is unreliable on some iOS versions, and in Chrome on iPhone it isn't available. The keyboard-dictation fallback covers both. A native wrapper would add Siri/App Intents.
- [ ] Sync to Supabase with auth ([auth.md](./auth.md)), so the profile follows the user across devices.
- [ ] Apple Health import of steps/workouts and export of nutrition (native app needed).
- [ ] Rate limiting on `/api/parse` beyond the access code.
- [ ] Expand `vn-foods.js` to the 58 `recipeDB` dishes, then 500+.
- [ ] Weight log over time, with targets recalculating as weight changes.
- [ ] Caregiver/family view (an adult child checking a parent's medicines).

## Dependencies
- [persistence.md](./persistence.md): storage scope convention.
- [voice-log.md](./voice-log.md): the landing-page demo of the same idea; this app is the working version.
- [recipe-hub.md](./recipe-hub.md) / [cuisine-db.md](./cuisine-db.md): the dish data that `vn-foods.js` should converge with.
