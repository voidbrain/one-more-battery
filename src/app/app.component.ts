import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonRouterOutlet, IonApp } from "@ionic/angular/standalone";
import { SwUpdate, VersionEvent } from '@angular/service-worker';

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
      // Listen for version updates
      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        if (event.type === 'VERSION_READY') {
          this.promptUserForUpdate();
        }
      });
    }
  }

  promptUserForUpdate() {
    if (confirm('A new version of the app is available. Would you like to update?')) {
      window.location.reload();
    }
  }
}
