var initBioSigPro = function(config) {
    const canvas = document.getElementById(config.id + '_canvas');
    const hidden = document.getElementById(config.id);
    if (!canvas || !hidden) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let hasSigned = false;
    let mode = 'draw';
    let currentPointerType = 'mouse';

    canvas.width  = config.canvasWidth  || 600;
    canvas.height = config.canvasHeight || 200;

    const applyPenStyle = (pointerType) => {
        ctx.strokeStyle = config.strokeColor || '#000000';
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';
        if (pointerType === 'pen') {
            ctx.lineWidth = (config.strokeWidth || 2) * 0.8;
        } else if (pointerType === 'touch') {
            ctx.lineWidth = (config.strokeWidth || 2) * 1.4;
        } else {
            ctx.lineWidth = config.strokeWidth || 2;
        }
    };
    applyPenStyle('mouse');

    const updatePointerBadge = (type) => {
        const badge = document.getElementById(config.id + '_pointer_badge');
        if (!badge) return;
        const map = {
            pen:   { label: '🖊 Stylus', color: '#4a90d9' },
            touch: { label: '👆 Finger', color: '#e67e22' },
            mouse: { label: '🖱 Mouse',  color: '#888888' }
        };
        const info = map[type] || map['mouse'];
        badge.textContent       = info.label;
        badge.style.color       = info.color;
        badge.style.borderColor = info.color;
    };

    const drawPlaceholder = () => {
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

    const getPos = (e) => {
        const rect    = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e) => {
        if (mode !== 'draw') return;
        currentPointerType = e.pointerType || 'mouse';
        applyPenStyle(currentPointerType);
        updatePointerBadge(currentPointerType);
        if (!hasSigned) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hasSigned = true;
        }
        isDrawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
        if (!isDrawing || mode !== 'draw') return;
        if (e.cancelable) e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        isDrawing = false;
        exportSignature();
    };

    // Composite the source canvas onto a white background and export as JPEG.
    // PNG base64 for complex signatures can exceed 32,767 chars (Oracle VARCHAR2
    // limit), causing silent truncation. JPEG at quality 0.92 stays well under
    // that limit for any realistic signature while keeping visual fidelity.
    const canvasToJpegBase64 = (src) => {
        const quality = config.imageQuality || 0.92;
        const tmp = document.createElement('canvas');
        tmp.width  = src.width;
        tmp.height = src.height;
        const tmpCtx = tmp.getContext('2d');
        tmpCtx.fillStyle = '#ffffff';
        tmpCtx.fillRect(0, 0, tmp.width, tmp.height);
        tmpCtx.drawImage(src, 0, 0);
        return tmp.toDataURL('image/jpeg', quality).split(',')[1];
    };

    const exportSignature = () => {
        const deg = config.rotateDeg || 0;
        let base64;
        if (deg === 0) {
            base64 = canvasToJpegBase64(canvas);
        } else {
            const rad  = deg * Math.PI / 180;
            const sin  = Math.abs(Math.sin(rad));
            const cos  = Math.abs(Math.cos(rad));
            const newW = Math.floor(canvas.width * cos + canvas.height * sin);
            const newH = Math.floor(canvas.width * sin + canvas.height * cos);
            const off    = document.createElement('canvas');
            off.width    = newW;
            off.height   = newH;
            const offCtx = off.getContext('2d');
            offCtx.translate(newW / 2, newH / 2);
            offCtx.rotate(rad);
            offCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
            base64 = canvasToJpegBase64(off);
        }
        hidden.value = base64;
        if (typeof apex !== 'undefined') {
            apex.item(config.id).setValue(base64, null, true);
        }
    };

    window.biosig_setTextMode = function(id, textValue) {
        if (!textValue || textValue.trim() === '') return;
        mode = 'text';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        applyPenStyle('mouse');
        ctx.save();
        ctx.font         = 'italic ' + ((config.strokeWidth || 2) * 10 + 20) + 'px Georgia, serif';
        ctx.fillStyle    = config.strokeColor || '#000000';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textValue.trim(), canvas.width / 2, canvas.height / 2);
        ctx.restore();
        hasSigned = true;
        exportSignature();
    };

    window.biosig_clear = function(id) {
        mode      = 'draw';
        hasSigned = false;
        drawPlaceholder();
        applyPenStyle('mouse');
        updatePointerBadge('mouse');
        hidden.value = '';
        if (typeof apex !== 'undefined') apex.item(id).setValue('');
    };

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    window.addEventListener('pointerup',   stopDrawing);
};
