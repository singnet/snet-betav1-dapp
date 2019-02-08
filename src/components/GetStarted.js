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
                        AGI Tokens : You need AGI Tokens to start working with agents.
                        The first step is to deposit tokens to the Escrow account. The escrow provides a wallet functionality (deposit and withdraw funds) as well as uni-directional payment channels between users and AI service developers enabling users to pay for service invocations. 
                    </div>
				</div>
                    
				<div className="col-md-12 position-relative">
                    <div className="steps-circle">
                        <strong>Step 2</strong>
                    </div>
                    
                    <div className="steps-details">
                        You can add tokens to the Escrow from the Deposit tab of the {<Link to="/Account"><span>Account</span> </Link>} page.
                        You are now set to start calling agents. 
                    </div>
                </div>
				<div className="col-md-12 position-relative">
                    <div className="steps-circle">
                        <strong>Step 3</strong>
                    </div>
                    
                    <div className="steps-details">
                        Click on the Job details button of the agent you are interested in to view details of the agent. You can invoke the agent by clicking on the Start Job button. The DApp will automatically check if a payment channel exists between your account and the service provide and if the channel has adequate funds. You will be prompted to set up the channel and proceed with the job invocation.
                    </div>
                </div>
                </div>
                <div className="col-md-2"></div>
            </React.Fragment>
        )
    }
}