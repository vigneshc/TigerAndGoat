import * as AI from './AIInterfaces'

export class RandomAI<THeuristicType, TMove, TPlayerType> implements AI.IGameAI<THeuristicType, TMove, TPlayerType>
{
    GetNextMove(startingState: AI.IBoard<TPlayerType>, navigator: AI.IBoardNavigator<THeuristicType, TMove, TPlayerType>): [AI.IBoard<TPlayerType>, TMove] {
        var neighbours = navigator.GetNeighbourStates(startingState)
        var choice = neighbours[Math.floor(Math.random() * neighbours.length)];
        return choice
    }
}