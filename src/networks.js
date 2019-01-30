export const NETWORKS = {
    1: {
      name: "mainnet",
      etherscan: 'https://etherscan.io',
      infura: 'http://mainnet.infura.io',
      marketplace:'',
      protobufjs:''
    },
    3: {
      name: "Ropsten",
      etherscan: 'https://ropsten.etherscan.io',
      infura: 'https://ropsten.infura.io',
      marketplace:'https://260r82zgt7.execute-api.us-east-1.amazonaws.com/ropsten/',
      protobufjs:'http://protojs.singularitynet.io/ropsten/'
    }, 
    4: {
      name: "Rinkeby",
      etherscan: 'https://rinkeby.etherscan.io', 
      infura: 'https://rinkeby.infura.io',
      marketplace:'',
      protobufjs:''
    },
    42: {
      name: "Kovan",
      etherscan: 'https://kovan.etherscan.io',
      infura: 'https:/kovan.infura.io',
      marketplace:'https://260r82zgt7.execute-api.us-east-1.amazonaws.com/kovan/',
      protobufjs:'http://protojs.singularitynet.io/kovan/',
      default:true
    },
  };

  export function getMarketplaceURL(chainId) {
    return (chainId in NETWORKS ? NETWORKS[chainId]['marketplace'] : undefined);
  }
  
  export function getProtobufjsURL(chainId) {
    return (chainId in NETWORKS ? NETWORKS[chainId]['protobufjs'] : undefined);
  }