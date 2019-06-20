import React from 'react'
import PropTypes from 'prop-types'
import { MuiThemeProvider } from "@material-ui/core/styles"
import Pagination from "material-ui-flat-pagination"
import Typography from '@material-ui/core/Typography'
import { withRouter } from 'react-router-dom'
import { AGI, getMarketplaceURL, isSupportedNetwork } from '../util'
import { Requests } from '../requests'
import BlockchainHelper from "./BlockchainHelper.js"
import {Jobdetails} from './JobDetails.js';
import {theme} from './ReactStyles.js';
import Header from "./Header.js";
import Footer from "./Footer.js";
import PricingStrategy from "./Pricing.js"

class SampleServices extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      agents : [],
      offset:0,
      searchTerm:'',
      searchResults:[],
      togglePrice: false,
      toggleServiceName:false,
      togglehealth:false,
      userAddress: undefined,
      chainId: undefined
    };

    this.network = new BlockchainHelper();
    this.account = undefined;
    this.onOpenJobDetailsSlider = this.onOpenJobDetailsSlider.bind(this)
    this.onCloseJobDetailsSlider = this.onCloseJobDetailsSlider.bind(this)
    this.captureSearchTerm = this.captureSearchTerm.bind(this)
    this.handlepricesort = this.handlepricesort.bind(this)
    this.handleservicenamesort = this.handleservicenamesort.bind(this)
    this.handlehealthsort = this.handlehealthsort.bind(this)
    this.handleSearchKeyUp = this.handleSearchKeyUp.bind(this)
    this.watchWalletTimer = undefined;
    this.watchNetworkTimer = undefined;
    this.loadDetails = this.loadDetails.bind(this);
  }

    watchWallet() {
        this.network.getAccount((account) => {
            if (account !== this.state.account) {
                this.setState({account: account});
                this.onCloseJobDetailsSlider()
            }
        });
    }

  watchNetwork() {
    this.network.getChainID((chainId) => {
      if (chainId !== this.state.chainId) {
          this.onCloseJobDetailsSlider()
        this.setState({ chainId: chainId });
        this.loadDetails(chainId);
      }
    });
  }

  inArray(haystack, needle) {
    for (var i = 0; i < haystack.length; i++) {
      if (haystack[i].indexOf(needle) !== -1) {
        return true;
      }
    }
    return false;
  }

  handleSearchKeyUp(e) {
    e.preventDefault();
    if(this.state.searchTerm === '') {
      this.setState({searchResults:[]});
      return;
    }

    let ucSearchTerm = this.state.searchTerm.toUpperCase();
    this.state.agents.map(row =>
      (this.inArray(row["tags_uc"], ucSearchTerm)) ?
      console.log("Matched " + row["tags_uc"]) : console.log("Not Matched " + row["tags_uc"]))

    let searchedagents = this.state.agents.map(row =>
        (row["display_name_uc"].indexOf(ucSearchTerm) !== -1
        || (this.inArray(row["tags_uc"], ucSearchTerm)) ? row : null))

    let bestsearchresults = [...(searchedagents.filter(row => row !== null).map(row1 => row1))]
    console.log("Setting search results to " + bestsearchresults.length)
    this.setState({searchResults:bestsearchresults});
  }

  handlehealthsort() {
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
    if (this.state.togglePrice === false) {

      pricesort.sort((a, b) => b.pricing_strategy.getMaxPriceInCogs() - a.pricing_strategy.getMaxPriceInCogs())
      this.setState({togglePrice: true})
    } else if (this.state.togglePrice === true) {

      pricesort.sort((a, b) => a.pricing_strategy.getMaxPriceInCogs() - b.pricing_strategy.getMaxPriceInCogs())
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
        this.watchNetwork();
        if (!this.watchNetworkTimer) {
          this.watchNetworkTimer = setInterval(() => this.watchNetwork(), 500);
        }
        if (!this.watchWalletTimer) {
              this.watchWalletTimer = setInterval(() => this.watchWallet(), 500);
        }
      }
      else {
        this.setState({chainId: this.network.getDefaultNetwork()});
        this.loadDetails(this.network.getDefaultNetwork());
      }
    }).catch(err => {
      console.error(err);
    })
  }

  componentWillUnmount() {
      if (this.watchWalletTimer) {
          clearInterval(this.watchWalletTimer);
      }

      if (this.watchNetworkTimer) {
          clearInterval(this.watchNetworkTimer);
      }
  }

  componentDidMount() {
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
    const urlfetchvote = marketPlaceURL + 'feedback?user_address=' + (typeof web3 === 'undefined' ? "0x" : web3.eth.defaultAccount)
    console.log("Fetching data for " + chainId)
    Promise.all([Requests.get(url),Requests.get(urlfetchservicestatus),Requests.get(urlfetchvote)])
    .then((values) =>
    {
      if(typeof(values[0]) !== 'undefined')
      {
        if(Array.isArray(values[0].data)) {
          values[0].data.map(agent => {
            const pricing = agent["pricing"];
            let pricingJSON = (typeof pricing === 'undefined' || pricing === null) ? JSON.stringify(agent) : pricing;
            agent["pricing_strategy"] = new PricingStrategy(pricingJSON);
            //console.log(agent["pricing_strategy"])
            //agent["price_in_agi"] = AGI.inAGI(agent["price_in_cogs"]);
            agent["is_available"] = 0;
            agent["up_vote_count"] = 0;
            agent["down_vote_count"] = 0;
            agent["up_vote"] = false;
            agent["down_vote"] = false;
            agent["display_name_uc"] = agent["display_name"].toUpperCase();
            agent["tags_uc"] = []
            agent["tags"].map(tag => agent["tags_uc"].push(tag.toUpperCase()));
          })

          if(Array.isArray(values[2].data)) {
            values[0].data.map(agent => 
              values[2].data.map(voteDetail => {
                if(voteDetail["service_id"] === agent["service_id"] && voteDetail["org_id"] === agent["org_id"]) {
                  agent["up_vote_count"] = voteDetail["up_vote_count"] 
                  agent["down_vote_count"] = voteDetail["down_vote_count"]
                  agent["up_vote"] = voteDetail["up_vote"]
                  agent["down_vote"] = voteDetail["down_vote"]
                  agent.comment = voteDetail.comment == null?'':voteDetail.comment
                }
              })); 
          }

          if(Array.isArray(values[1].data)) {
            values[0].data.map(agent => 
              values[1].data.map(healthDetail => {
                if(healthDetail["service_id"] === agent["service_id"] && healthDetail["org_id"] === agent["org_id"]) {
                  agent["is_available"] = healthDetail["is_available"]
                }
            }))            
          }      
          this.setState({agents: values[0].data})
        }   
      }
      //Do this the first time the page gets loaded.
        this.setState({
            togglehealth: false
        })
        this.handlehealthsort() }
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

  captureSearchTerm(e) {
    this.setState({searchTerm:e.target.value})
  }

  render() {
    const {open} = this.state;
    let arraylimit = this.state.agents.length

    let agentsample = this.state.agents
    if (this.state.searchTerm != '' || this.state.searchResults.length > 0) {
      agentsample = this.state.searchResults
      arraylimit = this.state.searchResults.length
    }

    const agents = agentsample.slice(this.state.offset, this.state.offset + 15).map((rown,index) =>
      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 media" key={index} id={rown[ "service_id"]} name={rown[ "display_name"].toUpperCase()}>
          <div className="col-sm-2 col-md-2 col-lg-2 agent-boxes-label">Agent Name</div>
          <div className="col-sm-2 col-md-2 col-lg-2 agent-name-align" id={rown[ "service_id"]} name={rown[ "display_name"]}>
              <label className="m-0">
                  <div className="m-0">
                      {rown["display_name"]}</div>
              </label>
          </div>
          <div className="col-sm-2 col-md-2 col-lg-2 agent-boxes-label">Organization</div>
          <div className="col-sm-2 col-md-2 col-lg-2 org-name-align">
              <div className="m-0" >{rown["org_id"]}</div>
          </div>
          <div className="col-sm-2 col-md-2 col-lg-2 agent-boxes-label">Price</div>
          <div className="col-sm-2 col-md-2 col-lg-2 price-align">
              <label className="m-0">
                  <div className="m-0" >{AGI.inAGI(rown.pricing_strategy.getMaxPriceInCogs())} AGI</div>
              </label>
          </div>
          <div className="col-sm-2 col-md-2 col-lg-2 agent-boxes-label">Tag</div>
          <div className="col-sm-2 col-md-2 col-lg-2 tag-align">
              {(rown.hasOwnProperty('tags'))? rown["tags"].map((rowtag,rindex) =>
              <label key={rindex} className='btn-tag mr-15'>{rowtag}</label>):null}
          </div>
          <div className="col-sm-1 col-md-1 col-lg-1 agent-boxes-label">Status</div>
          <div className="col-sm-1 col-md-1 col-lg-1 health-align">

              {(rown["is_available"] ===1)?
                  <span className="agent-health green"></span>:
                  <span className="agent-health red"></span>}
          </div>
          <div className="col-sm-2 col-md-2 col-lg-2 agent-boxes-label">Action</div>
          <div className="col-sm-2 col-md-2 col-lg-2 action-align">
              <button className="btn btn-primary" onClick={(e)=>this.onOpenJobDetailsSlider(rown)} id={rown["service_id"]}>Details</button>
          </div>
          <div className="col-sm-1 col-md-1 col-lg-1 likes-dislikes">
              <div className="col-md-6 thumbsup-icon">
                  <div className="thumbsup-img ">
                  <span className={rown["up_vote_count"] > 0 ? "icon-count-like-enabled" : "icon-count-like"}></span></div>
                  <div className="likes-text">{rown["up_vote_count"]}</div>
              </div>
              <div className="col-md-6 thumbsdown-icon">
              <div className="thumbsdown-img">
                <span className={rown["down_vote_count"] > 0 ? "icon-count-dislike-enabled" : "icon-count-dislike"}></span>
              </div> 
              <div className="dislikes-text">{rown["down_vote_count"]}</div>
              </div>
          </div>
      </div>
    );

    return(
          <React.Fragment>
          <Header chainId={this.state.chainId}/>
            <main role="content" className="content-area">
              <div className="blue-boxes-head">
                  <h4 className="align-self-center text-uppercase "></h4>
              </div>
                <div className="container-fluid p-4  ">
                    <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6 service-agents-container">
                        <span className="service-agents">Service Agents</span>
                    </div>
                    <div className="col-xs-6 col-sm-6 col-md-6 col-lg-6 search-bar">
                    <input className="search" placeholder={this.state.searchTerm === '' ? 'Search by Agent or Tags' : this.state.searchTerm} name="srch-term" id="srch-term" type="label" onChange={this.captureSearchTerm} onKeyUp={(e)=>this.handleSearchKeyUp(e)} />
                    <button className="btn-search"><i className="fa fa-search search-icon" aria-hidden="true"></i></button> 
                    </div>
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
                        {arraylimit>15?
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
                            network={this.network}
                            reloadDetails={this.loadDetails}/>
                </div>
            </main>
            <Footer/>
            </React.Fragment>
     );
  }
}

SampleServices.propTypes = {
  account: PropTypes.string
};
export default withRouter(SampleServices);
