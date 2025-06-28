document.addEventListener("DOMContentLoaded", function () {
  const banner = document.querySelector('.banner-promo');
  const closeBtn = document.querySelector('.close-banner-btn');

  const STORAGE_KEY = 'bannerState';
  const MAX_RELOADS = 6;
  const DELAY_BEFORE_RESHOW = 5 * 60 * 1000; // 5 минут

  function getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : { closed: false, count: 0, closedAt: null };
    } catch {
      return { closed: false, count: 0, closedAt: null };
    }
  }

  function setState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = getState();
  const now = Date.now();

  // Сначала проверим таймер и сбросим, если прошло 5 минут
  if (state.closed && state.closedAt && (now - state.closedAt) > DELAY_BEFORE_RESHOW) {
    state.closed = false;
    state.count = 0;
    state.closedAt = null;
  }

  // Затем увеличим счётчик, если баннер был закрыт
  if (state.closed) {
    state.count = (state.count || 0) + 1;
  }

  setState(state); // обязательно сохранить новое состояние

  // Показываем баннер, если он открыт или счётчик >= MAX_RELOADS
  if (!state.closed || state.count >= MAX_RELOADS) {
    banner.classList.remove('hidden');
    banner.style.display = '';
  }

  // Закрытие баннера
  closeBtn.addEventListener('click', () => {
    banner.classList.add('hidden');
    setTimeout(() => banner.style.display = 'none', 300);

    const newState = {
      closed: true,
      count: 0,
      closedAt: Date.now()
    };
    setState(newState);
  });
});