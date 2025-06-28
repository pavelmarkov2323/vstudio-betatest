document.addEventListener("DOMContentLoaded", () => {
  const backdrop = document.querySelector('.promo-modal-backdrop');

  // ТРИК: удалим класс show, чтобы вернуть к начальному состоянию
  backdrop.classList.remove('show');

  // Затем добавим с задержкой — чтобы успела примениться анимация
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      backdrop.classList.add('show');
    });
  });

  // Закрытие с анимацией
  document.querySelector('.promo-close').addEventListener('click', () => {
    backdrop.classList.remove('show');
    backdrop.classList.add('hide');
    setTimeout(() => backdrop.remove(), 400);
  });
});