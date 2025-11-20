import { Component, EventEmitter, Output } from '@angular/core';
import { AudioRecorderComponent } from '@pages/ai/text-parser/stt-transcriber/prompt/audio-panel/audio-recorder/audio-recorder.component';
import { AudioPlayerComponent } from '@pages/ai/text-parser/stt-transcriber/prompt/audio-panel/audio-player/audio-player.component';
import { ModelCardComponent } from '@pages/ai/text-parser/stt-transcriber/prompt/loading-panel/model-card.component';
import { TranslocoModule } from '@jsverse/transloco';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-stt-transcriber-audio-prompt-card',
  templateUrl: './audio-prompt-card.html',
  styleUrl: './audio-prompt-card.scss',
  standalone: true,
  imports: [
    AudioRecorderComponent,
    AudioPlayerComponent,
    ModelCardComponent,
    TranslocoModule,
    IonicModule,
  ],
})
export class AudioManagerCard {
  @Output() transcribeClicked = new EventEmitter<void>();
  @Output() transcriptionProgressChanged = new EventEmitter<boolean>();
  @Output() recordingComplete = new EventEmitter<{ audioBuffer: Blob; audioUrl: string }>();
  @Output() recordingStart = new EventEmitter<void>();

  isTranscriptionInProgress = false;
  audioUrl?: string;
  audioBlob?: Blob;

  async onTranscriptionComplete(transcribedText: string) {
    console.log('Transcribed text:', transcribedText);
  }

  onRecordingStarted(): void {
    this.recordingStart.emit();
    this.reset();
  }

  onRecordingComplete(data: { audioBuffer: Blob; audioUrl: string }): void {
    this.audioUrl = data.audioUrl;
    this.audioBlob = data.audioBuffer;
    this.recordingComplete.emit(data);
    // Don't auto-transcribe, let user click manually
    // this.transcribe();
  }

  transcribe(): void {
    this.transcribeClicked.emit();
  }

  reset(): void {
    this.audioUrl = '';
    this.audioBlob = undefined;
  }

  setTranscriptionInProgress(isTranscriptionInProgress: boolean) {
    this.isTranscriptionInProgress = isTranscriptionInProgress;
    this.transcriptionProgressChanged.emit(isTranscriptionInProgress);
  }
}
