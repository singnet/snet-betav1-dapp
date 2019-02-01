import React, { props } from 'react';
import { Requests } from '../requests'
import { getMarketplaceURL } from '../util'
import 'react-perfect-scrollbar/dist/css/styles.css';


export default class Vote extends React.Component {
    constructor() {
      super(props)
      
      this.state = {
        upVote: false,
        downVote: false,
      };
      this.userVoted = false
      this.handleVote = this.handleVote.bind(this);
    }

    updateVote(upVote, downVote)
    {
      this.setState({upVote:upVote})
      this.setState({downVote:downVote})
    }

    processError(err, upVote, downVote)
    {
      this.userVoted = false
      console.log(err)
      this.updateVote(upVote, downVote)
    }

    handleVote(orgid,serviceid,upVote, downVote)
    {
      this.userVoted = true
      console.log("Changing upVote to " + upVote + " and downVote to " + downVote)
      const voteLikeOriginal = this.state.upVote
      const voteDislikeOriginal = this.state.downVote
            
      if(typeof upVote === 'undefined'){
        upVote = downVote ? false : this.state.upVote
      } 
      else if(typeof downVote === 'undefined') {
        downVote = upVote ? false : this.state.downVote
      }
      this.updateVote(upVote, downVote)
      
      const urlfetchvote = getMarketplaceURL(this.props.chainId) + 'user-vote'
      console.log("Message " + this.props.userAddress + orgid + upVote + serviceid + (!upVote))
      var sha3Message = web3.sha3(this.props.userAddress + orgid + upVote + serviceid + (!upVote));
      console.log("Hash " + sha3Message)
      window.ethjs.personal_sign(sha3Message, this.props.userAddress).then((signed) => {
        console.log("Signature " + signed)
        const requestObject = {
          vote: {
            user_address: this.props.userAddress,
            org_id: orgid,
            service_id: serviceid,
            up_vote: upVote,
            down_vote: downVote,
            signature: signed
          }
        }
        console.log(JSON.stringify(requestObject))
  
        Requests.post(urlfetchvote,requestObject)
          .then(res => this.processRespone(res))
          .catch(err => this.processError(err, voteLikeOriginal, voteDislikeOriginal));
      }).catch(err=> this.processError(err, voteLikeOriginal, voteDislikeOriginal))
    }

    isVotingEnabled() {
      const urlfetchvote = getMarketplaceURL(this.props.chainId)
      return (typeof urlfetchvote !== 'undefined' && this.props.enableVoting)
    }

    //TODO - Handle error here
    processRespone(response) {
      console.log(response)
    }

    isUpVote() {
      return this.userVoted ? this.state.upVote : this.props.serviceState["up_vote"]
    }

    isDownVote() {
      return this.userVoted ? this.state.downVote : this.props.serviceState["down_vote"]
    }

    render()
    {
        return(
            <React.Fragment>
              {this.isVotingEnabled() ?
              <div className="col-xs-12 col-sm-12 col-md-12 vote no-padding">
                <h3>Vote</h3>
                <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 mobile-mtb-7">
                    <div className="thumbsup-icon vote-like">
                        <span name="upVote" className={ this.isUpVote() ? "icon-like" : "icon-like-disabled"} onClick={()=>this.handleVote(this.props.serviceState["org_id"],this.props.serviceState["service_id"],!this.isUpVote(), undefined)}/>
                    </div>
                </div>
                <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 border-left-1">
                    <div className="thumbsdown-icon">
                      <span name="downVote" className={this.isDownVote() ? "icon-dislike-enabled" : "icon-dislike"} onClick={()=>this.handleVote(this.props.serviceState["org_id"],this.props.serviceState["service_id"],undefined, !this.isDownVote())}/>
                    </div>
                </div>
              </div> :
              <div className="col-xs-12 col-sm-12 col-md-12"></div>}
            </React.Fragment>
        )
    }
}
