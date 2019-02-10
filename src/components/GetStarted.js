import React, { props } from 'react';
import {Link} from 'react-router-dom';
import Header from "./Header.js";

export default class GetStarted extends React.Component {
    constructor() {
        super(props)
    }
    render() {
        return (
            <React.Fragment>
                <Header searchTerm="" chainId={undefined}/>
                <div className="col-md-2"></div>
                <div className="col-md-8">
                <div className="col-md-12 position-relative">
                    <div className="steps-circle">
                        <strong>Step 1</strong>
                    </div>
                    
                    <div className="steps-details">
                    Ethereum testnet coins are free and used to test the platform. You will need ether to cover the Gas costs associated with transactions within the platform. 
                    You can get the tokens for Ropsten from <a href="https://faucet.ropsten.be/">here</a> and for Kovan from <a href="https://faucet.kovan.network/">here</a>.
                    In order to receive these tokens, the user must log in into the Faucet with their GitHub account. 
                    </div>
                </div>
                    
                <div className="col-md-12 position-relative">
                    <div className="steps-circle">
                        <strong>Step 2</strong>
                    </div>
                    
                    <div className="steps-details">
                    In order to have AGI to test the platform, users are required to visit the AGI Faucet <a href="https://faucet.singularitynet.io/">here</a>, which is a per-request Kovan/Ropsten AGI distribution hub. 
                    In order to receive these tokens, the user must log in into the AGI Faucet with their GitHub account.
                    </div>
                </div>
                <div className="col-md-12 position-relative">
                    <div className="steps-circle">
                        <strong>Step 3</strong>
                    </div>
                    
                    <div className="steps-details">
                    You can add the AGI tokens to the Escrow from the Deposit tab of the {<Link to="/Account"><span>Account</span> </Link>} page. You are now set to start invoking services. 
                    </div>
                </div>

                <div className="col-md-12 position-relative">
                    <div className="steps-circle">
                        <strong>Step 4</strong>
                    </div>
                    
                    <div className="steps-details">
                        Click on the Job details button of the agent you are interested in to view details of the agent. You can invoke the agent by clicking on the Start Job button. The DApp will attempt to reuse any existing payment channel and if none exist it will create one. Its a good idea to create a channel with enough tokens to cover the number of times you invoke the service. This will optimize your gas costs while invoking services.
                    </div>
                </div>
                </div>
                <div className="col-md-2"></div>
            </React.Fragment>
        )
    }
}