(function () {
    'use strict';

    const sidebar        = document.getElementById('sidebar');
    const mobileBtn      = document.getElementById('mobileMenuToggle');
    const main           = document.getElementById('mainContent');

    const panels = {
        format:    document.getElementById('panelFormat'),
        validate:  document.getElementById('panelValidate'),
        obfuscate: document.getElementById('panelObfuscate')
    };

    const navBtns = {
        format:    document.getElementById('btnFormat'),
        validate:  document.getElementById('btnValidate'),
        obfuscate: document.getElementById('btnObfuscate')
    };

    const htmlInput         = document.getElementById('htmlInput');
    const formatOutput      = document.getElementById('formatOutput');
    const formatOutputGroup = document.getElementById('formatOutputGroup');
    const formatCharCount   = document.getElementById('formatCharCount');

    const htmlValidateInput   = document.getElementById('htmlValidateInput');
    const validateOutput      = document.getElementById('validateOutput');
    const validateOutputGroup = document.getElementById('validateOutputGroup');

    const htmlObInput   = document.getElementById('htmlObInput');
    const obOutput      = document.getElementById('obOutput');
    const obOutputGroup = document.getElementById('obOutputGroup');
    const obCharCount   = document.getElementById('obCharCount');

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
        if (window.innerWidth > 900 && sidebarOpen) {
            closeSidebar();
        }
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

    const VOID_TAGS = {
        area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1,
        input: 1, link: 1, meta: 1, param: 1, source: 1, track: 1, wbr: 1
    };

    const COMPACT_TAGS = {
        h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1,
        p: 1, li: 1, td: 1, th: 1, dt: 1, dd: 1, figcaption: 1,
        strong: 1, em: 1, a: 1, span: 1, label: 1, button: 1,
        title: 1, code: 1, small: 1, mark: 1, del: 1, ins: 1,
        sub: 1, sup: 1, b: 1, i: 1, u: 1, s: 1, abbr: 1, cite: 1,
        pre: 1
    };

    function formatHtml(html) {
        html = html.replace(/<!--[\s\S]*?-->/g, '');

        if (/<html/i.test(html) && !/lang\s*=/i.test(html.match(/<html[^>]*>/i) || [''])) {
            html = html.replace(
                /(<html)([^>]*)(>)/i,
                (_, open, attrs, close) => open + ' lang="zh-CN"' + attrs + close
            );
        }

        if (/<head/i.test(html) && !/viewport/i.test(html)) {
            html = html.replace(
                /(<head[^>]*>)/i,
                '$1\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">'
            );
        }

        let i       = 0;
        let result2 = '';
        let indent  = 0;
        const TAB   = '  ';
        const n     = html.length;
        let compact = 0;

        const nl = () => '\n' + TAB.repeat(indent);

        while (i < n) {
            const ch = html[i];

            if (ch === '\n' || ch === '\r' || ch === ' ' || ch === '\t') { i++; continue; }

            if (ch === '<') {
                let end = i;
                while (end < n && html[end] !== '>') { end++; }
                if (end >= n) { break; }

                const tag = html.substring(i, end + 1);

                if (tag[1] === '!') {
                    result2 += tag;
                    i = end + 1;
                    continue;
                }

                const isClose  = (tag[1] === '/');
                let tagName;

                if (isClose) {
                    tagName = tag.substring(2, tag.length - 1).split(' ')[0].toLowerCase();
                } else {
                    tagName = tag.substring(1, tag.length - 1).split(' ')[0].toLowerCase();
                }

                const isVoid    = !!VOID_TAGS[tagName];
                const isCompact = !!COMPACT_TAGS[tagName];

                if (isClose) {
                    if (isCompact && compact > 0) {
                        compact--;
                        result2 += tag;
                    } else {
                        indent = Math.max(0, indent - 1);
                        result2 += nl() + tag;
                    }
                } else {
                    result2 += (compact > 0 ? '' : nl()) + tag;
                    if (!isVoid) {
                        if (!isCompact) { indent++; }
                        else            { compact++; }
                    }
                }

                i = end + 1;
                continue;
            }

            let txt = '';
            while (i < n && html[i] !== '<' && html[i] !== '\n' && html[i] !== '\r') { txt += html[i]; i++; }
            txt = txt.trim();
            if (txt) {
                result2 += (compact > 0 ? '' : nl()) + txt;
            }
        }

        result2 = result2.replace(/\n{3,}/g, '\n\n');
        result2 = result2.trim();
        result2 = result2.replace(/(<!DOCTYPE[^>]+>)\n{2,}/i, '$1\n');

        return result2;
    }

    function demoHtml() {
        return [
            '<!DOCTYPE html>',
            '<html>',
            '<head><title>示例</title></head>',
            '<body>',
            '<div class="box"><h1>标题</h1><p>这是一段<strong>文字</strong></p><ul><li>项目1</li><li>项目2</li></ul></div>',
            '</body>',
            '</html>'
        ].join('\n');
    }

    function onFormatClick() {
        if (!htmlInput) { return; }
        const v = htmlInput.value.trim();
        if (!v) { showToast('请先输入HTML代码'); return; }

        const formatted = formatHtml(v);
        if (formatOutput) { formatOutput.value = formatted; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'block'; }
        if (formatCharCount) { formatCharCount.textContent = formatted.length + ' 字符'; }
    }

    function onClearFormatClick() {
        if (htmlInput) { htmlInput.value = ''; }
        if (formatOutput) { formatOutput.value = ''; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'none'; }
    }

    function onDemoFormatClick() {
        if (htmlInput) { htmlInput.value = demoHtml(); }
    }

    function onCopyFormatClick() {
        if (!formatOutput) { return; }
        copyText(formatOutput.value, '已复制格式化结果');
    }

    document.getElementById('btnDoFormat').addEventListener('click', onFormatClick);
    document.getElementById('btnClearFormat').addEventListener('click', onClearFormatClick);
    document.getElementById('btnDemoFormat').addEventListener('click', onDemoFormatClick);
    document.getElementById('btnCopyFormat').addEventListener('click', onCopyFormatClick);

    function validateHtml(html) {
        const issues   = [];
        const stack    = [];
        const tagRe    = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
        const voidList = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img',
            'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        let m;

        while ((m = tagRe.exec(html)) !== null) {
            const full = m[0];
            const name = m[1].toLowerCase();
            if (voidList.indexOf(name) >= 0) { continue; }

            if (full[1] === '/') {
                if (stack.length && stack[stack.length - 1] === name) {
                    stack.pop();
                }
            } else {
                stack.push(name);
            }
        }

        if (stack.length) {
            const tail = stack.slice(-3).join('、');
            const more = stack.length > 3 ? ' ... 共' + stack.length + '个' : '';
            issues.push({ type: 'error', msg: '未闭合的标签：' + tail + more });
        }

        if (html.indexOf('<html') >= 0 && html.indexOf('</html>') < 0) {
            issues.push({ type: 'warn', msg: '缺少 &lt;/html&gt; 闭合标签' });
        }
        if (html.indexOf('<head') >= 0 && html.indexOf('</head>') < 0) {
            issues.push({ type: 'warn', msg: '缺少 &lt;/head&gt; 闭合标签' });
        }
        if (html.indexOf('<body') >= 0 && html.indexOf('</body>') < 0) {
            issues.push({ type: 'warn', msg: '缺少 &lt;/body&gt; 闭合标签' });
        }

        const attrRe = /(\w+)\s*=\s*([^"'\s>][^\s>]*)/g;
        let am;
        while ((am = attrRe.exec(html)) !== null) {
            if (!/^['"]/.test(am[2])) {
                issues.push({
                    type: 'warn',
                    msg: '属性 ' + am[1] + ' 的值未用引号包裹：' + am[2]
                });
            }
        }

        if (!issues.length) {
            issues.push({ type: 'ok', msg: '未发现明显问题，代码结构良好！' });
        }
        return issues;
    }

    function onValidateClick() {
        if (!htmlValidateInput) { return; }
        const v = htmlValidateInput.value.trim();
        if (!v) { showToast('请先输入HTML代码'); return; }

        const issues  = validateHtml(v);
        let htmlOut   = '';
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
        if (htmlValidateInput) { htmlValidateInput.value = ''; }
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
        return '<script>' +
            'document.write(decodeURIComponent(escape(atob("' + encoded + '".split("").reverse().join("")))));' +
            '<\/script>';
    }

    function onObClick() {
        if (!htmlObInput) { return; }
        const v = htmlObInput.value.trim();
        if (!v) { showToast('请先输入HTML代码'); return; }

        const o = obfuscate(v);
        if (obOutput) { obOutput.value = o; }
        if (obOutputGroup) { obOutputGroup.style.display = 'block'; }
        if (obCharCount) { obCharCount.textContent = o.length + ' 字符'; }
    }

    function onClearObClick() {
        if (htmlObInput) { htmlObInput.value = ''; }
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

})();
