import React from 'react';
import {hasOwnDefinedProperty} from '../../util'
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

export default class TimeSeriesAnomalyDiscoveryService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            serviceName: undefined,
            methodName: undefined,
            
            timeseries: undefined,
            alphabet: undefined,
            slidingwindowsize: undefined,
            paasize: undefined,
            debugflag: "0",

            response: undefined
        };

        this.message = undefined;
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
                    this.setState({response: nextProps.response});
                } else {
                    this.setState({response: nextProps.response.value});
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

        this.methodsForAllServices = [];
        objects.map(rr => {
            if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
                this.allServices.push(rr);
                this.methodsForAllServices.push(rr);
                var methods = Object.keys(items[rr]["methods"]);
                this.methodsForAllServices[rr] = methods;
            }
        });
    }

    handleFormUpdate(event) {
        console.log(event.target);
        this.setState({[event.target.name]: event.target.value});
    }

    handleServiceName(event) {
        var strService = event.target.value;
        this.setState({serviceName: strService});
        this.serviceMethods.length = 0;
        var data = Object.values(this.methodsForAllServices[strService]);
        if (typeof data !== 'undefined') {
            console.log("typeof data !== 'undefined'");
            this.serviceMethods = data;
        }
    }

    submitAction() {
        this.props.callApiCallback(
            this.state.serviceName,
            this.state.methodName, {
                timeseries: this.state.timeseries,
                alphabet: this.state.alphabet,
                slidingwindowsize: this.state.slidingwindowsize,
                paasize: this.state.paasize,
                debugflag: this.state.debugflag
            });
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    };

    renderForm() {
        return (
            <React.Fragment>
                <Grid item xs={12}>
                    <br/>
                    <br/>
                    <FormControl style={{minWidth: '100%'}}>
                        <Select
                            value={this.state.serviceName}
                            onChange={this.handleServiceName}
                            displayEmpty
                            name="serviceName"
                            style={{fontSize: 15}}
                        >
                            <MenuItem style={{fontSize: 15}} value={undefined}>
                                <em>Select a Service</em>
                            </MenuItem>
                            {this.allServices.map((item) =>
                                <MenuItem style={{fontSize: 15}} value={item} key={item}>{item}</MenuItem>
                            )};
                        </Select>
                    </FormControl>
                    <br/>
                    <br/>
                    <FormControl style={{minWidth: '100%'}}>
                        <Select
                            value={this.state.methodName}
                            onChange={this.handleFormUpdate}
                            displayEmpty
                            name="methodName"
                            style={{fontSize: 15}}
                        >

                            <MenuItem style={{fontSize: 15}} value={undefined}>
                                <em>Select a Method</em>
                            </MenuItem>
                            {this.serviceMethods.map((item) =>
                                <MenuItem style={{fontSize: 15}} value={item}>{item}</MenuItem>
                            )};
                        </Select>
                    </FormControl>
                    <br/>
                    <TextField
                        id="standard-multiline-static"
                        label="Time Series"
                        style={{width: "100%"}}
                        InputProps={{
                            style: {fontSize: 15}
                        }}
                        InputLabelProps={{
                            style: {fontSize: 15}
                        }}
                        value={this.state.timeseries}
                        name="timeseries"
                        onChange={this.handleChange}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                    <TextField
                        id="standard-multiline-static"
                        label="Alphabet"
                        style={{width: "100%"}}
                        InputProps={{
                            style: {fontSize: 15}
                        }}
                        InputLabelProps={{
                            style: {fontSize: 15}
                        }}
                        value={this.state.alphabet}
                        name="alphabet"
                        onChange={this.handleChange}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                    <TextField
                        id="standard-multiline-static"
                        label="Sliding Window Size"
                        style={{width: "100%"}}
                        InputProps={{
                            style: {fontSize: 15}
                        }}
                        InputLabelProps={{
                            style: {fontSize: 15}
                        }}
                        value={this.state.slidingwindowsize}
                        name="slidingwindowsize"
                        onChange={this.handleChange}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                    <TextField
                        id="standard-multiline-static"
                        label="Piecewise Aggregate Approximation Size"
                        style={{width: "100%"}}
                        InputProps={{
                            style: {fontSize: 15}
                        }}
                        InputLabelProps={{
                            style: {fontSize: 15}
                        }}
                        value={this.state.paasize}
                        name="paasize"
                        onChange={this.handleChange}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <Button variant="contained" color="primary" onClick={this.submitAction}>Invoke</Button>
                </Grid>
            </React.Fragment>
        )
    }

    renderComplete() {
        return (
            <React.Fragment>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <h4>
                        The above numbers are the indexes of the original time series in which anomalies were detected:
                    </h4>
                    <br/>
                    <div style={{padding: 20, backgroundColor: "#E5EFFC"}}>
                        <h5>
                            {this.state.response}
                        </h5>
                    </div>
                </Grid>
            </React.Fragment>
        );
    }

    render() {
        if (this.isComplete)
            return (
                <div style={{flexGrow: 1}}>
                    <Grid container
                          direction="row"
                          justify="center"
                          alignItems="center"
                          style={{marginTop: 15, marginBottom: 15}}
                    >
                        {this.renderComplete()}
                    </Grid>
                </div>
            );
        else {
            return (
                <div style={{flexGrow: 1}}>
                    <Grid container
                          direction="row"
                          justify="center"
                          alignItems="center"
                          style={{marginTop: 15, marginBottom: 15}}
                    >
                        {this.renderForm()}
                    </Grid>
                </div>
            );
        }
    }
}
