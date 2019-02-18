import React, { props } from 'react';
import { grpcRequest, rpcImpl } from '../grpc.js'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Slide from '@material-ui/core/Slide'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { AGI, hasOwnDefinedProperty,getMarketplaceURL,getProtobufjsURL, ERROR_UTILS,DEFAULT_GAS_PRICE,DEFAULT_GAS_ESTIMATE, BLOCK_OFFSET, MESSAGES } from '../util'
import {TabContainer} from './ReactStyles.js';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import ServiceMappings from "./service/ServiceMappings.js"
import ChannelHelper from './ChannelHelper.js';
import { Root } from 'protobufjs'
import Vote from './Vote.js';
import DAppModal from './DAppModal.js'
import Tooltip from '@material-ui/core/Tooltip';
import {serviceStateJSON} from '../service_state'
import GRPCProtoV3Spec from "../models/GRPCProtoV3Spec";

const minSliderWidth='550px';
const maxSliderWidth ='100%';

export  class Jobdetails extends React.Component {
    constructor() {
      super(props)
      
      this.state = {
        tagsall:[],
        jobDetailsSliderOpen:false,
        ocvalue:0,
        ocexpiration:0,
        grpcResponse:undefined,
        grpcErrorOccurred:false,
        fundTabEnabled:false,
        depositopenchannelerror:'',
        valueTab:0,
        enableVoting:false,
        showModal:false,
        sliderWidth:minSliderWidth,
        showEscrowBalanceAlert:false,
      };

      this.chainMessage = "";
      this.serviceState = {};
      this.channelHelper = new ChannelHelper();
      this.currentBlockNumber = 0;
      this.serviceSpecJSON = undefined;
      this.protoSpec = undefined;
      this.serviceMappings = new ServiceMappings();
      this.onKeyPressvalidator = this.onKeyPressvalidator.bind(this);
      this.handleChangeTabs = this.handleChangeTabs.bind(this);
      this.onCloseJobDetailsSlider = this.onCloseJobDetailsSlider.bind(this);
      this.onResizeJobDetailsSlider = this.onResizeJobDetailsSlider.bind(this);
      this.changeocvalue = this.changeocvalue.bind(this);
      this.changeocexpiration = this.changeocexpiration.bind(this);
      this.openchannelhandler = this.openchannelhandler.bind(this);
      this.handleJobInvocation = this.handleJobInvocation.bind(this);
      this.startjob = this.startjob.bind(this);
      this.onOpenEscrowBalanceAlert = this.onOpenEscrowBalanceAlert.bind(this)
      this.onCloseEscrowBalanceAlert = this.onCloseEscrowBalanceAlert.bind(this)  
      this.onShowModal = this.onShowModal.bind(this)
      this.onCloseModal = this.onCloseModal.bind(this)  
      this.watchBlocknumberTimer = undefined;
    }

    watchBlocknumber() {
      this.props.network.getCurrentBlockNumber((blockNumber) => {
        this.currentBlockNumber = blockNumber
      })
    }

    componentWillUnmount() {
      if (this.watchBlocknumberTimer) {
        console.log("Clearing the watchblock timer")
        clearInterval(this.watchBlocknumberTimer);
      }
    }  

    nextJobStep() {
      this.onCloseModal()
      this.setState({valueTab:(this.state.valueTab + 1)})
    }

    reInitializeJobState() {
      this.setState({depositopenchannelerror: ""})
      this.setState({ocexpiration:(this.currentBlockNumber + this.serviceState['payment_expiration_threshold']+BLOCK_OFFSET)})
      this.setState({ocvalue:this.serviceState['price_in_agi']})
      const channelInfoUrl = getMarketplaceURL(this.props.chainId) +
                          'available-channels?user_address='+this.props.userAddress +
                          '&service_id='+this.serviceState["service_id"] +
                          '&org_id='+this.serviceState["org_id"];
      return this.channelHelper.reInitialize(channelInfoUrl);
    }

    fetchServiceSpec() {
      var caller = this;
      let _urlservicebuf = getProtobufjsURL(this.props.chainId) + this.serviceState["org_id"] + "/" + this.serviceState["service_id"];

      return fetch(encodeURI(_urlservicebuf))
        .then(serviceSpecResponse => serviceSpecResponse.json())
        .then(serviceSpec => new Promise(function(resolve) {
          const serviceSpecJSON = Root.fromJSON(serviceSpec[0]);
          caller.serviceSpecJSON = serviceSpecJSON;
          caller.protoSpec = new GRPCProtoV3Spec(serviceSpecJSON);
          resolve();
        }));
    }

    composeSHA3Message(types,values) {
      var ethereumjsabi = require('ethereumjs-abi');
      var sha3Message = ethereumjsabi.soliditySHA3(types, values);
      var msg = "0x" + sha3Message.toString("hex");
      return msg;
    }

    fetchChannelState(signed) {
      console.log("Found an existing channel " + JSON.stringify(this.serviceState));
      
      var caller = this;
      var stripped = signed.substring(2, signed.length)
      var byteSig = new Buffer(Buffer.from(stripped, 'hex'));
      console.log(byteSig.toString('base64'))
      const byteschannelID = Buffer.alloc(4);
      byteschannelID.writeUInt32BE(this.channelHelper.getChannelId(), 0);

      let requestObject   = ({"channelId":byteschannelID, "signature":byteSig})
      const requestHeaders = {}

      const packageName = 'escrow'
      const serviceName = 'PaymentChannelStateService'
      const methodName = 'GetChannelState'

      const Service = Root.fromJSON(serviceStateJSON).lookup(serviceName);
      const serviceObject = Service.create(rpcImpl(this.channelHelper.getEndpoint(), packageName, serviceName, methodName, requestHeaders), false, false)

      return new Promise(function(resolve, reject) {
        grpcRequest(serviceObject, methodName, requestObject)
        .then(response => {
          if(typeof response.currentSignedAmount !== 'undefined') {
            console.log("Setting currentSignedAmount " + response.currentSignedAmount);
            let buffer = Buffer.from(response.currentSignedAmount);
            const currentSignedAmount = buffer.readUIntBE(0, response.currentSignedAmount.length);
            if(typeof currentSignedAmount !== 'undefined') {
              caller.channelHelper.setCurrentSignedAmount(currentSignedAmount);

              const nonceBuffer = Buffer.from(response.currentNonce);
              caller.channelHelper.setNonce(nonceBuffer.readUIntBE(0, response.currentNonce.length));
              console.log("Nonce " + nonceBuffer.readUIntBE(0, response.currentNonce.length));
            }
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.log("GRPC call failed with error " + err);
          resolve(false);
        })
      });
    }

    seedDefaultValues(enableFundTab, valueTabIndex) {
      const suggstedExpiration = this.currentBlockNumber + this.serviceState['payment_expiration_threshold'] + BLOCK_OFFSET;
      this.setState({ocexpiration: suggstedExpiration});
      this.setState({ocvalue: this.serviceState['price_in_agi']});
      this.setState({fundTabEnabled: enableFundTab});
      this.setState({valueTab: valueTabIndex});
    }

    handleNewChannel(balance) {
      if (typeof balance !== 'undefined' && balance === 0) {
        this.onOpenEscrowBalanceAlert();
      } 
      else {
        this.seedDefaultValues(true,0);
      }
    }

    handleChannel(balance, channelAvailable,thresholdBlockNumber) {
      console.log("Got channel " + channelAvailable);
      this.onCloseModal();
      let selectedChannel = this.channelHelper.getChannel(this.channelHelper.getChannelId());
      if(channelAvailable) {
        const channelAmount = parseInt(this.channelHelper.getCurrentSignedAmount()) + 
                              parseInt(this.serviceState["price_in_cogs"]);
        if (parseInt(selectedChannel["balance_in_cogs"]) >= channelAmount 
          && parseInt(selectedChannel["expiration"]) >= thresholdBlockNumber) {
            this.seedDefaultValues(true, 1);
        }
        else {
          this.seedDefaultValues(true, 0);
          const suggstedExpiration = this.currentBlockNumber + this.serviceState['payment_expiration_threshold'] + BLOCK_OFFSET;
          console.log(suggstedExpiration + " " + this.channelHelper.getExpiryBlock())
          if(this.channelHelper.getExpiryBlock() > suggstedExpiration) {
            this.setState({ocexpiration: this.channelHelper.getExpiryBlock()});
          }
        }
      } 
      else {
        //We couldnt find a usable channel so create a new one
        this.channelHelper.setChannelId(undefined);
        this.handleNewChannel(balance);
      }
    }

    startjob() {
      var reInitialize = this.reInitializeJobState();
      var serviceSpec = this.fetchServiceSpec();
      Promise.all([reInitialize, serviceSpec]).then(() => {
        let mpeTokenInstance = this.props.network.getMPEInstance(this.props.chainId);
        mpeTokenInstance.balances(this.props.userAddress, (err, balance) => {
          if(err) {
            this.processChannelErrors("Unable to retrieve balance. Please retry with a higher gas")
            return;
          }
          if(typeof balance !== 'undefined') {
                balance = parseInt(balance)
          }
          
          const threshold = this.currentBlockNumber + this.serviceState['payment_expiration_threshold'];
          let foundChannel = this.channelHelper.findExistingChannel(this.serviceState, threshold);
          if (foundChannel) {
            this.onShowModal(MESSAGES.WAIT_FOR_MM);
            //We have a channel, lets check if this channel can make this call by getting the channel service state
            //from the daemon. The daemon will return the last amount which was signed by client
            var msg = this.composeSHA3Message(["uint256"],[this.channelHelper.getChannelId()]);
            window.ethjs.personal_sign(msg, web3.eth.defaultAccount)
            .then((signed) => {
              this.onShowModal(MESSAGES.WAIT_FOR_CHANNEL_STATE);
              this.fetchChannelState(signed).then(channelAvailable => 
                this.handleChannel(balance, channelAvailable, threshold));
            }).catch(error => {
              this.processChannelErrors(error);
              this.setState({fundTabEnabled: false});
            });
          } 
          else {
            this.handleNewChannel(balance);
          }
        });
      });
    }

    handleJobInvocation(serviceName, methodName, requestObject) {
      this.onShowModal(MESSAGES.WAIT_FOR_MM)
      var nonce = this.channelHelper.getNonce(0);
      let channelPrice = parseInt(this.serviceState["price_in_cogs"]) + 
                         parseInt(this.channelHelper.getCurrentSignedAmount());

      var msg = this.composeSHA3Message(["address", "uint256", "uint256", "uint256"],
      [this.props.network.getMPEAddress(this.props.chainId), parseInt(this.channelHelper.getChannelId()), parseInt(nonce), parseInt(channelPrice)]);

      this.setState({grpcResponse: undefined})
      this.setState({grpcErrorOccurred: false})
      
      window.ethjs.personal_sign(msg, this.props.userAddress)
        .then((signed) => {
          this.onShowModal(MESSAGES.WAIT_FOR_RESPONSE)
          var stripped = signed.substring(2, signed.length)
          var byteSig = Buffer.from(stripped, 'hex');
          let buff = new Buffer(byteSig);
          let base64data = buff.toString('base64')

          const requestHeaders = {
            "snet-payment-type": "escrow",
            "snet-payment-channel-id": parseInt(this.channelHelper.getChannelId()),
            "snet-payment-channel-nonce": parseInt(nonce),
            "snet-payment-channel-amount": channelPrice,
            "snet-payment-channel-signature-bin": base64data
          }

          console.log("Headers " + JSON.stringify(requestHeaders))
          const packageName = Object.keys(this.serviceSpecJSON.nested).find(key =>
            typeof this.serviceSpecJSON.nested[key] === "object" &&
            hasOwnDefinedProperty(this.serviceSpecJSON.nested[key], "nested")
          )
          var endpointgetter = this.channelHelper.getEndpoint();
          console.log("Invoking service with package " + packageName + " serviceName " + serviceName + " methodName " + methodName + " endpoint " + endpointgetter);
          if (!endpointgetter.startsWith("http")) {
            endpointgetter = "http://" + endpointgetter;
          }

          const Service = this.serviceSpecJSON.lookup(serviceName)
          const serviceObject = Service.create(rpcImpl(endpointgetter, packageName, serviceName, methodName, requestHeaders), false, false)
          grpcRequest(serviceObject, methodName, requestObject)
            .then(response => {
              console.log("Got a GRPC response " + JSON.stringify(response))
              this.setState({grpcResponse: response})
              this.setState({enableVoting: true})
              this.nextJobStep();
              this.setState({fundTabEnabled: false});
            })
            .catch((err) => {
              console.log("GRPC call failed with error " + JSON.stringify(err));
              this.setState({grpcResponse: JSON.stringify(err)});
              this.setState({grpcErrorOccurred: true})
              this.setState({enableVoting: true})
              this.nextJobStep();
              this.setState({fundTabEnabled: false});
            })

            return window.ethjs.personal_ecRecover(msg, signed);
        });
    }

    onCloseModal() {
      this.chainMessage = "";
      this.setState({showModal:false});
    }
  
    onShowModal(message) {
      this.chainMessage = message;
      this.setState({showModal:true})
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

        if (typeof this.channelHelper.getChannels() === 'undefined') {
          this.onOpenEscrowBalanceAlert()
        } else {
          const threshold = this.currentBlockNumber + this.serviceState['payment_expiration_threshold'];
          if(this.state.ocexpiration < threshold) {
            this.processChannelErrors("Block number provided should be greater than " + threshold + " for the service to accept the request");
            return;
          }
        
          let groupIDBytes = atob(this.channelHelper.getGroupId());
          let recipientaddress = this.channelHelper.getRecipient();

          if (typeof this.channelHelper.getChannelId() !== 'undefined') {
            let selectedChannel = this.channelHelper.getChannel(this.channelHelper.getChannelId());
            console.log("Found an existing channel, will try to extend it " + JSON.stringify(selectedChannel));
            if(this.state.ocexpiration < selectedChannel["expiration"]) {
              this.processChannelErrors("The payment channel being used has the expiry block set to "+ selectedChannel["expiration"] +" which cannot be reduced. Provide a value equal to or greater than " + selectedChannel["expiration"]);
              return;
            }
            this.channelExtend(mpeInstance, selectedChannel, amountInCogs);
          } 
          else {
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
      const channelAmount = parseInt(this.channelHelper.getCurrentSignedAmount()) + 
                            parseInt(this.serviceState["price_in_cogs"]);
      const newBalance = parseInt(rrchannel['balance_in_cogs']) + amountInCogs;
      console.log("Channel " + channelAmount + " New Balance " + newBalance);
      if( newBalance < channelAmount) {
        this.processChannelErrors("Add " + AGI.inAGI(channelAmount - newBalance) + " or more tokens to the channel to allow this call. The channel has " + AGI.inAGI(rrchannel['balance_in_cogs'] - this.channelHelper.getCurrentSignedAmount()) + " available tokens currently");
        return;
      }

      web3.eth.getGasPrice((err, gasPrice) => {
        if(err) {
          gasPrice = DEFAULT_GAS_PRICE;
        }

        mpeInstance.channelExtendAndAddFunds.estimateGas(rrchannel["channelId"], this.state.ocexpiration, amountInCogs, (err, estimatedGas) =>
        {
          console.log("Estimation for channel extend " + estimatedGas)
          if(err) {
            estimatedGas = DEFAULT_GAS_ESTIMATE
          }
          this.onShowModal(MESSAGES.WAIT_FOR_MM);
          mpeInstance.channelExtendAndAddFunds(rrchannel["channelId"], this.state.ocexpiration, amountInCogs, {
            gas: estimatedGas,
            gasPrice: gasPrice
          }, (error, txnHash) => {
            if(error) {
              this.processChannelErrors(error,"Unable to invoke the channelExtendAndAddFunds method");
            }
            else {
              console.log("Channel extended and added funds is TXN Has : " + txnHash);
              this.onShowModal(MESSAGES.WAIT_FOR_TRANSACTION);
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
      if(amountInCogs < this.serviceState['price_in_cogs']) {
        this.processChannelErrors("Amount added should be greater than " + this.serviceState['price_in_cogs']);
        return;
      }

      var startingBlock = this.currentBlockNumber;
      console.log("Reading events from " + startingBlock);

      web3.eth.getGasPrice((err, gasPrice) => {
        if(err) {
          gasPrice = DEFAULT_GAS_PRICE;
        }

        mpeInstance.openChannel.estimateGas(this.props.userAddress, recipientaddress, groupIDBytes, amountInCogs, this.state.ocexpiration, (err, estimatedGas) =>
        {
          console.log("Estimation for channel open " + estimatedGas)
          if(err) {
            estimatedGas = DEFAULT_GAS_ESTIMATE
          }

          this.onShowModal(MESSAGES.WAIT_FOR_MM);
          mpeInstance.openChannel(this.props.userAddress, recipientaddress, groupIDBytes, amountInCogs, this.state.ocexpiration, {
            gas: estimatedGas, gasPrice: gasPrice
          }, (error, txnHash) => {
            if(error) {
              this.processChannelErrors(error,"Unable to invoke the openChannel method");
            }
            else {
              console.log("depositAndOpenChannel opened is TXN Has : " + txnHash);
              this.onShowModal(MESSAGES.WAIT_FOR_TRANSACTION)
              this.props.network.waitForTransaction(txnHash).then(receipt => {
                  console.log('Opened channel and deposited ' + AGI.toDecimal(this.state.ocvalue) + ' from: ' + this.props.userAddress);
                }).then(() => {
                  this.onShowModal(MESSAGES.WAIT_FOR_NEW_CHANNEL);
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
      this.onCloseModal();
    }

    getChannelDetails(mpeInstance,startingBlock, recipientaddress) {
      console.log("Reading events from " + startingBlock + " for " + this.props.userAddress);
      var evt = mpeInstance.ChannelOpen({
        sender: this.props.userAddress
      }, {
        fromBlock: startingBlock,
        toBlock: 'latest'
      });

      console.log("Starting to listen")
      evt.watch((error, result) => {
        if (error) {
          this.processChannelErrors(error,"Reading event for channel open failed with error");
        } else {
          console.log("Starting matching of events");
          this.channelHelper.matchEvent(evt, result, this.props.userAddress, this.channelHelper.getGroupId(), recipientaddress);
          if(typeof this.channelHelper.getChannelId() !== 'undefined') {
            this.nextJobStep();
          }
        }
      });
    }

    onCloseJobDetailsSlider(){
      this.setState({ jobDetailsSliderOpen: false });
      if (this.watchBlocknumberTimer) {
        console.log("Clearing the watchblock timer")
        clearInterval(this.watchBlocknumberTimer);
        this.watchBlocknumberTimer=undefined
      }
    }

    onResizeJobDetailsSlider(){
      const newWidth = this.state.sliderWidth === minSliderWidth ? maxSliderWidth : minSliderWidth;
      this.setState({ sliderWidth: newWidth});
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

    onOpenJobDetails(data) {
      (data.hasOwnProperty('tags'))?this.setState({tagsall:data["tags"]}):this.setState({tagsall:[]})
      this.serviceState = data;
      this.setState({jobDetailsSliderOpen: true });
      this.seedDefaultValues(false,0);
            
      this.setState({enableVoting: false})
      this.setState({runjobstate:false})
      this.setState({depositopenchannelerror:''})
      if (typeof web3 === 'undefined' || typeof this.props.userAddress === 'undefined') {
        return;
      }

      if(typeof watchBlocknumberTimer === 'undefined') {
        console.log("Setting the watchblock timer")
        this.watchBlocknumberTimer = setInterval(() => this.watchBlocknumber(), 500);
      }
      this.setState({runjobstate: (data["is_available"] === 1)});
        this.props.network.getCurrentBlockNumber((blockNumber) => {
            this.currentBlockNumber = blockNumber
            this.setState({ocexpiration:(this.currentBlockNumber + this.serviceState['payment_expiration_threshold']+ BLOCK_OFFSET)})
        })
    }

  onOpenEscrowBalanceAlert() {
    this.setState({showEscrowBalanceAlert: true})
  }

  onCloseEscrowBalanceAlert() {
    this.setState({showEscrowBalanceAlert: false})
    this.onCloseJobDetailsSlider()
    this.props.history.push("/Account")
  }
  
    render()
    {
      const {valueTab} = this.state;
      let CallComponent = this.serviceMappings.getComponent(this.serviceState["org_id"], this.serviceState["service_id"]);
        return(
            <React.Fragment>
            <div>
                <DAppModal open={this.state.showModal} message={this.chainMessage} showProgress={true}/>
            </div>              
            <div>
              <DAppModal open={this.state.showEscrowBalanceAlert} message={MESSAGES.ZERO_ESCROW_BALANCE} showProgress={false} link={"/Account"} linkText="Deposit"/>
            </div>              
            <Modal open={this.state.jobDetailsSliderOpen} onClose={this.onCloseJobDetailsSlider}>
              <Slide style={{width : this.state.sliderWidth}} direction="left" in={this.state.jobDetailsSliderOpen} mountOnEnter unmountOnExit>
                <div className="sidebar">
                  <PerfectScrollbar>
                    <div style={{paddingRight:"11px", fontSize: "30px",textAlign: "right"}}>
                      <i className={this.state.sliderWidth === minSliderWidth ?
                        "fas fa-window-maximize mini-maxi-close":
                        "fas fa-window-minimize mini-maxi-close" }
                         onClick={this.onResizeJobDetailsSlider}></i>
                      <i className="fas fa-window-close mini-maxi-close" onClick={this.onCloseJobDetailsSlider}></i>
                    </div>
                    <Typography component={ 'div'} style={{fontFamily: "Muli"}}>
                        <div className="right-panel agentdetails-sec p-3 pb-5" style={{paddingRight:"11px"}}>
                            <div className="col-xs-12 col-sm-12 col-md-12 jobcostpreview no-padding">
                                <h3>{this.serviceState["display_name"]} </h3>
                                <div className="job-details-tag-align">
                                    {this.state.tagsall.map((rowtags,rindex) =>
                                        <label key={rindex} className='job-details-tag mr-15'>{rowtags}</label>)}
                                </div>
                                <div className="col-xs-12 col-sm-12 col-md-12 no-padding">
                                    <div className="col-xs-12 col-sm-12 col-md-12 no-padding job-description">
                                     {this.serviceState["description"]}
                                    </div>
                                    <div className="job-details-url">
                                      <a target="_blank" href={this.serviceState["url"]}>{this.serviceState["url"]}</a>
                                    </div>
                                </div>

                                <div className="col-xs-12 col-sm-12 col-md-12 jobcostpreview no-padding">
                                <h3>Job Cost Preview</h3>
                                <div className="col-xs-12 col-sm-12 col-md-12 no-padding">
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-light">Current Price</div>
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter" > {this.serviceState["price_in_agi"]} AGI</div>
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-light">Price Model</div>
                                    <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter">{this.serviceState["price_model"]}</div>
                                </div>
                            </div>
                                <div className="col-xs-12 col-sm-12 col-md-12 text-center border-top1">                              
                                    {(this.state.runjobstate) ?
                                    <button type="button" className="btn-primary" onClick={()=> this.startjob()}>Start Job</button>
                                    :
                                        <div className="job-details-unavailable">
                                            Service is currently unavailable. Please try later.
                                        </div>
                                    }
                                </div>
                            </div>
                            {(this.state.runjobstate) ?
                            <div className="col-xs-12 col-sm-12 col-md-12 funds no-padding">
                                <i className="up"></i>
                                <div className="servicedetailstab">
                                <Tabs value={valueTab} onChange={(event,valueTab)=>this.handleChangeTabs(event,valueTab)} indicatorColor='primary'>
                                    <Tab disabled={(!this.state.fundTabEnabled) || valueTab !== 0} label={<span className="funds-title">Fund</span>}/>
                                    <Tab disabled={(!this.state.fundTabEnabled || valueTab !== 1)} label={<span className="funds-title">Invoke</span>}/>
                                    <Tab disabled={(!this.state.fundTabEnabled || valueTab !== 2)} label={<span className="funds-title">Result</span>} />
                                </Tabs>
                                    { valueTab === 0 &&
                                    <TabContainer>
                                        
                                        <div className={(this.state.fundTabEnabled)? "row channels-sec" : "row channels-sec-disabled"}>
                                          <div className="col-md-12 no-padding mtb-10">
                                            <div className="col-xs-12 col-md-12 no-padding"> 
                                              <div className="col-xs-5 col-sm-8 col-md-8 mtb-10 amt-label">Amount:
                                                <Tooltip title={<span style={{ fontSize: "13px", lineHeight: "18px"}}>
                                                  Tokens to be added to the channel to make the call</span>} >
                                                  <i className="fa fa-info-circle info-icon" aria-hidden="true"></i>
                                                </Tooltip>                                            
                                              </div>
                                            <div className="col-xs-7 col-sm-4 col-md-4">
                                              <input type="text" className="chennels-amt-field" value={this.state.ocvalue} onChange={this.changeocvalue} onKeyPress={(e)=>this.onKeyPressvalidator(e)} 
                                                disabled={!this.state.fundTabEnabled}/>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="col-xs-12 col-md-12 no-padding"> 
                                          <div className="col-xs-5 col-sm-8 col-md-8 mtb-10 expiry-block-no-label">Expiry Blocknumber:
                                            <Tooltip title={<span style={{ fontSize: "13px", lineHeight: "18px"}}>
                                                Expiry in terms of Ethereum block number. The channel becomes eligible for you to reclaim funds once the Ethereum block number exceeds the provided number. Do note that for agents to accept your channel the expiry block number should be sufficiently ahead of the current block number. In general agents will only accept your request if the expiry block number is atleast a full day ahead of the current block number. </span>} >
                                                <i className="fa fa-info-circle info-icon" aria-hidden="true"></i>
                                            </Tooltip>       
                                          </div>            
                                          <div className="col-xs-7 col-sm-4 col-md-4 expiry-block-no-input">
                                            <input type="text" className="chennels-amt-field" value={this.state.ocexpiration} onChange={this.changeocexpiration} disabled={!this.state.fundTabEnabled}/>
                                          </div>
                                        </div>
                                        <div className="col-xs-12 col-sm-12 col-md-12 text-right mtb-10 no-padding">
                                          <button type="button" className={this.state.fundTabEnabled?"btn btn-primary width-mobile-100":"btn btn-primary-disabled width-mobile-100"} onClick={()=>this.openchannelhandler()}
                                                        disabled={!this.state.fundTabEnabled}>Reserve Funds</button>
                                        </div>
                                      </div>

                                        <p className="job-details-error-text">{this.state.depositopenchannelerror!==''?ERROR_UTILS.sanitizeError(this.state.depositopenchannelerror):''}</p>
                                        <div className="row">
                                        <div className="fund-details">
                                        {this.state.fundTabEnabled ?
                                          (typeof this.channelHelper.getChannelId() === 'undefined') ?
                                           "The default values provided are for one call. To open a chanel, please add tokens based on the number of calls you wish to make. This will optimize any blockchain operations to extend a channel if needed. "
                                          :"The default values provided are for one call. Any existing channels will be reused. Please add tokens based on the number of calls you wish to make. This will optimize any blockchain operations to extend a channel if needed."
                                          : 
                                          "The first step in invoking the API is to open a payment channel. The System attempt to resuse any existing channel. If no channels are found a new one will be created. This step involves interactions with MetaMask."
                                        }
                                        </div>
                                        </div>
                                    </TabContainer>
                                    } {(valueTab === 2 || valueTab === 1) &&
                                      <TabContainer>
                                        { (valueTab === 2 && this.state.grpcErrorOccurred)?
                                          <div>
                                             <p className="job-details-error-text">Error: {this.state.grpcResponse}</p>
                                          </div>:
                                          <React.Fragment>
                                            <CallComponent isComplete={valueTab === 2} serviceSpec={this.serviceSpecJSON} callApiCallback={this.handleJobInvocation} response={this.state.grpcResponse} sliderWidth={this.state.sliderWidth} protoSpec={this.protoSpec} />
                                          </React.Fragment>
                                        }
                                        <div className="row">
                                         <p></p>
                                         {(valueTab === 2) ?
                                          <div className="fund-details">Your request has been completed. You can now vote for the agent below.
                                          </div> :
                                          <div className="fund-details">Click the "Invoke" button to initate the API call. This will prompt one further interaction with MetaMask to sign your API request before submitting the request to the Agent. This interaction does not initiate a transaction or transfer any additional funds.
                                          </div>
                                         }
                                          </div>
                                      </TabContainer>}
                                </div>
                            </div>
                                : null }
                            <Vote chainId={this.props.chainId} enableVoting={this.state.enableVoting} serviceState={this.serviceState} userAddress={this.props.userAddress}/>
                        </div>
                    </Typography>
                  </PerfectScrollbar>
                </div>
              </Slide>
            </Modal>
        </React.Fragment>
        )
    }
}
