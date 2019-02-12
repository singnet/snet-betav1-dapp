import React from 'react';
<<<<<<< HEAD
import { hasOwnDefinedProperty } from '../../util'

import Protobuf from '../../protobuf'
import { isValid } from 'ipaddr.js';
=======
import {hasOwnDefinedProperty} from '../../util'
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577

export default class DefaultService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
<<<<<<< HEAD
        this.submitAction = this.submitAction.bind(this);
        this.handleMethodName  = this.handleMethodName.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate  = this.handleFormUpdate.bind(this);
        this.generateRequestByMethod = this.generateRequestByMethod.bind(this);
=======
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577

        this.state = {
            serviceName: undefined,
            methodName: undefined,
            response: undefined,
            paramString: "{}"
        };
<<<<<<< HEAD

        this.protobuf = {};
        this.isComplete = false
        this.serviceMethods = []
        this.allServices = []
        this.methodsForAllServices = []
=======
        this.isComplete = false;
        this.serviceMethods = [];
        this.allServices = [];
        this.methodsForAllServices = [];
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
        this.parseProps(props);
    }

    parseProps(nextProps) {
<<<<<<< HEAD
        this.isComplete = nextProps.isComplete
        if (!this.isComplete) {
            this.protobuf = new Protobuf({ jsonDescriptor: nextProps.serviceSpec })
            this.protobuf.generateStubs()
=======
        this.isComplete = nextProps.isComplete;
        if (!this.isComplete) {
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
            this.parseServiceSpec(nextProps.serviceSpec);
        } else {
            if (typeof nextProps.response !== 'undefined') {
                if (typeof nextProps.response === 'string') {
                    this.state.response = nextProps.response;
<<<<<<< HEAD
                    return
                } 

                if (nextProps.hasOwnProperty("responseObject") && nextProps.responseObject.hasOwnProperty("value") ) {
                    this.state.response = nextProps.responseObject.value;
                    return
                }


                this.state.response = JSON.stringify(nextProps.response || nextProps.responseObject)
            }
        }
    }

=======
                } else {
                    this.state.response = JSON.stringify(nextProps.response);
                }
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if(this.isComplete !== nextProps.isComplete) {
            this.parseProps(nextProps);
        }
    }
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
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
<<<<<<< HEAD
        this.methodsForAllServices = []
        objects.map(rr => {
            if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
                this.allServices.push(rr)
                this.methodsForAllServices.push(rr);


                var methods = Object.keys(items[rr]["methods"])
                methods.unshift("Select a method")
=======
        this.methodsForAllServices = [];
        objects.map(rr => {
            if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
                this.allServices.push(rr);
                this.methodsForAllServices.push(rr);

                var methods = Object.keys(items[rr]["methods"]);
                methods.unshift("Select a method");
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
                this.methodsForAllServices[rr] = methods;
            }
        })
    }
<<<<<<< HEAD

    generateRequestByMethod(methodName) {
        const { services, getFieldsFromMessage } = this.protobuf;

        const methodObject = services[this.state.serviceName].methods[methodName];
        const requestType = methodObject.RequestType;
        const fieldsRequest = getFieldsFromMessage(requestType);
  
  
        const paramString = JSON.stringify(fieldsRequest, undefined, 2);

        return paramString
    }

    handleMethodName() {
        const paramString = this.generateRequestByMethod(event.target.value)
        this.setState({
            paramString
        });

        this.handleFormUpdate();
    }
=======
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577

    handleFormUpdate(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

<<<<<<< HEAD
    handleServiceName() {
        var strService = event.target.value;
        this.setState({
            serviceName: strService
        });
        this.serviceMethods.length = 0
        var data = this.methodsForAllServices[strService];
        if (typeof data !== 'undefined') {
            this.serviceMethods = data;
=======
    handleServiceName(event) {
        let strService = event.target.value;
        this.setState({
            serviceName: strService
        });
        this.serviceMethods.length = 0;
        if (typeof strService !== 'undefined' && strService !== 'Select a service') {
            let data = Object.values(this.methodsForAllServices[strService]);
            if (typeof data !== 'undefined') {
                this.serviceMethods= data;
            }
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
        }
    }

    submitAction() {
        this.props.callApiCallback(
            this.state.serviceName,
            this.state.methodName,
            JSON.parse(this.state.paramString)
        );
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
<<<<<<< HEAD
                    <div className="col-md-3 col-lg-3" style={{ fontSize: "13px", marginLeft: "10px" }}>Service Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select id="select1" style={{ height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px" }} onChange={this.handleServiceName}>
=======
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Service Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select id="select1"
                                style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                                onChange={this.handleServiceName}>
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
                            {this.allServices.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
<<<<<<< HEAD
                    <div className="col-md-3 col-lg-3" style={{ fontSize: "13px", marginLeft: "10px" }}>Method Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select name="methodName" style={{ height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px" }} onChange={this.handleMethodName}>
=======
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Method Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select name="methodName"
                                style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                                onChange={this.handleFormUpdate}>
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
                            {this.serviceMethods.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
<<<<<<< HEAD
                    <div className="col-md-3 col-lg-3" style={{ fontSize: "13px", marginLeft: "10px" }}>Input JSON</div>
                    <div className="col-md-3 col-lg-2">
                        <textarea name="paramString" type="text" style={{ minHeight: "6em", rows: 4, height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px" }} value={this.state.paramString} onChange={this.handleFormUpdate}></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6" style={{ textAlign: "right" }}>
=======
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Input JSON</div>
                    <div className="col-md-3 col-lg-2">
                        <input name="paramString" type="text"
                               style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                               value={this.state.paramString} onChange={this.handleFormUpdate}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6" style={{textAlign: "right"}}>
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
                        <button type="button" className="btn btn-primary" onClick={this.submitAction}>Invoke</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }


    renderComplete() {
        return (
            <div>
<<<<<<< HEAD
                <p style={{ fontSize: "13px" }}>Response from service is {this.state.response} </p>
=======
                <p style={{fontSize: "13px"}}>Response from service is {this.state.response} </p>
>>>>>>> 9d130f456bd9f08329188951290288cc86a35577
            </div>
        );
    }

    render() {
        if (this.isComplete)
            return (
                <div>
                    {this.renderComplete()}
                </div>
            );
        else {
            return (
                <div>
                    {this.renderForm()}
                </div>
            )
        }
    }

}
