import fnv64_1a_fast from './functions/fnv64a'
import {isString} from './functions/strings'

import {
    getNotificationPermission
} from './helpers/browser'

import {
    isJavaEnabled,
    getFlashVersion
} from './helpers/plugins'

import {
    getScreenMetrics,
    getPerfomanceMetrics,
    getFirstContentfulPaint
} from './helpers/metrics'

import {
    win,
    nav,
    doc
} from './aliases'

export default class Tracker {
    constructor() {
        this.id = 'undone'
    }

    initialize() {
    }

    trackingId() {
        return this.id
    }

    page() {
        this.handle("page");
    }

    handle(name, data = {}, options = {}) {
        let techInfo = {
            'fpr': getFingerPrint(),
            'page': {
                'url': win.location.href,
                'la': getLanguage(),
                'cs': getDocumentCharset(),
            },
            'bd': {
                'ifr': isIframe(),
                'ifc': getFramesCount(),
                'sti': isSameOriginTopFrame(),
                'iia': isInstantArticle() ? "1" : "0",
                'ntf': getNotificationPermission(),
            },
            'sc': getScreenMetrics(),
            tm: getTimezone(),
            pm: getPerfomanceMetrics(),
            fp: getFirstContentfulPaint(),
            pl: {
                'j': isJavaEnabled() ? "1" : "0",
                'f': getFlashVersion(),

            },
            'plt': nav.platform || null,
            'c': navigator.cookieEnabled ? "1" : "",
            'nt': getNetType(),

        };

        console.log(techInfo);
    }
}

function getNetType() {
    let type = (nav.connection || {type: ""}).type;
    return {
        other: "0",
        none: "1",
        unknown: "2",
        wifi: "3",
        ethernet: "4",
        bluetooth: "5",
        cellular: "6",
        wimax: "7",
        mixed: "8"
    }[type] || type;
}

function getFingerPrint() {
    let fp = [
        nav.userAgent,
        [ screen.height, screen.width, screen.colorDepth ].join("x"),
        ( new Date() ).getTimezoneOffset()
    ];

    if (nav.plugins && nav.plugins.length) {
        for (let i = 0; i < nav.plugins.length; i++) {
            let plugin = nav.plugins[i];
            fp.push([plugin.name, plugin.version, plugin.description, plugin.filename])
        }
    }
    if (nav.mimeTypes && nav.mimeTypes.length) {
        for (let i = 0; i < nav.mimeTypes.length; i++) {
            let mime = navigator.mimeTypes[i];
            fp.push([mime.type, mime.description, mime.suffixes])
        }
    }

    return fnv64_1a_fast(fp.join(";"))
}

function isIframe() {
    try {
        return win.top === win.self ? 1 : 0;
    } catch (e) {
        return 0;
    }
}

function isSameOriginTopFrame() {
    try {
        return win.top.contentWindow || 1
    } catch (a) {
        return 0;
    }
}

function getFramesCount() {
    try {
        return win.parent.frames.length || 1;
    } catch (e) {
        return 0;
    }
}

function isInstantArticle() {
    return win.ia_document
        && win.ia_document.shareURL
        && win.ia_document.referrer;
}

function getLanguage() {
    let lang = (nav ? nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage : "").toLowerCase();
    return isString(lang) ? lang : ""
}

function getDocumentCharset() {
    return ("" + (doc.characterSet || doc.charset || "")).toLowerCase()
}

function getTimezone() {
    const d = new Date();
    let tz = null;
    try {
        tz = new Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone;
    } catch(err) {
    }

    return {
        ts: d.getTime(),
        tz: tz,
        tzo: -d.getTimezoneOffset() * 1000
    }
}