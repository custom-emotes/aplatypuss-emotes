// ==UserScript==
// @name Userscript loader for Aplatypuss FFZ Add-On
// @version 1.1
// @author nznzaza
// @description Injects Aplatypuss FFZ Add-On user-script
// @match *://*.twitch.tv/*
// @run-at document-body
// ==/UserScript==

(() => {

    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://aplatypuss-emotes.pages.dev/platyaddon.js';
    document.documentElement.appendChild(script);
})();