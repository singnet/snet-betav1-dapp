import React, { props } from 'react';
import SampleServices from './Services';
import Eth from 'ethjs';
import Homepage from './ProviderSelection.js';

export default class Landing extends React.Component {

	constructor() {
		super(props)
		this.watchWalletTimer = undefined;
		this.eth = undefined;
		this.state = {
			account: '',
		}
	}

	componentWillMount() {
		window.addEventListener('load', () => this.handleWindowLoad());
	}

	async handleWindowLoad() {
		if (typeof window.ethereum !== 'undefined') {
			try {
				window.web3 = new Web3(ethereum);
				await window.ethereum.enable();
				this.initialize();
			} catch (error) {
				console.log("User denied access to Metamask");
			}
		} else if (typeof window.web3 !== 'undefined') {
			this.initialize();
		}
	}

	initialize() {
		this.web3 = window.web3;
		this.eth = new Eth(window.web3.currentProvider);
		window.ethjs = this.eth;
		this.watchWalletTimer = setInterval(() => this.watchWallet(), 500);
		//this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
	}

	componentWillUnmount() {
		if (this.watchWalletTimer) {
			clearInterval(this.watchWalletTimer);
		}
	}

	watchWallet() {
		this.eth.accounts().then(accounts => {
			if (accounts.length === 0) {
				console.log('wallet is locked');
				this.setState({ account: undefined });
				return;
			} else if (accounts[0] !== this.state.account) {
				web3.eth.defaultAccount = accounts[0];
				console.log('account: ' + accounts[0] + ' unlocked');
				this.setState({ account: accounts[0] });
			}

			this.eth.getBalance(accounts[0]).then(response => {
				let balance = Number(response.toString());
				if (balance !== this.state.ethBalance) {
					console.log('account eth balance is: ' + Eth.fromWei(balance, 'ether'));
					this.setState({ ethBalance: balance });
				}
			})
		}).catch(err => { console.log(err) });
	}

	render() {
		return (
			<React.Fragment>
				{(typeof web3 !== 'undefined') ? <SampleServices /> : <Homepage />}
			</React.Fragment>
		)
	}
}
