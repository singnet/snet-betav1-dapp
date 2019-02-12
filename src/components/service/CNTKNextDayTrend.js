import React from 'react';
import {hasOwnDefinedProperty} from '../../util';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

export default class CNTKNextDayTrend extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.getServiceMethods = this.getServiceMethods.bind(this);

        this.state = {
            users_guide: "https://github.com/singnet/time-series-analysis/blob/master/docs/users_guide/finance/cntk-next-day-trend.md",
            code_repo: "https://github.com/singnet/time-series-analysis/blob/master/finance/cntk-next-day-trend",
            reference: "https://cntk.ai/pythondocs/CNTK_104_Finance_Timeseries_Basic_with_Pandas_Numpy.html",

            serviceName: "NextDayTrend",
            methodName: "trend",

            source: "",
            contract: "",
            start: "2010-01-01",
            end: "2018-02-11",
            target_date: "2019-02-11",

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
    componentWillReceiveProps(nextProps) {
        if(this.isComplete !== nextProps.isComplete) {
            this.parseProps(nextProps);
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

        this.methodsForAllServices = [];
        objects.map(rr => {
            if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
                this.allServices.push(rr);
                this.methodsForAllServices.push(rr);
                this.methodsForAllServices[rr] = Object.keys(items[rr]["methods"]);
            }
        });
        this.getServiceMethods(this.allServices[0]);
    }

    getServiceMethods(strService) {
        this.setState({
            serviceName: strService
        });
        var data = this.methodsForAllServices[strService];
        if (typeof data === 'undefined') {
            data = [];
        }
        this.serviceMethods = data;
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
                source: this.state.source,
                contract: this.state.contract,
                start: this.state.start,
                end: this.state.end,
                target_date: this.state.target_date
            });
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{padding: "10px", fontSize: "13px", marginLeft: "10px"}}>Source: </div>
                    <div className="col-md-3 col-lg-3">
                        <input name="source" type="text"
                               style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                               placeholder={"eg: yahoo"}
                               value={this.state.source} onChange={this.handleFormUpdate}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{padding: "10px", fontSize: "13px", marginLeft: "10px"}}>Contract: </div>
                    <div className="col-md-3 col-lg-3">
                        <input name="contract" type="text"
                               style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                               placeholder={"eg: SPY"}
                               value={this.state.contract} onChange={this.handleFormUpdate}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{padding: "10px", fontSize: "13px", marginLeft: "10px"}}>Start Date: </div>
                    <div className="col-md-3 col-lg-3" style={{width: "280px"}}>
                        <TextField
                            id="start_date"
                            type="date"
                            style={{ width: "100%" }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={this.state.start}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{padding: "10px", fontSize: "13px", marginLeft: "10px"}}>End Date: </div>
                    <div className="col-md-3 col-lg-3" style={{width: "280px"}}>
                        <TextField
                            id="start_date"
                            type="date"
                            style={{ width: "100%" }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={this.state.end}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{padding: "10px", fontSize: "13px", marginLeft: "10px"}}>Target Date: </div>
                    <div className="col-md-3 col-lg-3" style={{width: "280px"}}>
                        <TextField
                            id="start_date"
                            type="date"
                            style={{ width: "100%" }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={this.state.target_date}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{padding: "10px", fontSize: "13px", marginLeft: "10px"}}>About: </div>
                    <div className="col-xs-3 col-xs-2">
                        <Button target="_blank" href={this.state.users_guide}
                                style={{fontSize: "13px", marginLeft: "10px"}}>Guide</Button>
                    </div>
                    <div className="col-xs-3 col-xs-2">
                        <Button target="_blank" href={this.state.code_repo} style={{fontSize: "13px", marginLeft: "10px"}}>Code</Button>
                    </div>
                    <div className="col-xs-3 col-xs-2">
                        <Button target="_blank" href={this.state.reference}
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
        let trend = "\n";

        if (typeof this.state.response === "object") {
            trend = this.state.response.response;
        } else {
            status = this.state.response + "\n";
        }
        return (
            <div>
                <p style={{fontSize: "13px"}}>Response from service is: </p>
                <pre>
                    Status: {status}
                    Trend : {trend}
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
