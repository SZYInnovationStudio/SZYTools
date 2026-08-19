(function () {
    'use strict';

    var s = document.getElementById('sidebar');
    var m = document.getElementById('mobileMenuToggle');
    var c = document.getElementById('mainContent');
    var fi = document.getElementById('fileInput');
    var st = document.getElementById('strength');
    var sv = document.getElementById('strengthVal');
    var cn = document.getElementById('canvas');
    var rg = document.getElementById('resultGroup');
    var dl = document.getElementById('downloadLink');
    var ba = document.getElementById('btnApply');

    var so = false, ov = null, imgData = null, aw = 0, ah = 0;

    function go() {
        if (!ov) {
            ov = document.createElement('div');
            ov.className = 'sidebar-overlay';
            ov.addEventListener('click', cs);
            document.body.appendChild(ov);
        }
        return ov;
    }
    function os() { s.classList.add('open'); go().classList.add('visible'); so = true; }
    function cs() { s.classList.remove('open'); go().classList.remove('visible'); so = false; }

    m.addEventListener('click', function () { so ? cs() : os(); });
    c.addEventListener('click', function (e) {
        if (so && window.innerWidth <= 900 && !s.contains(e.target) && e.target !== m) cs();
    });

    if (st && sv) {
        st.addEventListener('input', function () {
            sv.textContent = st.value;
        });
    }

    fi.addEventListener('change', function () {
        var file = fi.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (e) {
            var img = new Image();
            img.onload = function () {
                imgData = img;
                aw = img.width;
                ah = img.height;
                cn.width = aw;
                cn.height = ah;
                cn.getContext('2d').drawImage(img, 0, 0);
                rg.style.display = 'block';
                dl.style.display = 'none';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    ba.addEventListener('click', function () {
        if (!imgData) return;
        var strength = st ? parseInt(st.value, 10) : 2;
        if (isNaN(strength) || strength < 1) strength = 1;

        var ctx = cn.getContext('2d');
        var d = ctx.getImageData(0, 0, aw, ah);
        var p = d.data;
        var out = new Uint8ClampedArray(p);

        var k = [
            0, -strength, 0,
            -strength, 4 * strength + 1, -strength,
            0, -strength, 0
        ];

        for (var y = 1; y < ah - 1; y++) {
            for (var x = 1; x < aw - 1; x++) {
                for (var ch = 0; ch < 3; ch++) {
                    var sum = 0;
                    for (var ky = -1; ky <= 1; ky++) {
                        for (var kx = -1; kx <= 1; kx++) {
                            sum += p[((y + ky) * aw + (x + kx)) * 4 + ch] * k[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    out[(y * aw + x) * 4 + ch] = Math.min(255, Math.max(0, sum));
                }
                out[(y * aw + x) * 4 + 3] = 255;
            }
        }

        d.data.set(out);
        ctx.putImageData(d, 0, 0);

        dl.href = cn.toDataURL('image/png');
        dl.download = 'sharpened.png';
        dl.textContent = '📥 下载 PNG';
        dl.style.display = 'inline-flex';
    });
})();
