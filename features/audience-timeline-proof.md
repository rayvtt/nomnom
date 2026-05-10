# Audience / Timeline / Proof / CTA

**Status:** ⚪ Static marketing strips.

## Purpose
Marketing layer between functional demos. These don't need backend wiring — they're storytelling.

## Sections covered
1. **Audience (`#audience`)** — who NomNom is for (lines ~2117–2160)
2. **Timeline (`#timeline`)** — nutrition journey vis (lines ~2161–2209)
3. **Stats strip** — big numbers (lines ~2730–2746)
4. **Proof (`#proof`)** — testimonials (lines ~2747–2776)
5. **CTA (`#cta`)** — final waitlist push (lines ~2777+)

## File locations in `/index.html`
- **HTML:** lines listed above
- **JS:** `renderTimeline`, `renderTestimonials` if applicable; otherwise pure HTML

## TODO
- [ ] Real testimonials when we have them (currently placeholders).
- [ ] Logo wall (press / partners) when those land.
- [ ] Stats numbers should pull from real backend once it exists ("5,123 users", "1.2M meals tracked").
- [ ] CTA email submit → same handler as hero waitlist.
- [ ] A/B test variants of the audience copy.

## Dependencies
- [hero.md](./hero.md) — shares waitlist submit handler.
- [theme-i18n.md](./theme-i18n.md) — bilingual.
