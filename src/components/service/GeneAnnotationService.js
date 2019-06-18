import { MAXIMUM_GRAPH_SIZE } from "./gene-annotation-service/visualizer.config";
import React from "react";
import GeneSelectionForm from "./gene-annotation-service/GeneSelection";
import AnnotationSelection from "./gene-annotation-service/AnnotationSelection";
import { Button, Grid } from "@material-ui/core";
import { Check } from "@material-ui/icons";
import GOFilter from "./gene-annotation-service/GOFilter";
import GenePathwayFilter from "./gene-annotation-service/GenePathwayFilter";
import { Snackbar, SnackbarContent, CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";
import CheckCircle from "@material-ui/core/es/internal/svg-icons/CheckCircle";
import Error from "@material-ui/icons/Error";
const ErrorSnackbarContent = withStyles({
  root: { background: red[600] },
  message: { color: "#fff" }
})(SnackbarContent);

export const showNotification = ({ message, busy }, callBack) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right"
      }}
      style={{ margin: "15px" }}
      open
      autoHideDuration={busy ? null : 5000}
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

const availableAnnotations = [
  {
    key: "gene-go-annotation",
    name: "Gene-GO",
    defaults: {
      namespace: [
        "biological_process",
        "cellular_component",
        "molecular_function"
      ],
      parents: 0
    },
    fitlerForm: (defaults, handleFilterChanged) => (
      <GOFilter defaults={defaults} handleFilterChanged={handleFilterChanged} />
    )
  },
  {
    key: "gene-pathway-annotation",
    name: "Gene pathway",
    defaults: {
      namespace: ["reactome"],
      include_prot: true,
      include_small_molecule: false
    },
    fitlerForm: (defaults, handleFilterChanged) => (
      <GenePathwayFilter
        defaults={defaults}
        handleFilterChanged={handleFilterChanged}
      />
    )
  },
  {
    key: "biogrid-interaction-annotation",
    name: "Biogrid protein interaction",
    fitlerForm: (defaults, handleFilterChanged) => null,
    defaults: {
      interaction: "genes"
    }
  }
];

export default class GeneAnnotationService extends React.Component {
 constructor(props) {
    super(props);
    this.state = {
      genes: [],
      geneList: null,
      selectedAnnotations: [],
      annotationResult: null,
      busy: false,
      notification: null,
      error: false
    };
    // bind functions
    this.handleGeneAdded = this.handleGeneAdded.bind(this);
    this.handleGeneRemoved = this.handleGeneRemoved.bind(this);
    this.handleGeneListUploaded = this.handleGeneListUploaded.bind(this);
    this.handleAllGenesRemoved = this.handleAllGenesRemoved.bind(this);
    this.handleAnnotationsChanged = this.handleAnnotationsChanged.bind(this);
    this.handleFilterChanged = this.handleFilterChanged.bind(this);
    this.downloadSchemeFile = this.downloadSchemeFile.bind(this);
  }

  componentWillUnmount() {
     this.isCancelled = true;
  }
  async componentDidUpdate(prevProps) {
    if (prevProps.isComplete !== this.props.isComplete) {
       !this.isCancelled && this.parseResponse()
    }
  }

  parseResponse() {
    const { response } = this.props;
    if (response.graph !== "") {
        if(response.graph.includes("Gene Doesn't exist")){
            const invalidGenes = response.graph
              .split("`")[1]
              .split(",")
              .map(g => g.trim())
              .filter(g => g);
            this.setState(state => ({
              busy: false,
              genes: state.genes.filter(g => !invalidGenes.includes(g)),
              notification: { message: response.graph, busy: false },
              error: true
            }));
        }
        else {
            this.setState({
            busy: false,
            notification: null,
            annotationResult : response.graph
        });
        }
    }

  }

  handleGeneAdded(input) {
    this.setState(state => {
      let genes = state.genes.slice(0);
      genes = [
        ...genes,
        ...input
          .trim()
          .toUpperCase()
          .split(" ")
      ].filter((g, i, arr) => g && arr.indexOf(g) === i);
      return { genes: genes };
    });
  }

  handleGeneRemoved(gene) {
    this.setState(state => {
      let genes = state.genes.slice(0);
      return { genes: genes.filter(g => g !== gene) };
    });
  }

  handleGeneListUploaded(geneList) {
    const fileReader = new FileReader();
    fileReader.readAsText(geneList);
    fileReader.onload = () => {
      const re = /^[a-z0-9\s]+$/i;
      if (!re.test(fileReader.result)) {
        this.setState({
          notification: {
            message: "The selected file contains invalid characters.",
            busy: false
          }
        });
        return;
      }
      const geneArray = fileReader.result.split("\n");
      const uniqueGeneArray = geneArray.reduce((accumulator, value) => {
        if (value && accumulator.indexOf(value) === -1) accumulator.push(value);
        return accumulator;
      }, []);
      this.setState({ geneList: geneList, genes: uniqueGeneArray });
    };
  }

  handleAllGenesRemoved() {
    this.setState({ genes: [], geneList: null });
  }

  handleAnnotationsChanged(isSelected, annotation) {
    this.setState(state => {
      let selectedAnnotations = state.selectedAnnotations.slice();
        if (isSelected) {
            if(annotation === "biogrid-interaction-annotation" && selectedAnnotations.find(a => a.name === "gene-pathway-annotation")){
                selectedAnnotations.push({
                name: annotation,
                filter: {
                    "interaction": "proteins"
                }
            });
            }
            else{
                selectedAnnotations.push({
                name: annotation,
                filter: availableAnnotations.find(
                    a => a.key === annotation
                ).defaults
            });
            }
        } else {
            selectedAnnotations = selectedAnnotations.filter(
                a => a.name !== annotation
            );
        }

      return { selectedAnnotations: selectedAnnotations };
    });
  }

  handleFilterChanged(annotation, filter) {
    this.setState(state => {
      const selectedAnnotations = state.selectedAnnotations.map(sa => {
        if (sa.name === annotation) {
          sa.filter = Object.assign({}, sa.filter, filter);
        }
        return sa;
      });
      return { selectedAnnotations: selectedAnnotations };
    });
  }

  isFormValid() {
    let valid = true;
    valid = valid && this.state.selectedAnnotations.length;
    valid = valid && this.state.genes.length;
    // If Gene GO annotation is selected, namespace must be defined
    const GO = this.state.selectedAnnotations.find(
      a => a.name === "gene-go-annotation"
    );
    if (GO) valid = valid && GO.filter.namespace.length;
    // If Gene Pathway annotation is selected, namespace must be defined
    const Pathway = this.state.selectedAnnotations.find(
      a => a.name === "gene-pathway-annotation"
    );
    if (Pathway) {
      valid =
        valid &&
        (Pathway.filter.namespace.includes("smpdb") ||
          Pathway.filter.namespace.includes("reactome"));
    }
    return valid;
  }

  downloadSchemeFile() {
    const json = `data:application/txt, ${encodeURIComponent(
      this.state.annotationResult.schemeFile
    )}`;
    const link = document.createElement("a");
    link.setAttribute("href", json);
    link.setAttribute("download", "annotations-scheme.scm");
    link.click();
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  handleSubmit() {
   const annotationResult = {};
    annotationResult.annotations = this.state.selectedAnnotations.map(sa => {
      const annotation = {};
      annotation["functionName"] = sa.name;
      annotation["filters"] = sa.filter
        ? Object.keys(sa.filter).map(k => {
            const filter = {};
            filter["filter"] = k;
            filter["value"] = Array.isArray(sa.filter[k])
              ? sa.filter[k]
                  .reduce((acc, value) => {
                    return acc + " " + value;
                  }, "")
                  .trim()
              : this.capitalizeFirstLetter(sa.filter[k].toString());
            return filter;
          })
        : [];
      return annotation;
    });
    annotationResult.genes = this.state.genes.map(g => ({ geneName: g }));
    this.props.callApiCallback("Annotate", "Annotate", annotationResult);
    this.setState({
      notification: { message: "Fetching annotation results ...", busy: true }
    });
  }

  renderForm() {
     return (
     <React.Fragment>
          <div>
            {this.state.notification &&
              showNotification(this.state.notification, () => {
                this.setState({ notification: null });
              })}
            <GeneSelectionForm
              genes={this.state.genes}
              geneList={this.state.geneList}
              onGeneAdded={this.handleGeneAdded}
              onGeneRemoved={this.handleGeneRemoved}
              onGeneListUploaded={this.handleGeneListUploaded}
              onAllGenesRemoved={this.handleAllGenesRemoved}
            />
            <AnnotationSelection
              handleAnnotationsChanged={this.handleAnnotationsChanged}
              handleFilterChanged={this.handleFilterChanged}
              selectedAnnotations={this.state.selectedAnnotations}
              availableAnnotations={availableAnnotations}
            />
            <Grid container justify="flex-end">
              <Grid item>
                <Button
                  id="submitButton"
                  variant="contained"
                  onClick={() => this.handleSubmit()}
                  disabled={!this.isFormValid()}
                  color="primary"
                >
                  <Check />
                  Submit
                </Button>
              </Grid>
            </Grid>
          </div>
     </React.Fragment>
     );
  }
  renderComplete() {
    let response = this.parseResponse();
    return (
        <React.Fragment>
          <Grid container justify="center">
            <Grid
              item
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60vh"
              }}
            >
              <CheckCircle style={{ fontSize: "72px", color: "#54C21F" }} />
              <h1 style={{ margin: 5 }}>Your request is being processed</h1>
              <h3 style={{ marginTop: 0, color: "#555" }}>
                Follow the link below to view results.
              </h3>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={response}
                style={{ fontSize: 18 }}
              >
                {response}
              </a>
            </Grid>
          </Grid>
      </React.Fragment>
    );
  }

  render() {
     return (
      <React.Fragment>
        {!this.props.isComplete && !this.state.annotationResult && (
          <div>
            {this.state.notification &&
              showNotification(this.state.notification, () => {
                this.setState({ notification: null });
              })}
            <GeneSelectionForm
              genes={this.state.genes}
              geneList={this.state.geneList}
              onGeneAdded={this.handleGeneAdded}
              onGeneRemoved={this.handleGeneRemoved}
              onGeneListUploaded={this.handleGeneListUploaded}
              onAllGenesRemoved={this.handleAllGenesRemoved}
            />
            <AnnotationSelection
              handleAnnotationsChanged={this.handleAnnotationsChanged}
              handleFilterChanged={this.handleFilterChanged}
              selectedAnnotations={this.state.selectedAnnotations}
              availableAnnotations={availableAnnotations}
            />
            <Grid container justify="flex-end">
              <Grid item>
                <Button
                  id="submitButton"
                  variant="contained"
                  onClick={() => this.handleSubmit()}
                  disabled={!this.isFormValid()}
                  color="primary"
                >
                  <Check />
                  Submit
                </Button>
              </Grid>
            </Grid>
          </div>
        )}
        {this.props.isComplete && this.state.annotationResult && !this.state.error ? (
          <Grid container justify="center">
            <Grid
              item
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60vh"
              }}
            >
              <CheckCircle style={{ fontSize: "72px", color: "#54C21F" }} />
              <h1 style={{ margin: 5 }}>Your request is being processed</h1>
              <h3 style={{ marginTop: 0, color: "#555" }}>
                Follow the link below to view results.
              </h3>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href={this.state.annotationResult}
                style={{ fontSize: 18 }}
              >
                {this.state.annotationResult}
              </a>
            </Grid>
          </Grid>
        ) : null}
          {
              this.props.isComplete && this.state.error ? (
                   <Grid container justify="center">
            <Grid
              item
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60vh"
              }}
            >
              <Error style={{ fontSize: "72px", color: "#c20d25" }} />
              <h2 style={{ margin: 5 }}>Error Occurred, Please try again.</h2>
              <h3 style={{ marginTop: 0, color: "#555" }}>
                {this.state.notification.message}
              </h3>
            </Grid>
          </Grid>
              ) : null
          }
      </React.Fragment>
    );
  }
}
