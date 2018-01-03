import { clamp } from 'client/utils/math';

export interface Attribute {
    getValue(): number;
    getTotalAmount(): number;
    add(value: number): void;
    subtract(value: number): void;
    setBounds(min: number, max: number): void;
    getMin(): number;
    getMax(): number;
}

export class BoundedAttribute implements Attribute {
    constructor(
        protected min: number,
        protected max: number,
        protected value: number = max
    ) {

    }

    getTotalAmount() {
        return this.getValue() - this.getMin();
    }

    getValue() {
        return this.value;
    }

    add(value: number) {
        this.value = clamp(this.getMin(), this.getMax(), this.value);
    }

    subtract(value: number) {
        this.add(-value);
    }

    setBounds(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    getMin() {
        return this.min;
    }

    getMax() {
        return this.max;
    }
}