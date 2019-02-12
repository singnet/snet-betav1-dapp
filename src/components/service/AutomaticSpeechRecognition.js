import React from 'react';
import {hasOwnDefinedProperty} from '../../util'

export default class AutomaticSpeechRecognition extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);

        this.state = {
            serviceName: "ASR",
            methodName: "s2t",
            response: undefined,
            data: new ArrayBuffer()
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

    handleFormUpdate(event) {
        if (event.target.name === "data" && event.target.type === "file") {
            var file = event.target.files[0];
            var self = this;
            if (file) {
                var reader = new FileReader();
        
        
                reader.loadend = function () {
        
                }
        
                reader.onload = function (e) {
                    var data = new Uint8Array(e.target.result);

                    var blob = new Blob([data], {type : 'audio/wav'});
                    var ac = document.getElementById("audio-container");
                    ac.innerHTML = "";
                    var audio = document.createElement('audio');
                    audio.setAttribute('controls', '');

                    var audioURL = window.URL.createObjectURL(blob);
                    audio.src = audioURL;
                    audio.style.height = "30px";
                    audio.style.width = "250px";
                    audio.style.marginLeft = "5px";
                    ac.appendChild(audio);
                    
                    self.setState({
                        ["data"]: data
                    });
                }
        
                reader.readAsArrayBuffer(file);
            }
            else {
                console.log("ASR Service say: Bad file!");
            }
        }
        else {
            this.setState({
                [event.target.name]: event.target.value
            });
        }

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
        // TODO validation
    }

    submitAction() {
        var btn = document.getElementById("invoke-button");
        btn.disabled = true;
        btn.innerHTML = "Wait...";

        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                data: this.state.data
            });
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Choose wav</div>
                    <div className="col-md-3 col-lg-2">
                        <input name="data" type="file" style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}} value={this.state.a} onChange={this.handleFormUpdate}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Audio</div>
                    <div id="audio-container" className="col-md-3 col-lg-2">
                    <audio controls style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}>
                        <source id="asrAudio" src="http://bonch-ikt.ru:8209/tacotron1/audio/hoho.wav" type="audio/wav"></source>
                    </audio>
                    </div>
                </div>
                
                <div className="row">
                    <div className="col-md-6 col-lg-6" style={{textAlign: "right"}}>
                        <button id="invoke-button" type="button" className="btn btn-primary" onClick={this.submitAction}>Invoke</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    renderComplete() {
        return (
            <div>
                <p style={{fontSize: "13px"}}>Response from service is <b>{this.state.response}</b> </p>
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
