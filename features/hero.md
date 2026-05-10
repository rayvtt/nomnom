# Hero + Nav + Statement

**Status:** 🟡 Partial — visual is solid, waitlist input doesn't submit anywhere yet.

## Purpose
First impression. Establishes brand, tagline, and the bilingual + theme controls. Captures email for the waitlist.

## Sub-components

### Top Nav (line ~1740)
- Logo (NomNom wordmark)
- Anchor links to each section
- VN/EN language toggle
- Theme toggle (floating, bottom-right — see [theme-i18n.md](./theme-i18n.md))
- Avatar / sign-in button (this branch) — see [auth.md](./auth.md)
- Mobile: hamburger nav drawer

### Hero (line ~1805–1820)
- Animated headline
- Subtitle
- Email waitlist input + submit button

### Statement (line ~1821–1832)
- Word-by-word scroll reveal animation
- `statementWords` JS object per language (`vi` and `en`), with `highlights` array marking which word indices use accent color

## File locations in `/index.html`
- **HTML:** lines 1740–1832
- **CSS:** `.nav`, `.hero`, `.statement`, `.word`, `.lang-toggle`
- **JS:** `function rebuildStatement(lang)` + scroll reveal IntersectionObserver

## Current state
- ✅ Animation reveals work
- ✅ Lang toggle works
- 🟡 Waitlist email input has no submit handler — clicking submit does nothing
- 🟡 No success/error feedback on email submit

## TODO
- [ ] Wire waitlist submit to a real endpoint (Cloudflare Pages Function POST → KV / D1 / external like Mailchimp).
- [ ] Validate email format client-side.
- [ ] Show success state ("✓ You're on the list! Position #1,234").
- [ ] Anti-spam: honeypot field or hCaptcha.
- [ ] Track signup source (referrer, UTM).
- [ ] After auth lands: if signed in, hide waitlist input and show "Thanks for being early".

## Dependencies
- [theme-i18n.md](./theme-i18n.md) — VN/EN strings throughout.
- [auth.md](./auth.md) — avatar slot in nav.
