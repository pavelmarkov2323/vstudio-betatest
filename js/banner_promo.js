document.addEventListener("DOMContentLoaded", function () {
  const STORAGE_KEY = 'bannerState';
  const MAX_RELOADS = 6;
  const DELAY_BEFORE_RESHOW = 5 * 60 * 1000; // 5 минут

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { closed: false, count: 0, closedAt: null };
    } catch {
      return { closed: false, count: 0, closedAt: null };
    }
  }

  function setState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = getState();
  const now = Date.now();

  // Условие 1: прошло 5 минут после закрытия
  const isTimePassed = state.closed && state.closedAt && (now - state.closedAt > DELAY_BEFORE_RESHOW);

  // Условие 2: перезагрузили 6 раз
  const isReloadLimitReached = state.closed && state.count >= MAX_RELOADS;

  // Показываем баннер, если не закрыт или одно из условий выполнено
  const shouldShow = !state.closed || isTimePassed || isReloadLimitReached;

  // Если баннер закрыт, увеличиваем счётчик перезагрузок
  if (state.closed && !shouldShow) {
    state.count = (state.count || 0) + 1;
  }

  // Если решили показать — сбрасываем всё
  if (shouldShow) {
    state.closed = false;
    state.count = 0;
    state.closedAt = null;
  }

  setState(state);

  if (shouldShow) {
    const bannerHTML = `
      <div class="banner-promo theme-banner">
        <button class="close-banner-btn">✕</button>
        <div class="banner-promo-left">
          <h2 class="banner-promo-text theme-text">Get access to «Premium»</h2>
          <p class="banner-promo-description theme-text">
            Support the project and get more:<br><br>
            🔕 Without ads and banners<br>
            🎁 Exclusive chips and bonuses<br>
            💡 Early access to new features<br>
            ❤️ Project development support<br>
          </p>
          <p class="banner-promo-note gray-text">
            PixeFPS remains free, but premium is a way to say «thank you» and get a little more convenience.
          </p>
          <button class="banner-promo-button theme-button theme-text">Details</button>
        </div>
        <div class="banner-promo-right"></div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHTML);

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
  }
});