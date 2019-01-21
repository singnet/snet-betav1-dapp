import React from 'react';
import { hasOwnDefinedProperty } from '../../util'

export default class CNTKImageRecognition extends React.Component {

  constructor(props) {
      super(props);
      this.submitAction = this.submitAction.bind(this);
      this.handleServiceName = this.handleServiceName.bind(this);
      this.handleFormUpdate = this.handleFormUpdate.bind(this);

      this.state = {
          serviceName: undefined,
          methodName: undefined,
          imgPath: undefined,
          response: undefined
      };
      this.isComplete = false;
      this.serviceMethods = [];
      this.allServices = [];
      this.methodsForAllServices = [];
      this.parseProps(props);
  }

  parseProps(nextProps) {
      this.isComplete = nextProps.isComplete;
      if (!this.isComplete) {
          this.parseServiceSpec(nextProps.serviceSpec);
      } else {
        console.log(nextProps.response)
        if (typeof nextProps.response !== 'undefined') {
            this.setState({response:JSON.stringify(nextProps.response)})
        }
      }
  }

  parseServiceSpec(serviceSpec) {
      const packageName = Object.keys(serviceSpec.nested).find(key =>
          typeof serviceSpec.nested[key] === "object" &&
          hasOwnDefinedProperty(serviceSpec.nested[key], "nested"));

      var objects = undefined;
      var items = undefined;
      if (typeof packageName !== 'undefined') {
          items = serviceSpec.lookup(packageName);
          objects = Object.keys(items);
      } else {
          items = serviceSpec.nested;
          objects = Object.keys(serviceSpec.nested);
      }

      this.allServices.push("Select a service");
      this.methodsForAllServices = [];
      objects.map(rr => {
          if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
              this.allServices.push(rr)
              this.methodsForAllServices.push(rr);

              var methods = Object.keys(items[rr]["methods"]);
              methods.unshift("Select a method");
              this.methodsForAllServices[rr] = methods;
          }
      })
  }

  handleFormUpdate() {
      this.setState({[event.target.name]: event.target.value})
  }

  handleServiceName() {
      var strService = event.target.value;
      this.setState({
          serviceName: strService
      });
      console.log("Selected service is " + strService);
      var data = [];
      if (typeof strService !== 'undefined' && strService !== 'Select a service') {
          data = Object.values(this.methodsForAllServices[strService]);
          if (typeof data !== 'undefined') {
              this.serviceMethods= data;
          }
      }

  }

  submitAction() {
      this.props.callApiCallback(this.state.serviceName,
          this.state.methodName, {
              img_path: this.state.imgPath,
              model: "ResNet152"
          });
  }

  renderForm() {
    return(
    <React.Fragment>
    <div className="row">
    <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Service Name</div>
    <div className="col-md-3 col-lg-3">
        <select style={{height:"30px",width:"250px",fontSize:"13px", marginBottom: "5px"}} onChange={this.handleServiceName}>
        {this.allServices.map((row,index) =>
        <option key={index}>{row}</option>)}
       </select>
    </div>
    </div>
    <div className="row">
    <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Method Name</div>
    <div className="col-md-3 col-lg-3">
       <select name="methodName" style={{height:"30px",width:"250px",fontSize:"13px", marginBottom: "5px"}} onChange={this.handleFormUpdate}>
        {this.serviceMethods.map((row,index) =>
        <option key={index}>{row}</option>)}
       </select>
    </div>
    </div>
    <div className="row">
        <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Image URL</div>
        <div className="col-md-3 col-lg-2">
            <input name="imgPath" type="text" style={{height: "30px",width: "250px",fontSize: "13px", marginBottom: "5px"}} onChange={this.handleFormUpdate}></input>
        </div>
    </div>
    <div className="row">
    <div className="col-md-6 col-lg-6" style={{textAlign: "right"}}>
        <button type="button" className="btn btn-primary" onClick={this.submitAction}>Invoke</button>
    </div>
    </div>
    </React.Fragment>
        )
  }


  renderComplete() {
    return(
      <div>
            <label src={ this.state.response } />
      </div>
    );
  }

  render() {
    if (this.isComplete)
        return (
            <div>
            { this.renderComplete() }
            </div>
        );
    else
    {
        return (
            <div>
            { this.renderForm() }
            </div>
        )
    }
  }
}
