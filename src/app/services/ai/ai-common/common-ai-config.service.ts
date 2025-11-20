import { Injectable } from '@angular/core';
import { LLMModel } from '@interfaces/index';
import { env } from '@huggingface/transformers';

env.allowLocalModels = false; // ✅ disable local files since we're using online models

@Injectable({
  providedIn: 'root',
})
export class LLMConfigService {
  private readonly models: LLMModel[] = [
    // MiniLM Models for text understanding and command parsing
    {
      id: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
      name: 'MiniLM-L12-v2 Multilingual',
      type: 'textClassifier',
      size: 33,
      description: 'Multilingual sentence embeddings for command parsing',
      compatibility: 'universal',
      provider: 'sentence-transformers',
      fallbackPriority: 1,
    },
    {
      id: 'Xenova/all-MiniLM-L6-v2',
      name: 'All-MiniLM-L6-v2',
      type: 'textClassifier',
      size: 23,
      description: 'English sentence embeddings (smaller, faster)',
      compatibility: 'universal',
      provider: 'Xenova',
      fallbackPriority: 2,
    },

    // Whisper Models for STT audio transcription
    {
      id: 'Xenova/whisper-tiny',
      name: 'Whisper Tiny',
      type: 'sttTranscriber',
      size: 39,
      description: 'Fastest Whisper model, good accuracy for Chrome',
      compatibility: 'chrome-compatible',
      provider: 'Xenova',
      recommendedBrowsers: ['Chrome', 'Edge', 'Safari', 'Firefox'],
      fallbackPriority: 1,
    },
    {
      id: 'Xenova/whisper-base',
      name: 'Whisper Base',
      type: 'sttTranscriber',
      size: 74,
      description: 'Balanced speed and accuracy',
      compatibility: 'universal',
      provider: 'Xenova',
      fallbackPriority: 2,
    },
    {
      id: 'Xenova/whisper-small',
      name: 'Whisper Small',
      type: 'sttTranscriber',
      size: 244,
      description: 'High accuracy, best for Safari',
      compatibility: 'safari-compatible',
      provider: 'Xenova',
      fallbackPriority: 3,
    },
    {
      id: 'onnx-community/whisper-small',
      name: 'Whisper Small (Legacy)',
      type: 'sttTranscriber',
      size: 586,
      description: 'Original ONNX model, may have compatibility issues',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 4,
    },

    // DETR Models for object detection (known working models)
    {
      id: 'Xenova/detr-resnet-50',
      name: 'DETR ResNet-50',
      type: 'imageObjectDetector',
      size: 159,
      description: 'DETR object detection model with ResNet-50 backbone',
      compatibility: 'universal',
      provider: 'Xenova',
      fallbackPriority: 1,
    },

    // YOLO Models for object detection (faster, more modern)
    {
      id: 'onnx-community/yolov11s',
      name: 'YOLOv11 Small',
      type: 'imageObjectDetector',
      size: 19,
      description: 'Ultralytics YOLOv11 small model - good balance of speed and accuracy',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 2,
    },
    {
      id: 'onnx-community/yolov8n',
      name: 'YOLOv8 Nano',
      type: 'imageObjectDetector',
      size: 6,
      description: 'Ultralytics YOLOv8 nano model - very fast detection',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 3,
    },
    {
      id: 'onnx-community/yolov10n',
      name: 'YOLOv10 Nano',
      type: 'imageObjectDetector',
      size: 7,
      description: 'Ultralytics YOLOv10 nano model - efficient NMS-free detection',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 4,
    },
    {
      id: 'onnx-community/yolov11n',
      name: 'YOLOv11 Nano',
      type: 'imageObjectDetector',
      size: 6,
      description: 'Ultralytics YOLOv11 nano model - fastest and lightest (may have access issues)',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 5,
    },

    // Models for digit recognition (classification)
    {
      id: 'Xenova/resnet-50',
      name: 'ResNet-50',
      type: 'digitRecognizer',
      size: 103,
      description: 'ResNet-50 model optimized for transformers.js digit recognition',
      compatibility: 'universal',
      provider: 'Xenova',
      fallbackPriority: 1,
    },

    // Vision Models for color classification
    {
      id: 'Xenova/vit-base-patch16-224',
      name: 'ViT Base 16-224',
      type: 'colorClassifier',
      size: 343,
      description: 'Vision Transformer for image classification and color analysis',
      compatibility: 'universal',
      provider: 'Xenova',
      fallbackPriority: 1,
    },
  ];

  constructor() {}

  /**
   * Get all models of a specific type
   */
  getModelsByType(
    type:
      | 'textClassifier'
      | 'sttTranscriber'
      | 'imageObjectDetector'
      | 'digitRecognizer'
      | 'colorClassifier',
  ): LLMModel[] {
    return this.models.filter((model) => model.type === type);
  }

  /**
   * Get a specific model by ID
   */
  getModelById(id: string): LLMModel | undefined {
    return this.models.find((model) => model.id === id);
  }

  /**
   * Get recommended model for current browser
   */
  getRecommendedModelForBrowser(
    type:
      | 'textClassifier'
      | 'sttTranscriber'
      | 'imageObjectDetector'
      | 'digitRecognizer'
      | 'colorClassifier',
  ): LLMModel {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');

    const models = this.getModelsByType(type);

    if (type === 'sttTranscriber') {
      // For transcribers, prefer Chrome-compatible models for Chrome
      if (isChrome) {
        return (
          models.find((m) => m.compatibility === 'chrome-compatible') ||
          models.find((m) => m.compatibility === 'universal') ||
          models[0]
        );
      }
      // For Safari, prefer Safari-compatible models
      else if (isSafari) {
        return (
          models.find((m) => m.compatibility === 'safari-compatible') ||
          models.find((m) => m.compatibility === 'universal') ||
          models[0]
        );
      }
    }

    // Default: return highest priority model
    return models.sort((a, b) => a.fallbackPriority - b.fallbackPriority)[0];
  }

  /**
   * Get fallback models for a specific type, ordered by priority
   */
  getFallbackModels(
    type: 'textClassifier' | 'sttTranscriber' | 'imageObjectDetector' | 'colorClassifier',
  ): LLMModel[] {
    return this.getModelsByType(type).sort((a, b) => a.fallbackPriority - b.fallbackPriority);
  }

  /**
   * Check if current browser has known compatibility issues
   */
  hasBrowserCompatibilityIssues(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');

    // Chrome has known issues with ONNX models
    return isChrome;
  }

  /**
   * Get browser-specific recommendations
   */
  getBrowserRecommendations(): string[] {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');

    if (isChrome) {
      return [
        'Using optimized models for Chrome compatibility',
        'Consider Safari for larger, more accurate models',
        'Tiny models provide best Chrome performance',
      ];
    } else if (isSafari) {
      return [
        'Safari supports full range of models',
        'Larger models provide better accuracy',
        'No known compatibility issues',
      ];
    }

    return ['Using universal model configuration'];
  }

  /**
   * Get model display name with size
   */
  getModelDisplayName(modelId: string): string {
    const model = this.getModelById(modelId);
    if (model) {
      return `${model.name} (${model.size}MB)`;
    }
    return modelId;
  }

  /**
   * Get all available models formatted for UI
   */
  getAllModelsForUI(): {
    textClassifiers: LLMModel[];
    transcribers: LLMModel[];
    detectors: LLMModel[];
    colorClassifiers: LLMModel[];
    digitRecognizers: LLMModel[];
  } {
    return {
      textClassifiers: this.getModelsByType('textClassifier'),
      transcribers: this.getModelsByType('sttTranscriber'),
      detectors: this.getModelsByType('imageObjectDetector'),
      colorClassifiers: this.getModelsByType('colorClassifier'),
      digitRecognizers: this.getModelsByType('digitRecognizer'),
    };
  }
}
