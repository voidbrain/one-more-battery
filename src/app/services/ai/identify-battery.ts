import * as tf from '@tensorflow/tfjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IdentifyBatteryService {
  private model: tf.LayersModel | null = null;

  constructor() {
    this.loadModel();
  }

  async loadModel() {
    try {
      await tf.setBackend('cpu');
      console.log('Loading model...');

      // Dispose of old model before loading a new one
      if (this.model) {
        this.model.dispose();
        this.model = null;
      }

      this.model = await tf.loadLayersModel('/assets/data/tfjs_files/model.json');
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  public async predictNumber(
    imgElement: HTMLImageElement,
    boundingBox: { x: number; y: number; width: number; height: number },
    threshold: number,
    erosion: number,
    dilation: number
  ): Promise<{ digit: number | null; confidence: number | null; probabilities: Float32Array | null } | null> {
    const validBoundingBox = {
      x: Math.max(0, Math.min(boundingBox.x, imgElement.width - 1)),
      y: Math.max(0, Math.min(boundingBox.y, imgElement.height - 1)),
      width: Math.max(1, Math.min(boundingBox.width, imgElement.width - boundingBox.x)),
      height: Math.max(1, Math.min(boundingBox.height, imgElement.height - boundingBox.y))
    };

    console.log('Bounding Box:', validBoundingBox);

    const croppedTensor = tf.tidy(() => {
      // Step 1: Convert to grayscale and crop
      let tensor = tf.browser.fromPixels(imgElement, 1)
        .slice([validBoundingBox.y, validBoundingBox.x, 0], [validBoundingBox.height, validBoundingBox.width, 1]);

      // // Step 2: Apply threshold to separate foreground from background
      let thresholded = tensor.greater(tf.scalar(threshold)).toFloat();

      // // Step 3: Apply morphological operations to remove noise
      // const kernel: any = tf.ones([3, 3, 1, 1]);

      // Prepare tensor for conv2d by adding batch dimension
      let processed: any = thresholded.expandDims(0);

      // // Erosion to remove small noise
      // processed = tf.conv2d(processed, kernel, 1, 'same')
      //   .greater(tf.scalar(erosion)).toFloat();

      // // Dilation to restore number thickness
      // processed = tf.conv2d(processed, kernel, 1, 'same')
      //   .greater(tf.scalar(dilation)).toFloat();

      // Resize while keeping batch and channel dimensions
      processed = tf.image.resizeBilinear(processed, [28, 28]);

      // Remove the channel dimension and flatten for the model
      return processed.reshape([1, 28, 28]);
    });

    this.drawThumb(croppedTensor);

    let return_value: any;
    if (this.model) {
      const predictions: any = this.model.predict(croppedTensor);
      const probabilities = predictions.dataSync();
      const digit = predictions.argMax(-1).dataSync()[0];
      const confidence = probabilities[digit];
      console.log('Predicted digit:', digit, 'with confidence:', probabilities[digit], 'array:', predictions);
      return_value = { digit, confidence, probabilities };
    } else {
      console.error('Model is not loaded');
      return_value = { digit: null, confidence: null, probabilities: null };
    }
    croppedTensor.dispose();
    return return_value;
  }

  async drawThumb(croppedTensor: any) {
    // Create a canvas to show the cropped tensor as an image
    const canvas = document.createElement('canvas');
    canvas.width = 28;
    canvas.height = 28;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1000';
    canvas.style.backgroundColor = 'white'; // Set background color to white
    canvas.style.border = '1px solid red'; // Add a 1px solid red border
    document.body.appendChild(canvas); // Append the canvas to the body or any other container

    await tf.browser.toPixels(croppedTensor.squeeze(), canvas).then(() => {
      console.log('Cropped tensor displayed on canvas');
    });
  }

  private getBoundingBox(imgElement: HTMLImageElement) {
    const width = imgElement.width;
    const height = imgElement.height;

    // Calculate the central third region
    const x = Math.round(width / 3);
    const y = Math.round(height / 3);
    const boxWidth = Math.round(width / 3);
    const boxHeight = Math.round(height / 3);

    return {
      x: x,
      y: y,
      width: boxWidth,
      height: boxHeight
    };
  }

  async processPhoto(
    image: HTMLImageElement,
  ): Promise<{
    digit: number | null;
    color: string | null;
    confidence: number | null;
  } | null> {
    if (!this.model) {
      console.error('Model not loaded');
      return null;
    }

    console.log('Processing photo...');

    // Extract color from the band
    const predictionResult = await this.predictNumber(image, this.getBoundingBox(image), 127, 8, 0.5);

    const digit = predictionResult?.digit ?? null;
    const confidence = predictionResult?.confidence ?? null;
    const probabilities = predictionResult?.probabilities ?? null;
    const color = this.extractColorBand(image);

    console.log('Processing completed:', {
      digit,
      confidence,
      probabilities,
      color,
    });
    return { digit, confidence, color };
  }

  private extractColorBand(image: HTMLImageElement): string | null {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Canvas context not supported');
      return null;
    }

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Define the area where the color band is expected (e.g., bottom of the image)
    const bandYStart = Math.floor(image.height * 0.75); // Bottom 25% of the image
    const bandHeight = Math.floor(image.height * 0.2); // 20% of height

    // Get pixel data from the selected area
    const imageData = ctx.getImageData(
      0,
      bandYStart,
      image.width,
      bandHeight,
    ).data;

    // Extract dominant color
    const { r, g, b } = this.getDominantColor(imageData);

    return this.getColorName(r, g, b);
  }

  private getDominantColor(data: Uint8ClampedArray): {
    r: number;
    g: number;
    b: number;
  } {
    let rSum = 0,
      gSum = 0,
      bSum = 0,
      count = 0;

    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i]; // Red
      gSum += data[i + 1]; // Green
      bSum += data[i + 2]; // Blue
      count++;
    }

    return {
      r: Math.floor(rSum / count),
      g: Math.floor(gSum / count),
      b: Math.floor(bSum / count),
    };
  }

  private getColorName(r: number, g: number, b: number): string {
    if (r > 200 && g < 100 && b < 100) return 'Red';
    if (r < 100 && g > 200 && b < 100) return 'Green';
    if (r < 100 && g < 100 && b > 200) return 'Blue';
    if (r > 200 && g > 200 && b < 100) return 'Yellow';
    if (r > 200 && g < 100 && b > 200) return 'Magenta';
    if (r < 100 && g > 200 && b > 200) return 'Cyan';
    if (r > 150 && g > 150 && b > 150) return 'White';
    if (r < 50 && g < 50 && b < 50) return 'Black';
    return 'Unknown Color';
  }

  disposeModel() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      console.log('Model disposed.');
    }
  }
}
