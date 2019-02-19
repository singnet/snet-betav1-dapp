import React from 'react';
import {Link} from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee } from '@fortawesome/free-solid-svg-icons'
import { NETWORKS } from '../networks'
import GetStarted from './GetStarted'

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false
    }
    this.showMenu = this.showMenu.bind(this);    
    library.add(fab, faCheckSquare, faCoffee);
  }

  showMenu(){
    this.setState({
      showMenu: !this.state.showMenu
    })
  }


  render() {
    const menuList = <ul>
                      <li className="get-started"><Link to="//blog.singularitynet.io/a-beginners-guide-to-the-singularitynet-beta-74d523902958" target="_blank">Get Started</Link></li>
                      <li><Link to={(typeof web3 !== 'undefined')? "/SampleServices" : "/"}>Home</Link></li>
                      <li><Link to="/Account">Account</Link></li>
                      <li><Link to="//blog.singularitynet.io" target="_blank">Blog</Link></li>
                      <li><Link to="//faucet.singularitynet.io" target="_blank">AGI Faucet</Link></li>
                    </ul>

    const networkName = (typeof NETWORKS[this.props.chainId] !== 'undefined' && typeof NETWORKS[this.props.chainId].name !== 'undefned') ?
                    <div className="col-xs-3 col-sm-4 col-md-3 col-lg-2 network-name">
                        {NETWORKS[this.props.chainId].name}
                    </div>
                    :
                    <div className="col-xs-3 col-sm-4 col-md-3 col-lg-2 network-name"/>
    return (
      <React.Fragment>
            <div className="inner">
                <div id="roadmap-row" data-midnight="light" data-bg-mobile-hidden="" className="wpb_row vc_row-fluid vc_row full-width-section standard_section" style={{ visibility: "visible"}} data-top-percent="4%" data-bottom-percent="4%">
                    <div className="row-bg-wrap instance-2">
                    <div className="inner-wrap"> 
                        <div className="row-bg" data-color_overlay="#40ceff" data-color_overlay_2="#5a2ff1" data-gradient_direction="left_to_right" data-overlay_strength="1" data-enable_gradient="true"></div>
                    </div> 
                </div>
                <div className="nectar-shape-divider-wrap no-color" data-front="" data-style="mountains" data-position="bottom">
                    <svg className="nectar-shape-divider" fill="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 300" preserveAspectRatio="none">  
                    <path d="M 1014 264 v 122 h -808 l -172 -86 s 310.42 -22.84 402 -79 c 106 -65 154 -61 268 -12 c 107 46 195.11 5.94 275 137 z"></path>   
                    <path d="M -302 55 s 235.27 208.25 352 159 c 128 -54 233 -98 303 -73 c 92.68 33.1 181.28 115.19 235 108 c 104.9 -14 176.52 -173.06 267 -118 c 85.61 52.09 145 123 145 123 v 74 l -1306 10 z"></path>  
                    <path d="M -286 255 s 214 -103 338 -129 s 203 29 384 101 c 145.57 57.91 178.7 50.79 272 0 c 79 -43 301 -224 385 -63 c 53 101.63 -62 129 -62 129 l -107 84 l -1212 12 z"></path>  
                    <path d="M -24 69 s 299.68 301.66 413 245 c 8 -4 233 2 284 42 c 17.47 13.7 172 -132 217 -174 c 54.8 -51.15 128 -90 188 -39 c 76.12 64.7 118 99 118 99 l -12 132 l -1212 12 z"></path>  
                    <path d="M -12 201 s 70 83 194 57 s 160.29 -36.77 274 6 c 109 41 184.82 24.36 265 -15 c 55 -27 116.5 -57.69 214 4 c 49 31 95 26 95 26 l -6 151 l -1036 10 z"></path> 
                    </svg>
                </div>            
              <div className="header">
                <div className="desktop-header">
                  <div className="col-xs-5 col-sm-4 col-md-3 col-lg-5 logo">
                      {(typeof web3 !== 'undefined')?
                      <Link to="/SampleServices">
                      <h1><span className="icon-logo"></span></h1></Link>:
                      <Link to="/">
                      <h1><span className="icon-logo"></span></h1></Link>}
                  </div>
                  { networkName }
                  <div className="col-xs-4 col-sm-4 col-md-6 col-lg-5 navigation">
                    { menuList }
                  </div>
                  <div className="col-xs-4 col-sm-4 col-md-6 col-lg-5 hamburger-menu">
                    <button className="bars" onClick={this.showMenu}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </button>
                    {
                      this.state.showMenu ? 
                        <div className="header-menu">
                          {menuList}
                        </div>
                      : 
                        null  
                    }                  
                  </div>
                </div>  
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 mobile-header">
                  { networkName }
                </div>                
              </div>
            </div>
          </div>
          {this.props.children}
      </React.Fragment>
    );
  }
}
