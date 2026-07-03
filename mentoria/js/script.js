const navbar = document.querySelector('.navbar');
const revealItems = document.querySelectorAll('.reveal');
const whatsappButton = document.querySelector('.floating-whatsapp');

const toggleNavbar = () => {
  if (window.scrollY > 24) {
    navbar.classList.add('is-scrolled');
  } else {
    navbar.classList.remove('is-scrolled');
  }
};

toggleNavbar();
window.addEventListener('scroll', toggleNavbar, { passive: true });

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item) => observer.observe(item));

if (whatsappButton) {
  whatsappButton.addEventListener('click', () => {
    whatsappButton.classList.add('is-active');
    setTimeout(() => whatsappButton.classList.remove('is-active'), 240);
  });
}
