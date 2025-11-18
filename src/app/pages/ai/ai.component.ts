import { Component, inject } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AudioManagerCard } from '@pages/ai/audio/audio-manager-card/audio-manager-card';
import { TranscriberCard } from '@pages/ai/stt-transcriber/transcriber-card/transcriber-card';
import { InputCard } from '@pages/ai/stt-transcriber/input-card/input-card';

import { DetectorComponent } from '@pages/ai/object-detector/detector/detector.component';
import { ObjectDetectorModel } from '@pages/ai/object-detector/object-detector-model/object-detector-model';
import { EmbedderComponent } from '@pages/ai/stt-embedder/stt-embedder-panel/embedder.component';
import { TranscriberModelComponent } from '@pages/ai/stt-transcriber/stt-transcriber-panel/transcriber-model.component';
import { STTEmbedderService } from '@services/ai/text-parser.service';
import { CommandMatch } from '@interfaces/index';

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
    ObjectDetectorModel,
    DetectorComponent,
    EmbedderComponent,
    TranscriberModelComponent,
    TranslocoModule,
    IonicModule,
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
  private embedderService = inject(STTEmbedderService);

  async onTranscriptionComplete(transcribedText: string) {
    this.inputText = transcribedText; // optional: show in input
    console.log('Transcribed text:', transcribedText);
  }

  async embedText() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.command = await (this.embedderService as any).parseCommand(this.inputText);
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
