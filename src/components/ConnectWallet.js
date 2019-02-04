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
					<span className="gradientnav"/>
					<div id="roadmap-row" data-midnight="light" data-bg-mobile-hidden="" className="wpb_row vc_row-fluid vc_row full-width-section standard_section" style={{visibility: "visible"}} data-top-percent="4%" data-bottom-percent="4%">
						<div className="header">
							<div className="col-xs-6 col-sm-4 col-md-6 col-lg-6 logo">
								<h1><a href="/SampleServices" title="SingularityNET"><span className="icon-logo"></span></a></h1>
							</div>
						</div>
						<main role="content">
						<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
								<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
									<div className="welcome-to">Welcome to SingularityNET</div>
								</div>
								<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 overview-text">SingularityNET is an open and decentralized network of AI services made accessible through blockchain. <br/>AI developers publish their services onto the SingularityNET network where they can be used by anyone with <br/>an internet connection. This Dapp is a front-end for exploring available AI services and interacting with them <br/>through a web-UI<br/><br/>
								<Link to="/SampleServices"><button className="let-get-started-btn">View Services</button></Link>
								</div>
								<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
								<div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 overview-text">
									This Dapp allows you to browse the list of SingularityNET Agents from the SingularityNET Registry. You need a Metamask wallet to invoke a service.<br/><br/>
									<a target="_blank" href="https://metamask.io/"><button className="let-get-started-btn">Install Metamask</button></a>
								</div>
								</div>
						</div>
						</main>
					</div>
				</div>
			</React.Fragment>
		)
	}
}