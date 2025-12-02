import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { ToastService } from './services/ui/toast';
import { Theme } from './services/ui/theme';
import { IonApp, IonContent, IonToast } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, IonApp, IonContent, IonToast],
  templateUrl: './app.html',
})
export class App {
  protected toastService = inject(ToastService);
  private themeService = inject(Theme);

  protected onToastDismiss() {
    this.toastService.dismissToast();
  }
}
