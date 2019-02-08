import React, { props } from 'react';
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Slide from '@material-ui/core/Slide'
import { Link } from 'react-router-dom'
import {ModalStylesAlertWait} from './ReactStyles.js';
import 'react-perfect-scrollbar/dist/css/styles.css';
import CircularProgress from '@material-ui/core/CircularProgress'


export default class DAppModal extends React.Component {
    constructor() {
      super(props)

    }
  
    render()
    {
        return(
            <React.Fragment>
            <div tabIndex="-1">
                <Modal disableAutoFocus={true} style={ModalStylesAlertWait} open={this.props.open}>
                    <Slide direction="left" in={this.props.open} mountonEnter unmountOnExit>
                        <React.Fragment>
                            <Typography component={ 'div'} style={{fontSize: "13px",lineHeight: "15px"}}>
                                <div className="row">
                                <div style={{ width: '50px' }} className="col-sm-12 col-md-6 col-lg-6">
                                      {(this.props.showProgress)?
                                      <CircularProgress backgroundpadding={6} styles={{ background: { fill: '#3e98c7', }, text: { fill: '#fff', }, path: { stroke: '#fff', }, trail: { stroke: 'transparent' }, }} />:
                                      null
                                      }
                                    </div>                                
                                    <div className="col-sm-12 col-md-6 col-lg-6">
                                        {this.props.message}
                                    </div>
                                    <div style={{textAlign: "center"}}>
                                    {(typeof this.props.link !== 'undefined')?
                                    <Link to={this.props.link}>
                                        <input className='btn btn-primary' type='button' value={this.props.linkText} />
                                    </Link> :null}
                                </div>
                                </div>
                            </Typography>
                        </React.Fragment>
                    </Slide>
                </Modal>
            </div>              
        </React.Fragment>
        )
    }
}
