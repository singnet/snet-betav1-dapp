import { MAXIMUM_GRAPH_SIZE } from "./annotation/visualizer.config";
import React from "react";
import { showNotification } from "./annotation/utils";
import GeneSelectionForm from "./annotation/GeneSelection";
import AnnotationSelection from "./annotation/AnnotationSelection";
import AnnotationResultVisualizer from "./annotation/AnnotationResultVisualizer";
import AnnotationResultDownload from "./annotation/AnnotationResultDownload";
import { Button, Grid } from "@material-ui/core";
import { Check } from "@material-ui/icons";
import GOFilter from "./annotation/GOFilter";
import GenePathwayFilter from "./annotation/GenePathwayFilter";

const availableAnnotations = [
  {
    key: "gene_go_annotation",
    name: "Gene-GO",
    defaults: {
      namespace: [
        "biological_process",
        "cellular_component",
        "molecular_function"
      ],
      get_entrez_id: "False",
      parents: 0
    },
    fitlerForm: (defaults, handleFilterChanged) => (
      <GOFilter defaults={defaults} handleFilterChanged={handleFilterChanged} />
    )
  },
  {
    key: "gene_pathway_annotation",
    name: "Gene pathway",
    defaults: {
      namespace: ["smpdb"],
      include_prot: false,
      include_small_molecule: true
    },
    fitlerForm: (defaults, handleFilterChanged) => (
      <GenePathwayFilter
        defaults={defaults}
        handleFilterChanged={handleFilterChanged}
      />
    )
  },
  {
    key: "biogrid_interaction_annotation",
    name: "Biogrid protein interaction",
    fitlerForm: (defaults, handleFilterChanged) => null
  }
];

export default class AnnotationService extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      genes: [],
      geneList: null,
      selectedAnnotations: [],
      annotationResult: null,
      busy: false,
      notification: null
    };
    this.isComplete = false;

    this.parseProps(props);
    // bind functions
    this.handleGeneAdded = this.handleGeneAdded.bind(this);
    this.handleGeneRemoved = this.handleGeneRemoved.bind(this);
    this.handleGeneListUploaded = this.handleGeneListUploaded.bind(this);
    this.handleAllGenesRemoved = this.handleAllGenesRemoved.bind(this);
    this.handleAnnotationsChanged = this.handleAnnotationsChanged.bind(this);
    this.handleFilterChanged = this.handleFilterChanged.bind(this);
    this.downloadSchemeFile = this.downloadSchemeFile.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log("Updating in base class");
    if (this.isComplete !== nextProps.isComplete) {
      this.parseProps(nextProps);
    }
  }

  parseProps(nextProps) {
    this.isComplete = nextProps.isComplete;
    console.log("isComplete ", this.isComplete);
    if (this.isComplete) {
      if (typeof nextProps.response !== "undefined") {
        console.log("Result", nextProps.response);
        this.state.annotationResult = {
          graph: JSON.parse(nextProps.response.graph),
          schemeFile: nextProps.response.scm
        };
        this.state.notification = null;
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
      isSelected
        ? selectedAnnotations.push({
            name: annotation,
            filter: availableAnnotations.find(a => a.key === annotation)
              .defaults
          })
        : (selectedAnnotations = selectedAnnotations.filter(
            a => a.name !== annotation
          ));

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
      a => a.name === "gene_go_annotation"
    );
    if (GO) valid = valid && GO.filter.namespace.length;
    // If Gene Pathway annotation is selected, namespace must be defined
    const Pathway = this.state.selectedAnnotations.find(
      a => a.name === "gene_pathway_annotation"
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
    console.log("Request params", JSON.stringify(annotationResult));
    this.props.callApiCallback("Annotate", "Annotate", annotationResult);

    this.setState({
      notification: { message: "Fetching annotation results ...", busy: true }
    });
    console.log(
      "Selected annotations before request",
      this.state.selectedAnnotations
    );
  }

  renderForm() {
    return (
      <React.Fragment>
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
      </React.Fragment>
    );
  }

  renderComplete() {
    return (
      <React.Fragment>
        {this.state.annotationResult.graph.nodes.length < MAXIMUM_GRAPH_SIZE ? (
          <AnnotationResultVisualizer
            notification={this.state.notification}
            annotations={this.state.selectedAnnotations.map(a => a.name)}
            graph={this.state.annotationResult.graph}
            downloadSchemeFile={this.downloadSchemeFile}
          />
        ) : (
          <AnnotationResultDownload
            downloadSchemeFile={this.downloadSchemeFile}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.state.notification &&
          showNotification(this.state.notification, () => {
            this.setState({ notification: null });
          })}
        {this.isComplete ? this.renderComplete() : this.renderForm()}
      </React.Fragment>
    );
  }
}
