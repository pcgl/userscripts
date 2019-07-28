// ==UserScript==
// @name         imgsrc download
// @namespace    http://tampermonkey.net/
// @version      2019.07.27
// @description  Download imgsrc.ru with ctrl+D
// @author       You
// @match        http://imgsrc.ru/*
// @match        https://imgsrc.ru/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    onkeydown = function(e){
        if(e.ctrlKey && (e.keyCode == 'D'.charCodeAt(0) || e.keyCode == 'S'.charCodeAt(0))){
            let source;
            let newWindow=true;
            try {
                let album = window.location.href.match(/^https?:\/\/imgsrc.ru\/main\/tape.php\?ad=\d+\&.*#(\d+_next)/)
                if (album) {
                    let picID = album[1]
                    console.log(Date().toString() + ": Page is view-all with #id")
                    source = document.getElementById(picID).nextElementSibling.getElementsByTagName("img")[0].src;
                } else if (window.location.href.match(/^https?:\/\/imgsrc.ru\/[\w\_\-\.]+\/a?\d+.html/)) {
                    console.log(Date().toString() + ": Page is album")
                    source = document.getElementsByClassName("big")[0].src;
                    newWindow = false;
                } else if (window.location.href.match(/^https?:\/\/imgsrc.ru\/main\/tape.php\?ad=\d+\&/)) {
                    console.log(Date().toString() + ": Page is view-all without #id")
                    source = document.getElementsByClassName("big")[0].src;
                }
            } catch(e) {
                console.log(Date().toString() + ": Error finding img");
                return;
            }
            if (!source) {
                console.log(Date().toString() + ": No image node found");
                return;
            }
            if (source) {
                e.preventDefault();
                if (newWindow) {
                    window.newWindow = window.open(source, '_blank');
                } else {
                    window.location = source;
                }
            }
        } else if (e.keyCode == 13) { //enter
            let source;
             try {
                let album = window.location.href.match(/^https?:\/\/imgsrc.ru\/main\/tape.php\?ad=\d+\&.*#(\d+_next)/)
                if (album) {
                    let picID = album[1]
                    console.log(Date().toString() + ": Page is view-all with #id" + picID)
                    source = document.getElementById(picID).nextElementSibling.href
                } else if (window.location.href.match(/^https?:\/\/imgsrc.ru\/main\/tape.php\?ad=\d+\&/)) {
                    console.log(Date().toString() + ": Page is view-all without #id")
                    source = document.getElementsByClassName("big")[0].parentElement.href;
                }
            } catch(e) {
                console.log(Date().toString() + ": Error finding img");
                return;
            }
            if (source) {
                e.preventDefault();
                window.location = source;
            }
        } else if (e.keyCode == 220) { // "| \" key
                e.preventDefault();
                window.history.back()
        }
    };
})();