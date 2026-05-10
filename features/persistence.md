# Persistence (localStorage layer)

**Status:** 🟡 Partial — wired this branch for tracking, profile, gamification, theme, lang, setup wizard.

## Purpose
Replace ephemeral in-memory state with `localStorage` so meal logs, profile, streak, etc. survive page reloads. Foundation for future Supabase sync.

## Namespacing scheme
All keys are prefixed with the user scope:

```
nomnom.<scope>.<feature>
  scope = userId (when logged in) or "guest" (when logged out)
```

Examples:
- `nomnom.guest.tracking` → `{kcal, protein, carbs, fat, ...}`
- `nomnom.<uid>.profile` → `{age, weight, height, gender, activity, bmi, tdee, ...}`
- `nomnom.guest.gamify` → `{xp, streak, unlockDays, badgesUnlocked}`
- `nomnom.<uid>.setupState` → setup wizard config
- `nomnom.theme` → 'dark' | 'light'  *(not user-scoped — device preference)*
- `nomnom.lang` → 'vi' | 'en'  *(not user-scoped — device preference)*

## API
Two helpers in JS: `loadState(key, fallback)` and `saveState(key, value)`.

```js
// Load
const trk = loadState('tracking', { kcal: 0, protein: 0, ... });
// Save
saveState('tracking', trkState);
```

`loadState`/`saveState` automatically prepend `nomnom.<scope>.` based on `currentUser`. Theme + lang use bare keys.

## File locations in `/index.html`
- **JS:** `// PERSISTENCE` section near the top of the `<script>` block.

## What persists today (this branch)
- ✅ Theme (dark/light) and language (VN/EN)
- ✅ Profile module values (age, weight, height, etc.)
- ✅ Tracking state (today's logged meals, totals)
- ✅ Gamification state (XP, streak, badges)
- ✅ Setup wizard config (meals, budget, delivery, goal, channels)
- ✅ Active user record (`nomnom.auth.user`)

## What does NOT persist yet
- ❌ Voice log entries (demo only, no real STT yet)
- ❌ Recipe favorites (no UI for favoriting yet)
- ❌ Smart Order selected dish history
- ❌ Group challenge data (will need backend regardless)
- ❌ Map state (zoom/pan)

## TODO
- [ ] Daily reset of `tracking` state at midnight local time (currently persists across days, which is wrong).
- [ ] Historical view: keep last N days of tracking under `nomnom.<scope>.history.YYYY-MM-DD`.
- [ ] Migration on schema change: write a `nomnom.schema.version` key + migration runner.
- [ ] Quota handling: catch `QuotaExceededError`, show user a clear message.
- [ ] Sync layer: when user signs in, push local state up; when signing out, optionally clear or keep as guest.

## Dependencies
- [auth.md](./auth.md) — defines `currentUser` which scopes all keys.
