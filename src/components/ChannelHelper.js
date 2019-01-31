import { AGI, base64ToHex, BLOCK_OFFSET } from '../util'
import { Requests } from '../requests'
import {serviceStateJSON} from '../service_state'
import { Root } from 'protobufjs'

export default class ChannelHelper {
  constructor() {
    this.channels = undefined;
    this.groupId = undefined;
    this.endpoint = undefined;
    this.channelId = undefined;    
    this.recipient = undefined;
  }

  reInitialize(channelInfoUrl) {
    this.channels = undefined;
    this.groupId = undefined;
    this.endpoint = undefined;
    this.channelId = undefined;
    this.recipient = undefined;
    return this.fetchChannels(channelInfoUrl);
  }

  getChannelId() {
    return this.channelId;
  }

  setChannelId(channelId) {
    return this.channelId = channelId;
  }

  getGroupId() {
    return this.groupId;
  }

  getEndpoint() {
    if(typeof this.endpoint === 'undefined') {
      return undefined
    }
    return this.endpoint[0];
  }

  getExpiryBlock() {
    let channels = this.getChannels();    
    for(let ii=0; ii < channels.length; ii++) {
      var rrchannels = channels[ii];
      if (rrchannels["channelId"] === this.channelId)
      {
        nonce = rrchannels["expiration"];
        break;
      }
    }
    return nonce;
  }

  getRecipient() {
    return this.recipient;
  }

  getNonce(defaultValue) {
    let nonce = defaultValue;
    let channels = this.getChannels();    
    for(let ii=0; ii < channels.length; ii++) {
      var rrchannels = channels[ii];
      if (rrchannels["channelId"] === this.channelId)
      {
        nonce = rrchannels["nonce"];
        break;
      }
    }
    return nonce;
  }

  getChannels() {
    let channels = this.channels;
    if (typeof channels === 'undefined'){
      channels = [];
    }
    return channels
  }

  fetchChannels(channelInfoUrl) {
    var caller = this;
    Requests.get(channelInfoUrl).then(channeldata => 
      new Promise(function(resolve) {
        caller.populateChannelDetails(channeldata["data"]);
        resolve();
        }));
  }

  populateChannelDetails(channels) {
    if(typeof channels === 'undefined' || channels.length === 0) {
      console.log("Unable to get channel information");
      return;
    }

    this.channels = channels[0]["channels"];
    this.endpoint = channels[0]["endpoint"]
    this.groupId = channels[0]["groupId"];
    this.recipient = channels[0]["recipient"];
  }

  matchEvent(evt, result, senderAddress, groupidgetter, recipientaddress) {
    console.log("result from event: " + result);
    var event = result.event;
    console.log("event: " + event);
    var agentGroupID = base64ToHex(groupidgetter);
    if (event == "ChannelOpen") {
      var MPEChannelId = result.args.channelId;
      var channelSender = result.args.sender;
      var channelRecipient = result.args.recipient;
      var channelGoupId = result.args.groupId;

      console.log("Channel details - [" + channelGoupId + "] [" + channelRecipient + "] [" + channelSender + "]");
      console.log("App details - [" + agentGroupID + "] [" + recipientaddress + "] [" + senderAddress + "]");
      if (channelGoupId === agentGroupID && channelSender.toLowerCase() === senderAddress.toLowerCase() && recipientaddress.toLowerCase() === channelRecipient.toLowerCase()) {
        console.log("Matched channel id " + MPEChannelId)
        this.channelId = MPEChannelId;
        evt.stopWatching();
      }
      console.log("channel id" + this.channelId);
    }
  }

  testChannelState(channelDetails) {
    var ethereumjsabi = require('ethereumjs-abi');
    var sha3Message = ethereumjsabi.soliditySHA3(
        ["uint256"],[channelDetails["channelId"]]);
    var msg = "0x" + sha3Message.toString("hex");
    window.ethjs.personal_sign(msg, web3.eth.defaultAccount)
    .then((signed) => {
      var stripped = signed.substring(2, signed.length)
      var byteSig = new Buffer(Buffer.from(stripped, 'hex'));
      console.log(byteSig.toString('base64'))
      const byteschannelID = Buffer.alloc(4);
      byteschannelID.writeUInt32BE(20, 0);

      let requestObject   = ({"channelId":byteschannelID, "signature":byteSig})
      console.log('after calling readFile' + serviceStateJSON);
      const packageName = 'escrow'
      const serviceName = 'PaymentChannelStateService'
      const methodName = 'GetChannelState'

      const requestHeaders = {}

      console.log("Invoking service with package " + packageName + " serviceName " + serviceName + " methodName " + methodName + + " request " + JSON.stringify(requestObject));
      const Service = Root.fromJSON(serviceStateJSON).lookup(serviceName)
      const serviceObject = Service.create(rpcImpl(channelDetails["endpoint"], packageName, serviceName, methodName, requestHeaders), false, false)
      grpcRequest(serviceObject, methodName, requestObject)
        .then(response => {
          console.log("Got a GRPC response " + JSON.stringify(response))
          console.log(response.currentSignedAmount)
          let buffer = Buffer.from(response.currentSignedAmount);
          console.log(buffer.readUIntBE(0, response.currentSignedAmount.length));
        })
        .catch((err) => {
          console.log("GRPC call failed")
          console.log(err);
        })
  });
  }

  findChannelWithBalance(data, currentBlockNumber) {
    if (typeof this.channels !== 'undefined')
    {
      console.log('channel state information is ' +  this.groupId);
      if (this.channels.length > 0)
      {
        for(let ii=0; ii < this.channels.length; ii++) {
          var rrchannels = this.channels[ii];
          if (parseInt(rrchannels["balance_in_cogs"]) >= parseInt(data["price_in_cogs"])) 
              //&& parseInt(rrchannels["expiration"]) >= (currentBlockNumber + BLOCK_OFFSET))
          {
            console.log("Found a channel with adequate funds " + JSON.stringify(rrchannels));
            console.log("Setting channel ID to " + rrchannels["channelId"]);
            this.channelId = rrchannels["channelId"];    
            return true;
          }  
        }
      }
    }
    console.log("Did not find a channel with adequate funds");
    return false;
  }  
}