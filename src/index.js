import {documentReady} from './functions/domEvents';
import {win} from './aliases';
import Tracker from './Tracker';

const holderName = 'GluttonObject';

if (win[holderName]) {
    const holder = win[win[holderName]];
    if (!holder._loaded) {
        const tracker = new Tracker();
        const call = function (args) {
            args = Array.from(args);
            const method = args.shift();
            return tracker[method] ?
                tracker[method].apply(tracker, args) :
                new Error('Undefined method');
        };

        holder.q.map(call);
        holder.call = call;
        holder._loaded = true;
        holder.q = [];
        documentReady(tracker.initialize);
    }
}
