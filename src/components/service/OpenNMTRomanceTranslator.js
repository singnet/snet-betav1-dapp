import React from 'react';
import {hasOwnDefinedProperty} from '../../util';
import Button from '@material-ui/core/Button';

export default class OpenNMTRomanceTranslator extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);

        this.state = {
            users_guide: "https://github.com/singnet/nlp-services/blob/master/docs/users_guide/opennmt-romance-translator.md",
            code_repo: "https://github.com/singnet/nlp-services/blob/master/opennmt-romance-translator",
            reference: "http://forum.opennmt.net/t/training-romance-multi-way-model/86",

            serviceName: undefined,
            methodName: undefined,

            source_lang: "",
            target_lang: "",
            sentences_url: "",

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
            console.log(nextProps.response);
            if (typeof nextProps.response !== 'undefined') {
                this.state.response = nextProps.response;
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
        this.setState({[event.target.name]: event.target.value})
    }

    handleServiceName(event) {
        var strService = event.target.value;
        this.setState({
            serviceName: strService
        });
        console.log("Selected service is " + strService);
        var data = this.methodsForAllServices[strService];
        if (typeof data === 'undefined') {
            data = [];
        }
        this.serviceMethods = data;
    }

    submitAction() {
        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                sourceLang: this.state.source_lang,
                targetLang: this.state.target_lang,
                sentencesUrl: this.state.sentences_url
            });
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Service Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                                onChange={this.handleServiceName}>
                            {this.allServices.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Method Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select name="methodName"
                                style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                                onChange={this.handleFormUpdate}>
                            {this.serviceMethods.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Source Language
                    </div>
                    <div className="col-md-3 col-lg-2">
                        <input name="source_lang" type="text"
                               style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                               value={this.state.source_lang} onChange={this.handleFormUpdate}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Target Language
                    </div>
                    <div className="col-md-3 col-lg-2">
                        <input name="target_lang" type="text"
                               style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                               value={this.state.target_lang} onChange={this.handleFormUpdate}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Sentences (URL)
                    </div>
                    <div className="col-md-3 col-lg-2">
                        <input name="sentences_url" type="text"
                               style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                               value={this.state.sentences_url} onChange={this.handleFormUpdate}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>About</div>
                    <div className="col-xs-3 col-xs-2">
                        <Button href={this.state.users_guide}
                                style={{fontSize: "13px", marginLeft: "10px"}}>Guide</Button>
                    </div>
                    <div className="col-xs-3 col-xs-2">
                        <Button href={this.state.code_repo} style={{fontSize: "13px", marginLeft: "10px"}}>Code</Button>
                    </div>
                    <div className="col-xs-3 col-xs-2">
                        <Button href={this.state.reference}
                                style={{fontSize: "13px", marginLeft: "10px"}}>Reference</Button>
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
        let status = "Ok\n";
        let translation = "\n";

        if (typeof this.state.response === "object") {
            translation = "\n" + this.state.response.translation;
        } else {
            status = this.state.response + "\n";
        }
        return (
            <div>
                <p style={{fontSize: "13px"}}>Response from service is: </p>
                <pre>
                    Status     : {status}
                    Translation:
                    {translation}
                </pre>
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
