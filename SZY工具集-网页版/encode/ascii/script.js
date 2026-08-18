(function () {
    'use strict';
    var sidebar = document.getElementById('sidebar');
    var mobileBtn = document.getElementById('mobileMenuToggle');
    var main = document.getElementById('mainContent');
    var txtInput = document.getElementById('txtInput'), txtOutput = document.getElementById('txtOutput');
    var outputGroup = document.getElementById('outputGroup'), outputLabel = document.getElementById('outputLabel');
    var charCount = document.getElementById('charCount');
    var btnToAscii = document.getElementById('btnToAscii'), btnToChar = document.getElementById('btnToChar');
    var btnClear = document.getElementById('btnClear'), btnSwap = document.getElementById('btnSwap'), btnCopy = document.getElementById('btnCopy');
    var toast = document.getElementById('toast'), toastMsg = document.getElementById('toastMsg');

    var sidebarOpen = false, toastTimer = null, overlayEl = null;
    function getOverlay() { if (!overlayEl) { overlayEl = document.createElement('div'); overlayEl.className = 'sidebar-overlay'; overlayEl.addEventListener('click', closeSidebar); document.body.appendChild(overlayEl); } return overlayEl; }
    function openSidebar() { sidebar.classList.add('open'); getOverlay().classList.add('visible'); sidebarOpen = true; }
    function closeSidebar() { sidebar.classList.remove('open'); getOverlay().classList.remove('visible'); sidebarOpen = false; }
    mobileBtn.addEventListener('click', function () { sidebarOpen ? closeSidebar() : openSidebar(); });
    main.addEventListener('click', function (e) { if (sidebarOpen && window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== mobileBtn) { closeSidebar(); } });

    function charsToAscii(text) {
        var lines = text.split('\n'), result = [];
        for (var i = 0; i < lines.length; i++) {
            var chars = lines[i].split('');
            var codes = [];
            for (var j = 0; j < chars.length; j++) { codes.push('0x' + chars[j].charCodeAt(0).toString(16).toUpperCase().padStart(2, '0') + '(' + chars[j].charCodeAt(0) + ')'); }
            result.push(codes.join(' '));
        }
        return result.join('\n');
    }

    function asciiToChars(text) {
        var tokens = text.match(/0x[0-9a-fA-F]+|\d+/g) || [];
        var result = [];
        var line = [];
        for (var i = 0; i < tokens.length; i++) {
            var code = tokens[i].startsWith('0x') ? parseInt(tokens[i], 16) : parseInt(tokens[i], 10);
            if (!isNaN(code) && code >= 0 && code <= 65535) { line.push(String.fromCharCode(code)); }
        }
        return line.join('');
    }

    function doToAscii() {
        var val = txtInput.value; if (!val) return;
        outputGroup.style.display = 'flex'; outputLabel.textContent = 'ASCII码结果';
        txtOutput.value = charsToAscii(val);
        outputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function doToChar() {
        var val = txtInput.value; if (!val) return;
        outputGroup.style.display = 'flex'; outputLabel.textContent = '字符结果';
        txtOutput.value = asciiToChars(val);
        outputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    txtInput.addEventListener('input', function () { charCount.textContent = txtInput.value.length + ' 字符'; });
    btnToAscii.addEventListener('click', doToAscii); btnToChar.addEventListener('click', doToChar);
    var btnToAsciiMain = document.getElementById('btnToAsciiMain'), btnToCharMain = document.getElementById('btnToCharMain');
    btnToAsciiMain.addEventListener('click', doToAscii); btnToCharMain.addEventListener('click', doToChar);
    btnClear.addEventListener('click', function () { txtInput.value = ''; txtOutput.value = ''; outputGroup.style.display = 'none'; charCount.textContent = '0 字符'; });
    btnSwap.addEventListener('click', function () { var tmp = txtInput.value; txtInput.value = txtOutput.value; txtOutput.value = tmp; charCount.textContent = txtInput.value.length + ' 字符'; if (txtOutput.value) outputGroup.style.display = 'flex'; });
    btnCopy.addEventListener('click', function () { copyToClipboard(txtOutput.value, '已复制到剪贴板'); });

    function copyToClipboard(text, message) { if (!text) return; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { showToast(message); }); } else { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast(message); } }
    function showToast(msg) { toastMsg.textContent = msg; toast.classList.add('show'); if (toastTimer) clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000); }
})();
