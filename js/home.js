document.addEventListener("DOMContentLoaded", function () {
  // ====== Roadmap Toggle ======
  document.querySelectorAll('.roadmap-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.roadmap-item');
      item.classList.toggle('open');
    });
  });

  // ====== FAQ Toggle ======
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const arrow = item.querySelector('.faq-arrow');
    const dot = item.querySelector('.faq-dot');
    const questionId = item.getAttribute('data-question');

    // Восстановление из localStorage
    if (localStorage.getItem(questionId) === 'open') {
      item.classList.add('active');
      arrow.style.transform = 'rotate(180deg)';
    }

    question.addEventListener('click', () => {
      faqItems.forEach(faq => {
        if (faq !== item) {
          faq.classList.remove('active');
          localStorage.setItem(faq.getAttribute('data-question'), 'closed');
          const faqArrow = faq.querySelector('.faq-arrow');
          if (faqArrow) faqArrow.style.transform = 'rotate(0deg)';
        }
      });

      const isActive = item.classList.toggle('active');
      localStorage.setItem(questionId, isActive ? 'open' : 'closed');
      arrow.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
    });
  });

  // ====== IntersectionObserver для анимаций (roadmap + faq) ======
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  const blocks = document.querySelectorAll('.roadmap-container, .faq-container');
  blocks.forEach(block => observer.observe(block));
});