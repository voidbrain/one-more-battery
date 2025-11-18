import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Series } from '@interfaces/index';
import { TranslocoModule } from '@jsverse/transloco';
import { Sqlite } from '@services/database/database.service';
import { ToastService } from '@services/ui/toast';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-series-list',
  imports: [
    CommonModule,
    FormsModule,
    TranslocoModule,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonInput,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
  template: `
    <ion-card class="glass-card">
      <ion-card-header>
        <ion-card-title style="color: var(--ion-color-primary); font-weight: 600;">
          {{ isEditing ? 'Edit Series' : 'Add Series' }}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-item>
          <ion-input
            label="Label"
            labelPlacement="floating"
            [(ngModel)]="currentSeries.label"
            placeholder="Enter series label">
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            label="Color"
            labelPlacement="floating"
            type="color"
            [(ngModel)]="currentSeries.color"
            placeholder="Select color">
          </ion-input>
        </ion-item>
        <ion-button expand="block" (click)="saveSeries()">
          {{ isEditing ? 'Update Series' : 'Add Series' }}
        </ion-button>
        @if (isEditing) {
        <ion-button expand="block" fill="outline" (click)="cancelEdit()">
          Cancel
        </ion-button>
        }
      </ion-card-content>
    </ion-card>

    <ion-card class="glass-card">
      <ion-card-header>
        <ion-card-title style="color: var(--ion-color-primary); font-weight: 600;">
          Series ({{ series.length }})
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          @for (seriesItem of series; track seriesItem.id) {
          <ion-item (click)="editSeries(seriesItem)">
            <ion-label>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div
                  style="width: 20px; height: 20px; border-radius: 50%; background-color: {{ seriesItem.color }}; border: 1px solid #ccc;">
                </div>
                {{ seriesItem.label }}
              </div>
            </ion-label>
            <ion-button slot="end" fill="clear" color="danger" (click)="confirmDelete(seriesItem)">
              <ion-icon name="trash"></ion-icon>
            </ion-button>
          </ion-item>
          }
        </ion-list>
      </ion-card-content>
    </ion-card>

  `,
})
export class SeriesListComponent {
  @Input() series: Series[] = [];
  @Output() dataChanged = new EventEmitter<void>();

  private sqlite = inject(Sqlite);
  private toast = inject(ToastService);
  private alertController = inject(AlertController);

  isEditing = false;

  currentSeries: Partial<Series> = {
    label: '',
    color: '#000000',
    deleted: 0,
    enabled: 1,
  };

  resetForm() {
    this.currentSeries = {
      label: '',
      color: '#000000',
      deleted: 0,
      enabled: 1,
    };
    this.isEditing = false;
  }

  async saveSeries() {
    if (!this.currentSeries.label?.trim()) {
      this.toast.showWarning('Series label is required');
      return;
    }

    try {
      if (this.isEditing && this.currentSeries.id) {
        // Update existing series
        await this.sqlite.updateSeries(this.currentSeries.id, this.currentSeries.label, this.currentSeries.color || '#000000');
        this.toast.showSeriesUpdated();
      } else {
        // Add new series
        await this.sqlite.insertSeries(this.currentSeries.label, this.currentSeries.color || '#000000');
        this.toast.showSeriesCreated();
      }

      this.resetForm();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error saving series:', error);
      this.toast.showSeriesSaveError();
    }
  }

  editSeries(series: Series) {
    this.currentSeries = { ...series };
    this.isEditing = true;
  }

  cancelEdit() {
    this.resetForm();
  }

  async confirmDelete(series: Series) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete series "${series.label}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteSeries(series);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteSeries(series: Series) {
    try {
      await this.sqlite.deleteSeries(series.id);
      this.toast.showSeriesDeleted();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error deleting series:', error);
      this.toast.showSeriesDeleteError();
    }
  }
}
