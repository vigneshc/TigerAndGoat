import * as React from 'react';
import { GameDisplay } from './TigerAndGoat/GameDisplay';
import { TigerAndGoatUx, TigerAndGoatUxProperties } from './TigerAndGoat/TigerAndGoatUx'
import { TigerAndGoatGeometry } from './TigerAndGoat/TigerAndGoatGeometry'

export class Home extends React.Component<{}, {}> {
    public render() {
        var lineMultipliers = [.8, 1, 1.2]
        var width = 600
        var height = 820
        return <GameDisplay
            key="board"
            Width={width}
            Height={height}
            FrameRatio={1.5}
            StrokeColor='rgb(0,0,0)'
            StrokeWidth={6}
            DisabledColor='Grey'
            Margin={35}
            TextPosition={TigerAndGoatGeometry.getTextPosition(width, height, lineMultipliers)}
            Coordinates={TigerAndGoatGeometry.getCoordinates(width, height, lineMultipliers)}
            LineCoordinates={TigerAndGoatGeometry.getLineCoordinates()}
        />
    }
}

