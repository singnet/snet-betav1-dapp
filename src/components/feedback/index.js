import React, { props } from 'react';
import TextField from '@material-ui/core/TextField';
import PropTypes, { bool } from 'prop-types';
import { Requests } from '../../requests'
import { getMarketplaceURL } from '../../util'
import 'react-perfect-scrollbar/dist/css/styles.css';
import { Button } from '@material-ui/core/es';
import Vote from './vote';
import Comment from './comment';


export default class Feedback extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            userComment: '',
            upVote: false,
            downVote: false,
            feedbackSubmitted:false,
            submitSuccessful:false,
            submitMessage:''
        }
        this.handleUserComment = this.handleUserComment.bind(this);
        this.toggleVote = this.toggleVote.bind(this);
        this.handleFeedbackSubmit = this.handleFeedbackSubmit.bind(this);
        this.isFeedbackChanged = this.isFeedbackChanged.bind(this);
    }

    componentDidMount() {
        console.log(this.props.serviceState);
        //Checking if user has already provided feedback
        if (this.props.serviceState.comment != null) {
            this.setState({ userComment: this.props.serviceState.comment });
        }
        //Checking if user has already voted
        if (this.props.serviceState["up_vote"]) {
            this.toggleVote('up');
        } else if (this.props.serviceState["down_vote"]) {
            this.toggleVote('down');
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.serviceState.comment != this.props.serviceState.comment){
            this.setState({userComment:this.props.serviceState.comment})
        }
        
        if(prevProps.serviceState['up_vote'] != this.props.serviceState['up_vote']){
            this.setState({upVote:this.props.serviceState['up_vote']})
        }
        if(prevProps.serviceState['down_vote'] != this.props.serviceState['down_vote']){
            this.setState({downVote:this.props.serviceState['down_vote']})
        }
    }

    handleUserComment(event) {
        this.setState({ userComment: event.target.value });
    }

    toggleVote(type) {
        if (type === 'up') {
            this.setState(prevState => { return ({ upVote: !prevState.upVote, downVote: false}) });
        }
        else if (type === 'down') {
            this.setState(prevState => { return ({ upVote: false, downVote: !prevState.downVote }) });
        }
    }

    isFeedbackChanged(){
        if(this.props.serviceState["up_vote"] != this.state.upVote ||
        this.props.serviceState["down_vote"] != this.state.downVote ||
        this.props.serviceState.comment != this.state.userComment){
            return true;
        }
        return false;
    }

    handleFeedbackSubmit() {
        const urlfetchvote = getMarketplaceURL(this.props.chainId) + 'feedback'
        var sha3Message = web3.sha3(this.props.userAddress + this.props.serviceState["org_id"] + this.state.upVote + this.props.serviceState["service_id"] + this.state.downVote + this.state.userComment.toLowerCase());
        window.ethjs.personal_sign(sha3Message, this.props.userAddress).then((signed) => {
            const requestObject = {
                feedback: {
                    user_address: this.props.userAddress,
                    org_id: this.props.serviceState["org_id"],
                    service_id: this.props.serviceState["service_id"],
                    up_vote: this.state.upVote,
                    down_vote: this.state.downVote,
                    comment: this.state.userComment,
                    signature: signed
                }
            }
            Requests.post(urlfetchvote, requestObject)
                .then(res => this.setState({feedbackSubmitted:true,submitSuccessful:true,submitMessage:'Feedback submitted successfully 😊'}))
                .catch(err => this.setState({feedbackSubmitted:true,submitSuccessful:false,submitMessage:'Unable to submit feedback 😟. Please try again'}));
        }).catch(err=>this.setState({feedbackSubmitted:true,submitSuccessful:false,submitMessage:'User denied signature 😟. Please sign in Metamask'}));
    }

    render() {
        const { enableFeedback, chainId, serviceState, userAddress } = this.props;
        const { userComment, upVote, downVote, feedbackSubmitted, submitSuccessful, submitMessage } = this.state;
        return (
            <div className="feedback">
                {enableFeedback && getMarketplaceURL(chainId) ?
                    <React.Fragment>
                        {feedbackSubmitted?<div className={submitSuccessful ? "col-xs-12 col-sm-12 col-md-12 transaction-message":"col-xs-12 col-sm-12 col-md-12 error-msg"}>
                                            {submitMessage}</div>:''}
                        <Vote chainId={chainId} enableVoting={enableFeedback} serviceState={serviceState} userAddress={userAddress}
                            upVote={upVote} downVote={downVote} toggleVote={this.toggleVote} />
                        <Comment userComment={userComment} handleUserComment={this.handleUserComment} />
                        {this.isFeedbackChanged()?<button type="button" className="btn-primary" onClick={this.handleFeedbackSubmit}> Submit</button>:''}
                    </React.Fragment>
                    : ""}

            </div>

        )
    }
}

Feedback.propTypes = {
    enableFeedback: PropTypes.bool,
    serviceState: PropTypes.object,
    userAddress: PropTypes.string,
    chainId: PropTypes.string
}
