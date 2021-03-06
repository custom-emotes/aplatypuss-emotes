// ==UserScript==
// @name Userscript loader for Emotes Add-On
// @version 1.0
// @author nznzaza
// @description Injects Emotes Addon as user-script
// @match *://*.twitch.tv/*
// @run-at document-start
// ==/UserScript==

(() => {

    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://aplatypuss-emotes.pages.dev/addon.js';
    document.documentElement.appendChild(script);
})();