import React from 'react';
import {hasOwnDefinedProperty} from '../../util'

export default class BaseService extends React.Component {

    constructor(props) {
        super(props);

        this.isComplete = false;
        this.serviceMethods = [];
        this.allServices = [];
        this.methodsForAllServices = [];
        this.parseProps(props);
    }

    componentWillReceiveProps(nextProps) {
        console.log("Updating in base class")
        if(this.isComplete !== nextProps.isComplete) {
            this.parseProps(nextProps);
        }
    }
    
    parseProps(nextProps) {
        this.isComplete = nextProps.isComplete;
        if (!this.isComplete) {
            this.parseServiceSpec(nextProps.serviceSpec);
        } else {
            if (typeof nextProps.response !== 'undefined') {
                if (typeof nextProps.response === 'string') {
                    this.state.response = nextProps.response;
                } else {
                    this.state.response = nextProps.response.value;
                }
            }
        }
    }

    parseServiceSpec(serviceSpec) {
        const packageName = Object.keys(serviceSpec.nested).find(key =>
            typeof serviceSpec.nested[key] === "object" &&
            hasOwnDefinedProperty(serviceSpec.nested[key], "nested"));

        var objects = undefined;
        var items = undefined;
        if (typeof packageName !== 'undefined') {
            items = serviceSpec.lookup(packageName);
            objects = Object.keys(items);
        } else {
            items = serviceSpec.nested;
            objects = Object.keys(serviceSpec.nested);
        }
        this.allServices.push("Select a service");
        this.methodsForAllServices = [];
        objects.map(rr => {
            if (typeof items[rr] === 'object' && items[rr] !== null && items[rr].hasOwnProperty("methods")) {
                this.allServices.push(rr);
                this.methodsForAllServices.push(rr);
                var methods = Object.keys(items[rr]["methods"]);
                if (methods.length > 1) {
                    methods.unshift("Select a method");
                }
                this.methodsForAllServices[rr] = methods;
            }
        })
    }

    handleServiceName(strService) {
        this.serviceMethods.length = 0;
        if (typeof strService !== 'undefined' && strService !== 'Select a service') {
            let data = Object.values(this.methodsForAllServices[strService]);
            if (typeof data !== 'undefined') {
                this.serviceMethods= data;
            }
        }
    }

    onKeyPressvalidator(event) {
        const keyCode = event.keyCode || event.which;
        if (!(keyCode == 8 || keyCode == 46) && (keyCode < 48 || keyCode > 57)) {
            event.preventDefault()
        } else {
            let dots = event.target.value.split('.');
            if (dots.length > 1 && keyCode == 46)
                event.preventDefault()
        }
    }
}
