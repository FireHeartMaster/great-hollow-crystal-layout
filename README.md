# Great Hollow Crystal Layout

A static, mobile-first Elden Ring Nightreign crystal-layout identifier. No framework, build process, dependency, CDN, server, or internet connection is needed to open the downloaded site locally.

## How to use

1. Open `index.html` directly in a browser (or upload all files to a GitHub Pages repository).
2. When you **see a crystal** at a map location, tap/click that crystal cluster. You may also focus it with Tab and press Enter or Space.
3. The page retains only layouts that contain every selected location. Tap a selected location to undo it; the layout possibilities are recalculated from the remaining selections.
4. Use **Reset selections** to start a new match.

A location being empty in your match is **not** a selection.

Layout A = Purple, B = Blue, C = Red, D = Green. Each layout contains eight locations. There are 21 distinct locations overall: 15 on the surface and 6 underground. Yellow asterisks indicate surface locations unique to one layout.

## Offline use and publishing

- **Local:** Keep `index.html`, `styles.css`, `app.js`, `sw.js`, and `assets/` together. Open `index.html` without an internet connection.
- **GitHub Pages:** Upload the entire folder's *contents* to the selected Pages publishing directory. All paths are relative, so project sites (in a subdirectory) are supported. A service worker automatically caches the static resources after an online visit so later visits can work offline, subject to the browser retaining the cache. Service workers do not run under `file://`, and are not required there.

On phones and portrait tablets, the map begins immediately under a sticky compact toolbar showing the current layout status and a reset icon. Instructions, legend, and asterisk explanation follow the map; the wider desktop layout retains the sidebar. Both reset controls have the accessible name **Reset crystal selections**.

The interactive SVG has a fixed `viewBox="0 0 887 1774"`; all 21 cluster coordinates, image sizes, offset order, and identification star centers use the supplied reconstruction data. The **clean** composite map (without crystals baked into it) is the SVG background.

## Presence and absence observations

- Tap a crystal position to mark that a crystal **is present** there (blue check).
- Hold a position for about **550 ms** to mark it **empty** (red X).
- Tap either kind of marked position to clear the observation. A hold also switches a present mark to empty.
- Moving to scroll cancels a pending hold; holding does not also register a tap.
- All observations filter the possible layouts. Inconsistent observations produce a no-match state without discarding marks.
- Keyboard: Enter or Space to mark present/clear a mark, X to mark empty/clear an empty mark.
- Reset removes both kinds of observation.
