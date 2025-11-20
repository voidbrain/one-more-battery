import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  selectedFile = signal<File | null>(null);
  isImageSelected = computed(() => !!this.selectedFile());
  processedImage = signal<string | null>(null);


}
