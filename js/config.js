/**
 * ==============================================================================
 * HomePage-Haze 个人主页配置文件
 * ==============================================================================
 * 欢迎使用 HomePage-Haze 主题！
 * 你可以在本文件中集中配置主页的所有自定义信息，无需修改复杂的 HTML 或 CSS 代码。
 * ==============================================================================
 */
window.$config = {
    // --------------------------------------------------------------------------
    // 1. 基础站点信息
    // --------------------------------------------------------------------------
    site: {
        // 浏览器标签页标题
        title: "Leapan's HomePage——数字田园的悠然漫步",

        // 站点简介（用于搜索引擎 SEO 与网页元信息描述）
        description: "Leapan's HomePage",

        // 网站图标（Favicon），显示在浏览器标签页标题旁边，支持相对路径或图片外链
        favicon: "https://files.seeusercontent.com/2026/04/18/jP7s/icon.png",

        // 全屏背景壁纸图片链接，支持本地相对路径或外链图床
        background: "https://files.seeusercontent.com/2026/04/12/9Fyq/backgroundhaze.png"
    },

    // --------------------------------------------------------------------------
    // 2. 个人主卡片信息
    // --------------------------------------------------------------------------
    profile: {
        // 头像图片链接，推荐正方形图片
        avatar: "https://files.seeusercontent.com/2026/09/12/q6Qe/1Avatar.png",

        // 站长名称 / 昵称，显示在主卡片头像下方
        name: "Leapan",

        // 开屏加载遮罩中的大标题（不填则默认使用 "{name}'s HomePage"）
        loadingTitle: "Leapan's HomePage",

        // 副标题 / 打字机格言，开屏后会自动播放打字机动效
        slogan: "采菊东篱下，悠然见南山。",

        // 社交媒体图标列表
        // - icon: Font Awesome 6 图标类名（如 fab fa-github, fab fa-bilibili, fa-solid fa-envelope 等）
        // - url: 点击跳转的链接
        // - title: 鼠标悬停时显示的提示文字（可选）
        social: [
            { icon: "fab fa-github", url: "https://github.com/Leapan-01", title: "GitHub" },
            { icon: "fab fa-twitter", url: "https://x.com/leapan_01", title: "Twitter / X" },
            { icon: "fab fa-bilibili", url: "https://space.bilibili.com/667164368", title: "Bilibili" },
            { icon: "fab fa-pixiv", url: "https://www.pixiv.net/users/116413297", title: "Pixiv" },
            { icon: "fa-solid fa-envelope", url: "mailto:lp-gardenwalk@outlook.com", title: "Email" }
        ],

        // 主卡片底部的快捷导航按钮列表
        // - icon: 图标类名
        // - text: 按钮文字
        // - url: 跳转目标网址
        buttons: [
            { icon: "fas fa-blog", text: "博客", url: "https://blog.gardenwalk.moe/" },
            { icon: "fas fa-link", text: "友链", url: "https://blog.gardenwalk.moe/reciprocal-linking/" },
            { icon: "fas fa-rss", text: "RSS", url: "https://blog.gardenwalk.moe/feed/" }
        ]
    },

    // --------------------------------------------------------------------------
    // 3. 页脚版权与建站运行统计
    // --------------------------------------------------------------------------
    footer: {
        // 建站起始时间，格式为 'YYYY-MM-DDTHH:mm:ss'（将自动计算并实时刷新网站稳定运行的天/时/分/秒）
        startDate: "2024-02-22T23:43:41",

        // 异次元之旅（开往）配置
        travel: {
            enable: true, // 是否开启此项展示（true: 开启, false: 关闭）
            text: "异次元之旅",
            url: "https://travel.moe/go.html",
            icon: "https://travel.moe/images/icon/icon64orange.png",
            title: "异次元之旅-跃迁-我们一起去萌站成员的星球旅行吧！"
        },

        // 萌ICP / 工业ICP 备案信息
        icp: {
            enable: true, // 是否开启此项展示（true: 开启, false: 关闭）
            text: "萌ICP备20243222号",
            url: "https://icp.gov.moe/?keyword=20243222"
        },

        // 备用站 / 镜像站链接
        backupSite: {
            enable: true, // 是否开启此项展示（true: 开启, false: 关闭）
            text: "备用站链接",
            url: "https://leapan-01.github.io/"
        },

        // 版权归属信息
        copyright: {
            startYear: "2024", // 起始年份（若与结束年份相同则只显示单一年份）
            endYear: "auto",   // 结束年份：填 "auto" 或留空 "" 将自动根据当前年份计算（推荐，无需每年手动改动）；也可固定写死如 "2026"
            author: "Leapan",  // 版权所有者名称
            authorUrl: "https://www.gardenwalk.moe/" // 点击作者跳转的主页链接
        }
    }
};

/* ==============================================================================
 * 以下为配置自动应用逻辑（即插即用，无需修改）
 * ============================================================================== */
(function () {
    function applyConfig() {
        const cfg = window.$config;
        if (!cfg) return;

        // 1. 站点基础信息
        if (cfg.site) {
            if (cfg.site.title) document.title = cfg.site.title;
            if (cfg.site.description) {
                const metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) metaDesc.content = cfg.site.description;
            }
            if (cfg.site.favicon) {
                const favicon = document.querySelector('link[rel="shortcut icon"]');
                if (favicon) favicon.href = cfg.site.favicon;
            }
            if (cfg.site.background) {
                const bg = document.getElementById('bg');
                if (bg) bg.style.backgroundImage = `url('${cfg.site.background}')`;
            }
        }

        // 2. 个人卡片
        if (cfg.profile) {
            if (cfg.profile.avatar) {
                const avatar = document.querySelector('.avatar');
                if (avatar) avatar.style.backgroundImage = `url('${cfg.profile.avatar}')`;
            }
            if (cfg.profile.name) {
                const name = document.querySelector('.name');
                if (name) name.textContent = cfg.profile.name;
            }
            if (cfg.profile.loadingTitle || cfg.profile.name) {
                const loadingH1 = document.querySelector('.description-text h1');
                if (loadingH1) loadingH1.textContent = cfg.profile.loadingTitle || `${cfg.profile.name}'s HomePage`;
            }
            if (cfg.profile.slogan) {
                const typewriter = document.getElementById('typewriter');
                if (typewriter) typewriter.textContent = cfg.profile.slogan;
            }
            if (Array.isArray(cfg.profile.social)) {
                const socialContainer = document.querySelector('.social-icons');
                if (socialContainer) {
                    socialContainer.innerHTML = cfg.profile.social.map(item =>
                        `<a href="${item.url}" target="_blank" class="icon-link"${item.title ? ` title="${item.title}"` : ''}><i class="${item.icon}"></i></a>`
                    ).join('\n        ');
                }
            }
            if (Array.isArray(cfg.profile.buttons)) {
                const btnContainer = document.querySelector('.footer-links');
                if (btnContainer) {
                    btnContainer.innerHTML = cfg.profile.buttons.map(btn =>
                        `<a href="${btn.url}" target="_blank" class="footer-btn"><i class="${btn.icon}"></i><span>${btn.text}</span></a>`
                    ).join('\n            ');
                }
            }
        }

        // 3. 页脚信息
        if (cfg.footer) {
            const copyrightLinks = document.querySelector('.copyright-links');
            if (copyrightLinks) {
                const links = [];
                if (cfg.footer.travel && cfg.footer.travel.enable) {
                    const t = cfg.footer.travel;
                    links.push(`<a class="travel-link" href="${t.url}" ${t.title ? `title="${t.title}"` : ''} target="_blank">${t.icon ? `<img src="${t.icon}" alt="${t.text}">` : ''}${t.text}</a>`);
                }
                if (cfg.footer.icp && cfg.footer.icp.enable) {
                    const icp = cfg.footer.icp;
                    links.push(`<a class="icp-link" href="${icp.url}" target="_blank">${icp.text}</a>`);
                }
                if (cfg.footer.backupSite && cfg.footer.backupSite.enable) {
                    const b = cfg.footer.backupSite;
                    links.push(`<a class="back-up-blog-link" href="${b.url}" target="_blank">${b.text}</a>`);
                }
copyrightLinks.innerHTML = links.join('\n            <span class="separator">|</span>\n            ');
            }

            if (cfg.footer.copyright) {
                const c = cfg.footer.copyright;
                const copyDiv = document.querySelector('.copyright > div:not(.yiyan):not(.uptime-line)');
                if (copyDiv) {
                    const currentYear = new Date().getFullYear();
                    const end = (!c.endYear || c.endYear === 'auto') ? currentYear : c.endYear;
                    const year = (c.startYear && String(c.startYear) !== String(end))
                        ? `${c.startYear}-${end}`
                        : end;
                    copyDiv.innerHTML = `Copyright © ${year} by <a href="${c.authorUrl || '#'}">${c.author}</a> All Rights Reserved.`;
                }
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyConfig);
    } else {
        applyConfig();
    }
})();
