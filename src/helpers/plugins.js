import {
    win,
    nav,
} from '../aliases'

let _flashVersion = '';

export function isJavaEnabled() {
    try {
        return navigator.javaEnabled()
    } catch (a) {
        return !1
    }
}

export function getFlashVersion() {
    if (_flashVersion) {
        return _flashVersion;
    }
    if ("undefined" !== typeof nav.plugins && "object" === typeof nav.plugins["Shockwave Flash"]) {
        let flashPlugin = nav.plugins["Shockwave Flash"];
        let version = flashPlugin.version;
        if ((flashPlugin = flashPlugin.description) || version) {
            let mime = nav.mimeTypes;
            if ("undefined" === typeof mime || !mime["application/x-shockwave-flash"] || mime["application/x-shockwave-flash"].enabledPlugin) {
                if (version) {
                    _flashVersion = version;
                } else {
                    _flashVersion = flashPlugin.replace(/([a-zA-Z]|\s)+/, "")
                        .replace(/(\s+r|\s+b[0-9]+)/, ".");
                }
            }
        }
    } else if ("undefined" !== typeof win.ActiveXObject)try {
        let c = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
        let flashPlugin = c.GetVariable("$version")
        if (flashPlugin) {
            _flashVersion = flashPlugin.split(" ")[1]
                .replace(/,/g, ".")
                .replace(/[^.\d]/g, "");
        }
    } catch (d) {
    }

    return _flashVersion;
}