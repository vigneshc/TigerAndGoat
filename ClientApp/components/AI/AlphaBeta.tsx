import * as AI from './AIInterfaces'

/**
 * Alpha beta pruning: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
 */
export class AlphaBetaPruning<TBoard, THeuristicType, TMove, TPlayerType> implements AI.IGameAI<THeuristicType, TMove, TPlayerType>
{
    private navigationLimiter: AI.INavigationLimiter

    /**
     * 
     * @param navigationLimiter used to limit the tree search.
     */
    constructor(navigationLimiter: AI.INavigationLimiter) {
        this.navigationLimiter = navigationLimiter
    }

    GetNextMove(startingState: AI.IBoard<TPlayerType>, navigator: AI.IBoardNavigator<THeuristicType, TMove, TPlayerType>): [AI.IBoard<TPlayerType>, TMove] {
        var alpha = navigator.MinHeuristic()
        var beta = navigator.MaxHeuristic()
        return this.GetNextMoveImpl(startingState, navigator, this.navigationLimiter, alpha, beta)[0]
    }

    /**
     * Returns the next best state from current state and correspondng move.
     * @param startingState state to start the search from.
     * @param navigator used to find neighbouring states.
     * @param depthLimiter used to limit the search based on either time or other factors.
     * @param alpha current MinMax alpha.
     * @param beta  current MinMax beta.
     */
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

        // find neighbour states from current state.
        let children: [AI.IBoard<TPlayerType>, TMove][] = navigator.GetNeighbourStates(startingState)
        if (children.length == 0) {
            return result
        }

        // shuffle for randomization among states with equal heuristic values.
        var shuffled = this.getShuffledArray(children.length)

        let isBetterMoveFunc: (n: number) => boolean
        let alphaBetaUpdateFunc: (newH: AI.IHeuristic<THeuristicType>) => void
        let v: AI.IHeuristic<THeuristicType>

        // set isBetterMove and alphaBeta func update functions based on player type.
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

        // enumerate children and find the best neighbouring move.
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