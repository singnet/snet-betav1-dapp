import React from 'react';
import {Link} from 'react-router-dom';
export default class App extends React.Component {
  constructor(props) {
    super(props); 
  }

  render() {
    return (
      <React.Fragment>
            <div className="inner">
              <div className="header">
                  <div className="col-xs-6 col-sm-4 col-md-6 col-lg-6 logo">
                      {(typeof web3 !== 'undefined')?
                      <Link to="/SampleServices">
                      <h1><img src="./img/singularity-logo.png"  alt="SingularityNET"/></h1></Link>:
                      <Link to="/">
                      <h1><img src="./img/singularity-logo.png"  alt="SingularityNET"/></h1></Link>}
                  </div>
                  <div className="col-xs-6 col-sm-8 col-md-6 col-lg-6 search-user">
                      {
                        (typeof this.props.searchCallBack !== 'undefined')?
                          <input className="search hidden-xs" placeholder={this.props.searchTerm} name="srch-term" id="srch-term" type="label" onClick={this.props.searchCallBack} />:<p></p>
                      }
                      <div className="user">
                          {(typeof web3 !== 'undefined')?
                          <Link to="/SampleServices"><img src="./img/home-icon.png" alt="" /> </Link>:
                          <Link to="/"><img src="./img/home-icon.png" alt="" /> </Link>}
                      </div>
                      <div className="user">
                          <Link to="/Profile"><img src="./img/user.png" alt="User" /></Link>
                      </div>
                  </div>
              </div>
          </div>
          {this.props.children}
      </React.Fragment>              
    );
  }
}
