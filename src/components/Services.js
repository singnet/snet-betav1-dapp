import React from 'react'
import PropTypes from 'prop-types'
import { MuiThemeProvider } from "@material-ui/core/styles"
import Pagination from "material-ui-flat-pagination"
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Slide from '@material-ui/core/Slide'
import { withRouter } from 'react-router-dom'
import { AGI } from '../util'
import { Requests } from '../requests'
import BlockchainHelper from "./BlockchainHelper.js"
import {Carddeckers} from './CardDeckers.js';
import {Jobdetails} from './JobDetails.js';
import {theme} from './ReactStyles.js';
import App from "../App.js";

class SampleServices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      agents : [],
      healthMerged: false,
      offset:0,
      searchBarOpen:false,
      uservote:[],
      userservicestatus:[],
      searchterm:'',
      bestestsearchresults:[],
      besttagresult:[],
      togleprice: false,
      togleservicename:false,
      togglehealth:false,
      userAddress: undefined,
      chainId: undefined,
    };

    this.network = new BlockchainHelper();
    
    this.account = undefined;
    this.onOpenJobDetailsSlider = this.onOpenJobDetailsSlider.bind(this)
    this.onCloseJobDetailsSlider = this.onCloseJobDetailsSlider.bind(this)
    this.onOpenSearchBar = this.onOpenSearchBar.bind(this)
    this.onCloseSearchBar = this.onCloseSearchBar.bind(this)
    this.handlesearch = this.handlesearch.bind(this)
    this.captureSearchTerm = this.captureSearchTerm.bind(this)
    this.handlesearchbytag = this.handlesearchbytag.bind(this)
    this.handlepricesort = this.handlepricesort.bind(this)
    this.handleservicenamesort = this.handleservicenamesort.bind(this)
    this.handlehealthsort = this.handlehealthsort.bind(this)
    this.handlesearchkeyup = this.handlesearchkeyup.bind(this)
    this.handlesearchclear = this.handlesearchclear.bind(this)
    this.watchNetworkTimer = undefined;
  }

  watchNetwork() {
    this.network.getChainID((chainId) => {
      if (chainId !== this.state.chainId) {
        this.setState({ chainId: chainId });
        this.loadDetails(chainId);
      }
    });
  }

  handlesearchclear() {
    this.setState({searchterm: ''})
  }

  handlesearchkeyup(e) {
    e.preventDefault();
    if (e.keyCode === 13) {
      this.handlesearch()
    }
  }

  handlehealthsort() {
    if (!this.state.healthMerged) {
      for (var ii in this.state.agents) {
        for (var jj in this.state.userservicestatus) {
          if (this.state.agents[ii].service_id === this.state.userservicestatus[jj].service_id) {
            this.state.agents[ii].is_available = this.state.userservicestatus[jj].is_available;
            break;
          }
        }
      }
      this.state.healthMerged = true;
    }
    var healthSort = this.state.agents
    if (this.state.togglehealth === false) {
      healthSort.sort((a, b) => b.is_available - a.is_available)
      this.setState({
        togglehealth: true
      })
    } else if (this.state.togglehealth === true) {
      healthSort.sort((a, b) => a.is_available - b.is_available)
      this.setState({
        togglehealth: false
      })
    }
    this.setState({agents: healthSort});
  }

  handlepricesort() {
    var pricesort = this.state.agents
    if (this.state.togleprice === false) {

      pricesort.sort((a, b) => b.price_in_cogs - a.price_in_cogs)
      this.setState({togleprice: true})
    } else if (this.state.togleprice === true) {

      pricesort.sort((a, b) => a.price_in_cogs - b.price_in_cogs)
      this.setState({togleprice: false})
    }
    this.setState({agents: pricesort})
  }
  
  handleservicenamesort() {
    var servicenamesort = this.state.agents
    if (this.state.togleservicename === false) {
      servicenamesort.sort(function (a, b) {
        return a.display_name.localeCompare(b.display_name);
      });
      this.setState({togleservicename: true})
    } else if (this.state.togleservicename === true) {
      servicenamesort.sort(function (a, b) {
        return b.display_name.localeCompare(a.display_name);
      });
      this.setState({togleservicename: false})
    }
    this.setState({agents: servicenamesort})
  }

  handleWindowLoad() {
    this.network.initialize().then(isInitialized => {
      if (isInitialized) {
        this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
      } 
      else {
        this.setState({chainId: this.network.getDefaultNetwork()});
        console.log("Defaulting to " + this.state.chainId);
        this.loadDetails(this.network.getDefaultNetwork());
      }
    }).catch(err => {
      console.error(err);
    })
  }

  componentWillUnmount() {
    if (this.watchNetworkTimer) {
      clearInterval(this.watchNetworkTimer);
    }
  }

  componentDidMount() {
    window.addEventListener('load', () => this.handleWindowLoad());
    this.handleWindowLoad();
  }

  loadDetails(chainId) {
    const url = this.network.getMarketplaceURL(chainId) + "service"
    const urlfetchservicestatus = this.network.getMarketplaceURL(chainId) + 'group-info'
    const urlfetchvote = this.network.getMarketplaceURL(chainId) + 'fetch-vote'
    const fetchVoteBody = {user_address: web3.eth.coinbase}
    console.log("Fetching data for " + chainId)
    Promise.all([Requests.get(url),Requests.get(urlfetchservicestatus),Requests.post(urlfetchvote,fetchVoteBody)])
    .then((values) =>
    {
      values[0].data.map(rr => {
        rr["price_in_agi"] = AGI.inAGI(rr["price_in_cogs"])
      });    

      if(Array.isArray(values[0].data)) {
        this.setState({agents: values[0].data})
      }
      if(Array.isArray(values[1].data)) {
        this.setState({userservicestatus: values[1].data})
      }
      if(Array.isArray(values[2].data)) {
        this.setState({uservote: values[2].data})
      }
    }
    ).catch((err)=> console.log(err))

    this.state.healthMerged = false;
    if (typeof web3 === 'undefined') {
      return;
    }

    this.setState({userAddress: web3.eth.coinbase});
  }

  handleClick(offset) {
    this.setState({ offset });
  }

  onOpenJobDetailsSlider(data,dataservicestatus) {
    this.refs.jobdetailsComp.onOpenJobDetails(data, dataservicestatus);
  }

  onCloseJobDetailsSlider(){
    this.refs.jobdetailsComp.onCloseJobDetailsSlider();
  }

  onOpenSearchBar(e) {
    this.setState({ searchBarOpen: true });
  }

  onCloseSearchBar(){
    this.setState({ searchBarOpen: false });
  }

  handlesearch() {
    this.setState({besttagresult: []});
    let searchedagents = []
    searchedagents = this.state.agents.map(row => (row["display_name"].toUpperCase().indexOf(this.state.searchterm.toUpperCase()) !== -1 || row["service_id"].toUpperCase().indexOf(this.state.searchterm.toUpperCase()) !== -1) ? row : null)
    let bestsearchresults = [...(searchedagents.filter(row => row !== null).map(row1 => row1))]
    this.setState({bestestsearchresults: bestsearchresults})
  }

  handlesearchbytag(e, data) {
    let tagresult = [];
    this.state.agents.map(rowagents =>
      (rowagents["tags"].map(rowtag => (rowtag === data) ? tagresult.push(rowagents) : null))
    )
    //inner loop trap//
    this.setState({besttagresult: tagresult})
  }

  captureSearchTerm(e) {
    this.setState({searchterm:e.target.value})
  }

  render() {
    const {open} = this.state;
    var agentsample = this.state.agents
    if (this.state.searchterm !== '') {
      agentsample = this.state.bestestsearchresults
    }
    if (this.state.besttagresult.length > 0) {
      agentsample = this.state.besttagresult
    }
    let servicestatus = this.state.userservicestatus
    let arraylimit = agentsample.length
    agentsample.map(row => {
      row["up_vote"] = 0, row["down_vote"] = 0
    });
    this.state.agents.map(row =>
      this.state.uservote.map(rown => ((rown["service_id"] === row["service_id"] && rown["org_id"] === row["org_id"]) ?
        ((rown["up_vote"] === 1 ? row["up_vote"] = 1 : row["up_vote"] = 0) || (rown["down_vote"] === 1 ? row["down_vote"] = 1 : row["down_vote"] = 0)) : null))
    );
    const agents = agentsample.slice(this.state.offset, this.state.offset + 5).map((rown,index) =>
      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 media" key={index} id={rown[ "service_id"]} name={rown[ "display_name"].toUpperCase()}>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Agent Name</div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-name-align" id={rown[ "service_id"]} name={rown[ "display_name"]}>
              <label className="m-0">
                  <Typography className="m-0" style={{fontSize: "14px"}}>
                      {rown["display_name"]}</Typography>
              </label>
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Organization</div>
          <div className="col-sm-12 col-md-2 col-lg-2 org-name-align">
              <Typography className="m-0" style={{fontSize: "14px",fontFamily: "Arial", }}>{rown["org_id"]}</Typography>
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Price</div>
          <div className="col-sm-12 col-md-2 col-lg-2 price-align">
              <label className="m-0">
                  <Typography className="m-0" style={{fontSize: "15px",fontFamily: "Arial", }}>{(rown["price_in_agi"])} AGI</Typography>
              </label>
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Tag</div>
          <div className="col-sm-12 col-md-2 col-lg-2 tag-align">
              {(rown.hasOwnProperty('tags'))? rown["tags"].map(rowtag =>
              <button className='btn btn-secondary mr-15' href='#' onClick={(e)=>{this.handlesearchbytag(e,rowtag)}}>{rowtag}</button>):null}
          </div>
          <div className="col-sm-12 col-md-1 col-lg-1 agent-boxes-label">Health</div>
          <div className="col-sm-12 col-md-1 col-lg-1 health-align">
              {servicestatus.map((row,rindex) => ((row["service_id"]===rown["service_id"])? ((row["is_available"] ===1)? <span key={rindex} className="agent-health green"></span>: <span key={rindex} className="agent-health red"></span>) :null) )}
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Action</div>
          <div className="col-sm-12 col-md-2 col-lg-2 action-align">
              <button className="btn btn-primary" onClick={(e)=>this.onOpenJobDetailsSlider(rown,this.state.userservicestatus)} id={rown["service_id"]}>Details</button>
          </div>
          <div className="col-sm-12 col-md-1 col-lg-1 likes-dislikes">
              <div className="col-md-6 thumbsup-icon">
                  <div className="thumbsup-img "><img src="./img/thumbs-up.png" /></div>
                  {(this.state.uservote.length === 0)?<div className="likes-text">0</div>:
                  (this.state.uservote.map(rowu => (rowu["service_id"]===rown["service_id"])?
                  <div className="likes-text">{rowu["up_vote_count"]}</div>:
                  <div className="likes-text"></div>))}
              </div>
              <div className="col-md-6 thumbsdown-icon"><img src="./img/thumbs-down.png" />
                  <br/> {this.state.uservote.length===0? <div className="likes-text">0</div>:(this.state.uservote.map(rowu => (rowu["service_id"]===rown["service_id"])? rowu["down_vote_count"]:null))}
              </div>
          </div>
      </div>
    );

    return(
          <React.Fragment>
          <App searchTerm={this.state.searchterm} searchCallBack={this.onOpenSearchBar}/>
            <main role="content" className="content-area">
                <div className="container-fluid p-4  ">
                     <Carddeckers/>
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 head-txt-sec">
                        <div className="col-sm-2 col-md-2 col-lg-2">
                            <h3>Agent</h3>
                            <div className="toggle">
                                <button>
                                    <img src="./img/Arrow.png" alt="toggle" onClick={this.handleservicenamesort}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Organization</h3>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2">
                            <h3>Price</h3>
                            <div className="toggle">
                                <button className="toggle-up">
                                    <img src="./img/Arrow.png" alt="toggle" onClick={this.handlepricesort}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Tags</h3>
                        </div>
                        <div className="col-sm-1 col-md-1 col-lg-1 text-center">
                            <h3>Health</h3>
                            <div className="toggle">
                                <button className="toggle-up">
                                    <img src="./img/Arrow.png" alt="toggle" onClick={this.handlehealthsort}/>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Action</h3>
                        </div>
                        <div className="col-sm-1 col-md-1 col-lg-1">
                            <h3></h3>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 no-mobile-padding">
                        {agents}
                    </div>
                    <div className="col-xs-12 col-md-12 col-lg-12 pagination pagination-singularity text-right no-padding">
                        {arraylimit>5?
                        <MuiThemeProvider theme={theme}>
                            <Pagination limit={5} offset={this.state.offset} total={arraylimit} onClick={(e, offset)=> this.handleClick(offset)} />
                        </MuiThemeProvider>
                        :null}
                    </div>
                </div>
                <div>
                <Jobdetails ref="jobdetailsComp"
                            userAddress={this.state.userAddress}
                            chainId={this.state.chainId}
                            network={this.network}/>
                </div>
                <div>
                    <Modal open={this.state.searchBarOpen} onClose={this.onCloseSearchBar}>
                        <Slide direction="down" in={this.state.searchBarOpen} mountOnEnter unmountOnExit>
                            <div className="container popover-wrapper search-panel">
                                <div className='row'>
                                    <div className='col-sm-1 col-md-1 col-lg-1  rborder '>
                                    </div>
                                    <div className='col-sm-6 col-md-6 col-lg-6  rborder '>
                                        <div className='form-group'>
                                            <div className="search-title">
                                                <label htmlFor='search'>Search</label>
                                            </div>
                                            <div className="col-sm-12 col-md-12 col-lg-12 no-padding">
                                                <div className="col-sm-9 col-md-9 col-lg-9 no-padding">
                                                    <input id='str' className="search-box-text" name='str' type='text' placeholder='Search...' value={this.state.searchterm} onChange={this.captureSearchTerm} onKeyUp={(e)=>this.handlesearchkeyup(e)} />
                                                </div>
                                                <div className="col-sm-3 col-md-3 col-lg-3">
                                                    <input className='btn btn-primary' id='phSearchButton' type='button' value='Search' onClick={this.handlesearch} />
                                                    <input className='btn btn-primary clear-btn' id='phSearchButtonclear' type='button' value='Clear' onClick={this.handlesearchclear} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-4 col-md-4 col-lg-4 tags-panel">
                                        <div className="tags-title">Tags</div>
                                        <ul>
                                            {this.state.agents.map(rowagents => rowagents["tags"].map(rowtag =>
                                            <a href="#">
                                                <li onClick={(e)=>{this.handlesearchbytag(e,rowtag)}}>{rowtag}</li>
                                            </a>))}
                                        </ul>

                                    </div>
                                </div>
                            </div>
                        </Slide>
                    </Modal>
                </div>
            </main>
            </React.Fragment>
     );
  }
}

SampleServices.propTypes = {
  account: PropTypes.string
};
export default withRouter(SampleServices);
