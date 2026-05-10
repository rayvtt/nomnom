# NomNom Feature Specs

Per-feature spec docs. **Each iteration session reads only the relevant feature file plus the line ranges it points to in `/index.html`.**

## How to use this folder

1. Pick the feature you're iterating on.
2. Read `features/<feature>.md` first.
3. Open `/index.html` and jump to the line ranges listed in the spec (HTML / CSS / JS).
4. Make changes, update the spec's "Current state" + "TODO" sections at the end.
5. Commit on the feature branch.

## Index

### Cross-cutting
- [auth.md](./auth.md) — Sign-up / sign-in / sign-out + future Supabase wiring
- [persistence.md](./persistence.md) — localStorage layer for all in-memory state
- [theme-i18n.md](./theme-i18n.md) — Dark/light mode + Vietnamese/English bilingual

### Top-of-page
- [hero.md](./hero.md) — Nav, hero, statement scroll-reveal, waitlist input

### Core demos (top → bottom of landing page)
- [tracking.md](./tracking.md) — §1 BMI/TDEE profile + macro rings + meal cards
- [audience-timeline-proof.md](./audience-timeline-proof.md) — §1.5/1.7/9 marketing strips
- [gamification.md](./gamification.md) — §2 XP, streaks, badges, cheat-meal meter
- [voice-log.md](./voice-log.md) — §3 Voice-log demo with typewriter + AI parse animation
- [setup-wizard.md](./setup-wizard.md) — §3.8 Auto-Order Setup (6-step config)
- [smart-order.md](./smart-order.md) — §4 Smart Order live preview + Leaflet map
- [dine-out.md](./dine-out.md) — §4.5 Dine-Out Matcher (sliders + dish results)
- [group-challenge.md](./group-challenge.md) — §5 Live leaderboard
- [cuisine-db.md](./cuisine-db.md) — §6 Vietnamese cuisine card explorer
- [recipe-hub.md](./recipe-hub.md) — §7 58-dish browser with category pills + search
- [recipe-analyzer.md](./recipe-analyzer.md) — §7.5 AI recipe text/photo analyzer
- [vendor-hub.md](./vendor-hub.md) — §8 B2B restaurant menu labeling demo

## Status legend (used in each spec)

- ✅ **Wired** — pulls real state, persists, behaves correctly
- 🟡 **Partial** — works as a demo, missing persistence or live data
- ⚪ **Static** — pure HTML/CSS, no interactivity yet
- 🔴 **Broken** — bug or regression, needs fixing
