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
    var btnEncode2 = document.getElementById('btnEncode2');
    var btnDecode2 = document.getElementById('btnDecode2');
    var btnEncode = document.getElementById('btnEncode');
    var btnDecode = document.getElementById('btnDecode');
    var btnClear = document.getElementById('btnClear');
    var btnSwap = document.getElementById('btnSwap');
    var btnCopy = document.getElementById('btnCopy');

    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toastMsg');

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

    function openSidebar() { sidebar.classList.add('open'); getOverlay().classList.add('visible'); sidebarOpen = true; }
    function closeSidebar() { sidebar.classList.remove('open'); getOverlay().classList.remove('visible'); sidebarOpen = false; }

    mobileBtn.addEventListener('click', function () { sidebarOpen ? closeSidebar() : openSidebar(); });

    main.addEventListener('click', function (e) {
        if (sidebarOpen && window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== mobileBtn) { closeSidebar(); }
    });

    function htmlEncode(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function htmlDecode(str) {
        var div = document.createElement('div');
        div.innerHTML = str;
        return div.textContent || div.innerText || '';
    }

    function doEncode() {
        var val = txtInput.value;
        if (!val) return;
        outputGroup.style.display = 'flex';
        outputLabel.textContent = '编码结果';
        txtOutput.value = htmlEncode(val);
        outputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function doDecode() {
        var val = txtInput.value;
        if (!val) return;
        outputGroup.style.display = 'flex';
        outputLabel.textContent = '解码结果';
        txtOutput.value = htmlDecode(val);
        outputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    txtInput.addEventListener('input', function () { charCount.textContent = txtInput.value.length + ' 字符'; });

    btnEncode2.addEventListener('click', doEncode);
    btnDecode2.addEventListener('click', doDecode);
    btnEncode.addEventListener('click', doEncode);
    btnDecode.addEventListener('click', doDecode);

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
            ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;';
            document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
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
