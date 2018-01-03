export interface Prompter<TAction> {
    prompt(text: string): TAction | Promise<TAction>;
}