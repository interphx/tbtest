export interface Player<TRound, TPlayer, TAction, TRoundState = {}> {
    id: string;
    name: string;
    getAction(players: TPlayer[], history: TRound[], roundState: TRoundState): Promise<TAction>;
}