document.addEventListener("DOMContentLoaded", () => {

  // Profile animation system
  const profileContainer = document.querySelector('.profile-container');

  // Bio / Text System
  const maxLength = 500;
  const editBtn = document.querySelector('.bio-edit-icon');
  const saveBtn = document.querySelector('.bio-save-icon');
  const bioText = document.querySelector('.bio-text');
  const bioInput = document.querySelector('.bio-input');
  const bioHint = document.querySelector('.bio-hint');
  const charCount = document.querySelector('.bio-char-count');

  // Avatar System
  const avatarInput = document.getElementById('avatar-upload');
  const avatarImage = document.querySelector('.profile-avatar');
  const editAvatarIcon = document.querySelector('.edit-avatar');

  // Плавная анимация появления профиля
  if (profileContainer) {
    // Немного задержки для плавности (можно убрать)
    setTimeout(() => {
      profileContainer.classList.add('visible');
    }, 100);
  }

  // Edit biography
  editBtn.addEventListener('click', () => {
    const textOnly = bioText.childNodes[0].textContent.trim();
    bioInput.value = textOnly;
    charCount.textContent = `${textOnly.length}/${maxLength}`;

    bioInput.style.display = 'block';
    bioHint.style.display = 'block';
    charCount.style.display = 'block';

    bioText.style.display = 'none';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'block';
  });

  saveBtn.addEventListener('click', () => {
    const newText = bioInput.value.trim();
    if (newText.length <= maxLength) {
      bioText.childNodes[0].textContent = newText;
      bioInput.style.display = 'none';
      bioText.style.display = 'inline';
      editBtn.style.display = 'inline';
      saveBtn.style.display = 'none';
      bioHint.style.display = 'none';
      charCount.style.display = 'none';
    }
  });

  bioInput.addEventListener('input', () => {
    const len = bioInput.value.length;
    if (len > maxLength) {
      bioInput.value = bioInput.value.slice(0, maxLength);
    }
    charCount.textContent = `${bioInput.value.length}/${maxLength}`;
  });

  // Edit avatar
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

  // Пользовательская часть с профилем
  const urlParts = window.location.pathname.split('/');
  const profileUsername = urlParts[urlParts.length - 1];

  let currentUser = null; // текущий пользователь (авторизованный)

  // Получаем текущего пользователя, чтобы сверить с профилем
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

  function loadProfile() {
    fetch(`/api/profile/${profileUsername}`, { credentials: 'include' })
      .then(response => response.json())
      .then(user => {
        if (user.username) {
          document.querySelector('.user-username').textContent = user.username;
          document.querySelector('.user-fullname').textContent = `${user.firstName} ${user.lastName}`;
          document.querySelector('.user-id').textContent = user.userId;
          document.querySelector('.user-username-inline').textContent = user.username;

          // Приветствие
          const welcomeHeading = document.getElementById('welcomeHeading');
          if (currentUser && currentUser.username === user.username) {
            welcomeHeading.style.display = 'block';
          } else {
            welcomeHeading.style.display = 'none';
          }

          // Аватар
          const avatarImg = document.querySelector('.profile-avatar');
          avatarImg.src = user.avatar || '/assets/images/avatar/default.png';

          // Кнопка редактирования аватара
          const editAvatarBtn = document.querySelector('.edit-avatar');
          if (currentUser && currentUser.username === user.username) {
            editAvatarBtn.style.display = 'inline-block';
            setupAvatarUpload(editAvatarBtn, avatarImg);
          } else {
            editAvatarBtn.style.display = 'none';
          }

          // Биография
          const bioTextEl = document.querySelector('.bio-text');
          const bioInputEl = document.querySelector('.bio-input');
          const editBioBtn = document.querySelector('.bio-edit-icon');
          const saveBioBtn = document.querySelector('.bio-save-icon');
          const charCountEl = document.querySelector('.bio-char-count');
          const hintEl = document.querySelector('.bio-hint');

          bioTextEl.childNodes[0].textContent = user.bio || 'No biography provided.';

          // Проверка прав пользователя
          if (currentUser && currentUser.username === user.username) {
            editBioBtn.style.display = 'inline';

            editBioBtn.addEventListener('click', () => {
              const currentBio = bioTextEl.childNodes[0].textContent.trim();
              bioInputEl.value = currentBio;
              charCountEl.textContent = `${currentBio.length}/500`;

              bioInputEl.style.display = 'block';
              hintEl.style.display = 'block';
              charCountEl.style.display = 'block';

              bioTextEl.style.display = 'none';
              editBioBtn.style.display = 'none';
              saveBioBtn.style.display = 'inline';
            });

            saveBioBtn.addEventListener('click', () => {
              const newBio = bioInputEl.value.trim();
              if (newBio.length > 500) return;

              fetch('/api/update-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ bio: newBio })
              })
                .then(res => res.json())
                .then(() => {
                  bioTextEl.childNodes[0].textContent = newBio;
                  bioInputEl.style.display = 'none';
                  bioTextEl.style.display = 'inline';
                  editBioBtn.style.display = 'inline';
                  saveBioBtn.style.display = 'none';
                  hintEl.style.display = 'none';
                  charCountEl.style.display = 'none';
                });
            });

          } else {
            editBioBtn.style.display = 'none';
            saveBioBtn.style.display = 'none';
          }

        } else {
          document.body.innerHTML = '<p>Пользователь не найден</p>';
        }
      })
      .catch(error => {
        console.error('Ошибка при загрузке профиля:', error);
        document.body.innerHTML = '<p>Ошибка загрузки данных профиля</p>';
      });
  }
});