/// <reference lib="webworker" />

import { DetectionResult } from '@interfaces/index';

// Message types for worker communication
interface WorkerMessage<T = unknown> {
  type: string;
  data: T;
}

// Message types
type ProcessDetectionMessage = WorkerMessage<{
  rawResults: unknown;
  confidenceThreshold: number;
}>;

type WorkerResponse = WorkerMessage<DetectionResult[] | { error: string }>;

// In web worker context, self refers to the worker global scope
const ctx = self as DedicatedWorkerGlobalScope;

// Process detection results (this can be heavy for large result sets)
function processDetectionResults(rawResults: unknown, confidenceThreshold: number): DetectionResult[] {
  console.log('Worker: Processing detection results');

  const detections: DetectionResult[] = [];

  if (rawResults && typeof rawResults === 'object') {
    const resultObj = rawResults as Record<string, unknown>;

    // Handle standard object detection format (DETR, YOLO models in Transformers.js)
    if (resultObj['boxes'] && resultObj['scores'] && resultObj['labels']) {
      const boxes = resultObj['boxes'] as number[][];
      const scores = resultObj['scores'] as number[];
      const labels = resultObj['labels'] as number[];

      console.log(`Worker: Processing ${scores.length} detections`);

      // Process each detection
      for (let i = 0; i < scores.length; i++) {
        if (scores[i] >= confidenceThreshold) {
          detections.push({
            label: getCocoClassName(labels[i]),
            score: scores[i],
            box: boxes[i] as [number, number, number, number], // [x1, y1, x2, y2]
          });

          console.log(`Worker: Added detection: ${getCocoClassName(labels[i])} (${scores[i].toFixed(3)})`);
        }
      }
    }
    // Handle array format directly
    else if (Array.isArray(resultObj)) {
      console.log(`Worker: Processing array format with ${resultObj.length} items`);

      // Format: [{ label, score, box }, ...]
      resultObj.forEach((det: unknown, index: number) => {
        if (det && typeof det === 'object') {
          const detection = det as Record<string, unknown>;
          if (detection['label'] && typeof detection['score'] === 'number' && detection['box']) {
            const score = detection['score'];
            if (score >= confidenceThreshold) {
              detections.push({
                label: String(detection['label']),
                score: score,
                box: detection['box'] as [number, number, number, number],
              });

              console.log(`Worker: Added detection ${index}: ${detection['label']} (${score.toFixed(3)})`);
            }
          }
        }
      });
    }
    // Handle different possible result formats from various models
    else if (resultObj['detections'] && Array.isArray(resultObj['detections'])) {
      console.log(`Worker: Processing detections array format`);

      // Format: { detections: [{ label, score, box }, ...] }
      (resultObj['detections'] as unknown[]).forEach((det: unknown, index: number) => {
        if (det && typeof det === 'object') {
          const detection = det as Record<string, unknown>;
          if (detection['label'] && typeof detection['score'] === 'number' && detection['box']) {
            const score = detection['score'];
            if (score >= confidenceThreshold) {
              detections.push({
                label: String(detection['label']),
                score: score,
                box: detection['box'] as [number, number, number, number],
              });

              console.log(`Worker: Added detection ${index}: ${detection['label']} (${score.toFixed(3)})`);
            }
          }
        }
      });
    }
    // Handle raw result if it's directly an array (fallback)
    else if (Array.isArray(rawResults)) {
      console.log(`Worker: Processing raw array format with ${rawResults.length} items`);

      rawResults.forEach((det: unknown, index: number) => {
        if (det && typeof det === 'object') {
          const detection = det as Record<string, unknown>;
          if (detection['label'] && typeof detection['score'] === 'number' && detection['box']) {
            const score = detection['score'];
            if (score >= confidenceThreshold) {
              detections.push({
                label: String(detection['label']),
                score: score,
                box: detection['box'] as [number, number, number, number],
              });

              console.log(`Worker: Added detection ${index}: ${detection['label']} (${score.toFixed(3)})`);
            }
          }
        }
      });
    } else {
      console.log('Worker: Unknown result format, cannot process');
    }
  }

  console.log(`Worker: Processed ${detections.length} detections above threshold ${confidenceThreshold}`);
  return detections;
}

// COCO class names for DETR model
function getCocoClassName(classId: number): string {
  const cocoClasses = [
    'person',
    'bicycle',
    'car',
    'motorcycle',
    'airplane',
    'bus',
    'train',
    'truck',
    'boat',
    'traffic light',
    'fire hydrant',
    'stop sign',
    'parking meter',
    'bench',
    'bird',
    'cat',
    'dog',
    'horse',
    'sheep',
    'cow',
    'elephant',
    'bear',
    'zebra',
    'giraffe',
    'backpack',
    'umbrella',
    'handbag',
    'tie',
    'suitcase',
    'frisbee',
    'skis',
    'snowboard',
    'sports ball',
    'kite',
    'baseball bat',
    'baseball glove',
    'skateboard',
    'surfboard',
    'tennis racket',
    'bottle',
    'wine glass',
    'cup',
    'fork',
    'knife',
    'spoon',
    'bowl',
    'banana',
    'apple',
    'sandwich',
    'orange',
    'broccoli',
    'carrot',
    'hot dog',
    'pizza',
    'donut',
    'cake',
    'chair',
    'couch',
    'potted plant',
    'bed',
    'dining table',
    'toilet',
    'tv',
    'laptop',
    'mouse',
    'remote',
    'keyboard',
    'cell phone',
    'microwave',
    'oven',
    'toaster',
    'sink',
    'refrigerator',
    'book',
    'clock',
    'vase',
    'scissors',
    'teddy bear',
    'hair drier',
    'toothbrush',
  ];
  return cocoClasses[classId] || `class_${classId}`;
}

// Message handler
ctx.onmessage = async (event: MessageEvent<ProcessDetectionMessage>) => {
  const { type, data } = event.data;

  if (type === 'PROCESS_DETECTION_RESULTS') {
    try {
      const detections = processDetectionResults(data.rawResults, data.confidenceThreshold);

      const response: WorkerResponse = {
        type: 'PROCESS_DETECTION_SUCCESS',
        data: detections,
      };
      ctx.postMessage(response);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'PROCESS_DETECTION_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
      ctx.postMessage(response);
    }
  }
};

// Worker ready
ctx.postMessage({ type: 'WORKER_READY' });
