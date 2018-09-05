export function isString(a) {
    return "[object String]" === Object.prototype.toString.call(a);
}