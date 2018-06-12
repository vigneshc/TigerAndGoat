import { Point, CoordinateMapType, EdgesType, GamePieceMapType, GamePieceType, MiddleLocationsMap } from './GameTypes';
import { IGameAI, IBoard } from '../AI/AIInterfaces'
import * as TigerAndGoatNavigator from './TigerAndGoatNavigator'
import { AlphaBetaPruning } from '../AI/AlphaBeta'
import * as AI from '../AI/AIInterfaces'
import { TigerAndGoatConnections } from './Connections'

export class Board implements IBoard<GamePieceType>
{
    MaxGoats: number = 15
    GamePieces: GamePieceMapType
    Selection: string
    GoatsPlaced: number
    Hovered: string
    GoatsKilled: number
    SecondsElapsed: number
    TimerId: number
    HumanPlayer: GamePieceType
    CurrentPlayer: GamePieceType
    Filled: string[]
    Emptied: GamePieceMapType
    AI: IGameAI<TigerAndGoatNavigator.TigerAndGoatHeuristic, TigerAndGoatNavigator.TigerAndGoatMove, GamePieceType>
    Winner: GamePieceType
    ShowHelp: boolean
    Depth: number
    Interval: number
    static UndefinedString: string = "u"

    constructor(humanPlayer: GamePieceType = GamePieceType.Empty) {
        this.CloneForAI = this.CloneForAI.bind(this)
        this.IsPositionEmpty = this.IsPositionEmpty.bind(this)
        this.TogglePlayer = this.TogglePlayer.bind(this)
        this.Interval = 0

        if (humanPlayer != GamePieceType.Empty) {
            this.GoatsPlaced = 0
            this.GoatsKilled = 0
            this.GamePieces = {
                '1A': GamePieceType.Tiger,
                '2C': GamePieceType.Tiger,
                '2D': GamePieceType.Tiger
            }
            this.CurrentPlayer = GamePieceType.Goat
            this.SecondsElapsed = 0
            this.HumanPlayer = humanPlayer
            this.AI = new AlphaBetaPruning(new AI.DepthBasedLimiter(1, 6))
            this.Filled = []
            this.Emptied = {}
            this.Winner = GamePieceType.Empty
            this.Depth = 0
        }
    }

    CloneForAI(): Board {
        let board = new Board()
        board.MaxGoats = this.MaxGoats
        board.GoatsPlaced = this.GoatsPlaced
        board.GoatsKilled = this.GoatsKilled
        board.HumanPlayer = this.HumanPlayer
        board.GamePieces = {}
        board.Hovered = Board.UndefinedString
        board.Selection = Board.UndefinedString
        board.Depth = this.Depth + 1

        for (var k in this.GamePieces) {
            board.GamePieces[k] = this.GamePieces[k]
        }

        return board
    }

    IsPositionEmpty(position: string): boolean {
        return this.GamePieces[position] == undefined || this.GamePieces[position] == GamePieceType.Empty
    }

    TogglePlayer(): void {
        this.CurrentPlayer = this.CurrentPlayer == GamePieceType.Goat ? GamePieceType.Tiger : GamePieceType.Goat
    }
}

export class BoardUpdater {
    public static CopyBoardForUxUpdate(oldBoard: Board): Board {
        let board = new Board()
        board.GoatsPlaced = oldBoard.GoatsPlaced
        board.HumanPlayer = oldBoard.HumanPlayer
        board.GoatsKilled = oldBoard.GoatsKilled
        board.AI = oldBoard.AI
        board.GamePieces = oldBoard.GamePieces
        board.CurrentPlayer = oldBoard.CurrentPlayer
        board.Depth = oldBoard.Depth
        return board
    }

    public static Select(oldBoard: Board, location: string) {
        let board: Board
        if (oldBoard.Winner == GamePieceType.Tiger || oldBoard.Winner == GamePieceType.Goat) {
            return new Board()
        }

        if (oldBoard.CurrentPlayer == GamePieceType.Goat) {
            board = BoardUpdater.SelectGoat(oldBoard, location)
        }
        else {
            board = BoardUpdater.SelectTiger(oldBoard, location)
        }

        board.Winner = this.GetWinner(board)
        return board
    }

    public static MakeAIMoveIfNeeded(board: Board): Board {
        if (board.CurrentPlayer == board.HumanPlayer) {
            return board;
        }

        var nextStateAndMove = board.AI.GetNextMove(board, TigerAndGoatNavigator.TigerAndGoatNavigator.Instance)
        var newBoard = nextStateAndMove[0] as Board
        newBoard.Winner = this.GetWinner(newBoard)
        return newBoard
    }

    public static CanMoveTiger(board: Board, to: string) {
        return BoardUpdater.CanMovePlayer(board, to, GamePieceType.Tiger)
    }

    public static CanMoveTigerWithKill(board: Board, to: string) {
        return board.GamePieces[board.Selection] == GamePieceType.Tiger
            && TigerAndGoatConnections.Instance.TigerEdges[board.Selection].indexOf(to) != -1
            && (board.GamePieces[to] == GamePieceType.Empty || board.GamePieces[to] == undefined)
            && board.GamePieces[TigerAndGoatConnections.Instance.GetMiddleLocation(board.Selection, to)] == GamePieceType.Goat
    }

    private static GetWinner(board: Board): GamePieceType{
        if (board.Winner == GamePieceType.Empty || board.Winner == undefined) {
            return TigerAndGoatNavigator.TigerAndGoatNavigator.Instance.GetWinner(board)
        }
        else
        {
            return board.Winner
        }
    }

    private static CanMoveGoat(board: Board, to: string) {
        return BoardUpdater.CanMovePlayer(board, to, GamePieceType.Goat)
    }

    private static MoveTiger(board: Board, to: string) {
        return BoardUpdater.MovePlayer(board, to, GamePieceType.Tiger)
    }

    public static MoveTigerWithKill(board: Board, to: string) {
        var updatedBoard = BoardUpdater.CopyBoardForUxUpdate(board)
        updatedBoard.GamePieces[TigerAndGoatConnections.Instance.GetMiddleLocation(board.Selection, to)] = GamePieceType.Empty
        updatedBoard.GoatsKilled = board.GoatsKilled + 1
        updatedBoard.GamePieces[board.Selection] = GamePieceType.Empty
        updatedBoard.GamePieces[to] = GamePieceType.Tiger
        updatedBoard.CurrentPlayer = GamePieceType.Goat
        return updatedBoard
    }

    private static MoveGoat(board: Board, to: string) {
        return BoardUpdater.MovePlayer(board, to, GamePieceType.Goat)
    }

    private static SelectTiger(oldBoard: Board, location: string) {
        if (oldBoard.GamePieces[oldBoard.Selection] == GamePieceType.Tiger) {
            if (BoardUpdater.CanMoveTiger(oldBoard, location)) {
                return BoardUpdater.MoveTiger(oldBoard, location)
            }
            else if (BoardUpdater.CanMoveTigerWithKill(oldBoard, location)) {
                return BoardUpdater.MoveTigerWithKill(oldBoard, location)
            }
        }

        var updatedBoard = new Board()
        if (oldBoard.GamePieces[location] == GamePieceType.Tiger) {
            updatedBoard.Selection = location
        }

        return updatedBoard
    }

    private static SelectGoat(oldBoard: Board, location: string) {
        var updatedBoard = BoardUpdater.CopyBoardForUxUpdate(oldBoard)

        if (oldBoard.GoatsPlaced == oldBoard.MaxGoats) {
            if (oldBoard.GamePieces[oldBoard.Selection] == GamePieceType.Goat && BoardUpdater.CanMoveGoat(oldBoard, location)) {
                return BoardUpdater.MoveGoat(oldBoard, location)
            }
            else if (oldBoard.GamePieces[location] == GamePieceType.Goat) {
                updatedBoard.Selection = location
            }
        }
        else {
            if (oldBoard.GamePieces[location] == undefined || oldBoard.GamePieces[location] == GamePieceType.Empty) {
                if (oldBoard.Selection == location) {
                    updatedBoard.GamePieces[location] = GamePieceType.Goat
                    updatedBoard.CurrentPlayer = GamePieceType.Tiger
                    updatedBoard.GoatsPlaced = oldBoard.GoatsPlaced + 1
                }
                else {
                    updatedBoard.Selection = location
                }
            }
        }

        return updatedBoard
    }

    private static CanMovePlayer(board: Board, to: string, playerType: GamePieceType) {
        return board.GamePieces[board.Selection] == playerType
            && (board.GamePieces[to] == GamePieceType.Empty || board.GamePieces[to] == undefined)
            && board.CurrentPlayer == playerType
            && TigerAndGoatConnections.Instance.CommonEdges[board.Selection].indexOf(to) != -1
    }

    // Moves and updates state. Switches player.
    private static MovePlayer(board: Board, to: string, playerType: GamePieceType) {
        var newBoard = BoardUpdater.CopyBoardForUxUpdate(board)
        newBoard.CurrentPlayer = playerType == GamePieceType.Tiger ? GamePieceType.Goat : GamePieceType.Tiger;
        newBoard.GamePieces[board.Selection] = GamePieceType.Empty
        newBoard.GamePieces[to] = playerType

        return newBoard
    }
}
