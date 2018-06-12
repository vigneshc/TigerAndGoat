import * as AI from './AIInterfaces'

export class AlphaBetaPruning<TBoard, THeuristicType, TMove, TPlayerType> implements AI.IGameAI<THeuristicType, TMove, TPlayerType>
{
    private navigationLimiter: AI.INavigationLimiter
    constructor(navigationLimiter: AI.INavigationLimiter) {
        this.navigationLimiter = navigationLimiter
    }

    GetNextMove(startingState: AI.IBoard<TPlayerType>, navigator: AI.IBoardNavigator<THeuristicType, TMove, TPlayerType>): [AI.IBoard<TPlayerType>, TMove] {
        var alpha = navigator.MinHeuristic()
        var beta = navigator.MaxHeuristic()
        return this.GetNextMoveImpl(startingState, navigator, this.navigationLimiter, alpha, beta)[0]
    }

    private GetNextMoveImpl(
        startingState: AI.IBoard<TPlayerType>,
        navigator: AI.IBoardNavigator<THeuristicType, TMove, TPlayerType>,
        depthLimiter: AI.INavigationLimiter,
        alpha: AI.IHeuristic<THeuristicType>,
        beta: AI.IHeuristic<THeuristicType>): [[AI.IBoard<TPlayerType>, TMove], AI.IHeuristic<THeuristicType>] {
        let result: [[AI.IBoard<TPlayerType>, TMove], AI.IHeuristic<THeuristicType>] = [[startingState, navigator.GetEmptyMove()], navigator.GetHeuristicValue(startingState)]
        if (depthLimiter.ShouldStop()) {
            return result
        }

        let children: [AI.IBoard<TPlayerType>, TMove][] = navigator.GetNeighbourStates(startingState)
        if (children.length == 0) {
            return result
        }

        var shuffled = this.getShuffledArray(children.length)
        let isBetterMoveFunc: (n: number) => boolean
        let alphaBetaUpdateFunc: (newH: AI.IHeuristic<THeuristicType>) => void
        let v: AI.IHeuristic<THeuristicType>

        if (navigator.IsMaximizingPlayer(startingState)) {
            v = navigator.MinHeuristic()
            isBetterMoveFunc = (n: number) => n > 0
            alphaBetaUpdateFunc = (newH: AI.IHeuristic<THeuristicType>) => alpha = AI.AIHelpers.GetMaxHeuristic(alpha, v)
        }
        else {
            v = navigator.MaxHeuristic()
            isBetterMoveFunc = (n: number) => n < 0
            alphaBetaUpdateFunc = (newH: AI.IHeuristic<THeuristicType>) => beta = AI.AIHelpers.GetMinHeuristic(beta, v)
        }

        for (var childIndex = 0; childIndex < children.length; childIndex++) {
            var child = children[shuffled[childIndex]]
            var childResult = this.GetNextMoveImpl(child[0], navigator, depthLimiter.Increment(), alpha, beta)
            var childHeuristic = childResult[1]
            var comparison = childHeuristic.Compare(v)
            if (isBetterMoveFunc(comparison) || (comparison == 0 && childHeuristic.Depth < v.Depth)) {
                v = childHeuristic
                result = [child, childHeuristic]
            }

            alphaBetaUpdateFunc(v)
            if (beta.Compare(alpha) <= 0) {
                break;
            }
        }

        return result
    }

    private getShuffledArray(n: number): Int16Array {
        let r = new Int16Array(n)
        for (var i = 0; i < n; i++) {
            r[i] = i
        }

        for (var i = 0; i < n; i++) {
            var target = this.randomInt(n - 1)
            var temp = r[i]
            r[i] = r[target]
            r[target] = temp
        }

        return r
    }

    private randomInt(n: number): number {
        return Math.floor(Math.random() * (n + 1))
    }
}