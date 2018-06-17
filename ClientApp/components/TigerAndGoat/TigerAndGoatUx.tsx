import * as React from 'react';
import { Point, CoordinateMapType, GamePieceType } from './GameTypes';
import { Help } from '../Help'
import { GamePiece } from './GamePiece'
import { Board, BoardUpdater } from './GameBoard'

export interface TigerAndGoatUxProperties {
    Coordinates: CoordinateMapType
    TextPosition: [number, number]
    LineCoordinates: Array<[string, string]>
    Width: number
    Height: number
    Margin: number
    FrameRatio: number
    StrokeWidth: number
    StrokeColor: string
    DisabledColor: string
}

export interface TigerAndGoatBoardProps {
    UxProperties: TigerAndGoatUxProperties
    Board: Board
    OnMouseOver(s: string): void
    OnMouseClick(s: string): void
}

/**
 * Logic to render a tiger and goat game.
 */
export class TigerAndGoatUx extends React.Component<TigerAndGoatBoardProps, {}>{

    constructor(props: TigerAndGoatBoardProps) {
        super(props)
    }

    public render() {
        return this.props.Board.ShowHelp ? this.renderWithHelp(this.props.Board, this.props.OnMouseOver, this.props.OnMouseClick)
            : this.renderWithoutHelp(this.props.Board, this.props.OnMouseOver, this.props.OnMouseClick)
    }

    /**
     * Renders a game board.
     * @param state current state of the board.
     * @param onMouseOver function to call on mouse over on piece.
     * @param onClick function to call on mouse over on a piece.
     */
    private renderGameBoard(state: Board, onMouseOver: (point: string) => void, onClick: (point: string) => void) {
        return <svg viewBox={"-5 0 " + (this.props.UxProperties.Width * this.props.UxProperties.FrameRatio * .88) + " " + (this.props.UxProperties.Height * this.props.UxProperties.FrameRatio)}>
            {this.getSvgLines(state)}
            {this.getGamePieces(state, onMouseOver, onClick)}
            {this.getGameStats(state)}
        </svg>
    }

    private renderWithoutHelp(state: Board, onMouseOver: (point: string) => void, onClick: (point: string) => void) {
        return <div className="row">
            <div className="col-md-3 hidden-sm" />
            <div className="col-md-6">
                {this.renderGameBoard(state, onMouseOver, onClick)}
            </div>
            <div className="col-md-3 hidden-sm" />
        </div>
    }

    private renderWithHelp(state: Board, onMouseOver: (point: string) => void, onClick: (point: string) => void) {
        return <div className="row">
            <div className="col-md-6 col-md-push-6">
                <Help />
            </div>
            <div className="col-md-6 hidden-sm col-md-pull-6">
                {this.renderGameBoard(state, onMouseOver, onClick)}
            </div>
        </div>
    }

    private getGameStats(state: Board) {
        return <text x={this.props.UxProperties.TextPosition[0]} y={this.props.UxProperties.TextPosition[1]} fontSize={20}>
            <tspan x={this.props.UxProperties.TextPosition[0]} dy={30}> Goats placed    : {state.GoatsPlaced} </tspan>
            <tspan x={this.props.UxProperties.TextPosition[0]} dy={30}> Goats killed    : {state.GoatsKilled}</tspan>
            <tspan x={this.props.UxProperties.TextPosition[0]} dx={-5} dy={30}> Goats remaining : {state.MaxGoats - state.GoatsPlaced}</tspan>
            <tspan
                x={this.props.UxProperties.TextPosition[0]} dx={0} dy={30}
                fill={this.getBackGroundColor(state.CurrentPlayer)}
                fontSize={23}>
                Current Player:     {state.CurrentPlayer == GamePieceType.Tiger ? "Tiger" : "Goat"}
            </tspan>
            {this.getWinnerDisplay(state)}
        </text>
    }

    private getWinnerDisplay(state: Board) {
        var winner = state.Winner
        if (winner != GamePieceType.Empty) {
            return <tspan
                x={this.props.UxProperties.TextPosition[0]} dx={0} dy={30}
                fill={this.getBackGroundColor(state.CurrentPlayer)}
                fontSize={23} fontStyle="bold">
                Winner:     {winner == GamePieceType.Tiger ? "Tiger" : "Goat"}
            </tspan>
        }
        return null
    }


    private getBackGroundColor(player: GamePieceType) {
        return player == GamePieceType.Goat ? "#b28707" : "#e8e38b"
    }

    private getGamePieces(state: Board, onMouseOver: (point: string) => void, onClick: (point: string) => void) {
        let pieces: JSX.Element[] = []

        for (let key in this.props.UxProperties.Coordinates) {
            var point = this.props.UxProperties.Coordinates[key]
            pieces = pieces.concat(
                <GamePiece
                    Selected={state.Selection == key}
                    HoveredOver={state.Hovered == key}
                    CurrentState={state.GamePieces[key]}
                    Coordinates={this.props.UxProperties.Coordinates[key]}
                    Margin={this.props.UxProperties.Margin}
                    PointName={key}
                    OnMouseOver={onMouseOver}
                    OnMouseClick={onClick}
                    FilledIn={state.Filled.indexOf(key) != -1}
                    PreviousState={state.Emptied[key]}
                    key={key}
                />
            )
        }

        return pieces
    }

    private getSvgLines(board: Board) {
        var coordinates = this.props.UxProperties.Coordinates
        var line = 0
        return this.props.UxProperties.LineCoordinates.map(c =>
            <line
                x1={coordinates[c[0]][0] + this.props.UxProperties.Margin}
                y1={coordinates[c[0]][1] + this.props.UxProperties.Margin}
                x2={coordinates[c[1]][0] + this.props.UxProperties.Margin}
                y2={coordinates[c[1]][1] + this.props.UxProperties.Margin}
                strokeWidth={this.props.UxProperties.StrokeWidth} stroke={board.Winner == GamePieceType.Empty ? this.props.UxProperties.StrokeColor : this.props.UxProperties.DisabledColor}
                key={"line" + line++} />
        )
    }
}
