(function () {
    'use strict';
    var sidebar = document.getElementById('sidebar');
    var mobileBtn = document.getElementById('mobileMenuToggle');
    var main = document.getElementById('mainContent');
    var txtInput = document.getElementById('txtInput'), txtOutput = document.getElementById('txtOutput');
    var outputGroup = document.getElementById('outputGroup');
    var fromBase = document.getElementById('fromBase'), toBase = document.getElementById('toBase');
    var btnGo = document.getElementById('btnGo'), btnClear = document.getElementById('btnClear'), btnSwap = document.getElementById('btnSwap'), btnCopy = document.getElementById('btnCopy');
    var toast = document.getElementById('toast'), toastMsg = document.getElementById('toastMsg');
    var sidebarOpen = false, toastTimer = null, overlayEl = null;

    function getOverlay() { if (!overlayEl) { overlayEl = document.createElement('div'); overlayEl.className = 'sidebar-overlay'; overlayEl.addEventListener('click', closeSidebar); document.body.appendChild(overlayEl); } return overlayEl; }
    function openSidebar() { sidebar.classList.add('open'); getOverlay().classList.add('visible'); sidebarOpen = true; }
    function closeSidebar() { sidebar.classList.remove('open'); getOverlay().classList.remove('visible'); sidebarOpen = false; }
    mobileBtn.addEventListener('click', function () { sidebarOpen ? closeSidebar() : openSidebar(); });
    main.addEventListener('click', function (e) { if (sidebarOpen && window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== mobileBtn) { closeSidebar(); } });

    var DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function digitValue(ch) {
        var code = ch.charCodeAt(0);
        if (code >= 48 && code <= 57) return code - 48;
        if (code >= 65 && code <= 90) return code - 65 + 10;
        if (code >= 97 && code <= 122) return code - 97 + 10;
        return -1;
    }

    function parseBase(str, base) {
        str = str.trim();
        var sign = 1;
        if (str.charAt(0) === '-') { sign = -1; str = str.slice(1); }
        else if (str.charAt(0) === '+') { str = str.slice(1); }
        var dot = str.indexOf('.');
        var intPart = dot === -1 ? str : str.slice(0, dot);
        var fracPart = dot === -1 ? '' : str.slice(dot + 1);
        var value = 0, i, d;
        for (i = 0; i < intPart.length; i++) {
            d = digitValue(intPart.charAt(i));
            if (d < 0 || d >= base) return NaN;
            value = value * base + d;
        }
        var fracNum = 0, fracDen = 1;
        for (i = 0; i < fracPart.length; i++) {
            d = digitValue(fracPart.charAt(i));
            if (d < 0 || d >= base) return NaN;
            fracNum = fracNum * base + d;
            fracDen *= base;
        }
        if (fracDen > 1) value += fracNum / fracDen;
        return sign * value;
    }

    function formatBase(num, base) {
        if (base === 10) return String(num);
        var sign = num < 0 ? '-' : '';
        var x = Math.abs(num);
        var intPart = Math.floor(x);
        var fracPart = x - intPart;
        var intStr = intPart === 0 ? '0' : '';
        while (intPart > 0) {
            intStr = DIGITS.charAt(intPart % base) + intStr;
            intPart = Math.floor(intPart / base);
        }
        var fracStr = '';
        if (fracPart > 0) {
            fracStr = '.';
            for (var i = 0; i < 12 && fracPart > 0; i++) {
                fracPart *= base;
                var digit = Math.floor(fracPart);
                fracStr += DIGITS.charAt(digit);
                fracPart -= digit;
            }
            fracStr = fracStr.replace(/0+$/, '');
            if (fracStr === '.') fracStr = '';
        }
        return sign + intStr + fracStr;
    }

    function convert() {
        var val = txtInput.value.trim();
        if (!val) { outputGroup.style.display = 'none'; return; }
        outputGroup.style.display = 'flex';
        try {
            var from = parseInt(fromBase.value, 10), to = parseInt(toBase.value, 10);
            var parts = val.split(/[\s,]+/).filter(Boolean);
            var results = [];
            for (var i = 0; i < parts.length; i++) {
                var num = parseBase(parts[i], from);
                if (isNaN(num)) { results.push('无效输入'); }
                else { results.push(formatBase(num, to)); }
            }
            txtOutput.value = results.join(' ');
        } catch (e) { txtOutput.value = '转换错误: ' + e.message; }
    }

    btnGo.addEventListener('click', convert);
    txtInput.addEventListener('input', convert);
    fromBase.addEventListener('change', convert);
    toBase.addEventListener('change', convert);

    btnClear.addEventListener('click', function () { txtInput.value = ''; txtOutput.value = ''; outputGroup.style.display = 'none'; });
    btnSwap.addEventListener('click', function () {
        var tmpFrom = fromBase.value, tmpTo = toBase.value;
        fromBase.value = tmpTo; toBase.value = tmpFrom;
        txtInput.value = txtOutput.value; txtOutput.value = '';
        convert();
    });
    btnCopy.addEventListener('click', function () { copyToClipboard(txtOutput.value, '已复制到剪贴板'); });

    function copyToClipboard(text, message) { if (!text) return; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { showToast(message); }); } else { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast(message); } }
    function showToast(msg) { toastMsg.textContent = msg; toast.classList.add('show'); if (toastTimer) clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000); }
})();
