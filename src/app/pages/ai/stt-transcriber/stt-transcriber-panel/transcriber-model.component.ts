import { Component, inject, signal } from '@angular/core';
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
  isTranscriberLoaded = signal(false);
  isTranscriberLoading = signal(false);

  private transcriberService = inject(TranscriberService);
  private llmConfig = inject(LLMConfigService);
  public transcriberConfigStorage = inject(TranscriberConfigStorage);
  private modalController = inject(ModalController);

  constructor() {
    // Initialize with current state
    this.isTranscriberLoaded.set(this.transcriberService.isLoaded);
  }

  async loadTranscriber() {
    if (this.isTranscriberLoaded()) return;

    this.isTranscriberLoading.set(true);
    try {
      await this.transcriberService.load();
      this.isTranscriberLoaded.set(true);
    } catch (error) {
      console.error('Failed to load transcriber:', error);
    } finally {
      this.isTranscriberLoading.set(false);
    }
  }

  async unloadTranscriber() {
    try {
      await this.transcriberService.unload();
      this.isTranscriberLoaded.set(false);
    } catch (error) {
      console.error('Failed to unload transcriber:', error);
    }
  }

  async openTranscriberSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: TranscriberSettingsModalComponent,
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: false,
    });

    await modal.present();

    const result = await modal.onWillDismiss();
    if (result.data?.hasChanges) {
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
