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

export default class SentimentAnalysisService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.handleSentences = this.handleSentences.bind(this);

        this.state = {
            serviceName: "SentimentAnalysis",
            methodName: "Analyze",
            message: undefined,
            response: undefined,
            styles: {
                details: {
                    fontSize: 14,
                    alignItems: 'center',
                },
                responseDetails: {
                    fontSize: 14,
                    alignItems: 'left',
                },
                defaultFontSize: {
                    fontSize: 15
                }
            }
        };
    }

    handleFormUpdate(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
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

    parseResponse(response) {
        let parsedResponse = JSON.parse(response);
        let parsedResult = [];
        for (let i = 0; i < parsedResponse.length; i++) {
            let parsedAnalysis = JSON.parse(parsedResponse[i].analysis.split("\'").join("\""));
            parsedResult.push({id: parsedResponse[i].id, analysis: parsedAnalysis});
        }
        return parsedResult;
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
        const answer = {
            first: {
                sentence: "Great price, fast shipping, great product.",
                result: {'neg': 0.0, 'neu': 0.328, 'pos': 0.672, 'compound': 0.8481}
            },
            second: {
                sentence: "Donald Murph lifted the Jones Act for ten days, not even enough time to load international cargo ships..",
                result: {"neg": 0, "neu": 1, "pos": 0, "compound": 0}
            },
            third: {
                sentence: "@maja_dren2, is still sick, and worrying the orange she just ate is going to come back up... ugh.",
                result: {'neg': 0.362, 'neu': 0.638, 'pos': 0.0, 'compound': -0.8176}
            }
        };
        return (
            <React.Fragment>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <h3>AI Opinion</h3>
                </Grid>
                <Grid item xs={12}>
                    <br/>
                    <br/>
                    <FormControl style={{minWidth: '100%'}}>
                        <Select
                            name="methodName"
                            value={this.state.methodName}
                            style={this.state.styles.defaultFontSize}
                            onChange={this.handleFormUpdate}
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
                              Great price, fast shipping, great product.<br/><br/>
                                Donald Murph lifted the Jones Act for ten days, not even enough time to load international cargo ships..<br/><br/>
                                @maja_dren2, is still sick, and worrying the orange she just ate is going to come back up... ugh.
                            </pre>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography style={this.state.styles.defaultFontSize}>Response example</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={this.state.styles.details}>
                            <pre>
                                <p>{answer.first.sentence}<br/>{JSON.stringify(answer.first.result)}</p>
                                <p>{answer.second.sentence}<br/>{JSON.stringify(answer.second.result)}</p>
                                <p>{answer.third.sentence}<br/>{JSON.stringify(answer.third.result)}</p>
                            </pre>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                </Grid>
            </React.Fragment>
        )
    }

    renderComplete() {
        const sentSentences = this.handleSentences();
        const response = this.parseResponse(this.props.response.value);
        return (
            <React.Fragment>
                <Grid item xs={12} style={{textAlign: "center"}}>
                    <h4>
                        Response from service is:
                    </h4>
                    <br/>
                    {response.map((item, index) =>
                        <Grid key={index} container
                              direction="row"
                              justify="center"
                              alignItems="center"
                              style={{textAlign: "left", padding: 20, backgroundColor: "#E5EFFC"}}>
                            <Grid item xs={11}>
                                <h5>{sentSentences[index].sentence}<br/>{JSON.stringify(item.analysis)}<br/></h5>
                            </Grid>
                            <Grid item xs={1} style={{textAlign: 'center'}}>
                                {item.analysis.compound >= 0.05 ? <span>POS</span> : null}
                                {item.analysis.compound > -0.05 && item.analysis.compound <= 0.05 ?
                                    <span>NEU</span> : null}
                                {item.analysis.compound <= -0.05 ? <span>NEG</span> : null}
                            </Grid>
                        </Grid>
                    )};
                </Grid>
                <Grid item xs={12}>
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography style={this.state.styles.defaultFontSize}>Details</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={this.state.styles.responseDetails}>
                            <pre>
                                <p>1 - Positive sentiment: compound score &#8925; 0.05</p>
                                <p>2 - Neutral sentiment: (compound score &#62; -0.05) and (compound score &#60; 0.05)</p>
                                <p>3 - Negative sentiment: compound score &#8924; -0.05</p>
                            </pre>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
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
