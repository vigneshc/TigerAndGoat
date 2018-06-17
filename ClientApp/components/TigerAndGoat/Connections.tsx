import { Point, CoordinateMapType, EdgesType, GamePieceMapType, GamePieceType, MiddleLocationsMap } from './GameTypes';

/**
 * Game movement rules and traversal logic for tiger and goat game.
 * Rows are numbered 1 to 5.
 * Columns are numbered A to E.
 * Every row has differing number of columns. 
 * Additional details about rules here: https://en.wikipedia.org/wiki/Lambs_and_Tigers 
 */
export class TigerAndGoatConnections {
    public static Instance: TigerAndGoatConnections = new TigerAndGoatConnections()
    /**
     * All coordinate names in the board.
     */
    Coordinates: string[]

    /**
     * Edges that are common for both tiger and goat.
     */
    CommonEdges: EdgesType

    /**
     * Edges that can only be traversed by tiger.
     */
    TigerEdges: EdgesType

    /**
     * Map giving location of middle vertex for tiger moves.
     */
    MiddleLocations: MiddleLocationsMap

    constructor() {
        this.CommonEdges = this.getCommonEdges()
        this.TigerEdges = this.getTigerEdges()
        this.Coordinates = []

        for (var k in this.CommonEdges) {
            this.Coordinates.push(k)
        }

        this.MiddleLocations = {}

        // pre-compute middle locations for tiger moves.
        for (var from in this.TigerEdges) {
            for (var toIndex in this.TigerEdges[from]) {
                var to = this.TigerEdges[from][toIndex]
                if (!(from in this.MiddleLocations)) {
                    this.MiddleLocations[from] = {}
                }

                this.MiddleLocations[from][to] = this.ComputeMiddleLocation(from, to)
            }
        }
    }

    public GetMiddleLocation(from: string, to: string) {
        return this.MiddleLocations[from][to]
    }

    private ComputeMiddleLocation(from: string, to: string) {
        if (from[0] == '1' || to[0] == '1') {
            var origin = from[0] == '1' ? from : to;
            var other = from[0] != '1' ? from : to;
            var middle = String.fromCharCode(other[0].charCodeAt(0) - 1) + other[1]
            return middle
        }

        if ((from[0] == '5' || to[0] == '5') && from[0] != to[0]) {
            var lastLine = from[0] == '5' ? from : to;
            var other = from[0] != '5' ? from : to;
            var middle = String.fromCharCode(other[0].charCodeAt(0) + 1) + other[1]
            return middle
        }

        if (from[0] == to[0]) {
            var minPosition = from.charCodeAt(1) < to.charCodeAt(1) ? from : to
            return minPosition[0] + String.fromCharCode(minPosition.charCodeAt(1) + 1)
        }
        else {
            var minPosition = from.charCodeAt(0) < to.charCodeAt(0) ? from : to
            return String.fromCharCode(minPosition.charCodeAt(0) + 1) + minPosition[1]
        }
    }

    private getTigerEdges() {
        let edges: EdgesType = {
            '1A': ['3B', '3C', '3D', '3E'],
            '2A': ['2C', '4A'],
            '2B': ['2D', '4B'],
            '2C': ['2E', '4C'],
            '2D': ['4D', '2F'],
            '2E': ['4E'],
            '2F': ['4F'],
            '3A': ['3C'],
            '3B': ['3D', '5A'],
            '3C': ['3E', '5B'],
            '3D': ['3F', '5C'],
            '3E': ['5D'],
            '4A': ['4C'],
            '4B': ['4D'],
            '4C': ['4E'],
            '4D': ['4F'],
            '5A': ['5C'],
            '5B': ['5D'],
        }

        return this.addReverseEdges(edges)
    }

    private getCommonEdges() {
        let edges: EdgesType = {
            '1A': ['2B', '2C', '2D', '2E'],
            '2A': ['2B', '3A'],
            '2B': ['2C', '3B'],
            '2C': ['2D', '3C'],
            '2D': ['2E', '3D'],
            '2E': ['2F', '3E'],
            '2F': ['3F'],
            '3A': ['3B', '4A'],
            '3B': ['3C', '4B'],
            '3C': ['3D', '4C'],
            '3D': ['3E', '4D'],
            '3E': ['3F', '4E'],
            '3F': ['4F'],
            '4A': ['4B'],
            '4B': ['4C', '5A'],
            '4C': ['4D', '5B'],
            '4D': ['4E', '5C'],
            '4E': ['4F', '5D'],
            '5A': ['5B'],
            '5B': ['5C'],
            '5C': ['5D']
        }

        return this.addReverseEdges(edges)
    }

    /**
     * Tiger and goat is an undirected graph. This method adds all the reverse edges given a set of edges.
     * @param edges set of edges.
     */
    private addReverseEdges(edges: EdgesType) {
        let reverseEdge: EdgesType = {}
        for (let key in edges) {
            for (var index = 0; index < edges[key].length; index++) {
                var toEdge = edges[key][index]
                if (reverseEdge[toEdge] == undefined) {
                    reverseEdge[toEdge] = []
                }

                reverseEdge[toEdge] = reverseEdge[toEdge].concat(key)
            }
        }

        for (let key in reverseEdge) {
            if (edges[key] == undefined) {
                edges[key] = []
            }

            edges[key] = edges[key].concat(reverseEdge[key])
        }

        return edges
    }
}