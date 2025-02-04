import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import { Injectable, AfterViewInit } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
//import { MnistData } from './mnist_data.js'; // Adjust path as necessary
// import { After } from 'v8';


@Injectable({
  providedIn: 'root',
})
export class IdentifyBatteryService implements AfterViewInit {
  private model: tf.LayersModel | null = null;

  constructor(

  ) {
    // this.loadModel();
  }

  ngAfterViewInit() {
    this.run();
  }

  async showExamples(data:any) {
    // Create a container in the visor
    const surface =
      tfvis.visor().surface({ name: 'Input Data Examples', tab: 'Input Data'});

    // Get the examples
    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];

    // Create a canvas element to render each example
    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tf.tidy(() => {
        // Reshape the image to 28x28 px
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });

      const canvas = document.createElement('canvas');
      canvas.width = 28;
      canvas.height = 28;

      await tf.browser.toPixels(imageTensor, canvas);
      surface.drawArea.appendChild(canvas);

      imageTensor.dispose();
    }
  }

  async run() {
    // const data = new MnistData();
    // await data.load();
    // await this.showExamples(data);
  }


  // async loadModel() {
  //   try {
  //     await tf.setBackend('cpu');
  //     console.log('Loading model...');

  //     // Dispose of old model before loading a new one
  //     if (this.model) {
  //       this.model.dispose();
  //       this.model = null;
  //     }

  //     this.model = await tf.loadLayersModel('/assets/data/tfjs_files/model.json');
  //     console.log('Model loaded successfully');
  //   } catch (error) {
  //     console.error('Error loading model:', error);
  //   }
  // }

  // async processPhoto(image: HTMLImageElement): Promise<{ digit: number | null; color: string | null;  confidence: number | null  } | null> {

  //   if (!this.model) {
  //     console.error('Model not loaded');
  //     return null;
  //   }

  //   console.log("Processing photo...");

  //   // Convert the image into a tensor for digit recognition
  //   const digitTensor = tf.browser
  //     .fromPixels(image, 1) // Convert image to grayscale
  //     .resizeBilinear([28, 28]) // Resize to 28x28 (MNIST input size)
  //     .toFloat()
  //     .div(tf.scalar(255)) // Normalize pixel values between 0 and 1
  //     .expandDims(0); // Add batch dimension

  //   // Predict digit
  //   const predictions = this.model!.predict(digitTensor) as tf.Tensor;
  //   const probabilities = predictions.dataSync(); // Get confidence scores
  //   const digit = predictions.argMax(1).dataSync()[0]; // Get predicted digit
  //   const confidence = probabilities[digit];

  //   // Extract color from the band
  //   const color = this.extractColorBand(image);

  //   digitTensor.dispose(); // Free memory

  //   console.log("Processing completed:", { digit, confidence, color });
  //   return { digit, confidence, color };
  // }

  // private extractColorBand(image: HTMLImageElement): string | null {
  //   const canvas = document.createElement('canvas');
  //   const ctx = canvas.getContext('2d');

  //   if (!ctx) {
  //     console.error('Canvas context not supported');
  //     return null;
  //   }

  //   canvas.width = image.width;
  //   canvas.height = image.height;
  //   ctx.drawImage(image, 0, 0, image.width, image.height);

  //   // Define the area where the color band is expected (e.g., bottom of the image)
  //   const bandYStart = Math.floor(image.height * 0.75); // Bottom 25% of the image
  //   const bandHeight = Math.floor(image.height * 0.2); // 20% of height

  //   // Get pixel data from the selected area
  //   const imageData = ctx.getImageData(0, bandYStart, image.width, bandHeight).data;

  //   // Extract dominant color
  //   const { r, g, b } = this.getDominantColor(imageData);

  //   return this.getColorName(r, g, b);
  // }

  // private getDominantColor(data: Uint8ClampedArray): { r: number; g: number; b: number } {
  //   let rSum = 0, gSum = 0, bSum = 0, count = 0;

  //   for (let i = 0; i < data.length; i += 4) {
  //     rSum += data[i];     // Red
  //     gSum += data[i + 1]; // Green
  //     bSum += data[i + 2]; // Blue
  //     count++;
  //   }

  //   return {
  //     r: Math.floor(rSum / count),
  //     g: Math.floor(gSum / count),
  //     b: Math.floor(bSum / count),
  //   };
  // }

  // private getColorName(r: number, g: number, b: number): string {
  //   if (r > 200 && g < 100 && b < 100) return 'Red';
  //   if (r < 100 && g > 200 && b < 100) return 'Green';
  //   if (r < 100 && g < 100 && b > 200) return 'Blue';
  //   if (r > 200 && g > 200 && b < 100) return 'Yellow';
  //   if (r > 200 && g < 100 && b > 200) return 'Magenta';
  //   if (r < 100 && g > 200 && b > 200) return 'Cyan';
  //   if (r > 150 && g > 150 && b > 150) return 'White';
  //   if (r < 50 && g < 50 && b < 50) return 'Black';
  //   return 'Unknown Color';
  // }

  // disposeModel() {
  //   if (this.model) {
  //     this.model.dispose();
  //     this.model = null;
  //     console.log('Model disposed.');
  //   }
  // }
}
