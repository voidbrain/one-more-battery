import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageSignalService {
  selectedFile = signal<File | null>(null);
  isImageSelected = computed(() => !!this.selectedFile());
}
