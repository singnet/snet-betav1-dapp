import React from 'react'
import ServiceMappings from "../components/service/ServiceMappings.js"
import PropTypes from 'prop-types'
import GRPCProtoV3Spec from "../models/GRPCProtoV3Spec";
import TextField from '@material-ui/core/TextField';
import { JobdetailsStandalone } from './JobDetailsStandalone.js';
import BlockchainHelper from "../components/BlockchainHelper.js"

class Standalone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orgID:'snet',
      serviceID:'example-service',
      proto:'syntax = "proto3";  package example_service;  message Numbers {     float a = 1;     float b = 2; }  message Result {     float value = 1; }  service Calculator {     rpc add(Numbers) returns (Result) {}     rpc sub(Numbers) returns (Result) {}     rpc mul(Numbers) returns (Result) {}     rpc div(Numbers) returns (Result) {} }',
      endpoint:'http://localhost:7052',
      errorMessage:'',
      userAddress:undefined
    };

    this.network = new BlockchainHelper();
    this.serviceSpecJSON = '';
    this.serviceMappings = new ServiceMappings();

    this.handleField = this.handleField.bind(this);
    this.onOpenJobDetailsSlider = this.onOpenJobDetailsSlider.bind(this);
    this.fetchWeb3Account = this.fetchWeb3Account.bind(this);
  }

  componentDidMount() {
    window.addEventListener('load', () => this.handleWindowLoad());
    this.handleWindowLoad();
    this.fetchWeb3Account();
  }

  handleWindowLoad() {
    this.network.initialize();
  }

  handleField(e) {
    this.setState({errorMessage: ''})
    const { name, value } = e.target;
    this.setState({[name]: value,})
  }

  runJob() {
    this.errorMessage = ''
    this.generate_service_spec_json(this.proto);
  }

  generate_service_spec_json() {
    try {
        const protobuf = require("protobufjs");
        protobuf.parse.defaults.keepCase = true;
        let obj = protobuf.parse(this.state.proto)
        this.serviceSpecJSON = obj.root; 
        this.protoSpec = new GRPCProtoV3Spec(this.serviceSpecJSON);
        this.onOpenJobDetailsSlider();
    }
    catch(ex) {
        this.setState({errorMessage: "Exception while parsing proto [" + ex + "]"});
        console.log("Unable to generate service spec json. Please ensure that " + this.proto + " is a valid proto file")
        console.log(ex)
    }
}

  onOpenJobDetailsSlider() {
    let serviceState = {}
    serviceState["org_id"] = this.state.orgID;
    serviceState["service_id"] = this.state.serviceID;
    serviceState["is_available"] = 1;
    serviceState["serviceSpecJSON"] = this.serviceSpecJSON
    serviceState["endpoint"] =this.state.endpoint
    serviceState["protoSpec"] = this.protoSpec

    this.refs.jobdetailsComp.onOpenJobDetails(serviceState);
  }

  async fetchWeb3Account(){
    const getAccountDetails = await web3.eth.getAccounts;
    getAccountDetails((e,accounts)=>{
      this.setState({userAddress:accounts[0]});
    })
  }
  
  renderBase() {
    return(
      <React.Fragment>
        <div className="standalone-container">
          <div className="row">
            <div className="col-xs-5 col-sm-4 col-md-5 mtb-10">
              Org ID (Used to look up servicemappings)
            </div>
            <div className="col-xs-7 col-sm-8 col-md-7 input-container">
              <TextField id="orgID" name="orgID" onChange={this.handleField} value={this.state.orgID} style={{ width: "100%", fontWeight: "bold" }}/>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-5 col-sm-4 col-md-5 mtb-10">
              Service ID (Used to look up servicemappings)
            </div>
            <div className="col-xs-7 col-sm-8 col-md-7 input-container">
              <TextField id="serviceID" name="serviceID" onChange={this.handleField} value={this.state.serviceID} style={{ width: "100%", fontWeight: "bold" }}/>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-5 col-sm-4 col-md-5 mtb-10">
              Proto Contents
            </div>
            <div className="col-xs-7 col-sm-8 col-md-7 input-container">
              <TextField id="proto" name="proto" onChange={this.handleField} value={this.state.proto} style={{ width: "100%", fontWeight: "bold" }}/>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-5 col-sm-4 col-md-5 mtb-10">
              Endpoint of daemon with blockchain disabled
            </div>
            <div className="col-xs-7 col-sm-8 col-md-7 input-container">
              <TextField id="endpoint" name="endpoint" onChange={this.handleField} value={this.state.endpoint} style={{ width: "100%", fontWeight: "bold" }}/>
            </div>
          </div>

          <div className="col-xs-12 col-sm-12 col-md-12 text-center">
            <button type="button" className="btn btn-primary width-mobile-100" onClick={()=>this.runJob()}>Execute Component</button>
          </div>
          {(this.state.errorMessage === '') ?
            null :
            <div className="col-xs-5 col-sm-4 col-md-5 mtb-10 error-msg">
                {this.state.errorMessage}
            </div>            
          }
        </div>
        
        <JobdetailsStandalone ref="jobdetailsComp" 
          userAddress= {this.state.userAddress}
          chainId={this.network.chainId}
          network={this.network}
          reloadDetails={()=>{}}/>
      </React.Fragment>
    )
  }

  render() {
      return (
          <div>
              {this.renderBase()}
          </div>
      )
  }
}

  Standalone.propTypes = {
    account: PropTypes.string
  };
  export default Standalone;