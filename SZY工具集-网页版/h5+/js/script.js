(function () {
    'use strict';

    const sidebar   = document.getElementById('sidebar');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const main      = document.getElementById('mainContent');

    const panels = {
        format:    document.getElementById('panelFormat'),
        validate:  document.getElementById('panelValidate'),
        obfuscate: document.getElementById('panelObfuscate'),
        encrypt:   document.getElementById('panelEncrypt')
    };

    const navBtns = {
        format:    document.getElementById('btnFormat'),
        validate:  document.getElementById('btnValidate'),
        obfuscate: document.getElementById('btnObfuscate'),
        encrypt:   document.getElementById('btnEncrypt')
    };

    const jsInput           = document.getElementById('jsInput');
    const formatOutput      = document.getElementById('formatOutput');
    const formatOutputGroup = document.getElementById('formatOutputGroup');
    const formatCharCount   = document.getElementById('formatCharCount');

    const jsValidateInput    = document.getElementById('jsValidateInput');
    const validateOutput      = document.getElementById('validateOutput');
    const validateOutputGroup = document.getElementById('validateOutputGroup');

    const jsObInput    = document.getElementById('jsObInput');
    const obOutput     = document.getElementById('obOutput');
    const obOutputGroup = document.getElementById('obOutputGroup');
    const obCharCount  = document.getElementById('obCharCount');

    const jsEncInput    = document.getElementById('jsEncInput');
    const encOutput     = document.getElementById('encOutput');
    const encOutputGroup = document.getElementById('encOutputGroup');

    const toast    = document.getElementById('toast');
    const toastMsg = toast ? document.getElementById('toastMsg') : null;

    let curMode     = 'format';
    let sidebarOpen = false;
    let toastTimer  = null;
    let overlayEl   = null;

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
        if (!sidebar) { return; }
        sidebar.classList.add('open');
        getOverlay().classList.add('visible');
        sidebarOpen = true;
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!sidebar) { return; }
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
        if (window.innerWidth > 900 && sidebarOpen) { closeSidebar(); }
    });

    function switchMode(m) {
        if (curMode === m) { return; }
        Object.keys(panels).forEach((k) => {
            if (!panels[k]) { return; }
            panels[k].style.display = (k === m) ? 'block' : 'none';
        });
        Object.keys(navBtns).forEach((k) => {
            if (!navBtns[k]) { return; }
            navBtns[k].classList.toggle('active', k === m);
        });
        curMode = m;
    }

    Object.keys(navBtns).forEach((k) => {
        if (!navBtns[k]) { return; }
        navBtns[k].addEventListener('click', () => { switchMode(k); });
    });

    function copyText(text, msg) {
        if (!text) { return; }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => { showToast(msg); })
                .catch(() => { fallbackCopy(text, msg); });
        } else {
            fallbackCopy(text, msg);
        }
    }

    function fallbackCopy(text, msg) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast(msg);
        } catch (err) {
            showToast('复制失败，请手动选择复制');
        }
        document.body.removeChild(ta);
    }

    function showToast(m) {
        if (!toast || !toastMsg) { return; }
        if (toastTimer) { clearTimeout(toastTimer); }
        toastMsg.textContent = m;
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toastTimer = null;
        }, 2200);
    }

    function isIdentChar(ch) {
        return /[a-zA-Z0-9_$]/.test(ch);
    }

    function formatJs(js) {
        const comments = [];
        js = js.replace(/(\/\*[\s\S]*?\*\/|\/\/[^\n]*)/g, (m) => {
            comments.push(m);
            return '/*__C' + (comments.length - 1) + '__*/';
        });

        const TAB = '  ';
        let result = '';
        let indent = 0;
        let i      = 0;
        const n    = js.length;

        let inString   = false;
        let strChar    = '';
        let inTemplate = false;

        const newline = () => {
            result += '\n' + TAB.repeat(indent);
        };

        while (i < n) {
            const ch = js[i];

            if (inString) {
                result += ch;
                if (ch === strChar && js[i - 1] !== '\\') { inString = false; }
                i++;
                continue;
            }
            if (inTemplate) {
                result += ch;
                if (ch === '`' && js[i - 1] !== '\\') { inTemplate = false; }
                i++;
                continue;
            }

            if (ch === '"' || ch === "'" || ch === '`') {
                if (ch === '`') { inTemplate = true; }
                else            { inString = true; strChar = ch; }
                result += ch;
                i++;
                continue;
            }

            if (ch === '{') {
                result += ' {\n';
                indent++;
                newline();
                i++;
                continue;
            }

            if (ch === '}') {
                indent = Math.max(0, indent - 1);
                newline();
                result += '}';
                i++;
                continue;
            }

            if (ch === ';') {
                result += ';';
                newline();
                i++;
                continue;
            }

            if (ch === ',') {
                result += ', ';
                i++;
                continue;
            }

            if (ch === '\n' || ch === '\r') {
                newline();
                while (i < n && (js[i] === '\n' || js[i] === '\r' || js[i] === ' ' || js[i] === '\t')) { i++; }
                continue;
            }

            if (ch === ' ' || ch === '\t') {
                const lastCh = result.slice(-1);
                const needSpace = isIdentChar(lastCh);

                while (i < n && (js[i] === ' ' || js[i] === '\t')) { i++; }
                if (needSpace && i < n && isIdentChar(js[i])) { result += ' '; }
                continue;
            }

            if (ch === '.' && result.slice(-1) === ')') {
                newline();
                result += TAB + '.';
                i++;
                continue;
            }

            if (ch === '+' || ch === '|' || ch === '&' || ch === '?' || ch === ':') {
                if (ch === ':' && result.slice(-1) !== '?') {
                    result += ': ';
                } else if (ch === '?' || ch === ':') {
                    result += ' ' + ch + ' ';
                } else {
                    result += ' ' + ch + ' ';
                }
                i++;
                continue;
            }

            result += ch;
            i++;
        }

        result = result.replace(
            /\b(if|for|while)\s*\([^)]*\)\s+[^{;\n][^;]*;/g,
            (match) => {
                const parts = match.match(/\b(if|for|while)(\s*\([^)]*\))\s+([^;]+;)/);
                if (!parts) { return match; }
                return parts[1] + parts[2] + ' {\n  ' + parts[3].trim() + '\n}';
            }
        );

        result = result.replace(
            /(^|\n)(\s*)(function\s+(\w+)\s*\()/gm,
            (match, nl, sp, decl, name) => {
                if (name) { return nl + sp + '/** ' + name + ' 函数 */\n' + sp + decl; }
                return match;
            }
        );

        result = result.replace(
            /var\s+(\w+)\s*=\s*document\.getElementById\((['"][^'"]+['"])\);/g,
            (m, varName) => {
                const idMatch = m.match(/getElementById\(([^)]+)\)/);
                return 'const ' + varName + ' = document.getElementById(' + idMatch[1] + ');\n' +
                    'if (!' + varName + ') { return; }';
            }
        );

        result = result.replace(/\n{3,}/g, '\n\n');

        result = result.replace(/\/\*__C(\d+)__\*\//g, (_, idx) => {
            const c = comments[parseInt(idx, 10)] || '';
            return c.replace(/\n/g, '\n');
        });

        return result.trim();
    }

    function demoJs() {
        return [
            'function factorial(n){if(n<=1)return 1;return n*factorial(n-1);}',
            'const nums=[1,2,3,4,5];',
            'const doubled=nums.map(x=>x*2);',
            'const obj={name:"test",value:42,active:true};',
            'console.log(factorial(5));'
        ].join('\n');
    }

    function onFormatClick() {
        if (!jsInput) { return; }
        const v = jsInput.value.trim();
        if (!v) { showToast('请先输入JS代码'); return; }

        const formatted = formatJs(v);
        if (formatOutput) { formatOutput.value = formatted; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'block'; }
        if (formatCharCount) { formatCharCount.textContent = formatted.length + ' 字符'; }
    }

    function onClearFormatClick() {
        if (jsInput) { jsInput.value = ''; }
        if (formatOutput) { formatOutput.value = ''; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'none'; }
    }

    function onDemoFormatClick() {
        if (jsInput) { jsInput.value = demoJs(); }
    }

    function onCopyFormatClick() {
        if (!formatOutput) { return; }
        copyText(formatOutput.value, '已复制格式化结果');
    }

    document.getElementById('btnDoFormat').addEventListener('click', onFormatClick);
    document.getElementById('btnClearFormat').addEventListener('click', onClearFormatClick);
    document.getElementById('btnDemoFormat').addEventListener('click', onDemoFormatClick);
    document.getElementById('btnCopyFormat').addEventListener('click', onCopyFormatClick);

    function validateJs(js) {
        const issues = [];
        const pairs  = { '{': '}', '[': ']', '(': ')' };
        const stack  = [];
        let inStr     = false;
        let sc        = '';
        let inComment = 0;

        for (let i = 0; i < js.length; i++) {
            const c    = js[i];
            const prev = js[i - 1] || '';
            const next = js[i + 1] || '';

            if (inComment === 1) {
                if (c === '\n') { inComment = 0; }
                continue;
            }
            if (inComment === 2) {
                if (c === '*' && next === '/') { inComment = 0; i++; }
                continue;
            }

            if (inStr) {
                if (c === sc && prev !== '\\') { inStr = false; }
                continue;
            }

            if ((c === "'" || c === '"') && prev !== '\\') {
                inStr = true;
                sc = c;
                continue;
            }

            if (c === '/' && next === '/') { inComment = 1; continue; }
            if (c === '/' && next === '*') { inComment = 2; continue; }

            if (pairs[c]) {
                stack.push({ char: c, pos: i });
            } else if (c === '}' || c === ']' || c === ')') {
                if (!stack.length) {
                    issues.push({
                        type: 'error',
                        msg: '位置 ' + i + '：多余的 ' + c + ' 没有对应的开括号'
                    });
                    continue;
                }
                const top = stack.pop();
                if (pairs[top.char] !== c) {
                    issues.push({
                        type: 'error',
                        msg: '位置 ' + i + '：' + c + ' 与位置 ' + top.pos + ' 的 ' + top.char + ' 不匹配'
                    });
                }
            }
        }

        stack.forEach((s) => {
            issues.push({
                type: 'error',
                msg: '未闭合的括号：位置 ' + s.pos + ' 的 ' + s.char + ' 缺少对应的闭合括号'
            });
        });

        if (!issues.length) {
            issues.push({ type: 'ok', msg: '未发现明显问题，代码结构良好！' });
        }
        return issues;
    }

    function onValidateClick() {
        if (!jsValidateInput) { return; }
        const v = jsValidateInput.value.trim();
        if (!v) { showToast('请先输入JS代码'); return; }

        const issues = validateJs(v);
        let htmlOut = '';
        issues.forEach((is) => {
            const icon = is.type === 'error' ? '❌' : (is.type === 'warn' ? '⚠️' : '✅');
            htmlOut += '<div class="issue issue-' + is.type + '">';
            htmlOut += '<span class="issue-icon">' + icon + '</span>';
            htmlOut += '<span>' + is.msg + '</span></div>';
        });
        if (validateOutput) { validateOutput.innerHTML = htmlOut; }
        if (validateOutputGroup) { validateOutputGroup.style.display = 'block'; }
    }

    function onClearValidateClick() {
        if (jsValidateInput) { jsValidateInput.value = ''; }
        if (validateOutput) { validateOutput.innerHTML = ''; }
        if (validateOutputGroup) { validateOutputGroup.style.display = 'none'; }
    }

    document.getElementById('btnDoValidate').addEventListener('click', onValidateClick);
    document.getElementById('btnClearValidate').addEventListener('click', onClearValidateClick);

    function obfuscate(text) {
        const encoded = btoa(unescape(encodeURIComponent(text)))
            .split('')
            .reverse()
            .join('');
        return 'eval(decodeURIComponent(escape(atob("' + encoded + '".split("").reverse().join("")))));';
    }

    function onObClick() {
        if (!jsObInput) { return; }
        const v = jsObInput.value.trim();
        if (!v) { showToast('请先输入JS代码'); return; }

        const o = obfuscate(v);
        if (obOutput) { obOutput.value = o; }
        if (obOutputGroup) { obOutputGroup.style.display = 'block'; }
        if (obCharCount) { obCharCount.textContent = o.length + ' 字符'; }
    }

    function onClearObClick() {
        if (jsObInput) { jsObInput.value = ''; }
        if (obOutput) { obOutput.value = ''; }
        if (obOutputGroup) { obOutputGroup.style.display = 'none'; }
    }

    function onCopyObClick() {
        if (!obOutput) { return; }
        copyText(obOutput.value, '已复制混淆结果');
    }

    document.getElementById('btnDoOb').addEventListener('click', onObClick);
    document.getElementById('btnClearOb').addEventListener('click', onClearObClick);
    document.getElementById('btnCopyOb').addEventListener('click', onCopyObClick);

    function sha256(input) {
        const r = (v, n) => (v >>> n) | (v << (32 - n));

        const K = [
            1116352408, 1899447441, 3049323471, 3921009573,
            961987163,  1508970993, 2453635748, 2870763221,
            3624381080, 310598401,  607225278,  1426881987,
            1925078388, 2162078206, 2614888103, 3248222580,
            3835390401, 4022224774, 264347078,  604807628,
            770255983,  1249150122, 1555081692, 1996064986,
            2554220882, 2821834349, 2952996808, 3210313671,
            3336571891, 3584528711, 113926993,  338241895,
            666307205,  773529912,  1294757372, 1396182291,
            1695183700, 1986661051, 2177026350, 2456956037,
            2730485921, 2820302411, 3259730800, 3345764771,
            3516065817, 3600352804, 4094571909, 275423344,
            430227734,  506948616,  659060556,  883997877,
            958139571,  1322822218, 1537002063, 1747873779,
            1955562222, 2024104815, 2227730452, 2361852424,
            2428436474, 2756734187, 3204031479, 3329325298
        ];

        const m = [];
        const l = input.length;
        let i;

        for (i = 0; i < l; i++) {
            m[i >> 2] |= (input.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
        }
        m[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
        m[((l + 8) >> 6 << 4) + 15] = l * 8;

        const H = [
            1779033703, 3144134277, 1013904242, 2773480762,
            1359893119, 2600822924, 528734635,  1541459225
        ];

        for (let b = 0; b < m.length; b += 16) {
            const W  = new Array(64);
            let a    = H[0];
            let b2   = H[1];
            let c    = H[2];
            let d    = H[3];
            let e    = H[4];
            let f    = H[5];
            let g    = H[6];
            let h    = H[7];

            for (i = 0; i < 16; i++) { W[i] = m[b + i] || 0; }
            for (i = 16; i < 64; i++) {
                const s0 = r(W[i - 15], 7) ^ r(W[i - 15], 18) ^ (W[i - 15] >>> 3);
                const s1 = r(W[i - 2], 17) ^ r(W[i - 2], 19) ^ (W[i - 2] >>> 10);
                W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
            }

            for (i = 0; i < 64; i++) {
                const S0  = r(a, 2) ^ r(a, 13) ^ r(a, 22);
                const maj = (a & b2) ^ (a & c) ^ (b2 & c);
                const t2  = (S0 + maj) | 0;
                const Sr1 = r(e, 6) ^ r(e, 11) ^ r(e, 25);
                const ch  = (e & f) ^ (~e & g);
                const t1  = (h + Sr1 + ch + K[i] + W[i]) | 0;

                h  = g;
                g  = f;
                f  = e;
                e  = (d + t1) | 0;
                d  = c;
                c  = b2;
                b2 = a;
                a  = (t1 + t2) | 0;
            }

            H[0] = (H[0] + a)  | 0;
            H[1] = (H[1] + b2) | 0;
            H[2] = (H[2] + c)  | 0;
            H[3] = (H[3] + d)  | 0;
            H[4] = (H[4] + e)  | 0;
            H[5] = (H[5] + f)  | 0;
            H[6] = (H[6] + g)  | 0;
            H[7] = (H[7] + h)  | 0;
        }

        const toHex = (v) => ('0000000' + (v >>> 0).toString(16)).slice(-8);

        return H.map(toHex).join('');
    }

    function onEncClick() {
        if (!jsEncInput) { return; }
        const v = jsEncInput.value.trim();
        if (!v) { showToast('请先输入JS代码'); return; }

        const hash = sha256(v);

        const verifyCode =
            '/**\n' +
            ' * SHA-256 自校验工具\n' +
            ' * 预期哈希: ' + hash + '\n' +
            ' * 将待校验文本填入 verify("...") 后执行即可\n' +
            ' */\n' +
            '(function(){\n' +
            '  function sha256(i){var r=function(v,n){return(v>>>n)|(v<<(32-n));},' +
            'K=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,' +
            '3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,' +
            '3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,' +
            '2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,' +
            '666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,' +
            '2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,' +
            '430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,' +
            '1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];' +
            'var m=[],l=i.length,j;for(j=0;j<l;j++)m[j>>2]|=(i.charCodeAt(j)&255)<<(24-(j%4)*8);' +
            'm[j>>2]|=128<<(24-(j%4)*8);m[((l+8)>>6<<4)+15]=l*8;' +
            'var H=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];' +
            'for(var b=0;b<m.length;b+=16){var W=Array(64),a=H[0],c=H[1],d=H[2],e=H[3],f=H[4],g=H[5],h=H[6],k=H[7];' +
            'for(j=0;j<16;j++)W[j]=m[b+j]||0;' +
            'for(j=16;j<64;j++){var s0=r(W[j-15],7)^r(W[j-15],18)^(W[j-15]>>>3),' +
            's1=r(W[j-2],17)^r(W[j-2],19)^(W[j-2]>>>10);W[j]=(W[j-16]+s0+W[j-7]+s1)|0}' +
            'for(j=0;j<64;j++){var S0=r(a,2)^r(a,13)^r(a,22),maj=(a&c)^(a&d)^(c&d),t2=(S0+maj)|0,' +
            'Sr1=r(f,6)^r(f,11)^r(f,25),ch=(f&g)^(~f&h),t1=(k+Sr1+ch+K[j]+W[j])|0;' +
            'k=h;h=g;g=f;f=(e+t1)|0;e=d;d=c;c=a;a=(t1+t2)|0}' +
            'H[0]=(H[0]+a)|0;H[1]=(H[1]+c)|0;H[2]=(H[2]+d)|0;H[3]=(H[3]+e)|0;H[4]=(H[4]+f)|0;H[5]=(H[5]+g)|0;H[6]=(H[6]+h)|0;H[7]=(H[7]+k)|0}' +
            'function toHex(v){return("0000000"+(v>>>0).toString(16)).slice(-8)}return H.map(toHex).join("")}' +
            '  window.verifyHash=function(t){var a=sha256(t);' +
            'var e="' + hash + '";' +
            'if(a===e){console.log("校验通过");return true}' +
            'else{console.log("校验失败！\\n  预期: "+e+"\\n  实际: "+a);return false}};\n' +
            '})();\n' +
            'verifyHash("在这里粘贴待校验的文本");\n';

        if (encOutput) { encOutput.value = verifyCode; }
        if (encOutputGroup) { encOutputGroup.style.display = 'block'; }
    }

    function onClearEncClick() {
        if (jsEncInput) { jsEncInput.value = ''; }
        if (encOutput) { encOutput.value = ''; }
        if (encOutputGroup) { encOutputGroup.style.display = 'none'; }
    }

    function onCopyEncClick() {
        if (!encOutput) { return; }
        copyText(encOutput.value, '已复制加密结果');
    }

    document.getElementById('btnDoEnc').addEventListener('click', onEncClick);
    document.getElementById('btnClearEnc').addEventListener('click', onClearEncClick);
    document.getElementById('btnCopyEnc').addEventListener('click', onCopyEncClick);

})();
