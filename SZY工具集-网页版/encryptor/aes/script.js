(function () {
    'use strict';

    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainContent = document.getElementById('mainContent');

    const aesEncryptKey = document.getElementById('aesEncryptKey');
    const aesEncryptInput = document.getElementById('aesEncryptInput');
    const aesEncryptOutput = document.getElementById('aesEncryptOutput');
    const aesEncryptOutputGroup = document.getElementById('aesEncryptOutputGroup');
    const aesEncryptCharCount = document.getElementById('aesEncryptCharCount');
    const aesEncryptResultCount = document.getElementById('aesEncryptResultCount');
    const aesEncryptKeyStatus = document.getElementById('aesEncryptKeyStatus');
    const keyStrengthEncrypt = document.getElementById('keyStrengthEncrypt');
    const btnToggleEncryptKey = document.getElementById('btnToggleEncryptKey');

    const aesDecryptKey = document.getElementById('aesDecryptKey');
    const aesDecryptInput = document.getElementById('aesDecryptInput');
    const aesDecryptOutput = document.getElementById('aesDecryptOutput');
    const aesDecryptOutputGroup = document.getElementById('aesDecryptOutputGroup');
    const aesDecryptCharCount = document.getElementById('aesDecryptCharCount');
    const aesDecryptResultCount = document.getElementById('aesDecryptResultCount');
    const aesDecryptKeyStatus = document.getElementById('aesDecryptKeyStatus');
    const btnToggleDecryptKey = document.getElementById('btnToggleDecryptKey');
    const aesErrorToast = document.getElementById('aesErrorToast');
    const aesErrorMsg = document.getElementById('aesErrorMsg');

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

    function updateKeyStrength(input, statusEl, strengthBar) {
        const key = input.value;
        const len = key.length;
        
        if (len === 0) {
            statusEl.textContent = '需要16/24/32字符';
            statusEl.style.color = '';
            strengthBar.className = 'strength-bar';
        } else if (len === 16 || len === 24 || len === 32) {
            statusEl.textContent = `✓ 有效长度 (${len}字符)`;
            statusEl.style.color = '#059669';
            if (len === 16) {
                strengthBar.className = 'strength-bar medium';
            } else if (len === 24) {
                strengthBar.className = 'strength-bar strong';
            } else {
                strengthBar.className = 'strength-bar strong';
            }
        } else {
            statusEl.textContent = `⚠ 无效长度 (${len}字符)`;
            statusEl.style.color = '#ef4444';
            strengthBar.className = 'strength-bar weak';
        }
    }

    aesEncryptKey.addEventListener('input', () => {
        updateKeyStrength(aesEncryptKey, aesEncryptKeyStatus, keyStrengthEncrypt.querySelector('.strength-bar'));
    });

    aesDecryptKey.addEventListener('input', () => {
        updateKeyStrength(aesDecryptKey, aesDecryptKeyStatus, document.createElement('div'));
    });

    function togglePasswordVisibility(input, btn) {
        const currentType = input.type;
        input.type = currentType === 'password' ? 'text' : 'password';
        btn.textContent = currentType === 'password' ? '🙈' : '👁️';
    }

    btnToggleEncryptKey.addEventListener('click', () => {
        togglePasswordVisibility(aesEncryptKey, btnToggleEncryptKey);
    });

    btnToggleDecryptKey.addEventListener('click', () => {
        togglePasswordVisibility(aesDecryptKey, btnToggleDecryptKey);
    });

    aesEncryptKey.type = 'password';
    aesDecryptKey.type = 'password';

    function aesEncrypt(plainText, key) {
        try {
            const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
            const iv = CryptoJS.lib.WordArray.random(16);
            const encrypted = CryptoJS.AES.encrypt(plainText, keyUtf8, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            const combined = iv.concat(encrypted.ciphertext);
            return {
                success: true,
                result: CryptoJS.enc.Base64.stringify(combined),
                error: ''
            };
        } catch (e) {
            return {
                success: false,
                result: '',
                error: '加密失败: ' + e.message
            };
        }
    }

    function aesDecrypt(cipherBase64, key) {
        try {
            const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
            const combined = CryptoJS.enc.Base64.parse(cipherBase64);
            
            const iv = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4), 16);
            const ciphertext = CryptoJS.lib.WordArray.create(
                combined.words.slice(4),
                combined.sigBytes - 16
            );
            
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: ciphertext },
                keyUtf8,
                {
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            
            const result = decrypted.toString(CryptoJS.enc.Utf8);
            if (!result) throw new Error('解密结果为空');
            return {
                success: true,
                result: result,
                error: ''
            };
        } catch (e) {
            return {
                success: false,
                result: '',
                error: '解密失败，请检查密钥和密文格式'
            };
        }
    }

    document.getElementById('btnAESEncrypt').addEventListener('click', () => {
        const key = aesEncryptKey.value;
        const text = aesEncryptInput.value.trim();

        if (!text) {
            shakeElement(aesEncryptInput);
            return;
        }

        if (![16, 24, 32].includes(key.length)) {
            showToast('⚠️ 密钥长度必须为16、24或32个字符');
            shakeElement(aesEncryptKey);
            return;
        }

        const result = aesEncrypt(text, key);
        if (result.success) {
            aesEncryptOutput.value = result.result;
            aesEncryptOutputGroup.style.display = 'flex';
            aesEncryptResultCount.textContent = result.result.length + ' 字符';
            aesEncryptOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            hideErrorToast();
        } else {
            showToast(result.error);
        }
    });

    document.getElementById('btnAESEncryptClear').addEventListener('click', () => {
        aesEncryptKey.value = '';
        aesEncryptInput.value = '';
        aesEncryptOutput.value = '';
        aesEncryptOutputGroup.style.display = 'none';
        aesEncryptCharCount.textContent = '0 字符';
        aesEncryptResultCount.textContent = '0 字符';
        updateKeyStrength(aesEncryptKey, aesEncryptKeyStatus, keyStrengthEncrypt.querySelector('.strength-bar'));
        hideErrorToast();
    });

    document.getElementById('btnCopyAESEncrypt').addEventListener('click', () => {
        copyToClipboard(aesEncryptOutput.value, '密文已复制到剪贴板');
    });

    aesEncryptInput.addEventListener('input', () => {
        aesEncryptCharCount.textContent = aesEncryptInput.value.length + ' 字符';
    });

    document.getElementById('btnAESDecrypt').addEventListener('click', () => {
        const key = aesDecryptKey.value;
        const text = aesDecryptInput.value.trim();

        if (!text) {
            shakeElement(aesDecryptInput);
            return;
        }

        if (![16, 24, 32].includes(key.length)) {
            showToast('⚠️ 密钥长度必须为16、24或32个字符');
            shakeElement(aesDecryptKey);
            return;
        }

        const result = aesDecrypt(text, key);
        if (result.success) {
            aesDecryptOutput.value = result.result;
            aesDecryptOutputGroup.style.display = 'flex';
            aesDecryptResultCount.textContent = result.result.length + ' 字符';
            hideErrorToast();
            aesDecryptOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            showErrorToast(result.error);
            aesDecryptOutputGroup.style.display = 'none';
        }
    });

    document.getElementById('btnAESDecryptClear').addEventListener('click', () => {
        aesDecryptKey.value = '';
        aesDecryptInput.value = '';
        aesDecryptOutput.value = '';
        aesDecryptOutputGroup.style.display = 'none';
        aesDecryptCharCount.textContent = '0 字符';
        aesDecryptResultCount.textContent = '0 字符';
        updateKeyStrength(aesDecryptKey, aesDecryptKeyStatus, document.createElement('div'));
        hideErrorToast();
    });

    document.getElementById('btnCopyAESDecrypt').addEventListener('click', () => {
        copyToClipboard(aesDecryptOutput.value, '明文已复制到剪贴板');
    });

    aesDecryptInput.addEventListener('input', () => {
        aesDecryptCharCount.textContent = aesDecryptInput.value.length + ' 字符';
        hideErrorToast();
    });

    function showErrorToast(message) {
        if (errorTimer) clearTimeout(errorTimer);
        aesErrorMsg.textContent = message;
        aesErrorToast.style.display = 'flex';
        aesErrorToast.style.animation = 'none';
        aesErrorToast.offsetHeight;
        aesErrorToast.style.animation = 'shake 0.5s ease-out';
        errorTimer = setTimeout(() => {
            aesErrorToast.style.display = 'none';
            errorTimer = null;
        }, 4000);
    }

    function hideErrorToast() {
        aesErrorToast.style.display = 'none';
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
            if (activeTab.id === 'aes-encrypt') {
                document.getElementById('btnAESEncrypt').click();
            } else {
                document.getElementById('btnAESDecrypt').click();
            }
        }
        if (e.key === 'Escape' && sidebarOpen) closeSidebar();
    });

    console.log('🔒 AES加密工具已就绪');
    console.log('  支持128/192/256位密钥 | CBC模式 | Base64输出');
})();