/// <reference lib="webworker" />

import { TrainingData, TrainingConfig, TrainingMetrics } from './train-ml.service';

// Message types for worker communication
interface WorkerMessage<T = unknown> {
  type: string;
  data: T;
}

type StartTrainingMessage = WorkerMessage<{
  config: TrainingConfig;
  trainingData: TrainingData[];
}>;

type MakePredictionMessage = WorkerMessage<{
  features: number[];
}>;

// Simple neural network interface
interface TrainedModel {
  weights: number[][];
  biases: number[][];
  architecture: number[];
  accuracy: number;
}

// In web worker context, self refers to the worker global scope
const ctx = self as DedicatedWorkerGlobalScope;

// Global trained model instance
let trainedModel: SimpleNeuralNetwork | null = null;

// Simple Neural Network implementation for browser-based training
class SimpleNeuralNetwork {
  private weights: number[][];
  private biases: number[][];
  private layers: number[];

  constructor(architecture: number[]) {
    this.layers = architecture;
    this.weights = [];
    this.biases = [];

    // Initialize weights and biases
    for (let i = 0; i < architecture.length - 1; i++) {
      const inputSize = architecture[i];
      const outputSize = architecture[i + 1];

      // Determine initialization method
      // If next layer is hidden (ReLU), use He Initialization: Var = 2 / n_in
      // If next layer is output (Sigmoid), use Xavier Initialization: Var = 2 / (n_in + n_out)
      let limit = 0;
      if (i < architecture.length - 2) {
        // Hidden layer (ReLU)
        const variance = 2 / inputSize;
        // For Uniform distribution [-limit, limit], Variance = limit^2 / 3
        // limit = sqrt(3 * Variance)
        limit = Math.sqrt(3 * variance);
      } else {
        // Output layer (Sigmoid)
        const variance = 2 / (inputSize + outputSize);
        limit = Math.sqrt(3 * variance);
      }

      // Weights between layer i and i+1
      this.weights[i] = new Array(inputSize * outputSize);
      for (let j = 0; j < this.weights[i].length; j++) {
        // Random values in [-limit, limit]
        this.weights[i][j] = (Math.random() * 2 - 1) * limit;
      }

      // Biases for layer i+1
      this.biases[i] = new Array(outputSize).fill(0);
    }
  }

  // Load trained model data
  loadModel(model: TrainedModel): void {
    this.weights = model.weights;
    this.biases = model.biases;
    this.layers = model.architecture;
  }

  // Forward pass
  forward(input: number[]): number[] {

    let activations = [...input];

    for (let layer = 0; layer < this.layers.length - 1; layer++) {
      const inputSize = this.layers[layer];
      const outputSize = this.layers[layer + 1];

      const newActivations = new Array(outputSize);

      for (let j = 0; j < outputSize; j++) {
        let sum = this.biases[layer][j];

        for (let i = 0; i < inputSize; i++) {
          sum += activations[i] * this.weights[layer][i * outputSize + j];
        }

        // ReLU for hidden layers, sigmoid for output
        newActivations[j] = layer === this.layers.length - 2
          ? this.sigmoid(sum)
          : Math.max(0, sum);
      }

      activations = newActivations;
    }
    // console.log("forward pass", input, activations)
    return activations;
  }

  // Backward pass and weight update
  backward(input: number[], target: number, learningRate: number): number {
    // Store activations for each layer during forward pass
    const allActivations: number[][] = [input];
    let activations = [...input];

    for (let layer = 0; layer < this.layers.length - 1; layer++) {
      const inputSize = this.layers[layer];
      const outputSize = this.layers[layer + 1];

      const newActivations = new Array(outputSize);

      for (let j = 0; j < outputSize; j++) {
        let sum = this.biases[layer][j];

        for (let i = 0; i < inputSize; i++) {
          sum += activations[i] * this.weights[layer][i * outputSize + j];
        }

        // ReLU for hidden layers, sigmoid for output
        newActivations[j] = layer === this.layers.length - 2
          ? this.sigmoid(sum)
          : Math.max(0, sum);
      }

      allActivations.push(newActivations);
      activations = newActivations;
    }

    const prediction = activations[0];
    const loss = -(target * Math.log(prediction + 1e-10) +
      (1 - target) * Math.log(1 - prediction + 1e-10));

    // Calculate errors for each layer
    const errors: number[][] = new Array(this.layers.length - 1);

    // Output layer error
    // For Cross Entropy Loss with Sigmoid, the delta is simply (target - output)
    // This avoids the vanishing gradient problem of MSE
    const outputActivation = allActivations[allActivations.length - 1][0];
    errors[this.layers.length - 2] = [target - outputActivation];

    // Propagate errors backwards
    for (let layer = this.layers.length - 2; layer > 0; layer--) {
      errors[layer - 1] = new Array(this.layers[layer]);

      for (let i = 0; i < this.layers[layer]; i++) {
        let error = 0;
        for (let j = 0; j < this.layers[layer + 1]; j++) {
          error += errors[layer][j] * this.weights[layer][i * this.layers[layer + 1] + j];
        }
        // ReLU derivative
        const activation = allActivations[layer][i];
        errors[layer - 1][i] = error * (activation > 0 ? 1 : 0);
      }
    }

    // Update weights and biases
    for (let layer = 0; layer < this.layers.length - 1; layer++) {
      const inputSize = this.layers[layer];
      const outputSize = this.layers[layer + 1];

      for (let i = 0; i < inputSize; i++) {
        for (let j = 0; j < outputSize; j++) {
          const gradient = errors[layer][j] * allActivations[layer][i];
          this.weights[layer][i * outputSize + j] += learningRate * gradient;
        }
      }

      for (let j = 0; j < outputSize; j++) {
        this.biases[layer][j] += learningRate * errors[layer][j];
      }
    }

    return loss;
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Predict method
  predict(input: number[]): number {
    const outputs = this.forward(input);
    return outputs[0] >= 0.5 ? 1 : 0; // 0 = inside, 1 = outside
  }

  // Calculate accuracy on dataset
  calculateAccuracy(data: TrainingData[]): number {
    let correct = 0;
    for (const sample of data) {
      const prediction = this.predict(sample.features);
      if (prediction === sample.label) correct++;
    }
    return correct / data.length;
  }

  // Get model data for serialization
  getModel(): TrainedModel {
    const testData = Array.from({ length: 100 }, () => {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const distance = Math.sqrt(x * x + y * y);
      const label = distance < 0.5 ? 0 : 1;
      return { features: [x, y], label };
    });

    return {
      weights: [...this.weights],
      biases: [...this.biases],
      architecture: [...this.layers],
      accuracy: this.calculateAccuracy(testData)
    };
  }
}

// Training function
async function trainModel(config: TrainingConfig, trainingData: TrainingData[]): Promise<TrainedModel> {
  console.log('Worker: Starting training with config:', config);
  console.log('Worker: Training data size:', trainingData.length);

  const model = new SimpleNeuralNetwork(config.layers);
  const metrics: TrainingMetrics[] = [];

  let totalSampleCount = 0;

  for (let epoch = 0; epoch < config.epochs; epoch++) {
    // Shuffle data for each epoch
    const shuffledData = [...trainingData].sort(() => Math.random() - 0.5);

    let epochLoss = 0;

    for (let i = 0; i < shuffledData.length; i++) {
      const sample = shuffledData[i];
      totalSampleCount++;

      // Train on this sample
      const loss = model.backward(sample.features, sample.label, config.learningRate);
      epochLoss += loss;

      // Update progress every 10 samples
      if (totalSampleCount % 10 === 0) {
        const progress = (totalSampleCount / (config.epochs * trainingData.length)) * 100;

        const currentMetrics = [...metrics, {
          epoch: epoch + 1,
          loss: epochLoss / (i + 1),
          accuracy: model.calculateAccuracy(shuffledData.slice(0, 50)) // Use subset for faster calculation
        }];

        ctx.postMessage({
          type: 'TRAINING_PROGRESS',
          data: {
            progress: Math.min(progress, 99), // Keep under 100% until complete
            metrics: currentMetrics
          }
        });

        // Yield to event loop to allow message processing (e.g. stop training)
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    const accuracy = model.calculateAccuracy(trainingData);
    metrics.push({
      epoch: epoch + 1,
      loss: epochLoss / trainingData.length,
      accuracy: accuracy
    });

    console.log(`Worker: Epoch ${epoch + 1}/${config.epochs} - Loss: ${(epochLoss / trainingData.length).toFixed(4)} - Accuracy: ${(accuracy * 100).toFixed(2)}%`);
  }

  console.log('Worker: Training completed');
  return model.getModel();
}

type LoadModelMessage = WorkerMessage<{
  model: TrainedModel;
}>;

// Message handler
ctx.onmessage = async (event: MessageEvent<StartTrainingMessage | MakePredictionMessage | LoadModelMessage>) => {
  const { type, data } = event.data;

  if (type === 'START_TRAINING') {
    try {
      const trainingData = (data as { config: TrainingConfig; trainingData: TrainingData[] }).trainingData;
      const config = (data as { config: TrainingConfig; trainingData: TrainingData[] }).config;
      const modelData = await trainModel(config, trainingData);

      // Store the trained model for predictions
      trainedModel = new SimpleNeuralNetwork(config.layers);
      trainedModel.loadModel(modelData);

      ctx.postMessage({
        type: 'TRAINING_COMPLETE',
        data: { model: modelData }
      });
    } catch (error) {
      console.error('Training failed:', error);
      ctx.postMessage({
        type: 'TRAINING_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown training error' }
      });
    }
  }

  if (type === 'LOAD_MODEL') {
    try {
      const modelData = (data as { model: TrainedModel }).model;

      // Initialize model with the architecture from the saved model
      trainedModel = new SimpleNeuralNetwork(modelData.architecture);
      trainedModel.loadModel(modelData);

      console.log('Worker: Model loaded successfully');

      ctx.postMessage({
        type: 'MODEL_LOADED',
        data: { success: true }
      });
    } catch (error) {
      console.error('Loading model failed:', error);
      ctx.postMessage({
        type: 'MODEL_LOAD_ERROR',
        data: { error: error instanceof Error ? error.message : 'Unknown model load error' }
      });
    }
  }

  if (type === 'MAKE_PREDICTION') {
    try {
      if (!trainedModel) {
        throw new Error('No trained model available');
      }

      const features = (data as { features: number[] }).features;
      const prediction = trainedModel.predict(features);

      ctx.postMessage({
        type: 'PREDICTION_RESULT',
        data: { prediction }
      });
    } catch (error) {
      ctx.postMessage({
        type: 'PREDICTION_ERROR',
        data: { error: error instanceof Error ? error.message : 'Prediction failed' }
      });
    }
  }

  if (type === 'STOP_TRAINING') {
    console.log('Worker: Training stopped by user');
  }
};

// Worker ready
ctx.postMessage({ type: 'WORKER_READY' });
