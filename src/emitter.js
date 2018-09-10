/**
 * An simple reimplementation of the native Node.js EventEmitter class.
 * The goal of this implementation is to be as small as possible.
 */
export default class EventEmitter {
    constructor() {
        this.handlers = {};
    }

    getHandlers(event) {
        return this.handlers[event] = (this.handlers[event] || []);
    }

    emit(event, ...args) {
        this.getHandlers(event).forEach((fn) => fn(...args));
    }

    on(event, fn) {
        this.getHandlers(event).push(fn);
    }

    off(event = undefined, fn = undefined) {
        if (event && fn) {
            const handlers = this.getHandlers(event);
            const handlerIndex = handlers.indexOf(fn);
            if (handlerIndex > -1) {
                handlers.splice(handlerIndex, 1);
            }
        } else {
            this.handlers = {};
        }
    }
}