import React, { props } from 'react';
import { Link } from 'react-router-dom';

export default class ConnectWallet extends React.Component {
	constructor() {
		super(props)

	}

	render() {
		return (
			<React.Fragment>
				<div className="inner">
					<div className="overview-header">
						<div className="col-xs-6 col-sm-4 col-md-6 col-lg-6 logo">
							<h1><a href="index.html" title="SingularityNET"><img src="./img/singularity-logo.png" alt="SingularityNET" /></a></h1>
						</div>
					</div>
				</div>
				<div role="content">
					<div className="overview col-xs-12 col-sm-12 col-md-12 col-lg-12">
						<div className="container">
							<div className="step-guide">Step Guide</div>
							<div className="col-md-2 col-lg-2">&nbsp;</div>
							<div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
								<div className="step-guide-boxes">
									<div className="enable-disable"><img src="img/enable-tick.png" alt="" /></div>
									<div className="overview-box-title">Overview</div>
									<div className="install-link"><Link to="/SampleServices">Go to Services</Link></div>
								</div>
							</div>
							<div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
								<div className="step-guide-boxes">
									<div className="enable-disable"><img src="img/enable-tick.png" alt="" /></div>
									<div className="overview-box-title">Connect Wallet</div>
									<div className="install-link">Connect to Wallet</div>
								</div>
							</div>
							<div className="col-md-2 col-lg-2">&nbsp;</div>
							<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 mt-100">
								

								<div className="col-sm-12 col-md-12 col-lg-12 text-center"><div className="btn btn-primary">Metamask</div></div>
							</div>
							<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 connect-wallet-text"><p>This Dapp allows you to browse the list of SingularityNET Agents from the SingularityNET Registry. You need a Metamask wallet to invoke a service.Please follow the link above to install it.</p>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}