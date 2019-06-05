const bitcoin = require("bitcoinjs-lib")
const BigNumber = require('bignumber.js');
const { NETWORKS } = require("./networks.js") 

export const AGENT_STATE = {
  "ENABLED": 0,
  "DISABLED": 1,
};

export const STRINGS = {
  "NULL_ADDRESS": "0x0000000000000000000000000000000000000000"
};

export const MESSAGES = {
  "WAIT_FOR_MM": "Waiting for Metamask interaction",
  "WAIT_FOR_TRANSACTION": "Waiting for transaction to be mined",
  "WAIT_FOR_BC_CALL": "Waiting for blockchain call to complete",
  "WAIT_FOR_NEW_CHANNEL": "Waiting to get a new channel",
  "WAIT_FOR_RESPONSE": "Waiting for the response",
  "ZERO_ESCROW_BALANCE": "You do not have any balance in your escrow account. Please transfer tokens from your wallet to the escrow account to proceed.",
  "WAIT_FOR_CHANNEL_STATE": "Checking if the channel has balance for this call"
};

export class AGI {
  static toDecimal(agi) {
    return (agi / 100000000).toFixed(8);
  }

  static inAGI(cogs) {
    return (cogs / 100000000).toFixed(8);
  }

  static inCogs(web3, value) {
    return new BigNumber(web3.toWei(value, "ether") / (10 ** (10))).toNumber();
  }  
}

export class FORMAT_UTILS {
  /**
   * Shortens a long ethereum address to a human-friendly abbreviated one. Assumes the address starts with '0x'.
   *
   * An address like 0x2ed982c220fed6c9374e63804670fc16bd481b8f provides no more value to a human than
   * a shortened version like 0x2ed9...1b8f. However, screen real estate is precious, especially to real users
   * and not developers with high-res monitors.
   */
  static toHumanFriendlyAddressPreview(address) {
    const addressPrefix = '0x';
    const previewLength = 4;

    const addressToShorten = address.startsWith(addressPrefix) ? address.substring(addressPrefix.length) : address;
    const previewPrefix = addressToShorten.substring(0, previewLength);
    const previewSuffix = addressToShorten.substring(addressToShorten.length - previewLength);

    return `0x${previewPrefix}...${previewSuffix}`;
  }
}

const ERROR_MESSAGE = {
  denied: "User denied permission to access ethereum account",
  reject: "User rejected transaction submission or message signing",
  failed: "Transaction mined, but not executed",
  internal: "Internal Server Error",
  unknown: "Error"
};

const RPC_ERROR_BOUNDS = {
  internal: [-31099, -32100]
};

export const DEFAULT_GAS_PRICE = 4700000;
export const DEFAULT_GAS_ESTIMATE = 210000;

export class ERROR_UTILS {

  static sanitizeError(error) {
    if (typeof error === 'string' && error.indexOf("provider access") != -1) {
        return ERROR_MESSAGE.denied;
    }
    
    if (typeof error === 'object') {
      if(error.hasOwnProperty("value")) {
        // It checks for rejection on both cases of message or transaction
        if (error.value.message.indexOf("User denied") != -1) {
          return ERROR_MESSAGE.reject;
        }

        //Checks for Internal server error 
        if (error.value.code > RPC_ERROR_BOUNDS.internal[0] && error.value.code < RPC_ERROR_BOUNDS.internal[1]) {
          return ERROR_MESSAGE.internal
        }
      } 
      else if(error.hasOwnProperty("message")) {
        return error.message;
      }
    }

    if (typeof error === 'object' && error.hasOwnProperty("status") && error.status === "0x0") {
      //This is the receipt
      return `${ERROR_MESSAGE.failed} TxHash: ${error.transactionHash}`
    }

    return ERROR_MESSAGE.unknown + " [" + String(error) + "]"
  }
}

export const isValidAddress = (address, coin, network) => {
  if (coin === 'bitcoin') {
    network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
    try {
      bitcoin.address.toOutputScript(address, network)
      return true
    } catch (e) {
      return false
    }
  } 
  return false
}

export function hasOwnDefinedProperty(object, property) { return object.hasOwnProperty(property) && typeof object[property] !== "undefined" }


export function hexToAscii(hexString) { 
  let asciiString = Eth.toAscii(hexString);
  return asciiString.substr(0,asciiString.indexOf("\0")); // name is right-padded with null bytes
}

export function base64ToHex(base64String) {
  var byteSig = Buffer.from(base64String, 'base64');
  let buff = new Buffer(byteSig);
  let hexString = "0x"+buff.toString('hex');
  return hexString;
}

export function getMarketplaceURL(chainId) {
  return (chainId in NETWORKS ? NETWORKS[chainId]['marketplace'] : undefined);
}

export function getProtobufjsURL(chainId) {
  return (chainId in NETWORKS ? NETWORKS[chainId]['protobufjs'] : undefined);
}

export function isSupportedNetwork(chainId) {
  const marketPlaceURL = getMarketplaceURL(chainId);
  if(typeof marketPlaceURL === 'undefined' || marketPlaceURL === "") {
    console.log("Ignore network " + chainId)
    return false;
  }
  return true;
}

export const BLOCK_OFFSET = 80640 //# Approximately blocks generated in 30 minutes
export const BLOCK_TIME_SECONDS = 15 // Number of seconds, a single block unit corresponds to.