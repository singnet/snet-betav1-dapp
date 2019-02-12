import React from "react";
import { Snackbar, SnackbarContent, CircularProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import red from "@material-ui/core/colors/red";

export const checkDuplicate = (value, array) => {
  return array.includes(value)
    ? {
        error: true,
        helperText: `"${value}" already exists.`
      }
    : null;
};

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
