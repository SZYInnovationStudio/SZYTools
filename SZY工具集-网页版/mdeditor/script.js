(function () {
    'use strict';

    var sidebar = document.getElementById('sidebar');
    var mobileMenuToggle = document.getElementById('mobileMenuToggle');
    var mainContent = document.getElementById('mainContent');
    var tabRichtext = document.getElementById('tabRichtext');
    var tabMdsource = document.getElementById('tabMdsource');
    var richtextToolbar = document.getElementById('richtextToolbar');
    var richtextEditor = document.getElementById('richtextEditor');
    var mdEditor = document.getElementById('mdEditor');
    var editorLabel = document.getElementById('editorLabel');
    var charCount = document.getElementById('charCount');
    var previewContent = document.getElementById('previewContent');
    var btnExportTxt = document.getElementById('btnExportTxt');
    var btnExportMd = document.getElementById('btnExportMd');
    var btnExportHtml = document.getElementById('btnExportHtml');
    var toast = document.getElementById('toast');
    var toastMsg = document.getElementById('toastMsg');
    var dividerBar = document.getElementById('dividerBar');

    var currentMode = 'richtext';
    var sidebarOpen = false;
    var toastTimer = null;
    var overlayEl = null;
    var previewTimer = null;
    var previewPending = false;
    var lastMdCache = ''; 

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
        sidebar.classList.add('open');
        getOverlay().classList.add('visible');
        sidebarOpen = true;
        document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
        sidebar.classList.remove('open');
        getOverlay().classList.remove('visible');
        sidebarOpen = false;
        document.body.style.overflow = '';
    }
    mobileMenuToggle.addEventListener('click', function () { sidebarOpen ? closeSidebar() : openSidebar(); });
    mainContent.addEventListener('click', function (e) {
        if (sidebarOpen && window.innerWidth <= 900) {
            if (!sidebar.contains(e.target) && e.target !== mobileMenuToggle && !mobileMenuToggle.contains(e.target)) {
                closeSidebar();
            }
        }
    });
    window.addEventListener('resize', function () {
        if (window.innerWidth > 900 && sidebarOpen) closeSidebar();
    });

    function switchMode(mode) {
        if (currentMode === mode) return;
        if (currentMode === 'richtext') {
            mdEditor.value = htmlToMarkdown(richtextEditor.innerHTML);
        } else {
            richtextEditor.innerHTML = mdToHtml(mdEditor.value);
        }
        currentMode = mode;
        applyModeUI();
        updateCharCount();
        doPreview();
    }

    function applyModeUI() {
        var isRichtext = currentMode === 'richtext';
        tabRichtext.classList.toggle('active', isRichtext);
        tabMdsource.classList.toggle('active', !isRichtext);
        richtextToolbar.classList.toggle('hidden', !isRichtext);
        richtextEditor.classList.toggle('hidden', !isRichtext);
        mdEditor.classList.toggle('hidden', isRichtext);
        editorLabel.textContent = isRichtext ? '编辑区' : 'MD源码';
    }

    tabRichtext.addEventListener('click', function () { switchMode('richtext'); });
    tabMdsource.addEventListener('click', function () { switchMode('mdsource'); });

    function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    function mdToHtml(md) {
        if (!md || !md.trim()) return '<p></p>';
        if (md.length > 80000) md = md.substring(0, 80000);
        var lines = md.split('\n');
        if (lines.length > 3000) lines = lines.slice(0, 3000);
        var out = '';
        var i = 0, inList = false, listTag = '';
        var maxIter = lines.length * 3; 

        function closeList() { if (inList) { out += '</' + listTag + '>'; inList = false; } }

        while (i < lines.length) {
            if (--maxIter <= 0) break; 
            var line = lines[i];
            if (/^```/.test(line)) {
                closeList();
                var codeLines = []; i++;
                while (i < lines.length && !/^```/.test(lines[i])) { codeLines.push(lines[i]); i++; }
                out += '<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>';
                i++; continue;
            }
            if (/^>\s/.test(line)) {
                closeList();
                var q = []; while (i < lines.length && /^>\s/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/,'')); i++; }
                out += '<blockquote>' + inlineParse(q.join('\n')) + '</blockquote>';
                continue;
            }
            if (/^\|.+\|$/.test(line) && i+1 < lines.length && /^\|[-:\s|]+\|$/.test(lines[i+1])) {
                closeList();
                var t = '<table><thead><tr>';
                line.split('|').filter(function(c){return c.trim();}).forEach(function(h){t+='<th>'+inlineParse(h.trim())+'</th>';});
                t+='</tr></thead><tbody>'; i+=2;
                while (i < lines.length && /^\|.+\|$/.test(lines[i])) {
                    t+='<tr>';
                    lines[i].split('|').filter(function(c){return c.trim();}).forEach(function(c){t+='<td>'+inlineParse(c.trim())+'</td>';});
                    t+='</tr>'; i++;
                }
                out += t + '</tbody></table>'; continue;
            }
            if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { closeList(); out+='<hr>'; i++; continue; }
            var hm = line.match(/^(#{1,6})\s+(.+)/);
            if (hm) { closeList(); out+='<h'+hm[1].length+'>'+inlineParse(hm[2])+'</h'+hm[1].length+'>'; i++; continue; }
            var um = line.match(/^(\s*)[-*+]\s+(.+)/);
            if (um) { if(!inList||listTag!=='ul'){closeList();inList=true;listTag='ul';out+='<ul>';} out+='<li>'+inlineParse(um[2])+'</li>'; i++; continue; }
            var om = line.match(/^(\s*)\d+\.\s+(.+)/);
            if (om) { if(!inList||listTag!=='ol'){closeList();inList=true;listTag='ol';out+='<ol>';} out+='<li>'+inlineParse(om[2])+'</li>'; i++; continue; }
            closeList();
            if (line.trim()==='') { i++; continue; }
            var pLines = [];
            while (i<lines.length && lines[i].trim()!==''&&!/^(#|>|-|\*|\+|\d+\.|```|\|)/.test(lines[i])) { pLines.push(lines[i]); i++; }
            if (pLines.length) out+='<p>'+inlineParse(pLines.join('\n'))+'</p>';
            else { i++; } 
        }
        closeList();
        return out;
    }

    function inlineParse(t) {
        if (!t) return '';
        try {
            t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
            t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
            t = t.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
            t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            t = t.replace(/__(.+?)__/g, '<strong>$1</strong>');
            t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
            t = t.replace(/_(.+?)_/g, '<em>$1</em>');
            t = t.replace(/~~(.+?)~~/g, '<del>$1</del>');
            t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
            return t.replace(/\n/g, '<br>');
        } catch (e) { return t; }
    }

    function htmlToMarkdown(html) {
        if (!html || !html.trim()) return '';
        var div = document.createElement('div');
        div.innerHTML = html;
        return cleanMd(walkNodes(div));
    }

    function cleanMd(s) {
        return s.replace(/\n{3,}/g, '\n\n').trim();
    }

    function walkNodes(el) {
        var r = '';
        var child = el.firstChild;
        while (child) {
            if (child.nodeType === 3) {
                var v = child.nodeValue;
                if (v && /\S/.test(v)) r += v;
            } else if (child.nodeType === 1) {
                r += tagToMd(child);
            }
            child = child.nextSibling;
        }
        return r;
    }

    function tagToMd(el) {
        var tag = el.nodeName.toLowerCase();
        var inner = walkNodes(el);

        if (tag === 'h1') return '\n# ' + inner + '\n';
        if (tag === 'h2') return '\n## ' + inner + '\n';
        if (tag === 'h3') return '\n### ' + inner + '\n';
        if (tag === 'h4') return '\n#### ' + inner + '\n';
        if (tag === 'h5') return '\n##### ' + inner + '\n';
        if (tag === 'h6') return '\n###### ' + inner + '\n';
        if (tag === 'p')  return inner + '\n';
        if (tag === 'br') return '\n';
        if (tag === 'b' || tag === 'strong') return '**' + inner + '**';
        if (tag === 'i' || tag === 'em')     return '*' + inner + '*';
        if (tag === 'u')  return inner;
        if (tag === 's' || tag === 'del' || tag === 'strike') return '~~' + inner + '~~';
        if (tag === 'code') return '`' + inner + '`';
        if (tag === 'pre')  return '\n```\n' + inner + '\n```\n';
        if (tag === 'a')    return '[' + inner + '](' + (el.getAttribute('href')||'') + ')';
        if (tag === 'img')  return '![' + (el.getAttribute('alt')||'') + '](' + (el.getAttribute('src')||'') + ')';
        if (tag === 'ul')   return '\n' + listToMd(el, false);
        if (tag === 'ol')   return '\n' + listToMd(el, true);
        if (tag === 'li')   return inner;
        if (tag === 'blockquote') {
            var ls = inner.split('\n');
            return '\n> ' + ls.join('\n> ') + '\n';
        }
        if (tag === 'hr') return '\n---\n';
        return inner;
    }

    function listToMd(listEl, ordered) {
        var r = '', c = 0;
        var child = listEl.firstChild;
        while (child) {
            if (child.nodeType === 1 && child.nodeName.toLowerCase() === 'li') {
                r += (ordered ? (++c)+'. ' : '- ') + walkNodes(child).trim() + '\n';
            }
            child = child.nextSibling;
        }
        return r;
    }

    function schedulePreview() {
        if (previewTimer) clearTimeout(previewTimer);
        previewTimer = setTimeout(doPreview, 300);
    }

    function doPreview() {
        previewTimer = null;
        if (previewPending) return;
        previewPending = true;

        try {
            if (currentMode === 'richtext') {
                var md = htmlToMarkdown(richtextEditor.innerHTML);
                if (md !== lastMdCache) {
                    lastMdCache = md;
                    previewContent.textContent = md;
                    previewContent.className = 'preview-content preview-md';
                }
            } else {
                var mdVal = mdEditor.value;
                if (mdVal !== lastMdCache) {
                    lastMdCache = mdVal;
                    previewContent.className = 'preview-content';
                    previewContent.innerHTML = mdToHtml(mdVal);
                }
            }
        } catch (e) {
        }
        previewPending = false;
    }

    richtextEditor.addEventListener('input', function () {
        updateCharCount();
        schedulePreview();
    });
    mdEditor.addEventListener('input', function () {
        updateCharCount();
        schedulePreview();
    });

    function updateCharCount() {
        var text = currentMode === 'richtext' ? (richtextEditor.textContent || '') : (mdEditor.value || '');
        charCount.textContent = text.length + ' 字符';
    }

    richtextToolbar.addEventListener('mousedown', function (e) {
        var btn = e.target.closest('.toolbar-btn');
        if (!btn) return;
        e.preventDefault();
        var cmd = btn.getAttribute('data-cmd');
        var val = btn.getAttribute('data-val') || null;
        if (cmd === 'createLink') {
            var url = prompt('请输入链接地址：', 'https://');
            if (url) document.execCommand(cmd, false, url);
        } else if (cmd === 'formatBlock') {
            document.execCommand(cmd, false, val);
        } else {
            document.execCommand(cmd, false, null);
        }
        richtextEditor.focus();
        updateCharCount();
        schedulePreview();
    });

    var isDragging = false, startX, startW;
    dividerBar.addEventListener('mousedown', function (e) {
        isDragging = true;
        dividerBar.classList.add('active');
        startX = e.clientX;
        startW = dividerBar.parentElement.querySelector('.editor-panel').getBoundingClientRect().width;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    });
    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        var ep = dividerBar.parentElement.querySelector('.editor-panel');
        var pp = dividerBar.parentElement.querySelector('.preview-panel');
        var tw = dividerBar.parentElement.getBoundingClientRect().width - dividerBar.offsetWidth;
        var nw = startW + (e.clientX - startX);
        if (nw >= tw*0.2 && nw <= tw*0.8) {
            var pct = (nw/tw)*100;
            ep.style.flex = 'none'; ep.style.width = pct+'%';
            pp.style.flex = 'none'; pp.style.width = (100-pct)+'%';
        }
    });
    document.addEventListener('mouseup', function () {
        if (isDragging) { isDragging = false; dividerBar.classList.remove('active'); document.body.style.userSelect = ''; document.body.style.cursor = ''; }
    });

    function getMdContent() {
        return currentMode === 'mdsource' ? mdEditor.value : htmlToMarkdown(richtextEditor.innerHTML);
    }
    function getPlainText() {
        if (currentMode === 'mdsource') {
            var d = document.createElement('div'); d.innerHTML = mdToHtml(mdEditor.value); return d.textContent || '';
        }
        return richtextEditor.textContent || '';
    }
    function getHtmlContent() {
        return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>导出的文档</title>\n<style>\nbody{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.8;color:#1f2937;}\nh1{font-size:1.8rem;border-bottom:2px solid #e5e7eb;padding-bottom:8px;}h2{font-size:1.4rem;}h3{font-size:1.15rem;}\ncode{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:monospace;}\npre{background:#1f2937;color:#e5e7eb;padding:14px 18px;border-radius:8px;overflow-x:auto;}\npre code{background:none;padding:0;}blockquote{border-left:4px solid #5b8def;padding:8px 16px;background:#e8f0fe;margin:10px 0;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #e5e7eb;padding:8px 12px;}th{background:#f9fafb;}\n</style>\n</head>\n<body>\n' + mdToHtml(getMdContent()) + '\n</body>\n</html>';
    }

    function downloadFile(content, filename, mime) {
        var b = new Blob([content], {type:mime});
        var u = URL.createObjectURL(b);
        var a = document.createElement('a'); a.href=u; a.download=filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(u);
    }

    btnExportTxt.addEventListener('click', function () {
        var t = getPlainText();
        if (!t.trim()) { showToast('没有可导出的内容'); return; }
        downloadFile(t, 'document.txt', 'text/plain;charset=utf-8');
        showToast('已导出 TXT');
    });
    btnExportMd.addEventListener('click', function () {
        var m = getMdContent();
        if (!m.trim()) { showToast('没有可导出的内容'); return; }
        downloadFile(m, 'document.md', 'text/markdown;charset=utf-8');
        showToast('已导出 MD');
    });
    btnExportHtml.addEventListener('click', function () {
        var h = getHtmlContent();
        if (!h.trim()) { showToast('没有可导出的内容'); return; }
        downloadFile(h, 'document.html', 'text/html;charset=utf-8');
        showToast('已导出 HTML');
    });

    function showToast(msg) {
        if (toastTimer) clearTimeout(toastTimer);
        toastMsg.textContent = msg;
        toast.classList.add('show');
        toastTimer = setTimeout(function () { toast.classList.remove('show'); toastTimer = null; }, 2000);
    }

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); btnExportMd.click(); }
        if (e.key === 'Escape' && sidebarOpen) closeSidebar();
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') { e.preventDefault(); btnExportHtml.click(); }
    });

    function init() {
        mdEditor.value = htmlToMarkdown(richtextEditor.innerHTML);
        applyModeUI();
        updateCharCount();
        doPreview();
    }
    init();
})();
