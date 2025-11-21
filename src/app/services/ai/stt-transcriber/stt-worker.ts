/// <reference lib="webworker" />

import { TranscriberData } from '@interfaces/index';

// Message types for worker communication
interface WorkerMessage<T = unknown> {
  type: string;
  data: T;
}

// Message types
type ProcessAudioMessage = WorkerMessage<{
  leftChannel: Float32Array;
  rightChannel?: Float32Array;
  sampleRate: number;
  numberOfChannels: number;
  length: number;
}>;

type ProcessTranscriptionMessage = WorkerMessage<{
  transcriptionResult: unknown;
  language: string;
  model: string;
}>;

type WorkerResponse = WorkerMessage<TranscriberData | Float32Array | { error: string }>;

// In web worker context, self refers to the worker global scope
const ctx = self as DedicatedWorkerGlobalScope;

// Process audio data (convert stereo to mono if needed)
function processAudio(audioData: {
  leftChannel: Float32Array;
  rightChannel?: Float32Array;
  sampleRate: number;
  numberOfChannels: number;
  length: number;
}): Float32Array {
  console.log('STT Worker: Processing audio data');

  if (audioData.numberOfChannels === 2 && audioData.rightChannel) {
    console.log('STT Worker: Converting stereo to mono');

    const SCALING_FACTOR = Math.sqrt(2);
    const left = audioData.leftChannel;
    const right = audioData.rightChannel;

    const audio = new Float32Array(audioData.length);
    for (let i = 0; i < audioData.length; ++i) {
      audio[i] = (SCALING_FACTOR * (left[i] + right[i])) / 2;
    }
    return audio;
  } else {
    console.log('STT Worker: Audio is already mono');
    // If the audio is not stereo, we can just use the first channel:
    return audioData.leftChannel;
  }
}

// Process transcription results (lightweight processing that can run in worker)
function processTranscriptionResult(
  transcriptionResult: unknown,
  language: string,
  model: string,
): TranscriberData {
  console.log('STT Worker: Processing transcription result');

  if (!transcriptionResult || typeof transcriptionResult !== 'object') {
    throw new Error('Invalid transcription result');
  }

  const resultObj = transcriptionResult as Record<string, unknown>;

  // Extract relevant data from transcription result
  const processed = {
    isBusy: false,
    text: resultObj['text'] as string || '',
    chunks: resultObj['chunks'] as unknown[] || [],
    language,
    model,
  };

  console.log(`STT Worker: Processed transcription - text length: ${processed.text.length}, chunks: ${processed.chunks.length}`);

  return processed as TranscriberData;
}

// Message handler
ctx.onmessage = async (event: MessageEvent<ProcessAudioMessage | ProcessTranscriptionMessage>) => {
  const { type, data } = event.data;

  if (type === 'PROCESS_AUDIO') {
    try {
      const audioData = processAudio(data as ProcessAudioMessage['data']);
      const response: WorkerResponse = {
        type: 'PROCESS_AUDIO_SUCCESS',
        data: audioData,
      };
      ctx.postMessage(response, [audioData.buffer]);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'PROCESS_AUDIO_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      ctx.postMessage(response);
    }
  } else if (type === 'PROCESS_TRANSCRIPTION') {
    try {
      const transcriptionData = processTranscriptionResult(
        (data as ProcessTranscriptionMessage['data']).transcriptionResult,
        (data as ProcessTranscriptionMessage['data']).language,
        (data as ProcessTranscriptionMessage['data']).model,
      );
      const response: WorkerResponse = {
        type: 'PROCESS_TRANSCRIPTION_SUCCESS',
        data: transcriptionData,
      };
      ctx.postMessage(response);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'PROCESS_TRANSCRIPTION_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      ctx.postMessage(response);
    }
  }
};

// Worker ready
ctx.postMessage({ type: 'WORKER_READY' });
