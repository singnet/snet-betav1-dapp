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
        userVoted: false,
      };
      this.handleVote = this.handleVote.bind(this);
      console.log(JSON.stringify(props))
    }

    updateVote(upVote, downVote)
    {
      this.setState({voteLike:upVote})
      this.setState({voteDislike:downVote})      
    }

    processError(err, upVote, downVote)
    {
      console.log(err)
      this.updateVote(upVote, downVote)
    }

    handleVote(orgid,serviceid,upVote)
    {
      this.setState({userVoted:true})
      const voteLikeOriginal = this.state.upVote
      const voteDislikeOriginal = this.state.downVote

      this.updateVote(upVote, !upVote)
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
            down_vote: (!upVote),
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
  
    getUpVote() {
      return this.state.userVoted ? this.state.upVote : this.props.serviceState["up_vote"];
    }

    getDownVote() {
      return this.state.userVoted ? this.state.downVote : this.props.serviceState["down_vote"];
    }

    processRespone(response) {
      console.log(response)
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
                        <span name="upVote" className={(this.getUpVote()) ? "icon-like" : "icon-like-disabled"} onClick={()=>this.handleVote(this.props.serviceState["org_id"],this.props.serviceState["service_id"],!this.getUpVote())}/>
                    </div>
                </div>
                <div className="col-xs-6 col-sm-6 col-md-6 mtb-20 border-left-1">
                    <div className="thumbsdown-icon">
                      <span name="downVote" className={(this.getDownVote()) ? "icon-dislike-enabled" : "icon-dislike"} onClick={()=>this.handleVote(this.props.serviceState["org_id"],this.props.serviceState["service_id"],!this.getDownVote())}/>
                    </div>
                </div>
              </div> :
              <div className="col-xs-12 col-sm-12 col-md-12 vote no-padding"></div>}
            </React.Fragment>
        )
    }
}
