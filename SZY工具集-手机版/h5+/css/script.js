(function () {
    'use strict';

    const sidebar   = document.getElementById('sidebar');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const main      = document.getElementById('mainContent');

    const panels = {
        format:    document.getElementById('panelFormat'),
        validate:  document.getElementById('panelValidate'),
        obfuscate: document.getElementById('panelObfuscate'),
        minify:    document.getElementById('panelMinify')
    };

    const navBtns = {
        format:    document.getElementById('btnFormat'),
        validate:  document.getElementById('btnValidate'),
        obfuscate: document.getElementById('btnObfuscate'),
        minify:    document.getElementById('btnMinify')
    };

    const cssInput          = document.getElementById('cssInput');
    const formatOutput      = document.getElementById('formatOutput');
    const formatOutputGroup = document.getElementById('formatOutputGroup');
    const formatCharCount   = document.getElementById('formatCharCount');

    const cssValidateInput   = document.getElementById('cssValidateInput');
    const validateOutput      = document.getElementById('validateOutput');
    const validateOutputGroup = document.getElementById('validateOutputGroup');

    const cssObInput   = document.getElementById('cssObInput');
    const obOutput     = document.getElementById('obOutput');
    const obOutputGroup = document.getElementById('obOutputGroup');
    const obCharCount  = document.getElementById('obCharCount');

    const cssMinInput   = document.getElementById('cssMinInput');
    const minOutput     = document.getElementById('minOutput');
    const minOutputGroup = document.getElementById('minOutputGroup');
    const minCharCount  = document.getElementById('minCharCount');

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

    function classifySelector(selector) {
        const s = selector.trim().toLowerCase();
        if (/^:root/.test(s)) { return 'CSS 变量定义'; }
        if (/^[*]/.test(s) || /^(html|body)\b/.test(s) || /::?(before|after)$/.test(s)) {
            return '全局重置与基础样式';
        }
        if (/\b(header|footer|nav|main|aside|section|container|wrapper|layout|sidebar|content|grid|flex)\b/.test(s)) {
            return '布局与结构';
        }
        if (/\b(btn|button|submit)\b/.test(s) || /^\[type\s*=\s*["']?(submit|button)/.test(s)) {
            return '按钮与交互元素';
        }
        if (/\b(input|form|textarea|select|label|checkbox|radio)\b/.test(s)) {
            return '表单与输入';
        }
        if (/\b(card|panel|box|tile)\b/.test(s)) {
            return '卡片与面板';
        }
        if (/^(h[1-6]|p|span|a|ul|ol|li|strong|em|code|pre|blockquote|small|mark)\b/.test(s)) {
            return '排版与文字';
        }
        if (/@media/.test(s)) { return '响应式适配'; }
        if (/@keyframes/.test(s) || /\b(animation|transition)\b/.test(s)) {
            return '动画与过渡';
        }
        return '';
    }

    function isButtonSelector(selector) {
        const s = selector.trim().toLowerCase();
        if (/\b(btn|button|submit)\b/.test(s)) { return true; }
        if (/^\[type\s*=\s*["']?(submit|button)/.test(s)) { return true; }
        if (/^(button|input\[)/.test(s)) { return true; }
        return false;
    }

    function formatCss(css) {
        const preserved = [];
        css = css.replace(/\/\*[\s\S]*?\*\//g, (m) => {
            preserved.push(m);
            return '/*__PRESERVED_' + (preserved.length - 1) + '__*/';
        });

        css = css.replace(/\s*([{};:,>+~])\s*/g, '$1');
        css = css.replace(/\{/g, ' {\n  ');
        css = css.replace(/\}/g, '\n}\n');
        css = css.replace(/;/g, ';\n  ');
        css = css.replace(/:\s*/g, ': ');

        const lines = css.split('\n');
        const cleanLines = [];
        for (let li = 0; li < lines.length; li++) {
            let line = lines[li];
            if (line.indexOf('{') < 0 && line.indexOf('}') < 0) {
                line = line.replace(/[ \t]+/g, ' ');
            }
            cleanLines.push(line);
        }

        const resultArr = [];
        let indent = 0;
        const TAB = '  ';

        cleanLines.forEach((line) => {
            const t = line.trim();
            if (!t) { return; }

            if (t.indexOf('}') >= 0) {
                indent = Math.max(0, indent - 1);
            }

            resultArr.push({ text: TAB.repeat(indent) + t, selector: '' });

            if (t.indexOf('{') >= 0 && t.indexOf('}') < 0) {
                indent++;
            }
        });

        for (let ri = 0; ri < resultArr.length; ri++) {
            const rt = resultArr[ri].text.trim();
            const braceIdx = rt.indexOf('{');
            if (braceIdx >= 0) {
                resultArr[ri].selector = rt.substring(0, braceIdx).trim();
            }
        }

        for (let ri = 0; ri < resultArr.length; ri++) {
            const rt = resultArr[ri].text.trim();
            if (rt.indexOf('{') < 0 && rt.indexOf('}') < 0 && rt.length > 0) {
                if (!/[;}]$/.test(rt)) {
                    resultArr[ri].text = resultArr[ri].text.replace(/(\S)\s*$/, '$1;');
                }
            }
        }

        const finalBlocks = [];
        let prevCategory = '';
        let blockLines = [];

        function flushBlock() {
            if (blockLines.length === 0) { return; }
            finalBlocks.push(blockLines.join('\n'));
            blockLines = [];
        }

        for (let ri = 0; ri < resultArr.length; ri++) {
            const item = resultArr[ri];
            const sel = item.selector;

            if (sel) {
                flushBlock();
                const cat = classifySelector(sel);

                if (cat && cat !== prevCategory) {
                    finalBlocks.push('/* ======== ' + cat + ' ======== */');
                    prevCategory = cat;
                }

                if (isButtonSelector(sel)) {
                    item._needsTransition = true;
                }
            }

            blockLines.push(item.text);
        }
        flushBlock();

        const finalResult = finalBlocks.map((block) => {
            const blines = block.split('\n');
            const selLine = blines[0] || '';

            if (!isButtonSelector(selLine.replace(/^\s+/, ''))) {
                return block;
            }

            let hasTransition = false;
            for (let bi = 0; bi < blines.length; bi++) {
                if (/^\s*transition\s*:/.test(blines[bi])) {
                    hasTransition = true;
                    break;
                }
            }

            if (!hasTransition) {
                for (let bi = blines.length - 1; bi >= 0; bi--) {
                    if (blines[bi].trim() === '}') {
                        const transIndent = '  ';
                        blines.splice(bi, 0,
                            transIndent + 'transition: all 0.3s ease;',
                            transIndent + 'cursor: pointer;'
                        );
                        break;
                    }
                }
            }

            return blines.join('\n');
        });

        let result = finalResult.join('\n');
        result = result.replace(/\n{3,}/g, '\n\n');

        result = result.replace(/\/\*__PRESERVED_(\d+)__\*\//g, (_, idx) => {
            return preserved[parseInt(idx, 10)] || '';
        });

        return result.trim();
    }

    function demoCss() {
        return [
            'body{font-family:sans-serif;margin:0;padding:0;background:#f0f0f0}',
            '.container{max-width:1200px;margin:0 auto;padding:20px}',
            '.btn{display:inline-block;padding:10px 20px;background:#5b8def;color:#fff;border:none;border-radius:8px}',
            '.btn:hover{background:#4a7de0;transform:translateY(-1px)}',
            '.card{border:1px solid #eee;border-radius:12px;padding:16px}',
            '.form-input{width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px}'
        ].join('\n');
    }

    function onFormatClick() {
        if (!cssInput) { return; }
        const v = cssInput.value.trim();
        if (!v) { showToast('请先输入CSS代码'); return; }

        const formatted = formatCss(v);
        if (formatOutput) { formatOutput.value = formatted; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'block'; }
        if (formatCharCount) { formatCharCount.textContent = formatted.length + ' 字符'; }
    }

    function onClearFormatClick() {
        if (cssInput) { cssInput.value = ''; }
        if (formatOutput) { formatOutput.value = ''; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'none'; }
    }

    function onDemoFormatClick() {
        if (cssInput) { cssInput.value = demoCss(); }
    }

    function onCopyFormatClick() {
        if (!formatOutput) { return; }
        copyText(formatOutput.value, '已复制格式化结果');
    }

    document.getElementById('btnDoFormat').addEventListener('click', onFormatClick);
    document.getElementById('btnClearFormat').addEventListener('click', onClearFormatClick);
    document.getElementById('btnDemoFormat').addEventListener('click', onDemoFormatClick);
    document.getElementById('btnCopyFormat').addEventListener('click', onCopyFormatClick);

    function validateCss(css) {
        const issues = [];

        let depth = 0;
        for (let i = 0; i < css.length; i++) {
            if (css[i] === '{') { depth++; }
            if (css[i] === '}') { depth--; }
            if (depth < 0) {
                issues.push({
                    type: 'error',
                    msg: '位置 ' + i + '：多余的 } 闭合花括号'
                });
                depth = 0;
            }
        }
        if (depth > 0) {
            issues.push({
                type: 'error',
                msg: '有 ' + depth + ' 个未闭合的花括号 {'
            });
        }

        const propRe = /([a-zA-Z-]+)\s*:\s*[^;}]+(?=[\s]*\})/g;
        let pm;
        while ((pm = propRe.exec(css)) !== null) {
            if (pm[0].indexOf(';') < 0) {
                issues.push({
                    type: 'warn',
                    msg: '属性 ' + pm[1] + ' 的值后可能缺少分号（最后一个属性可省略）'
                });
            }
        }

        const typos = {
            visiblity: 'visibility',
            positon: 'position',
            margn: 'margin',
            pading: 'padding',
            with: 'width',
            heigth: 'height',
            backgroud: 'background',
            backround: 'background',
            'backgound-color': 'background-color',
            'backround-color': 'background-color',
            boder: 'border',
            bordr: 'border',
            colr: 'color',
            fint: 'font',
            fotn: 'font',
            wieth: 'width',
            heigt: 'height'
        };

        const words = css.match(/[a-zA-Z-]+/g) || [];
        words.forEach((w) => {
            const l = w.toLowerCase();
            if (typos[l]) {
                issues.push({
                    type: 'warn',
                    msg: '疑似拼写错误：' + w + ' → 应为 ' + typos[l]
                });
            }
        });

        if (!issues.length) {
            issues.push({ type: 'ok', msg: '未发现明显问题，代码结构良好！' });
        }
        return issues;
    }

    function onValidateClick() {
        if (!cssValidateInput) { return; }
        const v = cssValidateInput.value.trim();
        if (!v) { showToast('请先输入CSS代码'); return; }

        const issues = validateCss(v);
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
        if (cssValidateInput) { cssValidateInput.value = ''; }
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
        return '(function(){var s=document.createElement("style");' +
            's.textContent=decodeURIComponent(escape(atob("' + encoded + '".split("").reverse().join(""))));' +
            'document.head.appendChild(s);})();';
    }

    function onObClick() {
        if (!cssObInput) { return; }
        const v = cssObInput.value.trim();
        if (!v) { showToast('请先输入CSS代码'); return; }

        const o = obfuscate(v);
        if (obOutput) { obOutput.value = o; }
        if (obOutputGroup) { obOutputGroup.style.display = 'block'; }
        if (obCharCount) { obCharCount.textContent = o.length + ' 字符'; }
    }

    function onClearObClick() {
        if (cssObInput) { cssObInput.value = ''; }
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

    function minifyCss(css) {
        var out = '', i = 0, n = css.length, inStr = null;
        while (i < n) {
            var ch = css[i];
            if (inStr) {
                out += ch;
                if (ch === '\\' && i + 1 < n) { out += css[i + 1]; i += 2; }
                else if (ch === inStr) { inStr = null; i++; }
                else { i++; }
                continue;
            }
            if (ch === '/' && css[i + 1] === '*') {
                i += 2;
                while (i < n && !(css[i] === '*' && css[i + 1] === '/')) i++;
                i += 2;
                continue;
            }
            if (ch === '"' || ch === "'") { inStr = ch; out += ch; i++; continue; }
            if (/\s/.test(ch)) { i++; continue; }
            if (ch === ';') {
                var j = i + 1;
                while (j < n && /\s/.test(css[j])) j++;
                if (css[j] === '}') { i = j; continue; }
            }
            if ('{}:;,>+~'.indexOf(ch) >= 0) {
                if (out.length && /\s/.test(out[out.length - 1])) out = out.slice(0, -1);
                out += ch; i++; continue;
            }
            if (out.length && !/[\s{}:;,>+~]$/.test(out)) out += ' ';
            out += ch; i++;
        }
        return out.trim();
    }

    function onMinClick() {
        if (!cssMinInput) { return; }
        const v = cssMinInput.value.trim();
        if (!v) { showToast('请先输入CSS代码'); return; }

        const m = minifyCss(v);
        if (minOutput) { minOutput.value = m; }
        if (minOutputGroup) { minOutputGroup.style.display = 'block'; }
        if (minCharCount) { minCharCount.textContent = m.length + ' 字符'; }
    }

    function onClearMinClick() {
        if (cssMinInput) { cssMinInput.value = ''; }
        if (minOutput) { minOutput.value = ''; }
        if (minOutputGroup) { minOutputGroup.style.display = 'none'; }
    }

    function onCopyMinClick() {
        if (!minOutput) { return; }
        copyText(minOutput.value, '已复制压缩结果');
    }

    document.getElementById('btnDoMin').addEventListener('click', onMinClick);
    document.getElementById('btnClearMin').addEventListener('click', onClearMinClick);
    document.getElementById('btnCopyMin').addEventListener('click', onCopyMinClick);

})();
