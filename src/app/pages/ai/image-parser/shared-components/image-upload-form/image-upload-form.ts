import { Component, computed, inject, output, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { ImageService } from '@services/utils/image.service';

@Component({
  selector: 'app-image-upload-form',
  templateUrl: './image-upload-form.html',
  styleUrls: ['./image-upload-form.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class ImageUploadFormComponent {
  private ImageService = inject(ImageService);

  imageSelected = output<File>();
  selectedFile = signal<File | null>(null);
  isImageSelected = computed(() => !!this.selectedFile());

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile.set(file);
      this.imageSelected.emit(file);
      this.ImageService.selectedFile.set(file); // Update service

    }
  }
}
