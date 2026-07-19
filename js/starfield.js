const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [], bigStars = [], nebulae = [], asteroids = [], galaxies = [], comets = [], fogs = [];
const STAR_COUNT = 5000;
let W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const GALAXY_TYPES = ['spiral', 'elliptical', 'ring', 'barred'];

class Galaxy {
    constructor() {
        this.reset(true);
    }
    reset(init = false) {
        this.type = GALAXY_TYPES[Math.floor(Math.random() * GALAXY_TYPES.length)];
        this.x = (Math.random() - 0.5) * 4000;
        this.y = (Math.random() - 0.5) * 4000;
        this.z = init ? 6000 + Math.random() * 5000 : 3000 + Math.random() * 2000;
        this.radius = 1500 + Math.random() * 2500;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.0004;
        this.speedMult = 0.04 + Math.random() * 0.06;
        const palettes = [
            { core: { r: 255, g: 240, b: 220 }, arms: { r: 150, g: 100, b: 220 }, dust: { r: 80, g: 40, b: 140 } },
            { core: { r: 255, g: 220, b: 200 }, arms: { r: 220, g: 120, b: 160 }, dust: { r: 140, g: 50, b: 80 } },
            { core: { r: 240, g: 240, b: 255 }, arms: { r: 100, g: 180, b: 255 }, dust: { r: 40, g: 80, b: 160 } },
            { core: { r: 255, g: 250, b: 200 }, arms: { r: 200, g: 180, b: 100 }, dust: { r: 120, g: 100, b: 40 } },
            { core: { r: 255, g: 230, b: 240 }, arms: { r: 255, g: 140, b: 200 }, dust: { r: 160, g: 60, b: 120 } },
            { core: { r: 220, g: 255, b: 240 }, arms: { r: 100, g: 220, b: 180 }, dust: { r: 40, g: 140, b: 100 } },
        ];
        this.palette = palettes[Math.floor(Math.random() * palettes.length)];
        this.core = this.palette.core;
        this.armColor = this.palette.arms;
        this.dustColor = this.palette.dust;
        this.starDots = [];
        const count = 400 + Math.floor(Math.random() * 600);
        for (let i = 0; i < count; i++) {
            const dist = Math.random() * this.radius;
            let angle, spread;
            const arms = 2 + Math.floor(Math.random() * 2);
            switch (this.type) {
                case 'spiral':
                    const arm = Math.floor(Math.random() * arms);
                    spread = dist * 0.12 + 15;
                    angle = (arm / arms) * Math.PI * 2 + dist * 0.003 + (Math.random() - 0.5) * spread * 0.004;
                    break;
                case 'barred':
                    const barDist = Math.min(1, dist / (this.radius * 0.3));
                    const barAngle = (Math.floor(Math.random() * 2) / 2) * Math.PI;
                    if (dist < this.radius * 0.3) {
                        angle = barAngle + (Math.random() - 0.5) * 0.3;
                    } else {
                        const arm2 = Math.floor(Math.random() * 2);
                        spread = (dist - this.radius * 0.3) * 0.15 + 20;
                        angle = barAngle + arm2 * Math.PI + (dist - this.radius * 0.3) * 0.004 + (Math.random() - 0.5) * spread * 0.004;
                    }
                    break;
                case 'ring':
                    const ringR = this.radius * (0.35 + Math.random() * 0.25);
                    angle = Math.random() * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
                    spread = 10 + Math.random() * 20;
                    break;
                case 'elliptical':
                    const e = Math.random();
                    angle = Math.random() * Math.PI * 2;
                    spread = dist * 0.3 + 30;
                    break;
                default:
                    angle = Math.random() * Math.PI * 2;
                    spread = dist * 0.2;
            }
            this.starDots.push({
                dist: Math.max(2, dist),
                angle: angle || Math.random() * Math.PI * 2,
                size: Math.random() * 2 + 0.2,
                bright: Math.random() * 0.7 + 0.3,
                type: Math.random() > 0.7 ? 'dust' : 'star'
            });
        }
    }
    update(speed) {
        this.z -= speed * this.speedMult;
        this.rotation += this.rotSpeed * speed;
        if (this.z < 1000) this.reset();
    }
    draw() {
        const scale = 900 / this.z;
        const sx = this.x * scale + W / 2;
        const sy = this.y * scale + H / 2;
        const r = this.radius * scale * 0.12;
        if (r < 15) return;
        const alpha = Math.min(0.5, Math.max(0, (1 - this.z / 12000) * 0.6));
        const gGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        const c = this.armColor;
        gGrad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha * 0.25})`);
        gGrad.addColorStop(0.3, `rgba(${c.r},${c.g},${c.b},${alpha * 0.15})`);
        gGrad.addColorStop(0.6, `rgba(${c.r},${c.g},${c.b},${alpha * 0.06})`);
        gGrad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = gGrad;
        ctx.fill();
        this.starDots.forEach(d => {
            const angle = d.angle + this.rotation;
            const dx = Math.cos(angle) * d.dist;
            const dy = Math.sin(angle) * d.dist;
            const px = sx + dx * scale * 0.12;
            const py = sy + dy * scale * 0.12;
            const sz = Math.max(0.3, d.size * scale * 0.12);
            const a = d.bright * alpha * (1 - d.dist / this.radius * 0.5);
            if (d.type === 'dust') {
                ctx.beginPath();
                ctx.arc(px, py, sz * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.dustColor.r},${this.dustColor.g},${this.dustColor.b},${a * 0.15})`;
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(px, py, sz, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.armColor.r + 50},${this.armColor.g + 50},${this.armColor.b + 60},${a})`;
                ctx.fill();
            }
        });
        const coreR = r * (this.type === 'elliptical' ? 0.25 : 0.1);
        const coreGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, coreR);
        const cc = this.core;
        coreGrad.addColorStop(0, `rgba(${cc.r},${cc.g},${cc.b},${alpha * 0.7})`);
        coreGrad.addColorStop(0.4, `rgba(${cc.r},${cc.g},${cc.b},${alpha * 0.3})`);
        coreGrad.addColorStop(1, `rgba(${cc.r},${cc.g},${cc.b},0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad;
        ctx.fill();
    }
}

for (let i = 0; i < 3; i++) galaxies.push(new Galaxy());

class Comet {
    constructor() { this.reset(true); }
    reset(init = false) {
        this.angle = Math.random() * Math.PI * 2;
        const dist = 3000 + Math.random() * 2000;
        this.x = Math.cos(this.angle) * dist;
        this.y = Math.sin(this.angle) * dist * 0.4;
        this.z = init ? 3000 + Math.random() * 3000 : 3500;
        this.speed = 4 + Math.random() * 3;
        this.tailLength = 60 + Math.random() * 100;
        this.thickness = 1 + Math.random() * 0.5;
        this.hue = Math.random();
        this.alive = true;
        this.life = 0;
        this.maxLife = 100 + Math.random() * 100;
    }
    update(spd) {
        this.z -= spd * this.speed;
        this.life++;
        if (this.z < 50 || this.life > this.maxLife) this.reset();
    }
    draw() {
        const scale = 900 / this.z;
        const sx = this.x * scale + W / 2;
        const sy = this.y * scale + H / 2;
        if (sx < -100 || sx > W + 100 || sy < -100 || sy > H + 100) return;
        const dirX = -this.x;
        const dirY = -this.y;
        const len = Math.sqrt(dirX * dirX + dirY * dirY);
        if (len < 1) return;
        const nx = dirX / len;
        const ny = dirY / len;
        const tailScale = scale * 0.03;
        const tailLen = this.tailLength * tailScale;
        const alpha = Math.min(0.8, Math.max(0, (1 - this.z / 4000) * 0.7));
        const colors = [
            [180, 200, 255], [255, 200, 220], [200, 180, 255],
            [180, 200, 255], [255, 200, 220], [200, 180, 255],
            [255, 230, 200], [180, 255, 220], [255, 200, 180],
        ];
        const c = colors[Math.floor(this.hue * colors.length)];
        const tailEnd = Math.max(2, tailLen);
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, tailEnd);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.9})`);
        grad.addColorStop(0.05, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.6})`);
        grad.addColorStop(0.2, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.3})`);
        grad.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.1})`);
        grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(Math.atan2(ny, nx));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-tailEnd, -this.thickness * scale * 0.015);
        ctx.lineTo(-tailEnd, this.thickness * scale * 0.015);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        const headGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.thickness * scale * 0.08);
        headGlow.addColorStop(0, `rgba(255,255,255,${alpha * 0.8})`);
        headGlow.addColorStop(0.3, `rgba(${c[0]},${c[1]},${c[2]},${alpha * 0.4})`);
        headGlow.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.beginPath();
        ctx.arc(0, 0, this.thickness * scale * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = headGlow;
        ctx.fill();
        ctx.restore();
    }
}

comets = [];
for (let i = 0; i < 6; i++) comets.push(new Comet());

class SpaceFog {
    constructor() { this.reset(); }
    reset() {
        this.x = (Math.random() - 0.5) * 3000;
        this.y = (Math.random() - 0.5) * 1500;
        this.z = 3000 + Math.random() * 2000;
        this.width = 600 + Math.random() * 800;
        this.height = 100 + Math.random() * 200;
        this.alpha = 0.015 + Math.random() * 0.02;
        this.speed = 0.15 + Math.random() * 0.2;
        this.palette = [
            [100, 60, 180], [60, 100, 200], [180, 80, 160],
            [80, 160, 180], [180, 120, 80],
        ][Math.floor(Math.random() * 5)];
        this.wobble = Math.random() * Math.PI * 2;
    }
    update(spd) {
        this.z -= spd * this.speed;
        this.wobble += 0.005 * spd;
        this.x += Math.sin(this.wobble) * 0.3;
        if (this.z < 100) this.reset();
    }
    draw() {
        const scale = 900 / this.z;
        const sx = this.x * scale + W / 2;
        const sy = this.y * scale + H / 2;
        const w = this.width * scale * 0.05;
        const h = this.height * scale * 0.05;
        if (w < 5) return;
        const a = Math.min(this.alpha, Math.max(0, (1 - this.z / 5000) * this.alpha * 2));
        const c = this.palette;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, w);
        grad.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a})`);
        grad.addColorStop(0.3, `rgba(${c[0]},${c[1]},${c[2]},${a * 0.5})`);
        grad.addColorStop(0.6, `rgba(${c[0]},${c[1]},${c[2]},${a * 0.2})`);
        grad.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.beginPath();
        ctx.ellipse(sx, sy, w, h, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }
}

fogs = [];
for (let i = 0; i < 8; i++) fogs.push(new SpaceFog());

class Asteroid {
    constructor() { this.reset(true); }
    reset(init = false) {
        this.x = (Math.random() - 0.5) * 3000;
        this.y = (Math.random() - 0.5) * 3000;
        this.z = init ? Math.random() * 3000 + 500 : 3000;
        this.size = Math.random() * 8 + 3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;
        this.shape = [];
        const sides = 6 + Math.floor(Math.random() * 5);
        for (let i = 0; i < sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const r = 0.6 + Math.random() * 0.4;
            this.shape.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
    }
    update(speed) {
        this.z -= speed * 1.5;
        this.rotation += this.rotSpeed;
        if (this.z < 50) this.reset();
    }
    draw() {
        const scale = 900 / this.z;
        const sx = this.x * scale + W / 2;
        const sy = this.y * scale + H / 2;
        if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) return;
        const r = this.size * scale * 0.04;
        if (r < 1) return;
        const alpha = Math.min(0.6, Math.max(0, (1 - this.z / 3200) * 0.7));
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        this.shape.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x * r + 2, p.y * r + 2);
            else ctx.lineTo(p.x * r + 2, p.y * r + 2);
        });
        ctx.closePath();
        ctx.fillStyle = `rgba(0,0,0,${alpha * 0.3})`;
        ctx.fill();
        ctx.beginPath();
        this.shape.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x * r, p.y * r);
            else ctx.lineTo(p.x * r, p.y * r);
        });
        ctx.closePath();
        const gray = 60 + Math.floor(Math.random() * 40);
        ctx.fillStyle = `rgba(${gray + 20},${gray},${gray + 30},${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(180,180,200,${alpha * 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
    }
}

for (let i = 0; i < 40; i++) asteroids.push(new Asteroid());

class Nebula {
    constructor() { this.reset(); }
    reset() {
        this.x = (Math.random() - 0.5) * 4000;
        this.y = (Math.random() - 0.5) * 4000;
        this.z = Math.random() * 3000 + 500;
        this.radius = Math.random() * 400 + 200;
        this.colors = [
            { r: 100 + Math.random() * 60, g: 60 + Math.random() * 40, b: 180 + Math.random() * 75 },
            { r: 40 + Math.random() * 40, g: 80 + Math.random() * 50, b: 160 + Math.random() * 60 },
            { r: 60 + Math.random() * 50, g: 30 + Math.random() * 40, b: 120 + Math.random() * 60 },
            { r: 120 + Math.random() * 50, g: 60 + Math.random() * 40, b: 60 + Math.random() * 40 },
            { r: 80 + Math.random() * 40, g: 40 + Math.random() * 30, b: 180 + Math.random() * 60 },
        ][Math.floor(Math.random() * 5)];
        this.alpha = Math.random() * 0.08 + 0.04;
        this.sxOffset = 0;
        this.syOffset = 0;
    }
    update(speed) {
        this.z -= speed * 0.3;
        if (this.z < 50) this.reset();
    }
    draw() {
        const scale = 900 / this.z;
        const sx = this.x * scale + W / 2 + this.sxOffset;
        const sy = this.y * scale + H / 2 + this.syOffset;
        const r = this.radius * scale * 0.08;
        const alpha = Math.min(this.alpha, Math.max(0, (1 - this.z / 3500) * this.alpha * 2));
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        const c = this.colors;
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha * 1.5})`);
        grad.addColorStop(0.3, `rgba(${c.r},${c.g},${c.b},${alpha * 0.8})`);
        grad.addColorStop(0.6, `rgba(${c.r},${c.g},${c.b},${alpha * 0.3})`);
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }
}

for (let i = 0; i < 12; i++) nebulae.push(new Nebula());

class BigStar {
    constructor() { this.reset(true); }
    reset(init = false) {
        this.x = (Math.random() - 0.5) * 4000;
        this.y = (Math.random() - 0.5) * 4000;
        this.z = init ? Math.random() * 3000 + 200 : 3000;
        this.size = Math.random() * 7 + 4;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.colors = [
            { r: 255, g: 230, b: 200 }, { r: 200, g: 220, b: 255 },
            { r: 255, g: 200, b: 220 }, { r: 220, g: 200, b: 255 },
            { r: 255, g: 240, b: 200 },
        ][Math.floor(Math.random() * 5)];
    }
    update(speed) {
        this.z -= speed * 0.6;
        this.pulse += this.pulseSpeed;
        if (this.z < 100) this.reset();
    }
    draw(audioBoost = 0) {
        const scale = 900 / this.z;
        const sx = this.x * scale + W / 2;
        const sy = this.y * scale + H / 2;
        if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) return;
        const boost = 1 + audioBoost * 2;
        const r = Math.max(1, this.size * scale * 0.04 * boost);
        const alpha = Math.min(1, Math.max(0, (1 - this.z / 3200) * 0.9)) * (0.7 + audioBoost * 0.3);
        const pulse = 0.8 + Math.sin(this.pulse) * 0.2 + audioBoost * 0.3;
        const c = this.colors;
        const glowR = r * 15 * (1 + audioBoost);
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha * 0.5 * pulse})`);
        grad.addColorStop(0.15, `rgba(${c.r},${c.g},${c.b},${alpha * 0.2 * pulse})`);
        grad.addColorStop(0.5, `rgba(${c.r},${c.g},${c.b},${alpha * 0.05 * pulse})`);
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.beginPath();
        ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha * 0.15 * pulse})`;
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 4; a++) {
            const angle = a * Math.PI / 4 + this.pulse * 0.2;
            ctx.beginPath();
            ctx.moveTo(sx - Math.cos(angle) * r * 2, sy - Math.sin(angle) * r * 2);
            ctx.lineTo(sx + Math.cos(angle) * r * 8, sy + Math.sin(angle) * r * 8);
            ctx.stroke();
        }
        ctx.shadowBlur = r * 12;
        ctx.shadowColor = `rgba(${c.r},${c.g},${c.b},0.8)`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha * pulse})`;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

for (let i = 0; i < 2000; i++) bigStars.push(new BigStar());

class Star {
    constructor() { this.reset(true); }
    reset(init = false) {
        this.x = (Math.random() - 0.5) * 5000;
        this.y = (Math.random() - 0.5) * 5000;
        this.z = init ? Math.random() * 2000 : 2000;
        this.size = Math.random() * 4 + 1.5;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.color = [
            `rgba(200, 210, 255,`,
            `rgba(180, 200, 255,`,
            `rgba(220, 220, 255,`,
            `rgba(255, 230, 240,`,
            `rgba(200, 180, 255,`
        ][Math.floor(Math.random() * 5)];
    }
    update(speed) {
        this.z -= speed;
        if (this.z < 1) this.reset();
    }
    draw(audioBoost = 0) {
        const scale = 900 / this.z;
        const sx = this.x * scale + W / 2;
        const sy = this.y * scale + H / 2;
        if (sx < -50 || sx > W + 50 || sy < -50 || sy > H + 50) return;
        const boost = 1 + audioBoost * 1.5;
        const r = Math.max(0.6, this.size * scale * 0.06 * boost);
        const alpha = Math.min(this.opacity, Math.max(0, (1 - this.z / 2000) * this.opacity * 1.2)) * (0.7 + audioBoost * 0.3);
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color} ${alpha})`;
        ctx.fill();
        if (r > 2) {
            const gBoost = 1 + audioBoost * 2;
            const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 6 * gBoost);
            grad.addColorStop(0, `${this.color} ${alpha * 0.5})`);
            grad.addColorStop(1, `${this.color} 0)`);
            ctx.beginPath();
            ctx.arc(sx, sy, r * 6 * gBoost, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }
    }
}

for (let i = 0; i < STAR_COUNT; i++) stars.push(new Star());

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / W - 0.5) * 0.5;
    mouseY = (e.clientY / H - 0.5) * 0.5;
});

let audioBoost = 0;

function animate() {
    ctx.clearRect(0, 0, W, H);
    const speed = 3 + Math.sin(Date.now() * 0.0003) * 0.8;

    if (window.__getAudioBoost) audioBoost = window.__getAudioBoost();

    galaxies.forEach(g => { g.update(speed); g.draw(); });
    comets.forEach(c => { c.update(speed); c.draw(); });
    fogs.forEach(f => { f.update(speed); f.draw(); });

    nebulae.forEach(n => {
        n.sxOffset = mouseX * (3500 - n.z) * 0.01;
        n.syOffset = mouseY * (3500 - n.z) * 0.01;
        n.update(speed);
        n.draw();
    });

    asteroids.forEach(a => { a.update(speed); a.draw(); });
    stars.forEach(s => { s.update(speed); s.draw(audioBoost); });
    bigStars.forEach(s => { s.update(speed); s.draw(audioBoost); });

    requestAnimationFrame(animate);
}
animate();
