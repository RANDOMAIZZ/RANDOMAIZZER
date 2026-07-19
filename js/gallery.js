const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
let galleryImages = [];
let currentIdx = 0;

document.querySelectorAll('.gallery img').forEach((img, i) => {
    galleryImages.push(img.src);
    img.addEventListener('click', () => {
        currentIdx = i;
        openLightbox(img.src);
    });
});

window.openLightbox = function(src) {
    currentIdx = galleryImages.indexOf(src);
    if (currentIdx === -1) currentIdx = 0;
    lightboxImg.src = src;
    lightboxImg.style.opacity = '0';
    lightbox.classList.add('open');
    document.getElementById('lightbox-counter').textContent = (currentIdx + 1) + ' / ' + galleryImages.length;
    document.body.style.overflow = 'hidden';
};

window.closeLightbox = function() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
};

window.navLightbox = function(dir) {
    currentIdx = (currentIdx + dir + galleryImages.length) % galleryImages.length;
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
        lightboxImg.src = galleryImages[currentIdx];
        lightboxImg.style.opacity = '1';
        document.getElementById('lightbox-counter').textContent = (currentIdx + 1) + ' / ' + galleryImages.length;
    }, 150);
};

document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
});

lightboxImg.addEventListener('load', () => { lightboxImg.style.opacity = '1'; });
lightboxImg.style.transition = 'opacity 0.15s';
