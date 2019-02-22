import React from 'react';
import {Grid} from '@material-ui/core';
import SNETImageUpload from "./standardComponents/SNETImageUpload";
import {ImageGridViewer} from "./image-viewer-helpers/ImageGridViewer";

export default class HolisticEdgeDetectionService extends React.Component {

    constructor(props) {
        super(props);
        this.handleImageUpload = this.handleImageUpload.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.submitAction = this.submitAction.bind(this);

        this.state = {
            serviceName: "Edgedetect",
            methodName: "Select a method",
            uploadedImage: null,
            uploadedImageType: null
        };
    }

    canBeInvoked() {
        // When the image isn't uploaded yet and when function name isn't yet given.
        return (this.state.methodName !== "Select a method") && (this.state.uploadedImage !== null)
    }

    handleFormUpdate(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleImageUpload(imageData, mimeType) {
        this.setState({
            uploadedImage: imageData,
            uploadedImageType: mimeType
        });
    }

    handleServiceName(event) {
        let strService = event.target.value;
        this.setState({
            serviceName: strService
        });
    }

    renderServiceMethodNames(serviceMethodNames) {
        const serviceNameOptions = ["Select a method", ...serviceMethodNames];
        return serviceNameOptions.map((serviceMethodName, index) => {
            return <option key={index}>{serviceMethodName}</option>;
        });
    }

    submitAction() {
        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                image: this.state.uploadedImage,
                image_type: this.state.uploadedImageType
            });
    }

    renderForm() {
        const service = this.props.protoSpec.findServiceByName(this.state.serviceName);
        const serviceMethodNames = service.methodNames;

        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3"
                         style={{padding: "10px", fontSize: "13px", marginLeft: "10px"}}>Method Name:
                    </div>
                    <div className="col-md-3 col-lg-3">
                        <select name="methodName"
                                value={this.state.methodName}
                                style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                                onChange={this.handleFormUpdate}>
                            {this.renderServiceMethodNames(serviceMethodNames)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <SNETImageUpload imageName={""} imageDataFunc={this.handleImageUpload} disableUrlTab={true}/>
                </div>
                <div className="row" align="center">
                    <button type="button" className="btn btn-primary" disabled={!this.canBeInvoked()}
                            onClick={this.submitAction}>Call Edge Detection Algorithm
                    </button>
                </div>
            </React.Fragment>
        )
    }

    parseResponse() {
        const {response} = this.props;
        if (typeof response !== 'undefined') {
            if (typeof response === 'string') {
                return response;
            }
            return response;
        }
    }

    renderComplete() {
        const response = this.parseResponse();
        return (
            <Grid container>
                <Grid item xs={12}>
                    <ImageGridViewer result={[response]}/>
                </Grid>
            </Grid>
        );
    }

    render() {
        if (this.props.isComplete)
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
