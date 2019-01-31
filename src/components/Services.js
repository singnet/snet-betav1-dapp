import React from 'react'
import PropTypes from 'prop-types'
import { MuiThemeProvider } from "@material-ui/core/styles"
import Pagination from "material-ui-flat-pagination"
import Typography from '@material-ui/core/Typography'
import Modal from '@material-ui/core/Modal'
import Slide from '@material-ui/core/Slide'
import { withRouter } from 'react-router-dom'
import { AGI, getMarketplaceURL, isSupportedNetwork } from '../util'
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
      offset:0,
      searchBarOpen:false,
      searchTerm:'',
      besttagresult:[],
      togglePrice: false,
      toggleServiceName:false,
      togglehealth:false,
      userAddress: undefined,
      chainId: undefined
    };

    this.network = new BlockchainHelper();
    this.searchResults = [];
    this.account = undefined;
    this.onOpenJobDetailsSlider = this.onOpenJobDetailsSlider.bind(this)
    this.onCloseJobDetailsSlider = this.onCloseJobDetailsSlider.bind(this)
    this.onOpenSearchBar = this.onOpenSearchBar.bind(this)
    this.onCloseSearchBar = this.onCloseSearchBar.bind(this)
    this.handleSearch = this.handleSearch.bind(this)
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
    this.setState({searchTerm: ''})
    this.setState({besttagresult: []})
  }

  handlesearchkeyup(e) {
    e.preventDefault();
    this.handleSearch();
  }

  handlehealthsort() {
    var healthSort = this.state.agents
    if (this.state.togglehealth === false) {
      healthSort.sort((a, b) => (a === b)? 0 : a ? -1 : 1)
      this.setState({
        togglehealth: true
      })
    } else if (this.state.togglehealth === true) {
      healthSort.sort((b, a) => (a === b)? 0 : a ? -1 : 1)
      this.setState({
        togglehealth: false
      })
    }
    this.setState({agents: healthSort});
  }

  handlepricesort() {
    var pricesort = this.state.agents
    if (this.state.togglePrice === false) {

      pricesort.sort((a, b) => b.price_in_cogs - a.price_in_cogs)
      this.setState({togglePrice: true})
    } else if (this.state.togglePrice === true) {

      pricesort.sort((a, b) => a.price_in_cogs - b.price_in_cogs)
      this.setState({togglePrice: false})
    }
    this.setState({agents: pricesort})
  }
  
  handleservicenamesort() {
    var servicenamesort = this.state.agents
    if (this.state.toggleServiceName === false) {
      servicenamesort.sort(function (a, b) {
        return a.display_name.localeCompare(b.display_name);
      });
      this.setState({toggleServiceName: true})
    } else if (this.state.toggleServiceName === true) {
      servicenamesort.sort(function (a, b) {
        return b.display_name.localeCompare(a.display_name);
      });
      this.setState({toggleServiceName: false})
    }
    this.setState({agents: servicenamesort})
  }

  handleWindowLoad() {
    this.network.initialize().then(isInitialized => {
      if (isInitialized) {
        console.log("Initializing the watchNetwork timer")
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
      console.log("Clearing the watchNetwork timer")
      clearInterval(this.watchNetworkTimer);
    }
  }

  componentDidMount() {
    console.log("componentDidMount")
    window.addEventListener('load', () => this.handleWindowLoad());
    this.handleWindowLoad();
  }

  loadDetails(chainId) {
    if(!isSupportedNetwork(chainId)) {
      this.setState({agents:[]})
      return;
    }
    
    const marketPlaceURL = getMarketplaceURL(chainId);
    const url = marketPlaceURL + "service"
    const urlfetchservicestatus = marketPlaceURL + 'group-info'
    const urlfetchvote = marketPlaceURL + 'fetch-vote?user_address=' + (typeof web3 === 'undefined' ? "" : web3.eth.defaultAccount)
    console.log("Fetching data for " + chainId)
    Promise.all([Requests.get(url),Requests.get(urlfetchservicestatus),Requests.get(urlfetchvote)])
    .then((values) =>
    {
      if(typeof(values[0]) !== 'undefined')
      {
        if(Array.isArray(values[0].data)) {
          values[0].data.map(agent => {
            agent["price_in_agi"] = AGI.inAGI(agent["price_in_cogs"])
            agent["is_available"] = true
            agent["up_vote_count"] = 0
            agent["down_vote_count"] = 0
            agent["up_vote"] = false
            agent["down_vote"] = false
          })

          if(Array.isArray(values[2].data)) {
            values[0].data.map(agent => 
              values[2].data.map(voteDetail => {
                if(voteDetail["service_id"] === agent["service_id"] && voteDetail["org_id"] === agent["org_id"]) {
                  agent["up_vote_count"] = voteDetail["up_vote_count"] 
                  agent["down_vote_count"] = voteDetail["down_vote_count"]
                  agent["up_vote"] = voteDetail["up_vote"]
                  agent["down_vote"] = voteDetail["down_vote"]
                }
              })); 
          }

          if(Array.isArray(values[1].data)) {
            values[0].data.map(agent => 
              values[1].data.map(healthDetail => {
                if(healthDetail["service_id"] === agent["service_id"] && healthDetail["org_id"] === agent["org_id"]) {
                  agent["is_available"] = (healthDetail["is_available"] === 1)
                }
            }))            
          }      
          this.setState({agents: values[0].data})
        }   
      }
    }
    ).catch((err)=> console.log(err))

    if (typeof web3 === 'undefined') {
      return;
    }

    this.setState({userAddress: web3.eth.defaultAccount});
  }

  handleClick(offset) {
    this.setState({ offset });
  }

  onOpenJobDetailsSlider(data) {
    this.refs.jobdetailsComp.onOpenJobDetails(data);
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

  handleSearch() {
    this.setState({besttagresult: []});

    let searchedagents = this.state.agents.map(row => 
        (row["display_name"].toUpperCase().indexOf(this.state.searchTerm.toUpperCase()) !== -1 
        || row["service_id"].toUpperCase().indexOf(this.state.searchTerm.toUpperCase()) !== -1) ? row : null)
    
    let bestsearchresults = [...(searchedagents.filter(row => row !== null).map(row1 => row1))]
    this.searchResults = bestsearchresults;
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
    this.setState({searchTerm:e.target.value})
  }

  render() {
    const {open} = this.state;
    const arraylimit = this.state.agents.length

    let agentsample = this.state.agents
    if (this.state.searchTerm !== '') {
      agentsample = this.searchResults
    }
    if (this.state.besttagresult.length > 0) {
      agentsample = this.state.besttagresult
    }

    const agents = agentsample.slice(this.state.offset, this.state.offset + 15).map((rown,index) =>
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
              {(rown.hasOwnProperty('tags'))? rown["tags"].map((rowtag,rindex) =>
              <button key={rindex} className='btn btn-secondary mr-15'>{rowtag}</button>):null}
          </div>
          <div className="col-sm-12 col-md-1 col-lg-1 agent-boxes-label">Status</div>
          <div className="col-sm-12 col-md-1 col-lg-1 health-align">
              {(rown["is_available"])? 
              <span className="agent-health green"></span>: 
              <span className="agent-health red"></span>}
          </div>
          <div className="col-sm-12 col-md-2 col-lg-2 agent-boxes-label">Action</div>
          <div className="col-sm-12 col-md-2 col-lg-2 action-align">
              <button className="btn btn-primary" onClick={(e)=>this.onOpenJobDetailsSlider(rown)} id={rown["service_id"]}>Details</button>
          </div>
          <div className="col-sm-12 col-md-1 col-lg-1 likes-dislikes">
              <div className="col-md-6 thumbsup-icon">
                  <div className="thumbsup-img "><span className="icon-like"></span></div>
                  <div className="likes-text">{rown["up_vote_count"]}</div>
              </div>
              <div className="col-md-6 thumbsdown-icon">
              <div className="thumbsdown-img">
                <span className="icon-dislike"></span>
              </div> 
              <div className="dislikes-text">{rown["down_vote_count"]}</div>
              </div>
          </div>
      </div>
    );

    return(
          <React.Fragment>
          <App searchTerm={this.state.searchTerm} searchCallBack={this.onOpenSearchBar} chainId={this.state.chainId}/>
            <main role="content" className="content-area">
                <div className="container-fluid p-4  ">
                     <Carddeckers/>
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 head-txt-sec">
                        <div className="col-sm-2 col-md-2 col-lg-2">
                            <div className="toggle">
                                <button onClick={this.handleservicenamesort}>
                                    <h3>Agent</h3>
                                    <i className="fa fa-sort sort-icon" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Organization</h3>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2">
                            <div className="toggle">
                                <button onClick={this.handlepricesort}>
                                    <h3>Price</h3>
                                    <i className="fa fa-sort sort-icon" aria-hidden="true"></i>
                                </button>
                            </div>
                        </div>
                        <div className="col-sm-2 col-md-2 col-lg-2 text-center">
                            <h3>Tags</h3>
                        </div>
                        <div className="col-sm-1 col-md-1 col-lg-1 text-center">
                            <div className="toggle">
                                <button onClick={this.handlehealthsort}>
                                    <h3>Status</h3>
                                    <i className="fa fa-sort sort-icon" aria-hidden="true"></i>
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
                            <Pagination limit={15} offset={this.state.offset} total={arraylimit} onClick={(e, offset)=> this.handleClick(offset)} />
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
                                                    <input autoFocus id='str' className="search-box-text" name='str' type='text' placeholder='Search...' value={this.state.searchTerm} onChange={this.captureSearchTerm} onKeyUp={(e)=>this.handlesearchkeyup(e)} />
                                                </div>
                                                <div className="col-sm-3 col-md-3 col-lg-3">
                                                    <input className='btn btn-primary clear-btn' id='phSearchButtonclear' type='button' defaultValue='Clear' onClick={this.handlesearchclear} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-4 col-md-4 col-lg-4 tags-panel">
                                        <div className="tags-title">Tags</div>
                                        <ul>
                                            {this.state.agents.map((agents) => agents["tags"].map((tag,tagIndex) =>
                                            <a key={tagIndex} href="#">
                                                <li key={tagIndex} onClick={(e)=>{this.handlesearchbytag(e,tag)}}>{tag}</li>
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
