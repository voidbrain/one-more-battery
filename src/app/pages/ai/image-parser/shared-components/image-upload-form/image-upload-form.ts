import { Component, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-image-upload-form',
  templateUrl: './image-upload-form.html',
  styleUrls: ['./image-upload-form.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, TranslocoModule],
})
export class ImageUploadFormComponent {
  isDetectorLoaded = input<boolean>(false);
  imageSelected = output<File>();

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.imageSelected.emit(file);
    }
  }
}
