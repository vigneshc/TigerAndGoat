import * as React from 'react';
import { Board, BoardUpdater } from './GameBoard'
import { GamePieceType } from './GameTypes'
import { GamePiece } from './GamePiece'
import { NavMenu } from '../NavMenu'
import { TigerAndGoatUxProperties, TigerAndGoatBoardProps, TigerAndGoatUx } from './TigerAndGoatUx'

export class GameDisplay extends React.Component<TigerAndGoatUxProperties, Board>{

    constructor(props: TigerAndGoatUxProperties) {
        super(props);
        this.state = new Board(GamePieceType.Goat)
        this.MouseOver = this.MouseOver.bind(this)
        this.OnClick = this.OnClick.bind(this)
        this.toggleHelp = this.toggleHelp.bind(this)
        this.newGameAsGoat = this.newGameAsGoat.bind(this)
        this.newGameAsTiger = this.newGameAsTiger.bind(this)
        this.tick = this.tick.bind(this)
    }

    public componentDidMount() {
        this.setState(
            (prev: Board, props) => {
                prev.Interval = setInterval(this.tick, 100)
                return prev;
            }
        )
    }

    public componentWillUnmount()
    {
        this.setState(
            (prev:Board, props) => {
                clearInterval(prev.Interval)
                prev.Interval = -1
                return prev
            }
        )
    }

    public render() {
        return (
            <div className="container-fluid">
                <NavMenu
                    Help={this.toggleHelp}
                    Title="Tiger & Goat"
                    Actions={this.getMenuActions()}
                    HelpShown={this.state.ShowHelp}
                />
                <div className="container">
                    <TigerAndGoatUx
                        UxProperties={this.props}
                        Board={this.state}
                        OnMouseOver={this.MouseOver}
                        OnMouseClick={this.OnClick}
                    />
                </div>
            </div>
        )
    }

    private tick(): void{
        if (this.state.CurrentPlayer != this.state.HumanPlayer)
        {
            this.setState(
                (prev: Board, props) => {
                    var newBoard = BoardUpdater.MakeAIMoveIfNeeded(prev)
                    newBoard = this.highlightMove(prev, newBoard)
                    return newBoard
                }
            )
        }
    }

    // provides a visual indication that current circle can be selected.
    private MouseOver(point: string): void {
        this.setState((prev: Board, props) => {
            var board = new Board()
            board.Hovered = point
            return board
        })
    }

    // selects the circle to be moved.
    private OnClick(point: string): void {
        this.setState((prev: Board, props) => {
            var newBoard = BoardUpdater.Select(prev, point)
            newBoard = this.highlightMove(prev, newBoard)

            if (prev.Winner != newBoard.Winner) {
                fetch('/Home/RecordWinner?humanPlayer=' + prev.HumanPlayer + '&winner=' + newBoard.Winner)
            }

            return newBoard
        })
    }

    private highlightMove(prev: Board, newBoard: Board): Board{
        if (newBoard.Selection == Board.UndefinedString) {
            newBoard.Emptied = {}
            newBoard.Filled = []
            for (var k in newBoard.GamePieces) {
                if (newBoard.GamePieces[k] == GamePieceType.Empty) {
                    newBoard.Emptied[k] = prev.GamePieces[k]
                }
                else if (prev.GamePieces == undefined || prev.GamePieces[k] != newBoard.GamePieces[k]) {
                    newBoard.Filled.push(k)
                }
            }
        }
        else {
            newBoard.Emptied = prev.Emptied
        }

        return newBoard
    }

    private getMenuActions() {
        let actions: { [action: string]: () => void } = {}
        actions["New Game as Tiger"] = this.newGameAsTiger
        actions["New Game as Goat"] = this.newGameAsGoat
        return actions
    }

    private newGameAsTiger() {
        this.newGame(GamePieceType.Tiger)
    }

    private newGameAsGoat() {
        this.newGame(GamePieceType.Goat)
    }

    private newGame(player: GamePieceType) {
        fetch('/Home/NewGame?humanPlayer=' + player)
        this.setState((prev: Board, props) => {
            var board = new Board(player)
            board = BoardUpdater.MakeAIMoveIfNeeded(board)
            board.Filled = []
            board.Emptied = {}
            board.Winner = GamePieceType.Empty
            return board
        })
    }

    private toggleHelp() {
        this.setState((prev: Board, props) => {
            var newBoard = new Board()
            newBoard.ShowHelp = (prev.ShowHelp == undefined || !prev.ShowHelp) ? true : false
            return newBoard
        })
    }
}