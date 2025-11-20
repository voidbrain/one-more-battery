import { Injectable, inject } from '@angular/core';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';

@Injectable({
  providedIn: 'root',
})
export class DetectorConfigStorage {
  model = 'Xenova/detr-resnet-50'; // Default to reliable DETR model
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
