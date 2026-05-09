# NomNom — Nutrition OS for Vietnamese Cuisine

## What This Is

NomNom is a nutrition tracking platform built for Vietnamese food first. The core insight: nobody has properly built a Vietnamese cuisine nutrition database — that's the moat. The product tracks what you eat vs what your body needs, then acts on it through auto-ordering, recommendations, and gamification.

**Stage:** Pre-seed, building. Currently a single-file interactive landing page / proof-of-concept with 10 working demo sections.

**Tagline:** Chuyên gia dinh dưỡng cho tất cả. (Nutrition expert for everyone.)

## File Structure

```
NOMNOM/
├── CLAUDE.md                    ← You are here
├── nomnom-landing.html          ← Main deliverable — single-file HTML app (~3100 lines)
├── nomnom-brief.md              ← Product brief, feature roadmap, team needs
└── api-feasibility-research.md  ← GrabFood & ShopeeFood API research
```

## Tech Stack

**Current (Landing Page):**
- Single-file HTML with inline CSS + vanilla JS (no build tools, no framework)
- Google Fonts: `Instrument Serif` (display/numbers) + `Outfit` (body/UI)
- Leaflet.js 1.9.4 + OpenStreetMap via CartoCDN tiles (dark/light variants)
- CSS custom properties for full dark/light theme support
- No npm, no bundler — everything in one file for rapid prototyping

**Future (App):**
- TBD — likely React Native (mobile) + Next.js (web)
- ML/AI for recommendation engine, recipe analysis, voice processing
- Vietnamese cuisine nutrition database (the core moat)

## Design System

### Colors (CSS Custom Properties)

```css
/* Dark mode (default) */
--bg: #050505;  --bg-2: #0A0A0A;  --bg-3: #111;
--text: #F5F0E4;  --text-2: #8A8070;  --text-3: #4A4540;
--accent: #FF6A28;  --accent-2: #FF9F1C;
--green: #34D399;  --green-dim: #1A6B4D;
--red: #EF4444;  --purple: #A78BFA;  --blue: #60A5FA;
--card-bg: rgba(255,255,255,0.03);  --card-border: rgba(255,255,255,0.06);

/* Light mode overrides via body.light-mode class */
--bg: #FAFAF7;  --bg-2: #F0EDE6;  --bg-3: #E8E4DC;
--text: #1A1814;  --text-2: #6B6560;  --text-3: #9A948E;
```

### Color Semantics
- `--accent` (orange #FF6A28) — protein, primary CTAs, brand color
- `--accent-2` (amber #FF9F1C) — good carbs, secondary emphasis
- `--green` (#34D399) — fat, healthy scores, positive states
- `--red` (#EF4444) — bad carbs, warnings, low nutrition scores
- `--purple` (#A78BFA) — vendor/B2B features, AI analysis
- `--blue` (#60A5FA) — underweight BMI, informational

### Typography
- Display/numbers: `'Instrument Serif', serif` — large stats, ring numbers, BMI display
- Body/UI: `'Outfit', sans-serif` — everything else

### Design Principles
- **Slick & fun, not clinical** — complex data hidden in secondary interactions
- **Apple-level polish** — scroll-triggered animations, particle effects, confetti
- **Interactive demos over descriptions** — every feature has a working micro-demo, not just a description card
- **Dark-first** — dark mode is default, light mode is the toggle option

## Bilingual System (Vietnamese/English)

The entire app is bilingual VN/EN. The system works as follows:

1. **Inline elements**: Use `data-vi` and `data-en` attributes. The `setLang()` function swaps `textContent` to the active language.
2. **Section titles**: Use `sectionTitles` JS object with innerHTML (supports `<span>` tags for colored words).
3. **Select options**: `<option>` tags also carry `data-vi`/`data-en`, swapped in `setLang()`.
4. **Dynamic content** (recipes, vendor menus): Rebuilt via JS functions on language change.
5. **Global state**: `currentLang` variable (`'vi'` or `'en'`), toggled by navbar buttons.

**Convention:** Always add both `data-vi` and `data-en` to any new text element. For JS-generated content, check `currentLang` when setting text.

## Landing Page Architecture (10 Sections)

### 1. Hero + Nav
- Floating navbar with logo, nav links, language toggle (VN/EN), waitlist CTA
- Hero with animated title, subtitle, email waitlist input

### 2. Statement
- Word-by-word scroll-reveal animation
- Highlight words defined in `statementWords` object per language

### 3. Tracking (Interactive Macro Tracker)
- **Profile Module**: BMI calculator + Mifflin-St Jeor TDEE + activity level selector. Calculates recommended daily calories and macro targets (30% protein / 40% carbs / 30% fat). Updates tracking rings dynamically.
- **Concentric SVG rings**: Fat (outer, green), Carbs (middle, dual-layer: red for total, amber for good carbs), Protein (inner, orange)
- **Vertical macro bars**: With split carb visualization (good vs bad)
- **Quality score ring**: 0-100 score with color-coded feedback
- **5 interactive meal cards**: Click to add/remove from daily totals. Each has expandable breakdown showing carb quality analysis, warning tags (sugar/sodium/good/nocomplex), and verdict.
- **Key state**: `trkState` (current totals) and `trkMax` (daily targets, updated by profile module)

### 4. Gamification
- XP progress bar with level display
- Streak counter (fire emoji animation)
- Badge unlock grid (tap to unlock with particle burst)
- Cheat meal meter (fills to 100%, confetti on unlock)

### 5. Voice Log
- Click microphone to trigger demo
- Typewriter text animation simulating voice input
- AI parsing animation with cycling analysis phrases

### 6. Smart Order
- Animated card reveals showing recommended dishes
- **Interactive Leaflet map** centered on District 1, Ho Chi Minh City
- 5 initial restaurant markers with match %, dish, distance, price, platform
- **Dynamic generation**: On pan/zoom, 3-5 new restaurants spawn from a pool of 20 Vietnamese restaurants
- Map theme auto-switches between CartoCDN dark_all and light_all tiles

### 7. Group Challenge
- Live leaderboard with animated rankings
- Challenge progress bars with score animations
- Friend avatars and challenge descriptions

### 8. Vietnamese Cuisine Database Explorer
- Click-to-expand cards with full macro breakdowns
- Health scores, ingredient lists, regional origins
- Rebuilt dynamically via `rebuildCuisine()` on language change

### 9. Recipe Hub
- **58 Vietnamese dishes** across 11 categories (soup, rice, noodle, grilled, street, seafood, appetizer, vegetarian, drink, dessert)
- Category pill filters + text search
- Expandable recipe cards with ingredients, carb quality bars, nutrition scores
- `recipeDB` array with full nutrition data per dish
- Rebuilt via `buildRecipeHub()` on filter/search/language change

### 10. Restaurant Vendor Hub (B2B)
- **3 tabbed restaurants**: Quán Bà Năm (5 items), Phở Hòa Pasteur (6 items), Lẩu Thái Siam (7 items)
- AI menu labeling animation: pending → analyzing (pulse) → done with score
- Stats panel: items labeled, avg nutrition score, sugar alerts
- Tab switching triggers animation for each restaurant
- `vendorRestaurants` array defines all restaurant data

### Global Features
- **Dark/light toggle**: Animated floating button (bottom-right) with sun/moon SVG morphing
- **Scroll animations**: `IntersectionObserver`-based `.reveal` class with `fadeInUp` keyframes
- **Particle effects**: `spawnParticles()` for meal card interactions
- **Confetti**: For gamification cheat meal unlock

## Key JS Patterns

### State Management
All state is in-memory JS objects. No localStorage, no backend.

```javascript
// Tracking state (reset on page load)
const trkState = { kcal, protein, carbs, fat, goodCarbs, badCarbs, qualitySum, mealCount };
const trkMax = { kcal, protein, carbs, fat }; // Updated by profile module

// Language state
let currentLang = 'vi';
```

### Animation Pattern
Most sections use IntersectionObserver to trigger animations on scroll:
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !alreadyAnimated) {
      alreadyAnimated = true;
      // run animation sequence with setTimeout chains
    }
  });
}, { threshold: 0.3 });
```

### Theme Toggle
```javascript
document.body.classList.toggle('light-mode');
// All CSS uses var(--xxx) so theme switches instantly
// Map tiles also switch via updateMapTheme()
```

## Delivery Platform API Status

### GrabFood — Official Partner API exists
- OAuth2 auth, SDKs in Python/Go/Java (github.com/grab/grabfood-api-sdk-*)
- Partner-only access (apply via developer.grab.com)
- Has menu sync, order management, webhooks
- Does NOT include nutritional data (we match to our own DB)

### ShopeeFood — No public API
- No developer portal, no documented API
- Community reverse-engineered Postman collection exists (fragile)
- Partnership or scraping required

### Integration Strategy
1. **MVP**: Deep links (open GrabFood/ShopeeFood app with search pre-filled)
2. **Beta**: Apply for GrabFood Partner API, negotiate ShopeeFood partnership
3. **Scale**: Auto-ordering via Partner APIs, real-time budget + macro optimization

See `api-feasibility-research.md` for full details including aggregator platforms.

## Conventions

- **Single-file architecture**: All CSS, HTML, and JS in `nomnom-landing.html`. When this moves to a real app, split into components.
- **Bilingual-first**: Every user-facing string needs both VN and EN.
- **Interactive demos**: New features should have working micro-demos, not just description cards.
- **No external dependencies** beyond Google Fonts and Leaflet. Keep it simple.
- **CSS variables everywhere**: Never hardcode colors. Use `var(--xxx)`.
- **Mobile responsive**: Media queries at 768px and 600px breakpoints.

## What to Build Next

### Immediate (MVP App)
- [ ] Convert landing page demos into a real app (React Native / Next.js)
- [ ] Build the Vietnamese cuisine nutrition database (the moat — start with the 58 dishes in recipeDB, expand to 500+)
- [ ] Implement actual voice logging with speech-to-text
- [ ] User auth + profile persistence
- [ ] Real meal tracking with daily/weekly/monthly history

### Medium-term
- [ ] GrabFood Partner API integration (apply for access)
- [ ] Smart ordering with budget caps and macro optimization
- [ ] AI recommendation engine (past orders + nutritional needs + preferences)
- [ ] Group challenges with real multiplayer

### Long-term
- [ ] ShopeeFood partnership
- [ ] B2B restaurant nutrition labeling SaaS
- [ ] Dine-out engine (nearest restaurants matching macro needs)
- [ ] ML-powered regional dish estimation (probability-based nutrition for unknown dishes)
