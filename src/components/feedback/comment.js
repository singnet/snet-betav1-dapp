import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core/es';

class Comment extends Component {
    constructor(props){
        super(props);
    }

    render(){
        const {userComment, handleUserComment} = this.props;
        return(
            <div className="col-xs-12 col-sm-12 col-md-12 comment no-padding">
                    <TextField
                        id="feedback-textfield"
                        label="Feedback"
                        style={{ margin: 8 }}
                        placeholder="Please provide your feedback here"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows="6"
                        InputLabelProps={{
                            shrink: true,
                            style: {
                                fontSize: 20,
                                color: '#303030',
                                fontWeight: 'bold',
                                opacity: 0.9
                            }
                        }}
                        inputProps={{
                            maxLength: 1024,
                            style: {
                                color: "rgba(0, 0, 0, 0.87)",
                                fontSize: 14,
                                letterSpacing: "normal",
                                lineHeight: "1.2em",
                                opacity: 0.9
                            }
                        }}
                        value={userComment}
                        onChange={handleUserComment}
                    />
                </div> 
        );
    }
}

Comment.propTypes={
    userComment: PropTypes.string.isRequired,
    handleUserComment: PropTypes.func.isRequired
}
export default Comment;