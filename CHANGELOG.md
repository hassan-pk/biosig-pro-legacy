# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-07

### Fixed
- **Partial save / corrupt image (critical)** — PNG base64 for complex signatures silently exceeded Oracle's VARCHAR2(32,767) character limit in APEX session state, truncating the payload before the PL/SQL submit process ran. Replaced with adaptive JPEG export that tries quality 0.92 → 0.20 and downscales the canvas as a last resort, guaranteeing the output is always ≤ 30,000 characters regardless of stroke density or canvas size.
- **Drawing offset on mobile / responsive layouts** — `getPos()` returned raw CSS pixel coordinates without correcting for the mismatch between the CSS-rendered canvas size and its internal buffer resolution. On a 375 px phone with a 600 px canvas buffer, every drawn point landed at the wrong position. Fixed with `scaleX`/`scaleY` correction factors derived from `getBoundingClientRect`.
- **Multi-instance collision** — `biosig_clear` and `biosig_setTextMode` were global functions redefined by each `initBioSigPro()` call, so both always closed over the last-initialised canvas. Two pads on the same page would both be controlled by the second instance. Fixed with per-instance `biosig_clear_<id>` / `biosig_setTextMode_<id>` functions; the globals now delegate to the correct instance by ID.
- **Single-tap dot not rendered** — A tap with no pointer movement never fired `draw()`, leaving no visible mark. `stopDrawing` now renders a filled circle when only one point was recorded.
- **Silent PL/SQL errors** — `apex_web_service.clobbase642blob()` failures had no `EXCEPTION` handler, so invalid base64 failed silently with no feedback. Added `apex_error.add_error()` in the `EXCEPTION` block so errors surface as inline APEX notifications.

### Added
- **Bézier stroke smoothing** — Replaced `lineTo` with midpoint quadratic Bézier curves. Each segment runs from `mid(p[n-2], p[n-1])` to `mid(p[n-1], p[n])` with `p[n-1]` as the control point, producing C1-continuous curves drawn incrementally without any full-canvas redraw per frame.
- **Pressure simulation** — Pointer speed is smoothed with an exponential moving average and inverted to a pressure value (slow strokes → thicker, fast strokes → thinner). Real hardware pressure from a stylus via the Pointer Events API overrides the simulation automatically.

### Changed
- Export format changed from **PNG to JPEG** with a white background composite. JPEG at quality 0.92 reduces typical signature payloads from 40–130 KB base64 down to 4–15 KB, staying well within Oracle's VARCHAR2 limit. The MIME type stored in the `uploads` table is now `image/jpeg` and filenames use the `.jpg` extension.

### Migration notes
- If your downstream pipeline expects PNG blobs (e.g. a viewer that checks MIME type), update it to accept `image/jpeg`.
- No APEX plugin attribute changes are required; existing installations upgrade by replacing the JS file and re-running the updated submit process SQL.

## [1.0.0] - 2026-01-01

### Added
- Initial production release of **BioSig Pro** for Oracle APEX.
- Signature drawing support for mouse, stylus, and finger input.
- Pointer-type awareness with automatic stroke-width adjustments by device type.
- Text signature mode to render typed names in a cursive style.
- Rotation export support to rotate generated PNG signatures by configurable degrees.
- Transparent PNG export pipeline for clean overlays on any background.
- Configurable plugin attributes for canvas size, pen style, rotation, text mode, and placeholder text.
- Defensive submit process pattern to avoid empty and invalid base64 uploads.
- Mobile-first pointer-event handling for robust touch and stylus behavior.
- Professional repository documentation, issue templates, and installation/configuration guides.

[2.0.0]: https://github.com/hassan-pk/biosig-pro/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/hassan-pk/biosig-pro/releases/tag/v1.0.0
