(function () {
    'use strict';

    var sb = document.getElementById('sidebar');
    var mb = document.getElementById('mobileMenuToggle');
    var mc = document.getElementById('mainContent');
    var so = false, ov = null;
    var charts = {};

    var panels = {
        line: document.getElementById('panelLine'),
        nightingale: document.getElementById('panelNightingale'),
        radar: document.getElementById('panelRadar')
    };
    var btns = {
        line: document.getElementById('btnLine'),
        nightingale: document.getElementById('btnNightingale'),
        radar: document.getElementById('btnRadar')
    };

    var toast = document.getElementById('toast');
    var toastMsg = toast ? document.getElementById('toastMsg') : null;
    var toastTimer = null;

    function showToast(m) {
        if (!toast || !toastMsg) return;
        if (toastTimer) clearTimeout(toastTimer);
        toastMsg.textContent = m;
        toast.classList.add('show');
        toastTimer = setTimeout(function () {
            toast.classList.remove('show');
            toastTimer = null;
        }, 2200);
    }

    function go() { if (!ov) { ov = document.createElement('div'); ov.className = 'sidebar-overlay'; ov.addEventListener('click', cs); document.body.appendChild(ov); } return ov; }
    function os() { sb.classList.add('open'); go().classList.add('visible'); so = true; }
    function cs() { sb.classList.remove('open'); go().classList.remove('visible'); so = false; }
    mb.addEventListener('click', function () { so ? cs() : os(); });
    mc.addEventListener('click', function (e) { if (so && window.innerWidth <= 900 && !sb.contains(e.target) && e.target !== mb) cs(); });

    function switchMode(m) {
        Object.keys(panels).forEach(function (k) {
            panels[k].style.display = k === m ? 'block' : 'none';
            btns[k].classList.toggle('active', k === m);
        });
    }
    Object.keys(btns).forEach(function (k) {
        btns[k].addEventListener('click', function () { switchMode(k); });
    });

    function parseData(id) { return document.getElementById(id).value.split(',').map(function (v) { return parseFloat(v.trim()) || 0; }); }
    function parseLabels(id) { return document.getElementById(id).value.split(',').map(function (v) { return v.trim(); }); }

    var colors = ['#5b8def', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    document.getElementById('btnDrawLine').addEventListener('click', function () {
        if (charts.line) charts.line.destroy();
        var ctx = document.getElementById('lineCanvas').getContext('2d');
        charts.line = new Chart(ctx, {
            type: 'line',
            data: { labels: parseLabels('lineLabels'), datasets: [{ label: '数据', data: parseData('lineData'), borderColor: colors[0], backgroundColor: colors[0] + '20', borderWidth: 2, fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    });

    document.getElementById('btnDrawRose').addEventListener('click', function () {
        if (charts.rose) charts.rose.destroy();
        var ctx = document.getElementById('roseCanvas').getContext('2d');
        var labels = parseLabels('roseLabels'), data = parseData('roseData');
        var bg = colors.slice(0, data.length);
        charts.rose = new Chart(ctx, {
            type: 'polarArea',
            data: { labels: labels, datasets: [{ data: data, backgroundColor: bg }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    });

    document.getElementById('btnDrawRadar').addEventListener('click', function () {
        if (charts.radar) charts.radar.destroy();
        var ctx = document.getElementById('radarCanvas').getContext('2d');
        charts.radar = new Chart(ctx, {
            type: 'radar',
            data: { labels: parseLabels('radarLabels'), datasets: [{ label: '能力值', data: parseData('radarData'), borderColor: colors[0], backgroundColor: colors[0] + '30', borderWidth: 2 }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } } }
        });
    });

    function exportChart(chartKey, canvasId, name) {
        if (!charts[chartKey]) { showToast('请先绘制图表'); return; }
        var src = document.getElementById(canvasId);
        var tmp = document.createElement('canvas');
        tmp.width = src.width;
        tmp.height = src.height;
        var tctx = tmp.getContext('2d');
        tctx.fillStyle = '#ffffff';
        tctx.fillRect(0, 0, tmp.width, tmp.height);
        tctx.drawImage(src, 0, 0);
        var dataUrl = tmp.toDataURL('image/png');
        if (!dataUrl || dataUrl === 'data:,') { showToast('导出失败'); return; }

        if (typeof plus !== 'undefined' && plus.gallery) {
            var bitmap = new plus.nativeObj.Bitmap('chart-bitmap-' + Date.now());
            bitmap.loadBase64Data(dataUrl, function () {
                var filename = name + '_' + Date.now() + '.png';
                bitmap.save('_doc/' + filename, { overwrite: true }, function (res) {
                    plus.gallery.save(res.target, function () {
                        showToast('图表已保存到相册');
                    }, function () {
                        showToast('保存到相册失败，已保存到应用目录');
                    });
                    bitmap.clear();
                }, function () {
                    showToast('保存失败');
                    bitmap.clear();
                });
            }, function () {
                showToast('保存失败');
                bitmap.clear();
            });
        } else {
            var a = document.createElement('a');
            a.href = dataUrl;
            a.download = name + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast('图表已下载');
        }
    }

    document.getElementById('btnExportLine').addEventListener('click', function () { exportChart('line', 'lineCanvas', 'line_chart'); });
    document.getElementById('btnExportRose').addEventListener('click', function () { exportChart('rose', 'roseCanvas', 'rose_chart'); });
    document.getElementById('btnExportRadar').addEventListener('click', function () { exportChart('radar', 'radarCanvas', 'radar_chart'); });

    document.getElementById('chartSubtitle').textContent = '折线图 / 南丁格尔玫瑰图 / 雷达图 - 在线可视化';
})();
