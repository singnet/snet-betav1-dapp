import React from 'react'
import PropTypes from 'prop-types'
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles"
import Pagination from "material-ui-flat-pagination"
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Slide from '@material-ui/core/Slide'
import { Link,withRouter } from 'react-router-dom'
import { grpcRequest, rpcImpl } from '../grpc.js'
import { Root } from 'protobufjs'
import { AGI, generateUniqueID, hasOwnDefinedProperty,FORMAT_UTILS,ERROR_UTILS } from '../util'
import {postApi,getApi} from '../requests'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import CircularProgress from '@material-ui/core/CircularProgress'
import BlockchainHelper from "./BlockchainHelper.js"
import ChannelHelper from "./ChannelHelper.js"
import ExampleService from './service/ExampleService.js';
import DefaultService from './service/DefaultService.js';
import {Carddeckers} from './CardDeckers.js';

const exampleServiceID = generateUniqueID("snet","example-service");
const TabContainer = (props) => {
  return (
    <Typography component="div" style={{padding:"10px", height:"240px"}}>
      {props.children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
const ModalStylesAlertWait ={
  position:'absolute',
  borderRadius: 3,
  border: 5,
  backgroundColor:'white',
  fontSize:"13px",
  color: 'black',
  lineHeight:40,
  height: 100,
  width: 750,
  padding: '0 10px',
  boxShadow: '0 3px 5px 2px gray',
  top:150,
  left:350,
}
//Get modalstyles for alert//
const ModalStylesAlert ={
  position:'relative',
  borderRadius: 3,
  border: 5,
  color: 'white',
  lineHeight:40,
  height: 100,
  width: 750,
  padding: '0 10px',
  boxShadow: '0 3px 5px 2px gray',
  top:450,
  left:350,
}
const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  overrides: {
    MuiButton: {
      root: {
        background: 'white',
        borderRadius: 3,
        border: 0,
        color: 'white',
        height: 38,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px lightblue',
        fontFamily:"Segoe UI",
        fontSize:"12px",
      },
    },
  },
});
class SampleServices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      agents : [],
      healthMerged: false,
      offset:0,
      jobDetailsSliderOpen:false,
      searchBarOpen:false,
      openAlert:false,
      uservote:[],
      userservicestatus:[],
      modaluser:{},
      tagsall:[],
      searchterm:'',
      bestestsearchresults:[],
      besttagresult:[],
      togleprice: false,
      togleservicename:false,
      togglehealth:false,
      userAddress: undefined,
      modalservicestatus:[],
      ocvalue:0,
      ocexpiration:0,
      inputservicename:'',
      inputmethodname:'',
      inputservicejson:{},
      valueTab:0,
      servicegrpcresponse:undefined,
      openchaining:false,   
      startjobfundinvokeres:false,
      chainId: undefined,
      depositopenchannelerror:'',
      runjobstate:false,
      userkeepsvote:'',
    };
    this.serviceOrgIDToComponent = [];
    this.serviceOrgIDToComponent[exampleServiceID] = ExampleService
    this.serviceState = {
      serviceSpecJSON : undefined,
      uniqueID: undefined,
      price : undefined,
      channelHelper : new ChannelHelper()
    }
    this.network = new BlockchainHelper();
    this.account = undefined;
    this.onOpenJobDetailsSlider = this.onOpenJobDetailsSlider.bind(this)
    this.onCloseJobDetailsSlider = this.onCloseJobDetailsSlider.bind(this)
    this.onOpenSearchBar = this.onOpenSearchBar.bind(this)
    this.onCloseSearchBar = this.onCloseSearchBar.bind(this)
    /*this.changehandlerservicename = this.changehandlerservicename.bind(this)
    this.changehandlermethodname = this.changehandlermethodname.bind(this)
    this.changehandlerervicejson= this.changehandlerervicejson.bind(this)
    */
    this.handlesearch = this.handlesearch.bind(this)
    this.startjob = this.startjob.bind(this)
    this.CaptureSearchterm = this.captureSearchterm.bind(this)
    this.handlesearchbytag = this.handlesearchbytag.bind(this)
    this.handlepricesort = this.handlepricesort.bind(this)
    this.handleservicenamesort = this.handleservicenamesort.bind(this)
    this.handlehealthsort = this.handlehealthsort.bind(this)
    this.onOpenModalAlert = this.onOpenModalAlert.bind(this)
    this.onCloseModalAlert = this.onCloseModalAlert.bind(this)
    this.changeocvalue = this.changeocvalue.bind(this)
    this.changeocexpiration = this.changeocexpiration.bind(this)
    this.openchannelhandler = this.openchannelhandler.bind(this)
    this.handlesearchkeyup = this.handlesearchkeyup.bind(this)
    this.handlesearchclear = this.handlesearchclear.bind(this)
    this.onKeyPressvalidator = this.onKeyPressvalidator.bind(this)
    this.handleChangeTabs = this.handleChangeTabs.bind(this)
    this.handleJobInvocation = this.handleJobInvocation.bind(this)
    this.onOpenchaining = this.onOpenchaining.bind(this)
    this.onClosechaining = this.onClosechaining.bind(this)
    this.handleonvote = this.handleonvote.bind(this)
    this.handledownvote = this.handledownvote.bind(this)
    this.watchNetworkTimer = undefined;
  }
handleonvote(orgid,serviceid)
  {
  //this.setState({userAddress: web3.eth.coinbase});
  console.log(this.state.userAddress + "," + orgid + "," + serviceid)
  let _urlfetchvote = this.network.getMarketplaceURL(this.state.chainId) + 'vote'
  fetch(_urlfetchvote, {
      'mode': 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      method: 'POST',
      body: JSON.stringify(
       { vote:{
        user_address: this.state.userAddress,
        org_id:orgid,
        service_id:serviceid,
        up_vote:true,
        down_vote:false
      }})
    })
    .then(res => res.json())
    .then(data => this.setState({userkeepsvote: data}))
    .catch(err => console.log(err));
  }
handledownvote(orgid,serviceid)
  {
//this.setState({userAddress: web3.eth.coinbase});
let _urlfetchvote = this.network.getMarketplaceURL(this.state.chainId) + 'vote'
fetch(_urlfetchvote, {
    'mode': 'cors',
    headers: {
      "Content-Type": "application/json",
    },
    method: 'POST',
    body: JSON.stringify(
      {vote:{
      user_address: this.state.userAddress,
      org_id:orgid,
      service_id:serviceid,
      up_vote:false,
      down_vote:true
    }})
  })
  .then(res => res.json())
  .then(data => this.setState({userkeepsvote: data}))
  .catch(err => console.log(err));
  }
  onClosechaining() {
    this.setState({openchaining:false})
  }
  onOpenchaining() {
    this.setState({openchaining:true})
  }
  handleChangeTabs (event, valueTab) {
    this.setState({ valueTab });
  };
  watchNetwork() {
    this.network.getChainID((chainId) => {
      if (chainId !== this.state.chainId) {
        this.setState({ chainId: chainId });
        this.loadDetails();
      }
    });
  }
  handlesearchclear() {
    this.setState({searchterm: ''})
  }
  handlesearchkeyup(e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      this.handlesearch()
    }
  }
  changeocvalue(e) {
    this.setState({ocvalue: e.target.value})
  }
  changeocexpiration(e) {
    this.setState({ocexpiration: e.target.value})
  } 
  processChannelErrors(error, message) {
    console.log(message + " " + error);
    this.setState({depositopenchannelerror: error})
    this.onClosechaining();
  }
  openchannelhandler(data, dataservicestatus) {
    if (web3 === 'undefined') {
      return;
    }
    console.log("Reading events from ");
    this.setState({depositopenchannelerror: ''});
    let mpeInstance = this.network.getMPEInstance(this.state.chainId);
    var amountInCogs = AGI.inCogs(web3, this.state.ocvalue);

    console.log('channel object ' + this.serviceState.channelHelper.getEndpoint());
    if (typeof this.serviceState.channelHelper.getChannels() === 'undefined') {
      this.onOpenModalAlert()
    } else {
      console.log("MPE has balance but have to check if we need to open a channel or extend one.");
      var groupIDBytes = atob(this.serviceState.channelHelper.getGroupId());
      var recipientaddress = this.serviceState.channelHelper.getRecipient();
      console.log("group id is " + this.serviceState.channelHelper.getGroupId())
      console.log("recipient address is " + recipientaddress)
      console.log('groupdidgetter hex is ' + groupIDBytes)
      console.log('Amount is ' + amountInCogs);
      console.log(this.state.ocexpiration);
      console.log(this.state.userAddress);
      if (this.serviceState.channelHelper.getChannels().length > 0) {
        var rrchannel = this.serviceState.channelHelper.getChannels()[0];
        console.log("Found an existing channel, will try to extend it " + JSON.stringify(rrchannel));        
        this.channelExtend(mpeInstance, rrchannel, amountInCogs);
      } else {
        console.log("No Channel found to going to deposit from MPE and open a channel");
        this.channelOpen(mpeInstance, recipientaddress, groupIDBytes, amountInCogs);
      }
    }
  }
  channelOpen(mpeInstance, recipientaddress, groupIDBytes, amountInCogs) {
    var startingBlock = 900000;
    web3.eth.getBlockNumber((error, result) => {
      if (!error) {
        startingBlock = result;
      }
    });
    console.log("Reading events from " + startingBlock);
    mpeInstance.openChannel(this.state.userAddress, recipientaddress, groupIDBytes, amountInCogs, this.state.ocexpiration, {
      gas: 210000, gasPrice: 51
    }, (error, txnHash) => {
      if(error) {
        this.processChannelErrors(error,"Unable to invoke the openChannel method");
      }
      else {          
        console.log("depositAndOpenChannel opened is TXN Has : " + txnHash);
        this.onOpenchaining()
        this.network.waitForTransaction(txnHash).then(receipt => {
            console.log('Opened channel and deposited ' + AGI.toDecimal(this.state.ocvalue) + ' from: ' + this.state.userAddress);
          }).then(() => {
            this.getChannelDetails(mpeInstance,startingBlock, recipientaddress);
          })
          .catch((error) => {
            this.processChannelErrors(error,"Open channel failed.");
          });
        }
    }); 
  }
  getChannelDetails(mpeInstance,startingBlock, recipientaddress) {
    console.log("Scanning events from " + startingBlock);
    var evt = mpeInstance.ChannelOpen({
      sender: this.state.userAddress
    }, {
      fromBlock: startingBlock,
      toBlock: 'latest'
    });
    evt.watch((error, result) => {
      if (error) {
        this.processChannelErrors(error,"Reading event for channel open failed with error");
      } else {
        this.serviceState.channelHelper.matchEvent(evt, result, this.state.userAddress, this.serviceState.channelHelper.getGroupId(), recipientaddress);
        if(typeof this.serviceState.channelHelper.getChannelId() !== 'undefined') {
          this.nextJobStep();
        }
      }
    });
  }  
  channelExtend(mpeInstance, rrchannel, amountInCogs) {
    mpeInstance.channelExtendAndAddFunds(rrchannel["channelId"], this.state.ocexpiration, amountInCogs, {
      gas: 210000,
      gasPrice: 51
    }, (error, txnHash) => {
      if(error) {
        this.processChannelErrors(error,"Unable to invoke the channelExtendAndAddFunds method");
      }
      else {
        console.log("Channel extended and added funds is TXN Has : " + txnHash);
        this.onOpenchaining();
        this.network.waitForTransaction(txnHash).then(receipt => {
            this.serviceState.channelHelper.setChannelId(rrchannel["channelId"]);
            console.log('Re using channel ' + this.serviceState.channelHelper.getChannelId());
            this.nextJobStep();
          })
          .catch((error) => {
            this.processChannelErrors(error,"Channel extend failed with error");
          });
        }
    });
  }
  handlehealthsort() {
    if (!this.state.healthMerged) {
      for (var ii in this.state.agents) {
        for (var jj in this.state.userservicestatus) {
          if (this.state.agents[ii].service_id === this.state.userservicestatus[jj].service_id) {
            this.state.agents[ii].is_available = this.state.userservicestatus[jj].is_available;
            break;
          }
        }
      }
      this.state.healthMerged = true;
    }
    var healthSort = this.state.agents
    if (this.state.togglehealth === false) {
      healthSort.sort((a, b) => b.is_available - a.is_available)
      this.setState({
        togglehealth: true
      })
    } else if (this.state.togglehealth === true) {
      healthSort.sort((a, b) => a.is_available - b.is_available)
      this.setState({
        togglehealth: false
      })
    }
    this.setState({agents: healthSort});
  }

  handlepricesort() {
    var pricesort = this.state.agents
    if (this.state.togleprice === false) {

      pricesort.sort((a, b) => b.price_in_cogs - a.price_in_cogs)
      this.setState({togleprice: true})
    } else if (this.state.togleprice === true) {

      pricesort.sort((a, b) => a.price_in_cogs - b.price_in_cogs)
      this.setState({togleprice: false})
    }
    this.setState({agents: pricesort})
  }
  handleservicenamesort() {
    var servicenamesort = this.state.agents
    if (this.state.togleservicename === false) {
      servicenamesort.sort(function (a, b) {
        return a.display_name.localeCompare(b.display_name);
      });
      this.setState({togleservicename: true})
    } else if (this.state.togleservicename === true) {
      servicenamesort.sort(function (a, b) {
        return b.display_name.localeCompare(a.display_name);
      });
      this.setState({togleservicename: false})
    }
    this.setState({agents: servicenamesort})
  }
  handleWindowLoad() {
    this.network.initialize().then(isInitialized => {
      if (isInitialized) {
        this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
      } 
      else {
        this.setState({chainId: this.network.getDefaultNetwork()});
        console.log("Defaulting to " + this.state.chainId);
        this.loadDetails();
      }
    }).catch(err => {
      console.error(err);
    })
  }
  componentWillUnmount() {
    if (this.watchNetworkTimer) {
      clearInterval(this.watchNetworkTimer);
    }
  }
  componentDidMount() {
    window.addEventListener('load', () => this.handleWindowLoad());
    this.handleWindowLoad();
  }
  loadDetails() {
    let _url = this.network.getMarketplaceURL(this.state.chainId) + "service"
    let _urlfetchservicestatus = this.network.getMarketplaceURL(this.state.chainId) + 'group-info'
    let _urlfetchvote = this.network.getMarketplaceURL(this.state.chainId) + 'fetch-vote'
    this.setState({userAddress: web3.eth.coinbase});
    Promise.all([getApi(_url),getApi(_urlfetchservicestatus),postApi(_urlfetchvote,this.state.userAddress)])
    .then((values) =>
    {
      this.setState({agents: values[0].data})
      this.setState({userservicestatus: values[1].data})
      this.setState({uservote: values[2].data})
    }
    ).catch((err)=> console.log(err))
    this.state.healthMerged = false;
    if (typeof web3 === 'undefined') {
      return;
    }
  }
  handleClick(offset) {
    this.setState({ offset });
  }
  onOpenJobDetailsSlider(data,dataservicestatus) {
    (data.hasOwnProperty('tags'))?this.setState({tagsall:data["tags"]}):this.setState({tagsall:[]})
    this.setState({modaluser:data})
    this.setState({modalservicestatus:dataservicestatus})
    this.setState({jobDetailsSliderOpen: true });
    this.setState({expiryBlockNumber:10000})
    this.setState({valueTab:0})
    this.setState({startjobfundinvokeres:false})
    this.setState({runjobstate:false})
    this.setState({inputservicejson:{}})
    this.setState({depositopenchannelerror:''})
    if (typeof web3 === 'undefined' || typeof this.state.userAddress === 'undefined') {
      return;
    }
    this.serviceState.uniqueID = generateUniqueID(data["org_id"],data["service_id"]);
    console.log(this.serviceState.uniqueID);
    console.log(this.serviceOrgIDToComponent[this.serviceState.uniqueID]);
    console.log(this.serviceOrgIDToComponent);
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
  onCloseJobDetailsSlider(){
    this.setState({ jobDetailsSliderOpen: false });
  }
  onOpenSearchBar(e) {
    this.setState({ searchBarOpen: true });
  }
  onCloseSearchBar(){
    this.setState({ searchBarOpen: false });
  }
  onOpenModalAlert() {
    this.setState({openAlert: true})
  }
  onCloseModalAlert() {
    this.setState({openAlert: false})
    this.onCloseJobDetailsSlider()
    this.props.history.push("/Profile")
  }
  composeMessage(contract, channelID, nonce, price) {
    //web3.sha3(contractAddrForMPE, this.state.channelstateid, 0, data['price']);
    var ethereumjsabi = require('ethereumjs-abi');
    var sha3Message = ethereumjsabi.soliditySHA3(
      ["address", "uint256", "uint256", "uint256"],
      [contract, parseInt(channelID), parseInt(nonce), parseInt(price)]);
    var msg = "0x" + sha3Message.toString("hex");
    console.log(msg);
    return msg;
  }
  handleJobInvocation(serviceName, methodName, requestObject) {
    console.log("Invoking service " + this.state.inputservicename + " and method name " + this.state.inputmethodname)
    var nonce = this.serviceState.channelHelper.getNonce(0);
    var msg = this.composeMessage(this.network.getMPEAddress(this.state.chainId), this.serviceState.channelHelper.getChannelId(), nonce, this.serviceState.price);
    this.setState({servicegrpcresponse: undefined})
    console.log("Composed message for signing is " + msg)
    window.ethjs.personal_sign(msg, this.state.userAddress)
      .then((signed) => {
        console.log('Signed!  Result is: ', signed)
        var stripped = signed.substring(2, signed.length)
        var byteSig = Buffer.from(stripped, 'hex');
        let buff = new Buffer(byteSig);
        let base64data = buff.toString('base64')
        console.log("Using signature " + base64data)
        const serviceSpecJSON = this.serviceState.serviceSpecJSON
        const requestHeaders = {
          "snet-payment-type": "escrow",
          "snet-payment-channel-id": parseInt(this.serviceState.channelHelper.getChannelId()),
          "snet-payment-channel-nonce": parseInt(nonce),
          "snet-payment-channel-amount": parseInt(this.serviceState.price),
          "snet-payment-channel-signature-bin": base64data
        }
        console.log(requestHeaders);
        console.log(serviceSpecJSON);
        const packageName = Object.keys(serviceSpecJSON.nested).find(key =>
          typeof serviceSpecJSON.nested[key] === "object" &&
          hasOwnDefinedProperty(serviceSpecJSON.nested[key], "nested")
        )
        var endpointgetter = this.serviceState.channelHelper.getEndpoint();
        console.log("Invoking service with package " + packageName + " serviceName " + serviceName + " methodName " + methodName + " endpoint " + endpointgetter + " request " + JSON.stringify(requestObject));
        if (!endpointgetter.startsWith("http")) {
          endpointgetter = "http://" + endpointgetter;
        }
        const Service = serviceSpecJSON.lookup(serviceName)
        const serviceObject = Service.create(rpcImpl(endpointgetter, packageName, serviceName, methodName, requestHeaders), false, false)
        grpcRequest(serviceObject, methodName, requestObject)
          .then(response => {
            console.log("Got a GRPC response")
            this.setState({servicegrpcresponse: response})
            console.log("jobResult" + response.value);
            this.nextJobStep();
          })
          .catch((err) => {
            console.log("GRPC call failed")
            this.setState({servicegrpcresponse: 'GRPC call failed ' + err});
            console.log(err);
            this.nextJobStep();
          })
        return window.ethjs.personal_ecRecover(msg, signed);
      });
  }
  reInitializeJobState(data) {
    let serviceId = data["service_id"];
    let orgId = data["org_id"];
    this.serviceState.price = data["price_in_cogs"];
    let channelInfoUrl = this.network.getMarketplaceURL(this.state.chainId) + 'channel-info';
    return this.serviceState.channelHelper.reInitialize(channelInfoUrl, this.state.userAddress, serviceId, orgId);
  }
  fetchServiceSpec(data) {
    var caller = this;
    let _urlservicebuf = this.network.getProtobufjsURL(this.state.chainId) + data["org_id"] + "/" + data["service_idfier"];
    return fetch(encodeURI(_urlservicebuf))
      .then(serviceSpecResponse => serviceSpecResponse.json())
      .then(serviceSpec => new Promise(function(resolve) {
        caller.serviceState.serviceSpecJSON = Root.fromJSON(serviceSpec[0])
        resolve();
      }));
  }
  startjob(data) {
    var currentBlockNumber = 900000;
    (async ()=> { await web3.eth.getBlockNumber((error, result) => {currentBlockNumber = result}) })()
    var reInitialize = this.reInitializeJobState(data);
    var serviceSpec = this.fetchServiceSpec(data);
    Promise.all([reInitialize, serviceSpec]).then(() => {
      console.log(this.serviceState.serviceSpecJSON);
      console.log(this.serviceState.channelHelper);
      let mpeTokenInstance = this.network.getMPEInstance(this.state.chainId);
      mpeTokenInstance.balances(this.state.userAddress, (err, balance) => {
        balance = AGI.inAGI(balance);
        console.log("In start job Balance is " + balance + " job cost is " + data['price_in_cogs']);
        let foundChannel = this.serviceState.channelHelper.findChannelWithBalance(data, currentBlockNumber);
        if (typeof balance !== 'undefined' && balance === 0 && !foundChannel) {
          this.onOpenModalAlert();
        } else if (foundChannel) {
          console.log("Found a channel with enough balance Details " + JSON.stringify(this.serviceState));
          this.setState({startjobfundinvokeres: true});
          this.setState({valueTab: 1});
        } else {
          console.log("MPE has balance but no usable channel - Balance is " + balance + " job cost is " + data['price_in_cogs']);
          this.setState({startjobfundinvokeres: true})
          this.setState({valueTab: 0});
        }
      });
    })
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
  handlesearch() {
    this.setState({besttagresult: []});
    let searchedagents = []
    searchedagents = this.state.agents.map(row => (row["display_name"].toUpperCase().indexOf(this.state.searchterm.toUpperCase()) !== -1 || row["service_id"].toUpperCase().indexOf(this.state.searchterm.toUpperCase()) !== -1) ? row : null)
    let bestsearchresults = [...(searchedagents.filter(row => row !== null).map(row1 => row1))]
    this.setState({bestestsearchresults: bestsearchresults})
  }
  handlesearchbytag(e, data) {
    let tagresult = [];
    this.state.agents.map(rowagents =>
      (rowagents["tags"].map(rowtag => (rowtag === data) ? tagresult.push(rowagents) : null))
    )
    //inner loop trap//
    this.setState({besttagresult: tagresult})
  }
  captureSearchterm(e) {
    this.setState({searchterm:e.target.value})
  }
  nextJobStep() {
    this.onClosechaining()
    this.setState({valueTab:(this.state.valueTab + 1)})
    console.log("Job step " + this.state.valueTab);
  }
  render() {
    const {open} = this.state;
    var agentsample = this.state.agents
    const {valueTab} = this.state;
    if (this.state.searchterm !== '') {
      //this.setState({besttagresult:[]})
      agentsample = this.state.bestestsearchresults
    }
    if (this.state.besttagresult.length > 0) {
      //this.setState({searchterm:''})
      agentsample = this.state.besttagresult
    }
    let servicestatus = this.state.userservicestatus
    let arraylimit = agentsample.length
    agentsample.map(row => {
      row["up_vote"] = 0, row["down_vote"] = 0
    });
    this.state.agents.map(row =>
      this.state.uservote.map(rown => ((rown["service_id"] === row["service_id"] && rown["org_id"] === row["org_id"]) ?
        ((rown["up_vote"] === 1 ? row["up_vote"] = 1 : row["up_vote"] = 0) || (rown["down_vote"] === 1 ? row["down_vote"] = 1 : row["down_vote"] = 0)) : null))
    );
    const agents = agentsample.slice(this.state.offset, this.state.offset + 5).map((rown,index) =>  
      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 media" key={index} id={rown[ "service_id"]} name={rown[ "display_name"].toUpperCase()}>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Agent Name</div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-name-align" id={rown[ "service_id"]} name={rown[ "display_name"]}>
              <label className="m-0">
                  <Typography className="m-0" style={{fontSize: "14px"}}>
                      {rown["display_name"]}</Typography>
              </label>
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Organization</div>
          <div className="col-sm-12 col-md-2 col-lg-2 org-name-align">
              <Typography className="m-0" style={{fontSize: "14px",fontFamily: "Arial", }}>{rown["org_id"]}</Typography>
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Price</div>
          <div className="col-sm-12 col-md-2 col-lg-2 price-align">
              <label className="m-0">
                  <Typography className="m-0" style={{fontSize: "15px",fontFamily: "Arial", }}>{rown["price_in_cogs"]} AGI</Typography>
              </label>
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Tag</div>
          <div className="col-sm-12 col-md-2 col-lg-2 tag-align">
              {(rown.hasOwnProperty('tags'))? rown["tags"].map(rowtag =>
              <button className='btn btn-secondary mr-15' href='#' onClick={(e)=>{this.handlesearchbytag(e,rowtag)}}>{rowtag}</button>):null}
          </div>
          <div className="col-sm-12 col-md-1 col-lg-1 agent-boxes-label">Health</div>
          <div className="col-sm-12 col-md-1 col-lg-1 health-align">
              {servicestatus.map((row,rindex) => ((row["service_id"]===rown["service_id"])? ((row["is_available"] ===1)? <span key={rindex} className="agent-health green"></span>: <span key={rindex} className="agent-health red"></span>) :null) )}
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Action</div>
          <div className="col-sm-12 col-md-2 col-lg-2 action-align">
              <button className="btn btn-primary" onClick={(e)=>this.onOpenJobDetailsSlider(rown,this.state.userservicestatus)} id={rown["service_id"]}>Details</button>
          </div>
          <div className="col-sm-12 col-md-1 col-lg-1 likes-dislikes">
              <div className="col-md-6 thumbsup-icon">
                  <div className="thumbsup-img "><img src="./img/thumbs-up.png" /></div>
                  {(this.state.uservote.length === 0)?<div className="likes-text">0</div>:
                  (this.state.uservote.map(rowu => (rowu["service_id"]===rown["service_id"])?
                  <div className="likes-text">{rowu["up_vote_count"]}</div>:
                  <div className="likes-text"></div>))}
              </div>
              <div className="col-md-6 thumbsdown-icon"><img src="./img/thumbs-down.png" />
                  <br/> {this.state.uservote.length===0? <div className="likes-text">0</div>:(this.state.uservote.map(rowu => (rowu["service_id"]===rown["service_id"])? rowu["down_vote_count"]:null))}
              </div>
          </div>
      </div>
    );
    let CallComponent = DefaultService;
    let customComponent = this.serviceOrgIDToComponent[this.serviceState.uniqueID];
    console.log("Examining component " + customComponent + " with key " + this.serviceState.uniqueID);
    if(typeof customComponent !== 'undefined') {
      CallComponent = customComponent;
    }
    return(
          <React.Fragment>            
            <div className="inner">
                <div className="header">
                    <div className="col-xs-6 col-sm-4 col-md-6 col-lg-6 logo">
                        <h1><img src="./img/singularity-logo.png"  alt="SingularityNET"/></h1>
                    </div>
                    <div className="col-xs-6 col-sm-8 col-md-6 col-lg-6 search-user">
                        <input className="search hidden-xs" placeholder={this.state.searchterm} name="srch-term" id="srch-term" type="label" onClick={this.onOpenSearchBar} />
                        <div className="user">
                            {(typeof web3 !== 'undefined')?
                            <Link to="/SampleServices"><img src="./img/home-icon.png" alt="" /> </Link>:
                            <Link to="/"><img src="./img/home-icon.png" alt="" /> </Link>}
                        </div>
                        <div className="user">
                            <Link to="/Profile"><img src="./img/user.png" alt="User" /></Link>
                        </div>
                    </div>
                </div>
            </div>
            <main role="content" className="content-area">
                <div className="container-fluid p-4  ">                                     
                     <Carddeckers/>                    
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 head-txt-sec">
                        <div className="col-sm-2 col-md-2 col-lg-2">
                            <h3>Agent</h3>
                            <div className="toggle">
                                <button>
                                    <img src="./img/Arrow.png" alt="toggle" onClick={this.handleservicenamesort}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Organization</h3>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2">
                            <h3>Price</h3>
                            <div className="toggle">
                                <button className="toggle-up">
                                    <img src="./img/Arrow.png" alt="toggle" onClick={this.handlepricesort}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Tags</h3>
                        </div>
                        <div className="col-sm-1 col-md-1 col-lg-1 text-center">
                            <h3>Health</h3>
                            <div className="toggle">
                                <button className="toggle-up">
                                    <img src="./img/Arrow.png" alt="toggle" onClick={this.handlehealthsort}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Action</h3>
                        </div>
                        <div className="col-sm-1 col-md-1 col-lg-1">
                            <h3></h3>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 no-mobile-padding">
                        {agents}
                    </div>
                    <div className="col-xs-12 col-md-12 col-lg-12 pagination pagination-singularity text-right no-padding">
                        {arraylimit>5?
                        <MuiThemeProvider theme={theme}>
                            <Pagination limit={5} offset={this.state.offset} total={arraylimit} onClick={(e, offset)=> this.handleClick(offset)} />
                        </MuiThemeProvider>
                        :null}
                    </div>
                </div>
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
                    <Modal open={this.state.jobDetailsSliderOpen} onClose={this.onCloseJobDetailsSlider}>
                        <Slide direction="left" in={this.state.jobDetailsSliderOpen} mountOnEnter unmountOnExit>
                            <div className="sidebar">
                                <div style={{fontSize: "35px",textAlign: "right"}}><a href="#" className="closebtn" onClick={this.onCloseJobDetailsSlider}>&times;</a></div>
                                <Typography component={ 'div'}>
                                    <div className="right-panel agentdetails-sec p-3 pb-5">
                                        <div className="col-xs-12 col-sm-12 col-md-12 name no-padding">
                                            <h3>{this.state.modaluser["service_id"]} </h3>
                                            <p> {this.state.tagsall.map(rowtags =>
                                                <button type="button" className="btn btn-secondary mrb-10 ">{rowtags}</button>)}</p>
                                            <div className="text-right border-top1">
                                                {(this.state.runjobstate === true) ?
                                                <button type="button" className="btn-start" onClick={()=> this.startjob(this.state.modaluser)}>Start Job</button>
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
                                                            <button type="button" className="btn btn-primary width-mobile-100" onClick={()=>this.openchannelhandler(this.state.modaluser,this.state.modalservicestatus)}>Reserve Funds</button>
                                                        </div>
                                                    </div>:
                                                    <div className="row channels-sec-disabled">
                                                        <div className="col-xs-12 col-sm-4 col-md-4">
                                                            <input type="text" className="chennels-amt-field" value={parseInt(this.state.modaluser[ "price_in_cogs"])} disabled />
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
                                                    <CallComponent serviceSpec={this.serviceState.serviceSpecJSON} callApiCallback={this.handleJobInvocation} response={this.state.servicegrpcresponse}/>
                                                  </React.Fragment>
                                                  <div className="row">
                                                    <p style={{fontSize:"14px"}}>Now that the channel has been funded you are able to call the API on the Agent. Agents take different inputs, so may have their own UI. Once you've provided inputs, click the "Invoke" button to initate the API call. This will prompt one further interaction with MetaMask to sign your API request before submitting the request to the Agent. This interaction does not initiate a transaction or transfer any additional funds.</p>
                                                    </div>
                                                </TabContainer>
                                                } {(valueTab === 2) &&
                                                <TabContainer>
                                                  <React.Fragment>
                                                    <CallComponent serviceSpec={this.serviceState.serviceSpecJSON} callApiCallback={this.handleJobInvocation} response={this.state.servicegrpcresponse}/>
                                                  </React.Fragment>
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
                                                    <p style={{fontSize: "14px"}}>{this.state.modaluser["org_id"]}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xs-12 col-sm-12 col-md-12 vote no-padding">
                                            <h3>Votes</h3>
                                            <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 mobile-mtb-7">
                                                <div className="thumbsup-icon float-none">
                                                    <div className="thumbsup-img">
                                                    <a href="#"><img src="./img/like-img.png" style={{height: "50px",width: "70px"}} alt="ThumbsUp" onClick={()=>this.handleonvote(this.state.modaluser["org_id"],this.state.modaluser["service_id"])} /></a></div>                   
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 border-left-1">
                                                <div className="thumbsdown-icon float-none">
                                                <a href="#"><img src="./img/dislike-img.png" style={{height: "50px",width: "70px"}} alt="ThumbsDown" onClick={()=>this.handledownvote(this.state.modaluser["org_id"],this.state.modaluser["service_id"])}/></a>                                                 
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-xs-12 col-sm-12 col-md-12 jobcostpreview no-padding">
                                            <h3>Job Cost Preview</h3>
                                            <div className="col-xs-12 col-sm-12 col-md-12 no-padding">
                                                <div className="col-xs-6 col-sm-6 col-md-6 bg-light" style={{fontSize: "14px"}}>Current Price</div>
                                                <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter" style={{fontSize: "14px"}}> {parseInt(this.state.modaluser["price_in_cogs"])} AGI</div>
                                                <div className="col-xs-6 col-sm-6 col-md-6 bg-light" style={{fontSize: "14px"}}>Price Model</div>
                                                <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter" style={{fontSize: "14px"}}>{this.state.modaluser["price_model"]}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Typography>
                            </div>
                        </Slide>
                    </Modal>
                </div>
                <div>
                    <Modal open={this.state.openAlert} onClose={this.onCloseModalAlert}>
                        <Slide direction="down" in={this.state.openAlert} mountOnEnter unmountOnExit>
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
                <div>
                    <Modal open={this.state.searchBarOpen} onClose={this.onCloseSearchBar}>
                        <Slide direction="down" in={this.state.searchBarOpen} mountOnEnter unmountOnExit>
                            <div className="container popover-wrapper search-panel">
                                <div className='row'>
                                    <div className='col-sm-1 col-md-1 col-lg-1  rborder '>
                                    </div>
                                    <div className='col-sm-6 col-md-6 col-lg-6  rborder '>
                                        <div className='form-group'>
                                            <div className="search-title">
                                                <label htmlFor='search'>Search</label>
                                            </div>
                                            <div className="col-sm-12 col-md-12 col-lg-12 no-padding">
                                                <div className="col-sm-9 col-md-9 col-lg-9 no-padding">
                                                    <input id='str' className="search-box-text" name='str' type='text' placeholder='Search...' value={this.state.searchterm} onChange={this.captureSearchterm} onKeyUp={(e)=>this.handlesearchkeyup(e)} />
                                                </div>
                                                <div className="col-sm-3 col-md-3 col-lg-3">
                                                    <input className='btn btn-primary' id='phSearchButton' type='button' value='Search' onClick={this.handlesearch} />
                                                    <input className='btn btn-primary clear-btn' id='phSearchButtonclear' type='button' value='Clear' onClick={this.handlesearchclear} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-4 col-md-4 col-lg-4 tags-panel">
                                        <div className="tags-title">Tags</div>
                                        <ul>
                                            {this.state.agents.map(rowagents => rowagents["tags"].map(rowtag =>
                                            <a href="#">
                                                <li onClick={(e)=>{this.handlesearchbytag(e,rowtag)}}>{rowtag}</li>
                                            </a>))}
                                        </ul>

                                    </div>
                                </div>
                            </div>
                        </Slide>
                    </Modal>
                </div>
            </main>
            </React.Fragment>
     );
  }
}
SampleServices.propTypes = {
  account: PropTypes.string
};
export default withRouter(SampleServices);
