(function () {
    'use strict';

    var s = document.getElementById('sidebar');
    var m = document.getElementById('mobileMenuToggle');
    var c = document.getElementById('mainContent');
    var r = document.getElementById('result');
    var t = document.getElementById('toast');
    var tm = document.getElementById('toastMsg');
    var so = false, tt = null, ov = null;

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

    var B64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    function to64(v, n) {
        v = v >>> 0;
        var out = '';
        while (--n >= 0) {
            out += B64.charAt(v & 0x3f);
            v >>>= 6;
        }
        return out;
    }

    function apr1Crypt(password, salt) {
        var ctx = CryptoJS.algo.MD5.create();
        ctx.update(password);
        ctx.update('$apr1$');
        ctx.update(salt);

        var ctx1 = CryptoJS.MD5(password + salt + password);
        var ctx1Bytes = ctx1.toString(CryptoJS.enc.Latin1);
        var pl = password.length;
        var n = pl;
        while (n > 0) {
            var take = Math.min(n, 16);
            ctx.update(CryptoJS.enc.Latin1.parse(ctx1Bytes.substring(0, take)));
            n -= take;
        }

        for (var i = pl; i > 0; i >>= 1) {
            if (i & 1) {
                ctx.update(CryptoJS.enc.Latin1.parse('\x00'));
            } else {
                ctx.update(password.charAt(0));
            }
        }

        var final = ctx.finalize();

        for (var j = 0; j < 1000; j++) {
            var ctx2 = CryptoJS.algo.MD5.create();
            if (j & 1) { ctx2.update(password); } else { ctx2.update(final); }
            if (j % 3) { ctx2.update(salt); }
            if (j % 7) { ctx2.update(password); }
            if (j & 1) { ctx2.update(final); } else { ctx2.update(password); }
            final = ctx2.finalize();
        }

        var bytes = [];
        for (var k = 0; k < final.words.length; k++) {
            var w = final.words[k] >>> 0;
            bytes.push((w >>> 24) & 0xff, (w >>> 16) & 0xff, (w >>> 8) & 0xff, w & 0xff);
        }

        var enc = '';
        enc += to64((bytes[0] << 16) | (bytes[6] << 8) | bytes[12], 4);
        enc += to64((bytes[1] << 16) | (bytes[7] << 8) | bytes[13], 4);
        enc += to64((bytes[2] << 16) | (bytes[8] << 8) | bytes[14], 4);
        enc += to64((bytes[3] << 16) | (bytes[9] << 8) | bytes[15], 4);
        enc += to64((bytes[4] << 16) | (bytes[10] << 8) | bytes[5], 4);
        enc += to64(bytes[11], 2);

        return '$apr1$' + salt + '$' + enc;
    }

    function randomSalt() {
        var out = '';
        for (var i = 0; i < 8; i++) {
            out += B64.charAt(Math.floor(Math.random() * 64));
        }
        return out;
    }

    document.getElementById('btnGenerate').addEventListener('click', function () {
        var user = document.getElementById('username').value;
        var pwd = document.getElementById('password').value;
        if (!user || !pwd) { st('请输入用户名和密码'); return; }

        var alg = document.getElementById('algorithm').value;
        var hash;
        if (alg === 'apr1') {
            hash = apr1Crypt(pwd, randomSalt());
        } else {
            hash = '{SHA}' + CryptoJS.SHA1(pwd).toString(CryptoJS.enc.Base64);
        }
        r.value = user + ':' + hash;
        document.getElementById('outputGroup').style.display = 'flex';
    });

    document.getElementById('btnCopy').addEventListener('click', function () {
        if (!r.value) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(r.value).then(function () { st('已复制到剪贴板'); });
        } else {
            var ta = document.createElement('textarea');
            ta.value = r.value;
            ta.style.cssText = 'position:fixed;left:-9999px;';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            st('已复制到剪贴板');
        }
    });

    function st(msg) {
        tm.textContent = msg;
        t.classList.add('show');
        if (tt) clearTimeout(tt);
        tt = setTimeout(function () { t.classList.remove('show'); }, 2000);
    }
})();
