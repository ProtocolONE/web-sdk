import {filter} from '../functions/arrays'

import {
    win,
    html,
} from '../aliases'

export function getScreenMetrics() {
    try {

        const s = win.screen;
        const orient = s.orientation || {};

        return {
            w: win.innerWidth || html.clientWidth || body.clientWidth,
            h: win.innerHeight || html.clientHeight || body.clientHeight,
            dpr: win.devicePixelRatio,
            tw: s.width || -1,
            th: s.height || -1,
            aw: s.availWidth || -1,
            ah: s.availHeight || -1,
            soa: orient.angle || -1,
            sot: orient.type || not_present
        };

    } catch (e) { }
}

export function getPerfomanceMetrics() {
    let performance = win.performance || win.webkitPerformance;
    let timing = performance && performance.timing;
    let metrics = [];

    if (timing) {
        let c = timing.navigationStart;
        metrics = {
            'dlp': timing.domainLookupEnd - timing.domainLookupStart,
            'ce': timing.connectEnd - timing.connectStart,
            'rqs': timing.responseStart - timing.requestStart,
            'rss': timing.responseEnd - timing.responseStart,
            'fs': timing.fetchStart - c,
            're': timing.redirectEnd - timing.redirectStart,
            'rc': timing.redirectCount || performance.navigation && performance.navigation.redirectCount,
            'di': timing.domInteractive && timing.domLoading ? timing.domInteractive - timing.domLoading : null,
            'dce': timing.domContentLoadedEventStart && timing.domContentLoadedEventEnd ? timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart : null,
            'dc': timing.domComplete ? timing.domComplete - c : null,
            'les': timing.loadEventStart ? timing.loadEventStart - c : null,
            'le': timing.loadEventStart && timing.loadEventEnd ? timing.loadEventEnd - timing.loadEventStart : null,
            'dcle': timing.domContentLoadedEventStart ? timing.domContentLoadedEventStart - c : null,
        };

        for (let i = metrics.length - 1; i >= 0; i++){
            let value = metrics[i];
            if (null !== value && (0 > value || 36E5 < value)) {
                metrics[i] = null
            }
        }
    }

    return metrics
}

export function getFirstContentfulPaint() {
    let performance = win.performance && win.performance.getEntriesByType;
    let paints = performance
        ? filter((a) => {return "first-contentful-paint" === a.name}, win.performance.getEntriesByType("paint"))
        : [];

    if (paints.length) {
        paints = paints[0];
        return Math.round(paints.startTime);
    }

    if (performance) {
        return 0;
    }

    if (win.performance && win.performance.timing) {
        let timing = win.performance.timing;
        if (timing.navigationStart && timing.msFirstPaint) {
            return timing.msFirstPaint - timing.navigationStart;
        }
    }
    return null
}