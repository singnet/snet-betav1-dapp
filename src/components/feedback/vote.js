import React from 'react';
import 'react-perfect-scrollbar/dist/css/styles.css';


const Vote = ({upVote,downVote,toggleVote}) =>{
        return(
            <React.Fragment>
              <div className="col-xs-12 col-sm-12 col-md-12 vote no-padding">
                <h3>Vote</h3>
                <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 mobile-mtb-7">
                    <div className="thumbsup-icon vote-like">
                        <span name="upVote" className={ upVote ? "icon-like" : "icon-like-disabled"} onClick={()=>toggleVote('up')}/>
                    </div>
                </div>
                <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 border-left-1">
                    <div className="thumbsdown-icon">
                      <span name="downVote" className={downVote ? "icon-dislike-enabled" : "icon-dislike"} onClick={()=>toggleVote('down')}/>
                    </div>
                </div>
              </div> 
            </React.Fragment>
        )
}

export default Vote;
