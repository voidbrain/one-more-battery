import { Component, inject, computed } from '@angular/core';
import { TranscriberService } from '@services/ai/stt-transcriber.service';
import { LLMConfigService } from '@services/ai/centralized-ai-config.service';
import { TranscriberConfigStorage } from '@services/ai/stt-transcriber.config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { TranscriberSettingsModalComponent } from '@pages/ai/stt-transcriber/stt-transcriber-settings-modal/transcriber-settings-modal.component';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-transcriber-model',
  templateUrl: './transcriber-model.component.html',
  styleUrls: ['./transcriber-model.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class TranscriberModelComponent {
  // Model management
  isTranscriberLoaded = computed(() => this.transcriberService.isLoaded);
  isTranscriberLoading = computed(() => this.transcriberService.isModelLoading);

  private transcriberService = inject(TranscriberService);
  private llmConfig = inject(LLMConfigService);
  public transcriberConfigStorage = inject(TranscriberConfigStorage);
  private modalController = inject(ModalController);

  async loadTranscriber() {
    if (this.isTranscriberLoaded()) return;

    try {
      await this.transcriberService.load();
    } catch (error) {
      console.error('Failed to load transcriber:', error);
    }
  }

  async unloadTranscriber() {
    try {
      await this.transcriberService.unload();
    } catch (error) {
      console.error('Failed to unload transcriber:', error);
    }
  }

  async openTranscriberSettings(): Promise<void> {
    const initialModel = this.transcriberConfigStorage.model;

    const modal = await this.modalController.create({
      component: TranscriberSettingsModalComponent,
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: true, // Allow closing with ESC or clickout
    });

    await modal.present();

    const result = await modal.onWillDismiss();
    // Check if model changed (either from explicit apply or immediate save on change)
    if (result.data?.hasChanges || this.transcriberConfigStorage.model !== initialModel) {
      // Reset transcriber loaded state if settings changed
      if (this.isTranscriberLoaded()) {
        await this.unloadTranscriber();
      }
    }
  }

  getCurrentModelName(): string {
    const model = this.transcriberConfigStorage.model;
    // Extract just the model name from the full path
    return model.split('/').pop() || model;
  }

  getCurrentModelSize(): number {
    const model = this.transcriberConfigStorage.model;
    // Get size from LLM config
    const modelInfo = this.llmConfig.getModelById(model);
    return modelInfo?.size || 0;
  }
}
