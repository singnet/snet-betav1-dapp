import ExampleService from './ExampleService.js';

import CNTKImageRecognition from './CNTKImageRecognition.js';
import CNTKNextDayTrend from './CNTKNextDayTrend.js';
import CNTKLSTMForecast from './CNTKLSTMForecast.js';
import CNTKLanguageUnderstanding from './CNTKLanguageUnderstanding.js';
import I3DActionRecognition from './I3DActionRecognition.js';
import OpenNMTRomanceTranslator from './OpenNMTRomanceTranslator.js';
import S2VTVideoCaptioning from './S2VTVideoCaptioning.js';
import YOLOv3ObjectDetection from './YOLOv3ObjectDetection.js';
import Zeta36ChessAlphaZero from './Zeta36ChessAlphaZero.js';
import NamedEntityRecognitionService from "./NamedEntityRecognitionService.js";
import SentimentAnalysisService from "./SentimentAnalysisService";
import TimeSeriesAnomalyDiscoveryService from "./TimeSeriesAnomalyDiscoveryService.js"
import MosesService from "./MosesService";

import DefaultService from './DefaultService.js';

export default class SampleServices {
    constructor() {
        this.serviceOrgIDToComponent = [];
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "example-service")] = ExampleService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-image-recon")] = CNTKImageRecognition;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-next-day-trend")] = CNTKNextDayTrend;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-lstm-forecast")] = CNTKLSTMForecast;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-language-understanding")] = CNTKLanguageUnderstanding;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "i3d-video-action-recognition")] = I3DActionRecognition;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "opennmt-romance-translator")] = OpenNMTRomanceTranslator;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "s2vt-video-captioning")] = S2VTVideoCaptioning;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "yolov3-object-detection")] = YOLOv3ObjectDetection;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "zeta36-chess-alpha-zero")] = Zeta36ChessAlphaZero;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "named-entity-recognition")] = NamedEntityRecognitionService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "sentiment-analysis")] = SentimentAnalysisService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "time-series-anomaly-discovery")] = TimeSeriesAnomalyDiscoveryService;
    this.serviceOrgIDToComponent[
      this.generateUniqueID("snet", "moses-service")
    ] = MosesService;
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
