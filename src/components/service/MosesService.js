import React from "react";
import MosesServiceForm from "./moses-service/MosesServiceForm";
import MosesServiceResult from "./moses-service/MosesServiceResult";
import { Snackbar, SnackbarContent, CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

const ErrorSnackbarContent = withStyles({
  root: { background: red[600] },
  message: { color: "#fff" }
})(SnackbarContent);

const showNotification = ({ message, busy }, callBack) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
      style={{
        position: "fixed",
        bottom: "15px",
        right: "15px",
        margin: "15px"
      }}
      open
      autoHideDuration={null}
      onClose={callBack}
    >
      {busy ? (
        <SnackbarContent
          message={
            <span style={{ display: "flex", alignItems: "center" }}>
              <CircularProgress
                size={24}
                color="secondary"
                style={{ marginRight: "15px" }}
              />
              {message}
            </span>
          }
        />
      ) : (
        <ErrorSnackbarContent message={<span>{message}</span>} />
      )}
    </Snackbar>
  );
};

export default class MosesService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      busy: false,
      error: null,
      notification: null
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidUpdate(nextProps) {
    if (this.props.isComplete !== nextProps.isComplete) {
      if (!this.props.response || !this.props.response.resultUrl) {
        this.state.notification = {
          message: nextProps.response.description,
          busy: false
        };
      } else {
        this.state.notification = null;
      }
    }
  }

  parseResponse() {
    const { response } = this.props;
    if (typeof response !== "undefined") {
      return response;
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
    return <MosesServiceResult result={this.parseResponse()} />;
  }

  render() {
    return (
      <div>
        {this.props.isComplete ? this.renderComplete() : this.renderForm()}
        {this.state.notification &&
          showNotification(this.state.notification, () => {
            this.setState({ notification: null });
          })}
      </div>
    );
  }
}
