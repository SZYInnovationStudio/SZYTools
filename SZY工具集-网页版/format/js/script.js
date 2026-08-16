(function () {
    'use strict';
    var sidebar = document.getElementById('sidebar'), mobileBtn = document.getElementById('mobileMenuToggle'), main = document.getElementById('mainContent');
    var txtInput = document.getElementById('txtInput'), txtOutput = document.getElementById('txtOutput');
    var outputGroup = document.getElementById('outputGroup'), charCount = document.getElementById('charCount'), outputCharCount = document.getElementById('outputCharCount');
    var btnFormat = document.getElementById('btnFormat'), btnClear = document.getElementById('btnClear'), btnDemo = document.getElementById('btnDemo'), btnCopy = document.getElementById('btnCopy');
    var indentSize = document.getElementById('indentSize');
    var toast = document.getElementById('toast'), toastMsg = document.getElementById('toastMsg');
    var sidebarOpen = false, toastTimer = null, overlayEl = null;

    function getOverlay() { if (!overlayEl) { overlayEl = document.createElement('div'); overlayEl.className = 'sidebar-overlay'; overlayEl.addEventListener('click', closeSidebar); document.body.appendChild(overlayEl); } return overlayEl; }
    function openSidebar() { sidebar.classList.add('open'); getOverlay().classList.add('visible'); sidebarOpen = true; }
    function closeSidebar() { sidebar.classList.remove('open'); getOverlay().classList.remove('visible'); sidebarOpen = false; }
    mobileBtn.addEventListener('click', function () { sidebarOpen ? closeSidebar() : openSidebar(); });
    main.addEventListener('click', function (e) { if (sidebarOpen && window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== mobileBtn) { closeSidebar(); } });

    txtInput.addEventListener('input', function () { charCount.textContent = txtInput.value.length + ' 字符'; });

    btnFormat.addEventListener('click', function () {
        var val = txtInput.value.trim();
        if (!val) { txtInput.style.borderColor = '#fca5a5'; setTimeout(function () { txtInput.style.borderColor = ''; }, 1500); return; }
        try {
            var opts = { indent_size: parseInt(indentSize.value), indent_char: ' ', max_preserve_newlines: 2, preserve_newlines: true, space_in_empty_paren: false, jslint_happy: false, brace_style: 'collapse', break_chained_methods: false };
            var result = (typeof js_beautify !== 'undefined') ? js_beautify(val, opts) : window.js_beautify ? window.js_beautify(val, opts) : val;
            txtOutput.value = result;
            outputGroup.style.display = 'flex';
            outputCharCount.textContent = result.length + ' 字符';
        } catch (e) {
            txtOutput.value = '格式化失败: ' + e.message + '\n\n请检查代码语法是否正确。';
            outputGroup.style.display = 'flex';
            outputCharCount.textContent = '0 字符';
        }
        outputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    btnClear.addEventListener('click', function () { txtInput.value = ''; txtOutput.value = ''; outputGroup.style.display = 'none'; charCount.textContent = '0 字符'; });
    btnDemo.addEventListener('click', function () { txtInput.value = 'function hello(name){var x=1;if(x>0){console.log("Hello, "+name+"!");}return {name:name,value:x};}'; charCount.textContent = txtInput.value.length + ' 字符'; });
    btnCopy.addEventListener('click', function () { copyToClipboard(txtOutput.value, '已复制到剪贴板'); });

    function copyToClipboard(text, message) { if (!text) return; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { showToast(message); }); } else { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast(message); } }
    function showToast(msg) { toastMsg.textContent = msg; toast.classList.add('show'); if (toastTimer) clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000); }
})();
