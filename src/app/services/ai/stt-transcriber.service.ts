// transcriber.service.ts
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { TranscriberConfigStorage } from './stt-transcriber.config.service';
import { PipelineFactory } from './centralized-pipeline-factory.service';
import { WhisperTextStreamer } from '@huggingface/transformers';
import { whisperDownloadFilesProgress } from '@interfaces/index';
import { TranscriberData } from '@interfaces/index';
import { LoggerService } from '../utils/logger.service';

@Injectable({
  providedIn: 'root',
})
export class TranscriberService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private streamer: any;

  // transcription process
  public isBusySignal: WritableSignal<boolean> = signal<boolean>(false);
  public errorSignal: WritableSignal<string | null> = signal<string | null>(null);
  public transcriptSignal: WritableSignal<TranscriberData | null> = signal<TranscriberData | null>(
    null,
  );

  // downloading model files process
  public isModelLoadingSignal: WritableSignal<boolean> = signal<boolean>(false);
  public progressItemsSignal: WritableSignal<whisperDownloadFilesProgress[]> = signal<whisperDownloadFilesProgress[]>([]);

  protected transcriberConfigStorage = inject(TranscriberConfigStorage);

  // Getter for transcriber instance from centralized pipeline factory
  private get transcriber(): unknown {
    return PipelineFactory.getExistingInstance('transcriber', this.transcriberConfigStorage.model);
  }

  // Getters for accessing signals in templates or codes
  get transcript() {
    return this.transcriptSignal();
  }

  get isBusy() {
    return this.isBusySignal();
  }

  get isModelLoading() {
    return this.isModelLoadingSignal();
  }

  get progressItems() {
    return this.progressItemsSignal();
  }

  get error() {
    return this.errorSignal();
  }

  get isLoaded() {
    return this.transcriber !== null;
  }

  async startTranscription(audioBuffer: AudioBuffer): Promise<void> {
    this.transcriptSignal.set(null);
    this.errorSignal.set(null);
    this.isBusySignal.set(true);

    const audio = this.getAudio(audioBuffer);
    const transcript = await this.transcribe(audio);

    this.transcriptSignal.set(transcript);
    this.isBusySignal.set(false);
  }

  private getAudio(audioBuffer: AudioBuffer): Float32Array {
    if (audioBuffer.numberOfChannels === 2) {
      const SCALING_FACTOR = Math.sqrt(2);

      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);

      const audio = new Float32Array(left.length);
      for (let i = 0; i < audioBuffer.length; ++i) {
        audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
      }
      return audio;
    } else {
      // If the audio is not stereo, we can just use the first channel:
      return audioBuffer.getChannelData(0);
    }
  }

  async transcribe(audio: Float32Array): Promise<TranscriberData | null> {
    await this.createTranscriber();
    this.createStreamer();

    try {
      const chunkLengthInSeconds = this.transcriberConfigStorage.model.startsWith('distil-whisper/')
        ? 20
        : 30;
      const strideLengthInSeconds = this.transcriberConfigStorage.model.startsWith(
        'distil-whisper/',
      )
        ? 3
        : 5;

      const output = await (this.transcriber as (audio: Float32Array, options: unknown) => Promise<unknown>)(audio, {
        top_k: 0,
        do_sample: false,
        chunk_length_s: chunkLengthInSeconds,
        stride_length_s: strideLengthInSeconds,
        language: this.transcriberConfigStorage.language,
        task: this.transcriberConfigStorage.subtask,
        return_timestamps: true,
        force_full_sequences: false,
        streamer: this.streamer,
        model: this.transcriberConfigStorage.model,
      });
      return {
        isBusy: false,
        tps: this.streamer.tps,
        ...(output as Record<string, unknown>)
      } as TranscriberData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown transcription error';
      this.errorSignal.set(errorMessage);
      LoggerService.logError('Transcription error');
      console.error(error);
      return null;
    }
  }

  public async load(): Promise<void> {
    // Reset and show loading state
    this.isModelLoadingSignal.set(true);
    this.progressItemsSignal.set([]);

    try {
      await this.createTranscriber(); // This handles 'initiate', 'progress', 'done', 'ready'
    } catch (err) {
      console.error('Model loading failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown model loading error';
      this.errorSignal.set(errorMessage);
    } finally {
      // Hide loader once done
      this.isModelLoadingSignal.set(false);
    }
  }

  private async createTranscriber(): Promise<void> {
    try {
      // Check if we already have the correct model loaded
      const existingInstance = PipelineFactory.getExistingInstance('transcriber', this.transcriberConfigStorage.model);
      if (existingInstance) {
        return; // Already loaded
      }

      // Load the transcriber using centralized pipeline factory
      await PipelineFactory.getInstance('transcriber', this.transcriberConfigStorage.model, (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        switch (data.status) {
          case 'progress': {
            // Model file progress: update one of the progress items.
            this.progressItemsSignal.update((items) =>
              items.map((item) =>
                item.file === (data.file as string) ? { ...item, progress: data.progress } : item,
              ),
            );
            break;
          }
          case 'initiate': {
            // Model file start load: add a new progress item to the list.
            this.isModelLoadingSignal.set(true);
            this.progressItemsSignal.update((items) => [...items, data]);
            break;
          }
          case 'ready': {
            this.isModelLoadingSignal.set(false);
            break;
          }
          case 'done': {
            // Model file loaded: remove the progress item from the list.
            this.progressItemsSignal.update((items) =>
              items.filter((item) => item.file !== (data.file as string)),
            );
            break;
          }
        }
      });
    } catch (error) {
      console.error('Failed to load model:', this.transcriberConfigStorage.model, error);

      // Try fallback models
      await this.tryFallbackModels();
    }
  }

  private async tryFallbackModels(): Promise<void> {
    const fallbackModels = this.transcriberConfigStorage.getFallbackModels();
    const currentModel = this.transcriberConfigStorage.model;

    // Check if this is a Chrome protobuf issue
    const isChromeProtobufError = this.isChromeProtobufIssue();

    for (const fallbackModel of fallbackModels) {
      if (fallbackModel === currentModel) continue; // Skip current model

      console.log(`Trying fallback model: ${fallbackModel}`);
      try {
        // Temporarily change model
        this.transcriberConfigStorage.setModelWithFallback(fallbackModel);

        // Dispose of current model if it exists
        await PipelineFactory.disposeInstance('transcriber', currentModel);

        // Try loading the fallback model
        await PipelineFactory.getInstance('transcriber', fallbackModel, (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          switch (data.status) {
            case 'progress': {
              this.progressItemsSignal.update((items) =>
                items.map((item) =>
                  item.file === (data.file as string) ? { ...item, progress: data.progress } : item,
                ),
              );
              break;
            }
            case 'initiate': {
              this.isModelLoadingSignal.set(true);
              this.progressItemsSignal.update((items) => [...items, data]);
              break;
            }
            case 'ready': {
              this.isModelLoadingSignal.set(false);
              break;
            }
            case 'done': {
              this.progressItemsSignal.update((items) =>
                items.filter((item) => item.file !== (data.file as string)),
              );
              break;
            }
          }
        });

        console.log(`Successfully loaded fallback model: ${fallbackModel}`);
        return; // Success, exit the loop

      } catch (fallbackError) {
        console.error(`Fallback model ${fallbackModel} also failed:`, fallbackError);

        // If this is Chrome and protobuf issue, don't try more models
        if (isChromeProtobufError && this.isProtobufError(fallbackError)) {
          console.warn('Chrome protobuf compatibility issue detected. Skipping remaining ONNX models.');
          break;
        }

        continue; // Try next model
      }
    }

    // All models failed - provide helpful error message
    this.handleModelLoadingFailure(isChromeProtobufError);
  }

  private isChromeProtobufIssue(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('chrome') && !userAgent.includes('edg');
  }

  private isProtobufError(error: unknown): boolean {
    const errorObj = error as { message?: string };
    const errorMessage = errorObj.message || '';
    return errorMessage.includes('protobuf') || errorMessage.includes('ERROR_CODE: 7');
  }

  private async handleModelLoadingFailure(isChromeProtobufError: boolean): Promise<void> {
    let errorMessage = 'All transcription models failed to load. ';

    if (isChromeProtobufError) {
      errorMessage += 'Chrome has known compatibility issues with ONNX models. Try using Safari or Firefox for better transcription support.';
    } else {
      errorMessage += 'This may be due to browser compatibility issues or network problems.';
    }

    // Try to provide a basic fallback transcription method
    console.warn('Implementing basic transcription fallback...');
    await this.implementBasicFallback();

    throw new Error(errorMessage);
  }

  private async implementBasicFallback(): Promise<void> {
    // For now, we'll just log that we're in fallback mode
    // In a real implementation, you could:
    // 1. Use Web Speech API as fallback
    // 2. Use a different transcription service
    // 3. Provide offline transcription options

    console.log('Basic fallback mode activated. Advanced transcription features may be limited.');

    // You could implement Web Speech API fallback here:
    // if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    //   console.log('Web Speech API available as fallback');
    //   // Implement Web Speech API transcription
    // }
  }

  private createStreamer(): void {
    const isDistilWhisper = this.transcriberConfigStorage.model.startsWith('distil-whisper/');
    const chunkLengthInSeconds = isDistilWhisper ? 20 : 30;
    const strideLengthInSeconds = isDistilWhisper ? 3 : 5;
    const transcriberInstance = this.transcriber as { processor: { feature_extractor: { config: { chunk_length: number } } }; model: { config: { max_source_positions: number } }; tokenizer: unknown };
    const timePrecision =
      transcriberInstance.processor.feature_extractor.config.chunk_length /
      transcriberInstance.model.config.max_source_positions;

    const chunks: {
      text: string;
      offset: number;
      timestamp: [number, number | null];
      finalised: boolean;
    }[] = [];
    let chunkCount = 0;
    let startTime;
    let numTokens = 0;
    let tps: number;

    this.streamer = new WhisperTextStreamer(transcriberInstance.tokenizer as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
      time_precision: timePrecision,
      on_chunk_start: (x: number) => {
        const offset = (chunkLengthInSeconds - strideLengthInSeconds) * chunkCount;
        chunks.push({
          text: '',
          offset: offset,
          timestamp: [offset + x, null],
          finalised: false,
        });
      },
      token_callback_function: () => {
        startTime ??= performance.now();
        if (numTokens++ > 0) {
          tps = (numTokens / (performance.now() - startTime)) * 1000;
        }
      },
      callback_function: (x: string) => {
        if (chunks.length === 0) return;
        chunks[chunks.length - 1].text += x;

        this.transcriptSignal.set({
          isBusy: true,
          text: '', // No need to send full text yet
          chunks: chunks,
          tps: tps,
          language: this.transcriberConfigStorage.language,
          model: this.transcriberConfigStorage.model,
        });
        this.isBusySignal.set(true);
      },
      on_chunk_end: (x) => {
        const current = chunks[chunks.length - 1];
        if (current) {
          current.timestamp[1] = x + current.offset;
          current.finalised = true;
        }
      },
      on_finalize: () => {
        startTime = null;
        numTokens = 0;
        ++chunkCount;
      },
    });
  }

  /** --- Unload transcriber to free memory --- */
  async unload(): Promise<void> {
    // Dispose of the transcriber using centralized pipeline factory
    await PipelineFactory.disposeInstance('transcriber', this.transcriberConfigStorage.model);
    this.streamer = null;
    this.progressItemsSignal.set([]);
    this.isModelLoadingSignal.set(false);
    console.log('[TranscriberService] Transcriber unloaded ✅');
  }
}
