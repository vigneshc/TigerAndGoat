import * as React from 'react';
import { Link, NavLink } from 'react-router-dom';

export interface NavMenuAction {
    Actions: { [action: string]: () => void }
    Help(): void
    HelpShown: boolean
    Title: string
}

export class NavMenu extends React.Component<NavMenuAction, {}> {
    constructor(props: NavMenuAction) {
        super(props)
    }

    private addActions() {
        var actionItems = []

        for (var action in this.props.Actions) {
            var val = this.props.Actions[action]
            actionItems.push(<li><a href="#" onClick={val}>{action}</a></li>)
        }

        return actionItems
    }

    private getHelpText() {
        return this.props.HelpShown ? "Hide Help" : "Help";
    }

    public render() {
        return <nav className="navbar navbar-default navbar-static-top">
            <div className='container'>
                <div className='navbar-header'>
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                    </button>


                </div>
                <div className="collapse navbar-collapse " id="bs-example-navbar-collapse-1">
                    <ul className="nav navbar-nav ">
                        {this.addActions()}
                        <li><a href="#" onClick={() => this.props.Help()}> {this.getHelpText()} </a> </li>
                    </ul>
                </div>
            </div>
        </nav>
    }
}
