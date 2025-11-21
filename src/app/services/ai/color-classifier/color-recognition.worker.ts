/// <reference lib="webworker" />

import { StripeDetectionResult, StripeResult, ColorClassificationResult } from '@interfaces/index';

// Message types for worker communication
interface WorkerMessage<T = unknown> {
  type: string;
  data: T;
}

// Message types
type DetectStripesMessage = WorkerMessage<{
  imageElement: ImageBitmap; // Will be transferred from main thread
}>;

type WorkerResponse = WorkerMessage<StripeDetectionResult[] | { error: string }>;

// In web worker context, self refers to the worker global scope
const ctx = self as DedicatedWorkerGlobalScope;

// Convert ImageBitmap to canvas for processing
function imageBitmapToCanvas(imageBitmap: ImageBitmap): OffscreenCanvas {
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context in worker');
  ctx.drawImage(imageBitmap, 0, 0);
  return canvas;
}

// Extract stripe regions from image - ULTRA SIMPLIFIED VERSION
function extractStripeRegions(imageElement: OffscreenCanvas): {
  canvas: OffscreenCanvas;
  region: { x: number; y: number; width: number; height: number };
}[] {
  console.log('Worker: Using ultra simplified stripe detection');

  const canvas = new OffscreenCanvas(imageElement.width, imageElement.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(imageElement, 0, 0);

  // Dummy regions for testing - just create a few fixed regions
  const regions: { x: number; y: number; width: number; height: number }[] = [
    { x: 10, y: 10, width: 50, height: 20 },
    { x: 100, y: 20, width: 50, height: 30 },
    { x: 200, y: 15, width: 40, height: 25 },
    { x: 50, y: 100, width: 60, height: 15 },
    { x: 150, y: 80, width: 80, height: 25 },
  ];

  // Limit to available canvas dimensions
  return regions
    .filter(region => (region.x + region.width) < canvas.width && (region.y + region.height) < canvas.height)
    .slice(0, 10) // Reduced to 10 max
    .map(region => ({
      canvas: createCroppedCanvas(canvas, region),
      region,
    }));
}



function createCroppedCanvas(
  sourceCanvas: OffscreenCanvas,
  region: { x: number; y: number; width: number; height: number },
): OffscreenCanvas {
  const croppedCanvas = new OffscreenCanvas(region.width, region.height);
  const ctx = croppedCanvas.getContext('2d')!;

  ctx.drawImage(
    sourceCanvas,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    region.width,
    region.height,
  );

  return croppedCanvas;
}

function analyzeRegionColor(canvas: OffscreenCanvas): ColorClassificationResult {
  // Extract dominant color from canvas
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Calculate average color
  let totalR = 0,
    totalG = 0,
    totalB = 0,
    count = 0;

  for (let i = 0; i < data.length; i += 4) {
    totalR += data[i];
    totalG += data[i + 1];
    totalB += data[i + 2];
    count++;
  }

  const avgR = Math.round(totalR / count);
  const avgG = Math.round(totalG / count);
  const avgB = Math.round(totalB / count);

  // Classify the color
  const color = classifyColor(avgR, avgG, avgB);
  const confidence = 0.85; // Placeholder confidence

  return {
    color,
    confidence,
    rgb: [avgR, avgG, avgB],
  };
}

function classifyColor(r: number, g: number, b: number): ColorClassificationResult['color'] {
  // Simple color classification based on RGB values
  const max = Math.max(r, g, b);

  // Black detection (very dark)
  if (max < 50) return 'black';

  // Red detection
  if (r > g + 30 && r > b + 30) return 'red';

  // Blue detection
  if (b > r + 30 && b > g + 30) return 'blue';

  // Green detection
  if (g > r + 30 && g > b + 30) return 'green';

  // Yellow detection (high red and green, low blue)
  if (r > 150 && g > 150 && b < 100) return 'yellow';

  return 'unknown';
}

function determineOrientation(region: { width: number; height: number }): boolean {
  // Return true if horizontal (width > height), false if vertical
  return region.width > region.height;
}

// Main stripe detection logic
function detectStripes(imageElement: OffscreenCanvas): StripeDetectionResult[] {
  console.log('Worker: Starting stripe detection');

  const stripeRegions = extractStripeRegions(imageElement);
  const results: StripeDetectionResult[] = [];

  console.log(`Worker: Found ${stripeRegions.length} stripe regions`);

  for (const region of stripeRegions) {
    // Analyze color of each stripe region
    const colorResult = analyzeRegionColor(region.canvas);
    const isHorizontal = determineOrientation(region.region);

    const stripeResult: StripeResult = {
      position: region.region,
      color: colorResult,
      isHorizontal,
    };

    results.push({
      stripes: [stripeResult],
      dominantColors: [colorResult],
    });

    console.log(`Worker: Processed region:`, {
      position: region.region,
      color: colorResult.color,
      confidence: colorResult.confidence,
      isHorizontal
    });
  }

  // Sort by confidence and limit to first 10 results
  const sortedResults = results
    .sort((a, b) => {
      const aConfidence = a.dominantColors.reduce((sum, color) => sum + color.confidence, 0) / a.dominantColors.length;
      const bConfidence = b.dominantColors.reduce((sum, color) => sum + color.confidence, 0) / b.dominantColors.length;
      return bConfidence - aConfidence; // Sort descending by confidence
    })
    .slice(0, 10); // Limit to first 10

  console.log(`Worker: Returning top 10 results out of ${results.length} total`);

  return sortedResults;
}

// Message handler
ctx.onmessage = async (event: MessageEvent<DetectStripesMessage>) => {
  const { type, data } = event.data;

  if (type === 'DETECT_STRIPES') {
    try {
      const canvas = imageBitmapToCanvas(data.imageElement);
      const results = detectStripes(canvas);

      const response: WorkerResponse = {
        type: 'DETECT_STRIPES_SUCCESS',
        data: results,
      };
      ctx.postMessage(response);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'DETECT_STRIPES_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      ctx.postMessage(response);
    }
  }
};

// Worker ready
ctx.postMessage({ type: 'WORKER_READY' });
