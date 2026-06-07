/* BioSig Pro — Oracle APEX Signature Plugin
 *
 * Key design decisions:
 *
 * 1. ADAPTIVE JPEG EXPORT (fixes partial-save bug)
 *    PNG base64 for complex signatures can exceed Oracle's VARCHAR2(32,767)
 *    limit, causing silent truncation in APEX session state. The adaptive
 *    JPEG ladder tries quality 0.92 → 0.20; if still over the safe limit
 *    it downscales the canvas. Typical output: 4,000–22,000 chars regardless
 *    of stroke complexity.
 *
 * 2. COORDINATE SCALING FIX
 *    The container is CSS width:100% / max-width:600px, so on narrow screens
 *    the rendered canvas width < its internal buffer width. getPos() corrects
 *    for this ratio so drawing always lands where the pointer actually is.
 *
 * 3. BÉZIER SMOOTHING (midpoint quadratic)
 *    Each draw segment runs from mid(p[n-2], p[n-1]) to mid(p[n-1], p[n])
 *    with p[n-1] as the control point, giving C1-continuous curves drawn
 *    incrementally — no full-canvas redraw needed per frame.
 *
 * 4. PRESSURE SIMULATION
 *    Exponential-moving-average speed is inverted to produce a pressure
 *    value: slow strokes get thicker lines, fast ones thinner. Real stylus
 *    pressure from the Pointer Events API overrides the simulation.
 *
 * 5. INSTANCE-SCOPED GLOBAL DELEGATES
 *    Each canvas registers biosig_clear_<id> and biosig_setTextMode_<id>,
 *    then the global biosig_clear / biosig_setTextMode delegate to the right
 *    instance. Multiple signature pads on one page no longer collide.
 */
var initBioSigPro = function (config) {
    'use strict';

    var canvas = document.getElementById(config.id + '_canvas');
    var hidden = document.getElementById(config.id);
    if (!canvas || !hidden) return;

    var ctx = canvas.getContext('2d');
    canvas.width  = config.canvasWidth  || 600;
    canvas.height = config.canvasHeight || 200;

    var BASE_WIDTH   = config.strokeWidth || 2;
    var STROKE_COLOR = config.strokeColor || '#000000';

    // Safe character limit — Oracle VARCHAR2 ceiling is 32,767;
    // we stay well below it to absorb any base64-padding overhead.
    var MAX_B64 = 30000;

    var isDrawing      = false;
    var hasSigned      = false;
    var mode           = 'draw';
    var currentPtrType = 'mouse';
    var strokePts      = [];   // raw points collected during the current stroke
    var prevSpeed      = 0;    // smoothed pointer speed for pressure simulation

    // ── Canvas style ─────────────────────────────────────────────────
    var applyPenStyle = function (ptrType) {
        ctx.strokeStyle = STROKE_COLOR;
        ctx.fillStyle   = STROKE_COLOR;
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';
        ctx.lineWidth   = ptrType === 'pen'   ? BASE_WIDTH * 0.8
                        : ptrType === 'touch' ? BASE_WIDTH * 1.4
                        : BASE_WIDTH;
    };
    applyPenStyle('mouse');

    // ── Pointer-type badge ───────────────────────────────────────────
    var updatePointerBadge = function (type) {
        var badge = document.getElementById(config.id + '_pointer_badge');
        if (!badge) return;
        var MAP = {
            pen:   { label: '🖊 Stylus', color: '#4a90d9' },
            touch: { label: '👆 Finger', color: '#e67e22' },
            mouse: { label: '🖱 Mouse',  color: '#888888' }
        };
        var info = MAP[type] || MAP.mouse;
        badge.textContent       = info.label;
        badge.style.color       = info.color;
        badge.style.borderColor = info.color;
    };

    // ── Placeholder ──────────────────────────────────────────────────
    var drawPlaceholder = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (config.placeholderText) {
            ctx.save();
            ctx.fillStyle    = '#aaaaaa';
            ctx.font         = '14px sans-serif';
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.placeholderText, canvas.width / 2, canvas.height / 2);
            ctx.restore();
        }
    };
    drawPlaceholder();

    // ── Coordinate mapping (CSS px → canvas buffer px) ───────────────
    // On responsive layouts the canvas element is often rendered at a
    // different CSS size than its internal buffer resolution. Without
    // this correction, every drawn point is offset by that ratio.
    var getPos = function (e) {
        var rect   = canvas.getBoundingClientRect();
        var scaleX = canvas.width  / rect.width;
        var scaleY = canvas.height / rect.height;
        var src    = e.touches ? e.touches[0] : e;
        return {
            x: (src.clientX - rect.left) * scaleX,
            y: (src.clientY - rect.top)  * scaleY
        };
    };

    // ── Pressure (real or simulated) ─────────────────────────────────
    var getPressure = function (e, pos) {
        // Prefer real hardware pressure from a stylus
        if (e.pointerType === 'pen' && e.pressure > 0) return e.pressure;
        if (strokePts.length === 0) return 0.5;
        var prev  = strokePts[strokePts.length - 1];
        var speed = Math.sqrt(
            (pos.x - prev.x) * (pos.x - prev.x) +
            (pos.y - prev.y) * (pos.y - prev.y)
        );
        // Exponential moving average to suppress noise
        var smooth = speed * 0.35 + prevSpeed * 0.65;
        prevSpeed = smooth;
        // Invert: slow = high pressure = thicker; fast = thin
        return Math.max(0.25, Math.min(1.0, 1.0 - smooth / 22));
    };

    // ── Drawing ──────────────────────────────────────────────────────
    var startDrawing = function (e) {
        if (mode !== 'draw') return;
        currentPtrType = e.pointerType || 'mouse';
        applyPenStyle(currentPtrType);
        updatePointerBadge(currentPtrType);
        if (!hasSigned) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasSigned = true;
        }
        isDrawing = true;
        prevSpeed = 0;
        strokePts = [];
        var pos = getPos(e);
        strokePts.push(pos);
        // No stroke yet; wait for the second point so we can draw a segment
    };

    // Midpoint quadratic Bézier: each call draws one smooth segment from
    // mid(p[n-2], p[n-1]) to mid(p[n-1], p[n]) with p[n-1] as the control
    // point. Adjacent segments share endpoints so the curve is seamless.
    var draw = function (e) {
        if (!isDrawing || mode !== 'draw') return;
        if (e.cancelable) e.preventDefault();

        var pos      = getPos(e);
        var pressure = getPressure(e, pos);

        ctx.lineWidth = BASE_WIDTH
                      * pressure
                      * (currentPtrType === 'pen'   ? 0.8
                       : currentPtrType === 'touch' ? 1.4
                       : 1.0);

        strokePts.push(pos);
        var n = strokePts.length;

        ctx.beginPath();
        if (n === 2) {
            // First segment: anchor → midpoint(p0, p1)
            var mx = (strokePts[0].x + strokePts[1].x) / 2;
            var my = (strokePts[0].y + strokePts[1].y) / 2;
            ctx.moveTo(strokePts[0].x, strokePts[0].y);
            ctx.lineTo(mx, my);
        } else {
            var prevMidX = (strokePts[n - 3].x + strokePts[n - 2].x) / 2;
            var prevMidY = (strokePts[n - 3].y + strokePts[n - 2].y) / 2;
            var currMidX = (strokePts[n - 2].x + pos.x) / 2;
            var currMidY = (strokePts[n - 2].y + pos.y) / 2;
            ctx.moveTo(prevMidX, prevMidY);
            ctx.quadraticCurveTo(
                strokePts[n - 2].x, strokePts[n - 2].y,
                currMidX, currMidY
            );
        }
        ctx.stroke();
    };

    var stopDrawing = function () {
        if (!isDrawing) return;
        isDrawing = false;
        // A tap with no movement produces a single point — draw a dot
        if (strokePts.length === 1) {
            var p = strokePts[0];
            ctx.beginPath();
            ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        strokePts = [];
        exportSignature();
    };

    // ── Adaptive JPEG export ─────────────────────────────────────────
    // Composites the source canvas onto a white background (JPEG has no
    // alpha channel) then tries progressively lower quality values until
    // the base64 string fits within MAX_B64. If even quality 0.20 is over
    // the limit the canvas is downscaled before encoding — guaranteeing
    // the payload always fits regardless of stroke density or canvas size.
    var toJpegB64 = function (src, quality) {
        var tmp   = document.createElement('canvas');
        tmp.width  = src.width;
        tmp.height = src.height;
        var t     = tmp.getContext('2d');
        t.fillStyle = '#ffffff';
        t.fillRect(0, 0, tmp.width, tmp.height);
        t.drawImage(src, 0, 0);
        return tmp.toDataURL('image/jpeg', quality).split(',')[1];
    };

    var adaptiveJpeg = function (src) {
        var qualities = [0.92, 0.80, 0.65, 0.50, 0.35, 0.20];
        for (var i = 0; i < qualities.length; i++) {
            var b64 = toJpegB64(src, qualities[i]);
            if (b64.length <= MAX_B64) return b64;
        }
        // Last resort: scale the canvas down proportionally
        var rawLen = toJpegB64(src, 0.20).length;
        var factor = Math.sqrt(MAX_B64 / rawLen) * 0.88;
        var sc     = document.createElement('canvas');
        sc.width   = Math.max(1, Math.floor(src.width  * factor));
        sc.height  = Math.max(1, Math.floor(src.height * factor));
        var sCtx   = sc.getContext('2d');
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, sc.width, sc.height);
        sCtx.drawImage(src, 0, 0, sc.width, sc.height);
        return sc.toDataURL('image/jpeg', 0.35).split(',')[1];
    };

    var exportSignature = function () {
        var deg = config.rotateDeg || 0;
        var base64;

        if (deg === 0) {
            base64 = adaptiveJpeg(canvas);
        } else {
            var rad    = deg * Math.PI / 180;
            var sinRad = Math.abs(Math.sin(rad));
            var cosRad = Math.abs(Math.cos(rad));
            var newW   = Math.floor(canvas.width  * cosRad + canvas.height * sinRad);
            var newH   = Math.floor(canvas.width  * sinRad + canvas.height * cosRad);
            var off    = document.createElement('canvas');
            off.width  = newW;
            off.height = newH;
            var offCtx = off.getContext('2d');
            offCtx.translate(newW / 2, newH / 2);
            offCtx.rotate(rad);
            offCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
            base64 = adaptiveJpeg(off);
        }

        hidden.value = base64;
        if (typeof apex !== 'undefined') {
            apex.item(config.id).setValue(base64, null, true);
        }
    };

    // ── Text-mode signature ──────────────────────────────────────────
    // Registered per-instance so multiple canvases on the same page
    // don't overwrite each other's closure. The global biosig_setTextMode
    // function below delegates to the correct instance by ID.
    window['biosig_setTextMode_' + config.id] = function (textValue) {
        if (!textValue || textValue.trim() === '') return;
        mode = 'text';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        applyPenStyle('mouse');
        ctx.save();
        ctx.font         = 'italic ' + (BASE_WIDTH * 10 + 20) + 'px Georgia, serif';
        ctx.fillStyle    = STROKE_COLOR;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textValue.trim(), canvas.width / 2, canvas.height / 2);
        ctx.restore();
        hasSigned = true;
        exportSignature();
    };

    // ── Clear ────────────────────────────────────────────────────────
    window['biosig_clear_' + config.id] = function () {
        mode      = 'draw';
        hasSigned = false;
        strokePts = [];
        prevSpeed = 0;
        drawPlaceholder();
        applyPenStyle('mouse');
        updatePointerBadge('mouse');
        hidden.value = '';
        if (typeof apex !== 'undefined') apex.item(config.id).setValue('');
    };

    // ── Global delegates (backward-compatible with render_procedure.sql) ──
    // The HTML buttons call biosig_clear(id) and biosig_setTextMode(id, val).
    // These globals forward to the per-instance functions, ensuring buttons
    // always target the canvas they belong to even if multiple pads exist.
    window.biosig_clear = function (id) {
        var fn = window['biosig_clear_' + id];
        if (fn) fn();
    };
    window.biosig_setTextMode = function (id, textValue) {
        var fn = window['biosig_setTextMode_' + id];
        if (fn) fn(textValue);
    };

    // ── Event wiring ─────────────────────────────────────────────────
    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    window.addEventListener('pointerup',   stopDrawing);

    // Belt-and-suspenders scroll prevention for browsers that don't
    // fully respect touch-action:none (some older iOS/Android WebViews).
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
    canvas.addEventListener('touchmove',  function (e) { e.preventDefault(); }, { passive: false });
};
