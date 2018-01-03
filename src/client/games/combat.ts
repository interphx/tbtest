import { Player } from 'client/model/player';
import { Game } from 'client/model/game';
import { minBy } from 'client/utils/array';
import * as _ from 'lodash';
import { Attribute, BoundedAttribute } from 'client/utils/attribute';
import { callUntil, isTruthy } from 'client/utils/func';
import { Result, error, ok } from 'client/utils/result';

/* Types */

interface HitAction {
    type: 'hit';
    power: number;
}

interface RestAction {
    type: 'rest';
}

interface DodgeAction {
    type: 'dodge';
    power: number;
}

type CombatAction = HitAction | RestAction | DodgeAction;

interface CombatPlayer extends Player<CombatRound, CombatPlayer, CombatAction> {
    health: Attribute;
    stamina: Attribute;
}

interface CombatTurn {
    player: CombatPlayer;
    action: CombatAction;
};

type CombatRound = CombatTurn[];

interface CombatRoundState {
    turnsMade: CombatTurn[];
}

/* Utilities */

function isActionType(str: string): str is CombatAction['type'] {
    return ['hit', 'rest', 'dodge'].indexOf(str) >= 0;
}

function promptUntil<T>(text: string, transformer: (input: string) => Result<T, string>): T {
    let input = callUntil(() => prompt(text), isTruthy)!;
    let result = transformer(input);
    if (result.type === 'ok') {
        return result.value;
    }
    return promptUntil(text + '\n' + result.error, transformer);
}

let actionMakers = {
    rest(params: string[]): Result<RestAction, string> {
        let action: RestAction = { type: 'rest' };
        return ok(action);
    },

    hit(params: string[]): Result<HitAction, string> {
        if (params.length < 1) {
            return error(`Hit action must take 1 param (power).`);
        }
        let power = parseInt(params[0].trim());
        if (isNaN(power)) {
            return error(`Hit action power must be a valid number`);
        }
        let action: HitAction = { type: 'hit', power };
        return ok(action);
    },

    dodge(params: string[]): Result<DodgeAction, string> {
        if (params.length < 1) {
            return error(`Dodge action must take 1 param (power).`);
        }
        let power = parseInt(params[0].trim());
        if (isNaN(power)) {
            return error(`Dodge action power must be a valid number`);
        }
        let action: DodgeAction = { type: 'dodge', power };
        return ok(action);
    }
}

function makeAction(actionType: CombatAction['type'], params: string[]): Result<CombatAction, string> {
    let actionMaker = actionMakers[actionType];
    if (actionMaker) {
        return actionMaker(params);
    } else {
        return error(`No action constructor found for action type: ${actionType}`);
    }
}

function parseAction(input: string): Result<CombatAction, string> {
    let tokens = input.trim().split(' ');
    if (tokens.length < 1) {
        return error(`Input must be non-empty!`);
    }
    let actionType = tokens[0],
        params = tokens.slice(1);
    if (!isActionType(actionType)) {
        return error(`Unknown action type: ${actionType}.`);
    }

    return makeAction(actionType, params);
}

let availableReactions: {[key in CombatAction['type']]: CombatAction['type'][]} = {
    'hit': ['dodge'],
    'rest': [],
    'dodge': []
};

function getValidActions(player: CombatPlayer, state: CombatRoundState, players: CombatPlayer[], history: CombatRound[]): CombatAction['type'][] {
    if (player.stamina.getTotalAmount() <= 0) {
        return [];
    }
    if (state.turnsMade.length < 1) {
        return ['hit', 'rest'];
    }
    let lastTurn = state.turnsMade[state.turnsMade.length - 1];

    if (lastTurn.player === player) {
        return ['hit', 'rest'];
    } else {
        return availableReactions[lastTurn.action.type];
    }
}

/* Players */

export class HumanPlayer implements CombatPlayer {
    id: string;
    name: string;
    health: Attribute = new BoundedAttribute(0, 5);
    stamina: Attribute = new BoundedAttribute(-5, 5);

    constructor(name: string) {
        this.name = name;
        this.id = name;
    }

    getActingAction(opponent: CombatPlayer): CombatAction {
        let action = promptUntil(`Enter your opening move, ${this.name}:`, input => {
            let parseResult = parseAction(input);
            if (parseResult.type === 'error') {
                return parseResult;
            }

            let action = parseResult.value;

            // TODO: General way to track all consumable properties
            if (action.type === 'hit' || action.type === 'dodge') {
                if (action.power > this.stamina.getValue() - this.stamina.getMin()) {
                    return error(`Your action's power cannot exceed your available stamina (${this.stamina.getValue() - this.stamina.getMin()})`);
                }
            }
            
            return ok(action);
        });

        return action;
    }

    getReactingAction(opponent: CombatPlayer, opponentAction: CombatAction, validActions: CombatAction['type'][]): CombatAction {
        let result = promptUntil(`Enter your opening move, ${this.name}:`, input => {
            let parseResult = parseAction(input);
            if (parseResult.type === 'error') {
                return parseResult;
            }

            let action = parseResult.value;;
            
            if (validActions.indexOf(action.type) < 0) {
                return error(`${action.type} is not a valid reaction to ${opponentAction.type}. Valid reactions are ${validActions.join(`, `)}`);
            }

            // TODO: General way to track all consumable properties
            if (action.type === 'hit' || action.type === 'dodge') {
                if (action.power > this.stamina.getValue() - this.stamina.getMin()) {
                    return error(`Your action's power cannot exceed your available stamina (${this.stamina.getValue() - this.stamina.getMin()})`);
                }
            }
            
            return ok(action);
        });

        return result;
    }

    getAction(players: CombatPlayer[], history: CombatRound[], roundState: CombatRoundState): Promise<CombatAction> {
        let turnsMade = roundState.turnsMade,
            opponent = players.find(player => player !== this)!;
        alert(`
            Game state:\n
            ${players.map(player => `${player.name}: ${player.health.getTotalAmount()}hp | ${player.stamina.getTotalAmount()}sp`).join(`\n`)}
        `);
        if (turnsMade.length === 0) {
            return Promise.resolve(this.getActingAction(opponent));
        } else {
            let opponentTurns = turnsMade.filter(turn => turn.player === opponent);
            let lastOpponentAction = opponentTurns[opponentTurns.length - 1].action;
            return Promise.resolve(this.getReactingAction(opponent, lastOpponentAction, getValidActions(this, roundState, players, history)));
        }
    }
}

export class EasyAIPlayer implements CombatPlayer {
    id: string;
    name: string;
    health: Attribute = new BoundedAttribute(0, 5);
    stamina: Attribute = new BoundedAttribute(-5, 5);

    constructor(name: string) {
        this.name = name;
        this.id = name;
    }

    getActingAction(opponent: CombatPlayer): CombatAction {
        let actionType = _.sample(['hit', 'rest']);
        if (actionType === 'rest') {
            return { type: 'rest' };
        } else if (actionType === 'hit') {
            return {
                type: 'hit',
                power: (opponent.health.getValue() > 1) ? Math.floor(Math.random() * this.stamina.getValue()) : this.stamina.getTotalAmount()
            }
        } else {
            throw new Error(`Unable to process AI-choosen action type: ${actionType}`);
        }
    }

    getReactingAction(opponent: CombatPlayer, opponentAction: CombatAction): CombatAction {
        let validReactions = availableReactions[opponentAction.type];
        if (this.health.getValue() > 1) {
            let reactionType = _.sample(validReactions);
            if (reactionType === 'dodge') {
                return {
                    type: 'dodge',
                    power: Math.floor(Math.random() * this.stamina.getValue())
                }
            } else {
                throw new Error(`Unable to process AI-choosen reaction type: ${reactionType}`);
            }
        } else {
            return {
                type: 'dodge',
                power: this.stamina.getTotalAmount()
            }
        }
    }

    getAction(players: CombatPlayer[], history: CombatRound[], roundState: CombatRoundState): Promise<CombatAction> {
        let turnsMade = roundState.turnsMade,
            opponent = players.find(player => player !== this)!;
        if (turnsMade.length === 0) {
            return Promise.resolve(this.getActingAction(opponent));
        } else {
            let opponentTurns = turnsMade.filter(turn => turn.player === opponent);
            let lastOpponentAction = opponentTurns[opponentTurns.length - 1].action;
            return Promise.resolve(this.getReactingAction(opponent, lastOpponentAction));
        }
    }
}

/* Game */

export class CombatGame implements Game<CombatRound, CombatPlayer> {
    resolveActionReaction(players: CombatPlayer[], actionTurn: CombatTurn, reactionTurn: CombatTurn) {
        let actingPlayer = players.find(player => player === actionTurn.player)!,
            reactingPlayer = players.find(player => player === reactionTurn.player)!;

        // Action pre
        if (actionTurn.action.type === 'hit') {
            actingPlayer.stamina.subtract(actionTurn.action.power);
        }

        // Reaction pre
        if (reactionTurn.action.type === 'dodge') {
            reactingPlayer.stamina.subtract(reactionTurn.action.power);
        }
        
        // Resolution
        let action = actionTurn.action,
            reaction = reactionTurn.action;
        if (action.type === 'hit' && reaction.type === 'dodge') {
            if (action.power > reaction.power) {
                reactingPlayer.health.subtract(1);
            } else {
                // TODO: Perfect dodge
            }
        }

        // Action post

        if (actionTurn.action.type === 'rest') {
            actingPlayer.stamina.add(5);
            reactingPlayer.stamina.add(5);
        }

        // Reaction post
    }

    async round(players: CombatPlayer[], history: CombatRound[]): Promise<CombatRound> {
        let state: CombatRoundState = { turnsMade: [] };

        do {
            let actingPlayer = players[(history.length + state.turnsMade.length) % players.length];
            if (actingPlayer.stamina.getValue() > 0 && getValidActions(actingPlayer, state, players, history).length > 0) {
                let action = await actingPlayer.getAction(players, history, state);
                state.turnsMade.push({player: actingPlayer, action});
            } else {
                break;
            }
        } while(true);

        if (state.turnsMade.length < 1) {
            throw new Error(`Something went wrong! Nobody made a turn during a round.`);
        }

        if (state.turnsMade.length > 2) {
            console.warn(`More than 2 action executed per round. Only the last 2 are considered during resolution.`)
        }

        
        
        return state.turnsMade;
    }

    winners(players: CombatPlayer[], history: CombatRound[]): CombatPlayer[] | null | undefined {
        let losers = players.filter(player => player.health.getTotalAmount() <= 0);
        if (losers.length < 1) {
            return undefined;
        }
        let winners = players.filter(player => losers.indexOf(player) < 0);
        if (winners.length !== 1) {
            return undefined;
        }
        return winners;
    }
}