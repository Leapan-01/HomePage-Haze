(function () {
    'use strict';

    if (window.__hazeCursorLoaded) return;

    const CURSOR_STYLE = `
        * { cursor: none !important; }
        #cursor {
            position: fixed; left: 0; top: 0; width: 18px; height: 18px;
            background: var(--vp-c-text-1, #3c3c43); border-radius: 8px;
            opacity: .25; z-index: 99999998; pointer-events: none;
            transform: translate(-50%, -50%); transition: .2s ease-in-out;
            transition-property: background, opacity, transform;
        }
        #cursor-dot {
            position: fixed; left: 0; top: 0; width: 10px; height: 10px;
            background: gray; border-radius: 999px; z-index: 99999999;
            pointer-events: none; transform: translate(-50%, -50%);
            transition: opacity .2s ease-in-out;
        }
        #cursor.hidden, #cursor-dot.hidden { opacity: 0; }
        #cursor.hover { opacity: .1; }
        #cursor.active { opacity: .5; transform: translate(-50%, -50%) scale(.5); }
    `;
    const CURSOR_TRAIL_EASING = 0.2;
    const finePointerQuery = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');//设备检测
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    let cursorInstance = null;

    function isCoarsePointerDevice() {
        return !finePointerQuery.matches;
    }

    function prefersReducedMotion() {
        return reducedMotionQuery.matches;
    }

    class Cursor {
        constructor() {  //初始化光标
            this.cursorElement = null;
            this.cursorDotElement = null;
            this.styleElement = null;
            this.animationFrameId = null;
            this.isMounted = false;
            this.maskElement = document.getElementById('loadingMask');
            this.pointerTargets = new Set();
            this.pos = {
                curr: null,
                prev: null
            };

            this.handleMouseMove = (event) => {
                if (this.isLoadingMaskVisible()) {
                    this.pos.curr = { x: event.clientX, y: event.clientY };
                    this.cursorElement?.classList.add('hidden');
                    this.cursorDotElement?.classList.add('hidden');
                    if (this.styleElement && !this.styleElement.isConnected) {
                        document.body.appendChild(this.styleElement);
                    }
                    return;
                }

                if (!this.cursorElement?.isConnected || !this.cursorDotElement?.isConnected) {
                    this.ensureElements();
                }
                if (!this.cursorElement || !this.cursorDotElement) return;

                this.moveDot(event.clientX, event.clientY);
                if (this.pos.curr === null) this.move(event.clientX, event.clientY);
                this.pos.curr = { x: event.clientX, y: event.clientY };

                if (!this.styleElement.isConnected) document.body.appendChild(this.styleElement);
                this.cursorElement.classList.remove('hidden');
                this.cursorDotElement.classList.remove('hidden');
                this.cursorElement.classList.toggle('hover', this.targetUsesPointerCursor(event.target));

                if (prefersReducedMotion()) {
                    this.pos.prev = { ...this.pos.curr };
                    this.move(this.pos.curr.x, this.pos.curr.y);
                } else {
                    this.scheduleRender();
                }
            };

            this.handleMouseEnter = () => {
                if (this.isLoadingMaskVisible() || !this.pos.curr) return;
                this.cursorElement?.classList.remove('hidden');
                this.cursorDotElement?.classList.remove('hidden');
            };

            this.handleMouseLeave = () => {
                this.cursorElement?.classList.add('hidden');
                this.cursorDotElement?.classList.add('hidden');
            };

            this.handleMouseDown = (event) => {
                if (event.button === 0) this.cursorElement?.classList.add('active');
            };

            this.handleMouseUp = () => {
                this.cursorElement?.classList.remove('active');
            };

            this.handleWindowBlur = () => {
                this.handleMouseUp();
                this.handleMouseLeave();
            };

            this.handleMaskTransitionEnd = () => {
                if (this.isLoadingMaskVisible() || !this.pos.curr) return;

                this.pos.prev = { ...this.pos.curr };
                this.moveDot(this.pos.curr.x, this.pos.curr.y);
                this.move(this.pos.curr.x, this.pos.curr.y);
                this.cursorElement?.classList.remove('hidden');
                this.cursorDotElement?.classList.remove('hidden');
            };
        }

        isLoadingMaskVisible() {
            return Boolean(this.maskElement && this.maskElement.style.display !== 'none');
        }

        mount() {
            if (isCoarsePointerDevice()) {
                this.destroy();
                return;
            }
            if (!this.ensureElements()) return;
            if (this.isMounted) return;

            document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
            document.addEventListener('mouseenter', this.handleMouseEnter);
            document.addEventListener('mouseleave', this.handleMouseLeave);
            document.addEventListener('mousedown', this.handleMouseDown);
            document.addEventListener('mouseup', this.handleMouseUp);
            window.addEventListener('mouseup', this.handleMouseUp);
            window.addEventListener('blur', this.handleWindowBlur);
            this.maskElement?.addEventListener('transitionend', this.handleMaskTransitionEnd);

            if (this.isLoadingMaskVisible() && this.styleElement && !this.styleElement.isConnected) {
                document.body.appendChild(this.styleElement);
            }

            this.isMounted = true;
        }

            //创建光标元素
        ensureElements() {
            if (!document.body) return false;

            if (!this.cursorElement || !this.cursorElement.isConnected) {
                this.cursorElement = document.createElement('div');
                this.cursorElement.id = 'cursor';
                this.cursorElement.className = 'hidden';
                this.cursorElement.setAttribute('aria-hidden', 'true');
                document.body.appendChild(this.cursorElement);
            }

            if (!this.cursorDotElement || !this.cursorDotElement.isConnected) {
                this.cursorDotElement = document.createElement('div');
                this.cursorDotElement.id = 'cursor-dot';
                this.cursorDotElement.className = 'hidden';
                this.cursorDotElement.setAttribute('aria-hidden', 'true');
                document.body.appendChild(this.cursorDotElement);
            }

            if (!this.styleElement) {
                this.styleElement = document.createElement('style');
                this.styleElement.id = 'haze-cursor-style';
                this.styleElement.textContent = CURSOR_STYLE;
            }

            this.collectPointerTargets();
                //return
            if (this.pos.curr) {
                const point = this.pos.prev || this.pos.curr;
                if (!this.styleElement.isConnected) document.body.appendChild(this.styleElement);
                this.moveDot(this.pos.curr.x, this.pos.curr.y);
                this.move(point.x, point.y);
                this.cursorElement.classList.remove('hidden');
                this.cursorDotElement.classList.remove('hidden');
            }

            return true;
        }

        collectPointerTargets() {
            const styleWasConnected = this.styleElement?.isConnected;
            this.styleElement?.remove();
            this.pointerTargets.clear();

            for (const element of document.body.getElementsByTagName('*')) {
                if (window.getComputedStyle(element).cursor === 'pointer') {
                    this.pointerTargets.add(element);
                }
            }

            if (styleWasConnected) document.body.appendChild(this.styleElement);
        }

        targetUsesPointerCursor(target) {
            let element = target instanceof Element ? target : null;

            while (element) {
                if (this.pointerTargets.has(element)) return true;
                element = element.parentElement;
            }

            return false;
        }
            //update locate
        move(left, top) {
            if (!this.cursorElement) return;
            this.cursorElement.style.left = `${left}px`;
            this.cursorElement.style.top = `${top}px`;
        }

        moveDot(left, top) {
            if (!this.cursorDotElement) return;
            this.cursorDotElement.style.left = `${left}px`;
            this.cursorDotElement.style.top = `${top}px`;
        }

        scheduleRender() {
            if (this.animationFrameId !== null || !this.pos.curr) return;
            this.animationFrameId = window.requestAnimationFrame(() => this.render());
        }
            //拖尾动画
        render() {
            this.animationFrameId = null;
            if (!this.pos.curr) return;

            if (!this.pos.prev) {
                this.pos.prev = { ...this.pos.curr };
                this.move(this.pos.prev.x, this.pos.prev.y);
                return;
            }

            const dx = this.pos.curr.x - this.pos.prev.x;
            const dy = this.pos.curr.y - this.pos.prev.y;

            if (prefersReducedMotion() || Math.hypot(dx, dy) < 0.5) {
                this.pos.prev = { ...this.pos.curr };
                this.move(this.pos.prev.x, this.pos.prev.y);
                return;
            }

            this.pos.prev.x += dx * CURSOR_TRAIL_EASING;
            this.pos.prev.y += dy * CURSOR_TRAIL_EASING;
            this.move(this.pos.prev.x, this.pos.prev.y);
            this.scheduleRender();
        }

        destroy() {
            if (this.animationFrameId !== null) {
                window.cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }

            if (this.isMounted) {
                document.removeEventListener('mousemove', this.handleMouseMove);
                document.removeEventListener('mouseenter', this.handleMouseEnter);
                document.removeEventListener('mouseleave', this.handleMouseLeave);
                document.removeEventListener('mousedown', this.handleMouseDown);
                document.removeEventListener('mouseup', this.handleMouseUp);
                window.removeEventListener('mouseup', this.handleMouseUp);
                window.removeEventListener('blur', this.handleWindowBlur);
                this.maskElement?.removeEventListener('transitionend', this.handleMaskTransitionEnd);
                this.isMounted = false;
            }

            this.styleElement?.remove();
            this.cursorElement?.remove();
            this.cursorDotElement?.remove();
            this.styleElement = null;
            this.cursorElement = null;
            this.cursorDotElement = null;
            this.pointerTargets.clear();
            this.pos = { curr: null, prev: null };
        }
    }

    function ensureCursor() {
        if (!document.body) return;
        if (!cursorInstance) cursorInstance = new Cursor();
        cursorInstance.mount();
    }

    window.__hazeCursorLoaded = true;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureCursor, { once: true });
    } else {
        ensureCursor();
    }
})();
