import { Component, input, output } from '@angular/core';
import { IonicModule } from '@ionic/angular';


@Component({
  selector: 'app-selected-image',
  templateUrl: './selected-image.component.html',
  styleUrls: ['./selected-image.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class SelectedImageComponent {
  selectedImage = input<string | null>(null);
  isImageLoading = input<boolean>(false);

  imageClear = output<void>();

  clearImage() {
    this.imageClear.emit();
  }
}
