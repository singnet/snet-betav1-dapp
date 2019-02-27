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
        <div className="row get-started-page">
          <div className="col-md-12">
            <span>Step 1:</span>
            <p>Once the transaction is completed you will receive AGI in your Ropsten Ethereum Wallet, and you can check it by visiting the Account Page, or on MetaMask by adding a custom token with the AGI contract information.</p>
            <img src="https://cdn-images-1.medium.com/max/800/0*yW_Z4OqMss1f32cL" alt="Step 1" />
          </div>
          <div className="col-md-12">
            <span>Step 2:</span>
            <p>Now you can make use of the MultiParty Escrow function by proceeding with a deposit. Input an amount of AGI and click “Deposit” — you will be prompted with a MetaMask window asking you to verify this transaction. This is a two-step confirmation process, so make sure to accept both pop-ups.</p>
            <img src="https://cdn-images-1.medium.com/max/800/0*GB-LstHvaIVoJrC4" alt="Step 2" />
            <img src="https://cdn-images-1.medium.com/max/800/0*yj-oFbqCpQYbaR44" alt="Step 2" />
          </div>
          <div className="col-md-12">
            <span>Step 3:</span>
            <p>You just made a deposit to the escrow contract, this is how your Account Page should look like. Click “Home” to get back to the list of services.</p>
            <img src="https://cdn-images-1.medium.com/max/800/0*PKHhaXor5mL6yv42" alt="Step 3" />
          </div>
          <div className="col-md-12">
            <span>Step 4:</span>
            <p>Now let’s try one of the services by clicking on “Details”.</p>
            <img src="https://cdn-images-1.medium.com/max/800/0*K4JXiVl_0_jetvj-" alt="Step 4" />
          </div>
          <div className="col-md-12">
            <span>Step 5:</span>
            <p>The “Current Price” or “Amount” is a value set by the service provider that translates to how much the service call will cost in AGI. The “Expiry Block Number” is the number of Ethereum blocks from which this transaction will be outdated and the remaining funds will come back to the sender’s address, and this threshold is also set by developers. In general, agents will only accept your request if the expiry block number is at least a full day ahead of the current block number. To start interacting with the service click “Start Job”.
            </p>
            <img src="https://cdn-images-1.medium.com/max/800/0*37P8Ld1oOK0TU3KB" alt="Step 5" />
          </div>
          <div className="col-md-12">
            <span>Step 6:</span>
            <p>At this point in the future, you will be able to edit the Expiry Block Number to a value you feel comfortable with. Proceed to the “INVOKE” section by clicking “Reserve Funds” and confirm the transaction through the MetaMask pop-up.</p>
            <img src="https://cdn-images-1.medium.com/max/800/0*l4dDuckaSF4mmeCW" alt="Step 6" />
          </div>
          <div className="col-md-12">
            <span>Step 7:</span>
            <p>The INVOKE section is defined by developers and it shows some fields you need to fill in order to interact with the service. In this case we are using the CNTK Image Recognition service, you should select the Service and Method names you want to use, and lastly, enter an image URL to be analyzed by the service. You can also click on “GUIDE”, “CODE” and “REFERENCE” to have more information about this service. Once you completed this form, click on “Invoke” and sign the transaction through MetaMask to get the results from the call.</p>
            <img src="https://cdn-images-1.medium.com/max/800/1*HVqED1wpLXDA3D-m0pZU2A.png" alt="Step 7" />
          </div>
          <div className="col-md-12">
            <span>Step 8:</span>
            <p>The RESULT section shows you the response and data from the AI service in JSON format. In this section, the user can also use their blockchain signature to make a vote on the service by using the thumbs up or down icons. The user can also change their vote.</p>
            <img src="https://cdn-images-1.medium.com/max/800/0*6QhZ5ZqIvdrQJkgI" alt="Step 8"/>
          </div>
          <div className="col-md-12">
            <span>Step 9:</span>
            <p>To check expired payment channels from which unused tokens can be claimed back, visit your Account Page.</p>
            <img src="https://cdn-images-1.medium.com/max/800/0*LxhF1sZvQQhPXnkX" alt="Step 9"/>
          </div>
        </div>
      </React.Fragment>
    )
  }
}