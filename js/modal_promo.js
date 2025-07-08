function getPromoModalState() {
  try {
    return JSON.parse(localStorage.getItem('promoModalState')) || { lastShown: null };
  } catch {
    return { lastShown: null };
  }
}

function setPromoModalState(state) {
  localStorage.setItem('promoModalState', JSON.stringify(state));
}

window.initPromoModal = async function () {
  const translations = window.translations?.["promo-modal"];
  if (!translations) {
    console.warn("Переводы для promo-modal не найдены");
    return;
  }

  // 🔍 Получаем текущего пользователя
  let user;
  try {
    const response = await fetch('/api/current-user');
    if (!response.ok) throw new Error('Пользователь не авторизован');
    user = await response.json();
  } catch (e) {
    console.warn('Не удалось получить пользователя:', e);
    return; // Не показываем, если нет инфы
  }

  // 🛑 Если у него premium — модалку не показываем
  if (user.isPremium) {
    console.log('Пользователь премиум — модальное окно не показывается');
    return;
  }

  const state = getPromoModalState();
  const now = Date.now();
  const isFirstTime = !state.lastShown;

  // 💡 Показываем через 10 секунд в первый раз, иначе рандом от 2 до 5 минут
  const MIN_REPEAT_DELAY = 2 * 60 * 1000; // 2 минуты
  const MAX_REPEAT_DELAY = 5 * 60 * 1000; // 5 минут
  const requiredDelay = isFirstTime
    ? 10 * 1000
    : Math.floor(Math.random() * (MAX_REPEAT_DELAY - MIN_REPEAT_DELAY)) + MIN_REPEAT_DELAY;

  // если баннер показывался недавно — не запускаем
  if (state.lastShown && (now - state.lastShown < requiredDelay)) {
    return;
  }

  // если уже на странице или запланирован — не дублируем
  if (document.querySelector('.promo-modal-backdrop') || window._promoModalScheduled) {
    return;
  }

  window._promoModalScheduled = true;

  const modals = [
    { key: "pixelfps", image: "/assets/images/kristy_support.jpg" },
    { key: "upgrade", image: "/assets/images/nikitavaleyev.png" }
  ];

  const selected = modals[Math.floor(Math.random() * modals.length)];
  const modalHTML = `
    <div class="promo-modal-backdrop">
      <div class="promo-modal-card theme-modal">
        <div class="promo-image" style="background-image: url('${selected.image}');"></div>
        <div class="promo-content">
          <h2 class="promo-title theme-text">${translations[`${selected.key}_title`]}</h2>
          <p class="promo-description gray-text">${translations[`${selected.key}_descr`]}</p>
          <button class="promo-button">${translations[`${selected.key}_button`]}</button>
        </div>
        <button class="promo-close">&times;</button>
      </div>
    </div>
  `;

  // Покажем модалку через случайную задержку (3-10 сек) как анимацию
  const showDelay = Math.floor(Math.random() * 7000) + 3000;

  setTimeout(() => {
    window._promoModalScheduled = false;

    if (document.querySelector('.promo-modal-backdrop')) return;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const backdrop = document.querySelector('.promo-modal-backdrop');
    requestAnimationFrame(() => backdrop.classList.add('show'));

    backdrop.querySelector('.promo-close').addEventListener('click', () => {
      backdrop.classList.remove('show');
      backdrop.classList.add('hide');
      setTimeout(() => backdrop.remove(), 400);
    });

    if (selected.key === 'pixelfps') {
      backdrop.querySelector('.promo-button')?.addEventListener('click', () => {
        closePromoModal();     // закрываем текущую промо
        openPremiumModal();    // открываем премиум
      });
    }

    // сохраняем, когда показали
    setPromoModalState({ lastShown: Date.now() });
  }, showDelay);

  function closePromoModal() {
    const backdrop = document.querySelector('.promo-modal-backdrop');
    if (!backdrop) return;

    backdrop.classList.remove('show');
    backdrop.classList.add('hide');
    setTimeout(() => backdrop.remove(), 400);
  }

};