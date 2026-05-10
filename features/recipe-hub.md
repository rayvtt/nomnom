# Recipe Hub

**Status:** 🟡 Partial — 58 dishes browsable, no favorites, no "log this".

## Purpose
Browse 58 Vietnamese dishes across 11 categories. Long-tail SEO surface + dish discovery.

## Sub-components
- Category pill filters (soup / rice / noodle / grilled / street / seafood / appetizer / vegetarian / drink / dessert / all)
- Text search input (placeholder swaps language)
- Result grid: expandable cards with ingredients, carb-quality bars, nutrition score

## File locations in `/index.html`
- **HTML:** lines 2629–2648 (`<section id="recipes">` — header + container only; cards rendered via JS)
- **JS:** `// 7. RECIPE HUB` line ~4046
- **Data:** `recipeDB` array (58 entries) with full nutrition + ingredients

## State
```js
let recipeFilter = 'all';
let recipeSearchTerm = '';
```

## TODO
- [ ] Move `recipeDB` to `data/recipes.json`.
- [ ] Favorite a recipe (per-user, persisted).
- [ ] "Log this dish" button → mutate `trkState`.
- [ ] "Find restaurants serving this" → cross-link to Smart Order map.
- [ ] Recipe steps (instructions for home cooks).
- [ ] Photo per recipe.
- [ ] Substitutions (e.g. "swap white rice for brown" → recalc macros).
- [ ] User-submitted recipes (moderated).
- [ ] Print/share view.

## Dependencies
- [tracking.md](./tracking.md) — log destination.
- [cuisine-db.md](./cuisine-db.md) — overlapping data, consider unification.
