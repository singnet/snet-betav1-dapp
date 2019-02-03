import React from 'react';
import {hasOwnDefinedProperty} from '../../util'

function stringToArray(bufferString) {
	let uint8Array = new TextEncoder("utf-8").encode(bufferString);
	return uint8Array;
}

function arrayToString(bufferValue) {
	return new TextDecoder("utf-8").decode(bufferValue);
}

export default class Test extends React.Component {

    constructor(props) {
        super(props);
        this.sendBinary = this.sendBinary.bind(this);

        this.state = {
            serviceName: "Test",
            methodName: "test",
            response: undefined, 
            data: stringToArray("Hello world!")
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
            if (typeof nextProps.response !== 'undefined') {
                if (typeof nextProps.response === 'string') {
                    this.state.response = nextProps.response;
                } else {
                    this.state.response = nextProps.response.text;
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
        this.methodsForAllServices = [];
        objects.map(rr => {
            if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
                this.allServices.push(rr);
                this.methodsForAllServices.push(rr);

                var methods = Object.keys(items[rr]["methods"]);
                methods.unshift("Select a method");
                this.methodsForAllServices[rr] = methods;
            }
        })
    }

    sendBinary() {
        console.log(this.state.data);
        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                data: this.state.data
            });
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-6 col-lg-6">
                        <button type="button" className="btn btn-primary" onClick={this.sendBinary}>Send binary</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    renderComplete() {  
        return (
            <div>
                <p style={{fontSize: "13px"}}>Expected <b>{ arrayToString(this.state.data)}</b>, Actualy <b>{this.state.response}</b> </p>
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
