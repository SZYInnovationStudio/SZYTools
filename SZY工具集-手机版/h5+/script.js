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
                '1': 'html/index.html',
                '2': 'css/index.html',
                '3': 'js/index.html',
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
