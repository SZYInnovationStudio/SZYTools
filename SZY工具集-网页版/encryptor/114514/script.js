(function () {
    'use strict';

    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainContent = document.getElementById('mainContent');

    const panelEncrypt = document.getElementById('panelEncrypt');
    const panelDecrypt = document.getElementById('panelDecrypt');

    const btnEncrypt = document.getElementById('btnEncrypt');
    const btnDecrypt = document.getElementById('btnDecrypt');

    const encryptInput = document.getElementById('encryptInput');
    const encryptOutput = document.getElementById('encryptOutput');
    const encryptOutputGroup = document.getElementById('encryptOutputGroup');
    const encryptCharCount = document.getElementById('encryptCharCount');
    const encryptResultCount = document.getElementById('encryptResultCount');
    const colorLegendEncrypt = document.getElementById('colorLegendEncrypt');
    const btnDoEncrypt = document.getElementById('btnDoEncrypt');
    const btnClearEncrypt = document.getElementById('btnClearEncrypt');
    const btnCopyEncrypt = document.getElementById('btnCopyEncrypt');

    const decryptInput = document.getElementById('decryptInput');
    const decryptOutput = document.getElementById('decryptOutput');
    const decryptOutputGroup = document.getElementById('decryptOutputGroup');
    const decryptCharCount = document.getElementById('decryptCharCount');
    const decryptResultCount = document.getElementById('decryptResultCount');
    const btnDoDecrypt = document.getElementById('btnDoDecrypt');
    const btnClearDecrypt = document.getElementById('btnClearDecrypt');
    const btnCopyDecrypt = document.getElementById('btnCopyDecrypt');

    const errorToast = document.getElementById('errorToast');
    const errorToastMsg = document.getElementById('errorToastMsg');

    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');

    // 暗语编码规则
    const ZERO = '114514';
    const ONE = '1919';
    const SEPARATOR = '810';

    let currentMode = 'encrypt';
    let sidebarOpen = false;
    let toastTimer = null;
    let errorToastTimer = null;

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

    function toggleSidebar() {
        if (sidebarOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    mobileMenuToggle.addEventListener('click', toggleSidebar);

    mainContent.addEventListener('click', function (e) {
        if (sidebarOpen && window.innerWidth <= 900) {
            if (!sidebar.contains(e.target) && e.target !== mobileMenuToggle && !mobileMenuToggle.contains(e.target)) {
                closeSidebar();
            }
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 900 && sidebarOpen) {
            closeSidebar();
        }
    });

    function switchMode(mode) {
        if (currentMode === mode) return;
        currentMode = mode;

        btnEncrypt.classList.toggle('active', mode === 'encrypt');
        btnDecrypt.classList.toggle('active', mode === 'decrypt');

        panelEncrypt.classList.toggle('active', mode === 'encrypt');
        panelDecrypt.classList.toggle('active', mode === 'decrypt');

        hideErrorToast();

        mainContent.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (window.innerWidth <= 900 && sidebarOpen) {
            closeSidebar();
        }
    }

    btnEncrypt.addEventListener('click', function () {
        switchMode('encrypt');
    });

    btnDecrypt.addEventListener('click', function () {
        switchMode('decrypt');
    });

    function encrypt(text) {
        if (!text) return '';
        const parts = [];
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i);
            let binary = charCode.toString(2).padStart(16, '0');
            let encoded = '';
            for (let j = 0; j < binary.length; j++) {
                if (binary[j] === '0') {
                    encoded += ZERO;
                } else {
                    encoded += ONE;
                }
            }
            parts.push(encoded);
        }
        return parts.join(SEPARATOR);
    }

    function decrypt(cipherText) {
        if (!cipherText || !cipherText.trim()) {
            return { success: false, result: '', error: '暗语不能为空' };
        }

        const trimmed = cipherText.trim();

        // 验证只包含数字
        const validCharsRegex = /^[0-9]+$/;
        if (!validCharsRegex.test(trimmed)) {
            return {
                success: false,
                result: '',
                error: '格式错误请检查格式',
                detail: '暗语只能包含数字'
            };
        }

        // 按分隔符分割
        const groups = trimmed.split(SEPARATOR);

        const decodedChars = [];
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];

            // 检查每组长度是否合法：每个0是6位(114514)，每个1是4位(1919)，总共16位二进制
            // 这里我们需要按ZERO和ONE的长度来解析
            let binary = '';
            let remaining = group;

            while (remaining.length > 0) {
                if (remaining.startsWith(ZERO)) {
                    binary += '0';
                    remaining = remaining.substring(ZERO.length);
                } else if (remaining.startsWith(ONE)) {
                    binary += '1';
                    remaining = remaining.substring(ONE.length);
                } else {
                    return {
                        success: false,
                        result: '',
                        error: '格式错误请检查格式',
                        detail: `第${i + 1}组包含非法的数字序列：${remaining.substring(0, Math.min(6, remaining.length))}...（仅允许${ZERO}和${ONE}）`
                    };
                }
            }

            if (binary.length !== 16) {
                return {
                    success: false,
                    result: '',
                    error: '格式错误请检查格式',
                    detail: `第${i + 1}组解析后二进制长度不正确（期望16位，实际${binary.length}位）`
                };
            }

            const charCode = parseInt(binary, 2);

            if (isNaN(charCode) || charCode < 0 || charCode > 65535) {
                return {
                    success: false,
                    result: '',
                    error: '格式错误请检查格式',
                    detail: `第${i + 1}组解析失败，无效的字符编码`
                };
            }

            decodedChars.push(String.fromCharCode(charCode));
        }

        return { success: true, result: decodedChars.join(''), error: '' };
    }

    btnDoEncrypt.addEventListener('click', function () {
        const plainText = encryptInput.value;
        if (!plainText.trim()) {
            encryptInput.focus();
            encryptInput.style.borderColor = '#fca5a5';
            setTimeout(() => {
                encryptInput.style.borderColor = '';
            }, 1500);
            return;
        }

        const cipherResult = encrypt(plainText);

        encryptOutput.value = cipherResult;
        encryptOutputGroup.style.display = 'flex';
        colorLegendEncrypt.style.display = 'flex';
        btnCopyEncrypt.style.display = 'inline-flex';
        encryptResultCount.textContent = cipherResult.length + ' 字符';

        encryptOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });

        encryptOutputGroup.style.animation = 'none';
        encryptOutputGroup.offsetHeight;
        encryptOutputGroup.style.animation = 'fadeSlideIn 0.4s ease-out';
    });

    btnClearEncrypt.addEventListener('click', function () {
        encryptInput.value = '';
        encryptOutput.value = '';
        encryptOutputGroup.style.display = 'none';
        colorLegendEncrypt.style.display = 'none';
        btnCopyEncrypt.style.display = 'none';
        encryptCharCount.textContent = '0 字符';
        encryptResultCount.textContent = '0 字符';
        encryptInput.focus();
        hideErrorToast();
    });

    btnCopyEncrypt.addEventListener('click', function () {
        copyToClipboard(encryptOutput.value, '暗语已复制到剪贴板');
    });

    encryptInput.addEventListener('input', function () {
        const len = encryptInput.value.length;
        encryptCharCount.textContent = len + ' 字符';
    });

    btnDoDecrypt.addEventListener('click', function () {
        const cipherText = decryptInput.value;
        if (!cipherText.trim()) {
            decryptInput.focus();
            decryptInput.style.borderColor = '#fca5a5';
            setTimeout(() => {
                decryptInput.style.borderColor = '';
            }, 1500);
            return;
        }

        const decodeResult = decrypt(cipherText);

        if (decodeResult.success) {
            decryptOutput.value = decodeResult.result;
            decryptOutputGroup.style.display = 'flex';
            btnCopyDecrypt.style.display = 'inline-flex';
            decryptResultCount.textContent = decodeResult.result.length + ' 字符';
            hideErrorToast();

            decryptOutputGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
            decryptOutputGroup.style.animation = 'none';
            decryptOutputGroup.offsetHeight;
            decryptOutputGroup.style.animation = 'fadeSlideIn 0.4s ease-out';
        } else {
            decryptOutputGroup.style.display = 'none';
            btnCopyDecrypt.style.display = 'none';
            showErrorToast(decodeResult.error);
            decryptInput.style.borderColor = '#fca5a5';
            setTimeout(() => {
                decryptInput.style.borderColor = '';
            }, 2000);
        }
    });

    btnClearDecrypt.addEventListener('click', function () {
        decryptInput.value = '';
        decryptOutput.value = '';
        decryptOutputGroup.style.display = 'none';
        btnCopyDecrypt.style.display = 'none';
        decryptCharCount.textContent = '0 字符';
        decryptResultCount.textContent = '0 字符';
        decryptInput.focus();
        hideErrorToast();
    });

    btnCopyDecrypt.addEventListener('click', function () {
        copyToClipboard(decryptOutput.value, '明文已复制到剪贴板');
    });

    decryptInput.addEventListener('input', function () {
        const len = decryptInput.value.length;
        decryptCharCount.textContent = len + ' 字符';
        if (errorToast.style.display !== 'none') {
            hideErrorToast();
            decryptInput.style.borderColor = '';
        }
    });

    function showErrorToast(message) {
        if (errorToastTimer) clearTimeout(errorToastTimer);
        errorToastMsg.textContent = message;
        errorToast.style.display = 'flex';
        errorToast.style.animation = 'none';
        errorToast.offsetHeight;
        errorToast.style.animation = 'shake 0.5s ease-out';
        errorToastTimer = setTimeout(() => {
            hideErrorToast();
        }, 4000);
    }

    function hideErrorToast() {
        errorToast.style.display = 'none';
        if (errorToastTimer) {
            clearTimeout(errorToastTimer);
            errorToastTimer = null;
        }
    }

    function copyToClipboard(text, successMessage) {
        if (!text) return;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(successMessage || '已复制到剪贴板');
            }).catch(() => {
                fallbackCopy(text, successMessage);
            });
        } else {
            fallbackCopy(text, successMessage);
        }
    }

    function fallbackCopy(text, successMessage) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast(successMessage || '已复制到剪贴板');
            } else {
                showToast('复制失败，请手动选择复制');
            }
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

    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (currentMode === 'encrypt') {
                btnDoEncrypt.click();
            } else {
                btnDoDecrypt.click();
            }
        }

        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            if (currentMode === 'encrypt' && encryptOutput.value) {
                copyToClipboard(encryptOutput.value, '暗语已复制到剪贴板');
            } else if (currentMode === 'decrypt' && decryptOutput.value) {
                copyToClipboard(decryptOutput.value, '明文已复制到剪贴板');
            }
        }

        if (e.key === 'Escape' && sidebarOpen) {
            closeSidebar();
        }
    });

    function init() {
        switchMode('encrypt');
        encryptCharCount.textContent = '0 字符';
        decryptCharCount.textContent = '0 字符';
        encryptResultCount.textContent = '0 字符';
        decryptResultCount.textContent = '0 字符';
        encryptOutputGroup.style.display = 'none';
        decryptOutputGroup.style.display = 'none';
        colorLegendEncrypt.style.display = 'none';
        btnCopyEncrypt.style.display = 'none';
        btnCopyDecrypt.style.display = 'none';
        hideErrorToast();
    }

    init();

})();