import React from 'react';
import {hasOwnDefinedProperty} from '../../util'
import ImageUploader from './emotion-recognition-service/ImageUploader.js'
import {getBase64} from "./emotion-recognition-service/util";
import Result from './emotion-recognition-service/Result';
import {utf8} from "utf8"
import {base64js} from 'base64-js';


export default class EmotionRecognitionService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleMethodUpdate = this.handleMethodUpdate.bind(this);
        this.handleImageUpload = this.handleImageUpload.bind(this);

        this.state = {
            serviceName: undefined,
            methodName: undefined,
            response: undefined,
            uploadedFile: null,
            encodedImage: null,
            preview: null,
            image_type: ''
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
                console.log(nextProps.response);
                if (typeof nextProps.response === 'string') {
                    console.log(nextProps.response);
                    this.state.response = nextProps.response;
                } else {
                    console.log(nextProps.response);
                    this.state.response = nextProps.response;
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

    handleMethodUpdate(event) {
        this.setState({
            methodName: event.target.value
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
                this.serviceMethods = data;
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

    handleImageUpload(file) {
        getBase64(file).then((data) => {
            let encoded = data.replace(/^data:(.*;base64,)?/, '');
            encoded.length % 4 > 0 &&
            (encoded += '='.repeat(4 - (encoded.length % 4)));
            this.setState({
                uploadedFile: file,
                encodedImage: encoded,
                previewImage: data,
                image_type: file.name.split('.')[1]
            });
        });

    }

    submitAction() {
        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                image: this.state.encodedImage,
                image_type: this.state.image_type
            });
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Service Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select id="select1"
                                style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
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
                                onChange={this.handleMethodUpdate}>
                            {this.serviceMethods.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <ImageUploader handleImageUpload={this.handleImageUpload}
                                   preview={this.state.previewImage}
                                   uploadedFile={this.state.uploadedFile}
                    />
                </div>
                <div className="row" align="center">
                    <button type="button" className="btn btn-primary"
                            disabled={!this.state.uploadedFile || !(this.state.methodName !== 'Select a method') || !(this.state.serviceName !== 'Select a service')}
                            onClick={this.submitAction}>Call Emotion Recognizer
                    </button>
                </div>
            </React.Fragment>
        )
    }

    renderComplete() {
        return (
            <Result
                jobResult={this.state.response}
                inputImage={this.state.previewImage}
            />
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
