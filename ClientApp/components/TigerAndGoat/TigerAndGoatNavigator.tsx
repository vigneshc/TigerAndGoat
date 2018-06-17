import * as AI from '../AI/AIInterfaces'
import { Board, BoardUpdater } from './GameBoard'
import { Point, CoordinateMapType, EdgesType, GamePieceMapType, GamePieceType } from './GameTypes';
import { TigerAndGoatConnections } from './Connections'

/**
 * Represents a move in tiger and goat game.
 */
export class TigerAndGoatMove {
    readonly From: string
    readonly To: string
    readonly Player: GamePieceType

    constructor(from: string, to: string, player: GamePieceType) {
        this.From = from
        this.To = to
        this.Player = player
    }
}

/**
 * Represents heuristic of a state in tiger and goat game.
 */
export class TigerAndGoatHeuristic implements AI.IHeuristic<TigerAndGoatHeuristic>
{
    static readonly MaxTigers = 3

    GoatsKilled: number
    TigersStuck: number
    GoatsInKillPosition: number
    Depth: number
    OptionsForTiger: number

    constructor() {
        this.GoatsInKillPosition = 0
        this.TigersStuck = 0;
        this.GoatsKilled = 0;
        this.OptionsForTiger = 0;
        this.Depth = 0;
    }

    /**
     * Compares two heuristics. Returns -1 if current heuristic is smaller, 1 if current is bigger, 0 if equal.
     * General idea is
     * Tiger:
     *   - Avoid states where tigers are stuck.
     *   - Prefer states that increases number of killed goats.
     *   - Prefer states that increases number of goats in danger of being killed.
     *   - Prefer states that increases number of available moves for tigers.
     * Goat:
     *   - Opposite of tiger.
     * @param other other heuristic.
     */
    Compare(other: AI.IHeuristic<TigerAndGoatHeuristic>): number {
        // Tiger is maximizing player
        var otherH = other as TigerAndGoatHeuristic
        if (this.TigersStuck == otherH.TigersStuck) {
            
            var optionsForTigerDiff = this.OptionsForTiger - otherH.OptionsForTiger;

            if(this.TigersStuck + 1 >= TigerAndGoatHeuristic.MaxTigers)
            {
                if( (this.OptionsForTiger <=2 || otherH.OptionsForTiger <=2) && optionsForTigerDiff != 0)
                {
                    return optionsForTigerDiff;
                }
            }

            return this.CompareGoatsStats(otherH)
        }
        else {
            var tigerStuckDiff = otherH.TigersStuck - this.TigersStuck
            if(this.TigersStuck > 1 || otherH.TigersStuck > 1)
            {
                return tigerStuckDiff;
            }

            // if we reach here, <=1 tiger stuck in both current and other.
            return this.CompareGoatsStats(otherH)
        }
    }

    CompareGoatsStats(otherH: TigerAndGoatHeuristic): number{
        var goatsKilledDiff = this.GoatsKilled - otherH.GoatsKilled
        if (goatsKilledDiff != 0) {
            return goatsKilledDiff
        }

        var goatsKillPositionDiff = this.GoatsInKillPosition - otherH.GoatsInKillPosition

        if (goatsKillPositionDiff != 0) {
            return goatsKillPositionDiff
        }

        return this.OptionsForTiger - otherH.OptionsForTiger
    }
}

/**
 * Logic to move from one state to another in tiger and goat state.
 */
export class TigerAndGoatNavigator implements AI.IBoardNavigator<TigerAndGoatHeuristic, TigerAndGoatMove, GamePieceType>
{
    public static Instance: TigerAndGoatNavigator = new TigerAndGoatNavigator()

    GetNeighbourStates(startingState: Board): [Board, TigerAndGoatMove][] {
        if (startingState.CurrentPlayer == GamePieceType.Tiger) {
            return this.GetNeighbourStatesForTiger(startingState)
        }
        else {
            return this.GetNeighbourStatesForGoat(startingState)
        }
    }

    GetHeuristicValue(startingState: Board): AI.IHeuristic<TigerAndGoatHeuristic> {
        var result = new TigerAndGoatHeuristic()
        result.GoatsKilled = startingState.GoatsKilled
        result.Depth = startingState.Depth
        var goatsInKillPosition: { [p: string]: boolean } = {}

        for (var from in startingState.GamePieces) {
            if (startingState.GamePieces[from] == GamePieceType.Tiger) {

                // all moves with single hop.
                var stuck = 1
                for (var toIndex in TigerAndGoatConnections.Instance.CommonEdges[from]) {
                    var to = TigerAndGoatConnections.Instance.CommonEdges[from][toIndex]
                    if (startingState.IsPositionEmpty(to)) {
                        stuck = 0
                        result.OptionsForTiger = result.OptionsForTiger + 1
                    }
                }

                // all moves that include killing a goat.
                for (var toIndex in TigerAndGoatConnections.Instance.TigerEdges[from]) {
                    var to = TigerAndGoatConnections.Instance.TigerEdges[from][toIndex]
                    var middleLocation = TigerAndGoatConnections.Instance.GetMiddleLocation(from, to)
                    if (startingState.GamePieces[middleLocation] == GamePieceType.Goat && startingState.IsPositionEmpty(to)) {
                        stuck = 0
                        result.OptionsForTiger = result.OptionsForTiger + 1

                        if (!(middleLocation in goatsInKillPosition)) {
                            result.GoatsInKillPosition = result.GoatsInKillPosition + 1
                            goatsInKillPosition[middleLocation] = true
                        }
                    }
                }

                result.TigersStuck = result.TigersStuck + stuck
            }
        }

        return result
    }

    GetEmptyMove(): TigerAndGoatMove {
        return new TigerAndGoatMove("", "", GamePieceType.Empty)
    }

    IsEndState(state: Board, neighbourCount: number): [boolean, GamePieceType] {
        if (state.GoatsKilled != undefined && state.GoatsKilled >= 6) {
            return [true, GamePieceType.Tiger]
        }
        else if (neighbourCount == 0) {
            return [true, GamePieceType.Goat]
        }

        return [false, GamePieceType.Empty]
    }

    GetWinner(state: Board): GamePieceType {
        var result = GamePieceType.Empty
        if (state.GoatsKilled >= 6) {
            result = GamePieceType.Tiger
        }
        else if (state.CurrentPlayer == GamePieceType.Tiger && this.GetNeighbourStatesForTiger(state).length == 0) {
            result = GamePieceType.Goat
        }
        return result
    }

    GetNeighbourStatesForGoat(startingState: Board): [Board, TigerAndGoatMove][] {
        let neighbours: [Board, TigerAndGoatMove][] = []

        // until all goats are placed, return all places that are empty.
        if (startingState.GoatsPlaced < startingState.MaxGoats) {
            for (var positionIndex in TigerAndGoatConnections.Instance.Coordinates) {
                var position = TigerAndGoatConnections.Instance.Coordinates[positionIndex]
                if (startingState.IsPositionEmpty(position)) {
                    var board = startingState.CloneForAI()
                    board.GamePieces[position] = GamePieceType.Goat
                    board.GoatsPlaced = board.GoatsPlaced + 1
                    board.CurrentPlayer = GamePieceType.Tiger
                    neighbours.push([board, new TigerAndGoatMove(position, position, GamePieceType.Goat)])
                }
            }
        }
        else {
            // after all goats are placed, return all valid moves with one hop.
            for (var position in startingState.GamePieces) {
                if (startingState.GamePieces[position] == GamePieceType.Goat) {
                    for (var toIndex in TigerAndGoatConnections.Instance.CommonEdges[position]) {
                        var to = TigerAndGoatConnections.Instance.CommonEdges[position][toIndex]
                        if (startingState.IsPositionEmpty(to)) {
                            var board = startingState.CloneForAI()
                            board.GamePieces[to] = GamePieceType.Goat
                            board.GamePieces[position] = GamePieceType.Empty
                            board.CurrentPlayer = GamePieceType.Tiger
                            neighbours.push([board, new TigerAndGoatMove(position, to, GamePieceType.Goat)])
                        }
                    }
                }
            }
        }

        return neighbours
    }

    GetNeighbourStatesForTiger(startingState: Board): [Board, TigerAndGoatMove][] {
        let neighbours: [Board, TigerAndGoatMove][] = []
        for (var from in startingState.GamePieces) {
            if (startingState.GamePieces[from] == GamePieceType.Tiger) {
                for (var toIndex in TigerAndGoatConnections.Instance.CommonEdges[from]) {
                    var to = TigerAndGoatConnections.Instance.CommonEdges[from][toIndex]
                    if (startingState.IsPositionEmpty(to)) {
                        var board = startingState.CloneForAI()
                        board.GamePieces[to] = GamePieceType.Tiger
                        board.GamePieces[from] = GamePieceType.Empty
                        board.TogglePlayer()
                        neighbours.push([board, new TigerAndGoatMove(from, to, GamePieceType.Tiger)])
                    }
                }

                for (var toIndex in TigerAndGoatConnections.Instance.TigerEdges[from]) {
                    var to = TigerAndGoatConnections.Instance.TigerEdges[from][toIndex]
                    if (!startingState.IsPositionEmpty(to)) {
                        continue
                    }

                    var middleLocation = TigerAndGoatConnections.Instance.GetMiddleLocation(from, to)
                    if (startingState.GamePieces[middleLocation] == GamePieceType.Goat) {
                        var board = startingState.CloneForAI()
                        board.GamePieces[to] = GamePieceType.Tiger
                        board.GamePieces[from] = GamePieceType.Empty
                        board.GamePieces[middleLocation] = GamePieceType.Empty
                        board.GoatsKilled = startingState.GoatsKilled + 1
                        board.TogglePlayer()
                        neighbours.push([board, new TigerAndGoatMove(from, to, GamePieceType.Tiger)])
                    }
                }
            }
        }

        return neighbours
    }

    IsMaximizingPlayer(startingState: AI.IBoard<GamePieceType>): boolean {
        return startingState.CurrentPlayer == GamePieceType.Tiger
    }

    MaxHeuristic(): AI.IHeuristic<TigerAndGoatHeuristic> {
        var result = new TigerAndGoatHeuristic()
        result.GoatsKilled = 6
        result.TigersStuck = 0
        result.GoatsInKillPosition = 6
        result.Depth = 10000
        return result
    }

    MinHeuristic(): AI.IHeuristic<TigerAndGoatHeuristic> {
        var result = new TigerAndGoatHeuristic()
        result.GoatsKilled = 0
        result.TigersStuck = 3
        result.GoatsInKillPosition = 0
        result.Depth = 10000
        return result
    }
}