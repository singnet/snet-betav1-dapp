import React, { props } from 'react';
import { grpcRequest, rpcImpl } from '../grpc.js'
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Slide from '@material-ui/core/Slide'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { AGI, hasOwnDefinedProperty,getMarketplaceURL,getProtobufjsURL, ERROR_UTILS,DEFAULT_GAS_PRICE,DEFAULT_GAS_ESTIMATE, BLOCK_OFFSET } from '../util'
import {TabContainer} from './ReactStyles.js';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import ServiceMappings from "./service/ServiceMappings.js"
import ChannelHelper from './ChannelHelper.js';
import { Root } from 'protobufjs'
import Vote from './Vote.js';
import DAppModal from './DAppModal.js'
import Tooltip from '@material-ui/core/Tooltip';


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
        openchaining:false,
        sliderWidth:'550px',
        showEscrowBalanceAlert:false,
      };

      this.serviceState = {};
      this.channelHelper = new ChannelHelper()
      this.currentBlockNumber = 0
      this.serviceSpecJSON = undefined  
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
      this.onOpenEscrowBalanceAlert = this.onOpenEscrowBalanceAlert.bind(this)
      this.onCloseEscrowBalanceAlert = this.onCloseEscrowBalanceAlert.bind(this)  
      this.onOpenchaining = this.onOpenchaining.bind(this)
      this.onClosechaining = this.onClosechaining.bind(this)  
      this.watchBlocknumberTimer = undefined;
    }

    watchBlocknumber() {
      //Update blocknumber
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
      this.onClosechaining()
      this.setState({valueTab:(this.state.valueTab + 1)})
      console.log("Job step " + this.state.valueTab);
    }

    reInitializeJobState() {
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
          caller.serviceSpecJSON = Root.fromJSON(serviceSpec[0])
          resolve();
        }));
    }

    startjob() {
      var reInitialize = this.reInitializeJobState();
      var serviceSpec = this.fetchServiceSpec();
      Promise.all([reInitialize, serviceSpec]).then(() => {
        let mpeTokenInstance = this.props.network.getMPEInstance(this.props.chainId);
        mpeTokenInstance.balances(this.props.userAddress, (err, balance) => {
          balance = AGI.inAGI(balance);
          console.log("In start job Balance is " + balance + " job cost is " + this.serviceState['price_in_agi']);
          if (typeof balance !== 'undefined' && balance === 0) {
            this.onOpenEscrowBalanceAlert();
          } 
          else {
            //console.log("Checking channels " + JSON.stringify(this.channelHelper));
            this.setState({ocexpiration: (this.currentBlockNumber + this.serviceState['payment_expiration_threshold']+BLOCK_OFFSET)});
            this.setState({ocvalue: this.serviceState['price_in_agi']});
            this.setState({fundTabEnabled: true});
            this.setState({valueTab: 0});
          }
        });
      });
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
              console.log("Got a GRPC response " + JSON.stringify(response))
              this.setState({grpcResponse: response})
              this.setState({enableVoting: true})
              this.nextJobStep();
            })
            .catch((err) => {
              console.log("GRPC call failed with error " + JSON.stringify(err));
              this.setState({grpcResponse: JSON.stringify(err)});
              this.setState({grpcErrorOccurred: true})
              this.setState({enableVoting: true})
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
        if(this.state.ocexpiration <= this.currentBlockNumber) {
          //In case somebody left their slideout open for a really long time.
          this.currentBlockNumber + this.serviceState['payment_expiration_threshold']+ BLOCK_OFFSET;
        }
        
        console.log("MPE has balance but have to check if we need to open a channel or extend one.");
        console.log("group id is " + this.channelHelper.getGroupId())
        console.log("recipient address is " + recipientaddress)
        console.log('groupdidgetter hex is ' + groupIDBytes)
        console.log('Amount is ' + amountInCogs);
        console.log(this.state.ocexpiration);
        console.log(this.props.userAddress);

        var groupIDBytes = atob(this.channelHelper.getGroupId());
        var recipientaddress = this.channelHelper.getRecipient();
        console.log("Opening a new channel");
        this.channelOpen(mpeInstance, recipientaddress, groupIDBytes, amountInCogs);

        /*
        if (this.channelHelper.getChannels().length > 0) {
          var rrchannel = this.channelHelper.getChannels()[0];
          console.log("Found an existing channel, will try to extend it " + JSON.stringify(rrchannel));
          if(this.state.ocexpiration < rrchannel["expiration"]) {
            this.processChannelErrors("The payment channel being used has the expiry block set to "+ rrchannel["expiration"] +" which cannot be reduced. Provide a value equal to or greater than " + rrchannel["expiration"]);
            return;
          }
          this.channelExtend(mpeInstance, rrchannel, amountInCogs);
        } else {
          console.log("No Channel found to going to deposit from MPE and open a channel");
          this.channelOpen(mpeInstance, recipientaddress, groupIDBytes, amountInCogs);
        }*/
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
      var startingBlock = this.currentBlockNumber;
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
      if (this.watchBlocknumberTimer) {
        console.log("Clearing the watchblock timer")
        clearInterval(this.watchBlocknumberTimer);
        this.watchBlocknumberTimer=undefined
      }
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

    onOpenJobDetails(data) {
      (data.hasOwnProperty('tags'))?this.setState({tagsall:data["tags"]}):this.setState({tagsall:[]})
      //this.setState({serviceState:data})
      this.serviceState = data;
      this.setState({jobDetailsSliderOpen: true });
      this.setState({enableVoting: false})
      this.setState({ocvalue:this.serviceState['price_in_agi']})      
      this.setState({valueTab:0})
      this.setState({fundTabEnabled:false})
      this.setState({runjobstate:false})
      this.setState({depositopenchannelerror:''})
      if (typeof web3 === 'undefined' || typeof this.props.userAddress === 'undefined') {
        return;
      }

      if(typeof watchBlocknumberTimer === 'undefined') {
        console.log("Setting the watchblock timer")
        this.watchBlocknumberTimer = setInterval(() => this.watchBlocknumber(), 500);
      }
      this.setState({runjobstate: data["is_available"]});
      this.setState({ocexpiration:(this.currentBlockNumber + this.serviceState['payment_expiration_threshold']+ BLOCK_OFFSET)})
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
                <DAppModal open={this.state.openchaining} message={"Your transaction is being mined."} showProgress={true}/>
            </div>              
            <div>
              <DAppModal open={this.state.showEscrowBalanceAlert} message={"The balance in your escrow account is 0. Please transfer money from your wallet to the escrow account to proceed."} showProgress={false} link={"/Profile"} linkText="Deposit"/>
            </div>              
            <Modal open={this.state.jobDetailsSliderOpen} onClose={this.onCloseJobDetailsSlider}>
            <PerfectScrollbar>
              <Slide style={{width : this.state.sliderWidth}} direction="left" in={this.state.jobDetailsSliderOpen} mountOnEnter unmountOnExit>
                <div className="sidebar">
                    <div style={{fontSize: "30px",textAlign: "right"}}>
                      <i className="fas fa-window-minimize mini-maxi-close" onClick={this.onMinimizeJobDetailsSlider}></i>
                      <i className="fas fa-window-maximize mini-maxi-close" onClick={this.onMaximizeJobDetailsSlider}></i>
                      <i className="fas fa-window-close mini-maxi-close" onClick={this.onCloseJobDetailsSlider}></i>
                    </div>
                    <Typography component={ 'div'}>
                        <div className="right-panel agentdetails-sec p-3 pb-5">
                            <div className="col-xs-12 col-sm-12 col-md-12 name no-padding">
                                <h3>{this.serviceState["display_name"]} </h3>
                                <p> {this.state.tagsall.map(rowtags =>
                                    <button type="button" className="btn btn-secondary mrb-10 ">{rowtags}</button>)}</p>
                                <div className="col-xs-12 col-sm-12 col-md-12 address no-padding">
                                    <div className="col-xs-12 col-sm-12 col-md-12 no-padding job-details-text">
                                    {this.serviceState["description"]}
                                    </div>
                                    <div className="col-xs-12 col-sm-12 col-md-12 no-padding job-details-text">
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
                                    {(this.state.runjobstate === true) ?
                                    <button type="button" className="btn-primary" onClick={()=> this.startjob()}>Start Job</button>
                                    :
                                    <button type="button" className="btn-primary-disabled" disabled>Start Job</button>
                                    }
                                </div>
                            </div>
                            <div className="col-xs-12 col-sm-12 col-md-12 funds no-padding">
                                <i className="up"></i>
                                <div className="servicedetailstab">
                                <Tabs value={valueTab} onChange={(event,valueTab)=>this.handleChangeTabs(event,valueTab)} indicatorColor='primary'>
                                    <Tab disabled={(!this.state.fundTabEnabled) || valueTab === 1} label={<span className="funds-title">Fund</span>}/>
                                    <Tab disabled={(!this.state.fundTabEnabled || valueTab !== 1)} label={<span className="funds-title">Invoke</span>}/>
                                    <Tab disabled={(!this.state.fundTabEnabled || valueTab !== 2)} label={<span className="funds-title">Result</span>} />
                                </Tabs>
                                    { valueTab === 0 &&
                                    <TabContainer>
                                        
                                        <div className={(this.state.fundTabEnabled)? "row channels-sec" : "row channels-sec-disabled"}>
                                        <div className="col-md-12 no-padding mtb-10">
                                        <div className="col-md-12 no-padding"> 
                                            <div className="col-xs-12 col-sm-2 col-md-8 mtb-10">Amount:
                                            <Tooltip title={<span style={{ fontSize: "13px", lineHeight: "18px"}}>
                                                Tokens to be added to the channel to make the call</span>} >
                                                <i className="fa fa-info-circle info-icon" aria-hidden="true"></i>
                                            </Tooltip>                                            
                                            </div>
                                            <div className="col-xs-12 col-sm-4 col-md-4">
                                                <input type="text" className="chennels-amt-field" value={this.state.ocvalue} onChange={this.changeocvalue} onKeyPress={(e)=>this.onKeyPressvalidator(e)} 
                                                 disabled={true}/>
                                            </div>
                                            </div>
                                            </div>
                                            <div className="col-md-12 no-padding"> 
                                            <div className="col-xs-12 col-sm-2 col-md-8 mtb-10">Expiry Blocknumber:
                                            <Tooltip title={<span style={{ fontSize: "13px", lineHeight: "18px"}}>
                                                Expiry in terms of Ethereum block number. The channel becomes eligible for you to reclaim funds once the Ethereum block number exceeds the provided number. Do note that for agents to accept your channel the expiry block number should be sufficiently ahead of the current block number. In general agents will only accept your request if the expiry block number is atleast a full day ahead of the current block number. </span>} >
                                                <i className="fa fa-info-circle info-icon" aria-hidden="true"></i>
                                            </Tooltip>       
                                            </div>                                     
                                            <div className="col-xs-12 col-sm-4 col-md-4">
                                                <input type="text" className="chennels-amt-field" value={this.state.ocexpiration} onChange={this.changeocexpiration} disabled={true}/>
                                            </div>
                                            </div>
                                            <div className="col-xs-12 col-sm-12 col-md-12 text-right mtb-10 no-padding">
                                                <button type="button" className={this.state.fundTabEnabled?"btn btn-primary width-mobile-100":"btn btn-primary-disabled width-mobile-100"} onClick={()=>this.openchannelhandler()}
                                                        disabled={!this.state.fundTabEnabled}>Reserve Funds</button>
                                            </div>
                                            </div>

                                        <p className="job-details-error-text">{this.state.depositopenchannelerror!==''?ERROR_UTILS.sanitizeError(this.state.depositopenchannelerror):''}</p>
                                        <div className="row">
                                        <p className="job-details-text">
                                        The first step in invoking the API is to open a payment channel. We need to add funds to the channel from the escrow and set the expiry block number. In this step we will open a new channel. This will prompt an interaction with Metamask to initiate a transaction.
                                        </p>
                                        </div>
                                    </TabContainer>
                                    } {(valueTab === 1) &&
                                    <TabContainer>
                                      <React.Fragment>
                                        <CallComponent isComplete={false} serviceSpec={this.serviceSpecJSON} callApiCallback={this.handleJobInvocation}/>
                                      </React.Fragment>
                                      <div className="row">
                                        <p className="job-details-text">Click the "Invoke" button to initate the API call. This will prompt one further interaction with MetaMask to sign your API request before submitting the request to the Agent. This interaction does not initiate a transaction or transfer any additional funds.</p>
                                        </div>
                                    </TabContainer>
                                    } {(valueTab === 2) &&
                                    <TabContainer>
                                      { (this.state.grpcErrorOccurred)?
                                        <div>
                                           <p className="job-details-error-text">Error: {this.state.grpcResponse}</p>
                                        </div>:
                                        <React.Fragment>
                                          <CallComponent isComplete={true} response={this.state.grpcResponse}/>
                                        </React.Fragment>
                                      }
                                      <div className="row">
                                       <p></p>
                                        <p className="job-details-text">Your request has been completed. You can now vote for the agent below.</p>
                                        </div>
                                    </TabContainer>}
                                </div>
                            </div>
                            <Vote chainId={this.props.chainId} enableVoting={this.state.enableVoting} serviceState={this.serviceState} userAddress={this.props.userAddress}/>
                            

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
