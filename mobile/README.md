# Cloudflare Pages build shim (temporary)

The Cloudflare Pages project `nomnom` is configured for the Expo app on branch
`claude/setup-cloud-sync-6TBjC`:

    build command:  cd mobile && npm install && npx expo export --platform web --clear
    output dir:     mobile/dist

Branches without that Expo app (main, feature branches) fail at `cd mobile`.
This folder provides a stand-in `expo` binary (`static-build/cli.js`) that
copies `index.html`, `log/` and `_headers` into `mobile/dist`, so those
branches get working preview deployments. `functions/` at the repo root is
still compiled by Pages.

Remove this folder once the project's build command is made branch-aware, e.g.:

    if [ -d mobile/app ] ...  # or a per-branch build setup / separate Pages project

Do not merge this folder into a branch that contains the real Expo app.
