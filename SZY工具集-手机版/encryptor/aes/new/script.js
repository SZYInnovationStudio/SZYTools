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
    const formatInfo = document.getElementById('formatInfo');
    const formatDescription = document.getElementById('formatDescription');
    const encryptDetails = document.getElementById('encryptDetails');
    const detailKeyLength = document.getElementById('detailKeyLength');
    const detailIV = document.getElementById('detailIV');
    const detailCipherLength = document.getElementById('detailCipherLength');

    const aesDecryptKey = document.getElementById('aesDecryptKey');
    const aesDecryptInput = document.getElementById('aesDecryptInput');
    const aesDecryptOutput = document.getElementById('aesDecryptOutput');
    const aesDecryptOutputGroup = document.getElementById('aesDecryptOutputGroup');
    const aesDecryptCharCount = document.getElementById('aesDecryptCharCount');
    const aesDecryptResultCount = document.getElementById('aesDecryptResultCount');
    const aesDecryptKeyStatus = document.getElementById('aesDecryptKeyStatus');
    const strengthBarDecrypt = document.getElementById('strengthBarDecrypt');
    const aesErrorToast = document.getElementById('aesErrorToast');
    const aesErrorMsg = document.getElementById('aesErrorMsg');

    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    let sidebarOpen = false;
    let toastTimer = null;
    let errorTimer = null;
    let currentFormat = 'combined';
    let encryptedData = {};  
    let currentDecryptFormat = 'auto';

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

    document.querySelectorAll('.tab-switch .tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            const tabSwitch = this.closest('.tab-switch');
            const panelBody = tabSwitch.closest('.panel-body');
            
            tabSwitch.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            panelBody.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === tabName);
            });
            
            hideErrorToast();
        });
    });

    function updateKeyStrength(keyInput, statusEl, strengthBar) {
        const key = keyInput.value;
        const len = key ? CryptoJS.enc.Utf8.parse(key).sigBytes : 0;
        
        strengthBar.className = 'strength-bar';
        
        if (len === 0) {
            statusEl.textContent = '需要16/24/32字符';
            statusEl.className = 'key-status';
        } else if (len === 16) {
            statusEl.textContent = '✓ 128位密钥 (16字符)';
            statusEl.className = 'key-status valid';
            strengthBar.classList.add('length-16');
        } else if (len === 24) {
            statusEl.textContent = '✓ 192位密钥 (24字符)';
            statusEl.className = 'key-status valid';
            strengthBar.classList.add('length-24');
        } else if (len === 32) {
            statusEl.textContent = '✓ 256位密钥 (32字符)';
            statusEl.className = 'key-status valid';
            strengthBar.classList.add('length-32');
        } else {
            statusEl.textContent = `⚠ 无效长度 (${len}字符，需16/24/32)`;
            statusEl.className = 'key-status invalid';
            strengthBar.classList.add('invalid-length');
        }
    }

    aesEncryptKey.addEventListener('input', () => {
        updateKeyStrength(aesEncryptKey, aesEncryptKeyStatus, keyStrengthEncrypt.querySelector('.strength-bar'));
    });

    aesDecryptKey.addEventListener('input', () => {
        updateKeyStrength(aesDecryptKey, aesDecryptKeyStatus, strengthBarDecrypt);
    });

    function togglePasswordVisibility(input, btn) {
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = '🙈';
        } else {
            input.type = 'password';
            btn.textContent = '👁️';
        }
    }

    document.getElementById('btnToggleEncryptKey').addEventListener('click', () => {
        togglePasswordVisibility(aesEncryptKey, document.getElementById('btnToggleEncryptKey'));
    });

    document.getElementById('btnToggleDecryptKey').addEventListener('click', () => {
        togglePasswordVisibility(aesDecryptKey, document.getElementById('btnToggleDecryptKey'));
    });

    function generateSecureKey(length) {
        const bytes = new Uint8Array(length);
        window.crypto.getRandomValues(bytes);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        let key = '';
        for (let i = 0; i < length; i++) {
            key += chars.charAt(bytes[i] & 0x3f);
        }
        return key;
    }

    document.getElementById('btnGenerateKey').addEventListener('click', () => {
        const lengths = [16, 24, 32];
        const length = lengths[Math.floor(Math.random() * lengths.length)];
        const key = generateSecureKey(length);
        aesEncryptKey.value = key;
        aesEncryptKey.type = 'text';
        document.getElementById('btnToggleEncryptKey').textContent = '🙈';
        updateKeyStrength(aesEncryptKey, aesEncryptKeyStatus, keyStrengthEncrypt.querySelector('.strength-bar'));
        showToast(`已生成${length * 8}位随机密钥`);
    });

    document.querySelectorAll('.key-info-item').forEach(item => {
        item.addEventListener('click', function () {
            const bits = parseInt(this.dataset.bits);
            const length = bits / 8;
            const key = generateSecureKey(length);
            aesEncryptKey.value = key;
            aesEncryptKey.type = 'text';
            document.getElementById('btnToggleEncryptKey').textContent = '🙈';
            updateKeyStrength(aesEncryptKey, aesEncryptKeyStatus, keyStrengthEncrypt.querySelector('.strength-bar'));
            
            document.querySelectorAll('.key-info-item').forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            
            showToast(`已生成${bits}位随机密钥`);
        });
    });

    function aesEncrypt(plainText, key) {
        try {
            const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
            const iv = CryptoJS.lib.WordArray.random(16);
            
            const encrypted = CryptoJS.AES.encrypt(plainText, keyUtf8, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
            const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
            const ciphertextBase64 = encrypted.toString();  
            const body = iv.clone().concat(encrypted.ciphertext);
            const tag = CryptoJS.HmacSHA256(body, keyUtf8);
            const combined = body.concat(tag);
            const combinedBase64 = CryptoJS.enc.Base64.stringify(combined);
            const hexString = combined.toString(CryptoJS.enc.Hex);
            
            return {
                success: true,
                iv: ivBase64,
                ciphertext: ciphertextBase64,
                combined: combinedBase64,
                hex: hexString,
                keyLength: keyUtf8.sigBytes * 8,
                cipherBytes: encrypted.ciphertext.sigBytes,
                error: ''
            };
        } catch (e) {
            return {
                success: false,
                error: '加密失败: ' + e.message
            };
        }
    }

    function aesDecrypt(cipherInput, key, format) {
        try {
            const keyUtf8 = CryptoJS.enc.Utf8.parse(key);
            const cleaned = cipherInput.trim();
            let iv, ciphertext;

            if (format === 'standard') {
                const decrypted = CryptoJS.AES.decrypt(cleaned, keyUtf8, {
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                const result = decrypted.toString(CryptoJS.enc.Utf8);
                if (!result) throw new Error('解密结果为空');
                return { success: true, result: result, error: '' };
            }

            if (!/^[A-Za-z0-9+/]+=*$/.test(cleaned)) {
                throw new Error('密文格式不正确');
            }

            const combined = CryptoJS.enc.Base64.parse(cleaned);

            if (combined.sigBytes >= 64) {
                const words = combined.words;
                const tag = CryptoJS.lib.WordArray.create(words.slice(words.length - 8), 32);
                const ivPart = CryptoJS.lib.WordArray.create(words.slice(0, 4), 16);
                const ctPart = CryptoJS.lib.WordArray.create(words.slice(4, words.length - 8), combined.sigBytes - 48);
                const body = CryptoJS.lib.WordArray.create(words.slice(0, words.length - 8), combined.sigBytes - 32);
                const expected = CryptoJS.HmacSHA256(body, keyUtf8);
                if (expected.toString() === tag.toString()) {
                    iv = ivPart;
                    ciphertext = ctPart;
                } else if (format === 'combined') {
                    throw new Error('完整性校验失败');
                }
            }

            if (!ciphertext) {
                if (format === 'auto') {
                    const decrypted = CryptoJS.AES.decrypt(cleaned, keyUtf8, {
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7
                    });
                    const result = decrypted.toString(CryptoJS.enc.Utf8);
                    if (result) return { success: true, result: result, error: '' };
                }
                throw new Error('无法解析密文或完整性校验失败');
            }

            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: ciphertext },
                keyUtf8,
                { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
            );

            const result = decrypted.toString(CryptoJS.enc.Utf8);
            if (!result) throw new Error('解密失败，请检查密钥');

            return { success: true, result: result, error: '' };
        } catch (e) {
            return {
                success: false,
                result: '',
                error: '解密失败，请检查密钥和密文格式'
            };
        }
    }

    document.querySelectorAll('.format-btn[data-format]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.format-btn[data-format]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFormat = this.dataset.format;
            updateEncryptOutput();
        });
    });

    function updateEncryptOutput() {
        if (!encryptedData.success) return;
        
        const output = document.getElementById('aesEncryptOutput');
        const btnCopyIV = document.getElementById('btnCopyIV');
        const btnDownload = document.getElementById('btnDownloadEncrypt');
        
        btnCopyIV.style.display = 'none';
        btnDownload.style.display = 'inline-flex';
        encryptDetails.style.display = 'flex';
        
        switch(currentFormat) {
            case 'combined':
                output.value = encryptedData.combined;
                formatDescription.textContent = '📦 组合格式：IV + 密文 + HMAC-SHA256认证标签，Base64编码，已完整性保护';
                break;
            case 'standard':
                output.value = encryptedData.ciphertext;
                formatDescription.textContent = '📋 标准CryptoJS格式：可被其他使用CryptoJS的工具解密（无认证）';
                break;
            case 'separate':
                output.value = `IV: ${encryptedData.iv}\n\n密文: ${encryptedData.ciphertext}`;
                formatDescription.textContent = '📊 分离格式：提供独立的IV和密文，用于在线AES解密工具（无认证）';
                btnCopyIV.style.display = 'inline-flex';
                break;
            case 'hex':
                output.value = encryptedData.hex;
                formatDescription.textContent = '🔢 十六进制格式：IV+密文+认证标签的十六进制表示';
                break;
        }
        
        detailKeyLength.textContent = encryptedData.keyLength + '位';
        detailIV.textContent = encryptedData.iv;
        detailCipherLength.textContent = encryptedData.cipherBytes + ' 字节';
        
        aesEncryptResultCount.textContent = output.value.length + ' 字符';
    }

    document.querySelectorAll('.format-btn[data-decrypt-format]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.format-btn[data-decrypt-format]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentDecryptFormat = this.dataset.decryptFormat;
        });
    });

    document.getElementById('btnAESEncrypt').addEventListener('click', () => {
        const key = aesEncryptKey.value;
        const text = aesEncryptInput.value.trim();

        if (!text) {
            shakeElement(aesEncryptInput);
            return;
        }

        const keyBytes = CryptoJS.enc.Utf8.parse(key).sigBytes;
        if (![16, 24, 32].includes(keyBytes)) {
            showToast('⚠️ 密钥长度必须为16、24或32字节');
            shakeElement(aesEncryptKey);
            return;
        }

        const result = aesEncrypt(text, key);
        if (result.success) {
            encryptedData = result;
            updateEncryptOutput();
            aesEncryptOutputGroup.style.display = 'flex';
            aesEncryptOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            hideErrorToast();
        } else {
            showToast(result.error);
        }
    });

    document.getElementById('btnAESEncryptClear').addEventListener('click', () => {
        aesEncryptKey.value = '';
        aesEncryptKey.type = 'password';
        document.getElementById('btnToggleEncryptKey').textContent = '👁️';
        aesEncryptInput.value = '';
        aesEncryptOutput.value = '';
        aesEncryptOutputGroup.style.display = 'none';
        encryptDetails.style.display = 'none';
        aesEncryptCharCount.textContent = '0 字符';
        aesEncryptResultCount.textContent = '0 字符';
        encryptedData = {};
        updateKeyStrength(aesEncryptKey, aesEncryptKeyStatus, keyStrengthEncrypt.querySelector('.strength-bar'));
        document.querySelectorAll('.key-info-item').forEach(el => el.classList.remove('active'));
        hideErrorToast();
    });

    document.getElementById('btnCopyAESEncrypt').addEventListener('click', () => {
        copyToClipboard(aesEncryptOutput.value, '密文已复制到剪贴板');
    });

    document.getElementById('btnCopyIV').addEventListener('click', () => {
        copyToClipboard(encryptedData.iv, 'IV已复制到剪贴板');
    });

    document.getElementById('btnDownloadEncrypt').addEventListener('click', () => {
        const content = aesEncryptOutput.value;
        if (!content.trim()) { showToast('没有可下载的内容'); return; }

        if (typeof plus !== 'undefined') {
            plus.share.sendWithSystem({
                type: 'text',
                content: content,
                title: 'aes_encrypted_' + Date.now() + '.txt'
            }, function () {}, function () {
                showToast('无法打开分享面板');
            });
            return;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aes_encrypted_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('密文已下载');
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

        const keyBytes = CryptoJS.enc.Utf8.parse(key).sigBytes;
        if (![16, 24, 32].includes(keyBytes)) {
            showToast('⚠️ 密钥长度必须为16、24或32字节');
            shakeElement(aesDecryptKey);
            return;
        }

        const result = aesDecrypt(text, key, currentDecryptFormat);
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
        aesDecryptKey.type = 'password';
        document.getElementById('btnToggleDecryptKey').textContent = '👁️';
        aesDecryptInput.value = '';
        aesDecryptOutput.value = '';
        aesDecryptOutputGroup.style.display = 'none';
        aesDecryptCharCount.textContent = '0 字符';
        aesDecryptResultCount.textContent = '0 字符';
        updateKeyStrength(aesDecryptKey, aesDecryptKeyStatus, strengthBarDecrypt);
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
        }, 5000);
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

    function init() {
        updateKeyStrength(aesEncryptKey, aesEncryptKeyStatus, keyStrengthEncrypt.querySelector('.strength-bar'));
        updateKeyStrength(aesDecryptKey, aesDecryptKeyStatus, strengthBarDecrypt);
        
        console.log('🔒 AES加密工具已就绪');
        console.log('  支持: 128位 | 192位 | 256位密钥');
        console.log('  模式: CBC | 填充: PKCS7');
        console.log('  输出格式: 组合 | 标准 | 分离 | 十六进制');
        console.log('  快捷键: Ctrl+Enter 执行操作');
    }

    init();

})();