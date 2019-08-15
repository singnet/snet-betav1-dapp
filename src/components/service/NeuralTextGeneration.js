import React from 'react';
import {hasOwnDefinedProperty} from '../../util'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Select from "@material-ui/core/Select";

export default class NeuralTextGeneration extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);

        this.users_guide =  "https://github.com/iktina/neural-text-generation";
        this.serviceName =  "GENGPT2";
        this.methodName =  "gen_gpt_2";

        this.state = {
            response: undefined,
            run_name: "run1",
            start_text: "",
            length: 128,
            temperature: 1,
            top_k: 0
        };

        this.isComplete = false;
        this.serviceMethods = [];
        this.allServices = [];
        this.methodsForAllServices = [];
        this.parseProps(props);
    }
    componentWillReceiveProps(nextProps) {
        if(this.isComplete !== nextProps.isComplete) {
            this.parseProps(nextProps);
        }
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
                    this.state.response = nextProps.response.answer;
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
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onKeyPressvalidator(event) {
        // console.log(event.target.value);
    }

    submitAction() {
        var btn = document.getElementById("invoke-button");
        btn.disabled = true;
        btn.innerHTML = "Wait...";

        this.props.callApiCallback(this.serviceName,
            this.methodName, {
                run_name: this.state.run_name,
                length: this.state.length,
                temperature: this.state.temperature,
                top_k: this.state.top_k,
                start_text: this.state.start_text
            });
    }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Choose person:</div>
                    <div className="col-md-3 col-lg-2" style={{fontSize: "13px", marginBottom: "10px"}}>
                      <Select value={this.state.run_name} onChange={this.handleFormUpdate} displayEmpty name="run_name">
                        <option value="run1">Universal</option>
                        <option value="trump">Donald J. Trump</option>
                        <option value="officialmcafee">John McAfee</option>
                        <option value="barackobama">Barack Obama</option>
                        <option value="elonmusk">Elon Musk</option>
                        <option value="berniesanders">Bernie Sanders</option>
                        <option value="joebiden">Joe Biden</option>
                        <option value="joerogan">Joe Rogan</option>
                        <option value="hillaryclinton">Hillary Clinton</option>
                        <option value="jimmyfallon">Jimmy Fallon</option>
                        <option value="therock">Dwayne Johnson</option>
                        <option value="kimkardashian">Kim Kardashian</option>
                        <option value="billgates">Bill Gates</option> 
                        <option value="kevinhart4real">Kevin Hart</option>
                        <option value="katyperry">Katy Perry</option>
                        <option value="theellenshow">Ellen DeGeneres</option>
                        <option value="neiltyson">Neil deGrasse Tyson</option>
                        <option value="badastronomer">Phil Plait</option>
                        <option value="ladygaga">Lady Gaga</option>
                        <option value="conanobrien">Conan O'Brien</option>
                        <option value="richarddawkins">Richard Dawkins</option>
                        <option value="cmdr_hadfield">Chris Hadfield</option>
                        <option value="rickygervais">Ricky Gervais</option>
                        <option value="thetweetofgod">God</option>
                        <option value="samharrisorg">Sam Harris</option>
                        <option value="justinbieber">Justin Bieber</option>
                        <option value="virginiahughes">Virginia Hughes</option>
                        <option value="deborahblum">Deborah Blum</option>
                        <option value="laelaps">Brian Switek</option>
                        <option value="rebeccaskloot">Rebecca Skloot</option>
                        <option value="deepakchopra">Deepak Chopra</option>
                        <option value="beebrookshire">Bethany Brookshire</option>
                        <option value="jordanbpeterson">Dr Jordan B Peterson</option>
                        <option value="ericrweinstein">Eric Weinstein</option>
                        <option value="ticbot">TicBot</option>
                        <option value="dril">Wint</option>
                        <option value="terencemckenna_">Terence McKenna</option>
                      </Select>
                    </div> 
                </div>

                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Max length:</div>
                    <div className="col-md-3 col-lg-2" style={{fontSize: "13px", marginBottom: "10px"}}>
                      <TextField name="length" id="standard-number" value={this.state.length} onChange={this.handleFormUpdate} type="number" InputProps={{ inputProps: { min: 0, max: 1024, step: 1 } }}/>
                    </div> 
                </div>

                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Temperature:</div>
                    <div className="col-md-3 col-lg-2" style={{fontSize: "13px", marginBottom: "10px"}}>
                      <TextField name="temperature" id="standard-number" value={this.state.temperature} onChange={this.handleFormUpdate} type="number" InputProps={{ inputProps: { min: 0, max: 1.2, step: 0.1 } }}/>
                    </div> 
                </div>

                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Top K:</div>
                    <div className="col-md-3 col-lg-2" style={{fontSize: "13px", marginBottom: "10px"}}>
                      <TextField name="top_k" id="standard-number" value={this.state.top_k} onChange={this.handleFormUpdate} type="number" InputProps={{ inputProps: { min: 0, max: 100, step: 10 } }}/>
                    </div> 
                </div>

                <div className="row">
                <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Start text</div>
                    <div className="col-md-3 col-lg-2">
                        <textarea name="start_text" placeholder="Here your start text." className="w3-input w3-border" style={{resize: "none", width: "250px"}} rows="4" maxLength="5000" value={this.state.start_text} onChange={this.handleFormUpdate}
                               onKeyPress={(e) => this.onKeyPressvalidator(e)}></textarea>
                    </div> 
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6" style={{textAlign: "right", marginTop: "5px", width: "245px"}}>
                        <button id="invoke-button" type="button" className="btn btn-primary" onClick={this.submitAction}>Invoke</button>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px", marginTop: "10px"}}>About</div>
                    <div className="col-md-3 col-lg-2">
                        <Button target="_blank" href={this.users_guide} style={{fontSize: "13px", marginTop: "5px"}}>Guide</Button>
                    </div>
                </div>

            </React.Fragment>
        )
    }

    renderComplete() {
        return (
            <div>
                <p style={{fontSize: "13px"}}>Response from service is: <b>{this.state.response}</b> </p>
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
