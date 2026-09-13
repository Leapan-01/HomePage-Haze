(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const card = document.getElementById('MainCard');
        if (!card) return;

        const MAX_ANGLE = 6;       //最大倾斜角度 正比关系      
        const PERSPECTIVE = 450;   //透视距离 反比关系    
        const EASING = 0.1        //缓动效果 决定跟随鼠标速度   

        let rafId = null;
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;
        let lastTouchAt = 0;   //忽略触摸后浏览器补发的鼠标事件

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
            if (Date.now() - lastTouchAt < 800) return;
            handleMouseMove(e.clientX, e.clientY);
        });
        //卡片角度归零
        function resetTilt() {
            targetX = 0;
            targetY = 0;
            if (!rafId) {
                rafId = requestAnimationFrame(updateTransform);
            }
        }

        card.addEventListener('mouseleave', resetTilt);

        // 移动端触摸支援
        card.addEventListener('touchstart', (e) => {
            lastTouchAt = Date.now();
            const touch = e.touches[0];
            if (touch) handleMouseMove(touch.clientX, touch.clientY);
        }, { passive: true }); 

        card.addEventListener('touchmove', (e) => {
            lastTouchAt = Date.now();
            const touch = e.touches[0];
            if (touch) handleMouseMove(touch.clientX, touch.clientY);
        }, { passive: true }); 

        //事件打断回正
        card.addEventListener('touchend', resetTilt);
        card.addEventListener('touchcancel', resetTilt);
    });
})();
