# Bugs / Friction Log — Smart Order Tab

> Code-review findings from inspecting the deployed landing page at https://nomnom-728.pages.dev/.
> Format per finding: `severity · tab · what was wrong · fix applied`
> Severity: 🔴 broken · 🟡 friction · 🟢 polish

## Walkthrough date: 2026-05-10
## Source file: `index.html` (Smart Order section — `#order`)

---

## Smart Order tab — `#soNotifPanel`

🔴 **Order button confirmation text hardcoded to "GrabFood"**
- `selectSoOption()` line ~3884: `'✓ Đã gửi đến GrabFood!'` was hardcoded
- ShopeeFood dishes showed wrong platform in confirmation
- **Fixed:** now uses `opt.platform` variable — `'✓ Đã đặt trên ${opt.platform}!'`

🔴 **Skip button was a dead button**
- `selectSoOption()` had no click handler on the skip button
- Tapping "Bỏ qua bữa này" did nothing visually
- **Fixed:** skip now deselects the option and hides the action row

🟡 **Ordering didn't update macro tracking**
- Clicking Order changed a button label but trkState was never mutated
- The macro rings in the Tracking section stayed unchanged after ordering
- **Fixed:** Order button now adds `opt.nutrition` to `trkState` and calls `updateTrackingUI()`

🟡 **Ordering didn't award XP**
- No gamification wiring existed for the Order flow
- **Fixed:** Order button now grants +50 XP and calls `updateGamifyUI()`

🟡 **Goal button in Smart Order didn't write back to `setupState`**
- Switching loss/maintain/gain in Smart Order updated `soActiveGoal` in memory only
- On page reload the goal reverted to whatever was in `setupState`
- **Fixed:** goal button click now sets `setupState.goal` and calls `saveState('setupState', setupState)`

🟡 **Goal in Setup Wizard didn't live-sync to Smart Order**
- After activation, changing goal in the Setup Wizard updated `setupState.goal` but Smart Order panels kept the old goal until page reload
- **Fixed:** Setup Wizard goal buttons now sync `soActiveGoal` + re-render Smart Order when `soAnimated` is true

🟢 **`soActiveGoal` initialized to `'loss'` regardless of persisted preference**
- Default was hardcoded `let soActiveGoal = 'loss'` before `setupState` was loaded
- After the first visit the goal button showed the wrong active state until scroll-triggered render
- **Fixed:** after `setupState` loads, `soActiveGoal` is set from `setupState.goal` and goal buttons updated

🟢 **Order button hover transform still applied when disabled**
- CSS `so-order-btn:hover` applied `transform: scale(1.02)` even after `disabled` was set
- **Fixed:** changed selector to `so-order-btn:hover:not(:disabled)`

---

## Action items (resolved this session)

- [x] Fix order button platform text
- [x] Wire skip button
- [x] Log ordered dish to trkState → updateTrackingUI
- [x] Award XP on order → updateGamifyUI + particle burst
- [x] Bidirectional goal sync: Smart Order ↔ Setup Wizard
- [x] Initialize soActiveGoal from persisted setupState
- [x] Fix disabled-state hover on order button
