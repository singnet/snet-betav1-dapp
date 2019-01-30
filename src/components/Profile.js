import React, { Component } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AGI,ERROR_UTILS,DEFAULT_GAS_PRICE, getMarketplaceURL, isSupportedNetwork } from '../util';
import { Requests } from '../requests'
import App from "../App.js";
import Tooltip from '@material-ui/core/Tooltip';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import BlockchainHelper from "./BlockchainHelper.js"
import {ProfileTabContainer} from './ReactStyles.js';
import DAppModal from './DAppModal.js'

export class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: 0,
    }

    this.network = new BlockchainHelper();
    this.state = {
      agiBalance: 0,
      escrowaccountbalance: 0,
      allowedtokenbalance:[],
      value: 0, //WHAT IS THIS FOR??
      depositAmount: 0,
      withdrawalAmount: 0,
      userprofile: [],
      userAddress: '',
      account: '',
      extamount: 0,
      extexp: 0,
      openchaining: false,
      chainId: undefined,
      contractMessage: '',
      channelExtendMessage:'',
      supportedNetwork: false
    }

    this.watchWalletTimer = undefined;
    this.watchNetworkTimer = undefined;
    this.handleAuthorize = this.handleAuthorize.bind(this)
    this.handlewithdraw = this.handlewithdraw.bind(this)
    this.handleAmountChange = this.handleAmountChange.bind(this)
    this.onKeyPressvalidator = this.onKeyPressvalidator.bind(this)
    this.handleChannelExtendAddFunds = this.handleChannelExtendAddFunds.bind(this)
    this.Expirationchange = this.Expirationchange.bind(this)
    this.extamountchange = this.extamountchange.bind(this)
    this.onOpenchaining = this.onOpenchaining.bind(this)
    this.onClosechaining = this.onClosechaining.bind(this)
    this.handleExpansion = this.handleExpansion.bind(this)
  }

  componentDidMount() {
    window.addEventListener('load', () => this.handleWindowLoad());
    this.handleWindowLoad();
  }

  componentWillUnmount() {
    if (this.watchWalletTimer) {
      console.log("Clearing wallet timer")
      clearInterval(this.watchWalletTimer);
    }

    if (this.watchNetworkTimer) {
      console.log("Clearing network timer")
      clearInterval(this.watchNetworkTimer);
    }
  }

  handleWindowLoad() {
    this.network.initialize().then(isInitialized => {
      if (isInitialized) {
        console.log("Initializing timers")
        this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
        this.watchWalletTimer = setInterval(() => this.watchWallet(), 500);
      }
    }).catch(err => {
      console.error(err);
    })
  }

  watchNetwork() {
    this.network.getChainID((chainId) => {
      if (chainId !== this.state.chainId) {
        this.setState({ chainId: chainId });
        this.loadDetails(chainId);
      }
    });
  }

  watchWallet() {
    this.network.getAccount((account) => {
      if (account !== this.state.account) {
        console.log("Account changed from " + account +" to " + this.state.account)
        this.setState({account:account})
        this.loadAGIBalances(this.state.chainId)
      }
    });
  }

  loadAGIBalances(chainId) {
    if (typeof web3 === 'undefined' || !this.state.supportedNetwork) {
      return;
    }

    console.log("Loading AGI Balance for " + web3.eth.defaultAccount)
    let mpeTokenInstance = this.network.getMPEInstance(chainId);
    mpeTokenInstance.balances(web3.eth.defaultAccount, ((err, balance) => {
      if (err) {
        console.log(err);
        return;
      }
      this.setState({escrowaccountbalance: balance});
    }));

    let instanceTokenContract = this.network.getTokenInstance(chainId);
    instanceTokenContract.allowance(web3.eth.defaultAccount, this.network.getMPEAddress(chainId), (err, allowedbalance) => {
      if (err) {
        console.log(err);
      }
      else {
        this.setState({allowedtokenbalance: allowedbalance})
      }
    });

    this.network.getAGIBalance(chainId, web3.eth.defaultAccount,((balance) => {
        if (balance !== this.state.agiBalance) {
          this.setState({ agiBalance: balance });
        }
      }));
  }

  loadDetails(chainId) {
    if (typeof web3 === 'undefined' || !isSupportedNetwork(chainId)) {
      this.setState({supportedNetwork: false})  
      this.setState({userprofile: []})
      return;
    }
    console.log("Loading details")
    this.setState({supportedNetwork: true})  
    let mpeURL = getMarketplaceURL(chainId);
    let _urlfetchprofile = mpeURL + 'channels?user_address='+web3.eth.defaultAccount
    Requests.get(_urlfetchprofile)
      .then((values)=> {
        if(typeof values !== 'undefined' && Array.isArray(values.data)) {
            this.setState({userprofile: values.data})
        }
        })
      .catch(err => console.log(err))
    this.loadAGIBalances(chainId);
  }

  onKeyPressvalidator(event) {
    const keyCode = event.keyCode || event.which;
    //comparing pressed keycodes
    if (!(keyCode == 8 || keyCode == 46) && (keyCode < 48 || keyCode > 57)) {
      event.preventDefault()
    } else {
      let dots = event.target.value.split('.');
      if (dots.length > 1 && keyCode == 46)
        event.preventDefault()
    }
  }

  onClosechaining() {
    this.setState({ openchaining: false })
  }

  onOpenchaining() {
    this.setState({ openchaining: true })
  }

  Expirationchange(e) {
    this.setState({ extexp: e.target.value })
  }
  
  extamountchange(e) {
    this.setState({ extamount: e.target.value })
  }

  handleChange(value) {
    this.setState({contractMessage:''})
    this.setState({ value });
  };

  nextJobStep() {
    this.onClosechaining()
  }

  processError(error, errorLabel) {
    this.setState({[errorLabel]: ERROR_UTILS.sanitizeError(error)})
    this.nextJobStep();
  }

  handleAmountChange(e) {
    const { name, value } = e.target;
    this.setState({[name]: value,})
  }

  executeContractMethod(operation, callBack, estimatedGas, gasPrice, messageField, successMessage, parameters) {
    console.log("Operation " + operation.name + " " + estimatedGas + " gasPrice " + gasPrice + " with params " + JSON.stringify(parameters));
    const caller = this
    parameters.push({
      gas: estimatedGas,
      gasPrice: gasPrice
    });
    parameters.push((error, txnHash) => {
      if(error) {
        this.processError(error, messageField)
      }
      else {
        console.log("Txn Hash for approved transaction is : " + txnHash);
        this.onOpenchaining();
        this.network.waitForTransaction(txnHash).then(receipt => {
            if(typeof callBack !== 'undefined') {
                callBack(caller)
            } else {            
                this.nextJobStep();
                this.setState({[messageField]:successMessage})
                this.loadAGIBalances(this.state.chainId);
            }
          })
          .catch((error) => {
            this.processError(error, messageField)
          })
      }
    });

    operation.apply(this,parameters);
  }

  handleAuthorize() {
    this.setState({contractMessage:''})
    if (typeof web3 === 'undefined' || !this.state.supportedNetwork) {
      return;
    }

    let instanceTokenContract = this.network.getTokenInstance(this.state.chainId);
    var amountInCogs = AGI.inCogs(web3, this.state.depositAmount);

    web3.eth.getGasPrice((err, gasPrice) => {
      if(err) {
        gasPrice = DEFAULT_GAS_PRICE;
      }      
      instanceTokenContract.approve.estimateGas(this.network.getMPEAddress(this.state.chainId),amountInCogs, (err, estimatedGas) => {
        if(err) {
            this.processError(err,"contractMessage");
            return;
        }        
        this.executeContractMethod(instanceTokenContract.approve, this.handleDeposit, estimatedGas, gasPrice, "contractMessage", 
        "You have successfully authorized tokens. Please deposit them to the Escrow account from the Deposit Tab",
        [this.network.getMPEAddress(this.state.chainId),amountInCogs]);
      })
    })
  }

   handleDeposit(caller, counter) {
    if(typeof counter === 'undefined'){
        counter = 0
    }
    
    let instanceTokenContract = caller.network.getTokenInstance(caller.state.chainId);
    instanceTokenContract.allowance(web3.eth.defaultAccount, caller.network.getMPEAddress(caller.state.chainId), async (err, allowedbalance) => {
      var amountInCogs = AGI.inCogs(web3, caller.state.depositAmount);
      console.log("Attempting to deposit " + amountInCogs + " attempt " + counter)
      if (Number(amountInCogs) > Number(allowedbalance)) {
          if(counter < 5) {
              console.log("Checking deposit")
              const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
              await snooze(2000);
              caller.handleDeposit(caller, counter+1)
          }
          else {
            caller.setState({contractMessage: 'Deposit amount should be less than approved balance ' + allowedbalance});
          }
      }
      else {
        let instanceEscrowContract = caller.network.getMPEInstance(caller.state.chainId);
        caller.setState({contractMessage: ''})
        web3.eth.getGasPrice((err, gasPrice) => {
          if(err) {
            gasPrice = DEFAULT_GAS_PRICE;
          }          
          instanceEscrowContract.deposit.estimateGas(amountInCogs, (err, estimatedGas) => {
            if(err) {
                caller.processError(err,"contractMessage");
                return;
            }                 
            caller.executeContractMethod(instanceEscrowContract.deposit, undefined, estimatedGas, gasPrice, "contractMessage", 
            "You have successfully deposited tokens to the Escrow. You can now execute Agents from the Home page",
            [amountInCogs]);
          })
        })
      }
    })
  }
  
  handleExpansion() {
    this.setState({channelExtendMessage:''})
  }

  handlewithdraw() {
    this.setState({contractMessage:''})
    if (typeof web3 === undefined || !this.state.supportedNetwork) {
      return;
    }

    var amountInCogs = AGI.inCogs(web3,this.state.withdrawalAmount);
    let instanceEscrowContract = this.network.getMPEInstance(this.state.chainId);

    web3.eth.getGasPrice((err, gasPrice) => {
      if(err) {
        gasPrice = DEFAULT_GAS_PRICE;
      }
      instanceEscrowContract.withdraw.estimateGas(amountInCogs, (err, estimatedGas) => {
        if(err) {
            this.processError(err,"contractMessage");
            return;
        }             
        this.executeContractMethod(instanceEscrowContract.withdraw, undefined,estimatedGas, gasPrice, "contractMessage", "You have successfully withdrawn tokens into your account", [amountInCogs]);
      })
    })
  }

  handleChannelExtendAddFunds(data) {
    this.setState({channelExtendMessage:''})
    if (typeof web3 === undefined) {
      return;
    }

    const channelID = data["channel_id"]
    const currentExpiryBlock = data["expiration"]
    if(this.state.extexp < currentExpiryBlock) {
        this.processError("Expiry block number cannot be reduced. Previously provided value is " + currentExpiryBlock, "channelExtendMessage")
        return;
    }

    this.network.getCurrentBlockNumber((blockNumber) => {
        if(this.state.extexp <= blockNumber) {
            this.processError("Block number provided should be greater than current ethereum block number " + blockNumber, "channelExtendMessage")
            return;
        }

        let instanceEscrowContract = this.network.getMPEInstance(this.state.chainId);
        var amountInCogs = AGI.inCogs(web3, this.state.extamount);
        web3.eth.getGasPrice((err, gasPrice) => {
        if(err) {
            gasPrice = DEFAULT_GAS_PRICE;
        }      
        instanceEscrowContract.channelExtendAndAddFunds.estimateGas(channelID, this.state.extexp, amountInCogs, (err, estimatedGas) => {
            if(err) {
                this.processError(err,"contractMessage");
                return;
            }
            this.executeContractMethod(instanceEscrowContract.channelExtendAndAddFunds, undefined, estimatedGas, gasPrice, "channelExtendMessage", "You have successfully extended the channel", [channelID, this.state.extexp, amountInCogs]);
            })
        })
    })
  }

  render() {
    const { value } = this.state;
    window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true
    return (
            <React.Fragment>
                <App searchTerm="" chainId={this.state.chainId}/>
                <div className="container">
                    <div className="row">
                        <div className=" col-xs-12 col-sm-12 col-md-6 col-lg-6 your-account-details">
                            <h3>Your Account details</h3>
                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 agent-detail">
                                <div className="row">
                                    <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10">
                                        <label>Account</label>
                                    </div>
                                    {(typeof window.web3 !== 'undefined') ?
                                    <React.Fragment>
                                        <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 word-break no-padding">
                                            <Tooltip title={<span style={{ fontSize: "15px" }}>Account</span>}>
                                                <label>{web3.eth.accounts[0]}</label>
                                            </Tooltip>
                                            &nbsp; {(web3.eth.defaultAccount !== null) ?
                                            <CopyToClipboard text={web3.eth.accounts[0]} onCopy={()=> message.success('Account address copied', 1)}>
                                                <a>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 23 23">
                                                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                                    </svg>
                                                </a>
                                            </CopyToClipboard> : null}
                                        </div>
                                    </React.Fragment>
                                    : null}
                                </div>
                                <div className="row">
                                    <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10">
                                        <label>Token Balance</label>
                                    </div>
                                    <Tooltip title={<span style={{ fontSize: "15px" }}>Token Balance</span>}>
                                        <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 no-padding ">
                                            <label>{this.state.agiBalance} AGI</label>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className="row">
                                    <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10">
                                        <label>Escrow Balance</label>
                                    </div>
                                    <Tooltip title={<span style={{ fontSize: "15px" }}>Escrow Balance</span>}>
                                        <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 no-padding ">
                                            <label>{AGI.toDecimal(this.state.escrowaccountbalance)} AGI</label>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div className="row">
                                    <div className=" col-xs-12 col-sm-4 col-md-3 col-lg-3 no-padding mtb-10">
                                        <label>Authorized Tokens</label>
                                    </div>
                                    <Tooltip title={<span style={{ fontSize: "15px" }}>Authorized Tokens</span>}>
                                        <div className=" col-xs-12 col-sm-8 col-md-9 col-lg-9 mtb-10 no-padding ">
                                            <label>{AGI.toDecimal(this.state.allowedtokenbalance)} AGI</label>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 manage-account">
                            <h3>Manage your Escrow account</h3>
                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 amount-type">
                                <Tabs value={value} onChange={(event,value)=> this.handleChange(value)} indicatorColor='primary'>
                                        <Tab label={<span style={{ fontSize: "13px"  }}>Deposit&nbsp;<span>
                                            <Tooltip title={<span style={{ fontSize: "13px", lineHeight: "18px"}}>
                                                Deposit AGI tokens to the escrow account. You need to have funds in the escrow to create payment channels.</span>} >
                                                <i className="fa fa-info-circle info-icon" aria-hidden="true"></i>
                                            </Tooltip></span></span>} />
                                        <Tab label={<span style={{ fontSize: "13px" }}>Withdraw&nbsp;<span>
                                            <Tooltip title={<span style={{ fontSize: "13px", lineHeight: "18px"}}>
                                                Withdraw AGI tokens from the escrow to your account.</span>}>
                                                <i className="fa fa-info-circle info-icon" aria-hidden="true"></i>
                                            </Tooltip></span></span>} />
                                </Tabs>
                                {value === 0 &&
                                <ProfileTabContainer>
                                    <TextField id="depositamt" label={<span style={{ fontSize: "13px" }}>Amount</span>} margin="normal" name="depositAmount" onChange={this.handleAmountChange} value={this.state.depositAmount} style={{ width: "100%", fontWeight: "bold" }} onKeyPress={(e) => this.onKeyPressvalidator(e)} />
                                        <br />
                                        <div className="row">
                                            <div className="col-xs-6 col-sm-6 col-md-6 transaction-message">{this.state.contractMessage}</div>
                                            <div className="col-xs-6 col-sm-6 col-md-6" style={{ textAlign: "right" }}>
                                                {(this.state.supportedNetwork && web3.eth.defaultAccount !== null && this.state.depositAmount > 0) ?
                                                <button className="btn btn-primary" onClick={this.handleAuthorize}><span style={{ fontSize: "15px" }}>Deposit</span></button> :
                                                <button className="btn " disabled><span style={{ fontSize: "15px" }}>Deposit</span></button>
                                                }
                                            </div>
                                        </div>
                                        <p className="transaction-message">{this.state.contractMessage}</p>
                                </ProfileTabContainer>} {value === 1 &&
                                <ProfileTabContainer>
                                    <TextField id="withdrawamt" label={<span style={{ fontSize: "13px" }}>Amount</span>} margin="normal" name="withdrawalAmount" onChange={this.handleAmountChange} value={this.state.withdrawalAmount} style={{ width: "100%", fontWeight: "bold" }} onKeyPress={(e) => this.onKeyPressvalidator(e)} />
                                        <br />
                                        <div className="row">
                                            <div className="col-xs-6 col-sm-6 col-md-6 transaction-message">{this.state.contractMessage}</div>
                                            <div className="col-xs-6 col-sm-6 col-md-6" style={{ textAlign: "right" }}>
                                                {(this.state.supportedNetwork && web3.eth.defaultAccount !== null && this.state.withdrawalAmount > 0) ?
                                                <button type="button" className="btn btn-primary " onClick={this.handlewithdraw}><span style={{ fontSize: "15px" }}>Withdraw</span></button>:
                                                <button className="btn" disabled><span style={{ fontSize: "15px" }}>Withdraw</span></button>
                                                }
                                            </div>
                                        </div>
                                        <p></p>
                                </ProfileTabContainer>}
                            </div>
                        </div>
                        <div>
                            <DAppModal open={this.state.openchaining} message={"Your transaction is being mined."} showProgress={true}/>
                        </div>
                        <div className="manage-account">
                        <h3>Channel Details</h3>
                        </div>
                        <div className="col-xs-12 col-sm-16 col-md-16 col-lg-16 channel-info ">
                            <div className="row channel-header">
                                <div className="col-sm-3 col-md-3 col-lg-2 hidden-xs">
                                    <span>Channel ID</span>
                                </div>
                                <div className="col-sm-3 col-md-2 col-lg-3 hidden-xs">
                                    <span>Organization</span>
                                </div>
                                <div className="col-sm-3 col-md-3 col-lg-2 hidden-xs">
                                    <span>Service</span>
                                </div>                                                                
                                <div className="col-sm-3 col-md-3 col-lg-2 hidden-xs">
                                    <span>Balance</span>
                                </div>
                                <div className="col-sm-3 col-md-3 col-lg-2 hidden-xs">
                                    <span>Expiry Block</span>
                                </div>
                                <div className="col-sm-1 col-md-1 col-lg-1 hidden-xs">&nbsp;</div>
                            </div>
                            {this.state.userprofile.map((row, index) =>
                            <ExpansionPanel onChange={this.handleExpansion} key={index} style={{ borderRadius: "5px", backgroundColor: "#E3F0FF", marginBottom: "15px" }}>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} style={{ padding: "0px" }}>
                                <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3"> <span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["channel_id"]}</span></div>
                                <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3"> <span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["org_id"]}</span></div>
                                <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3"> <span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["display_name"]}</span></div>                    
                                <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3">
                                    <Typography><span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{AGI.inAGI(row["balance_in_cogs"])} AGI</span></Typography>
                                </div>
                                <div className="col-xs-12 col-sm-3 col-md-2 col-lg-3">
                                    <Typography><span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["expiration"]}</span></Typography>
                                </div>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{ backgroundColor: "#F1F1F1" }}>
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-7 no-padding">
                                        You can add additional funds to the channel and / or set the expiry block number.
                                        In order to add funds to the channel you need to ensure that your escrow has sufficient balance. The expiry block represents the block number at which the channel becomes eligible for you to reclaim funds. Do note that for agents to accept your channel the expiry block number should be sufficiently ahead of the current number. In general agents will only accept your request if the expiry block number is atleast a full day ahead of the current block number.
                                    </div>
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-5 pull-right">
                                        <div className="row">
                                            <div className="col-md-12 pull-right no-padding">
                                                <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                                                    <label>Amount</label>
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                                                    <Tooltip title={<span style={{ fontSize: "15px" }}>Amount</span>}>
                                                        <input type="text" value={this.state.extamount} name="amount" className="channels-input" onChange={(e)=> this.extamountchange(e)} onKeyPress={(e) => this.onKeyPressvalidator(e)} />
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-12 pull-right no-padding">
                                                <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                                                    <label>Expiry Blocknumber</label>
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-lg-6 pull-left mtb-10">
                                                    <Tooltip title={<span style={{ fontSize: "15px" }}>Expiry Blocknumber</span>}>
                                                        <input type="text" value={this.state.extexp} name="newexpiration" className="channels-input" onChange={(e)=> this.Expirationchange(e)} />
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            {(this.state.supportedNetwork && web3.eth.defaultAccount !== null) ?
                                            <Tooltip title={<span>Confirm</span>} >
                                                <button type="button" className="btn btn-primary " onClick={()=> this.handleChannelExtendAddFunds(row)}><span style={{ fontSize: "15px" }}>Confirm</span></button>
                                            </Tooltip> :
                                            <Tooltip title={<span>Confirm</span>} >
                                                <button type="button" className="btn " disabled><span style={{ fontSize: "15px" }}>Confirm</span></button>
                                            </Tooltip>
                                            }
                                        </div>
                                        <p className="transaction-message">{this.state.channelExtendMessage}</p>
                                    </div>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            )}
                        </div>
                    </div>
                </div>
            </React.Fragment>
    )
  }
}