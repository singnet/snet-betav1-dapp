import { createMuiTheme } from "@material-ui/core/styles"
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import React from 'react'

/*
const styles = theme => ({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
  });*/

export const ProfileTabContainer = (props) => {
    return (
      <Typography component="div" style={{padding:"21px", fontFamily: "Muli"}}>
        {props.children}
      </Typography>
    );
  }
  ProfileTabContainer.propTypes = {
    children: PropTypes.node.isRequired,
  };

export const TabContainer = (props) => {
    return (
        <Typography component="div" style={{padding:"10px", fontFamily: "Muli"}}>
        {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

export const ModalStylesAlertWait = {
    position: 'center',
    borderRadius: '6px',
    backgroundColor: 'white',
    fontFamily: "Muli",
    fontSize: "13px",
    color: 'black',
    height: '100px',
    width: '450px',
    padding: '10px',
    boxShadow: '#e8e8e8 0px 2px 2px 2px',
    margin: 'auto'
}

//Get modalstyles for alert//
export const ModalStylesAlert = {
    fontFamily: "Muli",
    position: 'relative',
    borderRadius: 3,
    border: 5,
    color: 'white',
    lineHeight: 40,
    height: 100,
    width: 750,
    padding: '0 10px',
    boxShadow: '0 3px 5px 2px gray',
    top: 450,
    left: 350,
}
export const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    overrides: {
        MuiButton: {
            root: {
              height: 38,
              fontFamily: "Muli",
              fontSize: "18px",
          },
        },
    },
});