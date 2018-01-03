import { Player } from 'client/model/player';
import { Game } from 'client/model/game';
import { minBy } from 'client/utils/array';
import * as _ from 'lodash';

/* Types */

type BuoyAction = number;

interface BuoyPlayer extends Player<BuoyRound, BuoyPlayer, BuoyAction> {
    score: number;
}

interface BuoyTurn {
    player: BuoyPlayer;
    action: BuoyAction;
};

type BuoyRound = BuoyTurn[];

interface BuoyRoundState {
    validNumbers: {[id: string]: number[]};
}

/* Utilities */

function isBuoyAction(num: number, pool: number[]): num is BuoyAction {
    return pool.indexOf(num) >= 0;
}

function getSimilarityScore(a: BuoyAction, b: BuoyAction): number {
    if (a === b) {
        return 2;
    }
    if (Math.abs(a - b) === 1) {
        return 1;
    }
    return 0;
}

function generateValidNumbers(count: number, min: number, max: number): number[] {
    let result: number[] = [];
    for (let i = 0; i < count; ++i) {
        result.push(min + Math.floor(Math.random() * (max - min)));
    }
    return result;
}

function generateNumbersForPlayers(players: BuoyPlayer[], count: number, min: number, max: number): {[key: string]: number[]} {
    let result: {[key: string]: number[]} = Object.create(null);
    for (let player of players) {
        result[player.id] = generateValidNumbers(count, min, max);
    }
    return result;
}

/* Players */

export class HumanPlayer implements BuoyPlayer {
    id: string;
    name: string;
    score: number = 0;

    constructor(name: string) {
        this.name = name;
        this.id = name;
    }

    getAction(players: BuoyPlayer[], history: BuoyRound[], roundState: BuoyRoundState): Promise<BuoyAction> {
        let validNumbers = roundState.validNumbers[this.id];
        do {
            alert(`
                Player scores:\n 
                ${players.map(player => `${player.name}: ${player.score}`).join(`\n`)}
                \n\n
                Player numbers:\n
                ${
                    Object
                        .keys(roundState.validNumbers)
                        .map(key => `${key}: ${roundState.validNumbers[key].join(', ')}`)
                        .join('\n')
                }
            `);
            var input = prompt(`${this.name}, please choose a number from ${validNumbers.join(', ')}:`);
            var action = input ? parseInt(input.trim()) : NaN;
        } while(!isBuoyAction(action, validNumbers));

        return Promise.resolve(action);
    }
}

export class RandomAIPlayer implements BuoyPlayer {
    id: string;
    name: string;
    score: number = 0;

    constructor(name: string) {
        this.name = name;
        this.id = name;
    }

    getAction(players: BuoyPlayer[], history: BuoyRound[], roundState: BuoyRoundState): Promise<BuoyAction> {
        let actions = roundState.validNumbers[this.id],
            action = actions[Math.floor(Math.random() * actions.length)];
        alert(`${this.name} chooses ${action}`);
        return Promise.resolve(action);
    }
}

export class EasyAIPlayer implements BuoyPlayer {
    id: string;
    name: string;
    score: number = 0;

    constructor(name: string) {
        this.name = name;
        this.id = name;
    }

    getAction(players: BuoyPlayer[], history: BuoyRound[], roundState: BuoyRoundState): Promise<BuoyAction> {
        let minScorePlayerId = minBy(players, player => player.score).id;
        let minScorePlayerNumbers = roundState.validNumbers[minScorePlayerId];
        let myNumbers = roundState.validNumbers[this.id];

        let intersection = _.intersection(minScorePlayerNumbers, myNumbers);

        let actions = intersection.length > 0 ? intersection : roundState.validNumbers[this.id],
            action = actions[Math.floor(Math.random() * actions.length)];
        alert(`${this.name} chooses ${action}`);
        return Promise.resolve(action);
    }
}

/* Game */

export class BuoyGame implements Game<BuoyRound, BuoyPlayer> {
    async round(players: BuoyPlayer[], history: BuoyRound[]): Promise<BuoyRound> {
        let state = { validNumbers: generateNumbersForPlayers(players, 5, 1, 11) };

        let playersActions = await Promise.all(
            players
                .map(async player => ({
                    player,
                    action: await player.getAction(players, history, state)
                }))
        );
      

        for (let {player, action} of playersActions) {
            let scorePoints = playersActions
                .filter(playerAction => playerAction.player !== player)
                .reduce((sum, playerAction) => sum + getSimilarityScore(playerAction.action, action), 0);
            player.score += scorePoints;
        }
        
        return playersActions;
    }

    winners(players: BuoyPlayer[], history: BuoyRound[]): BuoyPlayer[] | null | undefined {
        let winners = players.filter(player => player.score >= 15);
        if (winners.length > 0) {
            return winners;
        }
        return undefined;
    }
}