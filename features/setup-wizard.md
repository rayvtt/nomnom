# Auto-Order Setup Wizard

**Status:** ✅ Wired with persistence (this branch).

## Purpose
6-step config UI that the user completes once. Output drives [smart-order.md](./smart-order.md) — what gets recommended, when push notifs fire, etc.

## 6 config steps
1. **Eating times** — dynamic meal list, time inputs (`#setupMeals`)
2. **Meals per day** — segmented control 2/3/4/5 (`#setupMealsDay`)
3. **Budget per meal** — range slider 40k–300k VND (`#setupBudgetSlider`)
4. **Max delivery time** — range slider 20–40 min (`#setupDeliverySlider`)
5. **Nutrition goal** — loss / maintain / gain (`#setupGoals`)
6. **Notification channels** — phone / desktop toggles (`#setupToggles`)

Then: Activate button (`#setupActivateBtn`) — confetti + scroll to Smart Order live preview, syncs goal across.

## File locations in `/index.html`
- **HTML:** lines 2296–2428 (`<section id="setup">`)
- **JS:** `// 4.B AUTO-ORDER SETUP WIZARD` line ~3669

## State model
```js
setupState = {
  meals: [{vi, en, icon, time}, ...],
  mealsPerDay: 3,
  budget: 85,        // thousand VND
  delivery: 25,      // minutes
  goal: 'maintain',
  channels: { phone: true, desktop: true },
  activated: false
};
```

## Persistence (this branch)
- `nomnom.<scope>.setupState` ← `setupState`

## Cross-feature wiring
- `setupState.meals` → [smart-order.md](./smart-order.md) `computeLiveCountdown()` (next-meal time).
- `setupState.budget` → smart-order option filtering (over-budget dishes get dimmed tag).
- `setupState.goal` → drives `soActiveGoal` selection on activation.

## TODO
- [ ] Multi-device push registration (Web Push API).
- [ ] Allergy / dislike list (e.g. "no shrimp", "no MSG") — major UX win for Vietnam market.
- [ ] Cuisine preference tags (street food / home-cooked / restaurants).
- [ ] Auto-activate vs confirm-each-meal toggle (currently activated = auto-mode is implied but not differentiated).
- [ ] Time-zone awareness (foreigners visiting Vietnam, etc.).
- [ ] Budget tier presets (student / professional / premium) for one-tap setup.
- [ ] Sync goal change here ↔ Smart Order goal buttons (currently Smart Order's goal buttons re-render but don't write back to `setupState.goal`).

## Dependencies
- [persistence.md](./persistence.md), [auth.md](./auth.md)
- [smart-order.md](./smart-order.md) — primary consumer.
