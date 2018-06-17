import { Point, CoordinateMapType, GamePieceType } from './GameTypes';
import { Help } from '../Help'
import { GamePiece } from './GamePiece'
import { Board, BoardUpdater } from './GameBoard'

/**
 * Logic for computing co-ordinates for tiger and goat game.
 */
export class TigerAndGoatGeometry {

    public static getTextPosition(width: number, height: number, lineMultipliers: Array<number>): [number, number] {
        return [width * lineMultipliers[lineMultipliers.length - 2] * 2.5 / 3, 10]
    }

    public static getCoordinates(width: number, height: number, lineMultipliers: Array<number>) {
        var base = width / 2
        var diag = Math.sqrt(Math.pow(base, 2) + Math.pow(height, 2))
        var line3Width = width * lineMultipliers[lineMultipliers.length - 1]
        var unitHeight = height / 6

        let coordinates: CoordinateMapType = {
            '1A': [line3Width / 2, 0],
            '5A': [(line3Width - width) / 2, height],
            '5B': [(line3Width - width) / 2 + width / 3, height],
            '5C': [(line3Width - width) / 2 + 2 * width / 3, height],
            '5D': [(line3Width - width) / 2 + width, height]
        }

        for (var lineNumber = 2; lineNumber < 2 + lineMultipliers.length; lineNumber++) {
            var lineCoOrdinates = this.getHline(
                unitHeight * 2.5 + unitHeight * (lineNumber - 2),
                width,
                lineMultipliers[lineNumber - 2],
                lineMultipliers[lineMultipliers.length - 1],
                lineNumber,
                coordinates)
            coordinates = GeometryUtils.mergeCoordinateMaps(
                coordinates,
                lineCoOrdinates
            )
        }

        return coordinates
    }

    public static getLineCoordinates() {
        let connections: Array<[string, string]> = [
            ['1A', '5A'],
            ['1A', '5B'],
            ['1A', '5C'],
            ['1A', '5D'],
            ['5A', '5D'],
            ['2A', '2F'],
            ['3A', '3F'],
            ['4A', '4F'],
            ['2A', '4A'],
            ['2F', '4F'],
        ]

        return connections
    }

    private static getHline(
        y: number,
        width: number,
        widthMultiplier: number,
        maxWidthMultiplier: number,
        lineNumber: number,
        verticalCoOrds: CoordinateMapType) {
        var lineWidth = width * widthMultiplier
        var maxWidth = width * maxWidthMultiplier
        var middleSegmentLength = lineWidth / 3
        let coOrds: CoordinateMapType = {}

        coOrds[lineNumber + 'A'] = [(maxWidth - lineWidth) / 2, y]
        coOrds[lineNumber + 'F'] = [(maxWidth - lineWidth) / 2 + lineWidth, y]

        var points = ['A', 'B', 'C', 'D', 'E']
        for (var i = 1; i < points.length; i++) {
            var verticalLineParams = GeometryUtils.getLineEquation(verticalCoOrds['1A'], verticalCoOrds['5' + points[i - 1]])
            var m = verticalLineParams[0]
            var b = verticalLineParams[1]
            coOrds[lineNumber + points[i]] = [(y - b) / m, y]
        }

        return coOrds
    }
}

class GeometryUtils {
    public static getLineEquation(p1: Point, p2: Point) {
        var x1 = p1[0]
        var y1 = p1[1]

        var x2 = p2[0]
        var y2 = p2[1]

        var m = (y2 - y1) / (x2 - x1)
        var b = y2 - m * x2
        return [m, b]
    }

    public static mergeCoordinateMaps(d1: CoordinateMapType, d2: CoordinateMapType) {
        let r: CoordinateMapType = {}
        for (let key in d1) {
            r[key] = d1[key]
        }
        for (let key in d2) {
            r[key] = d2[key]
        }

        return r
    }
}