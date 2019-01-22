import React from 'react';
import { hasOwnDefinedProperty } from '../../util'

export default class ExampleService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);

        this.state = {
            serviceName: undefined,
            methodName: undefined,
            a: 0,
            b: 0
        };
        this.response = undefined;
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
        }
        else {
            if (typeof nextProps.response !== 'undefined') {
                if (typeof nextProps.response === 'string') {
                    this.response=nextProps.response;
                } else {
                    this.response=nextProps.response.value;
                }
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

    handleFormUpdate() {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleServiceName() {
        var strService = event.target.value;
        this.setState({
            serviceName: strService
        });
        this.serviceMethods.length = 0;
        var data = [];
        if (typeof strService !== 'undefined' && strService !== 'Select a service') {
            data = Object.values(this.methodsForAllServices[strService]);
            if (typeof data !== 'undefined') {
                this.serviceMethods= data;
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

    submitAction() {
        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                a: this.state.a,
                b: this.state.b
            });
    }

    renderForm() {
        return(
        <React.Fragment>
        <div className="row">
        <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Service Name</div>
        <div className="col-md-3 col-lg-3">
            <select id="select1" style={{height:"30px",width:"250px",fontSize:"13px", marginBottom: "5px"}} onChange={this.handleServiceName}>
            {this.allServices.map((row,index) =>
            <option key={index}>{row}</option>)}
        </select>
        </div>
        </div>
        <div className="row">
        <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Method Name</div>
        <div className="col-md-3 col-lg-3">
        <select name="methodName" style={{height:"30px",width:"250px",fontSize:"13px", marginBottom: "5px"}} onChange={ this.handleFormUpdate}>
            {this.serviceMethods.map((row,index) =>
            <option key={index}>{row}</option>)}
        </select>
        </div>
        </div>
        <div className="row">
        <div className="col-md-3 col-lg-3" style={{fontSize: "13px",marginLeft: "10px"}}>Number 1</div>
        <div className="col-md-3 col-lg-2">
            <input name="a" type="text" style={{height: "30px",width: "80px",fontSize: "13px", marginBottom: "5px"}} value={this.state.a} onChange={this.handleFormUpdate} onKeyPress={(e)=>this.onKeyPressvalidator(e)}></input>
        </div>
        <div className="col-md-3 col-lg-1" style={{fontSize: "13px",marginLeft: "40px"}}>Number 2</div>
        <div className="col-md-3 col-lg-2">
            <input name="b" type="text" style={{height: "30px",width: "80px",fontSize: "13px", marginBottom: "5px"}} value={this.state.b} onChange={this.handleFormUpdate} onKeyPress={(e)=>this.onKeyPressvalidator(e)}></input>
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
            <p style={{fontSize: "13px"}}>Response from service is {this.response} </p>
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
