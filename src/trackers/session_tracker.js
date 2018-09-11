import {now, uuid} from '../helpers/utilities';

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
import EventEmitter from '../emitter';
import Store from '../store'

const instances = {};

export default class SessionTracker extends EventEmitter {
    static getOrCreate(tracker, timeout, timeZone) {
        // Don't create multiple instances for the same property.
        const trackingId = tracker.counterId();
        if (instances[trackingId]) {
            return instances[trackingId];
        } else {
            return instances[trackingId] = new SessionTracker(tracker, timeout, timeZone);
        }
    }

    constructor(tracker, timeout, timeZone) {
        super();

        this.tracker = tracker;
        this.timeout = timeout || SessionTracker.DEFAULT_TIMEOUT;
        this.timeZone = timeZone;

        // Some browser doesn't support various features of the
        // `Intl.DateTimeFormat` API, so we have to try/catch it. Consequently,
        // this allows us to assume the presence of `this.dateTimeFormatter` means
        // it works in the current browser.
        try {
            this.dateTimeFormatter =
                new Intl.DateTimeFormat('en-US', {timeZone: this.timeZone});
        } catch(err) {
            // Do nothing.
        }

        /** @type {SessionStoreData} */
        const defaultProps = {
            hitTime: 0,
            num: 0,
            inactivity: 0,
            eventNum: 0,
            isExpired: false,
        };
        this.store = Store.getOrCreate(
            tracker.counterId(), 'session', defaultProps);

        // Ensure the session has an ID.
        if (!this.store.get().id) {
            this.store.set({id: uuid()});
        }
    }

    handle(name, data = {}, options = {}) {
        const sessionData = this.store.get();
        sessionData.hitTime = now();

        if (this.isExpired()) {
            sessionData.isExpired = false;
            sessionData.id = uuid();
            sessionData.num += 1;
        }

        sessionData.eventNum += 1;
        this.store.set(sessionData);
    }

    getData() {
        return this.store.get();
    }

    /**
     * Returns the ID of the current session.
     * @return {string}
     */
    getId() {
        return this.store.get().id;
    }

    isExpired(id = this.getId()) {
        // If a session ID is passed and it doesn't match the current ID,
        // assume it's from an expired session. If no ID is passed, assume the ID
        // of the current session.
        if (id !== this.getId()) return true;

        const sessionData = this.store.get();
        if (sessionData.isExpired) return true;

        const oldHitTime = sessionData.hitTime;

        // Only consider a session expired if previous hit time data exists, and
        // the previous hit time is greater than that session timeout period or
        // the hits occurred on different days in the session timezone.
        if (oldHitTime) {
            const currentDate = new Date();
            const oldHitDate = new Date(oldHitTime);
            if (currentDate - oldHitDate > (this.timeout * MINUTES) ||
                this.datesAreDifferentInTimezone(currentDate, oldHitDate)) {
                return true;
            }
        }

        // For all other cases return false.
        return false;
    }

    /**
     * Returns true if (and only if) the timezone date formatting is supported
     * in the current browser and if the two dates are definitively not the
     * same date in the session timezone. Anything short of this returns false.
     * @param {!Date} d1
     * @param {!Date} d2
     * @return {boolean}
     */
    datesAreDifferentInTimezone(d1, d2) {
        if (!this.dateTimeFormatter) {
            return false;
        } else {
            return this.dateTimeFormatter.format(d1)
                !== this.dateTimeFormatter.format(d2);
        }
    }
}

SessionTracker.DEFAULT_TIMEOUT = 30; // minutes
