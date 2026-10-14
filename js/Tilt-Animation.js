(function () {
    'use strict';

    function initTiltAnimation() {
        const card = document.getElementById('MainCard');
        if (!card || card.dataset.livingHazeTilt === 'ready') return;
        card.dataset.livingHazeTilt = 'ready';

        const PERSPECTIVE = 680; //透视距离
        const MAX_MOUSE_ANGLE = 8.5;//倾斜角度
        const ANGLE_EASING_60FPS = 0.105;//上行的缓动系数
        const POSITION_EASING_60FPS = 0.085;//平滑程度
        const GLOW_REST = 0.48;//光晕透明度
        const DESKTOP_FLOAT_Y = 12.5;//Card Y轴
        const DESKTOP_DRIFT_X = 2.6;//Card X轴
        const DESKTOP_TILT_X = 3.0;//Card X轴旋转
        const DESKTOP_TILT_Y = 4.1;//Card Y轴旋转
        const MOBILE_FLOAT_Y = 9.5;       //同上
        const MOBILE_DRIFT_X = 1.8;
        const MOBILE_TILT_X = 2.3;
        const MOBILE_TILT_Y = 3.0;

        const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const coarsePointerQuery = window.matchMedia('(hover: none), (pointer: coarse)');
        const isCoarsePointer = () => coarsePointerQuery.matches;
        const motionIsReduced = () => reduceMotionQuery.matches;
        const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

        if (!document.getElementById('living-haze-card-style')) {
            const style = document.createElement('style');
            style.id = 'living-haze-card-style';
            style.textContent = `
                #MainCard {
                    isolation: isolate;
                    transform-origin: 50% 50%;
                    --haze-glow-opacity: ${GLOW_REST};
                    --haze-glow-scale: 1;
                }
                #MainCard::before {
                    content: "";
                    position: absolute;
                    z-index: -1;
                    pointer-events: none;
                    inset: -30px -25px -34px; //光晕
                    border-radius: 38px;
                    background: radial-gradient(ellipse at 50% 48%,
                        rgba(103, 202, 255, .34) 0%,
                        rgba(211, 245, 255, .23) 37%,
                        rgba(255, 240, 183, .16) 58%,
                        rgba(255, 255, 255, 0) 78%);//淡出
                    filter: blur(17px);
                    opacity: var(--haze-glow-opacity, ${GLOW_REST});
                    transform: scale(var(--haze-glow-scale, 1));
                    transform-origin: center;
                }
            `;
            document.head.appendChild(style);
        }

        let rafId = null;
        let lastFrameTime = 0;
        let lastTouchAt = 0;
        let interactionMode = 'idle'; // idle | mouse | touch
        let pointerX = 0;
        let pointerY = 0;
        let currentX = 0;
        let currentY = 0;
        let currentZ = 0;
        let currentTranslateX = 0;
        let currentTranslateY = 0;
        let currentGlow = GLOW_REST;
        const startTime = performance.now();

        // 独立图层
        card.style.zIndex = '2';
        if (!motionIsReduced()) card.style.willChange = 'transform';

        function motionProfile() {
            return isCoarsePointer()
                ? {
                    floatY: MOBILE_FLOAT_Y,
                    driftX: MOBILE_DRIFT_X,
                    tiltX: MOBILE_TILT_X,
                    tiltY: MOBILE_TILT_Y
                }
                : {
                    floatY: DESKTOP_FLOAT_Y,
                    driftX: DESKTOP_DRIFT_X,
                    tiltX: DESKTOP_TILT_X,
                    tiltY: DESKTOP_TILT_Y
                };
        }

        function getIdlePose(timeMs) {
            const t = timeMs - startTime;
            const profile = motionProfile();

            // #每轴叠加两条波，避免明显的正弦重复感#
            const floatY = Math.sin(t * 0.00092 + 0.7) * profile.floatY //关于sin的浮动节奏 数值控制
                + Math.sin(t * 0.00047 + 2.1) * profile.floatY * 0.18;
            const driftX = Math.sin(t * 0.00063 + 1.4) * profile.driftX
                + Math.sin(t * 0.00031 + 0.2) * profile.driftX * 0.35;
            const tiltX = Math.sin(t * 0.00078 + 0.35) * profile.tiltX;
            const tiltY = Math.sin(t * 0.00061 + 1.8) * profile.tiltY;
            const tiltZ = Math.sin(t * 0.00043 + 2.4) * 0.32;

            return { floatY, driftX, tiltX, tiltY, tiltZ };
        }

        //光晕基准
        function settleToRest() {
            currentX = 0;
            currentY = 0;
            currentZ = 0;
            currentTranslateX = 0;
            currentTranslateY = 0;
            currentGlow = GLOW_REST;
            card.style.removeProperty('transform');
            card.style.removeProperty('will-change');
            card.style.setProperty('--haze-glow-opacity', String(GLOW_REST));
            card.style.setProperty('--haze-glow-scale', '1');
        }

        function handlePointerMove(clientX, clientY, mode) {
            if (motionIsReduced()) return;
            const rect = card.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            pointerX = clamp(((clientX - (rect.left + rect.width / 2)) / (rect.width / 2)), -1, 1);
            pointerY = clamp(((clientY - (rect.top + rect.height / 2)) / (rect.height / 2)), -1, 1);
            interactionMode = mode;
            ensureAnimationFrame();
        }

        function easeFactor(baseAt60, deltaMs) {
            // 在多种HZ屏幕上保持一致的缓动
            return 1 - Math.pow(1 - baseAt60, Math.max(0, deltaMs) / (1000 / 60));
        }

        function renderFrame(now) {
            rafId = null;
            // 减少动效
            if (motionIsReduced()) {
                settleToRest();
                return;
            }
            if (document.visibilityState === 'hidden') return;

            const deltaMs = lastFrameTime ? Math.min(now - lastFrameTime, 50) : 1000 / 60;
            lastFrameTime = now;
            const idle = getIdlePose(now);

            let targetX;
            let targetY;
            let targetZ;
            let targetTranslateX;
            let targetTranslateY;
            let intensity;

            if (interactionMode === 'mouse' || interactionMode === 'touch') {
                targetX = -pointerY * MAX_MOUSE_ANGLE + idle.tiltX * 0.16;//旋转
                targetY = pointerX * MAX_MOUSE_ANGLE + idle.tiltY * 0.16;
                targetZ = idle.tiltZ * 0.22;
                targetTranslateX = pointerX * 2.0 + idle.driftX * 0.18;//移动
                targetTranslateY = pointerY * 1.6 + idle.floatY * 0.17;
                intensity = 0.60 + Math.min(0.13, (Math.abs(pointerX) + Math.abs(pointerY)) * 0.055);//light
            } else {
                targetX = idle.tiltX;
                targetY = idle.tiltY;
                targetZ = idle.tiltZ;
                targetTranslateX = idle.driftX;
                targetTranslateY = idle.floatY;
                intensity = 0.46 + (Math.sin((now - startTime) * 0.00072 + 1.0) + 1) * 0.055;//呼吸效果
            }

            const angleEase = easeFactor(ANGLE_EASING_60FPS, deltaMs);
            const positionEase = easeFactor(POSITION_EASING_60FPS, deltaMs);
            currentX += (targetX - currentX) * angleEase;
            currentY += (targetY - currentY) * angleEase;
            currentZ += (targetZ - currentZ) * angleEase;
            currentTranslateX += (targetTranslateX - currentTranslateX) * positionEase;
            currentTranslateY += (targetTranslateY - currentTranslateY) * positionEase;
            currentGlow += (intensity - currentGlow) * easeFactor(0.055, deltaMs);

            card.style.transform = `perspective(${PERSPECTIVE}px) translate3d(${currentTranslateX.toFixed(2)}px, ${currentTranslateY.toFixed(2)}px, 0) rotateX(${currentX.toFixed(3)}deg) rotateY(${currentY.toFixed(3)}deg) rotateZ(${currentZ.toFixed(3)}deg)`;
            card.style.setProperty('--haze-glow-opacity', currentGlow.toFixed(3));
            card.style.setProperty('--haze-glow-scale', (1 + Math.max(0, currentGlow - 0.46) * 0.12).toFixed(3));

            ensureAnimationFrame();
        }

        function ensureAnimationFrame() {
            if (rafId === null && document.visibilityState !== 'hidden' && !motionIsReduced()) {
                rafId = requestAnimationFrame(renderFrame);
            }
        }

        function returnToIdle() {
            interactionMode = 'idle';
            ensureAnimationFrame();
        }

        // 过滤触摸屏事件
        card.addEventListener('mousemove', function (event) {
            if (Date.now() - lastTouchAt < 800) return;
            handlePointerMove(event.clientX, event.clientY, 'mouse');
        });
        card.addEventListener('mouseleave', function () {
            if (interactionMode === 'mouse') returnToIdle();
        });

        // 使用passive监听，触摸时不阻塞页面滚动
        card.addEventListener('touchstart', function (event) {
            lastTouchAt = Date.now();
            const touch = event.touches && event.touches[0];
            if (touch) handlePointerMove(touch.clientX, touch.clientY, 'touch');
        }, { passive: true });
        card.addEventListener('touchmove', function (event) {
            lastTouchAt = Date.now();
            const touch = event.touches && event.touches[0];
            if (touch) handlePointerMove(touch.clientX, touch.clientY, 'touch');
        }, { passive: true });
        card.addEventListener('touchend', function () {
            lastTouchAt = Date.now();
            returnToIdle();
        }, { passive: true });
        card.addEventListener('touchcancel', function () {
            lastTouchAt = Date.now();
            returnToIdle();
        }, { passive: true });

        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') {
                if (rafId !== null) cancelAnimationFrame(rafId);
                rafId = null;
                lastFrameTime = 0;
            } else {
                lastFrameTime = 0;
                ensureAnimationFrame();
            }
        });

        function handleMotionPreferenceChange() {
            if (motionIsReduced()) {
                if (rafId !== null) cancelAnimationFrame(rafId);
                rafId = null;
                settleToRest();
            } else {
                card.style.willChange = 'transform';
                lastFrameTime = 0;
                ensureAnimationFrame();
            }
        }

        if (typeof reduceMotionQuery.addEventListener === 'function') {
            reduceMotionQuery.addEventListener('change', handleMotionPreferenceChange);
        } else if (typeof reduceMotionQuery.addListener === 'function') {
            reduceMotionQuery.addListener(handleMotionPreferenceChange);
        }

        if (!motionIsReduced()) ensureAnimationFrame();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTiltAnimation, { once: true });
    } else {
        initTiltAnimation();
    }
})();