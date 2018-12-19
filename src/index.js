import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App.js";
import {BrowserRouter,Route,Switch} from 'react-router-dom';
import {Profile} from "./components/Profile.js";
import SampleServices from './components/Services';
import Landingpage from "./components/Landing.js";
import connectwallet from "./components/ConnectWallet.js";
ReactDOM.render(
  <BrowserRouter>
  <div>
   <Switch>
  <Route path="/" component={Landingpage} exact />
    <Route path="/App" component ={App}>
    <Route path="/Profile" component={Profile}></Route>
  </Route>
    <Route path="/sampleservices" component={SampleServices}></Route>
    <Route path="/Profile" component={Profile}></Route>
    <Route path="/connectwallet" component={connectwallet}/>
  
  </Switch>
  </div>
  </BrowserRouter>
 ,
  document.getElementById('react-root')
);



 
