import React from 'react';
import SNETImageUpload from "./standardComponents/SNETImageUpload";
import {hasOwnDefinedProperty} from '../../util'


const outsideWrapper = { 
    width: '256px',
    height: '256px',
    margin: '0px 0px', 
    border: '0px',
};
const insideWrapper = { 
    width: '100%',
    height: '100%',
    position: 'relative',
};
const coveredImage = { 
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '0px',
      left: '0px',
    };
const coveringCanvas = { 
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: '0px',
      left: '0px',
    };

export default class FaceLandmarksService extends React.Component {

    constructor(props) {
        super(props);
        this.submitAction = this.submitAction.bind(this);
        this.handleServiceName = this.handleServiceName.bind(this);
        this.handleFormUpdate = this.handleFormUpdate.bind(this);
        this.getData = this.getData.bind(this);

        this.state = {
            serviceName: undefined,
            methodName: undefined,
            response: undefined,
            imageData: undefined,
            imgsrc: undefined,
            facesString: '[{"x":10,"y":10,"w":100,"h":100}]',
            landmarkModel: "68",
        };

        this.isComplete = false;
        this.serviceMethods = [];
        this.allServices = [];
        this.methodsForAllServices = [];
        this.parseProps(props);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.response !== prevState.response) {
          this.renderLandmarks(this.state.response);
        }
        if (this.state.landmarkModel !== prevState.landmarkModel)
            this.setState({inputValid: this.checkValid()});
        if (this.state.facesString !== prevState.facesString) {
            let inputValid = this.checkValid();
            if (inputValid) {
                // TODO render the image inside the upload widget
                // renderBoundingBox
            }
            this.setState({inputValid: this.checkValid()});
        }
        if (this.state.methodName !== prevState.methodName)
            this.setState({inputValid: this.checkValid()});
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
                this.setState({response: nextProps.response});
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
    handleChange(type, e) {
        this.setState({
            [type]: e.target.value,
        });        
    }

    handleServiceName(event) {
        let strService = event.target.value;
        this.setState({
            serviceName: strService
        });
        this.serviceMethods.length = 0;
        if (typeof strService !== 'undefined' && strService !== 'Select a service') {
            let data = Object.values(this.methodsForAllServices[strService]);
            if (typeof data !== 'undefined') {
                this.serviceMethods= data;
            }
        }
    }

    submitAction() {
        this.props.callApiCallback(this.state.serviceName,
            this.state.methodName, {
                header: {
                    landmark_model: this.state.landmarkModel,
                    faces: { face_bbox: JSON.parse(this.state.facesString) },
                },
                image_chunk: {
                    content: this.state.imageData,
                }
            });
    }

    checkValid() {
        let inputValid = true;
        
        try {
            let faces = JSON.parse(this.state.facesString);
            faces.forEach((item) => {
              let expectedKeys = ['x', 'y', 'w', 'h'];
              expectedKeys.forEach((k) => {
                if (!(k in item)) inputValid = false;
              });
            });
        } catch(e) {
            inputValid = false;
        }
        
        if (this.state.methodName === undefined ||this.state.methodName === "Select a method" || this.state.methodName.length == 0)
            inputValid = false;
            
        if (this.state.landmarkModel !== "68" && this.state.landmarkModel !== "5")
            inputValid = false;
    
        if (this.state.imageData === undefined)
            inputValid = false;
    
        return inputValid;
        
      }
      
    
    getData(imageData, mimetype, format, fn) {
        this.setState({imageData: imageData});
        var reader  = new FileReader();
        
        reader.addEventListener("load", () => {
            var dataurl = reader.result;
            this.setState({imgsrc: "data:" + mimetype + ";base64," + dataurl.substr(dataurl.indexOf(',')+1)});
        }, false);

        reader.readAsDataURL(new Blob([imageData]));
    }

    drawX(ctx, x, y) {
        let size = 3;
        
        ctx.moveTo(x - size, y - size);
        ctx.lineTo(x + size, y + size);
        ctx.stroke();
    
        ctx.moveTo(x + size, y - size);
        ctx.lineTo(x - size, y + size);
    }
    
    renderLandmarks(result) {
        let img = this.refs.sourceImg;
        let cnvs = this.refs.bboxCanvas;
        let outsideWrap = this.refs.outsideWrap;
        if (img === undefined || cnvs === undefined || outsideWrap == undefined)
          return;
        if (img.naturalWidth === 0 || img.naturalHeight === 0)
        {
            setTimeout ( () => this.renderLandmarks(result), 200 );
            return;
        }
        let desiredWidth = 500.0; // TODO: find appropriate reference width from components
        let scaleFactor = desiredWidth / img.naturalWidth;
        outsideWrap.style.width = img.naturalWidth * scaleFactor + "px";
        outsideWrap.style.height = img.naturalHeight * scaleFactor + "px";
        cnvs.style.position = "absolute";
        cnvs.style.left = img.offsetLeft + "px";
        cnvs.style.top = img.offsetTop + "px";
        cnvs.width = img.naturalWidth * scaleFactor;
        cnvs.height = img.naturalHeight * scaleFactor;
      
        let ctx = cnvs.getContext("2d");
        result.landmarked_faces.forEach((item) => {
          ctx.beginPath();
          item.point.forEach((p) => {
            this.drawX(ctx, p.x * scaleFactor, p.y * scaleFactor);
          })
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#00ff00';
          ctx.stroke();
        });
        
    }

    renderBoundingBox(result) {
        // {"faces": [{"x": 511, "y": 170, "w": 283, "h": 312}, {"x": 61, "y": 252, "w": 236, "h": 259}]}
        let img = this.refs.sourceImg;
        let cnvs = this.refs.bboxCanvas;
        let outsideWrap = this.refs.outsideWrap;
        if (img === undefined || cnvs === undefined || outsideWrap == undefined)
          return;
        if (img.naturalWidth === 0 || img.naturalHeight === 0)
        {
            setTimeout ( () => this.renderBoundingBox(result), 200 );
            return;
        }
        let desiredWidth = 500.0; // TODO: find appropriate reference width from components
        let scaleFactor = desiredWidth / img.naturalWidth;
        outsideWrap.style.width = img.naturalWidth * scaleFactor + "px";
        outsideWrap.style.height = img.naturalHeight * scaleFactor + "px";
        cnvs.style.position = "absolute";
        cnvs.style.left = img.offsetLeft + "px";
        cnvs.style.top = img.offsetTop + "px";
        cnvs.width = img.naturalWidth * scaleFactor;
        cnvs.height = img.naturalHeight * scaleFactor;
      
        let ctx = cnvs.getContext("2d");
        result.face_bbox.forEach((item) => {
            ctx.beginPath();
            ctx.rect(
                item.x * scaleFactor,
                item.y * scaleFactor,
                item.w * scaleFactor,
                item.h * scaleFactor
            );
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00ff00';
            ctx.stroke();
          }); 
      }

    renderForm() {
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Service Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select id="select1"
                                style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                                onChange={this.handleServiceName}>
                            {this.allServices.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-3 col-lg-3" style={{fontSize: "13px", marginLeft: "10px"}}>Method Name</div>
                    <div className="col-md-3 col-lg-3">
                        <select name="methodName"
                                style={{height: "30px", width: "250px", fontSize: "13px", marginBottom: "5px"}}
                                onChange={this.handleFormUpdate}>
                            {this.serviceMethods.map((row, index) =>
                                <option key={index}>{row}</option>)}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6">
                        <SNETImageUpload imageDataFunc={this.getData} returnByteArray={true}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6">
                        <label>
                        Landmark model:
                        <input type="text" value={this.state.landmarkModel} onChange={ this.handleChange.bind(this, 'landmarkModel') } />
                        </label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6">
                        <label>
                        Faces JSON (you can get this from face detect):
                        <textarea onChange={ this.handleChange.bind(this, 'facesString')} value={this.state.facesString} />
                        </label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-lg-6" style={{marginTop:"5px", textAlign: "right"}}>
                        <button type="button" className="btn btn-primary" onClick={this.submitAction} disabled={!this.state.inputValid}>Invoke</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    renderComplete() {
        return (
            <div>
                <p style={{fontSize: "13px"}}>Response from service is {JSON.stringify(this.state.response)} </p>
                <div ref="outsideWrap" style={outsideWrapper}>
                    <div style={insideWrapper}>
                    <img ref="sourceImg" style={coveredImage} src={this.state.imgsrc}/>
                    <canvas ref="bboxCanvas" style={coveringCanvas}/>
                    </div>
                </div>
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
