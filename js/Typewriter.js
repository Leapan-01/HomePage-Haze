function startTypewriter() {
        const alpha = document.getElementById('typewriter');
        if (!alpha) return;
        alpha.style.opacity = '1';
        const text = alpha.innerText;
        alpha.innerText = '';
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                alpha.innerText += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
            }
        }, 150);
    }
