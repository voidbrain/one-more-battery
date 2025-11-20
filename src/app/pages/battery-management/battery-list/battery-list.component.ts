import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Battery, Brand, Series, BatteryType } from '@interfaces/index';
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
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-battery-list',
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
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
  template: `
    <ion-card class="ion-card-primary glass-card">
      <ion-card-header>
        <ion-card-title style="color: var(--ion-color-primary); font-weight: 600;">
          {{ isEditing ? 'Edit Battery' : 'Add Battery' }}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-item>
          <ion-input
            label="Label"
            labelPlacement="floating"
            [(ngModel)]="currentBattery.label"
            placeholder="Enter battery label"
          >
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-select
            label="Brand"
            labelPlacement="floating"
            [(ngModel)]="currentBattery.brandId"
            placeholder="Select brand"
          >
            @for (brand of brands; track brand.id) {
              <ion-select-option [value]="brand.id">
                {{ brand.label }}
              </ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select
            label="Series"
            labelPlacement="floating"
            [(ngModel)]="currentBattery.seriesId"
            placeholder="Select series"
          >
            @for (series of series; track series.id) {
              <ion-select-option [value]="series.id">
                {{ series.label }}
              </ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-select
            label="Type"
            labelPlacement="floating"
            [(ngModel)]="currentBattery.typeId"
            placeholder="Select type"
          >
            @for (type of types; track type.id) {
              <ion-select-option [value]="type.id">
                {{ type.label }}
              </ion-select-option>
            }
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-input
            label="Model"
            labelPlacement="floating"
            [(ngModel)]="currentBattery.model"
            placeholder="Enter model"
          >
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            label="Cells"
            labelPlacement="floating"
            type="number"
            [(ngModel)]="currentBattery.cellsNumber"
            placeholder="Enter cell count"
          >
          </ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            label="mA"
            labelPlacement="floating"
            type="number"
            [(ngModel)]="currentBattery.mA"
            placeholder="Enter mA"
          >
          </ion-input>
        </ion-item>
        <ion-button expand="block" (click)="saveBattery()">
          {{ isEditing ? 'Update Battery' : 'Add Battery' }}
        </ion-button>
        @if (isEditing) {
          <ion-button expand="block" fill="outline" (click)="cancelEdit()"> Cancel </ion-button>
        }
      </ion-card-content>
    </ion-card>

    <ion-card class="glass-card">
      <ion-card-header>
        <ion-card-title style="color: var(--ion-color-primary); font-weight: 600;">
          Batteries ({{ batteries.length }})
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          @for (battery of batteries; track battery.id) {
            <ion-item (click)="editBattery(battery)">
              <ion-label>
                <h3>{{ battery.label }}</h3>
                <p>
                  {{ getBrandName(battery.brandId) }} - {{ getSeriesName(battery.seriesId) }} -
                  {{ getTypeName(battery.typeId) }}
                </p>
                <p>{{ battery.model }} - {{ battery.cellsNumber }} cells - {{ battery.mA }}mA</p>
              </ion-label>
              <ion-button slot="end" fill="clear" color="danger" (click)="confirmDelete(battery)">
                <ion-icon name="trash"></ion-icon>
              </ion-button>
            </ion-item>
          }
        </ion-list>
      </ion-card-content>
    </ion-card>
  `,
})
export class BatteryListComponent {
  @Input() batteries: Battery[] = [];
  @Input() brands: Brand[] = [];
  @Input() series: Series[] = [];
  @Input() types: BatteryType[] = [];
  @Output() dataChanged = new EventEmitter<void>();

  private sqlite = inject(Sqlite);
  private toast = inject(ToastService);
  private alertController = inject(AlertController);

  isEditing = false;

  currentBattery: Partial<Battery> = {
    label: '',
    brandId: 0,
    seriesId: 0,
    typeId: 0,
    model: '',
    cellsNumber: 0,
    mA: 0,
    date: new Date().toISOString().split('T')[0],
    deleted: 0,
    enabled: 1,
  };

  resetForm() {
    this.currentBattery = {
      label: '',
      brandId: 0,
      seriesId: 0,
      typeId: 0,
      model: '',
      cellsNumber: 0,
      mA: 0,
      date: new Date().toISOString().split('T')[0],
      deleted: 0,
      enabled: 1,
    };
    this.isEditing = false;
  }

  async saveBattery() {
    if (!this.currentBattery.label?.trim()) {
      this.toast.showWarning('Battery label is required');
      return;
    }

    try {
      const batteryData = {
        brandId: this.currentBattery.brandId || 0,
        seriesId: this.currentBattery.seriesId || 0,
        typeId: this.currentBattery.typeId || 0,
        cellsNumber: this.currentBattery.cellsNumber || 0,
        date: this.currentBattery.date || new Date().toISOString().split('T')[0],
        label: this.currentBattery.label,
        mA: this.currentBattery.mA || 0,
        model: this.currentBattery.model || '',
        deleted: 0,
        enabled: 1,
      };

      if (this.isEditing && this.currentBattery.id) {
        // Update existing battery
        await this.sqlite.updateBattery(this.currentBattery.id, batteryData);
        this.toast.showBatteryUpdated();
      } else {
        // Add new battery
        await this.sqlite.insertBattery(batteryData);
        this.toast.showBatteryCreated();
      }

      this.resetForm();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error saving battery:', error);
      this.toast.showBatterySaveError();
    }
  }

  editBattery(battery: Battery) {
    this.currentBattery = { ...battery };
    this.isEditing = true;
  }

  cancelEdit() {
    this.resetForm();
  }

  async confirmDelete(battery: Battery) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete battery "${battery.label}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteBattery(battery);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteBattery(battery: Battery) {
    try {
      await this.sqlite.deleteBattery(battery.id);
      this.toast.showBatteryDeleted();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error deleting battery:', error);
      this.toast.showBatteryDeleteError();
    }
  }

  getBrandName(brandId: number): string {
    return this.brands.find((b) => b.id === brandId)?.label || 'Unknown';
  }

  getSeriesName(seriesId: number): string {
    return this.series.find((s) => s.id === seriesId)?.label || 'Unknown';
  }

  getTypeName(typeId: number): string {
    return this.types.find((t) => t.id === typeId)?.label || 'Unknown';
  }
}
