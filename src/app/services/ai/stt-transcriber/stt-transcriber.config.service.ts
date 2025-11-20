import { Injectable, inject } from '@angular/core';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';

@Injectable({
  providedIn: 'root',
})
export class TranscriberConfigStorage {
  samplingRate = 16000;
  model = 'Xenova/whisper-tiny';
  subtask = 'transcribe';
  language = 'italian';
  isMultilingual = true;

  private llmConfig = inject(LLMConfigService);

  // Static constants for supported languages
  static readonly SUPPORTED_LANGUAGES = {
    en: 'english',
    it: 'italian',
  };

  // Dynamic model list from LLM config
  get MODELS(): Record<string, number> {
    const transcribers = this.llmConfig.getModelsByType('sttTranscriber');
    const models: Record<string, number> = {};

    transcribers.forEach((model) => {
      models[model.id] = model.size;
    });

    return models;
  }

  getFallbackModels(): string[] {
    return this.llmConfig.getFallbackModels('sttTranscriber').map((m) => m.id);
  }

  setModelWithFallback(model: string): void {
    this.model = model;
  }

  getCurrentModelInfo() {
    return this.llmConfig.getModelById(this.model);
  }
}
