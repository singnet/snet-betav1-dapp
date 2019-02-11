import React from 'react';
import {hasOwnDefinedProperty} from '../../util'
import ServiceComponent from './ServiceComponent'

export default class DefaultService extends ServiceComponent {

    constructor(props) {
        super(props);
        var customState = {paramString: "{}"};
        Object.assign(this.state, customState);
    }

    handleResponse(response)
    {
        this.setState({response: JSON.stringify(response)});
        this.isComplete = true;
    }

    submitAction() {
        this.props.callApiCallback(
            this.state.serviceName,
            this.state.methodName,
            JSON.parse(this.state.paramString),
            this.handleResponse
        );
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
                                onChange={this.handleFormUpdate}>
                            {this.serviceMethods.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Input JSON</div>
                    <div className="col-md-3 col-lg-2">
                        <input name="paramString" type="text"
                               style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                               value={this.state.paramString} onChange={this.handleFormUpdate}></input>
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
        return (
            <div>
                <p style={{fontSize: "13px"}}>Response from service is {this.state.response} </p>
            </div>
        );
    }

}
