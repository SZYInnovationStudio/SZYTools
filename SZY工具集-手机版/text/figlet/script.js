(function () {
    'use strict';

    var sb = document.getElementById('sidebar');
    var mb = document.getElementById('mobileMenuToggle');
    var mc = document.getElementById('mainContent');
    var inp = document.getElementById('txtInput');
    var out = document.getElementById('txtOutput');
    var og = document.getElementById('outputGroup');
    var cc = document.getElementById('charCount');
    var bc = document.getElementById('btnClear');
    var bcp = document.getElementById('btnCopy');
    var bf = document.getElementById('btnFormat');
    var t = document.getElementById('toast');
    var tm = document.getElementById('toastMsg');
    var so = false;
    var tt = null;
    var ov = null;

    var font = {
        'A': [' _ ', '/ \\', '|_|'],
        'B': [' _ ', '|_)', '|_)'],
        'C': [' __', '/ _', '\\__'],
        'D': [' __', '|  \\', '|__/'],
        'E': ['___', '|__', '|__'],
        'F': ['___', '|__', '|'],
        'G': [' __', '/ _', '\\_/'],
        'H': ['_  _', '|__|', '|  |'],
        'I': ['___', ' | ', '_|_'],
        'J': ['__ ', '  |', '__|'],
        'K': ['_  _', '|_/', '| \\_'],
        'L': ['_  ', '|  ', '|__'],
        'M': ['_   _', '|\\ /|', '| \\_/|'],
        'N': ['_  _', '|\\ |', '| \\|'],
        'O': [' __', '/  \\', '\\__/'],
        'P': ['___', '|__)', '|'],
        'Q': [' __', '/  \\', '\\__/'],
        'R': ['___', '|__)', '| \\'],
        'S': ['____', '|__', '___|'],
        'T': ['___', ' | ', ' | '],
        'U': ['_  _', '|  |', '|__|'],
        'V': ['_  _', '|  |', '\\__/'],
        'W': ['_      _', '\\ \\ /\\ / /', ' \\_/  \\_/'],
        'X': ['_  _', '\\ \\/ /', '/_/\\_\\'],
        'Y': ['_   _', '\\_/ ', ' | '],
        'Z': ['____', '  _/', ' /_'],
        ' ': ['   ', '   ', '   ']
    };

    var style = document.createElement('style');
    style.textContent = '.figlet-char{display:inline-block;white-space:pre;font-family:monospace;font-size:0.85rem;line-height:1;margin:0 2px;vertical-align:bottom;}';
    document.head.appendChild(style);

    function overlay() {
        if (!ov) {
            ov = document.createElement('div');
            ov.className = 'sidebar-overlay';
            ov.addEventListener('click', closeSidebar);
            document.body.appendChild(ov);
        }
        return ov;
    }
    function openSidebar() {
        sb.classList.add('open');
        overlay().classList.add('visible');
        so = true;
    }
    function closeSidebar() {
        sb.classList.remove('open');
        overlay().classList.remove('visible');
        so = false;
    }

    mb.addEventListener('click', function () {
        so ? closeSidebar() : openSidebar();
    });
    mc.addEventListener('click', function (e) {
        if (so && window.innerWidth <= 900 && !sb.contains(e.target) && e.target !== mb) {
            closeSidebar();
        }
    });

    bf.addEventListener('click', function () {
        var v = inp.value.toUpperCase();
        if (!v.trim()) {
            inp.style.borderColor = '#fca5a5';
            setTimeout(function () { inp.style.borderColor = ''; }, 1500);
            return;
        }
        var spans = [];
        var lines = ['', '', ''];
        for (var i = 0; i < v.length; i++) {
            var glyph = font[v[i]] || font[' '];
            spans.push('<span class="figlet-char">' + glyph.map(function (ln) {
                return ln.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }).join('<br>') + '</span>');
            for (var r = 0; r < 3; r++) {
                lines[r] += glyph[r];
            }
        }
        out.innerHTML = '<div style="line-height:1;white-space:nowrap;overflow-x:auto;">' + spans.join('') + '</div>';
        out.setAttribute('data-text', lines.join('\n'));
        og.style.display = 'flex';
        og.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    inp.addEventListener('input', function () {
        cc.textContent = inp.value.length + ' 字符';
    });

    bc.addEventListener('click', function () {
        inp.value = '';
        out.innerHTML = '';
        out.removeAttribute('data-text');
        og.style.display = 'none';
        cc.textContent = '0 字符';
    });

    bcp.addEventListener('click', function () {
        var text = out.getAttribute('data-text') || '';
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () { toast('已复制到剪贴板'); });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            toast('已复制到剪贴板');
        }
    });

    function toast(msg) {
        tm.textContent = msg;
        t.classList.add('show');
        if (tt) clearTimeout(tt);
        tt = setTimeout(function () { t.classList.remove('show'); }, 2000);
    }
})();
