import React, { props } from 'react';
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import { Link } from 'react-router-dom'
import 'react-perfect-scrollbar/dist/css/styles.css'
import CircularProgress from '@material-ui/core/CircularProgress'


export default class DAppModal extends React.Component {
    constructor() {
      super(props)

    }
  
    render()
    {
        //<Dialog style={{boxShadow: '#e8e8e8 0px 2px 2px 2px'}} open={true}>
        return(
            <React.Fragment>
                <Dialog open={this.props.open}>
                    <DialogContent>
                    <div className="message-modal">
                        <div style={{ width: '50px' }} className="col-sm-12 col-md-6 col-lg-6">
                            {(this.props.showProgress)?
                            <CircularProgress backgroundpadding={6} styles={{ background: { fill: '#4086ff', }, text: { fill: '#fff', }, path: { stroke: '#fff', }, trail: { stroke: 'transparent' }, }} />:
                            null
                            }
                        </div> 
                        <div className="col-sm-12 col-md-6 col-lg-8">
                            {this.props.message}
                        </div>
                        <div style={{textAlign: "center"}}>
                        {(typeof this.props.link !== 'undefined')?
                        <Link to={this.props.link}>
                            <input className='btn btn-primary' type='button' value={this.props.linkText} />
                        </Link> :null}
                    </div>
                    </div>
                    </DialogContent>
                </Dialog>
        </React.Fragment>
        )
    }
}
