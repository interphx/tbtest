export interface Game<TRound, TPlayer, TRoundState = {}> {
    round(players: TPlayer[], history: TRound[]): TRound | Promise<TRound>;
    winners(players: TPlayer[], history: TRound[]): (TPlayer[] | null | undefined) | Promise<(TPlayer[] | null | undefined)>;
}
