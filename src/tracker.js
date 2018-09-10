import fnv64_1a_fast from './functions/fnv64a'
import {isString} from './functions/strings'
import EventEmitter from './emitter'


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

export default class Tracker extends EventEmitter {
    constructor() {
        super();
        this.id = '';
    }

    initialize() {
        console.log('dom ready initialize');
    }

    counterId() {
        return this.id
    }

    init(id) {
        this.id = id;
        console.log(this.id);
    }

    page(data) {
        console.log(data);
        this.handle("page", data);
    }

    event(data) {
        console.log(data);
        this.handle("event", data);
    }

    handle(name, data = {}, options = {}) {
        let techInfo = {
            'fpr': getFingerPrint(),
            'page': {
                'url': win.location.href,
                'ref': doc.referrer,
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

        console.log(techInfo, data);
    }
}
/**
 * @undone event listener
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
 * @returns {*}
 */
function getNetType() {
    let netInfo = nav.connection;
    if (!netInfo) {
        return {};
    }

    let type = netInfo.type;
    type = {
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

    let effectiveType = netInfo.effectiveType;
    effectiveType = {
        "slow-2g": "1",
        "2g": "2",
        "3g": "3",
        "4g": "4",
    }[effectiveType] || effectiveType;

    return {
        dl: netInfo.downlink,
        dm: netInfo.downlinkMax,
        t: type,
        et: effectiveType,
        rtt: netInfo.rtt
    }
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