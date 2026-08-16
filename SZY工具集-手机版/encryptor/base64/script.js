(function () {
    'use strict';

    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainContent = document.getElementById('mainContent');

    const base64EncodeInput = document.getElementById('base64EncodeInput');
    const base64EncodeOutput = document.getElementById('base64EncodeOutput');
    const base64EncodeOutputGroup = document.getElementById('base64EncodeOutputGroup');
    const base64EncodeCharCount = document.getElementById('base64EncodeCharCount');
    const base64EncodeResultCount = document.getElementById('base64EncodeResultCount');

    const base64DecodeInput = document.getElementById('base64DecodeInput');
    const base64DecodeOutput = document.getElementById('base64DecodeOutput');
    const base64DecodeOutputGroup = document.getElementById('base64DecodeOutputGroup');
    const base64DecodeCharCount = document.getElementById('base64DecodeCharCount');
    const base64DecodeResultCount = document.getElementById('base64DecodeResultCount');
    const base64ErrorToast = document.getElementById('base64ErrorToast');
    const base64ErrorMsg = document.getElementById('base64ErrorMsg');

    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    let sidebarOpen = false;
    let toastTimer = null;
    let errorTimer = null;

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
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        getOverlay().classList.remove('visible');
        sidebarOpen = false;
        document.body.style.overflow = '';
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

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && sidebarOpen) closeSidebar();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabName);
            });
        });
    });

    function base64Encode(text) {
        try {
            const wordArray = CryptoJS.enc.Utf8.parse(text);
            return {
                success: true,
                result: CryptoJS.enc.Base64.stringify(wordArray),
                error: ''
            };
        } catch (e) {
            return {
                success: false,
                result: '',
                error: '编码失败: ' + e.message
            };
        }
    }

    function base64Decode(base64String) {
        try {
            const cleaned = base64String.replace(/\s/g, '');
            
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
                throw new Error('包含无效的Base64字符');
            }
            
            const wordArray = CryptoJS.enc.Base64.parse(cleaned);
            const result = CryptoJS.enc.Utf8.stringify(wordArray);
            
            if (!result && cleaned.length > 0) {
                throw new Error('解码结果为空，可能不是有效的Base64编码');
            }
            
            return {
                success: true,
                result: result,
                error: ''
            };
        } catch (e) {
            return {
                success: false,
                result: '',
                error: 'Base64格式错误，请检查输入'
            };
        }
    }

    document.getElementById('btnBase64Encode').addEventListener('click', () => {
        const text = base64EncodeInput.value.trim();
        if (!text) {
            shakeElement(base64EncodeInput);
            return;
        }

        const result = base64Encode(text);
        if (result.success) {
            base64EncodeOutput.value = result.result;
            base64EncodeOutputGroup.style.display = 'flex';
            base64EncodeResultCount.textContent = result.result.length + ' 字符';
            base64EncodeOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            showToast(result.error);
        }
    });

    document.getElementById('btnBase64EncodeClear').addEventListener('click', () => {
        base64EncodeInput.value = '';
        base64EncodeOutput.value = '';
        base64EncodeOutputGroup.style.display = 'none';
        base64EncodeCharCount.textContent = '0 字符';
        base64EncodeResultCount.textContent = '0 字符';
    });

    document.getElementById('btnCopyBase64Encode').addEventListener('click', () => {
        copyToClipboard(base64EncodeOutput.value, 'Base64已复制到剪贴板');
    });

    document.getElementById('btnBase64EncodeSwap').addEventListener('click', () => {
        const encodedText = base64EncodeOutput.value;
        if (!encodedText) {
            showToast('请先进行编码');
            return;
        }
        
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === 'base64-decode');
        });
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.toggle('active', c.id === 'base64-decode');
        });
        
        base64DecodeInput.value = encodedText;
        base64DecodeCharCount.textContent = encodedText.length + ' 字符';
        document.getElementById('btnBase64Decode').click();
    });

    base64EncodeInput.addEventListener('input', () => {
        base64EncodeCharCount.textContent = base64EncodeInput.value.length + ' 字符';
    });

    document.getElementById('btnBase64Decode').addEventListener('click', () => {
        const text = base64DecodeInput.value.trim();
        if (!text) {
            shakeElement(base64DecodeInput);
            return;
        }

        const result = base64Decode(text);
        if (result.success) {
            base64DecodeOutput.value = result.result;
            base64DecodeOutputGroup.style.display = 'flex';
            base64DecodeResultCount.textContent = result.result.length + ' 字符';
            hideErrorToast();
            base64DecodeOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            showErrorToast(result.error);
            base64DecodeOutputGroup.style.display = 'none';
        }
    });

    document.getElementById('btnBase64DecodeClear').addEventListener('click', () => {
        base64DecodeInput.value = '';
        base64DecodeOutput.value = '';
        base64DecodeOutputGroup.style.display = 'none';
        base64DecodeCharCount.textContent = '0 字符';
        base64DecodeResultCount.textContent = '0 字符';
        hideErrorToast();
    });

    document.getElementById('btnCopyBase64Decode').addEventListener('click', () => {
        copyToClipboard(base64DecodeOutput.value, '解码结果已复制到剪贴板');
    });

    document.getElementById('btnBase64DecodeSwap').addEventListener('click', () => {
        const decodedText = base64DecodeOutput.value;
        if (!decodedText) {
            showToast('请先进行解码');
            return;
        }
        
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === 'base64-encode');
        });
        document.querySelectorAll('.tab-content').forEach(c => {
            c.classList.toggle('active', c.id === 'base64-encode');
        });
        
        base64EncodeInput.value = decodedText;
        base64EncodeCharCount.textContent = decodedText.length + ' 字符';
        document.getElementById('btnBase64Encode').click();
    });

    base64DecodeInput.addEventListener('input', () => {
        base64DecodeCharCount.textContent = base64DecodeInput.value.length + ' 字符';
        hideErrorToast();
    });

    function showErrorToast(message) {
        if (errorTimer) clearTimeout(errorTimer);
        base64ErrorMsg.textContent = message;
        base64ErrorToast.style.display = 'flex';
        base64ErrorToast.style.animation = 'none';
        base64ErrorToast.offsetHeight;
        base64ErrorToast.style.animation = 'shake 0.5s ease-out';
        errorTimer = setTimeout(() => {
            base64ErrorToast.style.display = 'none';
            errorTimer = null;
        }, 4000);
    }

    function hideErrorToast() {
        base64ErrorToast.style.display = 'none';
        if (errorTimer) {
            clearTimeout(errorTimer);
            errorTimer = null;
        }
    }

    function copyToClipboard(text, message) {
        if (!text) return;
        
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => showToast(message))
                .catch(() => fallbackCopy(text, message));
        } else {
            fallbackCopy(text, message);
        }
    }

    function fallbackCopy(text, message) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px;opacity:0;';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast(message);
        } catch (err) {
            showToast('复制失败，请手动选择复制');
        }
        document.body.removeChild(textarea);
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

    function shakeElement(element) {
        element.style.borderColor = '#fca5a5';
        element.style.animation = 'shake 0.5s ease-out';
        setTimeout(() => {
            element.style.borderColor = '';
            element.style.animation = '';
        }, 500);
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab.id === 'base64-encode') {
                document.getElementById('btnBase64Encode').click();
            } else {
                document.getElementById('btnBase64Decode').click();
            }
        }
        if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    });

    console.log('📝 Base64编解码工具已就绪');
    console.log('  支持UTF-8文本 ↔ Base64 | 交换功能 | 格式验证');
})();