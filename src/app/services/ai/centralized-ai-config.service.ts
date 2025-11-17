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
      type: 'embedder',
      size: 33,
      description: 'Multilingual sentence embeddings for command parsing',
      compatibility: 'universal',
      provider: 'sentence-transformers',
      fallbackPriority: 1,
    },
    {
      id: 'Xenova/all-MiniLM-L6-v2',
      name: 'All-MiniLM-L6-v2',
      type: 'embedder',
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
      type: 'transcriber',
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
      type: 'transcriber',
      size: 74,
      description: 'Balanced speed and accuracy',
      compatibility: 'universal',
      provider: 'Xenova',
      fallbackPriority: 2,
    },
    {
      id: 'Xenova/whisper-small',
      name: 'Whisper Small',
      type: 'transcriber',
      size: 244,
      description: 'High accuracy, best for Safari',
      compatibility: 'safari-compatible',
      provider: 'Xenova',
      fallbackPriority: 3,
    },
    {
      id: 'onnx-community/whisper-small',
      name: 'Whisper Small (Legacy)',
      type: 'transcriber',
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
      type: 'detector',
      size: 159,
      description: 'DETR object detection model with ResNet-50 backbone',
      compatibility: 'universal',
      provider: 'Xenova',
      fallbackPriority: 2,
    },

    // YOLO Models for object detection (faster, more modern)
    {
      id: 'onnx-community/yolov11n',
      name: 'YOLOv11 Nano',
      type: 'detector',
      size: 6,
      description: 'Ultralytics YOLOv11 nano model - fastest and lightest',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 1,
    },
    {
      id: 'onnx-community/yolov11s',
      name: 'YOLOv11 Small',
      type: 'detector',
      size: 19,
      description: 'Ultralytics YOLOv11 small model - good balance of speed and accuracy',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 3,
    },
    {
      id: 'onnx-community/yolov8n',
      name: 'YOLOv8 Nano',
      type: 'detector',
      size: 6,
      description: 'Ultralytics YOLOv8 nano model - very fast detection',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 4,
    },
    {
      id: 'onnx-community/yolov10n',
      name: 'YOLOv10 Nano',
      type: 'detector',
      size: 7,
      description: 'Ultralytics YOLOv10 nano model - efficient NMS-free detection',
      compatibility: 'universal',
      provider: 'onnx-community',
      fallbackPriority: 5,
    },
  ];

  constructor() {}

  /**
   * Get all models of a specific type
   */
  getModelsByType(type: 'embedder' | 'transcriber' | 'detector'): LLMModel[] {
    return this.models.filter(model => model.type === type);
  }

  /**
   * Get a specific model by ID
   */
  getModelById(id: string): LLMModel | undefined {
    return this.models.find(model => model.id === id);
  }

  /**
   * Get recommended model for current browser
   */
  getRecommendedModelForBrowser(type: 'embedder' | 'transcriber' | 'detector'): LLMModel {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');

    const models = this.getModelsByType(type);

    if (type === 'transcriber') {
      // For transcribers, prefer Chrome-compatible models for Chrome
      if (isChrome) {
        return models.find(m => m.compatibility === 'chrome-compatible') ||
               models.find(m => m.compatibility === 'universal') ||
               models[0];
      }
      // For Safari, prefer Safari-compatible models
      else if (isSafari) {
        return models.find(m => m.compatibility === 'safari-compatible') ||
               models.find(m => m.compatibility === 'universal') ||
               models[0];
      }
    }

    // Default: return highest priority model
    return models.sort((a, b) => a.fallbackPriority - b.fallbackPriority)[0];
  }

  /**
   * Get fallback models for a specific type, ordered by priority
   */
  getFallbackModels(type: 'embedder' | 'transcriber' | 'detector'): LLMModel[] {
    return this.getModelsByType(type)
      .sort((a, b) => a.fallbackPriority - b.fallbackPriority);
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
        'Tiny models provide best Chrome performance'
      ];
    } else if (isSafari) {
      return [
        'Safari supports full range of models',
        'Larger models provide better accuracy',
        'No known compatibility issues'
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
  getAllModelsForUI(): { embedders: LLMModel[], transcribers: LLMModel[], detectors: LLMModel[] } {
    return {
      embedders: this.getModelsByType('embedder'),
      transcribers: this.getModelsByType('transcriber'),
      detectors: this.getModelsByType('detector')
    };
  }
}
