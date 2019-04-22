import React, { props } from 'react';
import SampleServices from './Services';
import Homepage from './ConnectWallet.js';
import BlockchainHelper from "./BlockchainHelper.js";

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
	palette:{
		primary:{main:"#4086ff"}
	}
});

export default class Landing extends React.Component {
	constructor() {
		super(props)
		this.network = new BlockchainHelper();
	}

	componentDidMount() {
		window.addEventListener('load', () => this.handleWindowLoad());
		this.handleWindowLoad();
	}

	handleWindowLoad() {
		this.network.initialize().then().catch(err => {
			console.error(err);
		})
	}

	render() {
		return (
			<MuiThemeProvider theme={theme}>
			<React.Fragment>
				{(typeof web3 !== 'undefined') ? <SampleServices /> : <Homepage />}
			</React.Fragment>
			</MuiThemeProvider>
		)
	}
}
