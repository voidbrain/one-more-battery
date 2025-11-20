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

    this.detectionSignal.set(detections);
    this.isBusySignal.set(false);

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

      // Process the result into our DetectionResult format
      const detections = this.processDetectionResults(result);
      return detections;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown detection error';
      this.errorSignal.set(errorMessage);
      LoggerService.logError('Detection error');
      console.error(error);
      return null;
    }
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
    this.progressItemsSignal.set([]);

    try {
      await this.createDetector(); // This handles 'initiate', 'progress', 'done', 'ready'
    } catch (err) {
      console.error('Model loading failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown model loading error';
      this.errorSignal.set(errorMessage);
    } finally {
      // Hide loader once done
      this.isModelLoadingSignal.set(false);
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
    this.progressItemsSignal.set([]);
    this.isModelLoadingSignal.set(false);
    this.isModelLoadedSignal.set(false);
    console.log('[DetectorService] Detector unloaded ✅');
  }
}
