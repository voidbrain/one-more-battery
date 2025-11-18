import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Brand } from '@interfaces/index';
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
  selector: 'app-brand-list',
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
          {{ isEditing ? 'Edit Brand' : 'Add Brand' }}
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-item>
          <ion-input
            label="Label"
            labelPlacement="floating"
            [(ngModel)]="currentBrand.label"
            placeholder="Enter brand label">
          </ion-input>
        </ion-item>
        <ion-button expand="block" (click)="saveBrand()">
          {{ isEditing ? 'Update Brand' : 'Add Brand' }}
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
          Brands ({{ brands.length }})
        </ion-card-title>
      </ion-card-header>
      <ion-card-content>
        <ion-list>
          @for (brand of brands; track brand.id) {
          <ion-item (click)="editBrand(brand)">
            <ion-label>{{ brand.label }}</ion-label>
            <ion-button slot="end" fill="clear" color="danger" (click)="confirmDelete(brand)">
              <ion-icon name="trash"></ion-icon>
            </ion-button>
          </ion-item>
          }
        </ion-list>
      </ion-card-content>
    </ion-card>

  `,
})
export class BrandListComponent {
  @Input() brands: Brand[] = [];
  @Output() dataChanged = new EventEmitter<void>();

  private sqlite = inject(Sqlite);
  private toast = inject(ToastService);
  private alertController = inject(AlertController);

  isEditing = false;

  currentBrand: Partial<Brand> = {
    label: '',
    deleted: 0,
    enabled: 1,
  };

  resetForm() {
    this.currentBrand = {
      label: '',
      deleted: 0,
      enabled: 1,
    };
    this.isEditing = false;
  }

  async saveBrand() {
    if (!this.currentBrand.label?.trim()) {
      this.toast.showWarning('Brand label is required');
      return;
    }

    try {
      if (this.isEditing && this.currentBrand.id) {
        // Update existing brand
        await this.sqlite.updateBrand(this.currentBrand.id, this.currentBrand.label);
        this.toast.showBrandUpdated();
      } else {
        // Add new brand
        await this.sqlite.insertBrand(this.currentBrand.label);
        this.toast.showBrandCreated();
      }

      this.resetForm();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error saving brand:', error);
      this.toast.showBrandSaveError();
    }
  }

  editBrand(brand: Brand) {
    this.currentBrand = { ...brand };
    this.isEditing = true;
  }

  cancelEdit() {
    this.resetForm();
  }

  async confirmDelete(brand: Brand) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete brand "${brand.label}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteBrand(brand);
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteBrand(brand: Brand) {
    try {
      await this.sqlite.deleteBrand(brand.id);
      this.toast.showBrandDeleted();
      this.dataChanged.emit();
    } catch (error) {
      console.error('Error deleting brand:', error);
      this.toast.showBrandDeleteError();
    }
  }
}
