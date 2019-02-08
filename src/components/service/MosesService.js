import React from "react";
import { showNotification } from "./moses-service/utils";
import MosesServiceForm from "./moses-service/MosesServiceForm";
import MosesServiceResult from "./moses-service/MosesServiceResult";

export default class MosesService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      response: undefined,
      busy: false,
      error: null,
      notification: null
    };
    this.isComplete = false;
    this.parseProps(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  parseProps(nextProps) {
    this.isComplete = nextProps.isComplete;
    if (this.isComplete) {
      if (typeof nextProps.response !== "undefined") {
        this.state.response = nextProps.response;
        if (!nextProps.response.resultUrl) {
          this.state.notification = {
            message: nextProps.response.description,
            busy: false
          };
        } else {
          this.state.notification = null;
        }
      }
    }
  }

  handleSubmit(analysisParameters) {
    this.setState({
      busy: true,
      notification: { message: "Attempting to start analysis ...", busy: true }
    });
    this.props.callApiCallback(
      "MosesService",
      "StartAnalysis",
      analysisParameters
    );
  }

  renderForm() {
    return (
      <MosesServiceForm
        busy={this.state.busy}
        handleSubmit={this.handleSubmit}
        error={this.state.error}
      />
    );
  }

  renderComplete() {
    return <MosesServiceResult result={this.state.response} />;
  }

  render() {
    return (
      <div>
        {this.isComplete ? this.renderComplete() : this.renderForm()}
        {this.state.notification &&
          showNotification(this.state.notification, () => {
            this.setState({ notification: null });
          })}
      </div>
    );
  }
}
