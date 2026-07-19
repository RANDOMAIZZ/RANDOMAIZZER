/* ── 1. Cursor star trail ── */
(function() {
    const trail = document.createElement('div');
    trail.id = 'cursor-trail';
    document.body.appendChild(trail);

    document.addEventListener('mousemove', e => {
        const star = document.createElement('div');
        star.className = 'cursor-star';
        star.style.left = (e.clientX - 2) + 'px';
        star.style.top = (e.clientY - 2) + 'px';
        star.style.background = ['#7c8cff', '#a07cf8', '#f0abfc', '#fff'][Math.floor(Math.random() * 4)];
        star.style.width = (2 + Math.random() * 4) + 'px';
        star.style.height = star.style.width;
        trail.appendChild(star);
        setTimeout(() => star.remove(), 600);
    });
})();

/* ── 2. Click ripple ── */
document.addEventListener('click', e => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.style.border = '2px solid ' + ['#7c8cff', '#a07cf8', '#f0abfc'][Math.floor(Math.random() * 3)];
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
});

/* ── 3. Typewriter effect ── */
(function() {
    const el = document.querySelector('.hero-sub');
    if (!el) return;
    const text = el.textContent;
    el.textContent = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.appendChild(cursor);

    function type() {
        if (i < text.length) {
            cursor.before(document.createTextNode(text[i]));
            i++;
            setTimeout(type, 30 + Math.random() * 40);
        } else {
            cursor.style.display = 'none';
        }
    }
    setTimeout(type, 500);
})();

/* ── 4. Floating binary digits ── */
(function() {
    for (let i = 0; i < 25; i++) {
        const obj = document.createElement('div');
        obj.className = 'floating-obj';
        obj.textContent = Math.random() > 0.5 ? '0' : '1';
        obj.style.left = (Math.random() * 100) + 'vw';
        obj.style.fontSize = (0.8 + Math.random() * 1.4) + 'rem';
        obj.style.animationDuration = (15 + Math.random() * 25) + 's';
        obj.style.animationDelay = (Math.random() * 20) + 's';
        obj.style.opacity = '0';
        obj.style.color = ['#7c8cff', '#a07cf8', '#f0abfc', '#34d399'][Math.floor(Math.random() * 4)];
        document.body.appendChild(obj);
    }
})();

/* ── 5. Scroll progress bar ── */
(function() {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);
    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
})();

/* ── 6. Double-click glitch ── */
document.querySelector('.hero-name')?.addEventListener('dblclick', function() {
    this.classList.add('glitch-active');
    setTimeout(() => this.classList.remove('glitch-active'), 1200);
    showEgg('⚡ ГЛ ИТ Ч !');
});

/* ── 7. Easter egg toast ── */
function showEgg(msg) {
    let toast = document.querySelector('.egg-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'egg-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg + '  |  0  +  1  =  10';
    toast.classList.add('show');
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ── 8. Konami code easter egg ── */
(function() {
    const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let pos = 0;
    document.addEventListener('keydown', e => {
        if (e.key === code[pos] || e.key.toLowerCase() === code[pos]) {
            pos++;
            if (pos === code.length) {
                showEgg('🎮 Konami Code! +30 жизней');
                pos = 0;
                document.querySelector('.hero-name')?.style.setProperty('filter', 'hue-rotate(180deg)');
                setTimeout(() => document.querySelector('.hero-name')?.style.removeProperty('filter'), 2000);
            }
        } else {
            pos = 0;
        }
    });
})();

/* ── 9. Secret console message ── */
(function() {
    const styles = [
        'color: #7c8cff; font-size: 14px; font-weight: bold;',
        'color: #a07cf8; font-size: 12px;',
        'color: #f0abfc; font-size: 11px;',
    ];
    console.log('%c╔══════════════════════════════╗', styles[0]);
    console.log('%c║  0 + 1 = 10                 ║', styles[0]);
    console.log('%c║  РАНДОМАЙЗЕР ЗДЕСЬ         ║', styles[1]);
    console.log('%c║  tg: @randomaizzer         ║', styles[1]);
    console.log('%c║  vk: RANDOMAIZZER          ║', styles[2]);
    console.log('%c╚══════════════════════════════╝', styles[0]);
    console.log('%c🎮 Нажмите ↑↑↓↓←→←→BA для пасхалки', 'color: #8b8fa3; font-style: italic;');
})();

/* ── 10. Random button glow pulse on nav links ── */
(function() {
    setInterval(() => {
        const links = document.querySelectorAll('.nav-link');
        if (links.length) {
            const random = links[Math.floor(Math.random() * links.length)];
            if (!random.classList.contains('active')) {
                random.style.transition = '0.3s';
                random.style.boxShadow = '0 0 15px rgba(124,140,255,0.3)';
                setTimeout(() => { random.style.boxShadow = 'none'; }, 300);
            }
        }
    }, 4000);
})();

/* ── 11. Section tab indicator ── */
(function() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const indicator = document.createElement('div');
    indicator.className = 'tab-indicator';
    nav.querySelector('.nav-inner')?.appendChild(indicator);

    function moveIndicator() {
        const active = nav.querySelector('.nav-link.active');
        if (!active) { indicator.style.width = '0'; return; }
        indicator.style.left = active.offsetLeft + 'px';
        indicator.style.width = active.offsetWidth + 'px';
    }

    window.addEventListener('scroll', moveIndicator, { passive: true });
    window.addEventListener('resize', moveIndicator);
    setTimeout(moveIndicator, 100);
})();
