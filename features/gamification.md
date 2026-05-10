# Gamification

**Status:** ✅ Wired with persistence (this branch).

## Purpose
Make consistent logging fun: XP for actions, daily streaks, badge unlocks, cheat-meal meter as reward.

## Sub-modules
- **XP bar + level**: progress to next level, +150 XP per `earnXpBtn` click in demo
- **Streak counter**: 🔥 emoji animation
- **Badge grid**: tap to unlock, particle burst on unlock
- **Cheat-meal meter**: 0–3 days, fills to 100% (3 days), confetti on unlock + claim button

## File locations in `/index.html`
- **HTML:** lines 2210–2266 (`<section id="gamify">`)
- **JS:** `// 2. GAMIFICATION SYSTEM` near line 3249
- **State:** `gamifyState`

## State model
```js
gamifyState = {
  xp: 0,
  streak: 0,
  unlockDays: 0, // out of 3 needed
  badgesUnlocked: 0
};
```

## Persistence (this branch)
- `nomnom.<scope>.gamify` ← `gamifyState`

## TODO
- [ ] XP rules tied to real actions (logging a meal = +20 XP, hitting macro target = +50 XP, 7-day streak = +200 XP) instead of demo button.
- [ ] Streak break logic (missed a day → reset to 0; partial day → forgiveness rule).
- [ ] Badge catalog + progression (currently 4 badges, need ~20 for retention).
- [ ] Friend leaderboards integrated with [group-challenge.md](./group-challenge.md).
- [ ] Cheat-meal redemption flow: claim → unlock 1 cheat day → tracking shows "🍕 Cheat day active" banner.
- [ ] Anti-cheat: server-validated XP gains once backend lands.

## Dependencies
- [persistence.md](./persistence.md), [auth.md](./auth.md)
- [tracking.md](./tracking.md) — XP awards should fire from there once wired.
