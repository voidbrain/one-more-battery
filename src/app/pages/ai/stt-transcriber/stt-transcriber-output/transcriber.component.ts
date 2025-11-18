import { Component, effect, input, OnInit, output, inject } from '@angular/core';
import { NotificationService } from '@services/ui/notification.service';
import { TranscriberService } from '@services/ai/stt-transcriber.service';
import { TranscriberConfigStorage } from '@services/ai/stt-transcriber.config.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { IonCard, IonCardContent } from "@ionic/angular/standalone";

@Component({
  selector: 'app-transcriber',
  templateUrl: './transcriber.component.html',
  standalone: true,
  imports: [IonCardContent, TranslocoModule, IonCard]
})
export class TranscriberComponent implements OnInit {
  transcriptionComplete = output<string>();
  protected audioProgress: number | undefined = 0;
  audioBlob = input.required<Blob>();
  isTranscriptionInProgress = output<boolean>();

  private notificationService = inject(NotificationService);
  public transcriberService = inject(TranscriberService);
  protected transcriberConfigStorage = inject(TranscriberConfigStorage);
  private transloco = inject(TranslocoService);

  constructor() {
    effect(() => {
      this.isTranscriptionInProgress.emit(this.transcriberService.isBusy);
    });

    effect(() => {
      const result = this.transcriberService.transcript;
      if (result && result.chunks && !this.transcriberService.isBusy) {
        // Concatenate all chunk texts
        const finalText = result.chunks
          .map((c) => c.text)
          .join(' ')
          .trim();
        this.transcriptionComplete.emit(finalText);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // DISABLED: Automatic loading - user must load Whisper model manually first
    // await this.transcriberService.load(); // preload pipeline

    // Check if transcriber is loaded before attempting transcription
    if (this.transcriberService.isLoaded && !this.transcriberService.isBusy && this.audioBlob()) {
      this.startTranscription();
    }
  }

  async startTranscription(): Promise<void> {
    const audioBuffer = await this.setAudioFromRecording();
    if (audioBuffer) {
      this.notificationService.showInfo('Transcription started');
      await this.transcriberService.startTranscription(audioBuffer);
      this.notificationService.showInfo('Transcription ended');
    }
  }

  async setAudioFromRecording(): Promise<AudioBuffer | undefined> {
    return new Promise<AudioBuffer | undefined>((resolve) => {
      this.audioProgress = 0;
      const fileReader = new FileReader();
      fileReader.onprogress = (event) => {
        this.audioProgress = event.loaded / event.total || 0;
      };
      fileReader.onloadend = async () => {
        try {
          const audioCtx = new AudioContext({
            sampleRate: this.transcriberConfigStorage.samplingRate,
          });
          const arrayBuffer = fileReader.result as ArrayBuffer;
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          this.audioProgress = undefined;
          resolve(audioBuffer);
        } catch (error) {
          this.notificationService.showError(this.transloco.translate('ai-model.ERR_READING_FILE'));
          console.log(error);
          resolve(undefined);
        }
      };
      fileReader.readAsArrayBuffer(this.audioBlob());
    });
  }

  formatAudioTimestamp(time: number): string {
    const hours = (time / (60 * 60)) | 0;
    time -= hours * (60 * 60);
    const minutes = (time / 60) | 0;
    time -= minutes * 60;
    const seconds = time | 0;
    return `${hours ? this.padTime(hours) + ':' : ''}${this.padTime(minutes)}:${this.padTime(seconds)}`;
  }

  padTime(time: number): string {
    return String(time).padStart(2, '0');
  }
}
