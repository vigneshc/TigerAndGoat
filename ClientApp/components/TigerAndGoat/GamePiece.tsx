import * as React from 'react';
import { GamePieceType } from './GameTypes'

interface GamePieceState {
    Selected: boolean,
    HoveredOver: boolean,
    PreviousState: GamePieceType,
    FilledIn: boolean,
    CurrentState: GamePieceType,
    Coordinates: [number, number],
    Margin: number,
    PointName: string,
    OnMouseOver(s: string): void
    OnMouseClick(s: string): void
}

/**
 * Logic for rendering a vertex.
 */
export class GamePiece extends React.Component<GamePieceState, {}>{

    constructor(props: GamePieceState) {
        super(props)
    }

    public render() {
        var opacity = 0
        var strokeWidth = 0
        if (this.props.HoveredOver) {
            opacity = .2
        }
        if (this.props.Selected) {
            strokeWidth = 2
        }
        var fillColor = "grey"
        if (this.props.FilledIn) {
            opacity = .25
            fillColor = "green"
        }

        return this.getCircle('grey', strokeWidth, fillColor, 35, opacity)
    }

    private getGamePieceGraphic(radius: number, length: number) {

        if ((this.props.CurrentState == undefined || this.props.CurrentState == GamePieceType.Empty)
            && (this.props.PreviousState == GamePieceType.Goat || this.props.PreviousState == GamePieceType.Tiger)) {
            return this.getImage(this.props.PreviousState, true, radius, length)
        }

        return this.getImage(this.props.CurrentState, false, radius, length)
    }

    private getImage(type: GamePieceType, emptied: boolean, radius: number, length: number) {
        var opacity = emptied ? 0.2 : 1
        if (type == GamePieceType.Tiger) {
            return <image
                xlinkHref="Tiger.png"
                x={this.props.Coordinates[0] - radius + this.props.Margin}
                y={this.props.Coordinates[1] - radius + this.props.Margin}
                width={length}
                height={length}
                opacity={opacity}
            />
        }
        else if (type == GamePieceType.Goat) {
            return <image
                xlinkHref="Goat.png"
                x={this.props.Coordinates[0] - radius + this.props.Margin}
                y={this.props.Coordinates[1] - radius + this.props.Margin}
                width={length}
                height={length}
                opacity={opacity}
            />
        }
        else {
            return null
        }
    }

    private getCircle(color: string, strokeWidth: number, fill: string, radius: number, fillOpacity: number) {

        return (

            <g>
                {this.getGamePieceGraphic(radius, radius * 1.75)}

                <circle
                    cx={this.props.Coordinates[0] + this.props.Margin}
                    cy={this.props.Coordinates[1] + this.props.Margin}
                    r={radius}
                    stroke={color}
                    fill={fill}
                    strokeWidth={strokeWidth}
                    fillOpacity={fillOpacity}
                    onMouseOver={() => this.props.OnMouseOver(this.props.PointName)}
                    onClick={() => this.props.OnMouseClick(this.props.PointName)} />
            </g>
        );
    }
}