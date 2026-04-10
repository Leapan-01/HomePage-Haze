(async function () {
    const el = document.getElementById("yiyan");
    const api = "https://v1.hitokoto.cn/";
    const REPEAT_MS = 3000;
    let retries = 0;
    const MAX_RETRIES = 5;

    while (retries < MAX_RETRIES) {
        try {
            const res = await fetch(api);
            const data = await res.json();

            const sentence = data.hitokoto;
            const author = data.from_who || '';
            const work = data.from || '';

            let attribution = '';
            if (author && work) {
                attribution = ` —— ${author}「${work}」`;
            } else if (author) {
                attribution = ` —— ${author}`;
            } else if (work) {
                attribution = ` —— 「${work}」`;
            }

            el.innerText = sentence + attribution;
            break;
        } catch (e) {
            retries++;
            if (retries === MAX_RETRIES) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, REPEAT_MS));
        }
    }
})();