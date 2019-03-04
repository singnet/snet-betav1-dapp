import React from 'react';

const tosKey="hasACC3p3t3d"
export default class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      acceptedTOC: this.hasAcceptedTOC()
    }
    this.handleAcceptedTOC = this.handleAcceptedTOC.bind(this);
  }

  hasAcceptedTOC() {
    return window.localStorage.getItem(tosKey) || false;
  }
  
  acceptTOC() {
    window.localStorage.setItem(tosKey, true);
  }

  handleAcceptedTOC(){
    this.setState({
      acceptedTOC: true
    })
    this.acceptTOC()
  }


  render() {
    return (
      <React.Fragment>
            {this.state.acceptedTOC ?
            null:
            <div className="footer">
              <p>By continuing to browse the site you agree to our storing of cookies on your browser to enhance site navigation as well agree to our <a href="https://public.singularitynet.io/Beta-TOS.html" target="_blank">Terms and conditions</a></p>
              <button className="btn btn-primary" onClick={this.handleAcceptedTOC}>Accept</button>
            </div>}
      </React.Fragment>
    );
  }
}
