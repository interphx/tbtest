import { Game } from 'client/model/game';
import { Player } from 'client/model/player';

const MAX_ITERATIONS = 65536;

export async function play<TRound, TPlayer>(players: TPlayer[], game: Game<TRound, TPlayer>): Promise<TPlayer[] | null> {
    let history: TRound[] = [];
    let iterations = 0;
    do {
        if (iterations++ >= MAX_ITERATIONS) {
            throw new Error(`Max game iterations count reached: ${iterations}`);
        }
        let round = await Promise.resolve(game.round(players, history));
        history.push(round);
        let winners = await Promise.resolve(game.winners(players, history));
        if (winners && winners.length > 0) {
            return winners;
        }
        if (winners === null) {
            return null;
        }
    } while(true);
}