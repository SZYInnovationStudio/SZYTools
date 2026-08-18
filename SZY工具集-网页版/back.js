(function () {
    'use strict';

    var path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (path === '' || path === 'index.html') {
        return;
    }

    function inject() {
        if (document.getElementById('szy-back-btn')) {
            return;
        }

        var style = document.createElement('style');
        style.textContent = '.szy-back-btn{position:fixed;bottom:24px;right:24px;width:48px;height:48px;border:none;border-radius:50%;background:linear-gradient(135deg,#5b8def,#4a7de0);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(91,141,239,.35);z-index:9999;transition:transform .2s ease,box-shadow .2s ease;-webkit-tap-highlight-color:transparent}.szy-back-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(91,141,239,.5)}.szy-back-btn:active{transform:scale(.94)}.szy-back-btn svg{width:22px;height:22px}@media(max-width:600px){.szy-back-btn{bottom:20px;right:20px;width:44px;height:44px}.szy-back-btn svg{width:20px;height:20px}}';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'szy-back-btn';
        btn.className = 'szy-back-btn';
        btn.setAttribute('aria-label', '返回上一级');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>';

        document.head.appendChild(style);
        document.body.appendChild(btn);

        btn.addEventListener('click', function () {
            window.location.href = '../index.html';
        });
    }

    if (document.body) {
        inject();
    } else {
        document.addEventListener('DOMContentLoaded', inject);
    }
})();
