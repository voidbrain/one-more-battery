import { Component, inject } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AudioManagerCard } from '@pages/ai/text-parser/stt-transcriber/prompt/audio-panel/audio-prompt-card/audio-prompt-card';
import { TranscriberCard } from '@pages/ai/text-parser/stt-transcriber/prompt/prompt-card/prompt-card';
import { InputCard } from '@pages/ai/text-parser/text-classifier/prompt/prompt';

import { ImageObjectDetectorComponent } from '@pages/ai/image-parser/object-detector/prompt/prompt.component';
import { ImageUploadComponent } from '@pages/ai/image-parser/shared-components/image-prompt/prompt.component';
import { TextClassifierService } from '@services/ai/text-classifier/text-classifier.service';
import { ColorClassifierPrompt } from '@pages/ai/image-parser/color-recognizer/prompt/prompt';
import { DigitClassifierPrompt } from '@pages/ai/image-parser/digit-classifier/prompt/prompt';
import { CommandMatch } from '@interfaces/index';
import { AiControlPanelsComponent } from '@pages/ai/control-panels/control-panels';

import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-ai',
  templateUrl: './ai.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AudioManagerCard,
    TranscriberCard,
    InputCard,
    AiControlPanelsComponent,
    ImageObjectDetectorComponent,
    ColorClassifierPrompt,
    DigitClassifierPrompt,
    TranslocoModule,
    IonicModule,
    ImageUploadComponent,
  ],
})
export class AiComponent {
  IS_WEBGPU_AVAILABLE = !!navigator.gpu;
  isTranscribeEnabled = false;
  isTranscriptionInProgress = false;
  audioUrl?: string;
  audioBlob?: Blob;

  inputText = 'Charge battery 12 yellow series';
  command: CommandMatch | null = null;

  protected deviceDetectorService = inject(DeviceDetectorService);
  private textClassifierService = inject(TextClassifierService);

  async onTranscriptionComplete(transcribedText: string) {
    this.inputText = transcribedText; // optional: show in input
    console.log('Transcribed text:', transcribedText);
  }

  async embedText() {
    this.command = await this.textClassifierService.parseCommand(this.inputText);
    console.log('command:', this.command);
  }

  onRecordingStarted(): void {
    // Reset transcribe enabled when starting new recording
    this.isTranscribeEnabled = false;
    this.reset();
  }

  onRecordingComplete(data: { audioBuffer: Blob; audioUrl: string }): void {
    this.audioUrl = data.audioUrl;
    this.audioBlob = data.audioBuffer;
    // Don't auto-transcribe anymore - let user click manually
    // this.transcribe();
  }

  clearCurrentRecording(): void {
    this.audioUrl = '';
    this.audioBlob = undefined;
  }

  transcribe(): void {
    if (!this.audioBlob) {
      console.log('No audio blob available for transcription');
      return;
    }
    this.isTranscribeEnabled = true;
  }

  reset(): void {
    this.isTranscribeEnabled = false;
    this.clearCurrentRecording();
  }

  setTranscriptionInProgress(isTranscriptionInProgress: boolean) {
    this.isTranscriptionInProgress = isTranscriptionInProgress;
  }
}
