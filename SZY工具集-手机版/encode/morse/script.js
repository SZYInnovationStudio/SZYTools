(function () {
    'use strict';
    var sidebar = document.getElementById('sidebar');
    var mobileBtn = document.getElementById('mobileMenuToggle');
    var main = document.getElementById('mainContent');
    var txtInput = document.getElementById('txtInput'), txtOutput = document.getElementById('txtOutput');
    var outputGroup = document.getElementById('outputGroup'), outputLabel = document.getElementById('outputLabel');
    var charCount = document.getElementById('charCount');
    var btnEncode = document.getElementById('btnEncode'), btnDecode = document.getElementById('btnDecode');
    var btnClear = document.getElementById('btnClear'), btnSwap = document.getElementById('btnSwap'), btnCopy = document.getElementById('btnCopy');
    var toast = document.getElementById('toast'), toastMsg = document.getElementById('toastMsg');

    var curMode = 'encode';
    var sidebarOpen = false, toastTimer = null, overlayEl = null;

    var morseMap = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
        '6': '-....', '7': '--...', '8': '---..', '9': '----.',
        '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.',
        '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
        '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
        ' ': '/'
    };
    var reverseMap = {}; for (var k in morseMap) { reverseMap[morseMap[k]] = k; }

    function getOverlay() { if (!overlayEl) { overlayEl = document.createElement('div'); overlayEl.className = 'sidebar-overlay'; overlayEl.addEventListener('click', closeSidebar); document.body.appendChild(overlayEl); } return overlayEl; }
    function openSidebar() { sidebar.classList.add('open'); getOverlay().classList.add('visible'); sidebarOpen = true; }
    function closeSidebar() { sidebar.classList.remove('open'); getOverlay().classList.remove('visible'); sidebarOpen = false; }
    mobileBtn.addEventListener('click', function () { sidebarOpen ? closeSidebar() : openSidebar(); });
    main.addEventListener('click', function (e) { if (sidebarOpen && window.innerWidth <= 900 && !sidebar.contains(e.target) && e.target !== mobileBtn) { closeSidebar(); } });

    function textToMorse(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            var ch = str[i].toUpperCase();
            result.push(morseMap[ch] !== undefined ? morseMap[ch] : (ch === ' ' ? '/' : ch));
        }
        return result.join(' ');
    }

    function morseToText(str) {
        var words = str.split('/'), result = [];
        for (var i = 0; i < words.length; i++) {
            var codes = words[i].trim().split(/\s+/), word = '';
            for (var j = 0; j < codes.length; j++) { word += reverseMap[codes[j]] || codes[j]; }
            result.push(word);
        }
        return result.join(' ');
    }

    function switchMode(mode) {
        curMode = mode;
        btnEncode.classList.toggle('active', mode === 'encode'); btnDecode.classList.toggle('active', mode === 'decode');
        outputLabel.textContent = mode === 'encode' ? '摩斯电码结果' : '解码结果';
    }

    btnEncode.addEventListener('click', function () { switchMode('encode'); });
    btnDecode.addEventListener('click', function () { switchMode('decode'); });

    txtInput.addEventListener('input', function () { charCount.textContent = txtInput.value.length + ' 字符'; });

    document.getElementById('btnGo').addEventListener('click', function () {
        var val = txtInput.value.trim(); if (!val) { txtInput.style.borderColor = '#fca5a5'; setTimeout(function () { txtInput.style.borderColor = ''; }, 1500); return; }
        outputGroup.style.display = 'flex';
        txtOutput.value = curMode === 'encode' ? textToMorse(val) : morseToText(val);
        outputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    btnClear.addEventListener('click', function () { txtInput.value = ''; txtOutput.value = ''; outputGroup.style.display = 'none'; charCount.textContent = '0 字符'; });
    btnSwap.addEventListener('click', function () { var tmp = txtInput.value; txtInput.value = txtOutput.value; txtOutput.value = tmp; charCount.textContent = txtInput.value.length + ' 字符'; if (txtOutput.value) outputGroup.style.display = 'flex'; });
    btnCopy.addEventListener('click', function () { copyToClipboard(txtOutput.value, '已复制到剪贴板'); });

    function copyToClipboard(text, message) { if (!text) return; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(function () { showToast(message); }); } else { var ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast(message); } }
    function showToast(msg) { toastMsg.textContent = msg; toast.classList.add('show'); if (toastTimer) clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000); }
})();
