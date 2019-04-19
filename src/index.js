import React from 'react';
import ReactDOM from 'react-dom';
import Header from "./components/Header.js";
import {BrowserRouter,Route,Switch} from 'react-router-dom';
import {Account} from "./components/Account.js";
import SampleServices from './components/Services';
import Landingpage from "./components/Landing.js";
import connectwallet from "./components/ConnectWallet.js";
import GetStarted from "./components/GetStarted.js";
import Footer from './components/Footer.js';
import GDPR from './js/gdpr';

require('./css/style.css');
require('./css/background.css');
require('./css/profile.css');

GDPR();

ReactDOM.render(
  <BrowserRouter>
  <div>
   <Switch>
   <Route path="/" component={Landingpage} exact />
    <Route path="/Header" component ={Header}/>
    <Route path="/Footer" component = {Footer}/>
    <Route path="/sampleservices" component={SampleServices}></Route>
    <Route path="/Account" component={Account}></Route>
    <Route path="/connectwallet" component={connectwallet}/>
    <Route path="/GetStarted" component={GetStarted}/>
  
  </Switch>
  </div>
  </BrowserRouter>
 ,
  document.getElementById('react-root')
);



 
