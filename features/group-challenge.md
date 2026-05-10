# Group Challenge

**Status:** ⚪ Static demo — animated leaderboard, no real multiplayer.

## Purpose
Social pressure as retention: "you and 5 friends, 7-day streak challenge, lowest sugar wins." Vietnamese culture is highly social — this is a major retention lever.

## Current demo
- Leaderboard with friend avatars + scores
- Animated progress bars (`gcProgress1`, `gcProgress2`)
- "My score" change animation

## File locations in `/index.html`
- **HTML:** lines 2544–2617 (`<section id="group">`)
- **JS:** `// 5. GROUP LEADERBOARD ANIMATION` line ~3856

## TODO
- [ ] Real challenge model: `{id, name, ruleset, participants[], startsAt, endsAt}`.
- [ ] Backend (Supabase tables + realtime channel).
- [ ] Invite-by-link or invite-by-phone-number.
- [ ] Challenge rules: lowest avg sugar, highest streak, most diverse cuisine, kcal target adherence.
- [ ] Realtime score updates (Supabase realtime or polling).
- [ ] End-of-challenge: winner reveal + reward (free meal credit, badge, XP).
- [ ] Trash-talk feed / chat per challenge.
- [ ] Anti-cheat: server validates score from logged meals.

## Dependencies
- [auth.md](./auth.md) — needs real users.
- [tracking.md](./tracking.md) — score input source.
- [gamification.md](./gamification.md) — winner XP/badge reward.
