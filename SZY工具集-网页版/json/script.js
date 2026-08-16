(function () {
    'use strict';

    const sidebar   = document.getElementById('sidebar');
    const mobileBtn = document.getElementById('mobileMenuToggle');
    const main      = document.getElementById('mainContent');

    const panels = {
        format:  document.getElementById('panelFormat'),
        minify:  document.getElementById('panelMinify'),
        validate: document.getElementById('panelValidate'),
        convert: document.getElementById('panelConvert')
    };

    const navBtns = {
        format:   document.getElementById('btnFormat'),
        minify:   document.getElementById('btnMinify'),
        validate: document.getElementById('btnValidate'),
        convert:  document.getElementById('btnConvert')
    };

    const jsonFormatInput     = document.getElementById('jsonFormatInput');
    const formatOutput        = document.getElementById('formatOutput');
    const formatOutputGroup   = document.getElementById('formatOutputGroup');
    const formatCharCount     = document.getElementById('formatCharCount');

    const jsonMinInput  = document.getElementById('jsonMinInput');
    const minOutput     = document.getElementById('minOutput');
    const minOutputGroup = document.getElementById('minOutputGroup');
    const minCharCount  = document.getElementById('minCharCount');

    const jsonValidateInput   = document.getElementById('jsonValidateInput');
    const validateOutput      = document.getElementById('validateOutput');
    const validateOutputGroup = document.getElementById('validateOutputGroup');

    const jsonConvertInput  = document.getElementById('jsonConvertInput');
    const convertOutput     = document.getElementById('convertOutput');
    const convertOutputGroup = document.getElementById('convertOutputGroup');
    const convertCharCount  = document.getElementById('convertCharCount');

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

    function formatJson(text) {
        try {
            const obj = JSON.parse(text);
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return null;
        }
    }

    function minifyJson(text) {
        try {
            const obj = JSON.parse(text);
            return JSON.stringify(obj);
        } catch (e) {
            return null;
        }
    }

    function validateJson(text) {
        try {
            JSON.parse(text);
            return [{ type: 'ok', msg: 'JSON 格式正确！' }];
        } catch (e) {
            const msg = e.message || '';
            const posMatch = msg.match(/position\s+(\d+)/i);
            const issues = [{ type: 'error', msg: '语法错误：' + msg }];

            if (posMatch) {
                const pos = parseInt(posMatch[1], 10);
                const before = text.substring(Math.max(0, pos - 30), pos);
                const after = text.substring(pos, Math.min(text.length, pos + 30));
                const arrow = ' '.repeat(Math.min(before.length, 30)) + '▲';

                issues.push({
                    type: 'warn',
                    msg: '错误位置附近：\n' + before + after + '\n' + arrow
                });

                const lineNum = text.substring(0, pos).split('\n').length;
                const colNum = pos - text.lastIndexOf('\n', pos - 1);
                issues.push({
                    type: 'warn',
                    msg: '位置：第 ' + lineNum + ' 行，第 ' + colNum + ' 列'
                });
            }

            const mismatch = msg.match(/Unexpected token.*"([^"]+)"/);
            const expected = msg.match(/Expected.*(".*")/);

            if (msg.indexOf('Unexpected end') >= 0) {
                issues.push({
                    type: 'warn',
                    msg: '提示：JSON 不完整，可能是花括号或方括号未闭合'
                });
            } else if (msg.indexOf('Unexpected token') >= 0) {
                issues.push({
                    type: 'warn',
                    msg: '提示：可能是多了逗号、少了引号，或者使用了 JavaScript 对象格式（属性名缺少引号）'
                });
            } else if (msg.indexOf('Unexpected number') >= 0) {
                issues.push({
                    type: 'warn',
                    msg: '提示：属性名必须是双引号包裹的字符串'
                });
            }

            return issues;
        }
    }

    function jsonToJs(text) {
        try {
            const obj = JSON.parse(text);
            let js = JSON.stringify(obj, null, 2);
            js = js.replace(/"(\w+)":/g, '$1:');
            js = js.replace(/"(true|false|null)"/g, '$1');
            js = js.replace(/("[^"]*":)\s*"([^"]*)"/g, '$1 "$2"');
            js = js.replace(/([a-zA-Z_]\w*):\s*"/g, '$1: "');
            js = js.replace(/"$/gm, '"');
            return js;
        } catch (e) {
            return null;
        }
    }

    function demoJson() {
        return JSON.stringify({
            name: '张三',
            age: 28,
            skills: ['JavaScript', 'HTML', 'CSS'],
            address: { city: '北京', district: '朝阳区' },
            active: true
        }, null, 2);
    }

    function onFormatClick() {
        if (!jsonFormatInput) { return; }
        const v = jsonFormatInput.value.trim();
        if (!v) { showToast('请先输入JSON数据'); return; }

        const formatted = formatJson(v);
        if (formatted === null) {
            showToast('JSON格式错误，请检查输入');
            return;
        }
        if (formatOutput) { formatOutput.value = formatted; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'block'; }
        if (formatCharCount) { formatCharCount.textContent = formatted.length + ' 字符'; }
    }

    function onClearFormatClick() {
        if (jsonFormatInput) { jsonFormatInput.value = ''; }
        if (formatOutput) { formatOutput.value = ''; }
        if (formatOutputGroup) { formatOutputGroup.style.display = 'none'; }
    }

    function onDemoFormatClick() {
        if (jsonFormatInput) { jsonFormatInput.value = demoJson(); }
    }

    function onCopyFormatClick() {
        if (!formatOutput) { return; }
        copyText(formatOutput.value, '已复制格式化结果');
    }

    document.getElementById('btnDoFormat').addEventListener('click', onFormatClick);
    document.getElementById('btnClearFormat').addEventListener('click', onClearFormatClick);
    document.getElementById('btnDemoFormat').addEventListener('click', onDemoFormatClick);
    document.getElementById('btnCopyFormat').addEventListener('click', onCopyFormatClick);

    function onMinClick() {
        if (!jsonMinInput) { return; }
        const v = jsonMinInput.value.trim();
        if (!v) { showToast('请先输入JSON数据'); return; }

        const minified = minifyJson(v);
        if (minified === null) {
            showToast('JSON格式错误，请检查输入');
            return;
        }
        if (minOutput) { minOutput.value = minified; }
        if (minOutputGroup) { minOutputGroup.style.display = 'block'; }
        if (minCharCount) { minCharCount.textContent = minified.length + ' 字符'; }
    }

    function onClearMinClick() {
        if (jsonMinInput) { jsonMinInput.value = ''; }
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

    function onValidateClick() {
        if (!jsonValidateInput) { return; }
        const v = jsonValidateInput.value;
        if (!v.trim()) { showToast('请先输入JSON数据'); return; }

        const issues = validateJson(v);
        let htmlOut = '';
        issues.forEach((is) => {
            const icon = is.type === 'error' ? '❌' : (is.type === 'warn' ? '⚠️' : '✅');
            htmlOut += '<div class="issue issue-' + is.type + '">';
            htmlOut += '<span class="issue-icon">' + icon + '</span>';
            htmlOut += '<span style="white-space:pre-wrap;font-family:var(--font-mono);font-size:0.82rem;">' + is.msg + '</span></div>';
        });
        if (validateOutput) { validateOutput.innerHTML = htmlOut; }
        if (validateOutputGroup) { validateOutputGroup.style.display = 'block'; }
    }

    function onClearValidateClick() {
        if (jsonValidateInput) { jsonValidateInput.value = ''; }
        if (validateOutput) { validateOutput.innerHTML = ''; }
        if (validateOutputGroup) { validateOutputGroup.style.display = 'none'; }
    }

    document.getElementById('btnDoValidate').addEventListener('click', onValidateClick);
    document.getElementById('btnClearValidate').addEventListener('click', onClearValidateClick);

    function onConvertClick() {
        if (!jsonConvertInput) { return; }
        const v = jsonConvertInput.value.trim();
        if (!v) { showToast('请先输入JSON数据'); return; }

        const result = jsonToJs(v);
        if (result === null) {
            showToast('JSON格式错误，请检查输入');
            return;
        }
        if (convertOutput) { convertOutput.value = result; }
        if (convertOutputGroup) { convertOutputGroup.style.display = 'block'; }
        if (convertCharCount) { convertCharCount.textContent = result.length + ' 字符'; }
    }

    function onClearConvertClick() {
        if (jsonConvertInput) { jsonConvertInput.value = ''; }
        if (convertOutput) { convertOutput.value = ''; }
        if (convertOutputGroup) { convertOutputGroup.style.display = 'none'; }
    }

    function onDemoConvertClick() {
        if (jsonConvertInput) { jsonConvertInput.value = demoJson(); }
    }

    function onCopyConvertClick() {
        if (!convertOutput) { return; }
        copyText(convertOutput.value, '已复制转换结果');
    }

    document.getElementById('btnDoConvert').addEventListener('click', onConvertClick);
    document.getElementById('btnClearConvert').addEventListener('click', onClearConvertClick);
    document.getElementById('btnDemoConvert').addEventListener('click', onDemoConvertClick);
    document.getElementById('btnCopyConvert').addEventListener('click', onCopyConvertClick);

    // ---- YAML panel ----
    const jsonYamlInput   = document.getElementById('jsonYamlInput');
    const yamlOutput      = document.getElementById('yamlOutput');
    const yamlOutputGroup = document.getElementById('yamlOutputGroup');
    const yamlCharCount   = document.getElementById('yamlCharCount');

    panels.yaml  = document.getElementById('panelYaml');
    panels.xml   = document.getElementById('panelXml');
    navBtns.yaml = document.getElementById('btnYaml');
    navBtns.xml  = document.getElementById('btnXml');

    function jsonToYaml(text) {
        try {
            var obj = JSON.parse(text);
            if (typeof jsyaml !== 'undefined') return jsyaml.dump(obj);
            return simpleJsonToYaml(obj, 0);
        } catch (e) { return null; }
    }
    function simpleJsonToYaml(obj, indent) {
        var sp = '  '.repeat(indent), r = '';
        if (Array.isArray(obj)) {
            obj.forEach(function(item) {
                if (typeof item === 'object' && item !== null) {
                    r += sp + '-\n' + simpleJsonToYaml(item, indent + 1);
                } else {
                    r += sp + '- ' + yamlVal(item) + '\n';
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(function(k) {
                var v = obj[k];
                if (typeof v === 'object' && v !== null) {
                    r += sp + k + ':\n' + simpleJsonToYaml(v, indent + 1);
                } else {
                    r += sp + k + ': ' + yamlVal(v) + '\n';
                }
            });
        } else {
            r += sp + yamlVal(obj) + '\n';
        }
        return r;
    }
    function yamlVal(v) {
        if (v === null) return 'null';
        if (typeof v === 'string') { if (/[:\n"']/.test(v)) return '"' + v.replace(/"/g, '\\"') + '"'; return v; }
        return String(v);
    }

    function jsonToXml(text) {
        try {
            var obj = JSON.parse(text);
            return '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n' + objToXml(obj, '  ') + '</root>';
        } catch (e) { return null; }
    }
    function objToXml(obj, indent) {
        var r = '';
        if (Array.isArray(obj)) {
            obj.forEach(function(item) {
                if (typeof item === 'object' && item !== null) {
                    r += indent + '<item>\n' + objToXml(item, indent + '  ') + indent + '</item>\n';
                } else {
                    r += indent + '<item>' + xmlEsc(item) + '</item>\n';
                }
            });
        } else if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(function(k) {
                var v = obj[k], tag = k.replace(/[^a-zA-Z0-9_-]/g, '_');
                if (typeof v === 'object' && v !== null) {
                    r += indent + '<' + tag + '>\n' + objToXml(v, indent + '  ') + indent + '</' + tag + '>\n';
                } else {
                    r += indent + '<' + tag + '>' + xmlEsc(v) + '</' + tag + '>\n';
                }
            });
        } else {
            r += indent + xmlEsc(obj) + '\n';
        }
        return r;
    }
    function xmlEsc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

    function onYamlClick() {
        if (!jsonYamlInput) return;
        var v = jsonYamlInput.value.trim();
        if (!v) { showToast('请先输入JSON数据'); return; }
        var r = jsonToYaml(v);
        if (r === null) { showToast('JSON格式错误，请检查输入'); return; }
        if (yamlOutput) yamlOutput.value = r;
        if (yamlOutputGroup) yamlOutputGroup.style.display = 'block';
        if (yamlCharCount) yamlCharCount.textContent = r.length + ' 字符';
    }
    function onClearYamlClick() {
        if (jsonYamlInput) jsonYamlInput.value = '';
        if (yamlOutput) yamlOutput.value = '';
        if (yamlOutputGroup) yamlOutputGroup.style.display = 'none';
    }
    function onDemoYamlClick() {
        if (jsonYamlInput) jsonYamlInput.value = demoJson();
    }
    function onCopyYamlClick() {
        if (!yamlOutput) return;
        copyText(yamlOutput.value, '已复制YAML结果');
    }
    document.getElementById('btnDoYaml').addEventListener('click', onYamlClick);
    document.getElementById('btnClearYaml').addEventListener('click', onClearYamlClick);
    document.getElementById('btnDemoYaml').addEventListener('click', onDemoYamlClick);
    document.getElementById('btnCopyYaml').addEventListener('click', onCopyYamlClick);

    // ---- XML panel ----
    const jsonXmlInput   = document.getElementById('jsonXmlInput');
    const xmlOutput      = document.getElementById('xmlOutput');
    const xmlOutputGroup = document.getElementById('xmlOutputGroup');
    const xmlCharCount   = document.getElementById('xmlCharCount');

    function onXmlClick() {
        if (!jsonXmlInput) return;
        var v = jsonXmlInput.value.trim();
        if (!v) { showToast('请先输入JSON数据'); return; }
        var r = jsonToXml(v);
        if (r === null) { showToast('JSON格式错误，请检查输入'); return; }
        if (xmlOutput) xmlOutput.value = r;
        if (xmlOutputGroup) xmlOutputGroup.style.display = 'block';
        if (xmlCharCount) xmlCharCount.textContent = r.length + ' 字符';
    }
    function onClearXmlClick() {
        if (jsonXmlInput) jsonXmlInput.value = '';
        if (xmlOutput) xmlOutput.value = '';
        if (xmlOutputGroup) xmlOutputGroup.style.display = 'none';
    }
    function onDemoXmlClick() {
        if (jsonXmlInput) jsonXmlInput.value = demoJson();
    }
    function onCopyXmlClick() {
        if (!xmlOutput) return;
        copyText(xmlOutput.value, '已复制XML结果');
    }
    document.getElementById('btnDoXml').addEventListener('click', onXmlClick);
    document.getElementById('btnClearXml').addEventListener('click', onClearXmlClick);
    document.getElementById('btnDemoXml').addEventListener('click', onDemoXmlClick);
    document.getElementById('btnCopyXml').addEventListener('click', onCopyXmlClick);

    navBtns.yaml.addEventListener('click', function() { switchMode('yaml'); });
    navBtns.xml.addEventListener('click', function() { switchMode('xml'); });

})();
