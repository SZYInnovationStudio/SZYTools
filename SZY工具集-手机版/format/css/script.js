(function () {
    'use strict';
    var sb = document.getElementById('sidebar'), mb = document.getElementById('mobileMenuToggle'), mc = document.getElementById('mainContent');
    var inp = document.getElementById('txtInput'), out = document.getElementById('txtOutput');
    var og = document.getElementById('outputGroup'), cc = document.getElementById('charCount'), occ = document.getElementById('outputCharCount');
    var bf = document.getElementById('btnFormat'), bc = document.getElementById('btnClear'), bd = document.getElementById('btnDemo'), bcp = document.getElementById('btnCopy');
    var iso = document.getElementById('indentSize');
    var toast = document.getElementById('toast'), tm = document.getElementById('toastMsg');
    var so = false, tt = null, ov = null;
    function go() { if (!ov) { ov = document.createElement('div'); ov.className = 'sidebar-overlay'; ov.addEventListener('click', cs); document.body.appendChild(ov); } return ov; }
    function os() { sb.classList.add('open'); go().classList.add('visible'); so = true; }
    function cs() { sb.classList.remove('open'); go().classList.remove('visible'); so = false; }
    mb.addEventListener('click', function () { so ? cs() : os(); });
    mc.addEventListener('click', function (e) { if (so && window.innerWidth <= 900 && !sb.contains(e.target) && e.target !== mb) cs(); });
    inp.addEventListener('input', function () { cc.textContent = inp.value.length + ' 字符'; });
    bf.addEventListener('click', function () {
        var v = inp.value.trim(); if (!v) { inp.style.borderColor = '#fca5a5'; setTimeout(function () { inp.style.borderColor = ''; }, 1500); return; }
        try { var o = { indent_size: parseInt(iso.value), indent_char: ' ' }; var r = (typeof css_beautify !== 'undefined') ? css_beautify(v, o) : v; out.value = r; og.style.display = 'flex'; occ.textContent = r.length + ' 字符'; }
        catch (e) { out.value = '格式化失败: ' + e.message; og.style.display = 'flex'; occ.textContent = '0 字符'; }
        og.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    bc.addEventListener('click', function () { inp.value = ''; out.value = ''; og.style.display = 'none'; cc.textContent = '0 字符'; });
    bd.addEventListener('click', function () { inp.value = 'body{font-family:Arial,sans-serif;margin:0;padding:0}h1{color:#333;font-size:2rem}p{line-height:1.6;color:#666}'; cc.textContent = inp.value.length + ' 字符'; });
    bcp.addEventListener('click', function () { cp(out.value, '已复制到剪贴板'); });
    function cp(t, m) { if (!t) return; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(function () { st(m); }); } else { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px;'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); st(m); } }
    function st(m) { tm.textContent = m; toast.classList.add('show'); if (tt) clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 2000); }
})();
