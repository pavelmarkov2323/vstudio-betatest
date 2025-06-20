document.addEventListener('DOMContentLoaded', () => {
  // Элементы форм
  const loginContainer = document.querySelector('.login-container');
  const registrationContainer = document.querySelector('.registration-container');
  
  // Для частиц (фича)
  const gooey = document.getElementById('gooey');
  const particleContainer = document.getElementById('particle-container');

  // Ульта: счётчик частиц и таймер сброса
  let particleCount = 0;
  let particleTimer = null;
  const ULTRA_THRESHOLD = 15; // порог срабатывания ульты


  // Функция показать форму регистрации
  function showRegistration() {
    loginContainer.classList.add('fade-out');
    loginContainer.classList.remove('fade-in');

    // Ждём окончания анимации, чтобы скрыть блок
    setTimeout(() => {
      loginContainer.style.display = 'none';
      registrationContainer.style.display = 'block';
      registrationContainer.classList.remove('fade-out');
      registrationContainer.classList.add('fade-in');
    }, 400); // Время = длительность анимации
  }

  // Функция показать форму логина
  function showLogin() {
    registrationContainer.classList.add('fade-out');
    registrationContainer.classList.remove('fade-in');

    setTimeout(() => {
      registrationContainer.style.display = 'none';
      loginContainer.style.display = 'block';
      loginContainer.classList.remove('fade-out');
      loginContainer.classList.add('fade-in');
    }, 400);
  }

  // Навешиваем обработчик на ссылку "Sign up" в форме логина
  const signupLink = document.querySelector('.auth-switch a');
  if (signupLink) {
    signupLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRegistration();
    });
  }

  // Навешиваем обработчик на кнопку "назад" в форме регистрации
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', showLogin);
  }

  // --- Логика проверки пароля в регистрации ---
  const passwordInput = registrationContainer.querySelector('input[type="password"]');
  const strengthBar = registrationContainer.querySelector('.strength-bar');
  const strengthText = registrationContainer.querySelector('.strength-text');
  const passwordError = registrationContainer.querySelector('.password-error');

  const specialChars = /[!"#$%'()*]/;

  if (passwordInput && strengthBar && strengthText && passwordError) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value.trim();

      if (val.length === 0) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = 'red';
        strengthText.textContent = 'Введите пароль';
        passwordError.style.display = 'none';
      } else if (val.length < 6) {
        strengthBar.style.width = '33%';
        strengthBar.style.backgroundColor = 'red';
        strengthText.textContent = 'Слишком короткий';
        passwordError.style.display = 'block';
        passwordError.textContent = window.resetPasswordTranslations.tooShort;
      } else if (!specialChars.test(val)) {
        strengthBar.style.width = '66%';
        strengthBar.style.backgroundColor = 'orange';
        strengthText.textContent = 'Средний пароль';
        passwordError.style.display = 'block';
        passwordError.textContent = window.resetPasswordTranslations.noSpecialChar;
      } else {
        strengthBar.style.width = '100%';
        strengthBar.style.backgroundColor = 'green';
        strengthText.textContent = 'Надёжный пароль';
        passwordError.style.display = 'none';
      }
    });
  }

  // Обработчик движения мыши (частицы и gooey)
  document.addEventListener('mousemove', (e) => {
    gooey.style.opacity = '1';
    gooey.style.left = e.clientX + 'px';
    gooey.style.top = e.clientY + 'px';

    createParticle(e.clientX, e.clientY);
  });

  // Скрытие gooey через 1.5с без движения
  let hideTimeout;
  document.addEventListener('mousemove', () => {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      gooey.style.opacity = '0';
    }, 1500);
  });

  // При нажатии левой кнопкой мыши — создаём ульту с множеством частиц
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) {  // левая кнопка мыши
      const ultraParticlesCountLeft = 20; // можно сделать чуть меньше, чем у правой кнопки
      for (let i = 0; i < ultraParticlesCountLeft; i++) {
        createParticle(e.clientX, e.clientY, true); // true — это ульта
      }
      // Можно добавить эффект смещения формы, если надо
      triggerUltraEffect();
    }
    if (e.button === 2) {  // правая кнопка мыши
      const ultraParticlesCountRight = 30;
      for (let i = 0; i < ultraParticlesCountRight; i++) {
        createParticle(e.clientX, e.clientY, true);
      }
      triggerUltraEffect();
    }
  });

  function createParticle(x, y, isUltra = false) {
    if (!isUltra) {
      particleCount++;
      if (particleTimer) clearTimeout(particleTimer);
      particleTimer = setTimeout(() => {
        particleCount = 0; // сброс через 500мс
      }, 500);

      if (particleCount >= ULTRA_THRESHOLD) {
        triggerUltraEffect();
        particleCount = 0;
      }
    }

    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.transform = `translate(0, 0)`;
    particleContainer.appendChild(particle);

    const angle = Math.random() * 2 * Math.PI;
    const distance = isUltra ? 100 + Math.random() * 50 : 30 + Math.random() * 20;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    const duration = isUltra ? 1200 + Math.random() * 600 : 800 + Math.random() * 400;

    particle.animate([
      { transform: 'translate(0, 0)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
    ], {
      duration: duration,
      easing: 'ease-out',
      fill: 'forwards'
    });

    setTimeout(() => {
      particle.remove();
    }, duration + 200);
  }

  function triggerUltraEffect() {
    if (!loginContainer) return;

    loginContainer.style.transition = 'transform 0.6s ease-out';

    const translateX = (Math.random() - 0.5) * 150;
    const translateY = (Math.random() - 0.5) * 150;
    const rotate = (Math.random() - 0.5) * 30;

    loginContainer.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`;

    setTimeout(() => {
      loginContainer.style.transform = 'translate(0, 0) rotate(0)';
    }, 600);
  }
});