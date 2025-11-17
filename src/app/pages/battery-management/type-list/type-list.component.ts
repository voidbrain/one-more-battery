import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BatteryType } from '@interfaces/index';
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
  selector: 'app-type-list',
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
          {{ isEditing ? 'Edit Type' : 'Add Type' }}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-item>
          <ion-input
            label="Label"
            labelPlacement="floating"
            [(ngModel)]="currentType.label"
            placeholder="Enter type label">
          </ion-input>
        </ion-item>
        <ion-button expand="block" (click)="saveType()">
          {{ isEditing ? 'Update Type' : 'Add Type' }}
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
          Types ({{ types.length }})
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          @for (type of types; track type.id) {
          <ion-item (click)="editType(type)">
            <ion-label>{{ type.label }}</ion-label>
            <ion-button slot="end" fill="clear" color="danger" (click)="confirmDelete(type)">
              <ion-icon name="trash"></ion-icon>
            </ion-button>
          </ion-item>
          }
        </ion-list>
      </ion-card-content>
    </ion-card>

  `,
})
export class TypeListComponent {
  @Input() types: BatteryType[] = [];
  @Output() dataChanged = new EventEmitter<void>();

  private sqlite = inject(Sqlite);
  private toast = inject(ToastService);
  private alertController = inject(AlertController);

  isEditing = false;

  currentType: Partial<BatteryType> = {
    label: '',
    deleted: 0,
    enabled: 1,
  };

  resetForm() {
    this.currentType = {
      label: '',
      deleted: 0,
      enabled: 1,
    };
    this.isEditing = false;
  }

  async saveType() {
    if (!this.currentType.label?.trim()) {
      this.toast.showWarning('Type label is required');
      return;
    }

    try {
      if (this.isEditing && this.currentType.id) {
        // Update existing type
        await this.sqlite.updateType(this.currentType.id, this.currentType.label);
        this.toast.showTypeUpdated();
      } else {
        // Add new type
        await this.sqlite.insertType(this.currentType.label);
        this.toast.showTypeCreated();
      }

      this.resetForm();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error saving type:', error);
      this.toast.showTypeSaveError();
    }
  }

  editType(type: BatteryType) {
    this.currentType = { ...type };
    this.isEditing = true;
  }

  cancelEdit() {
    this.resetForm();
  }

  async confirmDelete(type: BatteryType) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete type "${type.label}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteType(type);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteType(type: BatteryType) {
    try {
      await this.sqlite.deleteType(type.id);
      this.toast.showTypeDeleted();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error deleting type:', error);
      this.toast.showTypeDeleteError();
    }
  }
}
