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
      <h1><img src="./img/singularity-logo.png"  alt="SingularityNET"/></h1>
      
      </div>
      <div className="col-xs-6 col-sm-8 col-md-6 col-lg-6 search-user">
      <input className="search hidden-xs" type="text" placeholder="Search" name="srch-term" id="srch-term" type="text" />
      <div className="user">
      {(typeof web3 !== 'undefined')?
                <Link to="/SampleServices"><img src="./img/home-icon.png" alt=""/> </Link>:
                <Link to="/"><img src="./img/home-icon.png" alt=""/> </Link>}
              
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
