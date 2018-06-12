import * as React from 'react';

export class Help extends React.Component<{}, {}>{
    public render() {
        return <div>
            <h4> Rules </h4>
            <p>
                <a href="https://en.wikipedia.org/wiki/Lambs_and_Tigers">Tiger and goat</a> is an abstract strategy game.<br />
                There are 15 goats and 3 tigers.
                Game starts with 3 Tigers placed on the boat and goat plays first.<br /><br />
                <p>
                    Until all goats are placed on the board, other goats cannot be moved.
                    Goats can be placed in any empty spot.
                    Once all 15 goats are placed, any goat can be moved one step along the lines to a position that is empty.
                </p>
                <p>
                    Tigers can normally move one step along the lines to a position that is empty, similar to goats.
                    It can move two steps along a line and kill a goat if there is a goat in the position it jumps over and if the final position is empty.
                </p>
                <p>
                    Goat wins if none of the tigers can be moved.<br />
                    Tiger wins if it kills at least 6 goats.
                </p>
            </p>

            <h4> Controls</h4>
            Touching or clicking a position selects it if it is a valid position that can be played.
            Touching or clicking in another valid position after selecting moves the selected position there.


        </div>
    }
}