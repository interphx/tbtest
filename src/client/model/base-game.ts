import { Game } from 'client/model/game';
import { Prompter } from 'client/utils/prompter';

export abstract class PromptingGame<TPlayer, TTurn, TAction> implements Game<TTurn, TPlayer> {
    abstract round(players: TPlayer[], history: TTurn[]): TTurn | Promise<TTurn>;
    abstract winners(players: TPlayer[], history: TTurn[]): TPlayer[] | Promise<TPlayer[]>;


    constructor(protected prompter: Prompter<TAction>) {

    }
    
}