import Eth from 'ethjs';
import RegistryNetworks from 'singularitynet-platform-contracts/networks/Registry.json';
import RegistryAbi from 'singularitynet-platform-contracts/abi/Registry.json'
import AGITokenNetworks from 'singularitynet-token-contracts/networks/SingularityNetToken.json';
import AGITokenAbi from 'singularitynet-token-contracts/abi/SingularityNetToken.json';
import MPEAbi from 'singularitynet-platform-contracts/abi/MultiPartyEscrow.json';
import MPENetworks from 'singularitynet-platform-contracts/networks/MultiPartyEscrow.json';
import { AGI } from '../util';
import { NETWORKS } from '../networks'
import SnetWeb3 from 'web3';


export default class BlockchainHelper {

    constructor() {
        this.eth = undefined;
        this.web3 = undefined;
        this.chainId = undefined;
        this.defaultAccount = undefined;
    }

    async initialize() {
        var web3Initiatized = false;
        if (typeof window.ethereum !== 'undefined') {
            try {
                window.web3 = new SnetWeb3(ethereum);
                await window.ethereum.enable();
                this.initializeState();
                web3Initiatized = true;
            } catch (error) {
                console.log("User denied access to Metamask");
            }
        } else if (typeof window.web3 !== 'undefined') {
            this.initializeState();
            web3Initiatized = true;
        }
        return web3Initiatized;
    }

    initializeState() {
        this.web3 = window.web3;
        this.eth = new Eth(window.web3.currentProvider);
        window.ethjs = this.eth; //TODO - NETWORK CHANGE
    }

    async waitForTransaction(hash) {
        let receipt;
        while (!receipt) {
          receipt = await window.ethjs.getTransactionReceipt(hash);
        }

        if (receipt.status === "0x0") {
          throw receipt
        }
    
        return receipt;
      }

    getAccount(callBack) {
        if (typeof this.eth === 'undefined') {
            callBack(undefined);
        }

        this.eth.accounts().then(accounts => {
            if (accounts.length === 0) {
                this.defaultAccount = undefined
                callBack(undefined);
            } else {
                if (typeof accounts[0] !== 'undefined' && this.defaultAccount !== accounts[0]) {
                    this.defaultAccount = accounts[0];
                    web3.eth.defaultAccount = accounts[0]; //TODO - NETWORK CHANGE
                    callBack(accounts[0]);
                }
            }
        }).catch(err => { 
            console.log(err)
            callBack(undefined);
        });
    }

    getAGIBalance(chainId, address, callBack) {
        if (typeof this.eth === 'undefined') {
            return callBack(undefined);;
        }

        var tokenInstance = this.getTokenInstance(chainId);
        if(typeof tokenInstance !== 'undefined') { 
            tokenInstance.balanceOf(address, (err, balance) => {
                callBack(AGI.inAGI(balance));
            });
        }
        return callBack(undefined);
    }

    getEThBalance(callBack) {
        if (typeof this.eth === 'undefined') {
            return callBack(undefined);;
        }

        var balance = undefined;
        this.eth.accounts().then(accounts => {
            this.eth.getBalance(accounts[0]).then(response => {
                balance = Number(response.toString());
                console.log("Balance is " + balance);
                callBack(balance);
            }).catch(err => { console.log(err) });
        });
        return callBack(undefined);
    }

    getCurrentBlockNumber(callBack) {
        if (typeof this.eth === 'undefined') {
            callBack(undefined);
        }
        
        web3.eth.getBlockNumber((error, result) => {
            if(error) {
                console.log("Error reading blocknumber " + error)
            } 
            else {
                callBack(result);
            }
        });
    }

    getChainID(callBack) {
        if (typeof this.eth === 'undefined') {
            callBack(undefined);
        }

        this.eth.net_version().then(chainId => {
            if (typeof chainId !== "undefined" && this.chainId !== chainId) {
                if (typeof NETWORKS[chainId] !== "undefined" && typeof NETWORKS[chainId].name !== "undefined") {
                    this.chainId = chainId;
                } else {
                    this.chainId = undefined;
                }
                callBack(this.chainId);
            }
        }).catch(err => {
            console.log(err);
            callBack(undefined);
        });
    }

    getEtherScanAddressURL(chainId, address) {
        return (chainId in NETWORKS ? NETWORKS[chainId]['etherscan'] +"/address/" + address : undefined);
    }

    getRegistryInstance(chainId) {
        if (chainId in RegistryNetworks) {
            contract = web3.eth.contract(RegistryAbi)
            return contract.at(RegistryNetworks[chainId].address);
        }
    }

    getMPEAddress(chainId) {
        return (chainId in MPENetworks) ? MPENetworks[chainId].address : undefined;
    }

    getMPEInstance(chainId) {
        if (chainId in MPENetworks) {
            let contract = web3.eth.contract(MPEAbi)
            return contract.at(MPENetworks[chainId].address);
        }
        return undefined;
    }

    getTokenAddress(chainId) {
        return (chainId in AGITokenNetworks) ? AGITokenNetworks[chainId].address : undefined;
    }
    
    getTokenInstance(chainId) {
        if (chainId in AGITokenNetworks) {
            let contract = web3.eth.contract(AGITokenAbi);
            return contract.at(AGITokenNetworks[chainId].address);
        }
        return undefined;
    }

    getDefaultNetwork() {
        for (var chain in NETWORKS){
            if('default' in NETWORKS[chain] && NETWORKS[chain]['default'] === true) {
                return chain;
            }
        }
        return undefined;
    }    
}
