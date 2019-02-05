import { base64ToHex } from '../util'
import { Requests } from '../requests'

export default class ChannelHelper {
  constructor() {
    this.channels = undefined;
    this.groupId = undefined;
    this.endpoint = undefined;
    this.channelId = undefined;
    this.recipient = undefined;
    this.currentSignedAmount = 0;
  }

  reInitialize(channelInfoUrl) {
    this.channels = undefined;
    this.groupId = undefined;
    this.endpoint = undefined;
    this.channelId = undefined;
    this.recipient = undefined;
    this.currentSignedAmount = 0;
    return this.fetchChannels(channelInfoUrl);
  }

  setCurrentSignedAmount(amount) {
    this.currentSignedAmount = amount;
  }

  getCurrentSignedAmount() {
    return this.currentSignedAmount;
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

  getChannel(channelId) {
    let channels = this.getChannels();
    for(let ii=0; ii < channels.length; ii++) {
      if (channels[ii]["channelId"] === channelId)
      {
        return channels[ii];
      }
    }
    return undefined;
  }

  getExpiryBlock() {
    let channels = this.getChannels();
    let expiryBlock = 0;
    for(let ii=0; ii < channels.length; ii++) {
      var rrchannels = channels[ii];
      if (rrchannels["channelId"] === this.channelId)
      {
        expiryBlock = rrchannels["expiration"];
        break;
      }
    }
    return expiryBlock;
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
    console.log("Populated channels");
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

  findExistingChannel(data, thresholdBlockNumber) {
    if (typeof this.channels !== 'undefined')
    {
      console.log('channel state information is ' +  this.groupId);
      if (this.channels.length > 0)
      {
        for(let ii=0; ii < this.channels.length; ii++) {
          var rrchannels = this.channels[ii];
          if (parseInt(rrchannels["balance_in_cogs"]) >= parseInt(data["price_in_cogs"]) 
              && parseInt(rrchannels["expiration"]) >= thresholdBlockNumber)
          {
            console.log("Found a channel with adequate funds " + JSON.stringify(rrchannels));
            console.log("Setting channel ID to " + rrchannels["channelId"]);
            this.channelId = rrchannels["channelId"];    
            return true;
          }  
        }

        this.channelId = this.channels[0]["channelId"]; 
        return true; 
      }
    }
    console.log("Did not find a channel with adequate funds");
    return false;
  }  
}