import { Component, inject, computed } from '@angular/core';
import { DigitRecognizerService } from '@services/ai/digit-recognizer/digit-recognizer.service';
import { LLMConfigService } from '@services/ai/ai-common/common-ai-config.service';
import { ModalController, IonicModule } from '@ionic/angular';
import { DigitClassifierSettingsModalComponent } from '@pages/ai/image-parser/digit-classifier/modal/modal.component';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-digit-classifier-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class DigitClassifierControlPanelComponent {
  // Model management
  isDigitClassifierLoaded = computed(() => this.digitClassifierService.isModelLoaded);
  isDigitClassifierLoading = computed(() => this.digitClassifierService.isModelLoading);

  private digitClassifierService = inject(DigitRecognizerService);
  private llmConfig = inject(LLMConfigService);
  private modalController = inject(ModalController);

  async loadDigitClassifier() {
    if (this.isDigitClassifierLoaded()) return;

    try {
      await this.digitClassifierService.load();
    } catch (error) {
      console.error('Failed to load digit-classifier:', error);
    }
  }

  async unloadDigitClassifier() {
    try {
      await this.digitClassifierService.unload();
    } catch (error) {
      console.error('Failed to unload digit-classifier:', error);
    }
  }

  async openDigitClassifierSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: DigitClassifierSettingsModalComponent,
      cssClass: 'modal-lg modal-dialog-centered',
      backdropDismiss: true, // Allow closing with ESC or clickout
    });

    await modal.present();

    const result = await modal.onWillDismiss();
    if (result.data?.hasChanges) {
      // Reset digit-classifier loaded state if settings changed
      if (this.isDigitClassifierLoaded()) {
        await this.unloadDigitClassifier();
      }
    }
  }

  getCurrentDigitClassifierModelName(): string {
    const recommended = this.llmConfig.getRecommendedModelForBrowser('digitRecognizer');
    return recommended.name;
  }

  getCurrentDigitClassifierModelSize(): number {
    const recommended = this.llmConfig.getRecommendedModelForBrowser('digitRecognizer');
    return recommended.size;
  }
}
