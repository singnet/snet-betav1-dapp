import React from 'react';
import { hasOwnDefinedProperty } from '../../util'
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Input from '@material-ui/core/Input';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

export default class TimeSeriesAnomalyDiscoveryService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.handleChangeUrl = this.handleChangeUrl.bind(this);
        this.handleChangeNumber = this.handleChangeNumber.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.UrlExists = this.UrlExists.bind(this);

        this.state = {
            serviceName: "EfficientRuleDensityBasedAnomalyDetection",
            methodName: "detectAnomalies",

            input_dialog: false,

            timeseries: undefined,
            alphabet: undefined,
            slidingwindowsize: undefined,
            paasize: undefined,
            detectionthreshold: undefined,
            debugflag: "0",

            response: undefined,

            styles: {
                details: {
                    fontSize: 14,
                    alignItems: 'left',
                },
                defaultFontSize: {
                    fontSize: 15
                }
            }
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
                    this.setState({ response: nextProps.response });
                } else {
                    this.setState({ response: nextProps.response.value });
                }
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.isComplete !== nextProps.isComplete) {
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
                var methods = Object.keys(items[rr]["methods"]);
                this.methodsForAllServices[rr] = methods;
            }
        });
    }

    handleFormUpdate(event) {
        console.log(event.target);
        this.setState({ [event.target.name]: event.target.value });
    }

    handleServiceName(event) {
        var strService = event.target.value;
        this.setState({ serviceName: strService });
        this.serviceMethods.length = 0;
        var data = Object.values(this.methodsForAllServices[strService]);
        if (typeof data !== 'undefined') {
            console.log("typeof data !== 'undefined'");
            this.serviceMethods = data;
        }
    }

    UrlExists(url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status != 404;
    }

    submitAction() {
        if (
            this.UrlExists(this.state.timeseries) &&
            this.state.paasize < this.state.slidingwindowsize &&
            slidingwindowsize >= 10 &&
            alphabet >= 3) {
            this.props.callApiCallback(
                this.state.serviceName,
                this.state.methodName, {
                    timeseries: this.state.timeseries,
                    alphabet: this.state.alphabet,
                    slidingwindowsize: this.state.slidingwindowsize,
                    paasize: this.state.paasize,
                    detectionthreshold: this.state.detectionthreshold,
                    debugflag: this.state.debugflag
                });
        } else {
            this.setState({ input_dialog: true });
        }
    }

    handleClose(){
        this.setState({ input_dialog: false });
    };

    handleChangeUrl(event) {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleChangeNumber(event) {
        if (event.target.value > 0) {
            this.setState({ [event.target.name]: event.target.value });
        } else {
            this.setState({ [event.target.name]: 0 });
        }
    };

    renderForm() {
        return (
            <React.Fragment>
                <Grid item xs={12}>
                    <br />
                    <h3>Time Series Anomaly Discovery based on Grammar Compression</h3>
                    <br />
                    <TextField
                        id="standard-multiline-static"
                        label="Time Series CSV file URL"
                        style={{ width: "100%" }}
                        InputProps={{
                            style: { fontSize: 15 }
                        }}
                        InputLabelProps={{
                            style: { fontSize: 15 }
                        }}
                        value={this.state.timeseries}
                        name="timeseries"
                        onChange={this.handleChangeUrl}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                    <TextField
                        id="standard-multiline-static"
                        label="Sliding Window Size"
                        style={{ width: "100%" }}
                        type="number"
                        InputProps={{
                            style: { fontSize: 15 }
                        }}
                        InputLabelProps={{
                            style: { fontSize: 15 }
                        }}
                        value={this.state.slidingwindowsize}
                        name="slidingwindowsize"
                        onChange={this.handleChangeNumber}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                    <br />
                    <TextField
                        id="standard-multiline-static"
                        label="Alphabet Size"
                        style={{ width: "100%" }}
                        type="number"
                        InputProps={{
                            style: { fontSize: 15 }
                        }}
                        InputLabelProps={{
                            style: { fontSize: 15 }
                        }}
                        value={this.state.alphabet}
                        name="alphabet"
                        onChange={this.handleChangeNumber}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                    <br />
                    <TextField
                        id="standard-multiline-static"
                        label="Piecewise Aggregate Approximation Size"
                        style={{ width: "100%" }}
                        type="number"
                        InputProps={{
                            style: { fontSize: 15 }
                        }}
                        InputLabelProps={{
                            style: { fontSize: 15 }
                        }}
                        value={this.state.paasize}
                        name="paasize"
                        onChange={this.handleChangeNumber}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                    <br />
                    <TextField
                        id="standard-multiline-static"
                        label="Detection Threshold"
                        style={{ width: "100%" }}
                        type="number"
                        InputProps={{
                            style: { fontSize: 15 }
                        }}
                        InputLabelProps={{
                            style: { fontSize: 15 }
                        }}
                        value={this.state.detectionthreshold}
                        name="detectionthreshold"
                        onChange={this.handleChangeNumber}
                        rows="6"
                        defaultValue=""
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12} style={{ textAlign: "center" }}>
                    <Button variant="contained" color="primary" onClick={this.submitAction}>Invoke</Button>
                </Grid>
                <Grid item xs={12} style={{ textAlign: "left", fontSize: 15, lineHeight: 2 }}>
                    <br />
                    <h3>
                        This service allows to detect anomalies in time series. It follows the summarized pipeline bellow:
                    </h3>
                    <br />
                    <ul>
                        <li><b>Piecewise Aggregate approximation:</b> discretise the time series sub-sequences with a sliding window.</li>
                        <li><b>Symbolic Aggregate Approximation:</b> transform the driscretized sub-sequences symbols based on an alphabet.</li>
                        <li><b>Sequitur:</b> build a context-free grammar with all the generated symbols from the entire time series.</li>
                        <li><b>Density Curve:</b> build a density curve based on the context-free generated grammar rules.</li>
                        <li><b>Optimization and Detection:</b> detect anomalies in the density curve with a hill-climbing inspired algorithm.</li>
                    </ul>
                    <br />
                    <h3>
                        A brief explanation about the parameters:
                    </h3>
                    <ul>
                        <li><b>Time Series CSV file URL:</b>An URL containing a time series csv file.</li>
                        <li><b>Alphabet size:</b> Alphabet size.</li>
                        <li><b>Sliding Window Size:</b> Sliding window used to create the time series symbols to build the free context grammar through the Sequitur algorithm.</li>
                        <li><b>Piecewise Aggregate Approximation:</b> Number of sub-samples that will be generated for each sliding window position.</li>
                        <li><b>Detection threshold:</b> Density curve detection threshold.</li>
                    </ul>
                    <br />
                    <p>
                        With the presented example input parameters, using real ECG data, the algorithms should be able to detect and output an anomaly interval.
                    </p>
                    <br />
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography style={this.state.styles.defaultFontSize}>Input example</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={this.state.styles.details}>
                            <pre style={{
                                whiteSpace: "pre-wrap",
                                overflowX: "scroll"
                            }}>
                                Time Series: https://raw.githubusercontent.com/GrammarViz2/grammarviz2_src/master/data/ecg0606_1.csv
                                <br />
                                Sliding Window size: 100
                                <br />
                                Alphabet Size: 3
                                <br />
                                Piecewise Aggregate Approximation Size: 2
                                <br />
                                Detection Threshold: 1
                            </pre>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography style={this.state.styles.defaultFontSize}>Response example</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={this.state.styles.details}>
                            <pre style={{
                                whiteSpace: "pre-wrap",
                                overflowX: "scroll"
                            }}>
                                <br />
                                Detected anomalies at indexes (Starting from 0):
                                <br />
                                17 459 460 461 462 463 464 465 466
                            </pre>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
            </React.Fragment>
        )
    }

    renderComplete() {
        return (
            <React.Fragment>
                <Grid item xs={12} style={{ textAlign: "center" }}>
                    <div style={{ textAlign: "left", padding: 20, backgroundColor: "#E5EFFC" }}>
                        <h4>Detected anomalies at indexes (Starting from 0): </h4>
                        <br />
                        <div>
                            <h5>{this.props.response.output}</h5>
                        </div>
                    </div>
                </Grid>
            </React.Fragment>
        );
    }

    render() {
        if (this.isComplete)
            return (
                <div style={{ flexGrow: 1 }}>
                    <Grid container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ marginTop: 15, marginBottom: 15 }}
                    >
                        {this.renderComplete()}
                    </Grid>
                </div>
            );
        else {
            return (
                <div style={{ flexGrow: 1 }}>
                    <Grid container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ marginTop: 15, marginBottom: 15 }}
                    >
                        {this.renderForm()}
                    </Grid>

                    <Dialog
                        open={this.state.input_dialog}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={this.handleClose}
                        aria-labelledby="alert-dialog-slide-title"
                        aria-describedby="alert-dialog-slide-description"
                        >
                        <DialogTitle id="alert-dialog-slide-title" style={{ fontSize:15 }}>
                                    {"Usage"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-slide-description" style={{ fontSize:15 }}>
                                1 - The PAA size must me lower than the sliding windowsize.
                                <br />
                                2 - The sliding window must be greater than 10 and alphabet greater than 3.
                                <br />
                                3 - The CVS file must have only numbers, one column, and no header.
                                <br />
                                See example parameters...
                            </DialogContentText>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        }
    }
}
