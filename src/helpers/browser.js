import {
    win,
} from '../aliases'

/*
 * Checks whether sessionStorage is available, in a way that
 * does not throw a SecurityError in Firefox if "always ask"
 * is enabled for cookies.
 *
 * @returns {boolean}
 */
export function hasSessionStorage () {
    try {
        return !!win.sessionStorage;
    } catch (e) {
        return true; // SecurityError when referencing it means it exists
    }
}

/*
 * Checks whether localStorage is available, in a way that
 * does not throw a SecurityError in Firefox if "always ask"
 * is enabled for cookies.
 *
 * @returns {boolean}
 */
export function hasLocalStorage() {
    try {
        return !!win.localStorage;
    } catch (e) {
        return true; // SecurityError when referencing it means it exists
    }
}

/**
 * Return the current permission granted by the user for the current
 * origin to display web notifications.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Notification/permission
 * @returns {number}
 */
export function getNotificationPermission() {
    try {
        switch (Notification.permission) {
            case "denied":
                return 1;
            case "granted":
                return 2
        }
    } catch (b) {
        return 1;
    }
}