import React from 'react';
import {hasOwnDefinedProperty} from '../../util'

export default class BinarySemanticSimilarity extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);

        this.state = {
            serviceName: "SSBERT",
            methodName: "ss_bert",
            response: undefined,
            a: "",
            b: ""
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
                    this.state.response = nextProps.response.answer;
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

    handleFormUpdate(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

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
        }
    }

    onKeyPressvalidator(event) {
        // console.log(event.target.value);
    }

    submitAction() {
        var btn = document.getElementById("invoke-button");
        btn.disabled = true;
        btn.innerHTML = "Wait...";

        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                a: this.state.a,
                b: this.state.b
            });
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Sentence 1</div>
                    <div className="col-md-3 col-lg-2">
                        <textarea name="a" placeholder="Enter a sentence 1." className="w3-input w3-border" style={{width: "250px"}} rows="4" maxLength="5000" value={this.state.a} onChange={this.handleFormUpdate}
                               onKeyPress={(e) => this.onKeyPressvalidator(e)}></textarea> 
                    </div>
                   
                </div>
                <div className="row">
                <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Sentence 2</div>
                    <div className="col-md-3 col-lg-2">
                        <textarea name="b" placeholder="Enter a sentence 2." className="w3-input w3-border" style={{width: "250px"}} rows="4" maxLength="5000" value={this.state.b} onChange={this.handleFormUpdate}
                               onKeyPress={(e) => this.onKeyPressvalidator(e)}></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6" style={{textAlign: "right", marginTop: "5px", width: "250px"}}>
                        <button id="invoke-button" type="button" className="btn btn-primary" onClick={this.submitAction}>Invoke</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    renderComplete() {
        return (
            <div>
                <p style={{fontSize: "13px"}}>Response from service is <b>This sentences is {this.state.response === "1" ? "similar" : "distinct"}</b> </p>
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
