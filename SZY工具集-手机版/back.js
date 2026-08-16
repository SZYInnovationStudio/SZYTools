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
    if (typeof window.plus !== 'undefined') {
        document.addEventListener('plusready', function () {
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
    }

    // --- 浏览器环境：监听 popstate 做兜底 ---
    // 某些情况下 WebView 的 backbutton 可能不触发，这里用 popstate 兜底
    window.addEventListener('load', function () {
        // 确保页面切换后 history 是正确的
        if (window.history.length <= 1 && document.referrer) {
            window.history.replaceState({ _szy: 'loaded' }, '', window.location.href);
        }
    });
})();
