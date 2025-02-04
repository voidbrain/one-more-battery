import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { MnistData } from './mnist_data.js'; // Adjust path as necessary
// import { After } from 'v8';


@Injectable({
  providedIn: 'root',
})
export class IdentifyBatteryService {
  private model: tf.LayersModel | null = null;
  private classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];


  initialize() {
    this.run();
  }


  async showExamples(data:any) {
    await tf.setBackend('cpu');
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
    console.log("run")
    const data = new MnistData();
    await data.load();
    await this.showExamples(data);

    const model = this.getModel();
    tfvis.show.modelSummary({name: 'Model Architecture', tab: 'Model'}, model);

    await this.train(model, data);
    console.log("trained")
    await this.showAccuracy(model, data);
    await this.showConfusion(model, data);
    console.log("show confusion")
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

  async train(model: any, data: any) {
    const metrics = ['loss', 'val_loss', 'acc', 'val_acc'];
    const container = {
      name: 'Model Training', tab: 'Model', styles: { height: '1000px' }
    };
    const fitCallbacks = tfvis.show.fitCallbacks(container, metrics);

    const BATCH_SIZE = 512;
    const TRAIN_DATA_SIZE = 5500;
    const TEST_DATA_SIZE = 1000;

    const [trainXs, trainYs] = tf.tidy(() => {
      const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
      return [
        d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
        d.labels
      ];
    });

    const [testXs, testYs] = tf.tidy(() => {
      const d = data.nextTestBatch(TEST_DATA_SIZE);
      return [
        d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
        d.labels
      ];
    });

    return model.fit(trainXs, trainYs, {
      batchSize: BATCH_SIZE,
      validationData: [testXs, testYs],
      epochs: 10,
      shuffle: true,
      callbacks: fitCallbacks
    });
  }

  getModel() {
    const model = tf.sequential();

    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const IMAGE_CHANNELS = 1;

    // In the first layer of our convolutional neural network we have
    // to specify the input shape. Then we specify some parameters for
    // the convolution operation that takes place in this layer.
    model.add(tf.layers.conv2d({
      inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));

    // The MaxPooling layer acts as a sort of downsampling using max values
    // in a region instead of averaging.
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    // Repeat another conv2d + maxPooling stack.
    // Note that we have more filters in the convolution.
    model.add(tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling'
    }));
    model.add(tf.layers.maxPooling2d({poolSize: [2, 2], strides: [2, 2]}));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten());

    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
    const NUM_OUTPUT_CLASSES = 10;
    model.add(tf.layers.dense({
      units: NUM_OUTPUT_CLASSES,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax'
    }));


    // Choose an optimizer, loss function and accuracy metric,
    // then compile and return the model
    const optimizer = tf.train.adam();
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  doPrediction(model: any, data: any, testDataSize = 500) {
    const IMAGE_WIDTH = 28;
    const IMAGE_HEIGHT = 28;
    const testData = data.nextTestBatch(testDataSize);
    const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1]);
    const labels = testData.labels.argMax(-1);
    const preds = model.predict(testxs).argMax(-1);

    testxs.dispose();
    return [preds, labels];
  }


  async showAccuracy(model: any, data: any) {
    const [preds, labels] = this.doPrediction(model, data);
    const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds);
    const container = {name: 'Accuracy', tab: 'Evaluation'};
    tfvis.show.perClassAccuracy(container, classAccuracy, this.classNames);

    labels.dispose();
  }

  async showConfusion(model: any, data: any) {
    const [preds, labels] = this.doPrediction(model, data);
    const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds);
    const container = {name: 'Confusion Matrix', tab: 'Evaluation'};
    tfvis.render.confusionMatrix(container, {values: confusionMatrix, tickLabels: this.classNames});

    labels.dispose();
  }
}
