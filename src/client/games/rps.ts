import { Player } from 'client/model/player';
import { Game } from 'client/model/game';

/* Types */

type RPSAction = 'rock' | 'paper' | 'scissors';

interface RPSPlayer extends Player<RPSRound, RPSPlayer, RPSAction> {
    alive: boolean;
}

interface RPSTurn {
    player: RPSPlayer;
    action: RPSAction;
};

type RPSRound = RPSTurn[];

/* Utilities */

function isRPSAction(str: string): str is RPSAction {
    return str === 'rock' || str === 'paper' || str === 'scissors';
}

function beats(a: RPSAction, b: RPSAction): boolean {
    return {
        'rock': ['scissors'],
        'paper': ['rock'],
        'scissors': ['paper']
    }[a].indexOf(b) >= 0;
}

/* Players */

export class HumanPlayer implements RPSPlayer {
    id: string;
    name: string;
    alive: boolean = true;

    constructor(name: string) {
        this.name = name;
        this.id = name;
    }

    getAction(players: RPSPlayer[], history: RPSRound[]): Promise<RPSAction> {
        do {
            var action = prompt(`${this.name}, please choose rock, paper or scissors:`);
            if (action) {
                action = action.trim().toLowerCase();
            }
        } while(!action || !isRPSAction(action));

        return Promise.resolve(action);
    }
}

export class RandomAIPlayer implements RPSPlayer {
    id: string;
    name: string;
    alive: boolean = true;

    constructor(name: string) {
        this.name = name;
        this.id = name;
    }

    getAction(players: RPSPlayer[], history: RPSRound[]): Promise<RPSAction> {
        let actions = ['rock', 'paper', 'scissors'] as RPSAction[],
            action = actions[Math.floor(Math.random() * actions.length)];
        return Promise.resolve(action);
    }
}

/* Game */

export class RPSGame implements Game<RPSRound, RPSPlayer> {
    async round(players: RPSPlayer[], history: RPSRound[]): Promise<RPSRound> {
        let playersActions = await Promise.all(
            players
                .filter(player => player.alive)
                .map(async player => ({
                    player,
                    action: await player.getAction(players, history, {})
                }))
        );
      

        for (let {player, action} of playersActions) {
            let beaten = playersActions.some(playerAction => beats(playerAction.action, action) && playerAction.player !== player);
            if (beaten) {
                player.alive = false;
            }
        }
        
        return playersActions;
    }

    winners(players: RPSPlayer[], history: RPSRound[]): RPSPlayer[] | null | undefined {
        let alivePlayers = players.filter(player => player.alive);
        if (alivePlayers.length === 1) {
            return alivePlayers;
        }
        if (alivePlayers.length === 0) {
            return null;
        }
        return undefined;
    }
}