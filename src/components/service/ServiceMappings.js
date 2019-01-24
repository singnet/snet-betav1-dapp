import ExampleService from './ExampleService.js';
import CNTKImageRecognition from './CNTKImageRecognition.js';
import DefaultService from './DefaultService.js';
import NamedEntityRecognitionService from "./NamedEntityRecognitionService.js";
import SentimentAnalysisService from "./SentimentAnalysisService";

export default class SampleServices {
    constructor() {
        this.serviceOrgIDToComponent = [];
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "example-service")] = ExampleService
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-image-recon")] = CNTKImageRecognition
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "named-entity-recognition")] = NamedEntityRecognitionService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "sentiment-analysis")] = SentimentAnalysisService;
    }

    generateUniqueID(orgId,serviceId) {
        return orgId + "__$%^^%$__" + serviceId;
    }

    getComponent(orgId, serviceId) {
        let component = this.serviceOrgIDToComponent[this.generateUniqueID(orgId, serviceId)];
        if(typeof component === 'undefined') {
            component = DefaultService;
        }

        return component;
    }
}
