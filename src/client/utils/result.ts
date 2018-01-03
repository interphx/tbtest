/*export interface Result<TValue, TError> {
    isOk(): this is Ok<TValue, TError>;
    unwrap(): TValue;
    isError(): this is Err<TValue, TError>;
    unwrapError(): TError;
}*/

interface Ok<TValue> {
    type: 'ok';
    value: TValue;
}

interface Err<TError> {
    type: 'error';
    error: TError;
}

export type Result<TValue, TError> = Ok<TValue> | Err<TError>;

export function ok<TValue>(value: TValue): Ok<TValue> {
    return { type: 'ok', value };
}

export function error<TError>(error: TError): Err<TError> {
    return { type: 'error', error };
}

/*
interface BaseResult {
    isOk(): this is Ok<>;
}

export type Result<TValue, TError> = Ok<TValue> | Err<TError>;

class Ok<TValue> {
    constructor(protected value: TValue) {

    }

    isOk(): boolean {
        return true;
    }

    

    unwrap(): TValue {
        return this.value;
    }

}

class Err<TError> {
    constructor(protected error: TError) {

    }

    isError(): boolean {
        return true;
    }

    unwrapError(): TError {
        return this.error;
    }
}

export function ok<T>(value: T) {
    return new Ok(value);
}

export function error<E>(error: E) {
    return new Err(error);
}*/