import React, { Component } from 'react';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { AGI,ERROR_UTILS,DEFAULT_GAS_PRICE, DEFAULT_GAS_ESTIMATE, getMarketplaceURL, isSupportedNetwork, MESSAGES } from '../util';
import { Requests } from '../requests'
import Header from "./Header.js";
import Tooltip from '@material-ui/core/Tooltip';
import BlockchainHelper from "./BlockchainHelper.js"
import {ProfileTabContainer} from './ReactStyles.js';
import DAppModal from './DAppModal.js'
import Footer from "./Footer.js";

export class Account extends Component {
  constructor(props) {
    super(props)
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
      showModal: false,
      chainId: undefined,
      contractMessage: '',
      channelMessage:'',
      isErrorMessage:false,
      supportedNetwork: false
    }

    this.chainMessage = "";
    this.watchWalletTimer = undefined;
    this.watchNetworkTimer = undefined;
    this.handleAuthorize = this.handleAuthorize.bind(this)
    this.handlewithdraw = this.handlewithdraw.bind(this)
    this.handleAmountChange = this.handleAmountChange.bind(this)
    this.onKeyPressvalidator = this.onKeyPressvalidator.bind(this)
    //this.handleChannelExtendAddFunds = this.handleChannelExtendAddFunds.bind(this)
    this.handleClaimTimeout = this.handleClaimTimeout.bind(this)
    this.Expirationchange = this.Expirationchange.bind(this)
    this.extamountchange = this.extamountchange.bind(this)
    this.onShowModal = this.onShowModal.bind(this)
    this.onCloseModal = this.onCloseModal.bind(this)
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
        this.watchNetwork();
        this.watchWallet();
        if (!this.watchNetworkTimer) {
          this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
        }
        if (!this.watchWalletTimer) {
          this.watchWalletTimer = setInterval(() => this.watchWallet(), 500);
        }
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
        console.log("Account changed from " + this.state.account +" to " + account)
        this.setState({account:account})
        this.loadDetails(this.state.chainId)
      }
    });
  }

  loadAGIBalances(chainId) {
    if (typeof web3 === 'undefined' || !this.state.supportedNetwork) {
      return;
    }

    console.log("Loading AGI Balance for " + this.state.account)
    let mpeTokenInstance = this.network.getMPEInstance(chainId);
    mpeTokenInstance.balances(this.state.account, ((err, balance) => {
      if (err) {
        console.log(err);
        return;
      }
      this.setState({escrowaccountbalance: balance});
    }));

    let instanceTokenContract = this.network.getTokenInstance(chainId);
    instanceTokenContract.allowance(this.state.account, this.network.getMPEAddress(chainId), (err, allowedbalance) => {
      if (err) {
        console.log(err);
      }
      else {
        this.setState({allowedtokenbalance: allowedbalance})
      }
    });

    this.network.getAGIBalance(chainId, this.state.account,((balance) => {
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
    let _urlfetchprofile = mpeURL + 'expired-channels?user_address='+web3.eth.defaultAccount;
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

  onCloseModal() {
    this.chainMessage = "";
    this.setState({ showModal: false })
  }

  onShowModal(message) {
    this.chainMessage = message;
    this.setState({ showModal: true })
  }

  Expirationchange(e) {
    this.setState({ extexp: e.target.value })
  }

  extamountchange(e) {
    this.setState({ extamount: e.target.value })
  }

  clearMessage(name) {
    this.setState({isErrorMessage:false})
    this.setState({[name]:''})
  }

  handleChange(value) {
    this.clearMessage("contractMessage");
    this.setState({ value });
  };

  nextJobStep() {
    this.onCloseModal()
  }

  processError(error, errorLabel) {
    this.setState({[errorLabel]: ERROR_UTILS.sanitizeError(error)});
    this.setState({isErrorMessage:true});
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

    this.onShowModal(MESSAGES.WAIT_FOR_MM);
    parameters.push((error, txnHash) => {
      if(error) {
        this.processError(error, messageField)
      }
      else {
        console.log("Txn Hash for approved transaction is : " + txnHash);
        this.onShowModal(MESSAGES.WAIT_FOR_TRANSACTION);
        this.network.waitForTransaction(txnHash).then(receipt => {
            if(typeof callBack !== 'undefined') {
                callBack(caller)
            } else {
                this.nextJobStep();
                this.setState({[messageField]:successMessage})
                this.setState({depositAmount: 0})
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
    this.clearMessage("contractMessage");
    if (typeof web3 === 'undefined' || !this.state.supportedNetwork) {
      return;
    }

    var amountInCogs = AGI.inCogs(web3, this.state.depositAmount);
    const balanceInCogs = AGI.inCogs(web3, this.state.agiBalance);
    if(balanceInCogs < amountInCogs) {
        this.processError("Deposit failed as available tokens " + this.state.agiBalance + " is less than amount deposited", "contractMessage");
        return;
    }

    let instanceTokenContract = this.network.getTokenInstance(this.state.chainId);
    web3.eth.getGasPrice((err, gasPrice) => {
      if(err) {
        gasPrice = DEFAULT_GAS_PRICE;
      }
      instanceTokenContract.approve.estimateGas(this.network.getMPEAddress(this.state.chainId),amountInCogs, (err, estimatedGas) => {
        if(err) {
            estimatedGas = DEFAULT_GAS_ESTIMATE;
        }
        this.executeContractMethod(instanceTokenContract.approve, this.handleDeposit, estimatedGas, gasPrice, "contractMessage",
        "",
        [this.network.getMPEAddress(this.state.chainId),amountInCogs]);
      })
    })
  }

   handleDeposit(caller, counter) {
    if(typeof counter === 'undefined'){
        counter = 0
    }

    let instanceTokenContract = caller.network.getTokenInstance(caller.state.chainId);
    instanceTokenContract.allowance(caller.state.account, caller.network.getMPEAddress(caller.state.chainId), async (err, allowedbalance) => {
      var amountInCogs = AGI.inCogs(web3, caller.state.depositAmount);
      console.log("Attempting to deposit " + amountInCogs + " attempt " + counter)
      if (Number(amountInCogs) > Number(allowedbalance)) {
          if(counter < 15) {
              console.log("Checking deposit AllowedBalance is " + allowedbalance + " deposit amount is " + amountInCogs);
              const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
              await snooze(2000);
              caller.handleDeposit(caller, counter+1)
          }
          else {
            caller.processError("Deposit failed. Please retry with a higher gas fee","contractMessage");
          }
      }
      else {
        let instanceEscrowContract = caller.network.getMPEInstance(caller.state.chainId);
        caller.clearMessage("contractMessage");
        web3.eth.getGasPrice((err, gasPrice) => {
          if(err) {
            gasPrice = DEFAULT_GAS_PRICE;
          }          
          instanceEscrowContract.deposit.estimateGas(amountInCogs, (err, estimatedGas) => {
            if(err) {
                estimatedGas = DEFAULT_GAS_ESTIMATE;
            }                 
            caller.executeContractMethod(instanceEscrowContract.deposit, undefined, estimatedGas, gasPrice, "contractMessage", 
            "You have successfully deposited tokens to the escrow. You can now invoke services from the Home page",
            [amountInCogs]);
          })
        })
      }
    })
  }
  
  handleExpansion() {
    this.clearMessage("channelMessage");
  }

  handlewithdraw() {
    this.clearMessage("contractMessage");
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
            estimatedGas = DEFAULT_GAS_ESTIMATE;
        }             
        this.executeContractMethod(instanceEscrowContract.withdraw, undefined,estimatedGas, gasPrice, "contractMessage", "You have successfully withdrawn tokens into your account", [amountInCogs]);
      })
    })
  }

  handleClaimTimeout(data) {
    this.clearMessage("channelMessage");
    if (typeof web3 === undefined) {
      return;
    }

    var channelID = data["channel_id"]
    let instanceEscrowContract = this.network.getMPEInstance(this.state.chainId);
        web3.eth.getGasPrice((err, gasPrice) => {
        if(err) {
            gasPrice = DEFAULT_GAS_PRICE;
        }      
        instanceEscrowContract.channelClaimTimeout.estimateGas(channelID, (err, estimatedGas) => {
            if(err) {
                console.log("Estimation failed for " + channelID + " estimation is " + estimatedGas)
                estimatedGas = DEFAULT_GAS_ESTIMATE
            }
            this.executeContractMethod(instanceEscrowContract.channelClaimTimeout, undefined, estimatedGas, gasPrice, "channelMessage", "You have successfully claimed the unused tokens. Please check your escrow balance in a bit", [channelID]);
            })
        })
  }

  handleChannelExtendAddFunds(data) {
    this.clearMessage("channelMessage");
    if (typeof web3 === undefined) {
      return;
    }

    const channelID = data["channel_id"]
    const currentExpiryBlock = data["expiration"]
    if(this.state.extexp < currentExpiryBlock) {
        this.processError("Expiry block number cannot be reduced. Previously provided value is " + currentExpiryBlock, "channelMessage")
        return;
    }

    this.network.getCurrentBlockNumber((blockNumber) => {
        if(this.state.extexp <= blockNumber) {
            this.processError("Block number provided should be greater than current ethereum block number " + blockNumber, "channelMessage")
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
                estimatedGas = DEFAULT_GAS_ESTIMATE;                
            }
            this.executeContractMethod(instanceEscrowContract.channelExtendAndAddFunds, undefined, estimatedGas, gasPrice, "channelMessage", "You have successfully extended the channel", [channelID, this.state.extexp, amountInCogs]);
            })
        })
    })
  }

  render() {
    const { value } = this.state;
    window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true
    return (
            <React.Fragment>
                <Header chainId={this.state.chainId}/>
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
                                                <label>{this.state.account}</label>
                                        </div>
                                    </React.Fragment>
                                    : null}
                                </div>
                                <div className="row">
                                    <div className=" col-xs-12 col-sm-4 col-md-4 col-lg-3 no-padding mtb-10">
                                        <label>Token Balance</label>
                                    </div>
                                        <div className=" col-xs-12 col-sm-8 col-md-8 col-lg-9 mtb-10 no-padding ">
                                            <label>{this.state.agiBalance} AGI</label>
                                        </div>
                                </div>
                                <div className="row">
                                    <div className=" col-xs-12 col-sm-4 col-md-4 col-lg-3 no-padding mtb-10">
                                        <label>Escrow Balance</label>
                                    </div>
                                        <div className=" col-xs-12 col-sm-8 col-md-8 col-lg-9 mtb-10 no-padding ">
                                            <label>{AGI.toDecimal(this.state.escrowaccountbalance)} AGI</label>
                                        </div>
                                </div>
                                <div className="row">
                                    <div className=" col-xs-12 col-sm-4 col-md-4 col-lg-3 no-padding mtb-10">
                                        <label>Authorized Tokens</label>
                                    </div>
                                        <div className=" col-xs-12 col-sm-8 col-md-8 col-lg-9 mtb-10 no-padding ">
                                            <label>{AGI.toDecimal(this.state.allowedtokenbalance)} AGI</label>
                                        </div>
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
                                            <div className={this.state.isErrorMessage ? "col-xs-6 col-sm-6 col-md-6 error-msg":"col-xs-6 col-sm-6 col-md-6 transaction-message"}>
                                            {this.state.contractMessage}</div>
                                            <div className="col-xs-6 col-sm-6 col-md-6" style={{ textAlign: "right" }}>
                                                {(this.state.supportedNetwork && this.state.account !== null && this.state.depositAmount > 0) ?
                                                <button className="btn btn-primary" onClick={this.handleAuthorize}><span style={{ fontSize: "15px" }}>Deposit</span></button> :
                                                <button className="btn " disabled><span style={{ fontSize: "15px" }}>Deposit</span></button>
                                                }
                                            </div>
                                        </div>
                                </ProfileTabContainer>} {value === 1 &&
                                <ProfileTabContainer>
                                    <TextField id="withdrawamt" label={<span style={{ fontSize: "13px" }}>Amount</span>} margin="normal" name="withdrawalAmount" onChange={this.handleAmountChange} value={this.state.withdrawalAmount} style={{ width: "100%", fontWeight: "bold" }} onKeyPress={(e) => this.onKeyPressvalidator(e)} />
                                        <br />
                                        <div className="row">
                                            <div className={this.state.isErrorMessage ? "col-xs-6 col-sm-6 col-md-6 error-msg":"col-xs-6 col-sm-6 col-md-6 transaction-message"}>
                                            {this.state.contractMessage}</div>
                                            <div className="col-xs-6 col-sm-6 col-md-6" style={{ textAlign: "right" }}>
                                                {(this.state.supportedNetwork && this.state.account !== null && this.state.withdrawalAmount > 0) ?
                                                <button type="button" className="btn btn-primary " onClick={this.handlewithdraw}><span style={{ fontSize: "15px" }}>Withdraw</span></button>:
                                                <button className="btn" disabled><span style={{ fontSize: "15px" }}>Withdraw</span></button>
                                                }
                                            </div>
                                        </div>
                                </ProfileTabContainer>}
                            </div>
                        </div>
                        <div>
                            <DAppModal open={this.state.showModal} message={this.chainMessage} showProgress={true}/>
                        </div>
                        <div className="manage-account channel-details">
                        <h3>Expired Channel Details</h3>
                        </div>
                        <div className="col-xs-12 col-sm-16 col-md-16 col-lg-16 channel-info ">
                            <div className="row channel-header">
                                <div className="col-sm-2 col-md-2 col-lg-2 hidden-xs">
                                    <span>Channel ID</span>
                                </div>
                                <div className="col-sm-2 col-md-2 col-lg-2 hidden-xs">
                                    <span>Organization</span>
                                </div>
                                <div className="col-xs-4 col-sm-3 col-md-3 col-lg-3">
                                    <span>Service</span>
                                </div>                                                                
                                <div className="col-xs-4 col-sm-2 col-md-2 col-lg-2">
                                    <span>Balance</span>
                                </div>
                                <div className="col-xs-3 col-sm-2 col-md-2 col-lg-2">
                                    <span>Expiry Block</span>
                                </div>
                                <div className="col-xs-3 col-sm-1 col-md-1 col-lg-1">&nbsp;</div>
                            </div>
                            {this.state.userprofile.map((row, index) =>
                            <ExpansionPanel onChange={this.handleExpansion} key={index} style={{ borderRadius: "5px", backgroundColor: "#E3F0FF", marginBottom: "15px" }}>
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} style={{ padding: "0px" }}>
                                  <div className="col-sm-2 col-md-2 col-lg-2 hidden-xs">
                                    <span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["channel_id"]}</span>
                                  </div>
                                  <div className="col-sm-2 col-md-2 col-lg-2 hidden-xs">
                                    <span className="col-xs-6 col-sm-12 no-padding" style={{ fontSize: "14px" }}>{row["org_id"]}</span>
                                  </div>
                                  <div className="col-xs-4 col-sm-3 col-md-3 col-lg-3">
                                    <span className="col-xs-6 col-sm-12 no-padding service-name-data" style={{ fontSize: "14px" }}>{row["display_name"]}</span>
                                  </div>                    
                                  <div className="col-xs-4 col-sm-2 col-md-2 col-lg-2">
                                    <Typography>
                                      <span className="col-xs-6 col-sm-12 no-padding balance-data" style={{ fontSize: "14px" }}>{AGI.inAGI(row["balance_in_cogs"])} AGI</span>
                                    </Typography>
                                  </div>
                                  <div className="col-xs-3 col-sm-2 col-md-2 col-lg-2">
                                    <Typography>
                                      <span className="col-xs-6 col-sm-12 no-padding expiry-block-data" style={{ fontSize: "14px" }}>{row["expiration"]}</span>
                                    </Typography>
                                  </div>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{ backgroundColor: "#F1F1F1" }}>
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-7 no-padding data-on-expand">
                                        This channel has unused funds and has expired. You can claim your unused tokens which will be added to your escrow balance.
                                    </div>
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-5 pull-right">
                                        <div style={{ textAlign: "right" }}>
                                            {(this.state.supportedNetwork && this.state.account !== null) ?
                                                <button type="button" className="btn btn-primary claim-channel-btn" onClick={()=> this.handleClaimTimeout(row)}><span style={{ fontSize: "15px" }}>Claim Channel</span></button>
                                            :
                                                <button type="button" className="btn " disabled><span style={{ fontSize: "15px" }}>Claim Channel</span></button>
                                            }
                                        </div>
                                        <p className={this.state.isErrorMessage ? "error-msg":"transaction-message"}>{this.state.channelMessage}</p>
                                    </div>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                            )}
                        </div>
                    </div>
                </div>
              <Footer/>
            </React.Fragment>
    )
  }
}
