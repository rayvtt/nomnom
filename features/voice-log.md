# Voice Log

**Status:** ⚪ Static demo — no real STT yet.

## Purpose
Show the killer-feature ergonomic: tap microphone, say "I just ate phở bò and a chè ba màu," NomNom auto-logs both meals.

## Current state
- Click microphone → typewriter animates a fake voice transcript
- AI parsing animation cycles through phrases: "Detecting dishes...", "Looking up nutrition...", "Calculating macros..."
- No real microphone access, no STT, no actual mutation of `trkState`

## File locations in `/index.html`
- **HTML:** lines 2267–2295 (`<section id="voice">`)
- **JS:** `// 3. VOICE LOG INTERACTIVE` near line 3329

## TODO
- [ ] Real `navigator.mediaDevices.getUserMedia` mic access.
- [ ] Web Speech API for STT (Chrome/Safari support varies on Vietnamese).
- [ ] Backend STT fallback (Whisper API or Google Cloud Speech for Vietnamese).
- [ ] Vietnamese tone-aware parsing for dish names (`phở bò` ≠ `phơ bò`).
- [ ] LLM call to extract `[{dish, portion}]` from transcript.
- [ ] Map detected dishes to `recipeDB` entries → mutate `trkState` via tracking module.
- [ ] Fallback: show "Did you mean…?" disambiguation UI.
- [ ] Localized prompts ("Bạn đã ăn gì?" / "What did you eat?").
- [ ] Mobile-first: large mic button, push-to-talk gesture.

## Dependencies
- [tracking.md](./tracking.md) — endpoint for the parsed result.
- [recipe-hub.md](./recipe-hub.md) — `recipeDB` is the dish catalog to match against.
