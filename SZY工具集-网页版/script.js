(function () {
    'use strict';

    function init() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            card.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                
                const rect = card.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                
                card.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        const style = document.createElement('style');
        style.textContent = `
            .card {
                position: relative;
                overflow: hidden;
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(91, 141, 239, 0.3);
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        cards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });

        document.addEventListener('keydown', function (e) {
            const keyMap = {
                '1': 'encryptor/index.html',
                '2': 'h5+/index.html',
                '3': 'mdeditor/index.html',
                '4': 'json/index.html',
                '5': 'qrcode/index.html',
                '6': 'encode/index.html',
                '7': 'format/index.html',
                '8': 'convert/index.html',
                '9': 'text/index.html',
                '0': 'image/index.html',
                'g': 'generator/index.html',
                'd': 'dev/index.html',
                'c': 'chart/index.html'
            };
            
            if (keyMap[e.key] && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const activeElement = document.activeElement;
                if (!activeElement || activeElement === document.body) {
                    e.preventDefault();
                    window.location.href = keyMap[e.key];
                }
            }
        });

        window.addEventListener('load', function () {
            document.body.style.opacity = '1';
        });

        console.log('SZY工具集 - 首页已就绪');
        console.log('  请选择工具开始使用');
        console.log('  1: SZY加密器  2: H5+工具集  3: MD编辑器  4: JSON工具  5: 二维码');
        console.log('  6: 编码解码  7: 代码格式化  8: 格式转换  9: 文本工具  0: 图片工具');
        console.log('  G: 生成器  D: 开发者工具  C: 图表工具');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();