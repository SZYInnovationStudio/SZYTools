(function () {
    'use strict';

    function init() {
        var cards = document.querySelectorAll('.card');
        cards.forEach(function (card) {
            card.addEventListener('click', function (e) {
                var ripple = document.createElement('span');
                ripple.className = 'ripple';
                var rect = card.getBoundingClientRect();
                var size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                card.appendChild(ripple);
                setTimeout(function () { ripple.remove(); }, 600);
            });
        });
        var style = document.createElement('style');
        style.textContent = '.card{position:relative;overflow:hidden;}.ripple{position:absolute;border-radius:50%;background:rgba(91,141,239,0.3);transform:scale(0);animation:rippleEffect 0.6s ease-out;pointer-events:none;}@keyframes rippleEffect{to{transform:scale(4);opacity:0;}}';
        document.head.appendChild(style);
        window.addEventListener('load', function () { document.body.style.opacity = '1'; });
        document.addEventListener('keydown', function (e) {
            var keyMap = {
                '1': 'url/index.html',
                '2': 'htmlentity/index.html',
                '3': 'hex/index.html',
                '4': 'ascii/index.html',
                '5': 'morse/index.html',
                '6': 'radix/index.html'
            };
            if (keyMap[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
                var active = document.activeElement;
                if (!active || active === document.body) { e.preventDefault(); window.location.href = keyMap[e.key]; }
            }
        });
        console.log('编码解码工具集已就绪');
        console.log('  1: URL编解码  2: HTML实体  3: Hex  4: ASCII  5: 摩斯电码  6: 进制转换');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
