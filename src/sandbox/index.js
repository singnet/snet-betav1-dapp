import React from 'react';
import ReactDOM from 'react-dom';
import Standalone from "./Standalone";
import {BrowserRouter,Route,Switch} from 'react-router-dom';

require('../css/style.css');
require('../css/background.css');
require('../css/profile.css');

ReactDOM.render(
  <BrowserRouter>
  <div>
   <Switch>
   <Route path="/" component={Standalone} exact />
  </Switch>
  </div>
  </BrowserRouter>
 ,
  document.getElementById('react-root')
);



 
