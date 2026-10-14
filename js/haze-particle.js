(function () {
    function init() {
        if (window.__hazeParticlesInitialized) return;
        window.__hazeParticlesInitialized = true;

        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
        const bg = document.createElement('canvas');
        const fx = document.createElement('canvas');
        const dust = [], particles = [], ripples = [];
        let w, h, dpr, rafId = null;
        let lastTime = 0;   // 上一帧时间
        let lastDust = 0;   // 浮尘上次绘制时间
        let fxClear = true; // 点击层YesOrNo已经清干净

        function setup(canvas, id, z) {
            canvas.id = id;
            Object.assign(canvas.style, {
                position: 'fixed', inset: '0', width: '100%', height: '100%',
                pointerEvents: 'none', display: 'block', zIndex: String(z)
            });
        }

        setup(bg, 'hazeBackgroundCanvas', -1);//画布 粒子层级
        setup(fx, 'hazeClickCanvas', 1000);

        const bgElement = document.getElementById('bg');

        if (bgElement) {
            bgElement.parentNode.insertBefore(bg, bgElement.nextSibling);
        } else {
            document.body.insertBefore(
                bg,
                document.getElementById('MainCard')
            );
        }

        document.body.appendChild(fx);

        const b = bg.getContext('2d');
        const c = fx.getContext('2d');

        const FRAME = 1000 / 60;      //60fps为基准
        const DUST_INTERVAL = 1000 / 60; //浮尘

        function makeDust() {
            const glow = Math.random() < 0.16;//粒子出现概率
            const gold = Math.random() < 0.12;

            return {
                x: Math.random() * w,
                y: Math.random() * h,
                r: glow ? 2.8 + Math.random() * 1.4 : 1.3 + Math.random() * 1.7,//粒子大小
                vx: (Math.random() - 0.5) * 0.35,//粒子移动速度
                vy: 0.12 + Math.random() * 0.28,
                phase: Math.random() * 6.28,
                a: 0.42 + Math.random() * 0.34,//粒子透明度
                glow,
                color: gold
                    ? '225,169,83'
                    : Math.random() < 0.5
                        ? '104,177,222'
                        : '239,250,255'
            };
        }

        function resize() {
            const nw = innerWidth || 1;
            const nh = innerHeight || 1;
            const ndpr = Math.min(devicePixelRatio || 1, 2);//像素比

            if (nw === w && nh === h && ndpr === dpr) return;

            const sx = w ? nw / w : 1;
            const sy = h ? nh / h : 1;

            w = nw;
            h = nh;
            dpr = ndpr;

            [bg, fx].forEach(el => {
                el.width = Math.round(w * dpr);
                el.height = Math.round(h * dpr);
            });

            b.setTransform(dpr, 0, 0, dpr, 0, 0);
            c.setTransform(dpr, 0, 0, dpr, 0, 0);

            dust.forEach(p => {
                p.x *= sx;
                p.y *= sy;
            });

            const count = w <= 768 ? 38 : 64;//粒子数量

            while (dust.length < count) dust.push(makeDust());
            if (dust.length > count) dust.length = count;

            drawDust(0, 0);
            clearEffects();
            lastTime = 0;
            lastDust = 0;
            start();
        }

        function drawDust(t, dt) {
            b.clearRect(0, 0, w, h);

            const moving = dt > 0;
            const k = dt / FRAME;

            dust.forEach(p => {
                if (moving) {
                    p.x += p.vx * k;
                    p.y -= p.vy * k;

                    if (p.y < -6) {
                        p.y = h + 6;
                        p.x = Math.random() * w;
                    }

                    if (p.x < -6) p.x = w + 6;
                    if (p.x > w + 6) p.x = -6;
                }

                const pulse = moving //粒子闪烁
                    ? 0.72 + Math.sin(t * 0.0015 + p.phase) * 0.28
                    : 1;

                b.fillStyle = `rgba(${p.color},${p.a * pulse})`;
                b.shadowBlur = p.glow ? 9 : 0;//粒子光晕
                b.shadowColor = `rgba(${p.color},0.75)`;

                b.beginPath();
                b.arc(p.x, p.y, p.r, 0, 6.283);
                b.fill();
            });

            b.shadowBlur = 0;
        }

        document.addEventListener('click', e => {
            if (reduceMotion.matches) return;

            ripples.push({
                x: e.clientX,
                y: e.clientY,
                r: 5,
                max: 60,//涟漪大小
                a: 0.8//涟漪透明度
            });

            for (let i = 0; i < 10; i++) { //numbers
                particles.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: (Math.random() - 0.5) * 6, //粒子速度
                    vy: (Math.random() - 0.5) * 6,
                    r: Math.random() * 5 + 2,
                    a: 1, //粒子透明度
                    color: `hsl(${Math.random() * 40 + 180},80%,70%)`
                });
            }

            start();
        });

        function drawEffects(dt) {
            if (!ripples.length && !particles.length) {
                if (!fxClear) {
                    c.clearRect(0, 0, w, h);
                    fxClear = true;
                }
                return;
            }

            fxClear = false;
            c.clearRect(0, 0, w, h);

            const k = dt / FRAME;

            for (let i = ripples.length - 1; i >= 0; i--) {
                const p = ripples[i];

                c.beginPath();
                c.arc(p.x, p.y, p.r, 0, 6.283);
                c.strokeStyle = `rgba(100,200,255,${p.a})`; //涟漪颜色
                c.lineWidth = 2;
                c.stroke();

                p.r += 1.2 * k; //消散速度
                p.a -= 0.02 * k;

                if (p.r > p.max || p.a <= 0) {
                    ripples.splice(i, 1);
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                p.x += p.vx * k;
                p.y += p.vy * k;
                p.a -= 0.01 * k;
                p.r *= Math.pow(0.98, k);

                if (p.a <= 0 || p.r < 0.5) {
                    particles.splice(i, 1);
                    continue;
                }

                c.globalAlpha = p.a;
                c.fillStyle = p.color;
                c.beginPath();
                c.arc(p.x, p.y, p.r, 0, 6.283);
                c.fill();
            }

            c.globalAlpha = 1;
        }

        function clearEffects() {
            particles.length = 0;
            ripples.length = 0;
            c.clearRect(0, 0, w, h);
            fxClear = true;
        }

        function frame(t) {
            rafId = null;

            if (document.hidden) return;

            const dt = lastTime ? Math.min(t - lastTime, 50) : FRAME;
            lastTime = t;

            if (reduceMotion.matches) return;

            if (t - lastDust >= DUST_INTERVAL) {
                lastDust = t;
                drawDust(t, dt);
            }

            drawEffects(dt);

            rafId = requestAnimationFrame(frame);
        }

        function start() {
            if (
                rafId === null &&
                !document.hidden &&
                !reduceMotion.matches
            ) {
                rafId = requestAnimationFrame(frame);
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (rafId !== null) cancelAnimationFrame(rafId);
                rafId = null;
                lastTime = 0;
                lastDust = 0;
            } else {
                start();
            }
        });

        addEventListener('resize', resize, { passive: true });

        if (reduceMotion.addEventListener) {
            reduceMotion.addEventListener('change', () => {
                if (rafId !== null) cancelAnimationFrame(rafId);
                rafId = null;
                lastTime = 0;
                lastDust = 0;

                if (reduceMotion.matches) {
                    clearEffects();
                    drawDust(0, 0);
                } else {
                    start();
                }
            });
        }

        resize();
    }

    // defer 和 async 都ok
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();