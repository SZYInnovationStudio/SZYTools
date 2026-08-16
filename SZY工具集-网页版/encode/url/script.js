(function () {
    'use strict';

    var sidebar = document.getElementById('sidebar');
    var mobileBtn = document.getElementById('mobileMenuToggle');
    var main = document.getElementById('mainContent');

    var txtInput = document.getElementById('txtInput');
    var txtOutput = document.getElementById('txtOutput');
    var outputGroup = document.getElementById('outputGroup');
    var outputLabel = document.getElementById('outputLabel');
    var charCount = document.getElementById('charCount');
    var btnGo = document.getElementById('btnGo');
    var btnGoLabel = document.getElementById('btnGoLabel');
    var btnClear = document.getElementById('btnClear');
    var btnSwap = document.getElementById('btnSwap');
    var btnCopy = document.getElementById('btnCopy');
    var infoSubtitle = document.getElementById('infoSubtitle');
    var btnEncode = document.getElementById('btnEncode');
    var btnDecode = document.getElementById('btnDecode');

    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toastMsg');

    var curMode = 'encode';
    var sidebarOpen = false;
    var toastTimer = null;
    var overlayEl = null;

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
        sidebar.classList.add('open');
        getOverlay().classList.add('visible');
        sidebarOpen = true;
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        getOverlay().classList.remove('visible');
        sidebarOpen = false;
    }

    mobileBtn.addEventListener('click', function () { sidebarOpen ? closeSidebar() : openSidebar(); });

    main.addEventListener('click', function (e) {
        if (sidebarOpen && window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== mobileBtn) { closeSidebar(); }
    });

    function switchMode(mode) {
        curMode = mode;
        btnEncode.classList.toggle('active', mode === 'encode');
        btnDecode.classList.toggle('active', mode === 'decode');
        if (mode === 'encode') {
            btnGoLabel.textContent = '编码';
            outputLabel.textContent = '编码结果';
            infoSubtitle.textContent = '对URL参数进行编码，使用 encodeURIComponent 标准';
        } else {
            btnGoLabel.textContent = '解码';
            outputLabel.textContent = '解码结果';
            infoSubtitle.textContent = '对URL参数字符串进行解码，使用 decodeURIComponent 标准';
        }
        processText();
    }

    btnEncode.addEventListener('click', function () { switchMode('encode'); });
    btnDecode.addEventListener('click', function () { switchMode('decode'); });

    function processText() {
        var val = txtInput.value;
        if (!val) { outputGroup.style.display = 'none'; return; }
        outputGroup.style.display = 'flex';
        try {
            if (curMode === 'encode') {
                txtOutput.value = encodeURIComponent(val);
            } else {
                txtOutput.value = decodeURIComponent(val);
            }
        } catch (e) {
            txtOutput.value = '输入有误，解码失败: ' + e.message;
        }
    }

    txtInput.addEventListener('input', function () {
        charCount.textContent = txtInput.value.length + ' 字符';
        processText();
    });

    btnGo.addEventListener('click', function () {
        if (!txtInput.value.trim()) {
            txtInput.style.borderColor = '#fca5a5';
            setTimeout(function () { txtInput.style.borderColor = ''; }, 1500);
            return;
        }
        processText();
        outputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    btnClear.addEventListener('click', function () {
        txtInput.value = '';
        txtOutput.value = '';
        outputGroup.style.display = 'none';
        charCount.textContent = '0 字符';
    });

    btnSwap.addEventListener('click', function () {
        var tmp = txtInput.value;
        txtInput.value = txtOutput.value;
        txtOutput.value = tmp;
        charCount.textContent = txtInput.value.length + ' 字符';
        if (txtOutput.value) { outputGroup.style.display = 'flex'; }
    });

    btnCopy.addEventListener('click', function () { copyToClipboard(txtOutput.value, '已复制到剪贴板'); });

    function copyToClipboard(text, message) {
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { showToast(message); });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast(message);
        }
    }

    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
    }
})();
