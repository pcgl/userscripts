// ==UserScript==
// @name         imgsrc download
// @namespace    lordlolicon
// @version      2019.12.10
// @description  Download imgsrc.ru with ctrl+D
// @author       Anonymous
// @match        http://imgsrc.ru/*
// @match        https://imgsrc.ru/*
// @grant        none
// @downloadURL none
// ==/UserScript==

const imgsrcExtensionVersion = "2019.12.10b"

function logMessage(msg) {
    console.log(`${new Date().toLocaleTimeString('en-us', {hour12: false})}: ${msg}`)
}

class KeyPressEvent {
    constructor(event) {
        this.e = event;
    }

    isCtrl(keyString) {
        return this.e.ctrlKey && this.e.key.toLowerCase() == keyString.toLowerCase();
    }

    isCtrlShift(keyString) {
        return this.e.ctrlKey && this.e.shiftKey && this.e.key.toLowerCase() == keyString.toLowerCase();
    }

    isAlt(keyString) {
        return this.e.altKey && this.e.key.toLowerCase() == keyString.toLowerCase();
    }

    is(keyString) {
        return this.e.key.toLowerCase() == keyString.toLowerCase();
    }

    isSpaceKey() {
        return this.e.keyCode == 32;
    }

    isEnterKey() {
        return this.e.keyCode == 13
    }
    
    log() {
        console.log(
            `${new Date().toLocaleTimeString('en-us', {hour12: false})}: ` +
            `Pressed ${
                this.e.ctrlKey && this.e.key!= "Control" ? "Ctrl-" : ""
            }${
                this.e.altKey && this.e.key != "Alt" ? "Alt-" : ""
            }${
                this.e.shiftKey && this.e.key != "Shift" ? "Shift-" : ""
            }${this.e.key}`
        )
    }
}

class ImgsrcPage {
    constructor() {
        this.location = window.location
        this.href = window.location.href;
        this.domain = window.location.host;
        this.path = window.location.pathname;
        this.search = window.location.search;
        this.id = window.location.hash.substring(1)

        if (this.path == "/main/search.php") {
            if (this.search.match(/love=true/i)) {
                this.isFaves = true;
                this.name = "Favorites"
            } else {
                this.isSearch = true;
                this.name = "Search"
            }
        } else if (this.path == "/main/user.php") {
            this.isTape = this.isUserpage = true;
            this.name = "User Page"
        } else if (this.path == "/main/tape.php") {
            this.isTape = this.isViewAll = true;
            this.name = "View All"
            if (this.id) {
                this.name += " with id #" + this.id
            }
        } else if (this.path.match(/^\/[^/]+\/a?\d+\.html/i)) {
            this.isAlbum = true;
            this.name = "Album"
        } else if (this.path == "/members/") {
            this.isLanding = true;
            this.name = "Member Landing Page"
        } else if (this.path == "/main/login.php") {
            this.isTape = this.isLogin = true;
            this.name = "Login Prompt"
        }
    }

    getImgURL(options) {
        let anchorMoved
        if (options && options.anchorMoved) {
            anchorMoved = true
        } else {
            anchorMoved = false
        }
        try {
            if (this.isViewAll && this.id) {
                if (anchorMoved) {
                    return document.getElementById(this.id).getElementsByTagName("img")[0].src;
                } else {
                    return document.getElementById(this.id).nextElementSibling.getElementsByTagName("img")[0].src;
                }
            } else if (this.isViewAll || this.isAlbum) {
                return document.getElementsByClassName("big")[0].src;
            } else {
                logMessage(`No img path defined for ${this.name}`);
            }
        } catch(e) {
            logMessage("Error finding img");
            return;
        }
    }

    log() {
        logMessage(`Current page is ${this.name} `);
    }
}

class HistoryStack {
    constructor(key) {
        this.key = key ? key : "imgsrcStack";
        let data = window.localStorage[this.key];
        this.stack = data ? JSON.parse(data) : [];
    }

    store(state) {
        window.localStorage[this.key] = JSON.stringify(
            state ? state : this.stack
        )
    }

    push(url) {
        if (!url) {
            url = window.location.href;
        }
        this.stack.push(url)
        if (this.stack.length > 10) {
            this.stack.shift()
        }
        this.store()
    }

    pop() {
        let url = this.stack.pop()
        this.store()
        return url
    }
}

(function() {
    'use strict';

    console.log("Loaded extension version " + imgsrcExtensionVersion);
    let loadedPage = new ImgsrcPage();
    loadedPage.log();
    var anchorMoved=false;

    document.head.innerHTML += "<style>img.big{max-height: 100vh !important}</style>"

    if (loadedPage.isSearch) {
        logMessage("Setting search grid css")
        document.head.innerHTML += "<style>.tdd td {display:inline-flex; display:flex}" +
            ".tdd tbody {display:flex; max-width:100vw; flex-wrap:wrap}" +
            ".nologo, .unveil50 {background-image:url(https://static.us.icdn.ru/images/nologo.png);" +
            "  height:unset!important; width:unset!important; background-size:unset!important;" +
            "  float:unset!important; display:block}" +
            ".tdd td:nth-child(1) {width:min-content; flex-direction:column; text-align:left}" +
            ".tdd td:nth-child(1) a {font-size:1.2em;}" +
            ".tdd TH {display:none}" +
            ".tdd TH:nth-child(1) {display:initial}" +
            ".tdd .uilt {display:initial}" +
            ".tdd br {display:none}" +
            ".hidden {display:none}</style>";

        let elems = document.getElementsByClassName("tdd")[0].getElementsByTagName("tr")

        let blacklist = [/boy'?s?z?\b/i, /\bbrother'?s?z?\b/i, /\bson'?s?\b/i, /\bnephew'?s?\b/i, /chubb(y|ie)/i, /\bfatt?(y|ie)s??\b/i]
        let whitelist = [/girl'?s?z?/i, /\bsister'?s?\b/i, /\bdau(ghter)?'?s?\b/i, /\bniece'?s?\b/i, /\bher'?s?\b/i, /pant(ie|y)/i, /upskirt/i]
        let highlight = [/pant(ie|y)[^h]/i, /upskirt/i, /upshort/i, /\b(summer)?camp(ing|ers?)?\b/i, /\bwet/i, /\bpee/i, /\byt/i, /youtube/i, /\boops/i,
                        /hidden/i, /(web|spy|ip|security)cam/i, /cam(girl|whore|slut)s?/i, /\bspy/i];

        let authorBlacklist = [/conrad052/i, /spyonboyz/i, /otismeyer/i, /dad3boys/i]        
        let authorHighlight = [/pant(ie|y)[^h]/i, /upskirt/i]

        logMessage("Begin blacklisting")
        for (let e of elems) {
            let at = e.innerText.match(/([^:\s]+): (.*)/);
            if (!at) {continue;}
            let author = at[1];
            let title = at[2];
            for (let b of blacklist) {
                if (title.match(b)) {
                    e.classList.add("hidden")
                    console.log(`${at[0]}\n matches ${b}; blacklisted`)
                    for (let w of whitelist) {
                        if (title.match(w)) {
                            e.classList.remove("hidden")
                            console.log(` but also matches ${w}; whitelisted`)
                            break;
                        }
                    }
                    break;
                }
            }
            for (let b of authorBlacklist) {
                if (author.match(b)) {
                    e.classList.add("hidden")
                    console.log(`${at[0]}\n matches ${b}; blacklisted`)
                    break;
                }
            }
            for (let w of highlight) {
                if (title.match(w)) {
                    e.style.border = "gold dotted"
                    console.log(`${at[0]}\n matches ${w}; highlighted`)
                    break;
                }
            }
            for (let w of authorHighlight) {
                if (author.match(w)) {
                    e.style.border = "gold dotted"
                    console.log(`${at[0]}\n matches ${w}; highlighted`)
                    break;
                }
            }
            logMessage("Finished blacklisting")
        }
    }

    if (loadedPage.isViewAll) {
        console.log("setting IDs");
        for (let anchor of document.querySelectorAll("a[id]")){
            anchor.nextElementSibling.id=anchor.id
            anchor.id=""
        }
        console.log("IDs set");
        anchorMoved=true;
    }

    onkeydown = function(e){
        let key = new KeyPressEvent(e);
        key.log()
        let page = new ImgsrcPage();
        // ^S or ^D
        if(key.isCtrl('S') || key.isCtrl('D')){
            console.log("^S Captured")
            let source;
            let newWindow=true;
            page.log()

            source = page.getImgURL({anchorMoved: anchorMoved})
            if (page.isViewAll) {
                //nothing to do
            } else if (page.isAlbum) {
                if (!e.shiftKey) {
                    newWindow = false;
                }
            }
            if (!source) {
                logMessage("No image node found")
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
        }
        // Enter Key
        else if (key.isEnterKey() || key.isSpaceKey()) {
            console.log("Enter Captured")
            let nextAnchor;
            if (page.isTape) {
                try {
                    if (page.id) {
                        if (anchorMoved) {
                            nextAnchor = document.getElementById(page.id).href
                        } else {
                            nextAnchor = document.getElementById(page.id).nextElementSibling.href
                        }
                    } else {
                        nextAnchor = document.getElementsByClassName("big")[0].parentElement.href;
                    }
                } catch(e) {
                    logMessage("Error finding img")
                    return;
                }
            } else if (page.isAlbum) {
                if (document.querySelector('input[value="Continue to album"]')) {
                    document.querySelector('input[value="Continue to album"]').click()
                    e.preventDefault();
                    return;
                }
                nextAnchor = document.querySelector('a[href*="tape.php"]')
            } else if (page.isLanding) {
                nextAnchor = "https://imgsrc.ru/main/search.php?love=true"
            }
            if (nextAnchor) {
                e.preventDefault();
                window.location = nextAnchor;
            }
        } else if (key.is('\\') || key.is('|')) { // "| \" key
            e.preventDefault();
            window.history.back()
        } else if (key.isCtrl("Z")) {
            window.open(new HistoryStack().pop(), '_blank');
        } else if (key.is('ArrowRight')) {
            //?
        }
    };

    // eslint-disable-next-line no-unused-vars
    window.addEventListener('beforeunload', (_e) => {
        if (!loadedPage.isLogin) {
            new HistoryStack().push()
        }
        // Chrome requires returnValue to be set.
        return null;
    });
})();