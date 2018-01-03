import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as RPS from 'client/games/rps';
import * as Buoy from 'client/games/buoy';
import * as Combat from 'client/games/combat';
import { play } from 'client/model/play';

class App extends React.Component<{}, {}> {
    render() {
        return <div>Hello, React!</div>;
    }
}

async function main() {
    let container = document.getElementById('react-container');
    ReactDOM.render(<App/>, container);

    let winners = await play([
        new Combat.HumanPlayer('Player'),
        new Combat.EasyAIPlayer('Computer A')
    ], new Combat.CombatGame());
    if (!winners) {
        alert('Game ends in a draw!');
    } else {
        alert(`${winners[0].name} wins!`);
    }
}

main();