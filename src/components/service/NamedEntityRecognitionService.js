import React from 'react';
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

export default class NamedEntityRecognitionService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.handleSentences = this.handleSentences.bind(this);

        this.state = {
            serviceName: "RecognizeMessage",
            methodName: "Recognize",
            message: undefined,
            response: undefined,
            styles: {
                details: {
                    fontSize: 14,
                    alignItems: 'center',
                },
                defaultFontSize: {
                    fontSize: 15
                }
            }
        };
    }

    handleFormUpdate(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleMessageChange(event) {
        this.setState({[event.target.name]: event.target.value});
    };

    renderServiceMethodNames(serviceMethodNames) {
        const serviceNameOptions = ["Select a method", ...serviceMethodNames];
        return serviceNameOptions.map((serviceMethodName, index) => {
            return <MenuItem style={this.state.styles.defaultFontSize} key={index}
                             value={serviceMethodName}>{serviceMethodName}</MenuItem>
        });
    }

    handleSentences() {
        let tempMessages = this.state.message.toString().split("\n");
        let tempArray = [];
        for (let i = 0; i < tempMessages.length; i++) {
            if (tempMessages[i].length >= 1) {
                tempArray.push(tempMessages[i]);
            }
        }
        let filterArray = tempArray.filter(function (el) {
            return el != null;
        });

        let itemsToAnalyze = [];
        for (let i = 0; i < filterArray.length; i++) {
            itemsToAnalyze.push({id: i + 1, sentence: filterArray[i]});
        }
        return itemsToAnalyze;
    }

    submitAction() {
        this.props.callApiCallback(
            this.state.serviceName,
            this.state.methodName, {
                value: JSON.stringify(this.handleSentences())
            });
    }

    renderForm() {
        const service = this.props.protoSpec.findServiceByName(this.state.serviceName);
        const serviceMethodNames = service.methodNames;
        return (
            <React.Fragment>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <h3>Entity Detection in Text</h3>
                </Grid>
                <Grid item xs={12}>
                    <br/>
                    <br/>
                    <FormControl style={{minWidth: '100%'}}>
                        <Select
                            value={this.state.methodName}
                            onChange={this.handleFormUpdate}
                            displayEmpty
                            name="methodName"
                            style={this.state.styles.defaultFontSize}
                        >
                            {this.renderServiceMethodNames(serviceMethodNames)}
                        </Select>
                    </FormControl>
                    <br/>
                    <TextField
                        id="standard-multiline-static"
                        label="Input sentence"
                        style={{width: "100%", fontSize: 24}}
                        value={this.state.message}
                        name="message"
                        InputProps={{
                            style: {fontSize: 15}
                        }}
                        InputLabelProps={{
                            style: {fontSize: 15}
                        }}
                        multiline
                        rows="6"
                        defaultValue=""
                        onChange={(event) => this.handleMessageChange(event)}
                        margin="normal"
                    />
                </Grid>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <Button variant="contained" color="primary" onClick={this.submitAction}>Invoke</Button>
                </Grid>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <br/>
                    <h2>Examples</h2>
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography style={this.state.styles.defaultFontSize}>Sentence example</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={this.state.styles.details}>
                            <pre style={{
                                whiteSpace: "pre-wrap",
                                overflowX: "scroll"
                            }}>
                              Our concept of operations is to flow in our military assets with a priority to build up southern Texas,
                              and then Arizona, and then California," Donald Trump said Monday, adding that the soldiers normally assigned
                              weapons will be carrying them at the border. " We'll reinforce along priority points of entry, and while this
                              happens, Trump Hotels is falling down in stock market.
                            </pre>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography style={this.state.styles.defaultFontSize}>Response example</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={this.state.styles.details}>
                            <pre style={{textAlign: 'left', width: '100%'}}>
                                <p>Texas : LOCATION<br/>Start span: 97 - End span: 102</p>
                                <p>Arizona : LOCATION<br/>Start span: 113 - End span: 120  </p>
                                <p>California : LOCATION<br/>Start span: 131 - End span: 141 </p>
                                <p>Donald Trump : PERSON<br/>Start span: 144 - End span: 156 </p>
                                <p>Trump Hotels : ORGANIZATION<br/>Start span: 332 - End span: 344 </p>
                            </pre>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
            </React.Fragment>
        )
    }

    renderComplete() {
        const response = JSON.parse(this.props.response.value);
        return (
            <React.Fragment>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <h4>
                        Response from service is:
                    </h4>
                    <br/>
                    <div style={{textAlign: "left", padding: 20, backgroundColor: "#E5EFFC"}}>
                        <h4>This is the entities found and it's positions in the inputed sentence.</h4>
                        <br/>
                        {response.map((item) =>
                            item.entities.map((entity) =>
                                <div>
                                    <h5>{entity.name} : {entity.type}</h5>
                                    <p>Start span: {entity.start_span} - End span: {entity.end_span}</p>
                                </div>
                            ))}
                    </div>
                </Grid>
            </React.Fragment>
        );
    }

    render() {
        if (this.props.isComplete)
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
