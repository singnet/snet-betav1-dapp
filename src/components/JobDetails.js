import React, { props } from 'react';
import { grpcRequest, rpcImpl } from '../grpc.js'
import { Requests } from '../requests'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Slide from '@material-ui/core/Slide'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { Link } from 'react-router-dom'
import { AGI, hasOwnDefinedProperty,FORMAT_UTILS,ERROR_UTILS,DEFAULT_GAS_PRICE,DEFAULT_GAS_ESTIMATE } from '../util'
import {TabContainer, ModalStylesAlertWait, ModalStylesAlert} from './ReactStyles.js';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ServiceMappings from "./service/ServiceMappings.js"
import ChannelHelper from './ChannelHelper.js';
import CircularProgress from '@material-ui/core/CircularProgress'
import { Root } from 'protobufjs'

export  class Jobdetails extends React.Component {
    constructor() {
      super(props)
      
      this.state = {
        tagsall:[],
        jobDetailsSliderOpen:false,
        modalservicestatus:[],
        ocvalue:0,
        ocexpiration:0,
        grpcResponse:undefined,
        grpcErrorOccurred:false,
        startjobfundinvokeres:false,
        depositopenchannelerror:'',
        valueTab:0,
        userkeepsvote:'',
        openchaining:false,
        sliderWidth:'550px',
        showEscrowBalanceAlert:false,
      };

      this.serviceState = {};
      this.channelHelper = new ChannelHelper()
      this.currentBlockNumber = undefined
      this.serviceSpecJSON = undefined
      /*this.serviceState = {
        serviceSpecJSON : undefined,
        serviceId: undefined,
        orgId: undefined,
        price : undefined,
        currentBlockNumber : undefined,
        channelHelper : new ChannelHelper()
      }*/      
      this.serviceMappings = new ServiceMappings();
      this.onKeyPressvalidator = this.onKeyPressvalidator.bind(this);
      this.handleChangeTabs = this.handleChangeTabs.bind(this);
      this.onCloseJobDetailsSlider = this.onCloseJobDetailsSlider.bind(this);
      this.onMaximizeJobDetailsSlider = this.onMaximizeJobDetailsSlider.bind(this);
      this.onMinimizeJobDetailsSlider = this.onMinimizeJobDetailsSlider.bind(this);
      this.changeocvalue = this.changeocvalue.bind(this);
      this.changeocexpiration = this.changeocexpiration.bind(this);
      this.openchannelhandler = this.openchannelhandler.bind(this);
      this.handleJobInvocation = this.handleJobInvocation.bind(this);      
      this.startjob = this.startjob.bind(this);
      this.handleVote = this.handleVote.bind(this);
      this.onOpenEscrowBalanceAlert = this.onOpenEscrowBalanceAlert.bind(this)
      this.onCloseEscrowBalanceAlert = this.onCloseEscrowBalanceAlert.bind(this)  
      this.onOpenchaining = this.onOpenchaining.bind(this)
      this.onClosechaining = this.onClosechaining.bind(this)  
    }

    nextJobStep() {
      this.onClosechaining()
      this.setState({valueTab:(this.state.valueTab + 1)})
      console.log("Job step " + this.state.valueTab);
    }

    handleVote(orgid,serviceid,upVote)
    {
      const urlfetchvote = this.network.getMarketplaceURL(this.state.chainId) + 'vote'
      var sha3Message = web3.sha3(this.state.userAddress + orgid + upVote + serviceid + (!upVote));
      window.ethjs.personal_sign(sha3Message, this.state.userAddress).then((signed) => {
        const requestObject = {
          vote: {
            user_address: this.state.userAddress,
            org_id: orgid,
            service_id: serviceid,
            up_vote: upVote,
            down_vote: (!upVote),
            signature: signed
          }
        }
  
        Requests.post(urlfetchvote,requestObject)
          .then(res => res.json())
          .then(data => this.setState({userkeepsvote: data}))
          .catch(err => console.log(err));
      })
    }

    reInitializeJobState() {
      //let serviceId = data["service_id"];
      //let orgId = data["org_id"];
      //this.serviceState.price = data["price_in_cogs"];
      let channelInfoUrl = this.props.network.getMarketplaceURL(this.props.chainId) + 'channel-info';
      return this.channelHelper.reInitialize(channelInfoUrl, this.props.userAddress, this.serviceState["service_id"], this.serviceState["org_id"]);
    }

    fetchServiceSpec() {
      var caller = this;
      let _urlservicebuf = this.props.network.getProtobufjsURL(this.props.chainId) + this.serviceState["org_id"] + "/" + this.serviceState["service_id"];

      return fetch(encodeURI(_urlservicebuf))
        .then(serviceSpecResponse => serviceSpecResponse.json())
        .then(serviceSpec => new Promise(function(resolve) {
          caller.serviceSpecJSON = Root.fromJSON(serviceSpec[0])
          resolve();
        }));
    }

    startjob() {
      //var currentBlockNumber = 900000;
      //(async ()=> { await web3.eth.getBlockNumber((error, result) => {currentBlockNumber = result}) })()
      var reInitialize = this.reInitializeJobState();
      var serviceSpec = this.fetchServiceSpec();
      Promise.all([reInitialize, serviceSpec]).then(() => {
        let mpeTokenInstance = this.props.network.getMPEInstance(this.props.chainId);
        mpeTokenInstance.balances(this.props.userAddress, (err, balance) => {
          balance = AGI.inAGI(balance);
          console.log("In start job Balance is " + balance + " job cost is " + this.serviceState['price_in_agi']);
          let foundChannel = this.channelHelper.findChannelWithBalance(this.serviceState, this.getCurrentBlockNumber());
          if (typeof balance !== 'undefined' && balance === 0 && !foundChannel) {
            this.onOpenEscrowBalanceAlert();
          } else if (foundChannel) {
            console.log("Found a channel with enough balance Details " + JSON.stringify(this.serviceState));
            this.setState({startjobfundinvokeres: true});
            this.setState({valueTab: 1});
          } else {
            console.log("MPE has balance but no usable channel - Balance is " + balance + " job cost is " + this.serviceState['price_in_agi']);
            this.setState({startjobfundinvokeres: true})
            this.setState({valueTab: 0});
          }
        });
      })
    }

    composeMessage(contract, channelID, nonce, price) {
      var ethereumjsabi = require('ethereumjs-abi');
      var sha3Message = ethereumjsabi.soliditySHA3(
        ["address", "uint256", "uint256", "uint256"],
        [contract, parseInt(channelID), parseInt(nonce), parseInt(price)]);
      var msg = "0x" + sha3Message.toString("hex");
      return msg;
    }

    handleJobInvocation(serviceName, methodName, requestObject) {
      var nonce = this.channelHelper.getNonce(0);
      var msg = this.composeMessage(this.props.network.getMPEAddress(this.props.chainId), this.channelHelper.getChannelId(), nonce, this.serviceState["price_in_cogs"]);
      this.setState({grpcResponse: undefined})
      this.setState({grpcErrorOccurred: false})
      window.ethjs.personal_sign(msg, this.props.userAddress)
        .then((signed) => {
          var stripped = signed.substring(2, signed.length)
          var byteSig = Buffer.from(stripped, 'hex');
          let buff = new Buffer(byteSig);
          let base64data = buff.toString('base64')
          console.log("Using signature " + base64data)
          const requestHeaders = {
            "snet-payment-type": "escrow",
            "snet-payment-channel-id": parseInt(this.channelHelper.getChannelId()),
            "snet-payment-channel-nonce": parseInt(nonce),
            "snet-payment-channel-amount": parseInt(this.serviceState["price_in_cogs"]),
            "snet-payment-channel-signature-bin": base64data
          }

          console.log("Headers " + JSON.stringify(requestHeaders))
          const packageName = Object.keys(this.serviceSpecJSON.nested).find(key =>
            typeof this.serviceSpecJSON.nested[key] === "object" &&
            hasOwnDefinedProperty(this.serviceSpecJSON.nested[key], "nested")
          )
          var endpointgetter = this.channelHelper.getEndpoint();
          console.log("Invoking service with package " + packageName + " serviceName " + serviceName + " methodName " + methodName + " endpoint " + endpointgetter + " request " + JSON.stringify(requestObject));
          if (!endpointgetter.startsWith("http")) {
            endpointgetter = "http://" + endpointgetter;
          }
          const Service = this.serviceSpecJSON.lookup(serviceName)
          const serviceObject = Service.create(rpcImpl(endpointgetter, packageName, serviceName, methodName, requestHeaders), false, false)
          grpcRequest(serviceObject, methodName, requestObject)
            .then(response => {
              console.log("Got a GRPC response")
              this.setState({grpcResponse: response})
              this.nextJobStep();
            })
            .catch((err) => {
              console.log("GRPC call failed")
              this.setState({grpcResponse: err});
              this.setState({grpcErrorOccurred: true})
              console.log(err);
              this.nextJobStep();
            })
          return window.ethjs.personal_ecRecover(msg, signed);
        });
    }

    onClosechaining() {
      this.setState({openchaining:false})
    }
  
    onOpenchaining() {
      this.setState({openchaining:true})
    }

    changeocvalue(e) {
      this.setState({ocvalue: e.target.value})
    }

    changeocexpiration(e) {
      this.setState({depositopenchannelerror: ""})
      this.setState({ocexpiration: e.target.value})
    }


    openchannelhandler() {
      if (typeof web3 === 'undefined') {
        return;
      }

      try
      {
        this.setState({depositopenchannelerror: ''});
        let mpeInstance = this.props.network.getMPEInstance(this.props.chainId);
        var amountInCogs = AGI.inCogs(web3, this.state.ocvalue);

        console.log('channel object ' + this.channelHelper.getEndpoint());
        if (typeof this.channelHelper.getChannels() === 'undefined') {
          this.onOpenEscrowBalanceAlert()
        } else {
        const currentBlockNumber = this.getCurrentBlockNumber()
        if(this.state.ocexpiration <= currentBlockNumber) {
          this.processChannelErrors("Block number provided should be greater than current block number " + currentBlockNumber);
          return;
        }
          console.log("MPE has balance but have to check if we need to open a channel or extend one.");
          var groupIDBytes = atob(this.channelHelper.getGroupId());
          var recipientaddress = this.channelHelper.getRecipient();
          console.log("group id is " + this.channelHelper.getGroupId())
          console.log("recipient address is " + recipientaddress)
          console.log('groupdidgetter hex is ' + groupIDBytes)
          console.log('Amount is ' + amountInCogs);
          console.log(this.state.ocexpiration);
          console.log(this.props.userAddress);
          if (this.channelHelper.getChannels().length > 0) {
            var rrchannel = this.channelHelper.getChannels()[0];
            console.log("Found an existing channel, will try to extend it " + JSON.stringify(rrchannel));
            this.channelExtend(mpeInstance, rrchannel, amountInCogs);
          } else {
            console.log("No Channel found to going to deposit from MPE and open a channel");
            this.channelOpen(mpeInstance, recipientaddress, groupIDBytes, amountInCogs);
          }
        }
      }
      catch(e) {
        this.processChannelErrors(e.message);
      }
    }

    channelExtend(mpeInstance, rrchannel, amountInCogs) {
      web3.eth.getGasPrice((err, gasPrice) => {
        if(err) {
          gasPrice = DEFAULT_GAS_PRICE;
        }

        mpeInstance.channelExtendAndAddFunds.estimateGas(rrchannel["channelId"], this.state.ocexpiration, amountInCogs, (err, estimatedGas) =>
        {
          if(err) {
            estimatedGas = DEFAULT_GAS_ESTIMATE
            //this.processChannelErrors(err,"Unable to invoke the channelExtendAndAddFunds method");
          }
          mpeInstance.channelExtendAndAddFunds(rrchannel["channelId"], this.state.ocexpiration, amountInCogs, {
            gas: estimatedGas,
            gasPrice: gasPrice
          }, (error, txnHash) => {
            if(error) {
              this.processChannelErrors(error,"Unable to invoke the channelExtendAndAddFunds method");
            }
            else {
              console.log("Channel extended and added funds is TXN Has : " + txnHash);
              this.onOpenchaining();
              this.props.network.waitForTransaction(txnHash).then(receipt => {
                  this.channelHelper.setChannelId(rrchannel["channelId"]);
                  console.log('Re using channel ' + this.channelHelper.getChannelId());
                  this.nextJobStep();
                })
                .catch((error) => {
                  this.processChannelErrors(error,"Channel extend failed with error");
                });
              }
            });
          });
      });
    }

    channelOpen(mpeInstance, recipientaddress, groupIDBytes, amountInCogs) {
      var startingBlock = this.getCurrentBlockNumber();
      /*web3.eth.getBlockNumber((error, result) => {
        if (!error) {
          startingBlock = result;
        }
      });*/
      console.log("Reading events from " + startingBlock);

      web3.eth.getGasPrice((err, gasPrice) => {
        if(err) {
          gasPrice = DEFAULT_GAS_PRICE;
        }

        console.log("Channel Open amount " + amountInCogs + " expiration " + this.state.ocexpiration)
        mpeInstance.openChannel.estimateGas(this.props.userAddress, recipientaddress, groupIDBytes, amountInCogs, this.state.ocexpiration, (err, estimatedGas) =>
        {
          if(err) {
            estimatedGas = DEFAULT_GAS_ESTIMATE
            //this.processChannelErrors(err,"Unable to invoke the channelExtendAndAddFunds method");
          }

          mpeInstance.openChannel(this.props.userAddress, recipientaddress, groupIDBytes, amountInCogs, this.state.ocexpiration, {
            gas: estimatedGas, gasPrice: gasPrice
          }, (error, txnHash) => {
            if(error) {
              this.processChannelErrors(error,"Unable to invoke the openChannel method");
            }
            else {
              console.log("depositAndOpenChannel opened is TXN Has : " + txnHash);
              this.onOpenchaining()
              this.props.network.waitForTransaction(txnHash).then(receipt => {
                  console.log('Opened channel and deposited ' + AGI.toDecimal(this.state.ocvalue) + ' from: ' + this.props.userAddress);
                }).then(() => {
                  this.getChannelDetails(mpeInstance,startingBlock, recipientaddress);
                })
                .catch((error) => {
                  this.processChannelErrors(error,"Open channel failed.");
                });
              }
          });
        });
      });
    }

    processChannelErrors(error, message) {
      console.log(message + " " + error);
      this.setState({depositopenchannelerror: error})
      this.onClosechaining();
    }

    getChannelDetails(mpeInstance,startingBlock, recipientaddress) {
      console.log("Scanning events from " + startingBlock);
      var evt = mpeInstance.ChannelOpen({
        sender: this.props.userAddress
      }, {
        fromBlock: startingBlock,
        toBlock: 'latest'
      });
      evt.watch((error, result) => {
        if (error) {
          this.processChannelErrors(error,"Reading event for channel open failed with error");
        } else {
          this.channelHelper.matchEvent(evt, result, this.props.userAddress, this.channelHelper.getGroupId(), recipientaddress);
          if(typeof this.channelHelper.getChannelId() !== 'undefined') {
            this.nextJobStep();
          }
        }
      });
    }

    onCloseJobDetailsSlider(){
      this.setState({ jobDetailsSliderOpen: false });
    }

    onMaximizeJobDetailsSlider(){
      this.setState({ sliderWidth: '1550px'});
    }

    onMinimizeJobDetailsSlider(){
      this.setState({ sliderWidth: '550px'});
    }

    onKeyPressvalidator(event) {
      const keyCode = event.keyCode || event.which;
      if (!(keyCode == 8 || keyCode == 46) && (keyCode < 48 || keyCode > 57)) {
        event.preventDefault()
      } else {
        let dots = event.target.value.split('.');
        if (dots.length > 1 && keyCode == 46)
          event.preventDefault()
      }
    }

    handleChangeTabs (event, valueTab) {
      this.setState({ valueTab });
    }

    onOpenJobDetails(data,dataservicestatus) {
      (data.hasOwnProperty('tags'))?this.setState({tagsall:data["tags"]}):this.setState({tagsall:[]})
      //this.setState({serviceState:data})
      this.serviceState = data;
      this.setState({modalservicestatus:dataservicestatus})
      this.setState({jobDetailsSliderOpen: true });
      this.setState({expiryBlockNumber:10000})
      this.setState({valueTab:0})
      this.setState({startjobfundinvokeres:false})
      this.setState({runjobstate:false})
      this.setState({depositopenchannelerror:''})
      if (typeof web3 === 'undefined' || typeof this.props.userAddress === 'undefined') {
        return;
      }

      console.log(JSON.stringify(this.serviceState))
      this.getCurrentBlockNumber();
      //disabled start job if the service is not up at all - unhealthy agent//
      dataservicestatus.map(row => {
        if (row["service_id"] === data["service_id"]) {
          if (row["is_available"] === 1) {
            this.setState({runjobstate: true});
            return;
          }
        }
      })
    }

  getCurrentBlockNumber() {
    //Update blocknumber
    this.props.network.getCurrentBlockNumber((blockNumber) => {
      this.currentBlockNumber = blockNumber
    })
    //return last seen blocknumber
    return this.currentBlockNumber;
  }

  onOpenEscrowBalanceAlert() {
    this.setState({showEscrowBalanceAlert: true})
  }

  onCloseEscrowBalanceAlert() {
    this.setState({showEscrowBalanceAlert: false})
    this.onCloseJobDetailsSlider()
    this.props.history.push("/Profile")
  }
  
    render()
    {
      const {valueTab} = this.state;
      let CallComponent = this.serviceMappings.getComponent(this.serviceState["org_id"], this.serviceState["service_id"]);
        return(
            <React.Fragment>
            <div>
                <Modal style={ModalStylesAlertWait} open={this.state.openchaining} onClose={this.onClosechaining}>
                    <Slide direction="left" in={this.state.openchaining} mountonEnter unmountOnExit>
                        <React.Fragment>
                            <Typography compnent={ 'div'} style={{fontSize: "13px",lineHeight: "15px"}}>
                                <div className="row">
                                    <div className="col-sm-12 col-md-6 col-lg-6">
                                        Your transaction is being mined.
                                    </div>
                                    <div style={{ width: '50px' }} className="col-sm-12 col-md-6 col-lg-6">
                                        <CircularProgress backgroundpadding={6} styles={{ background: { fill: '#3e98c7', }, text: { fill: '#fff', }, path: { stroke: '#fff', }, trail: { stroke: 'transparent' }, }} />
                                    </div>
                                </div>
                            </Typography>
                        </React.Fragment>
                    </Slide>
                </Modal>
            </div>              
            <div>
                <Modal open={this.state.showEscrowBalanceAlert} onClose={this.onCloseEscrowBalanceAlert}>
                    <Slide direction="down" in={this.state.showEscrowBalanceAlert} mountOnEnter unmountOnExit>
                        <div style={ModalStylesAlert} className="container popover-wrapper search-panel">
                            <Typography component={ 'div'}>
                                <p style={{fontSize: "15px",fontFamily: "arial",color: "red"}}>The balance in your escrow account is 0. Please transfer money from wallet to escrow account to proceed.</p>
                                <div style={{textAlign: "center"}}>
                                    <Link to="/Profile">
                                    <input className='btn btn-primary' type='button' value='Go to Profile' />
                                    </Link>
                                </div>
                            </Typography>
                        </div>
                    </Slide>
                </Modal>
            </div>              
            <Modal open={this.state.jobDetailsSliderOpen} onClose={this.onCloseJobDetailsSlider}>
            <PerfectScrollbar>
              <Slide style={{width : this.state.sliderWidth}} direction="left" in={this.state.jobDetailsSliderOpen} mountOnEnter unmountOnExit>
                <div className="sidebar">
                    <div style={{fontSize: "50px",textAlign: "right"}}>
                      <i className="fas fa-window-minimize" onClick={this.onMinimizeJobDetailsSlider} style={{color: "black",fontSize: "20px",border: "none",cursor: "pointer"}}></i>
                      <i className="fas fa-window-maximize" onClick={this.onMaximizeJobDetailsSlider} style={{color: "black",fontSize: "20px",border: "none",cursor: "pointer"}}></i>
                      <i className="fas fa-window-close" onClick={this.onCloseJobDetailsSlider} style={{color: "black",fontSize: "20px",border: "none",cursor: "pointer"}}></i>
                    </div>
                    <Typography component={ 'div'}>
                        <div className="right-panel agentdetails-sec p-3 pb-5">
                            <div className="col-xs-12 col-sm-12 col-md-12 name no-padding">
                                <h3>{this.serviceState["service_id"]} </h3>
                                <p> {this.state.tagsall.map(rowtags =>
                                    <button type="button" className="btn btn-secondary mrb-10 ">{rowtags}</button>)}</p>
                                <div className="text-right border-top1">
                                    {(this.state.runjobstate === true) ?
                                    <button type="button" className="btn-start" onClick={()=> this.startjob()}>Start Job</button>
                                    :
                                    <button type="button" className="btn-start-disabled" disabled>Start Job</button>
                                    }
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-12 col-md-12 funds no-padding">
                                <i className="up"></i>
                                <div className="servicedetailstab">
                                <Tabs value={valueTab} onChange={(event,valueTab)=>this.handleChangeTabs(event,valueTab)} indicatorColor='primary'>
                                    <Tab disabled={(!this.state.startjobfundinvokeres)} label={<span className="funds-title">Fund</span>}/>
                                    <Tab disabled={(!this.state.startjobfundinvokeres)} label={<span className="funds-title">Invoke</span>}/>
                                    <Tab disabled={(!this.state.startjobfundinvokeres)} label={<span className="funds-title">Result</span>} />
                                </Tabs>
                                    { valueTab === 0 &&
                                    <TabContainer>
                                        { (this.state.startjobfundinvokeres)?
                                        <div className="row channels-sec">
                                            <div className="col-xs-12 col-sm-2 col-md-2 mtb-10">Amount:</div>
                                            <div className="col-xs-12 col-sm-4 col-md-4">
                                                <input type="text" className="chennels-amt-field" value={this.state.ocvalue} onChange={this.changeocvalue} onKeyPress={(e)=>this.onKeyPressvalidator(e)} />
                                            </div>
                                            <div className="col-xs-12 col-sm-2 col-md-2 mtb-10">Expiration:</div>
                                            <div className="col-xs-12 col-sm-4 col-md-4">
                                                <input type="text" className="chennels-amt-field" value={this.state.ocexpiration} onChange={this.changeocexpiration} />
                                            </div>
                                            <div className="col-xs-12 col-sm-12 col-md-12 text-right mtb-10 no-padding">
                                                <button type="button" className="btn btn-primary width-mobile-100" onClick={()=>this.openchannelhandler()}>Reserve Funds</button>
                                            </div>
                                        </div>:
                                        <div className="row channels-sec-disabled">
                                            <div className="col-xs-12 col-sm-2 col-md-2 mtb-10">Amount:</div>
                                            <div className="col-xs-12 col-sm-4 col-md-4">
                                                <input type="text" className="chennels-amt-field" value={parseInt(this.serviceState["price_in_agi"])} disabled />
                                            </div>
                                            <div className="col-xs-12 col-sm-2 col-md-2 mtb-10">Expiration:</div>
                                            <div className="col-xs-12 col-sm-4 col-md-4">
                                                <input type="text" className="chennels-amt-field" value={this.state.ocexpiration} disabled />
                                            </div>
                                            <div className="col-xs-12 col-sm-12 col-md-12 text-right mtb-10 no-padding">
                                                <button type="button" className="btn btn-primary-disabled width-mobile-100" disabled>Reserve Funds</button>
                                            </div>
                                        </div>
                                        }

                                        <p style={{fontSize: "12px",color: "red"}}>{this.state.depositopenchannelerror!==''?ERROR_UTILS.sanitizeError(this.state.depositopenchannelerror):''}</p>
                                        <div className="row">
                                        <p style={{fontSize:"14px"}}>
                                        The first step in invoking the API is to open a payment. We need to add funds to the channel from the escrow and set the expiry block number. In this step we will open a channel or extend a pre-existing channel. You can view the channel details in the profile page
                                        </p>
                                        </div>
                                    </TabContainer>
                                    } {(valueTab === 1) &&
                                    <TabContainer>
                                      <React.Fragment>
                                        <CallComponent isComplete={false} serviceSpec={this.serviceSpecJSON} callApiCallback={this.handleJobInvocation}/>
                                      </React.Fragment>
                                      <div className="row">
                                        <p style={{fontSize:"14px"}}>Now that the channel has been funded you are able to call the API on the Agent. Agents take different inputs, so may have their own UI. Once you've provided inputs, click the "Invoke" button to initate the API call. This will prompt one further interaction with MetaMask to sign your API request before submitting the request to the Agent. This interaction does not initiate a transaction or transfer any additional funds.</p>
                                        </div>
                                    </TabContainer>
                                    } {(valueTab === 2) &&
                                    <TabContainer>
                                      { (this.state.grpcErrorOccurred)?
                                        <div>
                                           <p style={{fontSize: "13px"}}>Error: {this.state.grpcResponse}</p>
                                        </div>:
                                        <React.Fragment>
                                          <CallComponent isComplete={true} response={this.state.grpcResponse}/>
                                        </React.Fragment>
                                      }
                                      <div className="row">
                                       <p></p>
                                        <p style={{fontSize:"14px"}}>Your request has been completed. You can now vote for the agent below.</p>
                                        </div>
                                    </TabContainer>}
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-12 col-md-12 address no-padding">
                                <h3>User address</h3>
                                <div className="row">
                                    <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 text-center" style={{fontSize: "14px"}}>
                                        <a target="_blank" href={ 'https://kovan.etherscan.io/address/' + ((typeof web3 !=='undefined' )?web3.eth.coinbase: '')}>
                        {(typeof window.web3 !== 'undefined')?
                          (web3.eth.coinbase !== null)?FORMAT_UTILS.toHumanFriendlyAddressPreview(web3.eth.coinbase):null:null}
                            </a>
                                    </div>
                                    <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 text-center border-left-1">
                                        <p style={{fontSize: "14px"}}>{this.serviceState["org_id"]}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-12 col-md-12 vote no-padding">
                                <h3>Votes</h3>
                                <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 mobile-mtb-7">
                                    <div className="thumbsup-icon float-none">
                                        <div className="thumbsup-img">
                                        <a href="#"><img src="./img/like-img.png" style={{height: "50px",width: "70px"}} alt="ThumbsUp" onClick={()=>this.handleVote(this.serviceState["org_id"],this.serviceState["service_id"],true)} /></a></div>
                                    </div>
                                </div>
                                <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 border-left-1">
                                    <div className="thumbsdown-icon float-none">
                                    <a href="#"><img src="./img/dislike-img.png" style={{height: "50px",width: "70px"}} alt="ThumbsDown" onClick={()=>this.handleVote(this.serviceState["org_id"],this.serviceState["service_id"], false)}/></a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-12 col-md-12 jobcostpreview no-padding">
                                <h3>Job Cost Preview</h3>
                                <div className="col-xs-12 col-sm-12 col-md-12 no-padding">
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-light" style={{fontSize: "14px"}}>Current Price</div>
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter" style={{fontSize: "14px"}}> {this.serviceState["price_in_agi"]} AGI</div>
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-light" style={{fontSize: "14px"}}>Price Model</div>
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter" style={{fontSize: "14px"}}>{this.serviceState["price_model"]}</div>
                                </div>
                            </div>
                        </div>
                    </Typography>
                </div>
              </Slide>
             </PerfectScrollbar>
            </Modal>
        </React.Fragment>
        )
    }
}
