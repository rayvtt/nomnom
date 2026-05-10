# Theme + Bilingual (Dark/Light, VN/EN)

**Status:** ✅ Wired — both fully functional, persist to localStorage on this branch.

## Purpose
Two cross-cutting toggles affecting every section.

## Theme (dark/light)
- Toggle: floating button bottom-right (sun/moon SVG morph) + light-mode class on `<body>`.
- All colors via CSS custom properties (`var(--bg)`, `var(--text)`, etc.) — see CLAUDE.md "Colors".
- Map tiles also switch (CartoCDN dark_all ↔ light_all) via `updateMapTheme()`.
- Persisted under `nomnom.theme` (no user scope — device preference).

## Bilingual (Vietnamese / English)
- Toggle: navbar VN/EN buttons (`.lang-toggle`) — appears in both desktop and mobile nav.
- `currentLang` global ('vi' | 'en'), default 'vi'.
- Text swap mechanism, in priority order:
  1. **Inline elements:** `data-vi` / `data-en` attributes — `setLang()` swaps `textContent`.
  2. **HTML elements:** add class `.lang-html` to a `data-vi`/`data-en` element to use `innerHTML` instead of `textContent` (allows `<span>` for colored words).
  3. **Section titles:** `sectionTitles` JS object keyed by section, swapped via `innerHTML`.
  4. **`<option>` tags:** also use `data-vi`/`data-en`.
  5. **Dynamic content** (recipes, vendor menus, smart-order options, cuisine cards): rebuilt by their feature's render function on language change.
- Persisted under `nomnom.lang`.

## File locations in `/index.html`
- **HTML toggle buttons:** search `class="lang-toggle"` and `id="themeToggle"`.
- **CSS:** `:root` + `body.light-mode` overrides at top of `<style>`.
- **JS theme:** search `// THEME TOGGLE` (or the float-button click handler).
- **JS lang:** `function setLang(lang)` around line 2876.

## Convention for new content
- Every user-facing string MUST have `data-vi` AND `data-en`.
- Never hardcode hex colors — use `var(--xxx)`.
- For JS-generated content, branch on `currentLang === 'vi'`.
- If you add new dynamic-render content, add a call to your feature's render function inside `setLang()` so it re-renders on language switch.

## TODO
- [ ] Auto-detect language from `navigator.language` on first visit (default to VN if Vietnam, else EN).
- [ ] System theme preference detection (`prefers-color-scheme`).
- [ ] Add Bahasa Indonesia / Thai / Khmer if NomNom expands regionally.
- [ ] Unit tests / lint rule that fails if a `data-en` exists without `data-vi` (or vice versa).

## Dependencies
- [persistence.md](./persistence.md) — uses bare `nomnom.theme` / `nomnom.lang` keys.
- All sections — every render function must respect `currentLang`.
