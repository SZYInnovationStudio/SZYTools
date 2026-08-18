/**
 * SZY工具集 - 移动端公共脚本
 * 1. 外链（http/https）统一调用系统浏览器打开，避免在 WebView 内跳转
 * 2. 在 HBuilderX 5+ App 环境下拦截系统返回键，优先返回上一页面而非直接退出
 * 在浏览器环境下依赖浏览器默认行为
 */
(function () {
    'use strict';

    // --- 外链统一用系统浏览器打开 ---
    // 拦截所有 http/https 链接点击，在 App 环境下交给系统浏览器，避免在 WebView 内跳转
    document.addEventListener('click', function (e) {
        var el = e.target;
        while (el && el !== document && el.tagName !== 'A') {
            el = el.parentNode;
        }
        if (!el || el.tagName !== 'A') return;

        var href = el.getAttribute('href') || '';
        if (!/^https?:\/\//i.test(href)) return;

        e.preventDefault();
        if (typeof window.plus !== 'undefined' && window.plus.runtime && window.plus.runtime.openURL) {
            window.plus.runtime.openURL(href);
        } else {
            window.open(href, '_blank');
        }
    }, true);

    // 页面加载时写入一个历史锚点，确保 history.length 可靠
    if (window.history.length <= 1) {
        window.history.replaceState({ _szy: 'root' }, '', window.location.href);
    }

    // --- HTML5+ App 环境：拦截硬件返回键 ---
    document.addEventListener('plusready', function () {
        if (typeof window.plus === 'undefined' || !window.plus.key) return;
        plus.key.addEventListener('backbutton', function () {
            // 如果有上一页历史（history.length > 1），返回上级页面
            // 否则退出应用
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // 根页面，退出应用前给个提示
                if (window.confirm('确定要退出SZY工具集吗？')) {
                    plus.runtime.quit();
                }
            }
        }, false);
    }, false);

    // --- 浏览器环境：监听 popstate 做兜底 ---
    // 某些情况下 WebView 的 backbutton 可能不触发，这里用 popstate 兜底
    window.addEventListener('load', function () {
        // 确保页面切换后 history 是正确的
        if (window.history.length <= 1 && document.referrer) {
            window.history.replaceState({ _szy: 'loaded' }, '', window.location.href);
        }
    });

    // --- 右下角返回按钮 ---
    (function injectBackButton() {
        var cs = document.currentScript;
        var pageHref = window.location.href.split(/[?#]/)[0];
        var pageName = pageHref.slice(pageHref.lastIndexOf('/') + 1);
        if (cs && cs.src) {
            var backHref = cs.src.split(/[?#]/)[0];
            var backDir = backHref.slice(0, backHref.lastIndexOf('/') + 1);
            var pageDir = pageHref.slice(0, pageHref.lastIndexOf('/') + 1);
            if (backDir === pageDir && (pageName === 'index.html' || pageName === '')) {
                return;
            }
        }
        var path = window.location.pathname.replace(/^\/+|\/+$/g, '');
        if (path === '' || path === 'index.html') {
            return;
        }

        function build() {
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
            build();
        } else {
            document.addEventListener('DOMContentLoaded', build);
        }
    })();
})();
