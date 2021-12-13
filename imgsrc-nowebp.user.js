// ==UserScript==
// @name         imgsrc webp to jpg
// @namespace    http://imgsrc.ru/
// @version      2021.12.12
// @description  Switch .webp to .jpg on imgsrc.ru cdns
// @author       Anonymous
// @match        https://*.icdn.ru/*
// @match        https://*.icdn.ru/*
// @grant        none
// @downloadURL none
// ==/UserScript==

(function () {
    'use strict';
    const url = document.location.href;
    if (url.match(/\.webp$/i)) {
        document.location.replace(url.replace(/\.webp$/i, ".jpg"))
    }
})();