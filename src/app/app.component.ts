import { Component, OnInit } from '@angular/core';
import { getMessaging, getToken, onMessage } from '@angular/fire/messaging';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { TokenService } from './services/token.service';  // Import the service

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  private messaging = getMessaging(); // Initialize Messaging

  constructor(
    private swUpdate: SwUpdate,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.requestPermission(); // Call requestPermission method
    this.setupMessageListener(); // Call message listener setup

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm('New version available. Load new version?')) {
            window.location.reload();
          }
        });
    }
  }

  requestPermission() {
    // This method is typically used to check and request notification permission from the user.
    // You will need to handle permission with the browser's Notification API.
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.info('Notification permission granted.');
        this.getToken();
      } else {
        console.error('Notification permission denied.');
      }
    }).catch(error => {
      console.error('Error requesting notification permission:', error);
    });
  }

  getToken() {
    getToken(this.messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key if required
    }).then(token => {
      if (token) {
        console.info('FCM Token:', token);
        this.tokenService.setToken(token);
      } else {
        console.warn('No FCM token received.');
      }
    }).catch(error => {
      console.error('Error getting FCM token:', error);
    });
  }

  setupMessageListener() {
    onMessage(this.messaging, (payload) => {
      console.log('Message received:', payload);
      // Handle the received message
    });
  }
}
