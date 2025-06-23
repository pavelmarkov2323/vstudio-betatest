document.addEventListener("DOMContentLoaded", () => {
  const profileContainer = document.querySelector('.profile-container');

  const maxLength = 500;
  const editBtn = document.querySelector('.bio-edit-icon');
  const saveBtn = document.querySelector('.bio-save-icon');
  const bioText = document.querySelector('.bio-text');
  const bioInput = document.querySelector('.bio-input');
  const bioHint = document.querySelector('.bio-hint');
  const charCount = document.querySelector('.bio-char-count');

  const avatarInput = document.getElementById('avatar-upload');
  const avatarImage = document.querySelector('.profile-avatar');
  const editAvatarIcon = document.querySelector('.edit-avatar');

  if (profileContainer) {
    setTimeout(() => {
      profileContainer.classList.add('visible');
    }, 100);
  }

  function getStatusData(status, username) {
    const statusData = {
      1: { icon: '/assets/icons/status/verified.gif', title: 'Верифицированная страница', text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">верификации</a>.` },
      2: { icon: '/assets/icons/status/sponsor.png', title: 'Страница спонсора', text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">спонсорстве</a>.` },
      3: { icon: '/assets/icons/status/partner.png', title: 'Страница партнёра', text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">партнёрке</a>.` },
      4: { icon: '/assets/icons/status/moderator.png', title: 'Модератор подтверждён', text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">модераторстве</a>.` },
      5: { icon: '/assets/icons/status/admin.png', title: 'Администратор верифицирован', text: `Страница ${username} подтверждена. Узнайте больше о <a href="verification.html">верификации администраторов</a>.` }
    };
    return statusData[status] || null;
  }

  let currentUser = null;
  const urlParts = window.location.pathname.split('/');
  const profileUsername = urlParts[urlParts.length - 1];

  function setDefaultBio(text = '') {
    return text.trim() !== '' ? text : 'Your biography will be here, but you don\'t have to fill it out. Everything is according to your choice — it\'s up to you to decide what your profile will look like.';
  }

  function updateProfileUI(user) {
    if (!user.username) {
      document.body.innerHTML = `
        <div class="not-found-container">
          <img src="/assets/icons/notfound.png" alt="Not Found" class="not-found-icon">
          <div class="not-found-text">
            <p class="not-found-title theme-text">The user was not found</p>
            <a href="/home.html" class="home-button">Return back</a>
          </div>
        </div>`;
      return;
    }

    const usernameElem = document.querySelector('.user-username');
    const fullnameElem = document.querySelector('.user-fullname');
    const userIdElem = document.querySelector('.user-id');
    const usernameInlineElem = document.querySelector('.user-username-inline');
    const welcomeHeading = document.getElementById('welcomeHeading');

    if (usernameElem) usernameElem.textContent = user.username;
    if (fullnameElem) fullnameElem.textContent = `${user.firstName} ${user.lastName}`;
    if (userIdElem) userIdElem.textContent = user.userId;
    if (usernameInlineElem) usernameInlineElem.textContent = user.username;

    if (welcomeHeading) {
      welcomeHeading.style.display = (currentUser && currentUser.username === user.username) ? 'block' : 'none';
    }

    const statusData = getStatusData(user.status, user.username);
    const userStatusWrapper = document.getElementById('user-status');
    const userStatusIcon = document.getElementById('user-status-icon');
    const tooltipStatusTitle = document.getElementById('tooltip-status-title');
    const tooltipStatusText = document.getElementById('tooltip-status-text');

    if (statusData && userStatusWrapper && userStatusIcon && tooltipStatusTitle && tooltipStatusText) {
      userStatusIcon.src = statusData.icon;
      tooltipStatusTitle.textContent = statusData.title;
      tooltipStatusText.innerHTML = statusData.text;
      userStatusWrapper.style.display = 'block';
    } else if (userStatusWrapper) {
      userStatusWrapper.style.display = 'none';
    }

    const countryElem = document.querySelector('.user-country');
    if (countryElem) {
      countryElem.textContent = user.country || 'Не указано';
    }

    const birthdayElem = document.querySelector('.user-birthday');
    if (birthdayElem) {
      if (user.birth?.day && user.birth?.month && user.birth?.year) {
        birthdayElem.textContent = `${user.birth.day} ${user.birth.month} ${user.birth.year}`;
      } else {
        birthdayElem.textContent = 'Не указано';
      }
    }

    avatarImage.src = user.avatar?.startsWith('http')
      ? user.avatar
      : 'https://res.cloudinary.com/dqceexk1h/image/upload/v1750689301/default.png';

    bioText.textContent = setDefaultBio(user.bio || '');

    if (currentUser && currentUser.username === user.username) {
      editBtn.style.display = 'inline';
      saveBtn.style.display = 'none';
      bioInput.style.display = 'none';
      bioHint.style.display = 'none';
      charCount.style.display = 'none';
      editAvatarIcon.style.display = 'inline-block';
      setupAvatarUpload(editAvatarIcon, avatarImage);
    } else {
      editBtn.style.display = 'none';
      saveBtn.style.display = 'none';
      bioInput.style.display = 'none';
      bioHint.style.display = 'none';
      charCount.style.display = 'none';
      editAvatarIcon.style.display = 'none';
    }
  }

  function loadProfile() {
    fetch(`/api/profile/${profileUsername}`, { credentials: 'include' })
      .then(response => response.json())
      .then(user => {
        updateProfileUI(user);
      })
      .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
        document.body.innerHTML = '<p>Ошибка загрузки данных профиля</p>';
      });
  }

  fetch('/api/current-user', { credentials: 'include' })
    .then(res => {
      if (!res.ok) throw new Error('Не авторизован');
      return res.json();
    })
    .then(user => {
      currentUser = user;
    })
    .catch(() => {
      currentUser = null;
    })
    .finally(() => {
      loadProfile();
    });

  // Навешиваем обработчики один раз
  editBtn.addEventListener('click', () => {
    const textOnly = bioText.textContent.trim();
    bioInput.value = textOnly;
    charCount.textContent = `${textOnly.length}/${maxLength}`;

    bioInput.style.display = 'block';
    bioHint.style.display = 'block';
    charCount.style.display = 'block';

    bioText.style.display = 'none';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline';
  });

  saveBtn.addEventListener('click', () => {
    const newText = bioInput.value.trim();
    if (newText.length <= maxLength) {
      fetch('/api/update-bio', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: newText }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.message === 'Биография обновлена') {
            bioText.textContent = setDefaultBio(newText);
            bioInput.style.display = 'none';
            bioText.style.display = 'inline';
            editBtn.style.display = 'inline';
            saveBtn.style.display = 'none';
            bioHint.style.display = 'none';
            charCount.style.display = 'none';
          } else {
            alert('Ошибка при сохранении биографии');
          }
        })
        .catch(() => alert('Ошибка при сохранении биографии'));
    }
  });

  bioInput.addEventListener('input', () => {
    if (bioInput.value.length > maxLength) {
      bioInput.value = bioInput.value.slice(0, maxLength);
    }
    charCount.textContent = `${bioInput.value.length}/${maxLength}`;
  });

  editAvatarIcon.addEventListener('click', () => {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  function setupAvatarUpload(button, avatarImg) {
    const fileInput = document.getElementById('avatar-upload');

    button.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      fetch('/api/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.avatar) {
            avatarImg.src = data.avatar + '?t=' + Date.now();
          } else {
            alert('Ошибка при загрузке аватара');
          }
        })
        .catch(() => alert('Ошибка при загрузке аватара'));
    });
  }
});