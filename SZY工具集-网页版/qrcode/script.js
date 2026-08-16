(function () {
    'use strict';

    const sidebar   = document.getElementById('sidebar');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const main      = document.getElementById('mainContent');

    const panels = {
        generate: document.getElementById('panelGenerate'),
        decode:   document.getElementById('panelDecode')
    };
    const navBtns = {
        generate: document.getElementById('btnGenerateNav'),
        decode:   document.getElementById('btnDecodeNav')
    };

    const qrInput     = document.getElementById('qrInput');
    const qrCanvas    = document.getElementById('qrCanvas');
    const qrOutputGroup = document.getElementById('qrOutputGroup');
    const qrCharCount   = document.getElementById('qrCharCount');
    const qrEccSelect   = document.getElementById('qrEcc');
    const qrSizeSelect  = document.getElementById('qrSize');

    const decodeFile     = document.getElementById('decodeFile');
    const decodeCanvas   = document.getElementById('decodeCanvas');
    const decodeResult       = document.getElementById('decodeResult');
    const decodeResultGroup  = document.getElementById('decodeResultGroup');
    const decodePlaceholder  = document.getElementById('decodePlaceholder');

    const toast    = document.getElementById('toast');
    const toastMsg = toast ? document.getElementById('toastMsg') : null;

    let curMode     = 'generate';
    let sidebarOpen = false;
    let toastTimer  = null;
    let overlayEl   = null;

    /* ---------- sidebar ---------- */
    function getOverlay() {
        if (!overlayEl) {
            overlayEl = document.createElement('div');
            overlayEl.className = 'sidebar-overlay';
            overlayEl.addEventListener('click', closeSidebar);
            document.body.appendChild(overlayEl);
        }
        return overlayEl;
    }

    function openSidebar() {
        if (!sidebar) return;
        sidebar.classList.add('open');
        getOverlay().classList.add('visible');
        sidebarOpen = true;
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        if (!sidebar) return;
        sidebar.classList.remove('open');
        getOverlay().classList.remove('visible');
        sidebarOpen = false;
        document.body.style.overflow = '';
    }

    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            sidebarOpen ? closeSidebar() : openSidebar();
        });
    }
    if (main) {
        main.addEventListener('click', (e) => {
            if (sidebarOpen && window.innerWidth <= 900
                && !sidebar.contains(e.target)
                && e.target !== mobileBtn
                && !mobileBtn.contains(e.target)) {
                closeSidebar();
            }
        });
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && sidebarOpen) closeSidebar();
    });

    /* ---------- mode switch ---------- */
    function switchMode(m) {
        if (curMode === m) return;
        Object.keys(panels).forEach(k => {
            if (panels[k]) panels[k].style.display = (k === m) ? 'block' : 'none';
        });
        Object.keys(navBtns).forEach(k => {
            if (navBtns[k]) navBtns[k].classList.toggle('active', k === m);
        });
        curMode = m;
    }
    Object.keys(navBtns).forEach(k => {
        if (navBtns[k]) navBtns[k].addEventListener('click', () => switchMode(k));
    });

    /* ---------- toast ---------- */
    function showToast(m) {
        if (!toast || !toastMsg) return;
        if (toastTimer) clearTimeout(toastTimer);
        toastMsg.textContent = m;
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toastTimer = null;
        }, 2200);
    }

    /* ---------- char count ---------- */
    if (qrInput && qrCharCount) {
        qrInput.addEventListener('input', () => {
            qrCharCount.textContent = qrInput.value.length + ' 字符';
        });
    }

    /* ======== QR Generate (via qrcode library CDN) ======== */
    function onGenerate() {
        if (!qrInput || !qrCanvas) return;
        var text = qrInput.value.trim();
        if (!text) { showToast('请输入文本或网址'); return; }
        if (text.length > 4296) { showToast('内容过长，请缩短后重试'); return; }

        var eccLevel   = qrEccSelect ? qrEccSelect.value : 'M';
        var canvasSize = parseInt(qrSizeSelect ? qrSizeSelect.value : '384', 10);

        try {
            QRCode.toCanvas(qrCanvas, text, {
                errorCorrectionLevel: eccLevel,
                width: canvasSize,
                margin: 2,
                color: { dark: '#000000', light: '#ffffff' }
            }, function (err) {
                if (err) {
                    showToast('生成失败：' + (err.message || '未知错误'));
                } else {
                    qrOutputGroup.style.display = 'block';
                }
            });
        } catch (e) {
            showToast('生成失败：' + (e.message || '未知错误'));
        }
    }

    function onClear() {
        if (qrInput) qrInput.value = '';
        if (qrCharCount) qrCharCount.textContent = '0 字符';
        if (qrOutputGroup) qrOutputGroup.style.display = 'none';
    }

    function onDownload() {
        if (!qrCanvas) return;
        var dataUrl = qrCanvas.toDataURL('image/png');
        if (!dataUrl || dataUrl === 'data:,') { showToast('请先生成二维码'); return; }
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'qrcode.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('二维码已下载');
    }

    document.getElementById('btnGenerate').addEventListener('click', onGenerate);
    document.getElementById('btnClear').addEventListener('click', onClear);
    document.getElementById('btnDownload').addEventListener('click', onDownload);

    /* ======== QR Decode ======== */
    function onDecodeFileChange() {
        if (!decodeFile || !decodeFile.files || !decodeFile.files[0]) return;
        var file = decodeFile.files[0];

        if (!file.type.match(/image\/(png|jpeg|gif|webp|bmp)/)) {
            showToast('请选择图片文件（PNG/JPG/GIF/WebP）');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload  = function () { tryDecode(img); };
            img.onerror = function () { showToast('图片加载失败，请检查文件'); };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    if (decodeFile) {
        decodeFile.addEventListener('change', onDecodeFileChange);
    }

    function tryDecode(img) {
        if (!decodeCanvas || !decodeResult || !decodeResultGroup) return;

        var maxSize = 800;
        var w = img.width, h = img.height;
        if (w > maxSize || h > maxSize) {
            var ratio = Math.min(maxSize / w, maxSize / h);
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
        }

        decodeCanvas.width  = w;
        decodeCanvas.height = h;
        var ctx = decodeCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        /* 1) Browser-native BarcodeDetector */
        if (typeof BarcodeDetector !== 'undefined') {
            var detector = new BarcodeDetector({ formats: ['qr_code'] });
            detector.detect(decodeCanvas).then(function (barcodes) {
                if (barcodes.length > 0) {
                    showDecodeResult(barcodes[0].rawValue);
                } else {
                    showDecodeError('未识别到二维码，请确认图片包含清晰的二维码');
                }
            }).catch(function () {
                showDecodeError('解码失败，请重试');
            });
        } else {
            /* fallback: use qrcode lib's own reader (if available)
               or just tell the user to use a modern browser */
            tryQRLibDecode(decodeCanvas, ctx, w, h);
        }
    }

    function tryQRLibDecode(canvas, ctx, w, h) {
        if (typeof jsQR === 'undefined') {
            showDecodeError('当前浏览器不支持二维码识别，请使用 Chrome 88+');
            return;
        }
        var imageData = ctx.getImageData(0, 0, w, h);
        var code = jsQR(imageData.data, w, h);
        if (code) {
            showDecodeResult(code.data);
        } else {
            showDecodeError('未识别到二维码，请确认图片清晰且包含二维码');
        }
    }

    function showDecodeResult(text) {
        if (decodeResult)     decodeResult.textContent = text;
        if (decodeResultGroup) decodeResultGroup.style.display = 'block';
        if (decodePlaceholder) decodePlaceholder.style.display = 'none';
    }

    function showDecodeError(msg) {
        if (decodeResult)     decodeResult.textContent = msg;
        if (decodeResultGroup) decodeResultGroup.style.display = 'block';
        if (decodePlaceholder) decodePlaceholder.style.display = 'none';
    }

})();
