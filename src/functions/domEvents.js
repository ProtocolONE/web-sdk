export const hasAddEventListener = !!window.addEventListener;

/**
 * @return {boolean}
 */
const stateIsComplete = () => {
  return document.readyState === 'loaded';
};

/**
 * @return {boolean}
 */
const stateIsInteractive = () => {
  return document.readyState === 'interactive';
};

export function addHandler(elem, type, handler, useCapture = false) {
  if (hasAddEventListener) {
    elem.addEventListener(type, handler, useCapture);
  }
}
export function removeHandler(elem, type, handler, useCapture = false) {
  if (hasAddEventListener) {
    elem.removeEventListener(type, handler, useCapture);
  }
}

export function documentReady(cb) {

  if (stateIsInteractive() || stateIsComplete()) {
    cb();
  }

  function loadedHandler() {
    removeHandler(document, 'DOMContentLoaded', loadedHandler);
    cb();
  }

  addHandler(document, 'DOMContentLoaded', loadedHandler);
}
