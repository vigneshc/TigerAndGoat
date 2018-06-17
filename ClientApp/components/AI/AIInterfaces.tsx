/**
 * Represents a heuristic, used for algorithms like MinMax.
 */
export interface IHeuristic<THeuristicType>{
    /**
     * Compares and returns 0 if equal, -1 if current heuristic is less and +1 if current heuristic is more
     * @param other Heuristic to compare to
     */
    Compare(other: IHeuristic<THeuristicType>): number

    /**
     * returns the dept of the current heuristic.
     */
    Depth: number
}

/**
 * Interface for navigating a board.
 * THeuristicType : Type of heuristic used. Heuristic is of type IHeuristic.
 * TMove : Type of the move returned by navigator.
 * TPlayerType : Type of players used in board navigator.
 */
export interface IBoardNavigator<THeuristicType, TMove, TPlayerType> {
    /**
     * Returns (neighbour states, move) from current state.
     * @param startingState State to start navigation from.
     */
    GetNeighbourStates(startingState: IBoard<TPlayerType>): [IBoard<TPlayerType>, TMove][]

    /**
     * Compute and return heuristic value of a state.
     * @param state is the state for which heuristic should be computed.
     */
    GetHeuristicValue(state:IBoard<TPlayerType>): IHeuristic<THeuristicType>

    /**
     * Returns true if given state is an end state.
     * @param state State for which IsEnd should be computed.
     * @param neighbourCount  number of neighbours from this state.
     */
    IsEndState(state: IBoard<TPlayerType>, neighbourCount: number): [boolean, TPlayerType]

    /**
     * Returns true if given player is maximizing player. Maximizing player is the player who tries to increase Heuristic of a state.
     * @param startingState board state.
     */
    IsMaximizingPlayer(startingState: IBoard<TPlayerType>): boolean

    /**
     * Returns the maximum heuristic used to initial next state & move computation.
     */
    MaxHeuristic(): IHeuristic<THeuristicType>

    /**
     * Returns the minimum heuristic used to initial next state & move computation.
     */
    MinHeuristic(): IHeuristic<THeuristicType>

    /**
     * Returns a dummy move.
     */
    GetEmptyMove(): TMove
}

/**
 * Represents a board game.
 */
export interface IBoard<TPlayerType>{
    CurrentPlayer: TPlayerType
}

/**
 * Represents a game AI algorithm like MinMax algorithm.
 */
export interface IGameAI<THeuristicType, TMove, TPlayerType>{
    /**
     * Returns next state from startingState using navigator.
     * @param startingState state from which next move should be computed.
     * @param navigator Navigatore used for finding neighbour states.
     */
    GetNextMove(startingState: IBoard<TPlayerType>, navigator: IBoardNavigator<THeuristicType, TMove, TPlayerType>): [IBoard<TPlayerType>, TMove] 
}

/**
 * Represents a navigation limiter used for limiting the depth or time of a tree search.
  */
export interface INavigationLimiter{
    GetDepthString(): string
    Increment(): INavigationLimiter
    ShouldStop(): boolean
}

/**
 * Depths based navigation limiter, limits after reaching maximum depth.
 */
export class DepthBasedLimiter implements INavigationLimiter{
    private depth:number
    private maxDepth: number

    constructor(depth: number, maxDepth: number){
        this.depth = depth
        this.maxDepth = maxDepth
    }

    GetDepthString(): string{
        return this.depth.toString()
    }

    Increment(): INavigationLimiter{
        return new DepthBasedLimiter(this.depth + 1, this.maxDepth)
    }

    ShouldStop(): boolean{
        return this.depth >= this.maxDepth
    }
}

export class AIHelpers{
    static GetMaxHeuristic<THeuristicType>(h1: IHeuristic<THeuristicType>, h2: IHeuristic<THeuristicType>): IHeuristic<THeuristicType>{
        return h1.Compare(h2) <= 0 ? h2: h1
    }

    static GetMinHeuristic<THeuristicType>(h1: IHeuristic<THeuristicType>, h2: IHeuristic<THeuristicType>): IHeuristic<THeuristicType>{
        return h1.Compare(h2) <= 0 ? h1: h2
    }
}