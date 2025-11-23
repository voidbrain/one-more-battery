import { Injectable, signal, WritableSignal } from '@angular/core';

export interface TrainingData {
  features: number[];
  label: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
}

export interface TrainingConfig {
  epochs: number;
  learningRate: number;
  batchSize: number;
  layers: number[];
}

@Injectable({
  providedIn: 'root',
})
export class TrainMlService {
  // Training process signals
  public isTraining: WritableSignal<boolean> = signal<boolean>(false);
  public trainingProgress: WritableSignal<number> = signal<number>(0);
  public trainingMetrics: WritableSignal<TrainingMetrics[]> = signal<TrainingMetrics[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public trainedModel: WritableSignal<any> = signal<any>(null);

  // Worker for training
  private worker: Worker | null = null;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    try {
      this.worker = new Worker(new URL('./train-ml.worker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (event) => {
        const { type, data } = event.data;

        switch (type) {
          case 'WORKER_READY':
            console.log('[TrainModelService] Web worker ready ✅');
            break;

          case 'TRAINING_PROGRESS':
            this.trainingProgress.set(data.progress);
            this.trainingMetrics.set(data.metrics);
            console.log(`[TrainModelService] Training progress: ${data.progress.toFixed(2)}%`);
            break;

          case 'TRAINING_COMPLETE':
            this.isTraining.set(false);
            this.trainingProgress.set(100);
            this.trainedModel.set(data.model);
            console.log('[TrainModelService] Training completed ✅');
            break;

          case 'TRAINING_ERROR':
            this.isTraining.set(false);
            console.error('Training error:', data.error);
            break;
        }
      };

      this.worker.onerror = (error) => {
        console.error('Training worker error:', error);
        this.isTraining.set(false);
      };
    } catch (error) {
      console.error('Failed to initialize training worker:', error);
    }
  }

  /**
   * Generate synthetic training data for classification
   */
  generateSyntheticData(samples: number): TrainingData[] {
    const data: TrainingData[] = [];

    // Ensure we have roughly balanced classes
    const insideTarget = Math.round(samples * 0.5); // Aim for 50% inside, 50% outside
    const outsideTarget = samples - insideTarget;
    let insideCount = 0;
    let outsideCount = 0;

    let attempts = 0;
    const maxAttempts = samples * 10; // Prevent infinite loops

    while (data.length < samples && attempts < maxAttempts) {
      attempts++;

      // Create features: 2D points
      const x = Math.random() * 2 - 1; // -1 to 1
      const y = Math.random() * 2 - 1; // -1 to 1

      // Create labels based on simple rule: circle center (0,0) radius 0.5
      const distance = Math.sqrt(x * x + y * y);
      const isInside = distance < 0.5;
      const label = isInside ? 0 : 1; // 0 = inside circle, 1 = outside

      // Add point if we haven't exceeded target counts
      if (isInside && insideCount < insideTarget) {
        data.push({ features: [x, y], label });
        insideCount++;
      } else if (!isInside && outsideCount < outsideTarget) {
        data.push({ features: [x, y], label });
        outsideCount++;
      }
    }

    // Fill remaining slots with whatever we can get
    while (data.length < samples) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const distance = Math.sqrt(x * x + y * y);
      const label = distance < 0.5 ? 0 : 1;
      data.push({ features: [x, y], label });
    }

    return data;
  }

  /**
   * Start training process
   */
  async startTraining(config: TrainingConfig, data: TrainingData[]): Promise<void> {
    if (!this.worker) {
      throw new Error('Training worker not initialized');
    }

    this.isTraining.set(true);
    this.trainingProgress.set(0);
    this.trainingMetrics.set([]);
    this.trainedModel.set(null);

    if (!this.worker) {
      throw new Error('Training worker not initialized');
    }
    this.worker.postMessage({
      type: 'START_TRAINING',
      data: { config, trainingData: data }
    });
  }

  /**
   * Load a pre-trained model
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadModel(modelData: any): Promise<void> {
    if (!this.worker) {
      throw new Error('Training worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        const { type, data } = event.data;

        if (type === 'MODEL_LOADED') {
          this.worker!.removeEventListener('message', messageHandler);
          this.trainedModel.set(modelData);
          resolve();
        } else if (type === 'MODEL_LOAD_ERROR') {
          this.worker!.removeEventListener('message', messageHandler);
          reject(new Error(data.error));
        }
      };

      this.worker!.addEventListener('message', messageHandler);

      this.worker!.postMessage({
        type: 'LOAD_MODEL',
        data: { model: modelData }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        this.worker!.removeEventListener('message', messageHandler);
        reject(new Error('Model load timeout'));
      }, 5000);
    });
  }

  /**
   * Make prediction with trained model
   */
  async predict(features: number[]): Promise<number> {
    if (!this.worker) {
      throw new Error('Training worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (event: MessageEvent) => {
        const { type, data } = event.data;

        if (type === 'PREDICTION_RESULT') {
          this.worker!.removeEventListener('message', messageHandler);
          resolve(data.prediction);
        } else if (type === 'PREDICTION_ERROR') {
          this.worker!.removeEventListener('message', messageHandler);
          reject(new Error(data.error));
        }
      };

      this.worker!.addEventListener('message', messageHandler);

      if (this.worker) {
        this.worker.postMessage({
          type: 'MAKE_PREDICTION',
          data: { features }
        });
      }

      // Timeout after 5 seconds
      setTimeout(() => {
        this.worker!.removeEventListener('message', messageHandler);
        reject(new Error('Prediction timeout'));
      }, 5000);
    });
  }

  /**
   * Stop training
   */
  stopTraining(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP_TRAINING' });
      this.isTraining.set(false);
    }
  }

  /**
   * Cleanup resources
   */
  async unload(): Promise<void> {
    this.stopTraining();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.trainingMetrics.set([]);
    console.log('[TrainModelService] Training service unloaded ✅');
  }
}
