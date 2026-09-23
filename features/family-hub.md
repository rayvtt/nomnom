# Family Hub — Multi-Profile Household + Daily Market List

**Status:** 🟡 Partial — interactive demo built, values are static targets (not derived from live logging).

## Purpose
NomNom as a *nutrition agent for a whole household*, not just one person. Motivating case: a family cooking daily for a toddler, an adult male, and an adult female, who want to (1) see each person's daily nutrition needs at a glance, (2) get one merged, exact-weight grocery list instead of doing the math themselves, and (3) stay motivated as a household via streaks/badges rather than tracking solo.

## Sub-modules

### Member Cards (`#familyMembers`)
- 3 cards: toddler (2 yrs), adult male, adult female — emoji avatar, role tag, kcal ring, P/C/F mini-bars.
- Click to expand → shows 5 micronutrients (Vitamin A, C, D, Calcium, Iron) as labeled bars, per member.
- Values are static WHO/RDA-ballpark daily targets per member (see `familyMembers` array), not computed from a profile form — unlike `tracking.md`'s Mifflin-St Jeor calculator.

### Household Totals (`#familyTotals`)
- Sums the 3 members' kcal/protein/carbs/fat into 4 stat tiles.
- Footnote calls out the shared daily juice serving (500ml) for vitamin C.

### Daily Market List (`#fmMarketList`)
- Styled as a push notification ("🔔 NomNom • Today, 7:00 AM — Today's family grocery list 🛒").
- 12 Vietnamese grocery items from `familyMarketBasket`, each with an exact weight/volume (g/ml/count) and a one-line tag naming which family member/nutrient it covers (e.g. "≈54g protein + DHA for kid & mom").
- Basket quantities are hand-picked to roughly sum to the household's total targets — illustrative, not a real solver.
- "🔄 Regenerate list" jitters each quantity ±15% and re-renders with a staggered fade-in — demonstrates dynamic list generation (no real meal-planning engine behind it).
- Includes the fresh orange juice line item directly (the "juice" macro-relevant item from the pitch).

### Family Gamification (`#familyGamifyCard` / `.family-gamify-card`)
- Household streak counter + XP bar + level (same visual language as `gamification.md`, scoped to the family instead of one user).
- 3 badges (kid ate veggies / dad hit protein / mom hit iron), unlocked one per click of "✅ Mark today complete", up to 3; unlocking the 3rd fires `spawnConfetti()` (shared with `gamification.md`).
- Clicking past 3 badges keeps incrementing XP/streak (XP rolls over into `level` at 1000, mirroring `gamifyState`'s level-up pattern).

## File locations in `/index.html`
- **HTML:** `<section class="family-section" id="family">` — search for `id="family"`.
- **CSS:** `/* 9. FAMILY HUB */` block, right before `/* ===== STATS ===== */`.
- **JS:** `// 9. FAMILY HUB (multi-profile household + market list)` — last section before `</script>`.
- **Data:** `familyMembers` (3-member targets), `familyMarketBasket` (12-item grocery list).
- **State:** `familyState = { xp, level, streak, unlockedBadges }`.

## Key functions
- `renderFamilyMembers()` — builds the 3 member cards, wires click-to-expand vitamins.
- `renderFamilyTotals()` — sums member targets into the totals strip.
- `renderFamilyMarketList(jitter)` — builds/regenerates the grocery list; `jitter=true` randomizes quantities.
- `rebuildFamilyHub()` — calls all three; invoked on load and from `setLang()` on language switch.
- `updateFamilyGamifyUI()` — syncs streak/XP/level DOM from `familyState`.

## Nav / bilingual wiring
- Nav link: `<a href="#family">` ("Gia đình" / "Family"), after Cuisine.
- `sectionTitles.family` + `familyTitle` wired in `setLang()` like every other section.
- All static copy uses `data-vi`/`data-en`; JS-built member/market content branches on `currentLang` directly (same pattern as `cuisineData`/`rebuildCuisine()`).

## TODO
- [ ] Replace static per-member targets with the real BMI/TDEE calculator from `tracking.md`, run once per family member (needs a per-member profile form, not just one `profileState`).
- [ ] Derive the market list from actual macro *gaps* (target − what's already been cooked/logged this week) instead of a fixed illustrative basket — needs a per-member logging surface first.
- [ ] Real push notification delivery (Web Push API + service worker) at a scheduled time, replacing the always-visible notification-styled card.
- [ ] Let a household "own" more than 3 members (add/remove kids, elderly parents, pregnancy/lactation adjustments) — current array is hardcoded to exactly 3.
- [ ] Swap the fixed 12-item basket for a real ingredient database query (ties into `cuisine-db.md`'s moat) so quantities are nutrition-solver output, not hand-tuned numbers.
- [ ] Persist `familyState` (streak/xp/badges) — currently resets on page reload; wire into `persistence.md`'s `nomnom.<scope>.family` key once that layer exists on this branch.
- [ ] Real vitamin intake tracking (currently shows *targets* only, not intake vs. target coverage).

## Dependencies
- [tracking.md](./tracking.md) — BMI/TDEE calculator this should eventually reuse per member.
- [gamification.md](./gamification.md) — visual/interaction pattern this section's streak/XP/badges mirrors.
- [cuisine-db.md](./cuisine-db.md) — the real ingredient-level nutrition data the market basket should eventually query.
- [smart-order.md](./smart-order.md) — conceptually adjacent (macro-gap-driven recommendations); Smart Order is per-meal/per-person, Family Hub is per-household/per-day.

## Note on current codebase state
This branch's `/index.html` (3,109 lines) does **not** yet have the `localStorage` persistence layer or auth scaffolding that `persistence.md`/`auth.md` describe ("this branch" in those docs refers to a different, more advanced branch state than what's checked out here). Family Hub was built to match the *actual* current file's patterns — in-memory state only, no `loadState`/`saveState` calls — so it's consistent with the rest of this checkout. Wiring it into persistence is called out in the TODO above for whenever that layer lands here.
