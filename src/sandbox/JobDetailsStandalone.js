import { hasOwnDefinedProperty } from '../util'
import 'react-perfect-scrollbar/dist/css/styles.css';
import {Jobdetails} from '../components/JobDetails.js';
import React, { Fragment } from 'react';

export  class JobdetailsStandalone extends Jobdetails {
    constructor(props) {
      super(props)
      this.serviceSpecJSON = ''
      this.endpoint = ''
    }

    onOpenJobDetails(data) {
      this.serviceSpecJSON = data["serviceSpecJSON"]
      this.endpoint = data['endpoint']

      super.setServiceSpec(data["serviceSpecJSON"])
      super.onOpenJobDetails(data);
      super.seedDefaultValues(true, 1);
    }

    startjob() {
      super.seedDefaultValues(true, 1);
    }

    handleJobInvocation(serviceName, methodName, requestObject) {
      const serviceObj = this.serviceSpecJSON.lookup(serviceName)
      const packageName = Object.keys(this.serviceSpecJSON.nested).find(key =>
      typeof this.serviceSpecJSON.nested[key] === "object" &&
        hasOwnDefinedProperty(this.serviceSpecJSON.nested[key], "nested")
      )
      super.makeGRPCCall(serviceObj, this.endpoint, packageName, serviceName, methodName, {}, requestObject)
    }

    render() {
      return(
      <Fragment>
          {super.render()}
      </Fragment>
      )
    }
}