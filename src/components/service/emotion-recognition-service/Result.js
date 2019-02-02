import * as React from 'react';
import { Tabs, Tab } from '@material-ui/core';
import ReactJson from 'react-json-view';
import styles from './emotion_recognition.css.cs';

const ResultView = { Image: 0, JSON: 1 };

export default class Result extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resultView: ResultView.JSON
        };
        this.download = this.download.bind(this);
    }


    download() {
        var element = document.createElement("a");
        var file = new Blob([this.state.resultView], {type: 'text/json'});
        element.href = URL.createObjectURL(file);
        element.download = "result.json";
        element.click();
    }

    render() {
        return (
            <React.Fragment>
                <Tabs
                    variant="fullWidth"
                    value={this.state.resultView}
                    onChange={this.changeResultView}
                >
                    {/*<Tab value={ResultView.Image} label="Image" />*/}
                    <Tab value={ResultView.JSON} label="JSON" />
                </Tabs>

                {/*{this.state.resultView === ResultView.Image && (*/}
                {/*    <div ref="outsideWrap" style={styles.outsideWrapper}>*/}
                {/*        <div style={styles.insideWrapper}>*/}
                {/*            <img*/}
                {/*                ref="sourceImg"*/}
                {/*                src={this.props.inputImage}*/}
                {/*                style={styles.coveredImage}*/}
                {/*            />*/}
                {/*            <canvas ref="bboxCanvas" style={styles.coveringCanvas} />*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
                {this.state.resultView === ResultView.JSON && (
                    <div className="row">
                        <ReactJson src={this.props.jobResult} theme="apathy:inverted"/>
                    <div className="row" align="center">
                        <button type="button" className="btn btn-primary" onClick={this.download}>Download Results</button>
                    </div>
                    </div>
                )}
            </React.Fragment>
        );
    }
}
