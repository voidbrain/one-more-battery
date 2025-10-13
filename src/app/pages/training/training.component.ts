import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class TrainingComponent implements OnDestroy {
  public trainingLog: string[] = [];
  private worker: Worker | null = null;

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(new URL('./training.worker', import.meta.url));
      this.worker.onmessage = ({ data }) => {
        if (data.type === 'log') {
          this.trainingLog.push(data.message);
        } else if (data.type === 'done') {
          this.trainingLog.push('Model saved to IndexedDB.');
        }
      };
    } else {
      this.trainingLog.push('Web workers are not supported in this browser.');
    }
  }

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }

  train() {
    if (this.worker) {
      this.trainingLog = [];
      this.worker.postMessage({});
    }
  }

  async saveModel() {
    // The model is now saved in the worker.
    // This function could be used to trigger a download from IndexedDB if needed.
    this.trainingLog.push('Model is saved in IndexedDB by the worker.');
  }
}
