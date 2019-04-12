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
import SuperResolution from "./SuperResolution";

import DefaultService from './DefaultService.js';
import {NETWORKS} from '../../networks';

export default class SampleServices {
    constructor() {
        this.serviceOrgIDToComponent = [];
        Object.keys(NETWORKS).map(chainId=>{
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "example-service",chainId)] = ExampleService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-image-recon",chainId)] = CNTKImageRecognition;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-next-day-trend",chainId)] = CNTKNextDayTrend;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-lstm-forecast",chainId)] = CNTKLSTMForecast;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "cntk-language-understanding",chainId)] = CNTKLanguageUnderstanding;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "i3d-video-action-recognition",chainId)] = I3DActionRecognition;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "opennmt-romance-translator",chainId)] = OpenNMTRomanceTranslator;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "s2vt-video-captioning",chainId)] = S2VTVideoCaptioning;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "yolov3-object-detection",chainId)] = YOLOv3ObjectDetection;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "zeta36-chess-alpha-zero",chainId)] = Zeta36ChessAlphaZero;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "speech-recognition",chainId)] = AutomaticSpeechRecognition;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "speech-synthesis",chainId)] = NeuralSpeechSynthesis;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "question-answering-long-seq",chainId)] = LongQuestionAsnswering;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "question-answering-short-seq",chainId)] = ShortQuestionAnswering;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "semantic-similarity-binary",chainId)] = BinarySemanticSimilarity;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "opencog-vqa",chainId)] = VisualQAOpencog;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "named-entity-recognition",chainId)] = NamedEntityRecognitionService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "sentiment-analysis",chainId)] = SentimentAnalysisService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "time-series-anomaly-discovery",chainId)] = TimeSeriesAnomalyDiscoveryService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "moses-service",chainId)] = MosesService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "semantic-segmentation",chainId)] = SemanticSegmentationService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-detect",chainId)] = FaceDetectService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-landmarks",chainId)] = FaceLandmarksService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-align",chainId)] = FaceAlignService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "face-identity",chainId)] = FaceIdentityService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "emotion-recognition-service",chainId)] = EmotionRecognitionService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "holistic-edge-detection-service",chainId)] = HolisticEdgeDetectionService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "image-retrieval-service",chainId)] = ImageRetrievalService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "gene-annotation-service",chainId)] = GeneAnnotationService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "translation",chainId)] = TranslationService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "news-summary",chainId)] = NewsSummaryService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "style-transfer",chainId)] = StyleTransfer;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "language-detection",chainId)] = LanguageDetectionService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "coreference-resolution-service",chainId)] = CoreferenceResolutionService;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "named-entity-disambiguation",chainId)] = NamedEntityDisambiguation;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "network-analytics-robustness",chainId)] = NetworkAnalysisRobustness;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "network-analytics-bipartite",chainId)] = NetworkAnalysisBipartite;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "topic-analysis",chainId)] = TopicAnalysis;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "places365-scene-recognition",chainId)] = Places365SceneRecognition;
            this.serviceOrgIDToComponent[this.generateUniqueID("snet", "super-resolution",chainId)] = SuperResolution;
        })
       
    }

    generateUniqueID(orgId,serviceId, chainId) {
        return orgId + "__$%^^%$__" + serviceId +  "__$%^^%$__" + chainId;
    }

    getComponent(orgId, serviceId, chainId) {
        let component = this.serviceOrgIDToComponent[this.generateUniqueID(orgId, serviceId, chainId)];
        if(typeof component === 'undefined') {
            component = DefaultService;
        }


        return component;
    }
}
