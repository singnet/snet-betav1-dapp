/*============================================
Author: Ramon Duraes
Email: ramon@singularitynet.io
Github: https://github.com/ramongduraes
Date: 02 February 2019
==============================================*/

import React from "react";
import PropTypes from 'prop-types';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

import Grid from "@material-ui/core/Grid";

import IconButton from "@material-ui/core/IconButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import InfoIcon from "@material-ui/icons/Info";
import ErrorIcon from "@material-ui/icons/Error"
import {CloudUpload} from "@material-ui/icons";

import CircularProgress from '@material-ui/core/CircularProgress';

import Fade from '@material-ui/core/Fade';
import Grow from '@material-ui/core/Grow';
import Slide from '@material-ui/core/Slide';

import {grey, red, blue} from "@material-ui/core/colors";

import SwipeableViews from 'react-swipeable-views';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import {Tooltip} from "@material-ui/core";
import Typography from '@material-ui/core/Typography';

import FileDrop from 'react-file-drop';

import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";

import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar"; // for image uploaded state

import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

// Color Palette
const snetGreyError = grey[700];
const snetGrey = grey[500];
const dropzoneBackgroundGrey = grey[200];
const snetBackgroundGrey = grey[100];
const snetRed = red[500];
const snetBackgroundRed = red[100];
// Definitions
const spacingUnit = 8;
const snetFont = "Roboto";
const minimumWidth = "400px";
const minimumTabHeight = 160;

export default class SNETImageUpload extends React.Component {

    constructor(props) {
        super(props);
        // It is the same thing, only difference is Component where we do the binding.
        // Component is lower in the tree, and now button has the logic how to open the screen.

        // Setting minimum tab height
        this.tabHeight = Math.max(minimumTabHeight, this.props.tabHeight);
        this.dropzoneHeightOffset = 14;
        this.handleDropzoneUpload = this.handleDropzoneUpload.bind(this);

        this.state = {
            // Component's flow of execution
            mainState: "initial", // initial, loading, uploaded
            value: this.props.disableUploadTab ? // Logic for defining the initial tab depending on which are available
                    (this.props.disableUploadTab + this.props.disableUrlTab)
                    :
                    0,
            searchText: null,
            errorMessage: null,
            displayError: false,
            displayImageName: false,
            // Selected image data (sent via callback function)
            imageData: null,    // encoded image data. NOT ALWAYS THE SAME DATA SENT VIA CALLBACK
            mimeType: null,     // "jpeg", "png", etc
            encoding: null,     // "byteArray", "base64", "url"
            filename: null,     // image filename
            // Image data readers
            base64Reader: undefined,
            byteReader: undefined,
        };
        this.tabStyle = {
            position: 'relative',
            overflow: 'hidden',
            padding: spacingUnit,
            height: this.tabHeight + "px",
        };
        this.textStyle = {
            fontFamily: snetFont,
            fontVariantCaps: "normal",
            textTransform: 'initial',
        };
        this.tabLabelStyle = {
            fontFamily: snetFont,
            fontVariantCaps: "normal",
            textTransform: 'initial',
            fontSize: 14,
        };
        this.iconStyle = {
            fontSize: 24,
            size: "large",
        };

        // Color Palette
        this.mainColor = this.props.mainColor[500];
        this.theme = createMuiTheme({
            palette: {
                primary: this.props.mainColor,
                error: red,
            },
            typography: {useNextVariants: true},
        });

        // Error Messages
        this.urlErrorMessage = "Incorrect URL or permission denied by server.";
        this.fileSizeError = "File size exceeds limits (" + this.props.maxImageSize / 1000000 + "mb).";
        this.fileTypeError = "File type not accepted. Allowed: " + this.props.allowedInputTypes + ".";

        // Function binding
        this.urlCallback = this.urlCallback.bind(this);
        this.sendData = this.sendData.bind(this);

    }

    setLoadingState() {
        this.setState({
            mainState: "loading",
        })
    };

    /* ----------------
       - IMAGE UPLOAD -
    *  ----------------*/

    sendData(data) {
        this.props.imageDataFunc(data, this.state.mimeType, this.state.encoding, this.state.filename);
    }

    readerOnLoadEnd(data) {
        this.setState({
                mainState: "uploaded", // initial, loading, uploaded
                searchText: null,
                imageData: data,
                encoding: "base64",
            }, function () {
                this.sendData(this.state.imageData.split(",")[1])
            }.bind(this)
        );
    }

    byteReaderOnLoadEnd(file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            this.setState({
                mainState: "uploaded", // initial, loading, uploaded
                searchText: null,
                imageData: reader.result,
                displayError: false,
                errorMessage: null,
            }, this.sendData(new Uint8Array(this.state.byteReader.result)))
        }.bind(this);
    }

    handleImageUpload(files) {
        this.setState({
            mainState: "loading",
        });

        // Checks file size
        const file = files[0];
        if (file.size > this.props.maxImageSize) {
            this.setState({
                mainState: "initial",
                searchText: null,
                imageData: null,
                mimeType: null,
                encoding: null,
                filename: null,
                errorMessage: this.fileSizeError,
                displayError: true,
            });
            return
        }

        // Checks file type
        let fileType = file.type;
        if (this.props.allowedInputTypes.includes("image/*")) { // if we accept all image types
            if (fileType.indexOf("image") === -1) { // if received file is not an image
                this.setState({
                    mainState: "initial",
                    searchText: null,
                    imageData: null,
                    mimeType:null,
                    encoding:null,
                    filename: null,
                    errorMessage: this.fileTypeError + "Got: " + fileType + ".",
                    displayError: true,
                });
                return
            }
        } else { // verify input type against each allowed input type
            if (!this.props.allowedInputTypes.includes(fileType)) {
                this.setState({
                    mainState: "initial",
                    searchText: null,
                    imageData: null,
                    mimeType: null,
                    encoding: null,
                    filename: null,
                    errorMessage: this.fileTypeError + "Got: " + fileType + ".",
                    displayError: true,
                });
                return
            }
        }

        // Is always used
        let reader = new FileReader();
        reader.onloadend = function () {
            this.setState({
                filename: file.name,
                mimeType: file.type,
                base64Reader: reader});
            this.readerOnLoadEnd(this.state.base64Reader.result)
        }.bind(this);

        let byteReader = new FileReader();
        byteReader.onloadend = function () {
            this.setState({
                byteReader: byteReader,
                mimeType: file.type,
                encoding: "byteArray",
                filename: file.name,
            });
            this.byteReaderOnLoadEnd(file)
        }.bind(this);

        if (this.props.returnByteArray) {
            byteReader.readAsArrayBuffer(file);
        } else {
            reader.readAsDataURL(file);
        }
    }

    handleDropzoneUpload(files, event) {
        // To prevent default behavior (browser navigating to the dropped file)
        event.preventDefault();
        event.stopPropagation();
        this.handleImageUpload(files);
    };

    renderUploadTab() {

        return (

            <Grid
                item
                xs={12}
            >
                <FileDrop onDrop={(files, event) => this.handleDropzoneUpload(files, event)}>
                    <input id="myInput"
                           type="file"
                           style={{display: 'none'}}
                           accept={this.props.allowedInputTypes}
                           onChange={(e) => this.handleImageUpload(e.target.files)}
                           ref={input => this.inputElement = input}
                    />
                    <div
                        onClick={() => this.inputElement.click()}
                        style={{
                            borderWidth: 2,
                            borderColor: this.mainColor,
                            borderStyle: 'dashed',
                            borderRadius: 5,
                            backgroundColor: dropzoneBackgroundGrey,
                            cursor: "pointer",
                            overflow: 'hidden',
                            height: this.tabHeight - this.dropzoneHeightOffset + "px",
                            padding: spacingUnit,
                        }}>
                        <Grid container
                              direction="column"
                              justify="center"
                              alignItems="center"
                              style={{
                                  flexGrow: 1,
                                  height: this.tabHeight + "px",
                              }}
                              spacing={spacingUnit}
                        >
                            <Grid item>
                                <CloudUpload style={{fontSize: 48, color: this.mainColor}}/>
                            </Grid>
                            <Grid item>
                                <Typography
                                    style={{
                                        fontFamily: snetFont,
                                        fontVariantCaps: "normal",
                                        textTransform: 'initial',
                                        fontSize: 16,
                                        color: snetGrey,
                                    }}
                                >
                                    Drag and drop image here or
                                    <span style={{color: this.mainColor}}> click</span>
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography
                                    style={{
                                        fontFamily: snetFont,
                                        fontVariantCaps: "normal",
                                        textTransform: 'initial',
                                        fontSize: 14,
                                        color: snetGrey,
                                        textAlign: "center",
                                        padding: spacingUnit,
                                    }}
                                >
                                    Image file must be smaller than {this.props.maxImageSize / 1000000}mb.
                                    Source images are not saved on the servers after the job is processed.
                                </Typography>
                            </Grid>
                        </Grid>
                    </div>
                </FileDrop>
            </Grid>

        );
    }

    //<label htmlFor='myInput' >

    /* --------------------
       - URL IMAGE SEARCH -
    *  --------------------*/

    sendImageURL(url) {
        const filename = url.substring(url.lastIndexOf("/") + 1);
        this.setState({
            mainState: "uploaded",

            imageData: url,
            mimeType: null,
            encoding: "url",
            filename: filename,

            searchText: null,
        }, function () {
            this.sendData(this.state.imageData)
        }.bind(this));
    }

    urlCallback(data, outputFormat, filename) {
        this.setState({
            mainState: "uploaded",

            imageData: data,
            mimeType: outputFormat,
            encoding: "base64",
            filename: filename,

            searchText: null,
        }, function () {
            this.sendData(this.state.imageData.split(",")[1])
        }.bind(this));
    };

    urlByteReaderOnLoadEnd(dataURL, filename) {
        this.setState({
            mainState: "uploaded",
            imageData: dataURL,
            mimeType: this.props.outputFormat,
            encoding: "byteArray",
            filename: filename,
            searchText: null,
            displayError: false,
            errorMessage: null,
        }, function () {
            this.sendData(new Uint8Array(this.state.byteReader.result))
        }.bind(this));
    }

    toDataUrl(src, callback, outputFormat) {
        const filename = src.substring(src.lastIndexOf("/") + 1);
        const img = new Image();
        let dataURL;

        // Only triggered if returnByteArray === true
        let byteReader = new FileReader();
        byteReader.onloadend = function () {
            this.setState({byteReader: byteReader});
            this.urlByteReaderOnLoadEnd(dataURL, filename)
        }.bind(this);

        img.crossOrigin = 'anonymous';
        img.onerror = function () {
            this.setState({
                mainState: "initial",
                searchText: null,
                imageData: null,
                mimeType: null,
                encoding: null,
                filename: null,
                errorMessage: this.urlErrorMessage,
                displayError: true,
            })
        }.bind(this);

        if (this.props.returnByteArray) {
            img.outputFormat = this.props.outputFormat;
            img.onload = function () {
                const canvas = document.createElement("canvas"),
                    context = canvas.getContext('2d');

                canvas.height = this.naturalHeight;
                canvas.width = this.naturalWidth;
                context.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                canvas.toBlob(function (blob) {
                    byteReader.readAsArrayBuffer(blob);
                }, this.outputFormat)
            };
        } else {
            img.onload = function () {
                const canvas = document.createElement("canvas"),
                    context = canvas.getContext('2d');
                let dataURL;
                canvas.height = this.naturalHeight;
                canvas.width = this.naturalWidth;
                context.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback(dataURL, outputFormat, filename);
            };
        }
        img.src = src;
        if (img.complete || img.complete === undefined) {
            img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
            img.src = src;
        }
    };

    searchTextUpdate(event) {
        this.setState({
            searchText: event.target.value,
        });
    };

    handleSearchSubmit() {
        // Does nothing if input is null
        if (this.state.searchText !== null) {
            this.setLoadingState();
            const url = this.state.searchText;
            // Directly sends data URL if allowed. Else, tries to convert image to base64
            this.props.allowURL ?
                this.sendImageURL(url) : this.toDataUrl(url, this.urlCallback, this.props.outputFormat)
        }
    };

    renderUrlTab() {

        return (
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
                style={{
                    height: this.tabHeight + "px",
                }}
            >
                <Grid item xs={12} style={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: "center"
                }}>
                    <MuiThemeProvider theme={this.theme}>
                        <TextField
                            style={{
                                width: "80%",
                                primary: this.mainColor,
                            }}
                            variant="outlined"
                            type="text"
                            label={<span style={{fontWeight: 'normal', fontSize: 12}}>Image URL</span>}
                            onChange={this.searchTextUpdate.bind(this)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            style={{
                                                color: this.mainColor,

                                            }}
                                            onClick={this.handleSearchSubmit.bind(this)}
                                        >
                                            <SearchIcon/>
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </MuiThemeProvider>
                </Grid>
            </Grid>
        );
    }

    /* -----------------
       - IMAGE GALLERY -
    *  -----------------*/

    handleGalleryImageClick(image) {
        this.setLoadingState();
        const url = image.url;
        // Directly sends data URL if allowed. Else, tries to convert image to base64
        this.props.allowURL ?
            this.sendImageURL(url) : this.toDataUrl(url, this.urlCallback, this.props.outputFormat)
    };

    renderGalleryTab() {

        return (
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                overflow: 'hidden',
            }}>
                <GridList
                    cols={this.props.galleryCols}
                    spacing={spacingUnit}
                    style={{
                        width: "100%",
                        height: this.tabHeight + "px",
                    }}
                >
                    {this.props.imageGallery.map((url, i) => (
                        <Grow
                            in={this.state.value === 2}
                            style={{transformOrigin: '0 0 0'}}
                            timeout={i * 500}
                            key={i}
                        >
                            <GridListTile key={i}>
                                <img
                                    src={url}
                                    alt={"Gallery Image " + i}
                                    onClick={() => this.handleGalleryImageClick({url})}
                                />
                            </GridListTile>
                        </Grow>
                    ))}
                </GridList>
            </div>
        );
    };

    renderLoadingState() {
        return (
            <div style={this.tabStyle}>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    style={{
                        flexGrow: 1,
                        height: this.tabHeight + "px"
                    }}
                >
                    <Grid item xs={12} style={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: "center"
                    }}>
                        <Fade
                            in={this.state.mainState === "loading"}
                            unmountOnExit
                        >
                            <CircularProgress
                                style={{
                                    color: this.mainColor,
                                    margin: 10
                                }}
                            />
                        </Fade>
                    </Grid>
                </Grid>
            </div>
        );
    };

    /* ------------------
       - IMAGE UPLOADED -
    *  ------------------*/

    handleImageReset() {
        this.setState({
            mainState: "initial", // initial, search, gallery, loading, uploaded, error
            searchText: null,
            imageData: null,
            mimeType: null,
            encoding: null,
            filename: null,
            displayError: false,
            errorMessage: null,
            displayImageName: false,
        }, () => this.sendData(this.state.imageData));
    };

    renderUploadedState() {
        return (
            <Fade in={this.state.mainState === "uploaded"}>
                <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: spacingUnit,
                    height: this.tabHeight + "px",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around'
                }}
                     onMouseOver={() => this.setState({displayImageName: true})}
                     onMouseLeave={() => this.setState({displayImageName: false})}
                >
                    <img
                        alt="Service input"
                        src={this.state.imageData}
                        onError={() => this.setState({
                            mainState: "initial",
                            searchText: null,
                            imageData: null,
                            filename: null,
                            errorMessage: this.urlErrorMessage,
                            displayError: true,
                        })}
                        id="loadedImage"
                        // crossOrigin="anonymous"
                        style={this.props.displayProportionalImage ? {
                            maxHeight: this.tabHeight + "px",
                            maxWidth: "100%",
                        } : {
                            height: this.tabHeight + "px",
                            width: "100%",
                        }}
                    />
                    <Fade in={this.state.displayImageName}>
                        <GridListTileBar
                            style={{}}
                            title={<Typography
                                style={{
                                    alignText: 'center',
                                    fontFamily: snetFont,
                                    fontVariantCaps: "normal",
                                    textTransform: 'initial',
                                    color: snetBackgroundGrey,
                                    fontSize: 14,
                                }}> {this.state.filename} </Typography>}
                        />
                    </Fade>
                </div>
            </Fade>
        );
    };

    /* -----------------
       - INITIAL STATE -
    *  -----------------*/

    handleTabChange(event, value) {
        if(this.state.imageData === null){ // If no image has been selected, simply changes tab
            this.setState({
                value: value,
            });
        } else {
            this.setState({ // If an image had been uploaded, resets it and sends "null" to parent component
                value: value,
                mainState: "initial",
                imageData: null,
                mimeType: null,
                encoding: null,
                filename: null,
            }, () => this.sendData(this.state.imageData));
        }
    };

    renderTabs() {
        return (
            <div style={this.tabStyle}>
                <SwipeableViews
                    axis='x'
                    index={this.state.value}
                >
                    <div>
                        {this.renderUploadTab()}
                    </div>
                    <div>
                        {this.renderUrlTab()}
                    </div>
                    <div>
                        {this.renderGalleryTab()}
                    </div>
                </SwipeableViews>
                <ClickAwayListener onClickAway={() => this.setState({displayError: false})}>
                    <Snackbar
                        style={{
                            position: "absolute",
                            width: "100%"
                        }}
                        open={this.state.displayError}
                        autoHideDuration={5000}
                        TransitionComponent={Slide}
                        transitionDuration={300}
                        onClose={() => this.setState({displayError: false})}
                    >
                        <SnackbarContent
                            style={{
                                backgroundColor: snetBackgroundRed,
                                margin: "2px",
                                border: "2px solid",
                                borderColor: snetRed,
                                borderRadius: "4px",
                                padding: "2px",
                                display: 'flex',
                                justifyContent: "space-around",
                                flexGrow: 1,
                                width: "100%",
                            }}
                            aria-describedby="client-snackbar"
                            message={
                                <span style={{
                                    color: snetGreyError,
                                    display: 'flex',
                                    alignItems: 'center',
                                    align: "center",
                                    justifyContent: "space-between"
                                }}>
                                    <ErrorIcon style={{
                                        fontSize: 16,
                                        opacity: 0.9,
                                        marginRight: spacingUnit,
                                    }}/>
                                    <Typography style={{
                                        fontFamily: snetFont,
                                        fontVariantCaps: "normal",
                                        textTransform: 'initial',
                                        color: snetGrey,
                                        fontSize: 14
                                    }}>
                                        {this.state.errorMessage}
                                    </Typography>
                                </span>
                            }
                        />
                    </Snackbar>
                </ClickAwayListener>
            </div>
        );
    };

    render() {
        return (
            <div
                style={{
                    width: this.props.width,
                    minHeight: "264px",
                    minWidth: minimumWidth,
                    position: "relative"
                }}
            >
                <Grid container
                      direction="row"
                      justify="flex-start"
                      alignItems="center"
                      style={{
                          color: "black",
                          backgroundColor: "white"
                      }}
                      spacing={0}
                >
                    <Grid item xs={12}>
                        <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justify="space-around"
                        >
                            <Grid item xs={3}>
                                <Typography
                                    color="inherit"
                                    noWrap
                                    variant="title"
                                    style={{
                                        fontSize: 18,
                                        fontFamily: snetFont,
                                        padding: spacingUnit / 2,
                                    }}
                                >
                                    {this.props.imageName}
                                </Typography>
                            </Grid>
                            <Grid item xs={7}>
                                <MuiThemeProvider theme={this.theme}>
                                    <Tabs
                                        value={this.state.value}
                                        onChange={this.handleTabChange.bind(this)}
                                        indicatorColor="primary"
                                        textColor="primary"
                                        // scrollButtons="on"
                                        // centered
                                        variant="fullWidth"
                                        style={{
                                            color: snetGrey,
                                        }}
                                        // TabIndicatorProps={{ style: { backgroundColor: this.mainColor } }}
                                    >
                                        {!this.props.disableUploadTab &&
                                        <Tab style={{minWidth: '5%'}} value={0} label={<span style={this.tabLabelStyle}>Upload</span>}/>}
                                        {!this.props.disableUrlTab &&
                                            <Tab style={{minWidth: '5%'}} value={1} label={<span style={this.tabLabelStyle}>URL</span>}/>}
                                        {this.props.imageGallery.length > 0 &&
                                        <Tab style={{minWidth: '5%'}} value={2} label={<span style={this.tabLabelStyle}>Gallery</span>}/>}
                                    </Tabs>
                                </MuiThemeProvider>
                            </Grid>
                            <Grid item xs={1} style={{
                                flexGrow: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: "center"
                            }}>
                                {this.props.infoTip.length > 0 &&
                                <Tooltip title={
                                    <Typography style={{fontFamily: snetFont, fontSize: 12, color: "white"}}>
                                        {this.props.infoTip}
                                    </Typography>
                                }>
                                    <InfoIcon style={{
                                        fontSize: 20,
                                        color: snetGrey
                                    }}/>
                                </Tooltip>
                                }
                            </Grid>
                            <Grid item xs={1} style={{
                                flexGrow: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: "center"
                            }}>
                                {this.state.mainState === "uploaded" &&
                                <Fade in={this.state.mainState === "uploaded"}>
                                    <Tooltip title={
                                        <Typography style={{fontFamily: snetFont, fontSize: 12, color: "white"}}>
                                            Click to reset!
                                        </Typography>
                                    }>
                                        <IconButton onClick={this.handleImageReset.bind(this)}>
                                            <RefreshIcon style={{
                                                fontSize: 20,
                                                color: this.mainColor
                                            }}/>
                                        </IconButton>
                                    </Tooltip>
                                </Fade>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} style={{backgroundColor: snetBackgroundGrey}}>
                        {
                            (this.state.mainState === "initial" && this.renderTabs()) ||
                            (this.state.mainState === "loading" && this.renderLoadingState()) ||
                            (this.state.mainState === "uploaded" && this.renderUploadedState())
                        }
                    </Grid>
                </Grid>
            </div>
        );
    };
}

SNETImageUpload.propTypes = {
    width: PropTypes.string, // e.g.: "500px", "50%" (of parent component width)
    tabHeight: PropTypes.number, // a number without units
    imageDataFunc: PropTypes.func.isRequired,
    imageName: PropTypes.string,
    disableUploadTab: PropTypes.bool, // If true disables upload tab
    disableUrlTab: PropTypes.bool, // If true disables url tab
    returnByteArray: PropTypes.bool, // whether to return base64 or byteArray image data
    outputFormat: PropTypes.oneOf(["image/png", "image/jpg", "image/jpeg"]),
    allowedInputTypes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    maxImageSize: PropTypes.number, // 10 mb
    displayProportionalImage: PropTypes.bool,
    allowURL: PropTypes.bool,
    imageGallery: PropTypes.arrayOf(PropTypes.string),
    galleryCols: PropTypes.number,
    infoTip: PropTypes.string,
    mainColor: PropTypes.object,
};

SNETImageUpload.defaultProps = {
    width: "500px",
    tabHeight: 300,
    imageName: "Input Image",
    disableUploadTab: false, // If true disables upload tab
    disableUrlTab: false, // If true disables url tab
    returnByteArray: false,
    outputFormat: "image/png",
    allowedInputTypes: "image/*",
    maxImageSize: 10000000, // 10 mb
    displayProportionalImage: true, // if true, keeps uploaded image proportions. Else stretches it
    allowURL: false, // sends image URL instead of image data for both URL and Gallery modes. Might still send base64 if the user uploads an image
    imageGallery: [],
    galleryCols: 3,
    infoTip: "",
    mainColor: blue,
};
