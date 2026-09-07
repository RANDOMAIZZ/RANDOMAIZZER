// Дип-филд как на референсе: статичное глубокое небо,
// розовая эмиссионная туманность справа, голубая слева,
// плотный кластер в центре, тёмные пылевые прожилки,
// редкие яркие звёзды с дифракционными лучами.
// Без 3D-объектов и полёта: только медленный дрейф + параллакс + реакция на курсор.
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let W = 0, H = 0;
const reduceSky = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── курсор: параллакс, отталкивание звёзд, ударные волны ──
const CM = { px: -9999, py: -9999, sx: 0, sy: 0, tx: 0, ty: 0, waves: [] };
function trackCursor(x, y) {
    CM.px = x; CM.py = y;
    CM.tx = (x / W - 0.5) * 2;
    CM.ty = (y / H - 0.5) * 2;
}
window.addEventListener('mousemove', e => trackCursor(e.clientX, e.clientY));
window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    if (t) trackCursor(t.clientX, t.clientY);
}, { passive: true });
window.addEventListener('click', e => {
    if (CM.waves.length > 4) CM.waves.shift();
    CM.waves.push({ x: e.clientX, y: e.clientY, r: 0, a: 1 });
});

function rnd(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// палитра как на фото: белые, тёплые жёлтые, холодные голубые
const STAR_TINTS = [
    [255, 255, 255], [255, 255, 255], [255, 244, 224],
    [255, 214, 160], [205, 220, 255], [170, 190, 255],
    [255, 235, 200], [225, 232, 255]
];

let far = [], mid = [], near = [], cluster = [];
let flares = [];
let dustWisps = [];
let neb = null; // offscreen-слой туманностей

// ── запекание туманностей в offscreen (раз на ресайз) ──
function blob(g, x, y, r, cr, cg, cb, a) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(${cr},${cg},${cb},${a})`);
    gr.addColorStop(0.45, `rgba(${cr},${cg},${cb},${a * 0.45})`);
    gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    g.fillStyle = gr; g.fill();
}

function renderNebula() {
    neb = document.createElement('canvas');
    neb.width = Math.max(2, W >> 1);
    neb.height = Math.max(2, H >> 1);
    const g = neb.getContext('2d');
    const S = Math.min(neb.width, neb.height);
    const R = (fx, fy) => [neb.width * fx, neb.height * fy];

    // розовая эмиссия справа вверху (как на фото)
    let [px, py] = R(0.72, 0.18);
    blob(g, px, py, S * 0.55, 214, 70, 130, 0.5);
    blob(g, px - S * 0.1, py + S * 0.12, S * 0.4, 235, 110, 160, 0.42);
    blob(g, px + S * 0.16, py + S * 0.3, S * 0.34, 190, 60, 120, 0.4);
    blob(g, px - S * 0.22, py + S * 0.05, S * 0.3, 160, 70, 140, 0.3);
    // малиновое ядро правее центра
    [px, py] = R(0.62, 0.42);
    blob(g, px, py, S * 0.3, 240, 130, 170, 0.4);
    // голубая отражательная слева внизу
    [px, py] = R(0.2, 0.78);
    blob(g, px, py, S * 0.5, 110, 160, 245, 0.42);
    blob(g, px + S * 0.14, py - S * 0.12, S * 0.34, 150, 180, 250, 0.36);
    blob(g, px - S * 0.12, py + S * 0.1, S * 0.3, 90, 140, 230, 0.34);
    // сиреневый центр + бирюзовые прожилки
    [px, py] = R(0.5, 0.52);
    blob(g, px, py, S * 0.42, 165, 150, 220, 0.32);
    blob(g, px - S * 0.2, py + S * 0.22, S * 0.3, 95, 175, 205, 0.26);
    blob(g, px + S * 0.25, py - S * 0.2, S * 0.28, 120, 110, 200, 0.26);
    // фиолет и маджента как на новом фото
    [px, py] = R(0.3, 0.25);
    blob(g, px, py, S * 0.4, 150, 90, 220, 0.4);
    blob(g, px + S * 0.12, py + S * 0.14, S * 0.28, 200, 80, 190, 0.38);
    [px, py] = R(0.55, 0.65);
    blob(g, px, py, S * 0.36, 130, 80, 210, 0.36);
    blob(g, px - S * 0.15, py - S * 0.1, S * 0.26, 255, 90, 180, 0.3);
    [px, py] = R(0.15, 0.5);
    blob(g, px, py, S * 0.3, 70, 100, 220, 0.34);
    blob(g, px + S * 0.1, py + S * 0.2, S * 0.24, 70, 200, 210, 0.24);
    [px, py] = R(0.85, 0.35);
    blob(g, px, py, S * 0.26, 255, 110, 170, 0.32);
    // тёплое свечение левого нижнего фонаря
    [px, py] = R(0.12, 0.94);
    blob(g, px, py, S * 0.34, 255, 170, 120, 0.4);
    blob(g, px, py, S * 0.16, 255, 220, 180, 0.5);
    // тёмные пылевые полосы (глушат фон под собой)
    [px, py] = R(0.8, 0.62);
    blob(g, px, py, S * 0.34, 4, 4, 10, 0.62);
    blob(g, px - S * 0.14, py + S * 0.18, S * 0.24, 5, 5, 12, 0.55);
    [px, py] = R(0.42, 0.34);
    blob(g, px, py, S * 0.3, 5, 5, 12, 0.45);
    [px, py] = R(0.3, 0.6);
    blob(g, px, py, S * 0.22, 4, 4, 10, 0.4);
}

// warp-звезда: летит по радиусу от центра, p — фаза пути 0..1, z — глубина
function makeStar(zMin, zMax, rMin, rMax, aMin, aMax) {
    const th = rnd(0, Math.PI * 2);
    return {
        ux: Math.cos(th), uy: Math.sin(th),
        z: rnd(zMin, zMax),
        p: Math.random() * 1.15 - 0.075,
        r: rnd(rMin, rMax),
        a: rnd(aMin, aMax),
        c: pick(STAR_TINTS),
        tw: rnd(0, Math.PI * 2),
        twSp: rnd(0.6, 2.4)
    };
}

function buildSky() {
    const area = (W * H) / (1600 * 900);
    const k = Math.max(0.35, Math.min(1.4, area));
    far = []; mid = []; near = []; cluster = [];
    const nFar = Math.floor(2400 * k), nMid = Math.floor(750 * k), nNear = Math.floor(150 * k);
    for (let i = 0; i < nFar; i++) far.push(makeStar(0.25, 0.5, 0.35, 1.0, 0.25, 0.8));
    for (let i = 0; i < nMid; i++) mid.push(makeStar(0.5, 0.8, 0.7, 1.7, 0.4, 0.95));
    for (let i = 0; i < nNear; i++) {
        const s = makeStar(0.8, 1.2, 1.3, 2.6, 0.6, 1);
        s.spikes = Math.random() < 0.16; // у части ярких — лучи
        near.push(s);
    }
    // плотный кластер в центре — дальний объект, стоит на месте
    const nCl = Math.floor(150 * k);
    for (let i = 0; i < nCl; i++) {
        const gx = 0.5 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.16;
        const gy = 0.52 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.14;
        cluster.push({
            fx: gx, fy: gy,
            r: rnd(0.5, 1.5), a: rnd(0.5, 1),
            c: pick([[255, 255, 255], [215, 228, 255], [255, 240, 220]]),
            tw: rnd(0, Math.PI * 2), twSp: rnd(0.6, 2.4)
        });
    }
    // звёзды-фонари как на фото
    flares = [
        { fx: 0.12, fy: 0.93, R: 9, core: [255, 236, 205], spike: [255, 190, 140] },
        { fx: 0.5, fy: 0.52, R: 5, core: [235, 242, 255], spike: [190, 210, 255] },
        { fx: 0.24, fy: 0.62, R: 3.4, core: [255, 255, 255], spike: [200, 220, 255] },
        { fx: 0.68, fy: 0.2, R: 3, core: [255, 226, 180], spike: [255, 200, 150] }
    ];
    // тёмные прожилки поверх дальних слоёв
    dustWisps = [];
    for (let i = 0; i < 6; i++) {
        dustWisps.push({
            fx: rnd(0.1, 0.9), fy: rnd(0.1, 0.9),
            r: rnd(0.08, 0.2), a: rnd(0.25, 0.45),
            dx: rnd(-14, 14), dy: rnd(-10, 10)
        });
    }
    renderNebula();
}

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildSky();
    if (reduceSky) drawFrame(0);
}
window.addEventListener('resize', resize);

// ── warp-слой: звёзды летят по радиусу от центра со шлейфами ──
function drawLayer(list, par, t, audioBoost) {
    const ox = CM.sx * par, oy = CM.sy * par;
    const cx = W * 0.5, cy = H * 0.5;
    const RX = W * 0.72, RY = H * 0.72;
    const dir = Math.sign(warpVel) || 0;
    const streakBase = Math.min(110, Math.abs(warpVel) * 2600);
    for (let i = 0; i < list.length; i++) {
        const s = list[i];
        s.p += warpVel * s.z * 1.2;
        if (s.p > 1.15) s.p -= 1.3;
        else if (s.p < -0.15) s.p += 1.3;
        const close = Math.max(0, Math.min(1, s.p)); // 0 — далеко, 1 — рядом
        let sx = cx + s.ux * s.p * RX + ox * s.z;
        let sy = cy + s.uy * s.p * RY + oy * s.z;
        let glow = 0;
        const dx = sx - CM.px, dy = sy - CM.py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 32400) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / 180;
            sx += dx / d * f * 15;
            sy += dy / d * f * 15;
            glow = f;
        }
        for (let w = 0; w < CM.waves.length; w++) {
            const wv = CM.waves[w];
            const wx = sx - wv.x, wy = sy - wv.y;
            const wd = Math.sqrt(wx * wx + wy * wy) || 1;
            const k = Math.exp(-Math.pow(wd - wv.r, 2) / 12000) * wv.a;
            sx += wx / wd * k * 24;
            sy += wy / wd * k * 24;
            glow += k * 0.7;
        }
        if (sx < -140 || sx > W + 140 || sy < -140 || sy > H + 140) continue;
        const tw = 0.7 + 0.3 * Math.sin(t * s.twSp + s.tw);
        const r = s.r * (0.35 + close * 1.7) * (1 + glow * 0.8 + audioBoost * 0.4);
        const a = Math.min(1, s.a * tw * (0.75 + audioBoost * 0.25) + glow * 0.55);
        const [cr, cg, cb] = s.c;
        // шлейф полёта
        if (dir !== 0 && streakBase > 4 && s.p > 0 && s.p < 1.1) {
            const sl = Math.min(110, streakBase * s.z);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${Math.min(0.6, a * 0.7)})`;
            ctx.lineWidth = Math.max(0.6, r * 0.7);
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - dir * s.ux * sl, sy - dir * s.uy * sl);
            ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(sx, sy, Math.max(0.4, r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
        ctx.fill();
        if (r > 1.9 || glow > 0.25) {
            const gr = Math.max(2, r * 5);
            const gg = ctx.createRadialGradient(sx, sy, 0, sx, sy, gr);
            gg.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.4})`);
            gg.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
            ctx.beginPath(); ctx.arc(sx, sy, gr, 0, Math.PI * 2);
            ctx.fillStyle = gg; ctx.fill();
        }
        if (s.spikes && r > 1.4) {
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a * 0.55})`;
            ctx.lineWidth = 1;
            const L = r * 7;
            ctx.beginPath();
            ctx.moveTo(sx - L, sy); ctx.lineTo(sx + L, sy);
            ctx.moveTo(sx, sy - L); ctx.lineTo(sx, sy + L);
            ctx.stroke();
        }
    }
}

// ── кластер: дальний, неподвижный, только мерцание ──
function drawCluster(t) {
    const ox = CM.sx * 12, oy = CM.sy * 12;
    for (let i = 0; i < cluster.length; i++) {
        const s = cluster[i];
        let sx = s.fx * W + ox;
        let sy = s.fy * H + oy;
        let glow = 0;
        const dx = sx - CM.px, dy = sy - CM.py;
        const d2 = dx * dx + dy * dy;
        if (d2 < 32400) {
            const d = Math.sqrt(d2) || 1;
            const f = 1 - d / 180;
            sx += dx / d * f * 12;
            sy += dy / d * f * 12;
            glow = f;
        }
        const tw = 0.7 + 0.3 * Math.sin(t * s.twSp + s.tw);
        const a = Math.min(1, s.a * tw + glow * 0.5);
        const [cr, cg, cb] = s.c;
        ctx.beginPath(); ctx.arc(sx, sy, s.r * fixedScale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
        ctx.fill();
    }
}

// ── звезда-фонарь с лучами ──
function drawFlare(f, t) {
    const cx = f.fx * W + CM.sx * 30;
    const cy = f.fy * H + CM.sy * 22;
    const R = f.R * Math.min(1.3, Math.max(0.7, Math.min(W, H) / 800)) * fixedScale;
    const pulse = 0.9 + 0.1 * Math.sin(t * 1.4 + f.fx * 9);
    const [sr, sg, sb] = f.spike;
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 9);
    halo.addColorStop(0, `rgba(${sr},${sg},${sb},${0.4 * pulse})`);
    halo.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
    ctx.beginPath(); ctx.arc(cx, cy, R * 9, 0, Math.PI * 2);
    ctx.fillStyle = halo; ctx.fill();
    // длинные лучи
    ctx.lineWidth = 2;
    const L1 = R * 11, L2 = R * 5;
    const gradH = ctx.createLinearGradient(cx - L1, cy, cx + L1, cy);
    gradH.addColorStop(0, `rgba(${sr},${sg},${sb},0)`);
    gradH.addColorStop(0.5, `rgba(255,255,255,${0.75 * pulse})`);
    gradH.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
    ctx.strokeStyle = gradH;
    ctx.beginPath(); ctx.moveTo(cx - L1, cy); ctx.lineTo(cx + L1, cy); ctx.stroke();
    const gradV = ctx.createLinearGradient(cx, cy - L1, cx, cy + L1);
    gradV.addColorStop(0, `rgba(${sr},${sg},${sb},0)`);
    gradV.addColorStop(0.5, `rgba(255,255,255,${0.6 * pulse})`);
    gradV.addColorStop(1, `rgba(${sr},${sg},${sb},0)`);
    ctx.strokeStyle = gradV;
    ctx.beginPath(); ctx.moveTo(cx, cy - L1); ctx.lineTo(cx, cy + L1); ctx.stroke();
    // короткие диагонали
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(${sr},${sg},${sb},${0.4 * pulse})`;
    ctx.beginPath();
    ctx.moveTo(cx - L2, cy - L2); ctx.lineTo(cx + L2, cy + L2);
    ctx.moveTo(cx - L2, cy + L2); ctx.lineTo(cx + L2, cy - L2);
    ctx.stroke();
    // ядро
    const [cr, cg, cb] = f.core;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${cr},${cg},${cb},0.95)`; ctx.fill();
}

// ── тёмная пыль поверх средних слоёв ──
function drawDust() {
    const S = Math.min(W, H);
    dustWisps.forEach(d => {
        const cx = d.fx * W + CM.sx * 12 + d.dx;
        const cy = d.fy * H + CM.sy * 9 + d.dy;
        const r = d.r * S * 2.2;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(3,3,8,${d.a})`);
        g.addColorStop(1, 'rgba(3,3,8,0)');
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
    });
}

let audioBoost = 0;
let T = 0;
// ── warp от скролла: вниз — вперёд (разлёт), вверх — назад (сжатие) ──
let targetWarp = 0, warp = 0, warpVel = 0, lastSY = window.scrollY || 0;
// прогресс страницы 0..1: стоячие звёзды растут к низу
let scrollProg = 0, progS = 0, fixedScale = 1;
window.addEventListener('scroll', () => {
    const y = window.scrollY || 0;
    targetWarp += (y - lastSY) * 0.00045;
    lastSY = y;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProg = max > 0 ? Math.max(0, Math.min(1, y / max)) : 0;
}, { passive: true });

function drawFrame(t) {
    ctx.clearRect(0, 0, W, H);
    // медленный дрейф всей сцены
    const dx = Math.sin(t * 0.05) * 9 + CM.sx * 8;
    const dy = Math.cos(t * 0.04) * 7 + CM.sy * 6;
    // фон-туманность: к низу страницы ближе (зум) и ярче
    const nebZoom = 1.04 + progS * 0.12;
    ctx.save();
    ctx.globalAlpha = 0.82 + progS * 0.18;
    const nw = W * nebZoom, nh = H * nebZoom;
    if (neb) ctx.drawImage(neb, dx + (W - nw) / 2, dy + (H - nh) / 2, nw, nh);
    ctx.restore();
    drawLayer(far, 7, t, audioBoost);
    drawCluster(t);
    drawLayer(mid, 16, t, audioBoost);
    drawDust();
    drawLayer(near, 28, t, audioBoost);
    flares.forEach(f => drawFlare(f, t));
    // кольца ударных волн
    CM.waves.forEach(wv => {
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,170,120,${wv.a * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function animate() {
    T += 0.016;
    // сглаживание warp-скорости от скролла
    const raw = targetWarp - warp;
    warpVel = Math.max(-0.045, Math.min(0.045, raw * 0.12));
    warp += warpVel;
    // стоячие светила: вверху страницы мелкие, внизу — огромные далёкие
    progS += (scrollProg - progS) * 0.06;
    fixedScale = 0.4 + progS * 0.35;
    if (window.__getAudioBoost) audioBoost = window.__getAudioBoost();
    CM.sx += (CM.tx - CM.sx) * 0.06;
    CM.sy += (CM.ty - CM.sy) * 0.06;
    for (let i = CM.waves.length - 1; i >= 0; i--) {
        const wv = CM.waves[i];
        wv.r += 11;
        wv.a *= 0.94;
        if (wv.a < 0.02) CM.waves.splice(i, 1);
    }
    drawFrame(T);
    requestAnimationFrame(animate);
}

resize();
if (!reduceSky) animate();
