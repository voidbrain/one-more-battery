import { Component, inject, computed } from '@angular/core';
import { STTEmbedderService } from '@services/ai/text-parser.service';
import { LLMConfigService } from '@services/ai/centralized-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { EmbedderSettingsModalComponent } from '@pages/ai/stt-embedder/stt-embedder-settings-modal/embedder-settings-modal.component';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-embedder',
  templateUrl: './embedder.component.html',
  styleUrls: ['./embedder.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class EmbedderComponent {
  // Model management
  isEmbedderLoaded = computed(() => this.embedderService.isModelLoaded);
  isEmbedderLoading = computed(() => this.embedderService.isModelLoading);

  private embedderService = inject(STTEmbedderService);
  private llmConfig = inject(LLMConfigService);
  private modalController = inject(ModalController);

  async loadEmbedder() {
    if (this.isEmbedderLoaded()) return;

    try {
      await this.embedderService.load();
    } catch (error) {
      console.error('Failed to load embedder:', error);
    }
  }

  async unloadEmbedder() {
    try {
      await this.embedderService.unload();
    } catch (error) {
      console.error('Failed to unload embedder:', error);
    }
  }

  async openEmbedderSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: EmbedderSettingsModalComponent,
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: true, // Allow closing with ESC or clickout
    });

    await modal.present();

    const result = await modal.onWillDismiss();
    if (result.data?.hasChanges) {
      // Reset embedder loaded state if settings changed
      if (this.isEmbedderLoaded()) {
        await this.unloadEmbedder();
      }
    }
  }

  getCurrentEmbedderModelName(): string {
    const recommended = this.llmConfig.getRecommendedModelForBrowser('embedder');
    return recommended.name;
  }

  getCurrentEmbedderModelSize(): number {
    const recommended = this.llmConfig.getRecommendedModelForBrowser('embedder');
    return recommended.size;
  }
}
