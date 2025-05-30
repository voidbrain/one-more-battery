import * as tf from '@tensorflow/tfjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdentifyBatteryService {
  private model: tf.LayersModel | null = null;
  private readonly CONFIDENCE_THRESHOLD = 0.7;

  constructor() {
    this.loadModel();
  }

  async loadModel() {
    try {
      if (!tf.getBackend()) {
        await tf.setBackend('webgl');
      }
      console.log('Loading model with backend:', tf.getBackend());

      if (this.model) {
        this.model.dispose();
      }

      this.model = await tf.loadLayersModel('/assets/data/tfjs_files/model.json');
      console.log('Model loaded successfully');
      console.log('Model input shape:', this.model.inputs[0].shape);
    } catch (error) {
      console.error('Error loading model:', error);
      if (error instanceof Error) {
        throw new Error('Failed to load model: ' + error.message);
      } else {
        throw new Error('Failed to load model: Unknown error');
      }
    }
  }

  async predictNumber(imageTensor: tf.Tensor3D): Promise<{ digit: number | null; confidence: number | null }> {
    if (!this.model) {
      console.error('Model is not loaded');
      return { digit: null, confidence: null };
    }

    const result: { digit: number | null; confidence: number | null } = (() => {
      const processedTensor = tf.tidy(() => {
        let tensor = imageTensor;

        // Convert RGB to grayscale if necessary
        if (tensor.shape.length === 3 && tensor.shape[2] === 3) {
          tensor = tensor.mean(2); // Convert RGB to grayscale
        }

        // Resize to 28x28
        tensor = tf.image.resizeBilinear(tensor, [28, 28]);

        // Invert colors if needed (MNIST expects white digits on black background)
        tensor = tf.scalar(1).sub(tensor.div(255.0));

        // Reshape to [1, 28, 28] to match MNIST model input shape
        return tensor.reshape([1, 28, 28]);
      });

      // Add debugging to see the processed image
      this.renderTensorToCanvas(processedTensor.squeeze() as tf.Tensor2D, 'Preprocessed Input');

      if (!this.model) {
        throw new Error('Model is not loaded');
      }
      const predictions = this.model.predict(processedTensor) as tf.Tensor;
      const probabilities = predictions.dataSync();

      // Log probabilities for each digit (0–9)
      console.log('Probabilities for each digit:');
      probabilities.forEach((probability, index) => {
        console.log(`Digit ${index}: ${probability.toFixed(4)}`);
      });

      const maxProbability = Math.max(...probabilities);
      const digit = probabilities.indexOf(maxProbability);

      processedTensor.dispose();
      predictions.dispose();

      if (maxProbability < this.CONFIDENCE_THRESHOLD) {
        console.warn(`Low confidence (${maxProbability.toFixed(4)}) - below threshold ${this.CONFIDENCE_THRESHOLD}`);
        return { digit: null, confidence: maxProbability };
      }

      console.log(`Predicted digit: ${digit}, confidence: ${maxProbability.toFixed(4)}`);
      return { digit, confidence: maxProbability };
    })();

    return result;
  }

  async extractDigits(image: HTMLImageElement): Promise<tf.Tensor3D[]> {
    return tf.tidy(() => {
      const imgTensor = tf.browser.fromPixels(image);
      const grayscale = imgTensor.mean(2).toFloat().expandDims(-1) as tf.Tensor3D;

      // Normalize and apply stronger thresholding
      const normalized = grayscale.div(255.0) as tf.Tensor3D;

      // Adaptive thresholding with adjusted parameters
      const localMeanImage = tf.avgPool(normalized, [7, 7], [1, 1], 'same');
      const C = 0.05; // Increased threshold constant
      const thresholded = normalized.greater(localMeanImage.sub(tf.scalar(C))).toFloat();
      localMeanImage.dispose();

      // Invert the image to match MNIST format (white digits on black background)
      const inverted = tf.scalar(1).sub(thresholded);

      const [height, width] = inverted.shape;

      // Sum along the vertical axis to detect digit regions
      const projection = inverted.sum(0).squeeze() as tf.Tensor1D;
      const projectionData = projection.arraySync() as number[];

      // Improve digit region detection
      const digitBoxes: [number, number][] = [];
      let inBox = false;
      let start = 0;
      const minWidth = 10; // Minimum width for a digit
      const threshold = height * 0.1; // Minimum sum for a digit region

      for (let x = 0; x < projectionData.length; x++) {
        if (projectionData[x] > threshold && !inBox) {
          start = x;
          inBox = true;
        } else if ((projectionData[x] <= threshold || x === projectionData.length - 1) && inBox) {
          const end = x;
          if (end - start >= minWidth) {
            digitBoxes.push([start, end]);
          }
          inBox = false;
        }
      }

      const digitTensors: tf.Tensor3D[] = [];

      // Process each detected digit region
      for (const [xStart, xEnd] of digitBoxes) {
        const digitWidth = xEnd - xStart;
        if (digitWidth > minWidth) {
          const cropped = inverted.slice([0, xStart, 0], [height, digitWidth, 1]) as tf.Tensor3D;

          // Add padding to make the digit square
          const paddedWidth = Math.max(digitWidth, height);
          const padLeft = Math.floor((paddedWidth - digitWidth) / 2);
          const padRight = paddedWidth - digitWidth - padLeft;

          const padded = tf.pad(cropped, [[0, 0], [padLeft, padRight], [0, 0]], 0);

          // Resize to MNIST dimensions
          const resized = tf.image.resizeBilinear(padded, [28, 28]) as tf.Tensor3D;

          digitTensors.push(resized);

          // Debug visualization
          this.renderTensorToCanvas(resized.squeeze() as tf.Tensor2D, `Digit from x=${xStart}`);
        }
      }

      return digitTensors;
    });
  }

  async processPhoto(image: HTMLImageElement): Promise<{ digit: number | null; confidence: number | null }[]> {
    const digits = await this.extractDigits(image);
    const results: { digit: number | null; confidence: number | null }[] = [];

    try {
      for (const digitTensor of digits) {
        results.push(await this.predictNumber(digitTensor));
      }
    } finally {
      await this.cleanupTensors(...digits);
    }

    return results;
  }

  disposeModel() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      console.log('Model disposed.');
    }
  }

  private renderTensorToCanvas(tensor: tf.Tensor2D, title = 'Digit') {
    tf.browser.toPixels(tensor).then((pixels) => {
      const canvas = document.createElement('canvas');
      canvas.width = tensor.shape[1];
      canvas.height = tensor.shape[0];
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgData = new ImageData(pixels, canvas.width, canvas.height);
        ctx.putImageData(imgData, 0, 0);
        document.body.appendChild(document.createElement('hr'));
        const label = document.createElement('div');
        label.textContent = title;
        document.body.appendChild(label);
        document.body.appendChild(canvas);
      }
    });
  }

  private async cleanupTensors(...tensors: tf.Tensor[]) {
    tensors.forEach(tensor => {
      if (tensor && !tensor.isDisposed) {
        tensor.dispose();
      }
    });
  }
}
