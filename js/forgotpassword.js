document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.modal-overlay');
  const modal = document.querySelector('.modal-forgot-password');
  const forgotEmailInput = document.getElementById('forgot-email');
  const cancelBtn = document.querySelector('.modal-cancel');
  const submitBtn = document.querySelector('.modal-submit');
  const errorText = document.querySelector('.input-email-error');
  const successText = document.querySelector('.input-forgotpassword-success');
  const spinner = document.querySelector('.loading-spinner');
  const openModalBtn = document.getElementById('open-forgot-modal');

  // Показать модалку
  openModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('show');
    overlay.classList.add('show');

    setTimeout(() => {
      modal.classList.add('active');
      overlay.classList.add('active');
    }, 10);
  });

  // Закрыть модалку
  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    overlay.classList.remove('active');

    setTimeout(() => {
      modal.classList.remove('show');
      overlay.classList.remove('show');
      resetModal();
    }, 300);
  });

  // Потеря фокуса = проверка
  forgotEmailInput.addEventListener('blur', () => {
    const value = forgotEmailInput.value.trim();
    if (value && !validateEmail(value)) {
      forgotEmailInput.classList.add('error');
      errorText.style.display = 'block';
    }
  });

  // При фокусе скрыть ошибку
  forgotEmailInput.addEventListener('focus', () => {
    forgotEmailInput.classList.remove('error');
    errorText.style.display = 'none';
    successText.style.display = 'none';
  });

  // Отправка
  submitBtn.addEventListener('click', () => {
    const value = forgotEmailInput.value.trim();
    if (!value) return;

    if (!validateEmail(value)) {
      forgotEmailInput.classList.add('error');
      errorText.style.display = 'block';
      return;
    }

    submitBtn.style.display = 'none';
    spinner.style.display = 'block';

    setTimeout(() => {
      spinner.style.display = 'none';
      successText.style.display = 'block';
    }, 2000);
  });

  function resetModal() {
    forgotEmailInput.value = '';
    forgotEmailInput.classList.remove('error');
    errorText.style.display = 'none';
    successText.style.display = 'none';
    submitBtn.style.display = 'inline';
    spinner.style.display = 'none';
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});