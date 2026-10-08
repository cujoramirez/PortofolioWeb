# Headless measurement tools (raw CDP, no dependencies)

Copied out of a session scratchpad on 2026-09-25. Serve a build first
(`npx vite build --outDir /tmp/pf-dist && npx vite preview --outDir /tmp/pf-dist --port 4173`),
then run from this folder:

- `node shot.mjs <url> <outPrefix> [--w 1440] [--h 900] [--scheme dark|light] [--reduced] [--scrolls 0,900] [--dpr 2] [--wait 2500] [--eval "js"]`
  screenshots at scroll offsets (`#id+60` scrolls to an element). Add `?tier=high` to the URL:
  headless Chrome uses SwiftShader and would otherwise be detected as a low-tier device.
- `node perf.mjs <url> [--desktop] [--runs 3]` LCP, CLS, transferred bytes, long tasks,
  idle requestAnimationFrame count (should be 0 on an idle page) on a slow-4G phone preset.
- `node shot-safari.mjs <url> <outPrefix> [--w] [--h] [--theme dark|light] [--scrolls ...] [--eval] [--each]`:
  **real Safari** through `safaridriver` (WebDriver), the only tool here that shows Safari's CSS 3D.
  One-time setup: Safari > Settings > Advanced > "Show features for web developers", then
  Developer > "Allow remote automation", and `safaridriver --enable` (asks for the Mac password).
  safaridriver can only drive a Safari it launches itself: the owner's Safari must be quit first
  ("Safari was not launched for automation" in `log show` otherwise). Color scheme and reduced motion
  follow macOS. Safari's default page zoom (115 % here) shrinks the CSS viewport: the log prints
  `[innerWidth, innerHeight, devicePixelRatio]`. Headless Chrome also stalls on View Transitions
  (the theme toggle); test theme switching with `--reduced`.

- `node film.mjs <url> <outPrefix> [--w] [--h] [--mobile] [--eval "setup"] --act "js" [--times 0,300,600] [--slow 0.25]`:
  frames after an action (e.g. opening the menu). `--slow` scales GSAP time via `window.__gsap` (dev only).
  Headless frames are slow to capture and GSAP's lag smoothing stretches animations, so read frames as a
  sequence, not exact times.

- `node shot-webkit.mjs <url> <outPrefix> [same options]`: the Safari engine via Playwright's WebKit
  (`npx playwright-core install webkit` once). Good for layout, text, masks, background-clip and dialogs.
  Caveat: its screenshots flatten `transform-style: preserve-3d` (even headed), so judge 3D depth in
  Chrome (`shot.mjs`) or real Safari, not here.
- `node idle-scroll.mjs <url> [--mobile]`: rAF count over 2.5 s, 1 s after scrolling settles (should be 0).
- `node cls.mjs <url> [--desktop]`: layout-shift sources.
- `node budget.mjs [--out <dir>] [--no-build] [--limit 125] [--sum "label=regex:limitKB"]`: builds, then
  prints gzip sizes of the first-load chunks, every lazy chunk and the HTML. Exits 1 over a limit.
- `node perf.mjs <url> --actions [--desktop]`: scripted interactions (hover, globe drag, project dialog,
  menu sheet on the phone preset, theme toggle, search). After each one: the 2.5 s idle window, starting
  1 s after the last input, and the interaction's INP with its three phases, under 4x CPU throttle.
- `node perf.mjs <url> --scroll [--desktop]`: one full-page scroll gesture: frame-interval percentiles and
  the ten longest animation frames with their top script and forced style/layout time.
  Both modes need `?tier=high` and run on the Mac's GPU; `--software` forces SwiftShader, where a
  dialog's backdrop blur alone takes about 500 ms to present.
- `node pins.mjs <url> [--w] [--h] [--mobile] [--dead]`: page height, each section's height and pinned
  distance. `--dead` steps through every pinned stretch (0.1 viewport heights) and lists runs where the
  picture does not change; the second strip shows how much changed at each step.

The newer tools share `cdp.mjs`. It turns on focus emulation: without it a CDP Escape key press makes
the headless page `hidden`, no frame is produced afterwards, and every idle check reads a false 0.

Every script launches Chrome through `chrome-guard.mjs`, which kills it on any exit, including a
SIGKILL of the parent. An orphaned SwiftShader Chrome once ran for 27 minutes at 2+ cores.
Check with `pgrep -f remote-debugging-port` after runs.
