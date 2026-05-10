# AI Recipe Analyzer

**Status:** ⚪ Static demo — paste recipe text or upload photo, fake AI animation.

## Purpose
"Bạn nấu món gì? Paste công thức, AI tính macro." User pastes any recipe (or uploads a photo) → returns macro breakdown + health score.

## File locations in `/index.html`
- **HTML:** lines 2649–2686 (`<section id="analyzer">`)
- **JS:** Search for `anTextarea`, `anAnalyzeBtn`.

## TODO
- [ ] Real LLM call (Claude / GPT) for ingredient extraction from pasted text.
- [ ] Photo route: vision model → ingredient list → nutrition lookup.
- [ ] Match extracted ingredients against `cuisineData` ingredient-level DB.
- [ ] Confidence score per ingredient ("90% sure this is gạo lứt").
- [ ] User correction UI (tap an ingredient → edit/swap).
- [ ] "Save as my recipe" → user's personal `recipes` collection.
- [ ] Cost estimation (price per portion based on Vietnamese ingredient prices).
- [ ] Cooking time estimate.

## Dependencies
- [cuisine-db.md](./cuisine-db.md) — ingredient nutrition lookup table.
- [recipe-hub.md](./recipe-hub.md) — save-as-recipe destination.
- Backend — API key for LLM lives there, never in client.
