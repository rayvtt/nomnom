# Vendor Hub (B2B)

**Status:** 🟡 Partial — 3 sample restaurants with multi-stage AI labeling animation; no real backend.

## Purpose
The B2B SaaS hook: restaurants paste their menu, NomNom auto-labels every item with macros + health score + sugar alerts. Tab-switchable sample dashboard.

## Sub-components
- 3 tabbed restaurants: Quán Bà Năm (5 items), Phở Hòa Pasteur (6 items), Lẩu Thái Siam (7 items)
- AI labeling animation: pending → analyzing (pulse) → done (with score)
- Stats panel: items labeled, avg nutrition score, sugar alerts

## File locations in `/index.html`
- **HTML:** lines 2687–2729 (`<section id="vendors">`)
- **JS:** `// 8. VENDOR HUB ANIMATION` line ~4361
- **Data:** `vendorRestaurants` array

## TODO
- [ ] Real menu-import API (CSV / restaurant POS integrations).
- [ ] Real AI labeling (LLM call to estimate macros from dish name + description).
- [ ] Confidence + manual review UI.
- [ ] Pricing tiers (free up to 20 items, Pro for unlimited + analytics).
- [ ] Vendor signup flow + dashboard (separate route, gated by role).
- [ ] Embed widget for restaurants' own websites ("Powered by NomNom" nutrition labels).
- [ ] Compliance reporting (Vietnam food labeling regs if/when they tighten).

## Dependencies
- [auth.md](./auth.md) — vendors are a different user role.
- [cuisine-db.md](./cuisine-db.md) — ingredient lookup powers AI labeling.
