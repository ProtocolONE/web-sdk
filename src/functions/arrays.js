export function filter(cb, array) {
    let i, res = [];
    for (i = 0; i < array.length; i++) {
        if (cb(array[i])) {
            res.push(array[i]);
        }
    }
    return res
}