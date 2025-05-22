import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonRouterOutlet, IonApp } from "@ionic/angular/standalone";
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'evara-frontend';

  constructor(private swUpdate: SwUpdate) {
    if (this.swUpdate.isEnabled) {
      // Check for updates explicitly
      this.swUpdate.checkForUpdate().then((hasUpdate) => {
        if (hasUpdate) {
          this.promptUserForUpdate();
        }
      });

      // Listen for version updates
      this.swUpdate.versionUpdates.subscribe(() => {
        this.promptUserForUpdate();
      });
    }
  }

  promptUserForUpdate() {
    if (confirm('A new version of the app is available. Would you like to update?')) {
      window.location.reload();
    }
  }
}
