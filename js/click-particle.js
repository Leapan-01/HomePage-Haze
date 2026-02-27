(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const canvas = document.createElement('canvas');
        canvas.id = 'effectCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '99999';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];
        let ripples = [];          // 涟漪数组

        // 调整 Canvas 尺寸
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        document.addEventListener('click', function(e) {
            const x = e.clientX;
            const y = e.clientY;

            // 涟漪
            ripples.push({
                x: x,
                y: y,
                radius: 5,          
                maxRadius: 60,      
                alpha: 0.8           
            });

            // 粒子
            const particleCount = 10;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: x,
                    y: y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    size: Math.random() * 5 + 2,
                    alpha: 1,
                    color: `hsl(${Math.random() * 40 + 180}, 80%, 70%)` // 水蓝色系
                });
            }
        });

        // 动画循环
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制涟漪
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(100, 200, 255, ${r.alpha})`; 
                ctx.lineWidth = 2;
                ctx.stroke();

                r.radius += 1.2;
                r.alpha -= 0.02;

                // 移除过大的涟漪
                if (r.radius > r.maxRadius || r.alpha <= 0) {
                    ripples.splice(i, 1);
                }
            }

            // 绘制粒子
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.01;
                p.size *= 0.98;

                if (p.alpha <= 0 || p.size < 0.5) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }
        animate();
    });
})();