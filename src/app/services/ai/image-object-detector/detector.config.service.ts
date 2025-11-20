import { Injectable, inject } from '@angular/core';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';

@Injectable({
  providedIn: 'root',
})
export class DetectorConfigStorage {
  model = 'onnx-community/yolov11n'; // Default to faster YOLOv11n model
  confidence = 0.5; // Default confidence threshold

  private llmConfig = inject(LLMConfigService);

  // Get fallback models for detector
  getFallbackModels(): string[] {
    return this.llmConfig.getFallbackModels('imageObjectDetector').map((m) => m.id);
  }

  setModelWithFallback(model: string): void {
    this.model = model;
  }

  getCurrentModelInfo() {
    return this.llmConfig.getModelById(this.model);
  }
}
