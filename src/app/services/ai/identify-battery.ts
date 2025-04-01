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
  async loadModel() {
    try {
      await tf.setBackend('webgl');
      console.log('Loading model...');

      if (this.model) {
        this.model.dispose();
      }

  //     this.model = await tf.loadLayersModel('/assets/data/tfjs_files/model.json');
  //     console.log('Model loaded successfully');
  //   } catch (error) {
  //     console.error('Error loading model:', error);
  //   }
  // }

  async predictNumber(imageTensor: tf.Tensor3D): Promise<{ digit: number | null; confidence: number | null }> {
    if (!this.model) {
      console.error('Model is not loaded');
      return { digit: null, confidence: null };
    }

    const processedTensor = tf.tidy(() => {
      let tensor = imageTensor;

      // Ensure correct shape: Convert to grayscale if needed
      if (tensor.shape.length === 3 && tensor.shape[2] === 3) {
        tensor = tensor.mean(2).expandDims(-1); // Convert RGB to grayscale
      }

      // Resize, normalize, and reshape for model input
      tensor = tf.image.resizeBilinear(tensor, [28, 28]).div(255.0).reshape([1, 28, 28, 1]);

      return tensor;
    });

    const predictions = this.model.predict(processedTensor) as tf.Tensor;
    const probabilities = await predictions.data();
    const digit = probabilities.indexOf(Math.max(...probabilities));
    const confidence = probabilities[digit];

    processedTensor.dispose();
    predictions.dispose();

    return { digit, confidence };
  }

  async extractDigits(image: HTMLImageElement): Promise<tf.Tensor3D[]> {
    return tf.tidy(() => {
      const imgTensor = tf.browser.fromPixels(image);
      const grayscale = imgTensor.mean(2).expandDims(-1);

      // Normalize image
      const normalized = grayscale.div(255.0);

      // Apply thresholding
      const thresholded = normalized.greater(tf.scalar(0.5)).toFloat();

      // Visualize the original image
      tf.browser.toPixels(imgTensor).then((pixels) => {
        const canvas = document.createElement('canvas');
        canvas.width = imgTensor.shape[1];
        canvas.height = imgTensor.shape[0];
        canvas.getContext('2d')?.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);
        document.body.appendChild(canvas); // Append canvas to body
      });

      // Visualize the thresholded image
      tf.browser.toPixels(thresholded as tf.Tensor3D).then((pixels) => {
        const canvas = document.createElement('canvas');
        canvas.width = thresholded.shape[1] as number;
        canvas.height = thresholded.shape[0];
        canvas.getContext('2d')?.putImageData(new ImageData(pixels, canvas.width, canvas.height), 0, 0);
        document.body.appendChild(canvas); // Append canvas to body
      });

      // Get image dimensions
      const [height, width] = thresholded.shape;
      const step = Math.floor(height / 10); // Estimate digit size dynamically

      const boxes: tf.Tensor3D[] = [];
      for (let y = 0; y < height - step; y += step) {
        for (let x = 0; x < width - step; x += step) {
          let region = thresholded.slice([y, x, 1], [step, step]); // Extract region

          if (region.rank === 2) {
            region = region.expandDims(-1) as tf.Tensor3D; // Ensure Tensor3D format
          }

          // Convert scalar max to JavaScript number
          const maxVal = region.max();
          const maxValArray = maxVal.arraySync() as number; // Get max pixel value

          console.log(`Region at (${x}, ${y}) - Max Value:`, maxValArray); // Log max value

          if (maxValArray > 0) {
            boxes.push(region as tf.Tensor3D);
          } else {
            region.dispose(); // Dispose if not used
          }

          maxVal.dispose();
        }
      }

      imgTensor.dispose();
      grayscale.dispose();
      normalized.dispose();
      thresholded.dispose();

      return boxes;
    });
  }



  async processPhoto(image: HTMLImageElement): Promise<{ digit: number | null; confidence: number | null }[]> {
    const digits = await this.extractDigits(image);
    const results: { digit: number | null; confidence: number | null }[] = [];

    for (const digitTensor of digits) {
      results.push(await this.predictNumber(digitTensor));
      digitTensor.dispose();
    }

    return results;
  }

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
