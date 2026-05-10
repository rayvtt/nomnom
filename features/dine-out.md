# Dine-Out Matcher

**Status:** 🟡 Partial — sliders work, dish results are static.

## Purpose
"Two meals down, macros incomplete? NomNom finds Vietnamese dishes that fill the exact gap from our 1,200+ dish DB." Slider-based interface for setting target macros, returns matching dishes.

## Sub-components
- Timeframe toggle: Today / This week
- 4 macro sliders: Protein / Carbs / Fat / kcal
- Preference pills (cuisine type, spice level, etc.)
- Result list of dish cards

## File locations in `/index.html`
- **HTML:** lines 2479–2543 (`<section id="dineout">`)
- **JS:** Search for `doPSlider`, `buildDoPrefPills`, `renderDoResults`.

## Current state
- ✅ Sliders update target macros UI
- ✅ Pref pills toggle
- 🟡 Dish results are mostly hardcoded; no real matching against `recipeDB`

## TODO
- [ ] Wire result list to filter `recipeDB` (58 dishes) by macros within ±10g tolerance.
- [ ] Sort by match score (re-use `computeMatchScore` from smart-order).
- [ ] "Use my remaining macros" button → preset sliders to `trkMax - trkState`.
- [ ] Dish detail: tap → expandable nutrition card.
- [ ] Map view of restaurants serving the matched dishes.
- [ ] Save favorite dishes (per-user).

## Dependencies
- [tracking.md](./tracking.md) — for "use my remaining macros" preset.
- [recipe-hub.md](./recipe-hub.md) — `recipeDB` source.
- [smart-order.md](./smart-order.md) — share `computeMatchScore`.
