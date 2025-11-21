/// <reference lib="webworker" />

import { CommandMatch } from '@interfaces/index';

// Message types for worker communication
interface WorkerMessage<T = unknown> {
  type: string;
  data: T;
}

// Message types
type ParseCommandMessage = WorkerMessage<{
  text: string;
  commandEmbeddings: { command: string; embedding: number[] }[];
}>;

type WorkerResponse = WorkerMessage<CommandMatch | { error: string }>;

// In web worker context, self refers to the worker global scope
const ctx = self as DedicatedWorkerGlobalScope;

// Cosine similarity calculation
function cosineSim(a: number[], b: number[]): number {
  if (!a.length || !b.length) return 0;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

// Parse command from text with similarity matching
function parseCommand(text: string, commandEmbeddings: { command: string; embedding: number[] }[]): CommandMatch {
  console.log('Text Classifier Worker: Parsing command');
  console.log(`Text Classifier Worker: Input text: "${text}"`);

  if (!commandEmbeddings.length) {
    console.warn('Text Classifier Worker: No command embeddings available');
    return { command: null, params: {} };
  }

  // Mock embedding for demonstration (since actual ML inference stays in main thread)
  // This is a placeholder - in real usage, we'd get the actual embedding from the main thread
  const inputEmb = generateSimpleEmbedding(text);

  console.log(`Text Classifier Worker: Generated embedding length: ${inputEmb.length}`);

  let bestScore = -1;
  let bestCommand: string | null = null;

  for (const cmd of commandEmbeddings) {
    const score = cosineSim(inputEmb, cmd.embedding);
    console.log(`Text Classifier Worker: Comparing with ${cmd.command}, score: ${score.toFixed(3)}`);

    if (score > bestScore) {
      bestScore = score;
      bestCommand = cmd.command;
    }
  }

  console.log(`Text Classifier Worker: Best match: ${bestCommand}, score: ${bestScore.toFixed(3)}`);

  // Extract batteryId
  const ids = text.match(/\b\d+\b/g)?.map(Number) || [];
  const batteryId = ids.length === 1 ? ids[0] : ids;

  // Extract series/color robustly
  const seriesList = ['rossa', 'blu', 'gialla', 'yellow', 'red', 'green', 'blue'];
  let series: string | undefined;

  const words = text.toLowerCase().split(/\s+/);
  for (const w of words) {
    if (seriesList.includes(w)) {
      series = w;
      break;
    }
  }

  // Fallback: word immediately after battery number
  if (!series && batteryId) {
    const match = text.match(new RegExp(`\\b${batteryId}\\b\\s+(\\w+)`, 'i'));
    if (match) series = match[1].toLowerCase();
  }

  const result = {
    command: bestCommand,
    params: { batteryId, series }
  };

  console.log('Text Classifier Worker: Parsed result:', result);

  return result;
}

// Simple embedding generation for demonstration (placeholder)
function generateSimpleEmbedding(text: string): number[] {
  // This is a simplified placeholder - in real implementation,
  // the actual embedding would be computed by the ML model and passed from main thread
  const simpleEmbedding = new Array(384).fill(0); // MiniLM typically has 384 dimensions

  // Generate basic features based on text content
  const words = text.toLowerCase().split(/\s+/);
  const charCount = text.length;
  const wordCount = words.length;
  const hasNumbers = /\d/.test(text);
  const hasEnglish = /[a-z]/i.test(text);

  // Fill first few positions with basic features
  simpleEmbedding[0] = charCount / 100; // Normalized character count
  simpleEmbedding[1] = wordCount / 10;  // Normalized word count
  simpleEmbedding[2] = hasNumbers ? 1 : 0; // Has numbers
  simpleEmbedding[3] = hasEnglish ? 1 : 0; // Has English text

  // Add word presence indicators for common command words
  const commandWords = ['charge', 'carica', 'discharge', 'scarica', 'check', 'controlla', 'store', 'deposito'];
  commandWords.forEach((word, index) => {
    const present = words.some(w => w.includes(word) || word.includes(w));
    simpleEmbedding[4 + index] = present ? 1 : 0;
  });

  // Fill remaining positions with small random variations
  for (let i = 4 + commandWords.length; i < simpleEmbedding.length; i++) {
    simpleEmbedding[i] = Math.random() * 0.1 - 0.05; // Small random values
  }

  return simpleEmbedding;
}

// Message handler
ctx.onmessage = async (event: MessageEvent<ParseCommandMessage>) => {
  const { type, data } = event.data;

  if (type === 'PARSE_COMMAND') {
    try {
      const result = parseCommand(
        (data as ParseCommandMessage['data']).text,
        (data as ParseCommandMessage['data']).commandEmbeddings
      );
      const response: WorkerResponse = {
        type: 'PARSE_COMMAND_SUCCESS',
        data: result,
      };
      ctx.postMessage(response);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'PARSE_COMMAND_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      ctx.postMessage(response);
    }
  }
};

// Worker ready
ctx.postMessage({ type: 'WORKER_READY' });
