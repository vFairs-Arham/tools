(() => {
    // ── State ──────────────────────────────────────────────────────────────────
    const state = {
        mode: null,   // 'bg' | 'convert' | 'resize' | 'rotate' | 'padding' | 'radius'
        files: [],    // { id, file, status, originalUrl, processedBlob, processedUrl }
        nextId: 0,
        bgType: 'solid',
        gradDir: 'to right',
        rotateAngle: 0,
        flipMode: 'none',
        radiusPreset: 'circle',
        bgImageFile: null,
        resizeMode: 'dimensions',
    };

    const MODES = {
        bg: { icon: '🎨', title: 'Add Background', desc: 'Add a solid color, gradient, or image behind transparent PNGs', accept: 'image/png' },
        convert: { icon: '🔄', title: 'Convert Format', desc: 'Convert images between PNG, JPEG, and WebP formats', accept: 'image/*' },
        resize: { icon: '↔️', title: 'Resize Image', desc: 'Scale to exact dimensions or a percentage', accept: 'image/*' },
        rotate: { icon: '🔃', title: 'Rotate & Flip', desc: 'Rotate 90°/180° or flip horizontally and vertically', accept: 'image/*' },
        padding: { icon: '⬜', title: 'Add Padding', desc: 'Expand the canvas with colored whitespace around the image', accept: 'image/*' },
        radius: { icon: '⭕', title: 'Border Radius / Shape', desc: 'Round corners or make a perfect circle — outputs transparent PNG', accept: 'image/*' },
    };

    // ── DOM refs ───────────────────────────────────────────────────────────────
    const screenPicker = document.getElementById('screen-picker');
    const screenTool = document.getElementById('screen-tool');
    const navTitle = document.getElementById('nav-title');
    const modeHeaderIcon = document.getElementById('mode-header-icon');
    const modeHeaderTitle = document.getElementById('mode-header-title');
    const modeHeaderDesc = document.getElementById('mode-header-desc');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const dropLabel = document.getElementById('drop-label');
    const actionBar = document.getElementById('action-bar');
    const cardsGrid = document.getElementById('cards-grid');
    const btnProcessAll = document.getElementById('btn-process-all');
    const btnDownloadAll = document.getElementById('btn-download-all');
    const btnClear = document.getElementById('btn-clear');
    const progressLabel = document.getElementById('progress-label');
    const progressCount = document.getElementById('progress-count');
    const progressBar = document.getElementById('global-progress-bar');

    // ── Mode navigation ────────────────────────────────────────────────────────
    window.enterMode = function (mode) {
        state.mode = mode;
        state.files = [];
        state.nextId = 0;
        cardsGrid.innerHTML = '';
        actionBar.classList.add('hidden');
        updateProgress();

        const m = MODES[mode];
        modeHeaderIcon.textContent = m.icon;
        modeHeaderTitle.textContent = m.title;
        modeHeaderDesc.textContent = m.desc;
        navTitle.textContent = m.title;
        fileInput.accept = m.accept;
        dropLabel.textContent = mode === 'bg' ? 'Drop PNG files here' : 'Drop image files here';

        // Show correct settings panel
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`settings-${mode}`).classList.add('active');

        screenPicker.classList.remove('active');
        screenTool.classList.add('active');
    };

    window.exitMode = function () {
        state.mode = null;
        navTitle.textContent = 'Image Tools';
        screenTool.classList.remove('active');
        screenPicker.classList.add('active');
    };

    // ── Settings: BG type ──────────────────────────────────────────────────────
    window.setBgType = function (type) {
        state.bgType = type;
        setActiveBtn('bg-type-group', type === 'solid' ? 0 : type === 'gradient' ? 1 : 2);
        document.getElementById('bg-solid-opts').classList.toggle('hidden', type !== 'solid');
        document.getElementById('bg-gradient-opts').classList.toggle('hidden', type !== 'gradient');
        document.getElementById('bg-image-opts').classList.toggle('hidden', type !== 'image');
    };

    // ── Settings: Gradient ─────────────────────────────────────────────────────
    window.setGradDir = function (dir) {
        state.gradDir = dir;
        setActiveBtn('grad-dir-group', dir === 'to right' ? 0 : dir === 'to bottom' ? 1 : 2);
        updateGradPreview();
    };

    function updateGradPreview() {
        const c1 = document.getElementById('grad-color1').value;
        const c2 = document.getElementById('grad-color2').value;
        document.getElementById('grad-preview').style.background = `linear-gradient(${state.gradDir}, ${c1}, ${c2})`;
    }

    ['grad-color1', 'grad-color2'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            const hexId = id === 'grad-color1' ? 'grad-hex1' : 'grad-hex2';
            document.getElementById(hexId).value = e.target.value;
            updateGradPreview();
        });
    });
    ['grad-hex1', 'grad-hex2'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                const pickId = id === 'grad-hex1' ? 'grad-color1' : 'grad-color2';
                document.getElementById(pickId).value = e.target.value;
                updateGradPreview();
            }
        });
    });
    updateGradPreview();

    // BG image upload
    document.getElementById('bg-image-input').addEventListener('change', e => {
        state.bgImageFile = e.target.files[0] || null;
    });

    // ── Settings: BG color sync ────────────────────────────────────────────────
    const bgColor = document.getElementById('bg-color');
    const bgHex = document.getElementById('bg-color-hex');
    bgColor.addEventListener('input', () => { bgHex.value = bgColor.value; });
    bgHex.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(bgHex.value)) bgColor.value = bgHex.value; });

    // Padding color sync
    const padColor = document.getElementById('pad-color');
    const padHex = document.getElementById('pad-color-hex');
    padColor.addEventListener('input', () => { padHex.value = padColor.value; });
    padHex.addEventListener('input', () => { if (/^#[0-9a-fA-F]{6}$/.test(padHex.value)) padColor.value = padHex.value; });

    // Quality labels
    [['bg-quality', 'bg-quality-label'], ['conv-quality', 'conv-quality-label'],
    ['resize-quality', 'resize-quality-label'], ['rotate-quality', 'rotate-quality-label'],
    ['pad-quality', 'pad-quality-label']].forEach(([sid, lid]) => {
        const s = document.getElementById(sid), l = document.getElementById(lid);
        s.addEventListener('input', () => { l.textContent = s.value + '%'; });
    });

    // ── Settings: Resize mode ──────────────────────────────────────────────────
    window.setResizeMode = function (mode) {
        state.resizeMode = mode;
        setActiveBtn('resize-mode-group', mode === 'dimensions' ? 0 : 1);
        document.getElementById('resize-dims-opts').classList.toggle('hidden', mode !== 'dimensions');
        document.getElementById('resize-pct-opts').classList.toggle('hidden', mode !== 'percent');
    };

    // Aspect ratio lock
    const resizeW = document.getElementById('resize-w');
    const resizeH = document.getElementById('resize-h');
    let _lastW = null, _lastH = null;
    resizeW.addEventListener('input', () => {
        if (!document.getElementById('resize-lock').checked) return;
        if (_lastW && _lastH && resizeW.value) {
            resizeH.value = Math.round(resizeW.value * _lastH / _lastW) || '';
        }
    });
    resizeH.addEventListener('input', () => {
        if (!document.getElementById('resize-lock').checked) return;
        if (_lastW && _lastH && resizeH.value) {
            resizeW.value = Math.round(resizeH.value * _lastW / _lastH) || '';
        }
    });

    // ── Settings: Rotate ──────────────────────────────────────────────────────
    window.setRotate = function (angle) {
        state.rotateAngle = angle;
        setActiveBtn('rotate-group', [0, 90, 180, 270].indexOf(angle));
    };
    window.setFlip = function (flip) {
        state.flipMode = flip;
        setActiveBtn('flip-group', flip === 'none' ? 0 : flip === 'h' ? 1 : 2);
    };

    // ── Settings: Radius ──────────────────────────────────────────────────────
    window.setRadiusPreset = function (preset) {
        state.radiusPreset = preset;
        setActiveBtn('radius-preset-group', preset === 'circle' ? 0 : preset === 'rounded' ? 1 : 2);
        document.getElementById('radius-rounded-opts').classList.toggle('hidden', preset !== 'rounded');
        document.getElementById('radius-custom-opts').classList.toggle('hidden', preset !== 'custom');
    };
    document.getElementById('radius-slider').addEventListener('input', e => {
        document.getElementById('radius-label').textContent = e.target.value + '%';
    });

    // ── Helper: set active button in a btn-group ───────────────────────────────
    function setActiveBtn(groupId, idx) {
        const btns = document.getElementById(groupId).querySelectorAll('button');
        btns.forEach((b, i) => b.classList.toggle('active', i === idx));
    }

    // ── Drop zone ──────────────────────────────────────────────────────────────
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const accepted = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
        addFiles(state.mode === 'bg' ? accepted.filter(f => f.type === 'image/png') : accepted);
    });
    fileInput.addEventListener('change', () => { addFiles([...fileInput.files]); fileInput.value = ''; });

    // ── Add files ──────────────────────────────────────────────────────────────
    function addFiles(files) {
        if (!files.length) return;
        files.forEach(file => {
            const id = state.nextId++;
            const originalUrl = URL.createObjectURL(file);
            state.files.push({ id, file, status: 'pending', originalUrl, processedBlob: null, processedUrl: null });
            renderCard({ id, file, originalUrl });
        });
        actionBar.classList.remove('hidden');
        updateProgress();
        // Capture original dimensions for aspect ratio lock
        if (state.mode === 'resize' && files.length > 0) {
            const img = new Image();
            img.onload = () => { _lastW = img.naturalWidth; _lastH = img.naturalHeight; };
            img.src = URL.createObjectURL(files[0]);
        }
    }

    // ── Render card ────────────────────────────────────────────────────────────
    function renderCard(entry) {
        const card = document.createElement('div');
        card.className = 'img-card bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden';
        card.id = `card-${entry.id}`;
        card.innerHTML = `
        <div class="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0 text-sm">🖼️</div>
                <span class="text-sm font-semibold text-slate-800 truncate" title="${entry.file.name}">${entry.file.name}</span>
                <span class="text-xs text-slate-400 flex-shrink-0">${formatBytes(entry.file.size)}</span>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <span id="badge-${entry.id}" class="status-badge status-pending">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span> Pending
                </span>
                <button id="btn-process-${entry.id}"
                    class="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg transition-colors"
                    onclick="window._processOne(${entry.id})">
                    Process
                </button>
                <button id="btn-dl-${entry.id}" disabled
                    class="text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed text-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
                    onclick="window._downloadOne(${entry.id})">
                    ↓ Save
                </button>
                <button class="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
                    onclick="window._removeCard(${entry.id})" title="Remove">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        </div>
        <div class="p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Input</p>
                    <div class="checker rounded-xl border border-slate-100 flex items-center justify-center" style="height:200px;">
                        <img src="${entry.originalUrl}" alt="Input" style="max-width:100%;max-height:200px;object-fit:contain;">
                    </div>
                </div>
                <div>
                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Output</p>
                    <div id="after-${entry.id}" class="checker rounded-xl border border-slate-100 flex items-center justify-center" style="height:200px;">
                        <span class="text-sm text-slate-300 italic">Not processed yet</span>
                    </div>
                </div>
            </div>
        </div>`;
        cardsGrid.appendChild(card);
    }

    // ── Process one ────────────────────────────────────────────────────────────
    window._processOne = async function (id) {
        const entry = state.files.find(f => f.id === id);
        if (!entry || entry.status === 'done') return;
        setBadge(id, 'processing');
        document.getElementById(`btn-process-${id}`).disabled = true;
        try {
            const blob = await processImage(entry.file);
            entry.processedBlob = blob;
            entry.processedUrl = URL.createObjectURL(blob);
            entry.status = 'done';
            const afterDiv = document.getElementById(`after-${id}`);
            afterDiv.innerHTML = `<img src="${entry.processedUrl}" alt="Output" style="max-width:100%;max-height:200px;object-fit:contain;">`;
            setBadge(id, 'done');
            document.getElementById(`btn-dl-${id}`).disabled = false;
        } catch (err) {
            entry.status = 'error';
            setBadge(id, 'error');
            console.error(err);
        }
        updateProgress();
    };

    // ── Download one ───────────────────────────────────────────────────────────
    window._downloadOne = function (id) {
        const entry = state.files.find(f => f.id === id);
        if (!entry || !entry.processedBlob) return;
        const ext = getOutputExt();
        const a = document.createElement('a');
        a.href = entry.processedUrl;
        a.download = entry.file.name.replace(/\.[^.]+$/, '') + '_out.' + ext;
        a.click();
    };

    // ── Remove card ────────────────────────────────────────────────────────────
    window._removeCard = function (id) {
        state.files = state.files.filter(f => f.id !== id);
        document.getElementById(`card-${id}`)?.remove();
        if (!state.files.length) actionBar.classList.add('hidden');
        updateProgress();
    };

    // ── Process all ────────────────────────────────────────────────────────────
    btnProcessAll.addEventListener('click', async () => {
        btnProcessAll.disabled = true;
        for (const entry of state.files.filter(f => f.status === 'pending')) {
            await window._processOne(entry.id);
        }
        btnProcessAll.disabled = false;
    });

    // ── Download ZIP ───────────────────────────────────────────────────────────
    btnDownloadAll.addEventListener('click', async () => {
        const done = state.files.filter(f => f.status === 'done');
        if (!done.length) return;
        btnDownloadAll.textContent = 'Zipping…';
        btnDownloadAll.disabled = true;
        const zip = new JSZip();
        const ext = getOutputExt();
        done.forEach(entry => {
            zip.file(entry.file.name.replace(/\.[^.]+$/, '') + '_out.' + ext, entry.processedBlob);
        });
        const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'processed_images.zip';
        a.click();
        btnDownloadAll.innerHTML = '⬇ Download ZIP';
        btnDownloadAll.disabled = false;
    });

    // ── Clear ──────────────────────────────────────────────────────────────────
    btnClear.addEventListener('click', () => {
        state.files = [];
        state.nextId = 0;
        cardsGrid.innerHTML = '';
        actionBar.classList.add('hidden');
        updateProgress();
    });

    // ── Core: process image by mode ────────────────────────────────────────────
    function processImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = async () => {
                URL.revokeObjectURL(url);
                try {
                    let blob;
                    switch (state.mode) {
                        case 'bg': blob = await processBg(img); break;
                        case 'convert': blob = await processConvert(img); break;
                        case 'resize': blob = await processResize(img); break;
                        case 'rotate': blob = await processRotate(img); break;
                        case 'padding': blob = await processPadding(img); break;
                        case 'radius': blob = await processRadius(img); break;
                        default: throw new Error('Unknown mode');
                    }
                    resolve(blob);
                } catch (e) { reject(e); }
            };
            img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
            img.src = url;
        });
    }

    // ── BG ─────────────────────────────────────────────────────────────────────
    async function processBg(img) {
        const canvas = makeCanvas(img.naturalWidth, img.naturalHeight);
        const ctx = canvas.getContext('2d');
        if (state.bgType === 'solid') {
            ctx.fillStyle = bgColor.value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (state.bgType === 'gradient') {
            const c1 = document.getElementById('grad-color1').value;
            const c2 = document.getElementById('grad-color2').value;
            let grd;
            if (state.gradDir === 'to right') {
                grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
            } else if (state.gradDir === 'to bottom') {
                grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
            } else {
                grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            }
            grd.addColorStop(0, c1);
            grd.addColorStop(1, c2);
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (state.bgType === 'image' && state.bgImageFile) {
            await new Promise((res, rej) => {
                const bgImg = new Image();
                const bgUrl = URL.createObjectURL(state.bgImageFile);
                bgImg.onload = () => { ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(bgUrl); res(); };
                bgImg.onerror = rej;
                bgImg.src = bgUrl;
            });
        }
        ctx.drawImage(img, 0, 0);
        return canvasToBlob(canvas, 'bg-format', 'bg-quality');
    }

    // ── Convert ────────────────────────────────────────────────────────────────
    function processConvert(img) {
        const canvas = makeCanvas(img.naturalWidth, img.naturalHeight);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return canvasToBlob(canvas, 'conv-format', 'conv-quality');
    }

    // ── Resize ─────────────────────────────────────────────────────────────────
    function processResize(img) {
        let w = img.naturalWidth, h = img.naturalHeight;
        if (state.resizeMode === 'percent') {
            const pct = parseFloat(document.getElementById('resize-pct').value) / 100;
            w = Math.round(w * pct);
            h = Math.round(h * pct);
        } else {
            const rw = parseInt(document.getElementById('resize-w').value);
            const rh = parseInt(document.getElementById('resize-h').value);
            const lock = document.getElementById('resize-lock').checked;
            if (rw && rh) { w = rw; h = rh; }
            else if (rw) { w = rw; if (lock) h = Math.round(rw * img.naturalHeight / img.naturalWidth); }
            else if (rh) { h = rh; if (lock) w = Math.round(rh * img.naturalWidth / img.naturalHeight); }
        }
        w = Math.max(1, w); h = Math.max(1, h);
        const canvas = makeCanvas(w, h);
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        return canvasToBlob(canvas, 'resize-format', 'resize-quality');
    }

    // ── Rotate & Flip ──────────────────────────────────────────────────────────
    function processRotate(img) {
        const angle = state.rotateAngle;
        const flip = state.flipMode;
        const sw = img.naturalWidth, sh = img.naturalHeight;
        const rotated = angle === 90 || angle === 270;
        const cw = rotated ? sh : sw;
        const ch = rotated ? sw : sh;
        const canvas = makeCanvas(cw, ch);
        const ctx = canvas.getContext('2d');
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate((angle * Math.PI) / 180);
        if (flip === 'h') ctx.scale(-1, 1);
        if (flip === 'v') ctx.scale(1, -1);
        ctx.drawImage(img, -sw / 2, -sh / 2);
        return canvasToBlob(canvas, 'rotate-format', 'rotate-quality');
    }

    // ── Padding ────────────────────────────────────────────────────────────────
    function processPadding(img) {
        const top = parseInt(document.getElementById('pad-top').value) || 0;
        const right = parseInt(document.getElementById('pad-right').value) || 0;
        const bottom = parseInt(document.getElementById('pad-bottom').value) || 0;
        const left = parseInt(document.getElementById('pad-left').value) || 0;
        const color = padColor.value;
        const cw = img.naturalWidth + left + right;
        const ch = img.naturalHeight + top + bottom;
        const canvas = makeCanvas(cw, ch);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, left, top);
        return canvasToBlob(canvas, 'pad-format', 'pad-quality');
    }

    // ── Border Radius ──────────────────────────────────────────────────────────
    function processRadius(img) {
        const w = img.naturalWidth, h = img.naturalHeight;
        const canvas = makeCanvas(w, h);
        const ctx = canvas.getContext('2d');

        // Optional background fill
        if (document.getElementById('radius-fill-enable').checked) {
            ctx.fillStyle = document.getElementById('radius-fill-color').value;
            ctx.fillRect(0, 0, w, h);
        }

        // Clipping path
        ctx.save();
        ctx.beginPath();
        if (state.radiusPreset === 'circle') {
            const r = Math.min(w, h) / 2;
            ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
        } else if (state.radiusPreset === 'rounded') {
            const pct = parseInt(document.getElementById('radius-slider').value) / 100;
            const r = Math.min(w, h) * pct;
            roundRect(ctx, 0, 0, w, h, r);
        } else {
            const tl = parseInt(document.getElementById('rad-tl').value) || 0;
            const tr = parseInt(document.getElementById('rad-tr').value) || 0;
            const br = parseInt(document.getElementById('rad-br').value) || 0;
            const bl = parseInt(document.getElementById('rad-bl').value) || 0;
            roundRect(ctx, 0, 0, w, h, { tl, tr, br, bl });
        }
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        ctx.restore();

        // Always PNG for transparency
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png');
        });
    }

    function roundRect(ctx, x, y, w, h, r) {
        let tl, tr, br, bl;
        if (typeof r === 'number') { tl = tr = br = bl = r; }
        else { tl = r.tl; tr = r.tr; br = r.br; bl = r.bl; }
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + w - tr, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
        ctx.lineTo(x + w, y + h - br);
        ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        ctx.lineTo(x + bl, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
        ctx.lineTo(x, y + tl);
        ctx.quadraticCurveTo(x, y, x + tl, y);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    function makeCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        return c;
    }

    function canvasToBlob(canvas, formatId, qualityId) {
        const fmt = document.getElementById(formatId).value;
        const q = parseInt(document.getElementById(qualityId).value) / 100;
        return new Promise((resolve, reject) => {
            canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), fmt, q);
        });
    }

    function getOutputExt() {
        const fmtMap = { bg: 'bg-format', convert: 'conv-format', resize: 'resize-format', rotate: 'rotate-format', padding: 'pad-format', radius: null };
        if (state.mode === 'radius') return 'png';
        const el = document.getElementById(fmtMap[state.mode]);
        return el ? el.value.split('/')[1] : 'png';
    }

    function setBadge(id, status) {
        const badge = document.getElementById(`badge-${id}`);
        if (!badge) return;
        const map = {
            pending: { cls: 'status-pending', dot: 'bg-amber-400', label: 'Pending' },
            processing: { cls: 'status-pending', dot: 'bg-indigo-400 animate-pulse', label: 'Processing…' },
            done: { cls: 'status-done', dot: 'bg-emerald-500', label: 'Done' },
            error: { cls: 'status-error', dot: 'bg-red-500', label: 'Error' },
        };
        const m = map[status] || map.pending;
        badge.className = `status-badge ${m.cls}`;
        badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${m.dot} inline-block"></span> ${m.label}`;
    }

    function updateProgress() {
        const total = state.files.length;
        const done = state.files.filter(f => f.status === 'done').length;
        progressCount.textContent = `${done} / ${total}`;
        progressBar.style.width = total ? (done / total * 100) + '%' : '0%';
        progressLabel.textContent = done === total && total > 0 ? 'All done!' : `${total - done} image(s) pending`;
        btnDownloadAll.disabled = done === 0;
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
})();
