/// <reference lib="webworker" />

import { DigitExtractResult } from './digit-recognizer.service';

// Message types for worker communication
interface WorkerMessage<T = unknown> {
  type: string;
  data: T;
}

// Message types
type RecognizeDigitsMessage = WorkerMessage<{
  imageElement: ImageBitmap; // Will be transferred from main thread
  pipelineInfo: unknown; // Pipeline config
}>;

type WorkerResponse = WorkerMessage<DigitExtractResult[] | { error: string }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx: Worker = self as any;

// Convert ImageBitmap to canvas for processing
function imageBitmapToCanvas(imageBitmap: ImageBitmap): OffscreenCanvas {
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context in worker');
  ctx.drawImage(imageBitmap, 0, 0);
  return canvas;
}

// Grayscale conversion
function convertToGrayscale(canvas: OffscreenCanvas): ImageData {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  return imageData;
}

// Preprocessing for digit detection
function preprocessForDigitDetection(imageData: ImageData): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    const threshold = computeAdaptiveThreshold(data, i, width, height);
    data[i] = gray < threshold ? 0 : 255;
    data[i + 1] = gray < threshold ? 0 : 255;
    data[i + 2] = gray < threshold ? 0 : 255;
  }

  return imageData;
}

function computeAdaptiveThreshold(data: Uint8ClampedArray, index: number, width: number, height: number): number {
  const blockSize = 21;
  const halfBlock = Math.floor(blockSize / 2);
  const offset = 10;

  let sum = 0;
  let count = 0;

  for (let dy = -halfBlock; dy <= halfBlock; dy++) {
    for (let dx = -halfBlock; dx <= halfBlock; dx++) {
      const y = Math.floor(index / 4 / width) + dy;
      const x = ((index / 4) % width) + dx;

      if (x >= 0 && x < width && y >= 0 && y < height) {
        sum += data[(y * width + x) * 4];
        count++;
      }
    }
  }

  return sum / count - offset;
}

// Connected components analysis
function findConnectedComponents(imageData: ImageData): { x: number; y: number; width: number; height: number }[] {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const visited = new Set<number>();
  const regions: { x: number; y: number; width: number; height: number }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (visited.has(index) || data[index * 4] === 255) continue;

      const region = floodFill(x, y, width, height, data, visited);
      if (region) {
        regions.push(region);
      }
    }
  }

  return regions;
}

function floodFill(startX: number, startY: number, width: number, height: number,
                   data: Uint8ClampedArray, visited: Set<number>): { x: number; y: number; width: number; height: number } | null {
  const queue: [number, number][] = [[startX, startY]];
  let minX = startX, minY = startY, maxX = startX, maxY = startY;

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const index = y * width + x;

    if (visited.has(index) || data[index * 4] === 255) continue;

    visited.add(index);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIndex = ny * width + nx;
          if (!visited.has(nIndex) && data[nIndex * 4] === 0) {
            queue.push([nx, ny]);
          }
        }
      }
    }
  }

  const regionWidth = maxX - minX + 1;
  const regionHeight = maxY - minY + 1;
  const aspectRatio = regionWidth / regionHeight;

  if (regionWidth > 5 && regionHeight > 5 && aspectRatio > 0.3 && aspectRatio < 4) {
    return { x: minX, y: minY, width: regionWidth, height: regionHeight };
  }

  return null;
}

function isValidDigitRegion(region: { x: number; y: number; width: number; height: number }): boolean {
  const area = region.width * region.height;
  const aspectRatio = region.width / region.height;

  if (area < 50 || area > 10000) return false;
  if (aspectRatio < 0.2 || aspectRatio > 5.0) return false;

  return true;
}

function extractDigitRegions(imageElement: OffscreenCanvas): { canvas: OffscreenCanvas; region: { x: number; y: number; width: number; height: number } }[] {
  const canvas = new OffscreenCanvas(imageElement.width, imageElement.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageElement, 0, 0);

  const grayImageData = convertToGrayscale(canvas);
  ctx.putImageData(grayImageData, 0, 0);

  const processedImageData = preprocessForDigitDetection(grayImageData);
  ctx.putImageData(processedImageData, 0, 0);

  const regions = findConnectedComponents(processedImageData);

  const validRegions = regions
    .filter(region => isValidDigitRegion(region))
    .sort((a, b) => (b.width * b.height) - (a.width * a.height))
    .slice(0, 10);

  return validRegions.map(region => ({
    canvas: createCroppedCanvas(canvas, region),
    region,
  }));
}

function createCroppedCanvas(sourceCanvas: OffscreenCanvas, region: { x: number; y: number; width: number; height: number }): OffscreenCanvas {
  const croppedCanvas = new OffscreenCanvas(region.width, region.height);
  const ctx = croppedCanvas.getContext('2d')!;

  ctx.drawImage(
    sourceCanvas,
    region.x, region.y, region.width, region.height,
    0, 0, region.width, region.height
  );

  return croppedCanvas;
}

// Note: ML inference needs to be handled differently in worker context
// For now, we'll implement a basic fallback approach
async function classifyDigitRegion(canvas: OffscreenCanvas): Promise<{ digit: number; confidence: number }> {
  // This is a simplified implementation for the worker
  // In a real scenario, you'd need to load and use the ML model in the worker
  const ctx = canvas.getContext('2d');
  if (!ctx) return { digit: 0, confidence: 0.1 };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let blackPixels = 0;
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    if (gray < 128) blackPixels++;
  }

  const blackRatio = blackPixels / totalPixels;

  // Simple classification based on darkness ratio
  let digit: number;
  let confidence: number;

  if (blackRatio < 0.1) { digit = 0; confidence = 0.2; }
  else if (blackRatio < 0.2) { digit = 1; confidence = 0.3; }
  else if (blackRatio < 0.3) { digit = 2; confidence = 0.3; }
  else if (blackRatio < 0.4) { digit = 3; confidence = 0.4; }
  else if (blackRatio < 0.5) { digit = 4; confidence = 0.5; }
  else if (blackRatio < 0.6) { digit = 5; confidence = 0.6; }
  else if (blackRatio < 0.7) { digit = 6; confidence = 0.7; }
  else if (blackRatio < 0.8) { digit = 7; confidence = 0.8; }
  else if (blackRatio < 0.9) { digit = 8; confidence = 0.9; }
  else { digit = 9; confidence = 0.8; }

  return { digit, confidence };
}

// Main recognition logic
async function recognizeDigits(imageElement: OffscreenCanvas): Promise<DigitExtractResult[]> {
  try {
    const digitRegions = extractDigitRegions(imageElement);
    const results: DigitExtractResult[] = [];

    for (const region of digitRegions) {
      const classification = await classifyDigitRegion(region.canvas);

      results.push({
        recognizedDigits: [{ digit: classification.digit, confidence: classification.confidence }],
        extractedValue: classification.digit.toString(),
        confidence: classification.confidence,
      });
    }

    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  } catch (error) {
    console.error('Worker digit recognition error:', error);
    throw error;
  }
}

// Message handler
ctx.onmessage = async (event: MessageEvent<RecognizeDigitsMessage>) => {
  const { type, data } = event.data;

  if (type === 'RECOGNIZE_DIGITS') {
    try {
      const canvas = imageBitmapToCanvas(data.imageElement);
      const results = await recognizeDigits(canvas);

      const response: WorkerResponse = {
        type: 'RECOGNIZE_DIGITS_SUCCESS',
        data: results,
      };
      ctx.postMessage(response);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'RECOGNIZE_DIGITS_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      ctx.postMessage(response);
    }
  }
};

// Worker ready
ctx.postMessage({ type: 'WORKER_READY' });
