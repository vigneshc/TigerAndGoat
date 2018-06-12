export type Point = [number, number]
export type CoordinateMapType = { [index: string]: [number, number] }
export type EdgesType = { [index: string]: Array<string> }
export type GamePieceMapType = { [index: string]: GamePieceType }
export type MiddleLocationsMap = { [from: string]: { [to: string]: string } }
export enum GamePieceType {
    Empty,
    Tiger,
    Goat
}