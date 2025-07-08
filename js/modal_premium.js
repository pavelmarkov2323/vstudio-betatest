function openPremiumModal() {
  const modal = document.querySelector('.modal-premium-subscribe-backdrop');
  if (!modal) return;

  modal.classList.remove('hide');
  modal.classList.add('show');
}

function closePremiumModal() {
  const modal = document.querySelector('.modal-premium-subscribe-backdrop');
  if (!modal) return;

  modal.classList.remove('show');
  modal.classList.add('hide');
}

// Обработчик кнопки закрытия
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.querySelector('.modal-premium-subscribe-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePremiumModal);
  }
});
