import React from 'react';
import { hasOwnDefinedProperty } from '../../util'


export default class DefaultService extends React.Component {

  constructor(props) {
    super(props);
    this.submitAction = this.submitAction.bind(this);
    this.state = {
        serviceName: undefined,
        methodName: undefined,
        response: undefined,
        serviceMethods: [],
        paramString: "{}"
    };
    this.allServices = []
    this.methodsForAllServices= []
    this.parseProps(props);      
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

  updateValid() {
    let inputValid = true;
    
    try {
        JSON.parse(this.state.paramString);
    } catch(e) {
        inputValid = false;
    }

    if (this.state.serviceName.length == 0)
        inputValid = false;
    
    if (this.state.methodName.length == 0)
        inputValid = false;
        
    this.setState({
        inputValid: inputValid
    });
  }
  
  handleChange(type, e) {
    this.setState({
        [type]: e.target.value,
    });
    this.updateValid();
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
    
  parseServiceSpec(serviceSpec) {
    const packageName = Object.keys(serviceSpec.nested).find(key =>
        typeof serviceSpec.nested[key] === "object" &&
        hasOwnDefinedProperty(serviceSpec.nested[key], "nested"));
    
    var objects = undefined;
    var items = undefined;
    if(typeof packageName !== 'undefined') {
        items = serviceSpec.lookup(packageName);
        objects = Object.keys(items);
    } 
    else {
        items = serviceSpec.nested;
        objects = Object.keys(serviceSpec.nested);
    }

    this.allServices.push("Select a service");
    this.methodsForAllServices = []
    objects.map(rr => {
        if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
            this.allServices.push(rr)
            this.methodsForAllServices.push(rr);

            var methods = Object.keys(items[rr]["methods"])
            methods.unshift("Select a method")
            this.methodsForAllServices[rr] = methods;
        }
    })
  }

  submitAction() {
    this.props.callApiCallback(
      this.state.serviceName,
      this.state.methodName, 
      JSON.parse(this.state.paramString)
    );
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
    <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Input JSON</div>
    <div className="col-md-3 col-lg-2">
        <input type="text" style={{height: "30px",width: "250px",fontSize: "13px", marginBottom: "5px"}} value={this.state.paramString} onChange={event => this.setState({paramString: event.target.value})}></input>
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
