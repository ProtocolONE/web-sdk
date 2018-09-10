import EventEmitter from './emitter';

import {
    win,
    nav
} from './aliases'

const HTTPS = 'https';
const instances = {};

/**
 * @UNDONE
 * - beacon message size check
 * - creds
 * - protocol selection
 * - `unload` event handling for non beacon transport
 * - effective serialization
 * - bulk send
 */
export default class Transport extends EventEmitter {
    static getOrCreate(tracker, options) {
        // Don't create multiple instances for the same property.
        const trackingId = tracker.counterId();
        if (instances[trackingId]) {
            return instances[trackingId];
        } else {
            return instances[trackingId] = new Transport(tracker, options);
        }
    }

    constructor(tracker, options) {
        super();

        this.tracker = tracker;
        this.options = Object.assign({
                sendTimeout: 5000,
            },
            options
        );
        this.server = options.server;
    }

    send(msg) {
        const data = JSON.stringify(msg);
        const defaultPostPath = `/collect`;

        try {
            if (isSendBeacon()) {
                console.log('sending using beacon');
                nav.sendBeacon(this.makeURL(defaultPostPath), data);
                return true;

            } else if (isXHRsupported()) {
                console.log('sending using XHR');
                this.sendXHR(this.makeURL(defaultPostPath), data);
                return true;
            }
        } catch (error) {
            console.warn(error);
        }

        try {
            this.sendIMG(this.makeURL('/img', msg));
        } catch (e) {
            console.log('Error during sending data using image', e);
        }
    }

    sendXHR(url, data) {
        let xhr = initializeXMLHttpRequest();
        xhr.send(data);
    }

    sendIMG(url){
        const img = new Image(1, 1);

        img.src = url;
        img.onload = () => {
            console.log('img loaded');
        };
    }

    makeURL(path, data = {}, proto = HTTPS) {
        const query = getQueryString(data);
        return `${proto}://${this.server}${path}?${query}`;
    }
}

function getQueryString(data) {
    let query = "";

    for (let key in data) {
        if (!data.hasOwnProperty(key)) {
            continue;
        }

        if (query !== "") {
            query += "&";
        }
        query += encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
    }

    return query;
}

function initializeXMLHttpRequest(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    return xhr;
}

function isSendBeacon() {
    return 'sendBeacon' in nav;
}

function isXHRsupported() {
    return !!win.XMLHttpRequest;
}
