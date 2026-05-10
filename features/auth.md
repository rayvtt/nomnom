# Auth

**Status:** 🟡 Partial — local-only auth scaffolding; Supabase wiring deferred.

## Purpose
Lets a user sign up / sign in so their tracking data, profile, gamification, and Smart Order config persist to *their* account, not just to this browser.

## Current state (this branch)
- Sign-up / sign-in / sign-out modal triggered by the navbar avatar button.
- User record (`{id, email, name, createdAt}`) stored in `localStorage` under key `nomnom.auth.user`.
- "Password" field is **not** verified server-side — this is a local stub. Anyone with the same email becomes that user. ⚠️ Do NOT ship to production without real auth.
- Auth state drives:
  - Navbar avatar (initials when logged in, generic icon when logged out)
  - Profile module's saved BMI/TDEE values are namespaced per user
  - Tracking state, gamification state, setup wizard state are namespaced per user

## File locations in `/index.html`
- **HTML:** auth modal `<div id="authModal">` — search for `id="authModal"`
- **CSS:** `.auth-modal`, `.auth-form`, `.nav-avatar` — search for `.auth-modal`
- **JS:** `// AUTH SYSTEM` section — search for that comment

## State model
```js
// localStorage key: 'nomnom.auth.user'
{ id: string, email: string, name: string, createdAt: ISO8601 }

// In-memory mirror
let currentUser = null; // null when logged out
```

## Per-user namespaced storage
All persisted state uses `nomnom.<userId>.<key>`. When logged out, uses `nomnom.guest.<key>`. See [persistence.md](./persistence.md).

## TODO
- [ ] Wire to Supabase Auth (replace `localStorage` user record). See `auth.md` "Migration to Supabase" section below.
- [ ] Real password hashing (bcrypt via Supabase) — current "password" field is purely cosmetic.
- [ ] Email verification flow.
- [ ] Password reset.
- [ ] Social sign-in (Google, Apple — common in Vietnam).
- [ ] On sign-in: pull saved state from backend and merge with localStorage (last-write-wins).
- [ ] Session expiry / refresh tokens.
- [ ] Account deletion (GDPR / Vietnam PDPL compliance).

## Migration to Supabase (when ready)
1. Create a Supabase project. Enable Email provider in Auth settings.
2. Add to `<head>`:
   ```html
   <script type="module">
     import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
     window.supabase = createClient(
       'https://<PROJECT>.supabase.co',
       '<ANON_KEY>'
     );
   </script>
   ```
3. Replace local sign-up/sign-in handlers with `supabase.auth.signUp` / `signInWithPassword`.
4. Subscribe to `supabase.auth.onAuthStateChange` and update `currentUser` in memory.
5. Create a `profiles` table keyed by `auth.uid()` and migrate per-user state into it.
6. Keep `localStorage` as offline cache; sync up on reconnect.

## Dependencies
- [persistence.md](./persistence.md) — namespacing scheme for per-user data
- [tracking.md](./tracking.md), [setup-wizard.md](./setup-wizard.md), [gamification.md](./gamification.md) — consumers of `currentUser`
