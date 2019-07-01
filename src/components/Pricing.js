import {AGI} from '../util'

export default class PricingStrategy {
  constructor(pricingJSON) {
    let pricingData = JSON.parse(pricingJSON);
    this.priceModel = pricingData.price_model;
    if(this.priceModel === 'fixed_price') {
      this.pricingModel = new FixedPricing(pricingData);
    } else if(this.priceModel === 'fixed_price_per_method') {
      this.pricingModel = new MethodPricing(pricingData);
    } else {
      console.log("Unsupported pricing model - " + pricingJSON);
    }
  }

  getPriceModel() {
    return this.priceModel;
  }

  getPriceInCogs(serviceName, methodName) {
    return this.pricingModel.getPriceInCogs(serviceName, methodName);
  }

  getPriceInAGI(serviceName, methodName) {
    return this.pricingModel.getPriceInAGI(serviceName, methodName);
  }

  getMaxPriceInCogs() {
    return this.pricingModel.getMaxPriceInCogs();
  }
}

class FixedPricing {
  constructor(pricingData) {
    this.priceInCogs = pricingData.price_in_cogs;
    this.priceInAGI = AGI.inAGI(pricingData.price_in_cogs);
  }

  getPriceInCogs(serviceName, methodName) {
    return this.priceInCogs;
  }

  getPriceInAGI(serviceName, methodName) {
    return this.priceInAGI;
  }

  getMaxPriceInCogs() {
    return this.priceInCogs;
  }  
}

class MethodPricing {
  constructor(pricingData) {
    this.maxPriceInCogs = 0;
    this.pricing = {};

    pricingData.details.map((servicePrice, index) => {
      console.log("Method pricing " + servicePrice.service_name)
      this.pricing[servicePrice.service_name] = {};
      servicePrice.method_pricing.map((methodPrice) => {
        if(methodPrice.price_in_cogs > this.maxPriceInCogs) {
          this.maxPriceInCogs = methodPrice.price_in_cogs;
        }
        this.pricing[servicePrice.service_name][methodPrice.method_name] = methodPrice.price_in_cogs;
      });
    });
  }

  getPriceInCogs(serviceName, methodName) {
    let methodPricing = this.pricing[serviceName];
    return methodPricing[methodName];
  }

  getPriceInAGI(serviceName, methodName) {
    let priceInCogs = this.getPriceInCogs(serviceName, methodName);
    return AGI.inAGI(priceInCogs);
  }

  getMaxPriceInCogs() {
    return this.maxPriceInCogs;
  }
}