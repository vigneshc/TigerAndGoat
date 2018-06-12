export interface IHeuristic<THeuristicType>{
    Compare(other: IHeuristic<THeuristicType>): number
    Depth: number
}

export interface IBoardNavigator<THeuristicType, TMove, TPlayerType> {
    GetNeighbourStates(startingState: IBoard<TPlayerType>): [IBoard<TPlayerType>, TMove][]
    GetHeuristicValue(state:IBoard<TPlayerType>): IHeuristic<THeuristicType>
    IsEndState(state: IBoard<TPlayerType>, neighbourCount: number): [boolean, TPlayerType]
    IsMaximizingPlayer(startingState: IBoard<TPlayerType>): boolean
    MaxHeuristic(): IHeuristic<THeuristicType>
    MinHeuristic(): IHeuristic<THeuristicType>
    GetEmptyMove(): TMove
}

export interface IBoard<TPlayerType>{
    CurrentPlayer: TPlayerType
}

export interface IGameAI<THeuristicType, TMove, TPlayerType>{
    GetNextMove(startingState: IBoard<TPlayerType>, navigator: IBoardNavigator<THeuristicType, TMove, TPlayerType>): [IBoard<TPlayerType>, TMove] 
}

export interface INavigationLimiter{
    GetDepthString(): string
    Increment(): INavigationLimiter
    ShouldStop(): boolean
}

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