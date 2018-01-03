export function isTruthy(value: any) {
    return Boolean(value);
}

export function callUntil<T>(f: () => T, predicate: (value: T) => boolean): T {
    let result = f();
    if (predicate(result)) {
        return result;
    }
    return callUntil(f, predicate);
}