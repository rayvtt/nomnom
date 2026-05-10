# Cuisine Database Explorer

**Status:** 🟡 Partial — 14 dishes hardcoded; the moat needs 1,000+.

## Purpose
THE MOAT. Vietnamese cuisine nutrition database — accurate, regional-aware, ingredient-level. Public-facing slice = browsable cards. Underlying data = the asset.

## Current demo
- Click-to-expand dish cards
- Per-dish: emoji, name, region, kcal, P/C/F, health score, ingredients list
- VN/EN bilingual

## File locations in `/index.html`
- **HTML:** lines 2618–2628 (placeholder, content rendered via JS)
- **JS:** `// 6. CUISINE DATABASE EXPLORER` line ~3879
- **Data:** `cuisineData` array

## TODO
- [ ] Move `cuisineData` out of inline JS into a separate `data/cuisine.json` (or backed by API).
- [ ] Expand from 14 → 500+ dishes (the moat). Source: Vietnamese culinary references + lab nutrition tests.
- [ ] Regional filter (Hà Nội / Huế / Sài Gòn / Mekong / Central Highlands).
- [ ] Per-ingredient nutrition (the truly differentiated thing — most apps stop at dish-level).
- [ ] Variant handling (phở bò tái vs phở bò chín — different macros).
- [ ] Search by ingredient ("dishes with rau muống").
- [ ] Photo per dish.
- [ ] User-submitted dishes (moderated → DB).
- [ ] API endpoint exposed for partners.

## Dependencies
- [recipe-hub.md](./recipe-hub.md) — `recipeDB` (58 dishes) overlaps; consider unifying.
- [voice-log.md](./voice-log.md) — STT lookup target.
- [smart-order.md](./smart-order.md), [dine-out.md](./dine-out.md) — recommendation engines query this.
