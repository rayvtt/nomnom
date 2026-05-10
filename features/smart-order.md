# Smart Order — Weekly Plan + MCQ + Map

**Status:** ✅ Wired (last commit) — pulls live data from `trkState`, `setupState.meals`, `setupState.budget`.

## Purpose
"After activation" preview: show the user what NomNom *would* recommend right now based on remaining macros, configured budget, and time-to-next-meal. Plus a Leaflet map of nearby delivery options.

## Sub-modules

### Weekly Plan Panel (`#soSetupPanel`)
- Day-of-week tag (today + days remaining)
- Goal buttons (loss / maintain / gain) — switching re-renders everything
- 7-day grid (Mon–Sun) with completion bars; today is highlighted dynamically
- "Remaining this week" macros (P/C/F)

### Notification → MCQ Panel (`#soNotifPanel`)
- Live countdown ("X min until <next-meal>") computed from `setupState.meals` real times
- Gap pills — real remaining macros from `trkState` vs `trkMax`, goal-adjusted
- 3 dish options with:
  - Match % computed live by `computeMatchScore(dish.nutrition, gaps)`
  - Over-budget dimming when `dish.price_k > setupState.budget`
- Selecting an option reveals Order / Skip buttons

### Leaflet Map (`#orderMap`)
- 5 initial markers at fixed coords in District 1, HCMC.
- On pan/zoom, 3–5 new markers spawn from a 20-restaurant pool.
- Theme follows app theme (CartoCDN dark_all ↔ light_all).

## File locations in `/index.html`
- **HTML:** lines 2430–2475 (`<section id="order">`)
- **JS:** `// 4. SMART ORDER` line ~3399 — includes:
  - `soGoalData` — 3 goals × 3 dish options (each with `nutrition`, `price_k`, `match`)
  - `computeSmartOrderGaps()`
  - `computeLiveCountdown()`
  - `computeMatchScore()`
  - `renderSmartOrder()`
  - `selectSoOption()`
- **Map JS:** map init + `updateMapTheme()` + `generateNearbyRestaurants()`

## State model
```js
soActiveGoal = 'loss' | 'maintain' | 'gain'
soSelectedOption = null | 0..2
soAnimated = false  // becomes true when section first scrolls into view
```

`soGoalData[goal].options[i]` shape:
```js
{ emoji, vi, en, rest, dist, platform, price, price_k, match, nutrition: {p, c, f, k} }
```

## Live cross-feature wiring (this branch)
- `updateTrackingUI()` → triggers `renderSmartOrder()` if `soAnimated`.
- `setLang()` → triggers `renderSmartOrder()` if `soAnimated`.
- Setup wizard "Activate" button → syncs `soActiveGoal = setupState.goal`, calls `renderSmartOrder()`.

## TODO
- [ ] Real geolocation (`navigator.geolocation`) instead of hardcoded D1 HCMC.
- [ ] Real GrabFood Partner API integration for dish/restaurant data (see CLAUDE.md "Delivery Platform API Status").
- [ ] ShopeeFood deep-link fallback when no API.
- [ ] Larger dish pool — currently 9 hardcoded options. Source from `recipeDB` + restaurant joins.
- [ ] Push notification fire (Web Push API + service worker) at the configured meal times.
- [ ] Order confirmation modal (currently "Order" button just changes its label).
- [ ] Order history list — feed back into XP / streak.
- [ ] Match-score weighting tuning (currently 0.4/0.35/0.25 P/C/F; should consider macro shortfall priority).
- [ ] Skip-meal logic that shifts macros to next meal.
- [ ] Allergy / preference filter from setup wizard.

## Dependencies
- [tracking.md](./tracking.md) — `trkState` / `trkMax` source.
- [setup-wizard.md](./setup-wizard.md) — `setupState.meals`, `.budget`, `.goal`.
- [theme-i18n.md](./theme-i18n.md) — map tile swap.
- [persistence.md](./persistence.md) — for selected goal persistence.
