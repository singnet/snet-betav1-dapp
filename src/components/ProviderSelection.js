import React, { props } from 'react';
import { Link } from 'react-router-dom';
import YouTube from 'react-youtube';

export default class ProviderSelection extends React.Component {
	constructor() {
		super(props)
	}
	render() {
		const opts = {
			height: '286',
			width: '640',
			playerVars: {
				autoplay: 0
			}
		};
		return (

			<React.Fragment>
				<div className="inner">
					<div className="header">
						<div className="col-xs-6 col-sm-4 col-md-6 col-lg-6 logo">
							<h1><img src="./img/singularity-logo.png" alt="SingularityNET" /></h1>
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
									<Link to="/SampleServices">View Services</Link>
								</div>
							</div>
							<div className="col-xs-12 col-sm-6 col-md-4 col-lg-4">
								<div className="step-guide-boxes">
									<div className="enable-disable"><img src="img/disable-tick.png" alt="" /></div>
									<div className="overview-box-title">Connect Wallet</div>
									<Link to="/connectwallet">Connect to Wallet</Link>
								</div>
							</div>
							<div className="col-md-2 col-lg-2">&nbsp;</div>
							<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
								<div className="welcome-to" >Welcome to Singularitynet</div>
								<div className="col-sm-12 col-md-12 col-lg-12 video" >

									<YouTube videoId="RvXoZ9qAo-o" opts={opts} />
								</div>
							</div>
							<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 overview-text"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean in lacus bibendum mi rutrum dignissim a sit amet velit. Fusce in risus id orcieuismod consectetur eu quis purus.</p>
								<Link to="/SampleServices"><div className="btn btn-secondary">LET'S GET STARTED</div></Link>
							</div>
						</div>
					</div>
				</div>
			</React.Fragment>
		)
	}
}