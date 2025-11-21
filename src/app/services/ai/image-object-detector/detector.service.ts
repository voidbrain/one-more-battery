import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { DetectorConfigStorage } from './detector.config.service';
import { PipelineFactory } from '@services/ai/ai-common/common-ai.service';
import { LoggerService } from '../../utils/logger.service';
import { DetectionResult } from '@interfaces/index';

@Injectable({ providedIn: 'root' })
export class DetectorService {
  // Detection process signals
  public isBusySignal: WritableSignal<boolean> = signal<boolean>(false);
  public errorSignal: WritableSignal<string | null> = signal<string | null>(null);
  public detectionSignal: WritableSignal<DetectionResult[] | null> = signal<
    DetectionResult[] | null
  >(null);

  // Model loading process
  public isModelLoadingSignal: WritableSignal<boolean> = signal<boolean>(false);
  public isModelLoadedSignal: WritableSignal<boolean> = signal<boolean>(false);
  public progressItemsSignal: WritableSignal<unknown[]> = signal<unknown[]>([]);

  private detectorConfigStorage = inject(DetectorConfigStorage);

  // Web Worker for processing results
  private worker: Worker | null = null;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    try {
      this.worker = new Worker(new URL('./object-detection.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'WORKER_READY':
            console.log('[DetectorService] Web worker ready ✅');
            break;

          case 'PROCESS_DETECTION_SUCCESS':
            this.detectionSignal.set(data);
            this.errorSignal.set(null);
            this.isBusySignal.set(false);
            break;

          case 'PROCESS_DETECTION_ERROR':
            this.errorSignal.set(data.error);
            console.error('Worker error:', data.error);
            this.isBusySignal.set(false);
            break;
        }
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.errorSignal.set('Object detection worker error');
        this.isBusySignal.set(false);
      };
    } catch (error) {
      console.error('Failed to initialize worker:', error);
      this.errorSignal.set('Failed to initialize object detection worker');
    }
  }

  // Getter for detector instance from centralized pipeline factory
  private get detector(): unknown {
    return PipelineFactory.getExistingInstance(
      'imageObjectDetector',
      this.detectorConfigStorage.model,
    );
  }

  // Getters for accessing signals in templates or codes
  get detection() {
    return this.detectionSignal();
  }

  get isBusy() {
    return this.isBusySignal();
  }

  get isModelLoading() {
    return this.isModelLoadingSignal();
  }

  get isModelLoaded() {
    return this.isModelLoadedSignal();
  }

  get progressItems() {
    return this.progressItemsSignal();
  }

  get error() {
    return this.errorSignal();
  }

  async detectObjects(
    imageData: ImageData | HTMLImageElement | HTMLCanvasElement,
  ): Promise<DetectionResult[] | null> {
    this.detectionSignal.set(null);
    this.errorSignal.set(null);
    this.isBusySignal.set(true);

    const detections = await this.runDetection(imageData);

    // Note: Detection signal is set by the worker when results are processed
    return detections;
  }

  private async runDetection(
    imageData: ImageData | HTMLImageElement | HTMLCanvasElement,
  ): Promise<DetectionResult[] | null> {
    await this.createDetector();
    this.errorSignal.set(null);

    try {
      const result = await (
        this.detector as (input: unknown, options?: Record<string, unknown>) => Promise<unknown>
      )(imageData, {
        threshold: this.detectorConfigStorage.confidence,
      });

      // Delegate result processing to web worker
      const detections = await this.processDetectionResultsWithWorker(result);
      return detections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown detection error';
      this.errorSignal.set(errorMessage);
      LoggerService.logError('Detection error');
      console.error(error);
      this.isBusySignal.set(false); // Clear busy state on error
      return null;
    }
  }

  private async processDetectionResultsWithWorker(result: unknown): Promise<DetectionResult[]> {
    if (!this.worker) {
      throw new Error('Web worker not initialized');
    }

    this.worker.postMessage({
      type: 'PROCESS_DETECTION_RESULTS',
      data: {
        rawResults: result,
        confidenceThreshold: this.detectorConfigStorage.confidence
      }
    });

    return new Promise<DetectionResult[]>((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        const { type, data } = event.data;

        if (type === 'PROCESS_DETECTION_SUCCESS') {
          this.worker!.removeEventListener('message', messageHandler);
          resolve(data);
        } else if (type === 'PROCESS_DETECTION_ERROR') {
          this.worker!.removeEventListener('message', messageHandler);
          reject(new Error(data.error));
        }
      };

      this.worker!.addEventListener('message', messageHandler);

      // Timeout after 30 seconds
      setTimeout(() => {
        this.worker!.removeEventListener('message', messageHandler);
        reject(new Error('Detection result processing timed out'));
      }, 30000);
    });
  }

  private processDetectionResults(result: unknown): DetectionResult[] {
    const detections: DetectionResult[] = [];

    if (result && typeof result === 'object') {
      const resultObj = result as Record<string, unknown>;

      // Handle standard object detection format (DETR, YOLO models in Transformers.js)
      if (resultObj['boxes'] && resultObj['scores'] && resultObj['labels']) {
        const boxes = resultObj['boxes'] as number[][];
        const scores = resultObj['scores'] as number[];
        const labels = resultObj['labels'] as number[];

        // Process each detection
        for (let i = 0; i < scores.length; i++) {
          if (scores[i] >= this.detectorConfigStorage.confidence) {
            detections.push({
              label: this.getCocoClassName(labels[i]),
              score: scores[i],
              box: boxes[i] as [number, number, number, number], // [x1, y1, x2, y2]
            });
          }
        }
      }
      // Handle array format directly
      else if (Array.isArray(resultObj)) {
        // Format: [{ label, score, box }, ...]
        resultObj.forEach((det: unknown) => {
          if (det && typeof det === 'object') {
            const detection = det as Record<string, unknown>;
            if (detection['label'] && typeof detection['score'] === 'number' && detection['box']) {
              detections.push({
                label: String(detection['label']),
                score: detection['score'],
                box: detection['box'] as [number, number, number, number],
              });
            }
          }
        });
      }
      // Handle different possible result formats from various models
      else if (resultObj['detections'] && Array.isArray(resultObj['detections'])) {
        // Format: { detections: [{ label, score, box }, ...] }
        (resultObj['detections'] as unknown[]).forEach((det: unknown) => {
          if (det && typeof det === 'object') {
            const detection = det as Record<string, unknown>;
            if (detection['label'] && typeof detection['score'] === 'number' && detection['box']) {
              detections.push({
                label: String(detection['label']),
                score: detection['score'],
                box: detection['box'] as [number, number, number, number],
              });
            }
          }
        });
      }
      // Handle raw result if it's directly an array (fallback)
      else if (Array.isArray(result)) {
        result.forEach((det: unknown) => {
          if (det && typeof det === 'object') {
            const detection = det as Record<string, unknown>;
            if (detection['label'] && typeof detection['score'] === 'number' && detection['box']) {
              detections.push({
                label: String(detection['label']),
                score: detection['score'],
                box: detection['box'] as [number, number, number, number],
              });
            }
          }
        });
      }
    }

    return detections;
  }

  // COCO class names for DETR model
  private getCocoClassName(classId: number): string {
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

  public async load(): Promise<void> {
    // Reset and show loading state
    this.isModelLoadingSignal.set(true);
    this.isModelLoadedSignal.set(false); // 🔍 Ensure we clear any previous successful load
    this.progressItemsSignal.set([]);
    console.log('[DetectorService] Starting model load...');

    try {
      await this.createDetector(); // This handles 'initiate', 'progress', 'done', 'ready'
      console.log('[DetectorService] Model load completed successfully ✅');
    } catch (err) {
      console.error('[DetectorService] Model loading FAILED ❌:', {
        error: err,
        model: this.detectorConfigStorage.model,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
      const errorMessage = err instanceof Error ? err.message : 'Unknown model loading error';
      this.errorSignal.set(errorMessage);
      this.isModelLoadedSignal.set(false); // 🔍 Explicitly set false on failure
    } finally {
      // Hide loader once done
      this.isModelLoadingSignal.set(false);
      // ❌ Removed: no always-true signal override
    }
  }

  private async createDetector(): Promise<void> {
    try {
      // Check if we already have the correct model loaded
      const existingInstance = PipelineFactory.getExistingInstance(
        'imageObjectDetector',
        this.detectorConfigStorage.model,
      );
      if (existingInstance) {
        return; // Already loaded
      }

      // Load the detector using centralized pipeline factory
      await PipelineFactory.getInstance(
        'imageObjectDetector',
        this.detectorConfigStorage.model,
        (data: unknown) => {
          const dataObj = data as Record<string, unknown>;
          switch (dataObj['status']) {
            case 'progress': {
              // Model file progress: update one of the progress items.
              this.progressItemsSignal.update((items) =>
                items.map((item) =>
                  (item as Record<string, unknown>)['file'] === (dataObj['file'] as string)
                    ? { ...(item as Record<string, unknown>), progress: dataObj['progress'] }
                    : item,
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
              this.isModelLoadedSignal.set(true);
              console.log('[ObjectDetectorService] Detector loaded ✅');

              break;
            }
            case 'done': {
              // Model file loaded: remove the progress item from the list.
              this.progressItemsSignal.update((items) =>
                items.filter(
                  (item) =>
                    (item as Record<string, unknown>)['file'] !== (dataObj['file'] as string),
                ),
              );
              break;
            }
          }
        },
      );
    } catch (error) {
      console.error('Failed to load detector model:', this.detectorConfigStorage.model, error);

      // Try fallback models
      await this.tryFallbackModels();
    }
  }

  private async tryFallbackModels(): Promise<void> {
    const fallbackModels = this.detectorConfigStorage.getFallbackModels();
    const currentModel = this.detectorConfigStorage.model;

    for (const fallbackModel of fallbackModels) {
      if (fallbackModel === currentModel) continue; // Skip current model

      console.log(`Trying fallback detector model: ${fallbackModel}`);
      try {
        // Temporarily change model
        this.detectorConfigStorage.setModelWithFallback(fallbackModel);

        // Dispose of current model if it exists
        await PipelineFactory.disposeInstance('imageObjectDetector', currentModel);

        // Try loading the fallback model
        await PipelineFactory.getInstance('imageObjectDetector', fallbackModel, (data: unknown) => {
          const dataObj = data as Record<string, unknown>;
          switch (dataObj['status']) {
            case 'progress': {
              this.progressItemsSignal.update((items) =>
                items.map((item) =>
                  (item as Record<string, unknown>)['file'] === (dataObj['file'] as string)
                    ? { ...(item as Record<string, unknown>), progress: dataObj['progress'] }
                    : item,
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
              this.isModelLoadedSignal.set(true);
              console.log('[ObjectDetectorService] Detector loaded ✅');
              break;
            }
            case 'done': {
              this.progressItemsSignal.update((items) =>
                items.filter(
                  (item) =>
                    (item as Record<string, unknown>)['file'] !== (dataObj['file'] as string),
                ),
              );
              break;
            }
          }
        });

        console.log(`Successfully loaded fallback detector model: ${fallbackModel}`);
        return; // Success, exit the loop
      } catch (fallbackError) {
        console.error(`Fallback detector model ${fallbackModel} also failed:`, fallbackError);
        continue; // Try next model
      }
    }

    // All models failed
    const errorMessage = 'All detector models failed to load.';
    this.errorSignal.set(errorMessage);
    throw new Error(errorMessage);
  }

  /** --- Unload detector to free memory --- */
  async unload(): Promise<void> {
    // Dispose of the detector using centralized pipeline factory
    await PipelineFactory.disposeInstance('imageObjectDetector', this.detectorConfigStorage.model);

    // Terminate the web worker
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.progressItemsSignal.set([]);
    this.isModelLoadingSignal.set(false);
    this.isModelLoadedSignal.set(false);
    console.log('[DetectorService] Detector unloaded ✅');
  }
}
