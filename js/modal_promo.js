window.initPromoModal = function() {
  const translations = window.translations?.["promo-modal"];
  if (!translations) {
    console.warn("Переводы для promo-modal не найдены");
    return;
  }

  const modals = [
    {
      key: "pixelfps",
      image: "/assets/images/kristy_support.jpg"
    },
    {
      key: "upgrade",
      image: "/assets/images/nikitavaleyev.png"
    }
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

  const delay = Math.floor(Math.random() * 7000) + 3000;

  setTimeout(() => {
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const backdrop = document.querySelector('.promo-modal-backdrop');
  requestAnimationFrame(() => backdrop.classList.add('show'));

  backdrop.querySelector('.promo-close').addEventListener('click', () => {
    backdrop.classList.remove('show');
    backdrop.classList.add('hide');
    setTimeout(() => backdrop.remove(), 400);
  });
  }, delay);
};