document.addEventListener("DOMContentLoaded", function () {
    // --- Получаем все нужные элементы ---
    const languageSwitch = document.querySelector('.language-switch');
    const languageCodeElement = document.querySelector('.language-code');
    const selectedFlag = document.querySelector('.selected-flag');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const languageItems = document.querySelectorAll('.language-switch .dropdown-item');
    const arrow = document.querySelector('.arrow');

    // --- Установка языка из localStorage или браузера ---
    let savedLanguage = localStorage.getItem('language');
    if (!savedLanguage) {
        const browserLanguage = navigator.language || navigator.userLanguage;
        const availableLanguages = [
            'en-US', 'ru-RU', 'uk-UA', 'be-BY', 'kk-KZ', 'kr-TR',
            'ka-GE', 'pl-PL', 'de-DE', 'es-ES', 'fr-FR', 'fi-FI', 'ko-KR', 'zh-CN'
        ];
        savedLanguage = availableLanguages.includes(browserLanguage) ? browserLanguage : 'en-US';
        localStorage.setItem('language', savedLanguage);
    }

    // --- Обновляем язык интерфейса сразу ---
    updateLanguage(savedLanguage);

    // --- Если все элементы переключателя языка есть, навешиваем обработчики ---
    if (languageSwitch && languageCodeElement && selectedFlag && dropdownMenu && arrow) {
        languageSwitch.addEventListener('click', function () {
            languageSwitch.classList.toggle('open');
        });

        languageItems.forEach(item => {
            item.addEventListener('click', function () {
                const lang = item.getAttribute('data-lang');
                updateLanguage(lang);
            });
        });
    } else {
        console.warn("Элементы переключателя языка не найдены. Переключение языка отключено, но перевод работает.");
    }

    // --- Обновление интерфейса при смене языка ---
    function updateLanguage(language) {
        localStorage.setItem('language', language);

        const flags = {
            'en-US': ['EN', '/assets/icons/flag/usa.png'],
            'ru-RU': ['RU', '/assets/icons/flag/russia.png'],
            'uk-UA': ['UA', '/assets/icons/flag/ukraine.png'],
            'be-BY': ['BY', '/assets/icons/flag/belarus.png'],
            'kk-KZ': ['KZ', '/assets/icons/flag/kazakhstan.png'],
            'kr-TR': ['TR', '/assets/icons/flag/crimea_tatar.png'],
            'ka-GE': ['GE', '/assets/icons/flag/georgia.png'],
            'pl-PL': ['PL', '/assets/icons/flag/poland.png'],
            'de-DE': ['DE', '/assets/icons/flag/germany.png'],
            'es-ES': ['ES', '/assets/icons/flag/spanish.png'],
            'fr-FR': ['FR', '/assets/icons/flag/france.png'],
            'fi-FI': ['FI', '/assets/icons/flag/finland.png'],
            'ko-KR': ['KR', '/assets/icons/flag/south_korea.png'],
            'zh-CN': ['CN', '/assets/icons/flag/china.png']
        };

        const [languageLabel, flagSrc] = flags[language] || flags['en-US'];

        if (languageCodeElement) languageCodeElement.textContent = languageLabel;
        if (selectedFlag) selectedFlag.src = flagSrc;
        if (languageSwitch) languageSwitch.classList.remove('open');

        fetchLocalization(language);
    }

    // --- Загрузка и обновление локализации ---
    function fetchLocalization(language) {
        fetch(`/assets/locales/${language}.json`)
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сети');
                return response.json();
            })
            .then(data => {
                // Обновляем тексты на странице
                const elementsMap = {
                    '.main-title': data.mainTitle,
                    '.description': data.description,
                    '.subscribe-btn': data['subscribe-btn'],
                    '.team-heading': data["team-heading"],
                    '.aboutcompany-heading': data["aboutcompany-heading"],
                    '.license-heading': data["license-heading"],
                    '.legal-subheading': data["legal-subheading"],
                    '#downloadBtn': data["download-btn"],
                    '.nav-home': data.nav.home,
                    '.nav-our-products': data.nav['our-products'],
                    '.nav-about-us': data.nav['about-us'],
                    '.roadmap-heading': data.roadmap['roadmap-heading'],
                    '.roadmap-title': data.roadmap['roadmap-title'],
                    '.stage-1': data.roadmap['stage-1'],
                    '.stage-discription1': data.roadmap['stage-discription1'],
                    '.stage-2': data.roadmap['stage-2'],
                    '.stage-discription2': data.roadmap['stage-discription2'],
                    '.stage-3': data.roadmap['stage-3'],
                    '.stage-discription3': data.roadmap['stage-discription3'],
                    '.stage-4': data.roadmap['stage-4'],
                    '.stage-discription4': data.roadmap['stage-discription4'],
                    '.stage-5': data.roadmap['stage-5'],
                    '.stage-discription5': data.roadmap['stage-discription5'],
                    '.stage-6': data.roadmap['stage-6'],
                    '.stage-discription6': data.roadmap['stage-discription6'],
                    '.advertisement-banner-text': data.advertisement['advertisement-banner-text'],
                    '.advertisement-banner-note': data.advertisement['advertisement-banner-note'],
                    '.advertisement-banner-button': data.advertisement['advertisement-banner-button'],
                    '.advertisement-banner-description': data["advertisement"]["advertisement-banner-description"],
                    '.footer-copyright': data.footer.copyright,
                    '.forgot-link a': data.auth?.forgotPassword,
                    '.nav-user-agreement': data.footer['user-agreement'],
                    '.social-platforms': data['footer-social']['social-platforms'],
                    '.captcha-title': data["captcha-content"]["captcha-title"],
                    '.captcha-text-container': data["captcha-content"]["captcha-text-container"],
                    '.captcha-footer': data["captcha-content"]["captcha-footer"],
                    '.faq-title': data["faq"]["faq-title"],
                    '.bio-title': data.bio?.title,
                    '.bio-hint': data.bio?.hint,
                    '.data-title': data.bio?.["data-title"],
                    '.menu-profile-text': data.userMenu?.profile,
                    '.menu-settings-text': data.userMenu?.settings,
                    '.menu-support-text': data.userMenu?.support,
                    '.menu-logout-text': data.userMenu?.logout,
                    '.not-found-title': data["not-found-title"],
                    '.home-button': data["home-button"],
                    '.signin-btn': data.auth?.signIn,
                    '.auth-title': data.auth?.authorization,
                    '.login-button': data.auth?.login,
                    '.no-account-text': data.auth?.noAccount,
                    '.sign-up-link': data.auth?.signUp,
                    '.ForgotPasswordTitle': data.forgotpassword?.ForgotPasswordTitle,
                    '.modal-forgotpassword-description': data.forgotpassword?.["modal-forgotpassword-description"],
                    '.resetpassword-title': data.resetpassword?.['resetpassword-title'],
                    '.reset-btn': data.resetpassword?.['reset-btn'],
                    '.modal-cancel': data.forgotpassword?.["modal-cancel"],
                    '.modal-submit': data.forgotpassword?.["modal-submit"],
                    '.input-email-error': data.forgotpassword?.["input-email-error"],
                    '.input-forgotpassword-success': data.forgotpassword?.["input-forgotpassword-success"],
                    '.registration-title': data.registration['registration-title'],
                    '.password-hint': data.registration['password-hint'],
                    '.registration-button': data.registration['registration-button'],
                    '.aboutcompany-text': data["aboutcompany-text"],
                    '#user-agreement-btn': data["user-agreement-btn"],
                    '#privacy-policy-btn': data["privacy-policy-btn"],
                    '.push-title-suggestions': data["push-suggestions-title"],
                    '.push-text-suggestions': data["push-suggestions-text"],
                    '.push-btn-suggestions': data["push-suggestions-button"],
                    '.push-title-donation': data["push-donation-title"],
                    '.push-text-donation': data["push-donation-text"],
                    '.push-btn-donation': data["push-donation-button"]
                };

                Object.entries(elementsMap).forEach(([selector, value]) => {
                    const el = document.querySelector(selector);
                    if (el && value !== undefined) {
                        if (selector === '.advertisement-banner-description') {
                            el.innerHTML = value;
                        } else {
                            el.textContent = value;
                        }
                    }
                });

                Object.entries(elementsMap).forEach(([selector, value]) => {
                    const el = document.querySelector(selector);
                    if (el && value !== undefined) {
                        if (selector === '.description' || selector === '.aboutcompany-text') {
                            el.innerHTML = value; // разрешаем HTML для описания
                        } else {
                            el.textContent = value;
                        }
                    }
                });

                window.resetPasswordTranslations = {
                    tooShort: data.resetpassword?.tooShort || 'You entered less than 6 characters.',
                    noSpecialChar: data.resetpassword?.noSpecialChar || 'Enter a special character (! " # $ % \' () *)',
                };

                if (data.placeholder) {
                    const inputs = document.querySelectorAll('[data-placeholder]');
                    inputs.forEach(input => {
                        const key = input.getAttribute('data-placeholder');
                        if (data.placeholder[key]) {
                            input.placeholder = data.placeholder[key];
                        }
                    });
                }

                const agreementNoteEl = document.querySelector('.agreement-note');
                if (agreementNoteEl && data.registration?.['agreement-note']) {
                    const linkText = data.registration['user-agreement-link-text'] || 'user agreement';
                    const linkHtml = `<a href="about.html#user-agreement">${linkText}</a>`;
                    agreementNoteEl.innerHTML = data.registration['agreement-note'].replace('{link}', linkHtml);
                }

                // Специальная подстановка имени пользователя в Welcome user
                const profileHeading = document.querySelector('.profile-heading');
                if (profileHeading && data.profile?.welcomeUser) {
                    const usernameSpan = profileHeading.querySelector('.user-username');
                    const username = usernameSpan?.textContent.trim() || '';

                    // Удаляем всё внутри, а затем заново вставляем с переводом и span
                    profileHeading.innerHTML = `${data.profile.welcomeUser.replace('{username}', `<span class="user-username theme-text">${username}</span>`)}`;
                }


                // Ваши данные (данные профиля пользователя)
                if (data.profile) {
                    const profileLabels = document.querySelectorAll('[data-i18n]');
                    profileLabels.forEach(el => {
                        const key = el.getAttribute('data-i18n');
                        const [section, field] = key.split('.');
                        if (data[section]?.[field]) {
                            el.textContent = data[section][field];
                        }
                    });
                }

                // Обновляем FAQ и подсказки
                updateFAQ(data.faq.questions);
                updateTooltips(data.tooltip);

                // Обновляем юридический контент
                if (data["legal-content"]) {
                    updateLegalContent(data["legal-content"]);
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки локализации:', error);
            });
    }

    // --- Обновление FAQ ---
    function updateFAQ(faqData) {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const questionId = item.getAttribute('data-question');
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            if (faqData[questionId]) {
                question.childNodes[0].textContent = faqData[questionId].question;
                answer.innerHTML = faqData[questionId].answer;
            }
        });
    }

    // --- Обновление подсказок ---
    function updateTooltips(tooltipsData) {
        const tooltipElements = document.querySelectorAll('.tooltip');
        tooltipElements.forEach(el => {
            const key = el.getAttribute('data-tooltip');
            if (tooltipsData[key]) el.textContent = tooltipsData[key];
        });
    }

    // --- Обновление юридического контента ---
    function updateLegalContent(legalData) {
        const setText = (selector, text) => {
            const el = document.querySelector(selector);
            if (el && text !== undefined) el.textContent = text;
        };

        setText('.legal-intro', legalData["intro"]);
        setText('.section1-title', legalData["section1-title"]);
        setText('.section1-1', legalData["section1-1"]);
        setText('.section1-2', legalData["section1-2"]);
        setText('.section2-title', legalData["section2-title"]);
        setText('.section2-1', legalData["section2-1"]);
        setText('.section2-2', legalData["section2-2"]);
        setText('.section3-title', legalData["section3-title"]);
        setText('.section3-1', legalData["section3-1"]);
        setText('.section3-2', legalData["section3-2"]);
        setText('.section4-title', legalData["section4-title"]);
        setText('.section4-1', legalData["section4-1"]);
        setText('.section5-title', legalData["section5-title"]);
        setText('.section5-1', legalData["section5-1"]);
        setText('.privacy-title1', legalData["privacy-title1"]);
        setText('.privacy-title2', legalData["privacy-title2"]);
        setText('.privacy-title3', legalData["privacy-title3"]);
        setText('.privacy-3-1', legalData["privacy-3-1"]);
        setText('.privacy-3-2', legalData["privacy-3-2"]);
        setText('.privacy-title4', legalData["privacy-title4"]);
        setText('.privacy-4-1', legalData["privacy-4-1"]);
        setText('.privacy-title5', legalData["privacy-title5"]);
        setText('.privacy-5-1', legalData["privacy-5-1"]);
        setText('.privacy-title6', legalData["privacy-title6"]);
        setText('.privacy-6-1', legalData["privacy-6-1"]);

        // Обновление списков
        const updateList = (selector, items) => {
            const list = document.querySelector(selector);
            if (list && Array.isArray(items)) {
                list.innerHTML = '';
                items.forEach(i => {
                    const li = document.createElement('li');
                    li.textContent = i;
                    list.appendChild(li);
                });
            }
        };

        updateList('.section2-1-list', legalData["section2-1-list"]);
        updateList('.privacy-data-list', legalData["privacy-data-list"]);
        updateList('.privacy-usage-list', legalData["privacy-usage-list"]);

        // Даты
        document.querySelectorAll('.effective-date').forEach(el => {
            el.textContent = legalData["effective-date"];
        });
        document.querySelectorAll('.last-updated').forEach(el => {
            el.textContent = legalData["last-updated"];
        });
    }
});