window.initPromoBanner = async function () {
    const translations = window.translations?.["banner"];
    if (!translations) {
        console.warn("Переводы для баннера не найдены");
        return;
    }

    // Проверяем, авторизован ли пользователь и есть ли у него премиум
    let user;
    try {
        const response = await fetch('/api/current-user');
        if (!response.ok) throw new Error('Пользователь не авторизован');
        user = await response.json();

        // 🛑 Если премиум — баннер не показываем
        if (user.isPremium) {
            console.log('Пользователь премиум — промо-баннер не показывается');
            return;
        }
    } catch (e) {
        console.warn('Не удалось получить пользователя:', e);
        return; // Без информации — тоже не показываем
    }

    // ⛔ Если недавно закрыл баннер — тоже не показываем
    if (!shouldShowBanner()) {
        console.log('Баннер не показывается: пользователь его недавно закрыл');
        return;
    }


    if (document.querySelector('.banner-promo')) {
        return;
    }

    const bannerHTML = `
    <div class="banner-promo theme-banner">
      <button class="close-banner-btn">✕</button>
      <div class="banner-promo-left">
        <h2 class="banner-promo-text theme-text">${translations["banner-promo-text"]}</h2>
        <p class="banner-promo-description theme-text">${translations["banner-promo-description"]}</p>
        <p class="banner-promo-note gray-text">${translations["banner-promo-note"]}</p>
        <button class="banner-promo-button theme-button theme-text">${translations["banner-promo-button"]}</button>
      </div>
      <div class="banner-promo-right"></div>
    </div>
  `;

    const header = document.querySelector('header.header');
    if (header) {
        header.insertAdjacentHTML('afterend', bannerHTML);
    }


    const banner = document.querySelector('.banner-promo');
    const closeBtn = banner.querySelector('.close-banner-btn');

    closeBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
        setTimeout(() => banner.remove(), 300);

        setState({
            closed: true,
            count: 0,
            closedAt: Date.now()
        });
    });
};

function getState() {
    try {
        return JSON.parse(localStorage.getItem('bannerState')) || { closed: false, count: 0, closedAt: null };
    } catch {
        return { closed: false, count: 0, closedAt: null };
    }
}

function setState(state) {
    localStorage.setItem('bannerState', JSON.stringify(state));
}

function shouldShowBanner() {
    const state = getState();
    const now = Date.now();
    const DELAY_BEFORE_RESHOW = 5 * 60 * 1000; // 5 минут
    const MAX_RELOADS = 6;

    const isTimePassed = state.closed && state.closedAt && (now - state.closedAt > DELAY_BEFORE_RESHOW);
    const isReloadLimitReached = state.closed && state.count >= MAX_RELOADS;

    if (state.closed && !isTimePassed && !isReloadLimitReached) {
        state.count = (state.count || 0) + 1;
        setState(state);
        return false;
    }

    // если баннер НЕ был закрыт — значит, можно показывать!
    if (!state.closed) {
        return true;
    }

    // Сброс состояния и разрешение показа
    state.closed = false;
    state.count = 0;
    state.closedAt = null;
    setState(state);

    return true;
}