/**
 * Represents a point in a grid.
 */
export type Point = [number, number]

/**
 * Map from vertex identifier to Point.
 */
export type CoordinateMapType = { [index: string]: [number, number] }

/**
 * Used for defining edges from a vertex.
 */
export type EdgesType = { [index: string]: Array<string> }

/**
 * Map from vertex name to type of the game piece in that vertex.
 */
export type GamePieceMapType = { [index: string]: GamePieceType }

/**
 * Map from vertex to MapOf (destination, middle location)
 */
export type MiddleLocationsMap = { [from: string]: { [to: string]: string } }

/**
 * Type of game pieces for tiger and goat game.
 */
export enum GamePieceType {
    Empty,
    Tiger,
    Goat
}