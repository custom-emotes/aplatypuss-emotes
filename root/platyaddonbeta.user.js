// ==UserScript==
// @name Userscript loader for Aplatypuss BETA FFZ Add-On
// @version 1.1
// @author nznzaza
// @description Injects Aplatypuss FFZ BETA Add-On user-script
// @match *://*.twitch.tv/*
// @run-at document-start
// ==/UserScript==

(() => {

    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://aplatypuss-emotes.pages.dev/platyaddonbeta.js';
    document.documentElement.appendChild(script);
})();