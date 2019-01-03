const bitcoin = require("bitcoinjs-lib")
const BigNumber = require('bignumber.js');

export const NETWORKS = {
  1: {
    name: "mainnet",
    etherscan: 'https://etherscan.io',
    infura: 'http://mainnet.infura.io',
    marketplace:'',
    protobufjs:'http://protobufjs.singularitynet.io/'
  },
  3: {
    name: "Ropsten",
    etherscan: 'https://ropsten.etherscan.io',
    infura: 'https://ropsten.infura.io',
    marketplace:'',
    protobufjs:'http://protobufjs.singularitynet.io/'
  },
  4: {
    name: "Rinkeby",
    etherscan: 'https://rinkeby.etherscan.io',
    infura: 'https://rinkeby.infura.io',
    marketplace:'',
    protobufjs:'http://protobufjs.singularitynet.io/'
  },
  42: {
    name: "Kovan",
    etherscan: 'https://kovan.etherscan.io',
    infura: 'https:/kovan.infura.io',
    marketplace:'https://nhsdguu656.execute-api.us-east-1.amazonaws.com/kovan/',
   // marketplace:'https://260r82zgt7.execute-api.us-east-1.amazonaws.com/kovan/',
    protobufjs:'http://protobufjs.singularitynet.io/',
    default:true
  },
};

export const SERVICE_SPEC_PROVIDER_URL = "http://protobufjs.singularitynet.io"

export const AGENT_STATE = {
  "ENABLED": 0,
  "DISABLED": 1,
};

export const STRINGS = {
  "NULL_ADDRESS": "0x0000000000000000000000000000000000000000"
};

export function generateUniqueID(orgId,serviceId) {
  return orgId + "__$%^^%$__" + serviceId;
};

export async function postApi(url,useraddress){
  const settings = 
  { 
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
  },  
    method: 'POST',
    body: JSON.stringify({
      user_address: useraddress
    })
  }
  try{
        const data = await fetch(url, settings)
        .then(response => response.json())
        .then(json => {
            return json;
        })
        .catch(err => {
            return err
        });
        return data

  }
  catch(err)
  {
   console.log(err)
  }
}
export async function getApi (url) {
  try{
    // wait for a response
    // after response it will assign it to the variable 'resp' and continue
         const resp = await fetch(url)
    // only run if response has been asssigned
         const data = await resp.json() 
    // this code only runs when data is assigned.
         return data
       } catch (err) {
            console.log(err)
         }
    }


export class AGI {
  static toDecimal(agi) {
    return agi / 100000000;
  }

  static inAGI(cogs) {
    return cogs / 100000000;
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
  unknown: "Unknown error"
};

const RPC_ERROR_BOUNDS = {
  internal: [-31099, -32100]
};

export class ERROR_UTILS {

  static sanitizeError(error) {
    if (typeof error === 'string' && error.indexOf("provider access") != -1) {
        return ERROR_MESSAGE.denied;
    }
    
    if (typeof error === 'object' && error.hasOwnProperty("value")) {
      // It checks for rejection on both cases of message or transaction
      if (error.value.message.indexOf("User denied") != -1) {
        return ERROR_MESSAGE.reject;
      }

      //Checks for Internal server error 
      if (error.value.code > RPC_ERROR_BOUNDS.internal[0] && error.value.code < RPC_ERROR_BOUNDS.internal[1]) {
        return ERROR_MESSAGE.internal
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

export const BLOCK_OFFSET = 5760 //# blocks generated in 24 hrs