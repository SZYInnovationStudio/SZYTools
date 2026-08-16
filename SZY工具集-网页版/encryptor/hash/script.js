(function () {
    'use strict';

    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainContent = document.getElementById('mainContent');
    const hashInput = document.getElementById('hashInput');
    const hashResult = document.getElementById('hashResult');
    const hashOutputGroup = document.getElementById('hashOutputGroup');
    const hashAlgoLabel = document.getElementById('hashAlgoLabel');
    const hashCharCount = document.getElementById('hashCharCount');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    let currentAlgo = 'MD5';
    let sidebarOpen = false;
    let toastTimer = null;
    let overlayEl = null;

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
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        getOverlay().classList.remove('visible');
        sidebarOpen = false;
    }

    mobileMenuToggle.addEventListener('click', () => {
        sidebarOpen ? closeSidebar() : openSidebar();
    });

    mainContent.addEventListener('click', (e) => {
        if (sidebarOpen && window.innerWidth <= 900) {
            if (!sidebar.contains(e.target) && e.target !== mobileMenuToggle) {
                closeSidebar();
            }
        }
    });

    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentAlgo = this.dataset.algo;
        });
    });

    function computeHash(text, algorithm) {
        if (!text) return '';
        try {
            switch (algorithm) {
                case 'MD5': return CryptoJS.MD5(text).toString();
                case 'SHA-1': return CryptoJS.SHA1(text).toString();
                case 'SHA-256': return CryptoJS.SHA256(text).toString();
                case 'SHA-512': return CryptoJS.SHA512(text).toString();
                case 'SHA-3': return CryptoJS.SHA3(text, { outputLength: 512 }).toString();
                case 'RIPEMD-160': return CryptoJS.RIPEMD160(text).toString();
                default: return '不支持的算法';
            }
        } catch (e) {
            return '计算错误: ' + e.message;
        }
    }

    document.getElementById('btnHashCompute').addEventListener('click', () => {
        const text = hashInput.value.trim();
        if (!text) {
            hashInput.style.borderColor = '#fca5a5';
            setTimeout(() => { hashInput.style.borderColor = ''; }, 1500);
            return;
        }
        const result = computeHash(text, currentAlgo);
        hashResult.textContent = result;
        hashAlgoLabel.textContent = currentAlgo + ' 结果';
        hashOutputGroup.style.display = 'flex';
        hashOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    document.getElementById('btnHashClear').addEventListener('click', () => {
        hashInput.value = '';
        hashResult.textContent = '';
        hashOutputGroup.style.display = 'none';
        hashCharCount.textContent = '0 字符';
    });

    document.getElementById('btnCopyHash').addEventListener('click', () => {
        copyToClipboard(hashResult.textContent, '哈希值已复制到剪贴板');
    });

    hashInput.addEventListener('input', () => {
        hashCharCount.textContent = hashInput.value.length + ' 字符';
    });

    function copyToClipboard(text, message) {
        if (!text) return;
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).then(() => showToast(message));
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.cssText = 'position:fixed;left:-9999px;';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast(message);
        }
    }

    function showToast(message) {
        if (toastTimer) clearTimeout(toastTimer);
        toastMsg.textContent = message;
        toast.classList.add('show');
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toastTimer = null;
        }, 2200);
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('btnHashCompute').click();
        }
        if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    });

    console.log('🔢 哈希计算工具已就绪');
})();