import React from 'react';
import PropTypes, { array } from 'prop-types';
import Eth from 'ethjs';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import Pagination from "material-ui-flat-pagination";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import Slide from '@material-ui/core/Slide';
import {Link,withRouter} from 'react-router-dom';
import { grpcRequest, rpcImpl } from '../grpc.js'
import { Root } from 'protobufjs';
import {  AGI, hasOwnDefinedProperty,FORMAT_UTILS,ERROR_UTILS } from '../util';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactDOM from 'react-dom';
import Network from "./Network.js"


//const _serviceurl = 'https://nhsdguu656.execute-api.us-east-1.amazonaws.com/kovan/'
//const _serviceurl = getMarketplaceURL(this.state.chainId)

const TabContainer = (props) => {
  return (
    <Typography component="div" style={{padding:"10px"}}>
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
    // Name of the component ⚛️ / style sheet
  
    MuiButton: {
      // Name of the rule
      root: {
        // Some CSS
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
      show:false,
      open:false,
      open1:false,
      open2:false,
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
      ethBalance:0,
      amount:0 ,
      tokenbalance:0,
      tokenallowance:0,
      escrowaccountbalance:0,
      value:0,
      authorizeamount:0,
      depositamount:0,
      withdrawalamount:0,
      signatured:'',
      channelstateid:'',
      modalservicestatus:[],
      ocvalue:0,
      ocexpiration:0,
      opencallserviceinputs:false,
      inputservicename:'',
      inputmethodname:'',
      inputservicejson:{},
      valueTab:0,
      servicegrpcresponse:'',
      servicegrpcerror:'',
      servicefetcherror: '',  
      openchaining:false,   
      percentage:20,
      startjobfundinvokeres:false,
      servicestatenames:[],
      servicemethodnames:[],
      chainId: undefined,
      depositopenchannelerror:'',
      depositopenchannelrecpt:'',
      userchannelstateinfo:[],
      depositextenderror:'',
      runjobstate:false,
    };

    this.network = new Network();
    this.web3Initialized = false;
    this.account = undefined;
    this.onOpenModal1 = this.onOpenModal1.bind(this)
    this.onCloseModal1 = this.onCloseModal1.bind(this)
    this.onOpenModal2 = this.onOpenModal2.bind(this)
    this.onCloseModal2 = this.onCloseModal2.bind(this)
    this.onOpencallserviceinputs = this.onOpencallserviceinputs.bind(this)
    this.onClosecallserviceinputs = this.onClosecallserviceinputs.bind(this)
    this.handleCloseserviceinputs = this.handleCloseserviceinputs.bind(this)
    this.changehandlerservicename = this.changehandlerservicename.bind(this)
    this.changehandlermethodname = this.changehandlermethodname.bind(this)
    
    this.changehandlerervicejson= this.changehandlerervicejson.bind(this)
    this.handlesearch = this.handlesearch.bind(this)
    this.startjob = this.startjob.bind(this)
    this.CaptureSearchterm = this.CaptureSearchterm.bind(this)
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
    this.handlerInvokeJob = this.handlerInvokeJob.bind(this)
    this.onOpenchaining = this.onOpenchaining.bind(this)
    this.onClosechaining = this.onClosechaining.bind(this)
    this.watchNetworkTimer =         undefined;
    this.web3 = undefined
    this.eth = undefined
    
  }

  onClosechaining()
  {
    this.setState({openchaining:false})
  }
  onOpenchaining()
  {
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
 
   changehandlermethodname()
   {
     
    var el = ReactDOM.findDOMNode(this.refs.methodref)
    var strmethod = el.options[el.selectedIndex].text;
    console.log("methodname " + strmethod)
     this.setState({inputmethodname:strmethod})
   }
   changehandlerservicename(e,data)
   {
    // var el = this.refs.serviceref
    this.setState({servicemethodnames:[]})
    var el = ReactDOM.findDOMNode(this.refs.serviceref)
    var strservice = el.options[el.selectedIndex].text;
    
     this.setState({inputservicename:strservice})

     let  _urlservicebuf = this.network.getProtobufjsURL(this.state.chainId) +data["org_id"] +"/"+ data["service_idfier"] 

fetch( encodeURI(_urlservicebuf))
.then( serviceSpecResponse  =>  serviceSpecResponse.json())
.then( serviceSpec  => {
  const serviceSpecJSON = Root.fromJSON(serviceSpec[0])
  console.log(serviceSpecJSON)


  var methods = Object.keys(serviceSpecJSON.nested[strservice].methods)
  console.log(methods)
  this.setState({servicemethodnames:["Select a method",methods]})
  /*const method = Object.keys(serviceSpecJSON.nested).find(key =>
    typeof serviceSpecJSON.nested[key] === "Object"
    
    )*/
}
)
   }
   changehandlerervicejson(e)
   {
     this.setState({inputservicejson:e.target.value})
   }
 handleCloseserviceinputs()
    {
      this.state.closecallserviceinputs = false
    }
  handlesearchclear()
  {
    this.setState({searchterm:''})
  }
  handlesearchkeyup(e)
  {
    e.preventDefault();
    if (e.keyCode === 13) {
       this.handlesearch()
    }
  }
  changeocvalue(e)
  {
    this.setState({ocvalue:e.target.value})
  }
  changeocexpiration(e)
  {
    this.setState({ocexpiration:e.target.value})
  }

  GetEvent(mpeInstance,senderAddress,groupidgetter,recipientaddress)
  {

   //var startingBlock = web3.eth.getBlockNumber()
   var startingBlock = 9510097;
  
    var MPEChannelId = ''
var evt =mpeInstance.ChannelOpen({sender: senderAddress}, {fromBlock: startingBlock, toBlock: 'latest'});
console.log('event after channel open is ' + evt)

evt.watch((error, result) => {
console.log('Watching for events');
if(error) {
    console.log("Error in events");
}
else {
    console.log("result from event: " + result);
    var event = result.event;
    console.log("event: " + event);
    var agentGroupID = this.base64ToHex(groupidgetter);
    if(event == "ChannelOpen")
    {
        MPEChannelId = result.args.channelId;
        var channelSender = result.args.sender;
        var channelRecipient = result.args.recipient;
        var channelGoupId = result.args.groupId;

        console.log("Channel details - [" + channelGoupId + "] [" + channelRecipient + "] ["+channelSender+"]");
        console.log("App details - [" + agentGroupID + "] [" + recipientaddress + "] ["+senderAddress+"]");
        if(channelGoupId === agentGroupID && channelSender.toLowerCase() === senderAddress.toLowerCase() && recipientaddress.toLowerCase() === channelRecipient.toLowerCase())
        {
          console.log("Matched channel id " + MPEChannelId)
          this.setState({channelstateid:MPEChannelId});
          evt.stopWatching();
        }
        console.log("channel id" + MPEChannelId)
    }
}
});

    
  }
  
  openchannelhandler(data,dataservicestatus)
  {
    
    if(web3 === 'undefined') {
      return;
    }
    var user_address = web3.eth.defaultAccount
    let mpeInstance = this.network.getMPEInstance(this.state.chainId);
    var amountInWei = AGI.inWei(web3,this.state.ocvalue);
    //GetChannel from MPE service//
    //if we get channel then pick one channel and check balance in channel//
    console.log('channel object ' + this.state.userchannelstateinfo["endpoint"])
    //this.state.userchannelstateinfo.map((rr) => console.log('object array1 is ' + rr["endpoint"]))
    
  mpeInstance.balances(user_address,(err,balance) =>{
    if (balance === 0)//change for testing purpose and remove it later with 0 value here//
    {
        this.onOpenModalAlert()
    }
    else if (balance > 0)
      {
   

        if (typeof this.state.userchannelstateinfo !== 'undefined')
        {
            var senderAddress = web3.eth.defaultAccount;
    //Get this information from MPE service for endpoint and //
          
          var groupidgetter = ''
    
      //pick a channel//
      console.log('channel state information is ' +  this.state.userchannelstateinfo["groupId"])
      
     // this.state.userchannelstateinfo.map((rrchannel) => {
        groupidgetter = this.state.userchannelstateinfo["groupId"]
       
        
        if (this.state.userchannelstateinfo["channelId"].length > 0)
        {
          var rrchannels = this.state.userchannelstateinfo["channelId"][0]
         // rrchannel["channelId"].map(rrchannels => 

          //  {

        if (rrchannels["balance"] > data["price"])
        {
          //sets the tab for invoke here//
           this.setState({valueTab:1})
        }
        else if (rrchannels["balance"] < data["price"])
              {
        
               mpeInstance.channelExtendAndAddFunds(rrchannels["channelId"], this.state.ocexpiration, amountInWei, { gas: 210000, gasPrice: 51 }, (error, txnHash) => {
    
              console.log("Channel extended and added funds is TXN Has : " + txnHash);
              this.onOpenchaining()
              this.waitForTransaction(txnHash).then(receipt => {
                   console.log('Channel extended and deposited ' + this.state.ocvalue + ' from: ' + senderAddress + 'receipt is ' + receipt);
                  this.nextJobStep();
                  })
                .catch((error) => {
                     this.setState({depositextenderror: error })
                    this.nextJobStep();
                  })
                })
              }
           // })//closure for rchanels
            
        }
      //})
      //
    
   

    
   
     //MPE Contract ABI

    //need to accept inputs/##inputsforvalue
    if (typeof this.state.userchannelstateinfo !== 'undefined')
        {
    
   // this.state.userchannelstateinfo.map((rrchannel) => {
      groupidgetter = this.state.userchannelstateinfo["groupId"]
      var recipientaddress = ''
    Object.values(data["groups"]).map((rr) => recipientaddress = rr["payment_address"])
    console.log("group id is " + groupidgetter)
    console.log("recipient address is " + recipientaddress )
    var groupidgetterhex = atob(groupidgetter); //Buffer.from(groupidgetter, 'utf8').toString('hex');
    console.log('groupdidgetter hex is ' + groupidgetterhex)
    console.log(this.state.ocvalue);
    console.log(this.state.ocexpiration);
    console.log(senderAddress);
      
      if (this.state.userchannelstateinfo["channelId"].length === 0)
      {
    mpeInstance.depositAndOpenChannel(senderAddress, recipientaddress,groupidgetterhex, amountInWei,this.state.ocexpiration,{ gas: 210000, gasPrice:51 }, (error, txnHash) => { 
      console.log("Channel opened is TXN Has : " + txnHash);
      this.onOpenchaining()
      
      this.waitForTransaction(txnHash).then(receipt => {
        console.log('Opened channel and deposited ' + AGI.toDecimal(this.state.ocvalue) + ' from: ' + senderAddress);
        this.setState({depositopenchannelrecpt:receipt})
        //this.nextJobStep();
      })
      .catch((error) => this.setState({depositopenchannelerror:error}))
    
     //channeladdfunds//
      })
      this.GetEvent(mpeInstance,senderAddress,groupidgetter,recipientaddress)
      if (this.state.channelstateid !== '' && this.state.depositopenchannelrecpt !== '')
      {
         this.nextJobStep();
      }
    }
  //})
}//closure for if loop
     ///////////////////
    }
    

  }//if closure for channel
  
  })

  

}

base64ToHex(base64String) {
  var byteSig = Buffer.from(base64String, 'base64');
  let buff = new Buffer(byteSig);
  let hexString = "0x"+buff.toString('hex');
  return hexString;
}

handlehealthsort()
{
  if(!this.state.healthMerged)
  {
    for(var ii in this.state.agents)
    {
      for(var jj in this.state.userservicestatus)
      {
        if(this.state.agents[ii].service_id === this.state.userservicestatus[jj].service_id)
        {
          this.state.agents[ii].is_available = this.state.userservicestatus[jj].is_available;
          break;
        }
      }
    }
    this.state.healthMerged = true;
  }

  var healthSort = this.state.agents
  if (this.state.togglehealth === false)
  {
    healthSort.sort((a, b) => b.is_available - a.is_available)
    this.setState({togglehealth:true})
  }
  else if (this.state.togglehealth === true)
  {
    healthSort.sort((a, b) => a.is_available - b.is_available)
    this.setState({togglehealth:false})
  }

  this.setState({agents:healthSort})
}

  handlepricesort()
  {
    var pricesort = this.state.agents
    if (this.state.togleprice === false)
    {
      
      pricesort.sort((a, b) => b.price - a.price)
      this.setState({togleprice:true})
    }
    else if (this.state.togleprice === true)
    {
      
      pricesort.sort((a, b) => a.price - b.price)
      this.setState({togleprice:false})
    }

    this.setState({agents:pricesort})
  }

 

  handleservicenamesort()
  {
   
   var servicenamesort = this.state.agents
    
    if (this.state.togleservicename === false)
    {
      servicenamesort.sort(function (a, b) {
        return a.display_name.localeCompare(b.display_name);
        
    })
     
      this.setState({togleservicename:true})
    }
    else if (this.state.togleservicename === true)
    {
      servicenamesort.sort(function (a, b) {
        return b.display_name.localeCompare(a.display_name);
        
    })
      this.setState({togleservicename:false})
    }
    this.setState({agents:servicenamesort})
 
  }

  handleWindowLoad() {
    this.network.initialize().then(isInitialized => {
      this.web3Initialized = isInitialized;
      if (isInitialized) {
        this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
      
      }
    }).catch(err => {
      console.error(err);
      this.web3Initialized = false;
    })
  }

  
  componentWillUnmount() {
		if(this.watchNetworkTimer) {
		  clearInterval(this.watchNetworkTimer);
		}
	   
	  }

  componentDidMount(){    
   window.addEventListener('load', () => this.handleWindowLoad());
   this.handleWindowLoad();
  }

  


  loadDetails() {
    
    this.setState({useraddress:this.props.account})
    let _url= this.network.getMarketplaceURL(this.state.chainId) + "service"
    fetch(_url,{'mode':'cors',
    'Access-Control-Allow-Origin':'*'})
    .then(res => res.json())
    .then(data => this.setState({agents:data})
                  )
  
  //fetchprofile service
  
   if (typeof web3 !== 'undefined'){
    let _urlfetchvote = this.network.getMarketplaceURL(this.state.chainId) +'fetch-vote'
    fetch(_urlfetchvote,{'mode':'cors',
    headers: {
      "Content-Type": "application/json",
    },
    method: 'POST',
    body: JSON.stringify({user_address:web3.eth.coinbase})
    }
    
    )
    .then(res => res.json())
   .then(data => this.setState({uservote:data}))
    .catch(err => console.log(err))
  }

  let _urlfetchservicestatus = this.network.getMarketplaceURL(this.state.chainId) +'group-info'
    fetch(_urlfetchservicestatus,{'mode':'cors',
    method: 'GET',
    'Access-Control-Allow-Origin':'*',
    }
    
    )
    .then(res => res.json())
    .then(data => this.setState({userservicestatus:data}))
    .catch(err => console.log(err))
    this.state.healthMerged = false;
  }
  
  handleClick(offset) {
    this.setState({ offset });
  }
  onOpencallserviceinputs()
  {
    this.setState({opencallserviceinputs:true})
  }
  onClosecallserviceinputs()
  {
    
    this.setState({opencallserviceinputs:false})
  }
  
  onOpenModal1(e,data,dataservicestatus) {
  
    
    (data.hasOwnProperty('tags'))?this.setState({tagsall:data["tags"]}):this.setState({tagsall:[]})

    this.setState({modaluser:data})
    this.setState({modalservicestatus:dataservicestatus})
    this.setState({ open1: true });
    this.setState({ocexpiration:10000})
    this.setState({valueTab:0})
    this.setState({channelstateid:'' })
    this.setState({startjobfundinvokeres:false})
    this.setState({inputservicejson:{}})
    this.setState({depositopenchannelerror:''})

    let serviceid = data["service_id"]
    let orgname = data["organization_name"]
    
    if (typeof web3 !== 'undefined'){
      let _urlfetchchannelinfo = this.network.getMarketplaceURL(this.state.chainId) +'channel-info'
      fetch(_urlfetchchannelinfo,{'mode':'cors',
      headers: {
        "Content-Type": "application/json",
      },
      method: 'POST',
      body: JSON.stringify({user_address:web3.eth.coinbase,service_id:serviceid,org_name:orgname})
   

      }
      
      )
      .then(res => res.json())
     .then(channeldata => //this.setState({userchannelstateinfo:channeldata})
                     // console.log("channel data length is " + channeldata.length)
                      channeldata.map(rr => this.setState({userchannelstateinfo:rr})
                        //console.log('rr length' + rr["endpoint"])
                        )
                           )
      .catch(err => console.log(err))
    }

//disabled start job if the service is not up at all - unhealthy agent//

    dataservicestatus.map(row =>
        {
          if (row["service_id"]===data["service_id"])
          {
            if (row["is_available"] === 1)
            {
              this.setState({runjobstate:true})
              return
            }
        }
        
        }
        )

        

  }

  onCloseModal1(){
    this.setState({ open1: false });
  };
  onOpenModal2(e) {
    this.setState({ open2: true });
  };
  onCloseModal2(){
    this.setState({ open2: false });
  };

  onOpenModalAlert()
  {
   this.setState({openAlert:true})
  }

  onCloseModalAlert()
  {
   this.setState({openAlert:false})
   this.onCloseModal1()
    this.props.history.push("/Profile")
  }

  composeMessage(contract, channelID, nonce, price) {
    //web3.sha3(contractAddrForMPE, this.state.channelstateid, 0, data['price']);
    var ethereumjsabi  = require('ethereumjs-abi'); 
    var sha3Message = ethereumjsabi.soliditySHA3(
      ["address",        "uint256",  "uint256", "uint256"],
      [contract, parseInt(channelID), 0, parseInt(price)]);
    var msg = "0x" + sha3Message.toString("hex");
    console.log(msg);
    return msg;
  }

  handlerInvokeJob(data,dataservicestatus)
  {
//find user balanceOf

let mpeTokenInstance = this.network.getMPEInstance(this.state.chainId);
mpeTokenInstance.balances(user_address, (err, balance) => {
 if (balance > 0)
  {
      console.log('inside MPE Events')   
      var contractAddrForMPE = this.network.getMPEAddress();
      
      var groupidgetter = ''
      var recipientaddress = ''
      var endpointgetter = ''

dataservicestatus.map((row) => {console.log(row)
  if (row["service_id"] === data["service_id"])
  {
          if (row["is_available"] === 1)
          {
            console.log("service is available for this groupid")
            console.log('row of groups are ' + row["groups"])
            row["groups"].map(rgg => {
              if (rgg["is_available"] === 1)
              {
                    groupidgetter = rgg["group_id"]
                    recipientaddress = rgg["payment_address"]
                    console.log('groups id is' + groupidgetter + ' recipient is '+recipientaddress);

                 rgg["endpoints"].map(rendpt =>
                  {
                      if (rendpt["is_available"] ===1)
                      {
                        console.log('service ed point is ' + rendpt["endpoint"])
                        endpointgetter = rendpt["endpoint"]
                      }
                  }
                  )
              }           
          })
  }
}
} 
)
var from = web3.eth.defaultAccount
console.log(contractAddrForMPE +" " + this.state.channelstateid+"  " + data['price']);
//var msg = web3.sha3(contractAddrForMPE, this.state.channelstateid, 0, data['price']);
var msg = this.composeMessage(contractAddrForMPE, this.state.channelstateid, 0, data['price']);
console.log(msg)
var params = [msg, from]
if (from !== null)
{
this.eth.personal_sign(msg, from)
.then((signed) => {
console.log('Signed!  Result is: ', signed)
var stripped = signed.substring(2,signed.length)
console.log("Stripped " + stripped)
var byteSig = Buffer.from(stripped,'hex');
console.log("Signature in bytes " + byteSig);
let buff = new Buffer(byteSig);  
let base64data = buff.toString('base64')      
console.log("Using signature " + base64data)

const serviceurl = this.network.getProtobufjsURL(this.state.chainId) + data["org_id"] + "/" + data["service_idfier"];

console.log("service location is " + encodeURI(serviceurl) )
console.log("service is" + this.state.inputservicename)
fetch( encodeURI(serviceurl))
.then( serviceSpecResponse  =>  serviceSpecResponse.json())
.then( serviceSpec  => {
  console.log("Making the GRPC call")
  const serviceName = this.state.inputservicename
  console.log("service name is " + serviceName)
  const methodName = this.state.inputmethodname
  console.log("method name is " + methodName)
  const requestHeaders = {"snet-payment-type":"escrow",
                          "snet-payment-channel-id":this.state.channelstateid, 
                          "snet-payment-channel-nonce":"0", 
                          "snet-payment-channel-amount":parseInt(data["price"]),
                          "snet-payment-channel-signature-bin": base64data}   
  console.log(requestHeaders)
  const serviceSpecJSON = Root.fromJSON(serviceSpec[0])
  console.log(serviceSpecJSON)
  const packageName = Object.keys(serviceSpecJSON.nested).find(key =>
    typeof serviceSpecJSON.nested[key] === "object" &&
    hasOwnDefinedProperty(serviceSpecJSON.nested[key], "nested")
  )
  console.log('package name is ' + packageName)
  const Service = serviceSpecJSON.lookup(serviceName)
  const serviceObject = Service.create(rpcImpl(endpointgetter, packageName, serviceName, methodName, requestHeaders), false, false)
  const requestObject = JSON.parse(this.state.inputservicejson)
  console.log('service object is ' + serviceObject)
  console.log('requestObject is ' + requestObject)
  grpcRequest(serviceObject, methodName, requestObject)
    .then(response => {
      console.log("Got a GRPC response")
      this.setState({servicegrpcresponse:response.value})
      console.log("jobResult" + response.value)
    })
    .catch((err) => {
      console.log("GRPC call failed")
      this.setState({servicegrpcerror:'GRPC call failed ' + err})
      console.log(err)})
})
.catch((err) => {
  console.log("Some error")
  this.setState({servicefetcherror:'Exiting  failed ' + err})
  console.log(err)
}) 

////signed and invoked//

return this.eth.personal_ecRecover(msg, signed)
}
).then((recovered) => {

if (recovered === from) {
  console.log('Ethjs recovered the message signar!')
} else {
  console.log('Ethjs failed to recover the message signar!')
  console.dir({ recovered })
}
})
}
  }
})//balance closure
this.setState({valueTab:2})
  }


startjob(data)
  {
  //find user balanceOf

console.log("start job clicked here....")
//let  _urlservicebuf = "http://protobufjs.singularitynet.io/" +data["organization_name"] +"/"+ data["service_name"] 
let  _urlservicebuf = this.network.getProtobufjsURL(this.state.chainId) + data["org_id"] + "/" + data["service_idfier"];
console.log(_urlservicebuf)
fetch( encodeURI(_urlservicebuf))
.then( serviceSpecResponse  =>  serviceSpecResponse.json())
.then( serviceSpec  => {
  const serviceSpecJSON = Root.fromJSON(serviceSpec[0])
  console.log(serviceSpecJSON)

  var objservice =Object.keys(serviceSpecJSON.nested)
  var serviceobject = []
  objservice.map(rr => {
                   if (serviceSpecJSON.nested[rr].hasOwnProperty("methods"))
                   {
                    serviceobject.push(rr)
                   }
                  }
    )
  
  this.setState({servicestatenames:serviceobject})
  
}
)

     let user_address = web3.eth.defaultAccount
     let mpeTokenInstance = this.network.getMPEInstance(this.state.chainId);
     console.log('mpe address is ' + this.network.getMPEAddress(this.state.chainId))
     mpeTokenInstance.balances(user_address, (err, balance) => {
     console.log("balance here is actually" + balance)
    if (balance === 0)//change for testing purpose and remove it later with 0 value here//
      {
        this.onOpenModalAlert()
      //setInterval(() => this.props.history.push("/Profile"),5000)
      }
      else if (balance  > 0)
      {
        this.setState({startjobfundinvokeres:true}) 
        this.setState({valueTab:1})
      }
})//balance closure

     }

onKeyPressvalidator(event) {
      const keyCode = event.keyCode || event.which;
  if (!(keyCode == 8 || keyCode == 46) && (keyCode < 48 || keyCode > 57)) {
        event.preventDefault()
    }
  else {
      let dots = event.target.value.split('.');
        if (dots.length > 1 && keyCode == 46)
            event.preventDefault()
        
    }
     }
     
  handlesearch()
  {
    //search on service_name, display_name and all tags//
    this.setState({besttagresult:[]})
     let searchedagents =[]
     searchedagents =this.state.agents.map(row => (row["display_name"].toUpperCase().indexOf(this.state.searchterm.toUpperCase()) !== -1 || row["service_name"].toUpperCase().indexOf(this.state.searchterm.toUpperCase()) !== -1)?row:null )
     let bestsearchresults = [...(searchedagents.filter(row => row !== null).map(row1 => row1))]
     this.setState({bestestsearchresults:bestsearchresults})
  }

  handlesearchbytag(e,data)
  {
    let tagresult = [];
    this.state.agents.map(rowagents => 
    (rowagents["tags"].map(rowtag =>(rowtag===data)?tagresult.push(rowagents):null))
   )
    //inner loop trap//
    this.setState({besttagresult:tagresult})
  }
  hexToAscii(hexString) { 
    let asciiString = Eth.toAscii(hexString);
    return asciiString.substr(0,asciiString.indexOf("\0")); // name is right-padded with null bytes
  }
  CaptureSearchterm(e)
  {
    this.setState({searchterm:e.target.value})
  }
async waitForTransaction(hash) {
    let receipt;
    while(!receipt) {
      receipt = await window.ethjs.getTransactionReceipt(hash);
    }

    if (receipt.status === "0x0") {
      throw receipt
    }

    return receipt;
  }

  nextJobStep() {
    //this.clearModal();
    this.onClosechaining()
    this.setState({valueTab:1})
   
  }

  render() {
    /*Agents name*/
    
    const { open } = this.state;
    var agentsample = this.state.agents
    const { valueTab } = this.state;
    if (this.state.searchterm !== '' )
    {
      //this.setState({besttagresult:[]})
      agentsample = this.state.bestestsearchresults
    }
    
    if (this.state.besttagresult.length>0)
    {
      //this.setState({searchterm:''})
      agentsample = this.state.besttagresult
    }
    let servicestatus = this.state.userservicestatus
    let arraylimit = agentsample.length
    agentsample.map(row => {row["up_vote"]=0,row["down_vote"]=0})
    this.state.agents.map(row =>
      this.state.uservote.map(rown => ((rown["service_name"]===row["service_name"]&& rown["organization_name"]===row["organization_name"])?
                                         ((rown["up_vote"]===1?row["up_vote"]=1:row["up_vote"]=0)||(rown["down_vote"]===1?row["down_vote"]=1:row["down_vote"]=0)):null)
 )
 )

    const agents = agentsample.slice(this.state.offset, this.state.offset + 5).map((rown,index) =>  <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 media" key={index} id={rown["service_id"]} name={rown["display_name"].toUpperCase()} >
    <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Agent Name</div>
    <div className="col-sm-12 col-md-2 col-lg-2 agent-name-align" id={rown["service_id"]} name={rown["display_name"]}>
     <label className="m-0" ><Typography className="m-0" style={{fontSize:"14px"}}>
                      {rown["display_name"]}</Typography> </label>
    </div>
    <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Organization</div>
  <div className="col-sm-12 col-md-2 col-lg-2 org-name-align"><Typography className="m-0" style={{fontSize:"14px",fontFamily:"Arial", }}>{rown["organization_name"]}</Typography></div>
  <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Price</div>
  <div className="col-sm-12 col-md-2 col-lg-2 price-align">
    <label className="m-0"><Typography className="m-0" style={{fontSize:"15px",fontFamily:"Arial", }}>{rown["price"]}  ETH</Typography></label>
  </div> 
  <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Tag</div>
  <div className="col-sm-12 col-md-2 col-lg-2 tag-align"> 
  {(rown.hasOwnProperty('tags'))?
   rown["tags"].map(rowtag => <button className='btn btn-secondary mr-15' href='#'  onClick={(e)=>{this.handlesearchbytag(e,rowtag)}}>{rowtag}</button>):null}
                                           
  </div>
  <div className="col-sm-12 col-md-1 col-lg-1 agent-boxes-label">Health</div>
  <div className="col-sm-12 col-md-1 col-lg-1 health-align">
  {servicestatus.map((row,rindex) =>  ((row["service_id"]===rown["service_id"])?
                             ((row["is_available"] ===1)? <span key={rindex} className="agent-health green"></span>: <span key={rindex} className="agent-health red"></span>)
                             :null)
  )}
  </div>
  <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Action</div>
<div className="col-sm-12 col-md-2 col-lg-2 action-align">
  <button className="btn btn-primary" onClick={(e)=>this.onOpenModal1(e,rown,this.state.userservicestatus)} id={rown["service_id"]}>Details</button>
</div>
<div className="col-sm-12 col-md-1 col-lg-1 likes-dislikes">

                                        
<div className="col-md-6 thumbsup-icon">
<div className="thumbsup-img "><img src="./img/thumbs-up.png"/></div>
{this.state.uservote.length===0?
  <div className="likes-text">0</div>:this.state.uservote.map(rowu =>
   (rowu["service_name"]===rown["service_name"])?
   <div className="likes-text">{rowu["up_vote_count"]}</div>:<div className="likes-text">0</div>)}

</div>
<div className="col-md-6 thumbsdown-icon"><img src="./img/thumbs-down.png"/><br/>
{this.state.uservote.length===0?
  0:this.state.uservote.map(rowu =>
  (rowu["service_name"]===rown["service_name"])?
  rowu["down_vote_count"]:0)} 
</div>
</div>


</div>

)
    return(
    <React.Fragment>
     
     <div className="inner"> 
  
    <div className="header">
      <div className="col-xs-6 col-sm-4 col-md-6 col-lg-6 logo">
      <h1><img src="./img/singularity-logo.png"  alt="SingularityNET"/></h1>
      
      </div>
      <div className="col-xs-6 col-sm-8 col-md-6 col-lg-6 search-user">
      <input className="search hidden-xs"  placeholder={this.state.searchterm} name="srch-term" id="srch-term" type="label"  onClick={this.onOpenModal2}  />
      <div className="user">
      {(typeof web3 !== 'undefined')?
                <Link to="/SampleServices"><img src="./img/home-icon.png" alt=""/> </Link>:
                <Link to="/"><img src="./img/home-icon.png" alt=""/> </Link>}
                </div>
      <div className="user">
     
      <Link to="/Profile"><img src="./img/user.png" alt="User" /></Link>
         
      </div>
  </div>      
  </div> 
  </div>     
<main role="content" className="content-area">
<div className="container-fluid p-4  ">
 <div className="blue-boxes-head">
                <h4 className="align-self-center text-uppercase ">New &amp; Hot in Community</h4>
            </div>
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 card-deck">
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">
                    <div className="card-body">
                        <h3 className="text-uppercase">Joe Rogan Learns About Blockchain</h3>
                        <p>Revisiting the basics of blockchain technology on the Joe Rogan Experience podcast.</p>
                        <a href="https://blog.singularitynet.io/joe-rogan-learns-about-blockchain-technology-with-dr-ben-goertzel-a9c17566d994" target="_blank" ><button type="button" className="btn btn-primary">Read</button></a>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">
                    <div className="card-body">
                        <h3 className="text-uppercase">Singularity Studio</h3>
                        <p>SingularityNET &amp; Singularity Studio Blitzscaling Toward the Singularity</p>
                        <a href="https://blog.singularitynet.io/singularitynet-singularity-studio-blitzscaling-toward-the-singularity-2c27919e6c76" target="_blank" ><button type="button" className="btn btn-primary">Read</button></a>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">
                    <div className="card-body">
                        <h3 className="text-uppercase">Data as Labor</h3>
                        <p>Rethinking Jobs In The Information age as AI gets more prevalant and ubiqutious</p>
                        <a href="https://blog.singularitynet.io/data-as-labour-cfed2e2dc0d4" target="_blank" ><button type="button" className="btn btn-primary">Read</button></a>
                    </div>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 card">

                    <div className="card-body">
                        <h3 className="text-uppercase">AGI &amp; The New Space Frontier</h3>
                        <p>Exploring the evolution of technologies that will shape our lives</p>
                        <a href="https://blog.singularitynet.io/room-for-innovation-403511a264a6" target="_blank"> <button type="button" className="btn btn-primary">Read</button></a>
                    </div>
                </div>
            </div>
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
        <Pagination
          limit={5}
          offset={this.state.offset}
          total={arraylimit}
          onClick={(e, offset) => this.handleClick(offset)}
        />
     </MuiThemeProvider>
     :null}
     </div>
     </div>
   <div>
     <Modal style={ModalStylesAlertWait}
     open={this.state.openchaining}
     onClose ={this.onClosechaining}
     >
     <Slide direction="left" in={this.state.openchaining} mountonEnter unmountOnExit>
     <React.Fragment>
         <Typography compnent={'div'} style={{fontSize:"13px",lineHeight:"15px"}}>
         <div className="row">
         <div className="col-sm-12 col-md-6 col-lg-6">
         Your transaction is being mined.
         </div>
         <div style={{ width: '50px' }} className="col-sm-12 col-md-6 col-lg-6">
         <CircularProgress
         background
         backgroundPadding={6}
         styles={{
           background: {
             fill: '#3e98c7',
           },
           text: {
             fill: '#fff',
           },
           path: {
             stroke: '#fff',
           },
           trail: { stroke: 'transparent' },
          }}
         />
      
    </div>
    </div>
    </Typography>
    </React.Fragment>
     </Slide>
     </Modal>
   </div>
 <div>
 <Modal
         open={this.state.open1}
         onClose={this.onCloseModal1}
       >    
           <Slide direction="left" in={this.state.open1} mountOnEnter unmountOnExit>
         <div  className="sidebar" > 
         <div  style={{fontSize:"35px",textAlign:"right"}}><a href="#" className="closebtn" onClick={this.onCloseModal1}>&times;</a></div>
          <Typography component={'div'}>
           <div className="right-panel agentdetails-sec p-3 pb-5">
    
         
                    <div className="col-xs-12 col-sm-12 col-md-12 name no-padding">
                        <h3>{this.state.modaluser["service_name"]} </h3>
                        
                           <p> {this.state.tagsall.map(rowtags => <button type="button" className="btn btn-secondary mrb-10 ">{rowtags}</button>)}</p>
                           
                        <div className="text-right border-top1">
                      
                        {(typeof web3 !== 'undefined')?
                       (web3.eth.defaultAccount !== null)?
 
                          (this.state.runjobstate === true)?
                        <button type="button" className="btn-start" onClick={() => this.startjob(this.state.modaluser)}>Start Job</button>
                        :  <button type="button" className="btn-start"  disabled>Start
                                
                        Job</button>
                                :  <button type="button" className="btn-start"  disabled>Start
                                
                                Job</button>:
                                <button type="button" className="btn-start"  disabled>Start
                                
                                Job</button>

                               } 
                               </div>
                        
                    </div>
                   
        
        <div className="col-xs-12 col-sm-12 col-md-12 funds no-padding">
        <i className="up"></i>

       
        <div className="servicedetailstab"  >
        
          <Tabs value={valueTab}  onChange={(event,valueTab) =>this.handleChangeTabs(event,valueTab)} indicatorColor='primary'>
        <Tab disabled={(this.state.startjobfundinvokeres)?false:true} label={<span className="funds-title" >Fund</span>}/>
        <Tab disabled ={this.state.channelstateid !== '' && this.state.openchaining===false?false:true } label={<span className="funds-title">Invoke</span>}/>
        <Tab disabled ={this.state.channelstateid !== '' && this.state.openchaining===false?false:true } label={<span className="funds-title">Result</span>}  />
      </Tabs>
      {valueTab === 0 && <TabContainer> 
        <div className="row channels-sec">
      <div className="col-xs-12 col-sm-2 col-md-2 mtb-10">Amount:</div>
      {(this.state.startjobfundinvokeres)?
      <div className="col-xs-12 col-sm-4 col-md-4"> 
          <input type="text" className="chennels-amt-field" value={this.state.ocvalue===0?this.setState({ocvalue:parseInt(this.state.modaluser["price"])}):this.state.ocvalue} onChange={this.changeocvalue} onKeyPress={(e)=>this.onKeyPressvalidator(e)} /></div>:
          <div className="col-xs-12 col-sm-4 col-md-4"><input type="text" className="chennels-amt-field" value={parseInt(this.state.modaluser["price"])} disabled /></div>}
      <div className="col-xs-12 col-sm-2 col-md-2 mtb-10">Expiration:</div>
      {(this.state.startjobfundinvokeres)? <div className="col-xs-12 col-sm-4 col-md-4"><input type="text" className="chennels-amt-field" value={this.state.ocexpiration} onChange={this.changeocexpiration} /></div>:<div className="col-xs-12 col-sm-4 col-md-4"><input type="text" className="chennels-amt-field" value={this.state.ocexpiration} disabled /></div>}
      {(this.state.startjobfundinvokeres)?<div className="col-xs-12 col-sm-12 col-md-12 text-right mtb-10 no-padding"><button type="button" className="btn btn-primary width-mobile-100" onClick={() =>this.openchannelhandler(this.state.modaluser,this.state.modalservicestatus)}>Reserve Funds</button></div>:<div className="col-xs-12 col-sm-12 col-md-12 text-right mtb-10 no-padding"><button type="button" className="btn btn-primary width-mobile-100"  disabled>Reserve Funds</button></div>  }     
      </div>

     <p style={{fontSize:"12px",color:"red"}}>{this.state.depositopenchannelerror!==''?ERROR_UTILS.sanitizeError(this.state.depositopenchannelerror):''}</p>
      </TabContainer>} 
      {valueTab === 1 && <TabContainer >
        <div className="row">
        <div  className="col-md-3 col-lg-3" style={{fontSize:"13px",marginLeft:"10px"}}>Service Name</div><div className="col-md-3 col-lg-3"> 
        <select id="select1" style={{height:"40px",width:"250px",fontSize:"13px"}} ref="serviceref"  onChange={(e) =>this.changehandlerservicename(e,this.state.modaluser)}>
        <option>Select a service</option>
        {this.state.servicestatenames.map((rowservice,index) => 
        <option value={index}>{rowservice}</option>)}
       </select>
        </div>
        </div>
        <div className="row">
        <div  className="col-md-3 col-lg-3" style={{fontSize:"13px",marginLeft:"10px"}}>Method Name</div><div className="col-md-3 col-lg-3"> 
        <select style={{height:"40px",width:"250px",fontSize:"13px"}} ref="methodref" onChange={this.changehandlermethodname} >
        
        {this.state.servicemethodnames.map((rowmethod,index) => 
        <option value={index}>{rowmethod}</option>)}
       </select>
     
        </div>
        </div>
          <div className="row">
          <div className="col-md-3 col-lg-3" style={{fontSize:"13px",marginLeft:"10px"}}>Json Input</div><div className="col-md-3 col-lg-3"><textarea placeholder="JSON format..." style={{rows:"4", cols:"50",width:"250px",fontSize:"13px"}} value={this.state.inputservicejson} onChange={(e) =>this.changehandlerervicejson(e)}/></div></div>
        <div className="row">
        <div className="col-md-6 col-lg-6" style={{textAlign:"right"}}>
        <button type="button" className="btn btn-primary" onClick={() =>this.handlerInvokeJob(this.state.modaluser,this.state.modalservicestatus)}>Invoke</button></div>
        </div>
        
      </TabContainer>}
      {valueTab === 2 && <TabContainer> 
        {this.state.servicegrpcresponse?<p style={{fontSize:"13px"}}>Response from service is {this.state.servicegrpcresponse} </p>:null}
        {this.state.servicegrpcerror?<p style={{fontSize:"13px",color:"red"}}>Response from service is {this.state.servicegrpcerror}</p>:null}
        {this.state.servicefetcherror?<p style={{fontSize:"13px",color:"red"}}>Response from service is {this.state.servicefetcherror}</p>:null}
    </TabContainer>}
     
     </div>
     
</div>

  {(typeof web3 !== 'undefined')?
        (web3.eth.coinbase !== null)?
                    null:<div style={{fontSize:"14px"}}>You dont have metamask account</div>:<div style={{fontSize:"15px"}}>Please install metamask to call the API</div>}     
                    <div className="col-xs-12 col-sm-12 col-md-12 address no-padding">
                        <h3>User address</h3>
                        <div className="row">
                            <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 text-center" style={{fontSize:"14px"}}>
                              <a target="_blank"  href={'https://kovan.etherscan.io/address/' + ((typeof web3 !== 'undefined')?web3.eth.coinbase:'')}>
                             {(typeof window.web3 !== 'undefined')?
                              (web3.eth.coinbase !== null)?FORMAT_UTILS.toHumanFriendlyAddressPreview(web3.eth.coinbase):null:null}
                                </a>
                            </div>
                            <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 text-center border-left-1" >
                                <p  style={{fontSize:"14px"}}>{this.state.modaluser["organization_name"]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-12 vote no-padding">
                        <h3>Votes</h3>
                        <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 mobile-mtb-7">
                                <div className="thumbsup-icon float-none"><div className="thumbsup-img"><img src="./img/like-img.png" style={{height:"50px",width:"70px"}} alt="ThumbsUp"/></div><div className="votes-likes-text">40</div> </div>
                        </div>
                        <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 border-left-1">
                                <div className="thumbsdown-icon float-none"><img src="./img/dislike-img.png" style={{height:"50px",width:"70px"}} alt="ThumbsDown"/><div className="vote-dislikes-text">20</div></div>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-12 jobcostpreview no-padding">
                        <h3 >Job Cost Preview</h3>
                         <div className="col-xs-12 col-sm-12 col-md-12 no-padding">
                            <div className="col-xs-6 col-sm-6 col-md-6 bg-light" style={{fontSize:"14px"}}>Current Price</div>
                            <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter" style={{fontSize:"14px"}}> {parseInt(this.state.modaluser["price"])} AGI</div>
                            <div className="col-xs-6 col-sm-6 col-md-6 bg-light" style={{fontSize:"14px"}}>Price Model</div>
                            <div className="col-xs-6 col-sm-6 col-md-6 bg-lighter" style={{fontSize:"14px"}}>{this.state.modaluser["price_model"]}</div>
                        </div>
                    </div>
                </div>
                
                </Typography>
         </div>
         </Slide>
       </Modal>     
 </div>
 <div>
       <Modal open={this.state.openAlert}
             onClose={this.onCloseModalAlert}>
              <Slide direction="down" in={this.state.openAlert} mountOnEnter unmountOnExit>
             <div style={ModalStylesAlert} className="container popover-wrapper search-panel">
             <Typography component={'div'} >
             <p style={{fontSize:"15px",fontFamily:"arial",color:"red"}}>The balance in your escrow account is 0. Please transfer money from wallet to escrow account to proceed.</p>
             <div style={{textAlign:"center"}}><Link to="/Profile">
             <input className='btn btn-primary'  type='button' value='Go to Profile'  /> 
             </Link></div>
             </Typography>
             
             </div>
             </Slide>
       </Modal>
     </div>
 <div>
 <Modal
         open={this.state.open2}
         onClose={this.onCloseModal2}
       >
        <Slide direction="down" in={this.state.open2} mountOnEnter unmountOnExit>
         <div  className="container popover-wrapper search-panel">                         
            <div className='row'>
            <div className='col-sm-1 col-md-1 col-lg-1  rborder '> 
            </div>
                  <div className='col-sm-6 col-md-6 col-lg-6  rborder '> 
                      <div className='form-group'> 
                          <div className="search-title"><label for='search' >Search</label></div>
                                <div className="col-sm-12 col-md-12 col-lg-12 no-padding">    
                                        <div className="col-sm-9 col-md-9 col-lg-9 no-padding">
                                          <input  id='str' className="search-box-text" name='str' type='text' placeholder='Search...' value={this.state.searchterm} onChange={this.CaptureSearchterm} onKeyUp={(e) =>this.handlesearchkeyup(e)} />                                                     
                                        </div>
                                        <div className="col-sm-3 col-md-3 col-lg-3">
                                                      <input className='btn btn-primary'  id='phSearchButton' type='button' value='Search' onClick={this.handlesearch} />
                                                      <input className='btn btn-primary clear-btn'  id='phSearchButtonclear' type='button' value='Clear' onClick={this.handlesearchclear} /> 
                                        </div>
                                  </div>
                              </div>
                        </div>
                        <div className="col-sm-4 col-md-4 col-lg-4 tags-panel" ><div className="tags-title">Tags</div>
                            <ul>
                                {this.state.agents.map(rowagents => rowagents["tags"].map(rowtag =><a href="#"> <li onClick={(e)=>{this.handlesearchbytag(e,rowtag)}}>{rowtag}</li></a>))}
                            </ul>
                                                       
                        </div>       
                      </div>
         </div>
         </Slide>
       </Modal>       
 </div>
</main> 
</React.Fragment>       
    )
}
}

SampleServices.propTypes = {
  account:PropTypes.string
 
};

export default withRouter(SampleServices);
