import React from 'react';
import { hasOwnDefinedProperty } from '../../util'

export default class ExampleService extends React.Component {

  constructor(props) {
    super(props);
    this.submitAction = this.submitAction.bind(this);
    this.state = {
        serviceName: undefined,
        methodName: undefined,
        response: undefined,
        serviceMethods: [],
        a:0,
        b:0
    };
    this.allServices = []
    this.methodsForAllServices= []
    this.parseProps(props);    
  }

  handleMethodName() {
    this.setState({methodName: event.target.value});
  }

  handleServiceName() {
    var strService = event.target.value;
    this.setState({serviceName: strService});
    console.log("Selected service is " + strService);
    var data = this.methodsForAllServices[strService];
    if(typeof data === 'undefined') {
        data = [];
    }
    this.setState({serviceMethods: data});
  }

  isComplete() {
        if(typeof this.state.response !== 'undefined') {
            console.log("Completed with response " + this.state.response);
            return true;
        }
        else {
            console.log("Not completed");
            return false;
        }
    }

    submitAction() {
    this.props.callApiCallback(this.state.serviceName, 
        this.state.methodName, {
        a: this.state.a,
        b: this.state.b
    });
  }

  parseServiceSpec(serviceSpec) {
    const packageName = Object.keys(serviceSpec.nested).find(key =>
        typeof serviceSpec.nested[key] === "object" &&
        hasOwnDefinedProperty(serviceSpec.nested[key], "nested"));
    
    const packageI = serviceSpec.lookup(packageName);
    var objservice = Object.keys(packageI)

    this.allServices.push("Select a service");
    this.methodsForAllServices = []
    objservice.map(rr => {
        if (typeof packageI[rr] === 'object' && packageI[rr] !== null && packageI[rr].hasOwnProperty("methods")) {
            this.allServices.push(rr)
            this.methodsForAllServices.push(rr);

            var methods = Object.keys(packageI[rr]["methods"])
            methods.unshift("Select a method")
            this.methodsForAllServices[rr] = methods;
        }
    })
  }

  
  parseProps(nextProps) {
    console.log(JSON.stringify(nextProps));
    if(typeof nextProps.serviceSpec !== 'undefined') {
        this.parseServiceSpec(nextProps.serviceSpec);
    }

    if(typeof nextProps.response !== 'undefined') {
        if(typeof nextProps.response === 'string') {
            this.state.response = nextProps.response; //setState({response:nextProps.response})
        }
        else {
            this.state.response = nextProps.responseObject.value; //setState({response:nextProps.responseObject.value});
        }
    }
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

  renderForm() {
    return(
    <React.Fragment>
    <div className="row">
    <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Service Name</div>
    <div className="col-md-3 col-lg-3">
        <select id="select1" style={{height:"30px",width:"250px",fontSize:"13px", marginBottom: "5px"}} onChange={(e) =>this.handleServiceName()}>
        {this.allServices.map((row,index) => 
        <option key={index}>{row}</option>)}
       </select>        
    </div>
    </div>
    <div className="row">
    <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Method Name</div>
    <div className="col-md-3 col-lg-3">   
       <select id="select2" style={{height:"30px",width:"250px",fontSize:"13px", marginBottom: "5px"}} onChange={(e) =>this.handleMethodName()}>
        {this.state.serviceMethods.map((row,index) => 
        <option key={index}>{row}</option>)}
       </select>            
    </div>
    </div>
    <div className="row">
    <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Number 1</div>
    <div className="col-md-3 col-lg-2">
        <input type="text" style={{height: "30px",width: "80px",fontSize: "13px", marginBottom: "5px"}} value={this.state.a} onChange={event => this.setState({a: event.target.value})} onKeyPress={(e)=>this.onKeyPressvalidator(e)}></input>
    </div>
    <div className="col-md-3 col-lg-1" style={{fontSize: "13px",marginLeft: "40px"}}>Number 2</div>
    <div className="col-md-3 col-lg-2">
        <input type="text" style={{height: "30px",width: "80px",fontSize: "13px", marginBottom: "5px"}} value={this.state.b} onChange={event => this.setState({b: event.target.value})} onKeyPress={(e)=>this.onKeyPressvalidator(e)}></input>
    </div>    
    </div>
    <div className="row">
    <div className="col-md-6 col-lg-6" style={{textAlign: "right"}}>
        <button type="button" className="btn btn-primary" onClick={()=>this.submitAction()}>Invoke</button>
    </div>
    </div>
    </React.Fragment>
        )
  }

  

  renderComplete() {
    return(
      <div>
        <p style={{fontSize: "13px"}}>Response from service is {this.state.response} </p> 
      </div>
    );
  }

  render() {
    if (this.isComplete())
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
