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
import AutomaticSpeechRecognition from './AutomaticSpeechRecognition.js';
import NeuralSpeechSynthesis from './NeuralSpeechSynthesis.js';
import LongQuestionAsnswering from './LongQuestionAsnswering.js';
import ShortQuestionAnswering from './ShortQuestionAnswering.js';
import BinarySemanticSimilarity from './BinarySemanticSimilarity.js';
import NamedEntityRecognitionService from "./NamedEntityRecognitionService.js";
import SentimentAnalysisService from "./SentimentAnalysisService";
import TimeSeriesAnomalyDiscoveryService from "./TimeSeriesAnomalyDiscoveryService.js"
import VisualQAOpencog from './VisualQAOpencog.js';
import MosesService from "./MosesService";
import SemanticSegmentationService from "./SemanticSegmentation.js";
import FaceDetectService from "./FaceDetectService"
import FaceLandmarksService from "./FaceLandmarksService"
import FaceAlignService from "./FaceAlignService"
import FaceIdentityService from "./FaceIdentityService"
import EmotionRecognitionService from "./EmotionRecognitionService";
import HolisticEdgeDetectionService from "./HolisticEdgeDetectionService";
import ImageRetrievalService from "./ImageRetrievalService";
import GeneAnnotationService from "./GeneAnnotationService";
import TranslationService from "./TranslationService";
import NewsSummaryService from "./NewsSummaryService";
import StyleTransfer from "./StyleTransfer";
import LanguageDetectionService from './LanguageDetectionService';
import CoreferenceResolutionService from './CoreferenceResolutionService';
import NamedEntityDisambiguation from './NamedEntityDisambiguation';
import NetworkAnalysisBipartite from "./NetworkAnalysisBipartite";
import NetworkAnalysisRobustness from "./NetworkAnalysisRobustness";
import TopicAnalysis from "./TopicAnalysisService";
import Places365SceneRecognition from "./Places365SceneRecognition";

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
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "speech-recognition")] = AutomaticSpeechRecognition;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "speech-synthesis")] = NeuralSpeechSynthesis;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "question-answering-long-seq")] = LongQuestionAsnswering;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "question-answering-short-seq")] = ShortQuestionAnswering;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "semantic-similarity-binary")] = BinarySemanticSimilarity;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "opencog-vqa")] = VisualQAOpencog;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "named-entity-recognition")] = NamedEntityRecognitionService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "sentiment-analysis")] = SentimentAnalysisService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "time-series-anomaly-discovery")] = TimeSeriesAnomalyDiscoveryService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "moses-service")] = MosesService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "semantic-segmentation")] = SemanticSegmentationService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-detect")] = FaceDetectService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-landmarks")] = FaceLandmarksService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-align")] = FaceAlignService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-identity")] = FaceIdentityService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "emotion-recognition-service")] = EmotionRecognitionService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "holistic-edge-detection-service")] = HolisticEdgeDetectionService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "image-retrieval-service")] = ImageRetrievalService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "gene-annotation-service")] = GeneAnnotationService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "translation")] = TranslationService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "news-summary")] = NewsSummaryService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "style-transfer")] = StyleTransfer;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "language-detection-service")] = LanguageDetectionService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "coreference-resolution-service")] = CoreferenceResolutionService;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "named-entity-disambiguation")] = NamedEntityDisambiguation;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "network-analytics-robustness")] = NetworkAnalysisRobustness;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "network-analytics-bipartite")] = NetworkAnalysisBipartite;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "topic-analysis")] = TopicAnalysis;
        this.serviceOrgIDToComponent[this.generateUniqueID("snet", "places365-scene-recognition")] = Places365SceneRecognition;
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
