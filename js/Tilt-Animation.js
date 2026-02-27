(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const card = document.getElementById('MainCard');
        if (!card) return;

        const MAX_ANGLE = 6;         
        const PERSPECTIVE = 500;      
        const EASING = 0.1;            

        let rafId = null;
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;

        function updateTransform() {
            currentX += (targetX - currentX) * EASING;
            currentY += (targetY - currentY) * EASING;

            card.style.transform = `perspective(${PERSPECTIVE}px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;

            if (Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01) {
                rafId = requestAnimationFrame(updateTransform);
            } else {
                rafId = null;
            }
        }

        function handleMouseMove(clientX, clientY) {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let normX = (clientX - centerX) / (rect.width / 2);
            let normY = (clientY - centerY) / (rect.height / 2);

            normX = Math.min(1, Math.max(-1, normX));
            normY = Math.min(1, Math.max(-1, normY));

            targetY = normX * MAX_ANGLE;
            targetX = -normY * MAX_ANGLE;

            if (!rafId) {
                rafId = requestAnimationFrame(updateTransform);
            }
        }

        // PC 鼠标事件
        card.addEventListener('mousemove', (e) => {
            handleMouseMove(e.clientX, e.clientY);
        });
        card.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            if (!rafId) {
                rafId = requestAnimationFrame(updateTransform);
            }
        });

        // 移动端触摸支援
        card.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            if (touch) handleMouseMove(touch.clientX, touch.clientY);
        }, { passive: true }); 

        card.addEventListener('touchmove', (e) => {
            e.preventDefault(); 
            const touch = e.touches[0];
            if (touch) handleMouseMove(touch.clientX, touch.clientY);
        }, { passive: false });

        card.addEventListener('touchend', (e) => {
        });
    });
})();