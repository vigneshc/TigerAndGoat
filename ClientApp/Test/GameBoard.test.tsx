/// <reference types="jest" />
import { Board, BoardUpdater } from '../components/TigerAndGoat/Gameboard'
import { TigerAndGoatConnections } from '../components/TigerAndGoat/Connections'
import { Point, CoordinateMapType, EdgesType, GamePieceMapType, GamePieceType } from '../components/TigerAndGoat/GameTypes';

test("CanMoveTigerWithKill", () => {
    var connections = TigerAndGoatConnections.Instance

    for (var tigerEdgeFrom in TigerAndGoatConnections.Instance.TigerEdges) {
        for (var tigerEdgeTo in TigerAndGoatConnections.Instance.TigerEdges[tigerEdgeFrom]) {
            var tigerEdge = [tigerEdgeFrom, TigerAndGoatConnections.Instance.TigerEdges[tigerEdgeFrom][tigerEdgeTo]]
            var board = new Board(GamePieceType.Goat)
            for (var pos in connections.Coordinates) {
                board.GamePieces[pos] = GamePieceType.Empty
            }

            board.CurrentPlayer = GamePieceType.Tiger
            board.GamePieces[tigerEdge[0]] = GamePieceType.Tiger
            board.GamePieces[tigerEdge[1]] = GamePieceType.Empty
            board.Selection = tigerEdge[0]
            var to = tigerEdge[1]
            var middle = TigerAndGoatConnections.Instance.GetMiddleLocation(tigerEdge[0], tigerEdge[1])
            board.GamePieces[middle] = GamePieceType.Goat
            var canMoveTiger = BoardUpdater.CanMoveTigerWithKill(board, tigerEdge[1])

            expect(canMoveTiger)
                .toBe(true)

            board = BoardUpdater.MoveTigerWithKill(board, tigerEdge[1])

            expect(BoardUpdater.CanMoveTigerWithKill(board, tigerEdge[0]))
                .toBe(false)
        }
    }
}
)

