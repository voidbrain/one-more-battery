import { Component, inject, signal, ViewChild, ElementRef, AfterViewInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslocoModule } from '@jsverse/transloco';
import { TrainMlService, TrainingConfig, TrainingData, TrainingMetrics } from '@services/ai/train-ml/train-ml.service';

@Component({
  selector: 'app-train-ml',
  templateUrl: './train-ml.component.html',
  styleUrls: ['./train-ml.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, TranslocoModule]
})
export class TrainMlComponent implements AfterViewInit, OnDestroy {
  private trainMlService = inject(TrainMlService);

  // Canvas references
  @ViewChild('visualizationCanvas', { static: false })
  canvas!: ElementRef<HTMLCanvasElement>;

  @ViewChild('metricsChartCanvas', { static: false })
  metricsChart!: ElementRef<HTMLCanvasElement>;

  @ViewChild('confusionMatrixCanvas', { static: false })
  confusionMatrixCanvas!: ElementRef<HTMLCanvasElement>;

  // Drag and drop state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private tempDragCoords = { x: 0, y: 0 };

  // Form inputs
  epochs = signal<number>(5); // How many times the network loops the training dataset
  learningRate = signal<number>(0.01); // How aggressively the network adjusts weights after each training
  batchSize = signal<number>(32); // How many training examples processed before updating weights
  trainingSamples = signal<number>(100);

  // Layers configuration (Input: 2, Hidden: 4, Output: 1)
  layers = signal<number[]>([2, 4, 1]);

  // Training data
  trainingData = signal<TrainingData[]>([]);

  // UI state
  isTraining = signal<boolean>(false);
  progress = signal<number>(0);
  metrics = signal<TrainingMetrics[]>([]);

  // Test prediction
  testInput = signal<{ x: number, y: number }>({ x: 0, y: 0 });
  prediction = signal<number | null>(null);

  // Confusion matrix for trained model
  confusionMatrix = signal<{
    truePos: number;
    trueNeg: number;
    falsePos: number;
    falseNeg: number;
    precision: number;
    recall: number;
    f1Score: number;
  }>({
    truePos: 0,
    trueNeg: 0,
    falsePos: 0,
    falseNeg: 0,
    precision: 0,
    recall: 0,
    f1Score: 0
  });

  // Getters for template access
  get testInputX(): number {
    return this.testInput().x;
  }

  setTestInputX(value: string): void {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      this.testInput.set({ ...this.testInput(), x: numValue });
      this.drawVisualization();
    }
  }

  get testInputY(): number {
    return this.testInput().y;
  }

  setTestInputY(value: string): void {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      this.testInput.set({ ...this.testInput(), y: numValue });
      this.drawVisualization();
    }
  }

  constructor() {
    // Generate initial training data
    this.generateTrainingData();

    // Watch for metrics changes and update chart
    effect(() => {
      const currentMetrics = this.metrics();
      if (currentMetrics && currentMetrics.length > 0) {
        // Update the chart when metrics change
        setTimeout(() => this.drawMetricsChart(), 100); // Small delay to ensure canvas is ready
      }
    });

    // Watch for trained model changes and compute confusion matrix
    effect(() => {
      const isTrained = this.isTrained;
      if (isTrained) {
        console.log('Model trained, computing confusion matrix...');
        // Small delay to ensure model is fully available
        setTimeout(() => this.computeAndDrawConfusionMatrix(), 500);
      }
    });
  }

  /**
   * Generate synthetic training data
   */
  generateTrainingData(): void {
    const samples = this.trainingSamples();
    const data = this.trainMlService.generateSyntheticData(samples);
    this.trainingData.set(data);
    console.log(`Generated ${samples} training samples`);

    // Log distribution of the generated data
    let insideCount = 0, outsideCount = 0;
    data.forEach(d => d.label === 0 ? insideCount++ : outsideCount++);
    console.log(`Training data distribution: ${insideCount} inside (${(insideCount / samples * 100).toFixed(1)}%), ${outsideCount} outside (${(outsideCount / samples * 100).toFixed(1)}%)`);
  }

  /**
   * Start training process
   */
  async startTraining(): Promise<void> {
    const config: TrainingConfig = {
      epochs: this.epochs(),
      learningRate: this.learningRate(),
      batchSize: this.batchSize(),
      layers: this.layers()
    };

    try {
      await this.trainMlService.startTraining(config, this.trainingData());
    } catch (error) {
      console.error('Training failed:', error);
    }
  }

  /**
   * Stop training process
   */
  stopTraining(): void {
    this.trainMlService.stopTraining();
  }

  /**
   * Make a prediction with trained model
   */
  async makePrediction(): Promise<void> {
    try {
      const features = [this.testInput().x, this.testInput().y];
      const result = await this.trainMlService.predict(features);
      this.prediction.set(result);
      this.drawVisualization(); // Redraw after prediction
    } catch (error) {
      console.error('Prediction failed:', error);
      this.prediction.set(null);
    }
  }

  /**
   * Test a known coordinate point
   */
  async testKnownPoint(x: number, y: number): Promise<void> {
    // Set the coordinates
    this.testInput.set({ x, y });

    // Auto-run prediction
    await this.makePrediction();

    // Update canvas
    this.drawVisualization();

    console.log(`Testing known point: (${x}, ${y})`);
  }

  /**
   * Handle X coordinate input changes
   */
  updateXCoord(event: Event): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (event as any).target?.value;
    if (value !== undefined) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        this.testInput.set({ ...this.testInput(), x: numValue });
        this.drawVisualization();
      }
    }
  }

  /**
   * Handle Y coordinate input changes
   */
  updateYCoord(event: Event): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (event as any).target?.value;
    if (value !== undefined) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        this.testInput.set({ ...this.testInput(), y: numValue });
        this.drawVisualization();
      }
    }
  }

  /**
   * Update training data on parameter change
   */
  onSamplesChanged(): void {
    this.generateTrainingData();
  }

  /**
   * Angular lifecycle: Initialize canvas drawing
   */
  ngAfterViewInit(): void {
    // Canvas might not be immediately available, try multiple times
    this.initializeCanvas();
  }

  /**
   * Initialize canvas when available
   */
  private initializeCanvas(): void {
    if (this.canvas) {
      this.drawVisualization();
      this.bindCanvasEvents();
      this.drawMetricsChart(); // Also draw initial metrics chart
      this.computeAndDrawConfusionMatrix(); // Also compute and draw confusion matrix
    } else {
      // Retry after a short delay (canvas might not be rendered yet)
      setTimeout(() => this.initializeCanvas(), 100);
    }
  }

  /**
   * Compute confusion matrix from training data
   */
  private async computeConfusionMatrix(): Promise<void> {
    if (!this.isTrained) {
      return;
    }

    let truePos = 0;  // Inside, predicted Inside
    let trueNeg = 0;  // Outside, predicted Outside
    let falsePos = 0; // Inside, predicted Outside
    let falseNeg = 0; // Outside, predicted Inside

    const trainingData = this.trainingData();

    for (const sample of trainingData) {
      try {
        const prediction = await this.trainMlService.predict(sample.features);
        const actual = sample.label;

        if (actual === 0) { // Inside (Positive class)
          if (prediction === 0) {
            truePos++;  // Correct positive prediction
          } else {
            falseNeg++; // Failed to detect positive (False Negative)
          }
        } else { // Outside (Negative class)
          if (prediction === 1) {
            trueNeg++;  // Correct negative prediction
          } else {
            falsePos++; // Falsely predicted positive (False Positive)
          }
        }
      } catch (error) {
        // Skip failed predictions
        continue;
      }
    }

    // Calculate derived metrics
    const precision = truePos / (truePos + falsePos) || 0;
    const recall = truePos / (truePos + falseNeg) || 0;
    const f1Score = (precision + recall > 0) ? 2 * precision * recall / (precision + recall) : 0;

    this.confusionMatrix.set({
      truePos,
      trueNeg,
      falsePos,
      falseNeg,
      precision,
      recall,
      f1Score
    });
  }

  /**
   * Compute and draw confusion matrix
   */
  private async computeAndDrawConfusionMatrix(): Promise<void> {
    console.log(1)
    if (this.isTrained) {
      console.log(2)
      await this.computeConfusionMatrix();
      this.drawConfusionMatrix();
    }
  }

  /**
   * Draw the confusion matrix visualization
   */
  private drawConfusionMatrix(): void {
    if (!this.confusionMatrixCanvas) {
      return;
    }

    const canvasElement = this.confusionMatrixCanvas.nativeElement;
    const ctx = canvasElement.getContext('2d');

    if (!ctx) {
      return;
    }

    const width = canvasElement.width;
    const height = canvasElement.height;
    const cellWidth = width / 2;
    const cellHeight = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    const matrix = this.confusionMatrix();

    // Draw cells
    const cells = [
      { row: 0, col: 0, value: matrix.truePos, label: 'True Pos (🎯)', color: '#00aa00' },
      { row: 0, col: 1, value: matrix.falsePos, label: 'False Pos (❌)', color: '#ffaa00' },
      { row: 1, col: 0, value: matrix.falseNeg, label: 'False Neg (💔)', color: '#ff4444' },
      { row: 1, col: 1, value: matrix.trueNeg, label: 'True Neg (✅)', color: '#4444ff' }
    ];

    cells.forEach(cell => {
      const x = cell.col * cellWidth;
      const y = cell.row * cellHeight;

      // Draw cell background with intensity based on value
      const total = matrix.truePos + matrix.trueNeg + matrix.falsePos + matrix.falseNeg;
      const intensity = total > 0 ? cell.value / total : 0;
      const alpha = 0.3 + (intensity * 0.7);

      ctx.fillStyle = cell.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(x, y, cellWidth, cellHeight);

      // Draw cell border
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cellWidth, cellHeight);

      // Draw count
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(cell.value.toString(), x + cellWidth / 2, y + cellHeight / 2 - 5);

      // Draw label
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(cell.label.split(' ')[0], x + cellWidth / 2, y + cellHeight / 2 + 12);

      // Draw label continuation on next line
      const labelParts = cell.label.split(' ');
      if (labelParts.length > 1) {
        const remaining = labelParts.slice(1).join(' ');
        ctx.fillText(remaining, x + cellWidth / 2, y + cellHeight / 2 + 27);
      }
    });

    // Draw axis labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';

    // Predicted labels
    ctx.fillText('Predicted Inside', cellWidth / 2, 15);
    ctx.fillText('Predicted Outside', cellWidth * 1.5, 15);

    // Actual labels
    ctx.save();
    ctx.translate(0, cellHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Actually Inside', -cellHeight / 2, -10);
    ctx.restore();

    ctx.save();
    ctx.translate(0, cellHeight * 1.5);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Actually Outside', -cellHeight / 2, -10);
    ctx.restore();
  }

  /**
   * Draw the training metrics evolution chart
   */
  private drawMetricsChart(): void {
    if (!this.metricsChart) {
      return;
    }

    const canvasElement = this.metricsChart.nativeElement;
    const ctx = canvasElement.getContext('2d');

    if (!ctx) {
      return;
    }

    const width = canvasElement.width;
    const height = canvasElement.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    const metrics = this.metrics();
    if (!metrics || metrics.length === 0) {
      // Draw placeholder message
      ctx.fillStyle = '#888';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for training data...', width / 2, height / 2);
      return;
    }

    // Calculate data ranges
    const epochs = metrics.map(m => m.epoch);
    const losses = metrics.map(m => m.loss);

    const minLoss = Math.min(...losses);
    const maxLoss = Math.max(...losses);
    const minAccuracy = 0; // Accuracy is 0-1, but we show it as percentage
    const maxAccuracy = 1;

    // Add some padding to the ranges
    const lossRange = maxLoss - minLoss;
    const lossPadding = lossRange * 0.1;
    const actualMinLoss = Math.max(0, minLoss - lossPadding);
    const actualMaxLoss = maxLoss + lossPadding;

    // Draw grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;

    // Vertical grid lines (epochs)
    const numEpochs = epochs.length;
    for (let i = 0; i <= numEpochs; i += Math.max(1, Math.floor(numEpochs / 10))) {
      const x = padding + (i / Math.max(1, numEpochs - 1)) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      // Epoch labels
      if (i < numEpochs) {
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(epochs[i].toString(), x, height - padding + 15);
      }
    }

    // Horizontal grid lines (loss values)
    for (let i = 0; i <= 5; i++) {
      const y1 = padding + (i / 5) * chartHeight;
      const y2 = padding + ((i + 1) / 5) * chartHeight; // For accuracy scale

      // Loss grid lines (left side)
      ctx.beginPath();
      ctx.moveTo(padding, y1);
      ctx.lineTo(width - padding, y1);
      ctx.stroke();

      // Loss labels (left side)
      const lossValue = actualMinLoss + (actualMaxLoss - actualMinLoss) * (1 - i / 5);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(lossValue.toFixed(3), padding - 5, y1 + 3);

      // Accuracy grid lines and labels (right side)
      ctx.strokeStyle = '#444';
      ctx.beginPath();
      ctx.moveTo(padding, y2);
      ctx.lineTo(width - padding, y2);
      ctx.stroke();

      const accuracyValue = minAccuracy + (maxAccuracy - minAccuracy) * (i / 5);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.fillText((accuracyValue * 100).toFixed(0) + '%', width - padding + 5, y2 + 3);
    }

    // Draw loss line (red)
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.beginPath();

    metrics.forEach((metric, index) => {
      const x = padding + (index / Math.max(1, metrics.length - 1)) * chartWidth;
      const y = padding + ((actualMaxLoss - metric.loss) / (actualMaxLoss - actualMinLoss)) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw accuracy line (blue)
    ctx.strokeStyle = '#4444ff';
    ctx.lineWidth = 2;
    ctx.beginPath();

    metrics.forEach((metric, index) => {
      const x = padding + (index / Math.max(1, metrics.length - 1)) * chartWidth;
      const y = padding + (chartHeight - (metric.accuracy / maxAccuracy) * chartHeight);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw legend
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    // Loss legend
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(width - 120, 10, 15, 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('Loss (Red)', width - 100, 15);

    // Accuracy legend
    ctx.fillStyle = '#4444ff';
    ctx.fillRect(width - 120, 25, 15, 2);
    ctx.fillStyle = '#fff';
    ctx.fillText('Accuracy (Blue)', width - 100, 30);
  }

  /**
   * Angular lifecycle: Cleanup
   */
  ngOnDestroy(): void {
    this.trainMlService.unload();
    this.unbindCanvasEvents();
  }

  /**
   * Bind mouse event handlers to canvas
   */
  private bindCanvasEvents(): void {
    console.log("bindCanvasEvents")
    if (this.canvas) {
      console.log("canvas")
      const canvasElement = this.canvas.nativeElement;
      canvasElement.addEventListener('mousedown', this.onCanvasMouseDown.bind(this));
      canvasElement.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
      canvasElement.addEventListener('mouseup', this.onCanvasMouseUp.bind(this));
      canvasElement.addEventListener('mouseleave', this.onCanvasMouseUp.bind(this));
    }
  }

  /**
   * Unbind mouse event handlers from canvas
   */
  private unbindCanvasEvents(): void {
    if (this.canvas) {
      const canvasElement = this.canvas.nativeElement;
      canvasElement.removeEventListener('mousedown', this.onCanvasMouseDown.bind(this));
      canvasElement.removeEventListener('mousemove', this.onCanvasMouseMove.bind(this));
      canvasElement.removeEventListener('mouseup', this.onCanvasMouseUp.bind(this));
      canvasElement.removeEventListener('mouseleave', this.onCanvasMouseUp.bind(this));
    }
  }

  /**
   * Check if mouse is within test point area
   */
  private isMouseOnPoint(mouseX: number, mouseY: number): boolean {

    const canvasElement = this.canvas.nativeElement;
    const testX = this.testInputX;
    const testY = this.testInputY;

    const width = canvasElement.width;
    const height = canvasElement.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Convert test coordinates to canvas coordinates
    const pointCanvasX = centerX + (testX * (width / 2 - 30));
    const pointCanvasY = centerY - (testY * (height / 2 - 30));

    // Check if mouse is within 15 pixels of point center
    const distance = Math.sqrt((mouseX - pointCanvasX) ** 2 + (mouseY - pointCanvasY) ** 2);
    return distance <= 15;
  }

  /**
   * Convert canvas coordinates to mathematical coordinates
   */
  private canvasToMathCoords(canvasX: number, canvasY: number): { x: number; y: number } {
    const canvasElement = this.canvas.nativeElement;
    const width = canvasElement.width;
    const height = canvasElement.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Convert to mathematical coordinates
    const mathX = (canvasX - centerX) / (width / 2 - 30);
    const mathY = (centerY - canvasY) / (height / 2 - 30); // Y axis inverted

    // Clamp to valid range
    const clampedX = Math.max(-1, Math.min(1, mathX));
    const clampedY = Math.max(-1, Math.min(1, mathY));

    return { x: clampedX, y: clampedY };
  }

  /**
   * Handle mouse down on canvas (start drag)
   */
  private onCanvasMouseDown(event: MouseEvent): void {
    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (this.isMouseOnPoint(mouseX, mouseY)) {
      this.isDragging = true;
      this.dragStartX = mouseX;
      this.dragStartY = mouseY;
      event.preventDefault();
    }
  }

  /**
   * Handle mouse move on canvas (drag point)
   */
  private onCanvasMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Convert canvas coordinates to mathematical coordinates
      const mathCoords = this.canvasToMathCoords(mouseX, mouseY);

      // Store temporarily during drag (avoiding ngModel conflicts)
      this.tempDragCoords = mathCoords;

      // Redraw canvas with temporary coordinates
      this.drawVisualization(true);
    }
  }

  /**
   * Handle mouse up on canvas (end drag)
   */
  private onCanvasMouseUp(): void {
    if (this.isDragging) {
      // Commit the dragged coordinates to the signal
      this.testInput.set(this.tempDragCoords);
      this.isDragging = false;
      this.makePrediction();
    }
  }

  /**
   * Draw the visualization canvas showing the circle boundary and test point
   */
  private drawVisualization(useTempCoords = false): void {
    if (!this.canvas) {
      return;
    }

    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');

    if (!ctx) {
      return;
    }

    const width = canvasElement.width;
    const height = canvasElement.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw coordinate system background
    ctx.fillStyle = '#1a1a1a'; // Dark background
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = 0; x <= width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Draw coordinate labels
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // X-axis labels
    const xValues = [-1, -0.5, 0, 0.5, 1];
    xValues.forEach(value => {
      const canvasXPos = centerX + (value * (width / 2 - 30));
      const textY = centerY + 20; // Below X-axis

      ctx.fillText(value.toString(), canvasXPos, textY);
    });

    // Y-axis labels
    const yValues = [-1, -0.5, 0, 0.5, 1];
    ctx.textAlign = 'end';
    yValues.forEach(value => {
      const canvasYPos = centerY - (value * (height / 2 - 30)); // Note: Y inversion
      const textX = centerX - 10; // Left of Y-axis

      ctx.fillText(value.toString(), textX, canvasYPos + 4);
    });

    // Draw circle boundary (radius 0.5 in coordinate system)
    const circleRadius = (0.5 / 1) * (Math.min(width, height) / 2 - 20); // Scale to canvas

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Fill circle area with semi-transparent color
    ctx.fillStyle = 'rgba(0, 100, 200, 0.2)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw test point
    const testX = useTempCoords ? this.tempDragCoords.x : this.testInputX;
    const testY = useTempCoords ? this.tempDragCoords.y : this.testInputY;

    // Convert coordinates: X: -1 to 1, Y: -1 to 1 -> canvas coordinates
    const canvasX = centerX + (testX * (width / 2 - 30));
    const canvasY = centerY - (testY * (height / 2 - 30)); // Y axis inverted

    // Draw point
    const pointColor = this.prediction() === 0 ? '#00ff00' : this.prediction() === 1 ? '#ff4444' : '#ffff00';
    ctx.fillStyle = pointColor;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw crosshairs at point location
    ctx.strokeStyle = pointColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, canvasY);
    ctx.lineTo(width, canvasY);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, height);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  /**
   * Get training config object
   */
  getTrainingConfig(): TrainingConfig {
    return {
      epochs: this.epochs(),
      learningRate: this.learningRate(),
      batchSize: this.batchSize(),
      layers: this.layers()
    };
  }

  // Get model training status
  get isModelTrained(): boolean {
    return this.trainMlService.trainedModel() !== null;
  }

  // Public getter for template access
  get isTrained(): boolean {
    return this.trainMlService.trainedModel() !== null;
  }
}
