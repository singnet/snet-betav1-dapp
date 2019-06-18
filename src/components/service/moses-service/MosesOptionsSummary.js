import React, { Component, Fragment } from "react";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

export default class MosesOptionsSummary extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Fragment>
        <Modal onClose={this.props.onClose} open={this.props.open}>
          <Paper
            style={{
              left: "25%",
              top: 30,
              width: "50vw",
              height: "90vh",
              padding: "30px",
              position: "absolute",
              overflowY: "scroll"
            }}
          >
            <Typography variant="h6" id="modal-title">
              Moses Options
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Moses Option</TableCell>
                  <TableCell style={{ textAlign: "right" }}>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.props.options.map(option => (
                  <TableRow key={option.name}>
                    <TableCell component="th" scope="row">
                      {option.name}
                    </TableCell>
                    <TableCell align="right">{option.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Modal>
      </Fragment>
    );
  }
}
