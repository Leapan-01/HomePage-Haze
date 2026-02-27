const loadingMask = document.getElementById('loadingMask');
const bg = document.getElementById('bg');
const loaderContainer = document.getElementById('loaderContainer');
const animationStartTime = performance.now();

// 至少显示1秒，这样更自然一些
window.addEventListener('load', function () {
    const elapsed = performance.now() - animationStartTime;
    const minDisplayTime = 1000; 
    if (elapsed < minDisplayTime) {
        setTimeout(startExitAnimation, minDisplayTime - elapsed);
    } else {
        startExitAnimation();
    }
});

function startExitAnimation() {
    const descText = document.querySelector('.description-text');
    descText.style.opacity = '0';
    loaderContainer.style.opacity = '0'; 

    loadingMask.classList.add('loaded');
    bg.classList.add('bigger');

    const maskLeft = loadingMask.querySelector('.mask-left');
    const maskRight = loadingMask.querySelector('.mask-right');
    let typewriterStarted = false;

    const onTransitionEnd = function (e) {
        if (e.target === maskLeft || e.target === maskRight) {
            loadingMask.style.display = 'none'; 
            if (!typewriterStarted && typeof startTypewriter === 'function') {
                typewriterStarted = true;
                startTypewriter(); 
            }
        }
    };
    if (maskLeft) maskLeft.addEventListener('transitionend', onTransitionEnd, { once: true });
    if (maskRight) maskRight.addEventListener('transitionend', onTransitionEnd, { once: true });
}