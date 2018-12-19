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
					<div className="header">
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
							<div class="col-md-2 col-lg-2">&nbsp;</div>
							<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
								<div class="connect-wallet-title"><Link to="/connectwallet">Connect a Wallet</Link></div>

								<div class="col-sm-12 col-md-12 col-lg-12 text-center"><div class="btn btn-primary">Metamask</div></div>
							</div>
							<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 connect-wallet-text"><p>Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas pulvinar lorem sit amet quam conguefermentum. Mauris ut neque volutpat, lacinia tortor nec, sagittis velit.</p>

								<div class="connect-black-text">Aenean urna mauris, blandit quis sem ut, posuere posuere ligula. Ut et nibh sit amet lacus rutrum iaculis et auctor neque.In lacinia erat ac placerat tempor. Aenean ac diam vitae velit dictum feugiat. Etiam tempus accumsan nulla, et vehicula ipsumpulvinar in.</div>
								<div class="install-link"><a href="https://metamask.io/">Install Metamask</a></div>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}