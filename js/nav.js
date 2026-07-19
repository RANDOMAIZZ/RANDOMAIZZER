// Navigation highlight on scroll
const nav = document.getElementById('navbar');
const links = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section, #hero');

function updateNav() {
    let current = '';
    const scrollY = window.scrollY + nav.offsetHeight + 20;

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
            current = section.id;
        }
    });

    links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav);
updateNav();

// Smooth scroll for nav links
links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Reveal animation on scroll
const revealEls = document.querySelectorAll('.card');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});
