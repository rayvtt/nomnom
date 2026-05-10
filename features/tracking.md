# Tracking — Macro Rings + Profile + Meal Cards

**Status:** ✅ Wired with persistence (this branch).

## Purpose
Core demo: log meals → see remaining macros, BMI/TDEE adjusts targets dynamically, quality score reflects carb mix.

## Sub-modules

### Profile Module (line ~1836–2000ish, JS at ~3005–3098)
- Inputs: age, gender, weight, height, activity level
- Calculations: BMI, BMR (Mifflin-St Jeor), TDEE, macro split (30/40/30 P/C/F)
- Updates `trkMax` and the macro bar max labels.

### Macro Rings (concentric SVGs)
- Outer: Fat (green)
- Middle: Carbs (dual-layer — red total, amber for good carbs)
- Inner: Protein (orange)

### Vertical Macro Bars
- Per-macro filled bars; carb bar splits good vs bad.

### Quality Score Ring
- 0–100 score from average meal quality. Color: green ≥70, amber 50–69, red <50.

### Meal Cards (5 interactive)
- Click to add/remove from daily totals.
- Each carries `data-kcal`, `data-p`, `data-c`, `data-f`, `data-goodc`, `data-badc`, `data-quality`, `data-warn-vi`, `data-warn-en`, `data-warn-type`.
- Shows expandable breakdown with carb-quality analysis, warning tags, verdict.

## File locations in `/index.html`
- **HTML:** lines 1836–2116 (`<section id="tracking">`)
- **JS profile:** `// 0. PROFILE CREATION MODULE` (line ~3005)
- **JS tracking:** `// 1. INTERACTIVE MACRO TRACKING` (line ~3101)
- **State:** `trkState` (totals), `trkMax` (targets)

## State model
```js
trkState = {
  kcal, protein, carbs, fat,
  goodCarbs, badCarbs,
  qualitySum, mealCount
};
trkMax = { kcal, protein, carbs, fat };
profileState = { age, weight, height, gender, activity };
```

## Persistence (this branch)
- `nomnom.<scope>.tracking` ← `trkState`
- `nomnom.<scope>.trkMax` ← `trkMax`
- `nomnom.<scope>.profile` ← profile inputs

## Live cross-feature wiring (this branch)
- After every `updateTrackingUI()`, calls `renderSmartOrder()` so the Smart Order panel's gap pills / match scores reflect newly-logged meals.

## TODO
- [ ] Daily reset at midnight (currently `trkState` carries over).
- [ ] History view: scroll through past 7/30 days of macros.
- [ ] Custom meal entry (not just 5 pre-defined demo cards).
- [ ] Photo-based meal logging (camera → AI → macros).
- [ ] Voice logging route into here (currently `voice-log.md` is a standalone demo).
- [ ] Allow non-default macro split (e.g. 40/30/30 keto, 25/55/20 endurance).
- [ ] Show "you've eaten X% more sodium than yesterday" trend pills.

## Dependencies
- [persistence.md](./persistence.md) — `loadState`/`saveState`.
- [auth.md](./auth.md) — namespaces under `currentUser`.
- [smart-order.md](./smart-order.md) — consumes `trkState`/`trkMax` for gap pills.
- [recipe-hub.md](./recipe-hub.md) — could later allow "log this dish" → mutate `trkState`.
