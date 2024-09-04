import { Injectable } from '@angular/core';
import { getMessaging, getToken, onMessage } from '@angular/fire/messaging';
import { FirebaseConfigService } from './firebase.config.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private messaging = getMessaging();

  constructor(private firebaseConfigService: FirebaseConfigService) {}

  // Request permission to send notifications and get FCM token
  async requestPermission() {
    const config = await lastValueFrom(
      this.firebaseConfigService.getFirebaseConfig(),
    );

    return getToken(this.messaging, { vapidKey: config.vapidKey })
      .then((token) => {
        if (token) {
          console.log('FCM Token:', token);
          // Save the token to your backend if needed
        }
      })
      .catch((err) => {
        console.error('Permission denied or error occurred:', err);
      });
  }

  // Listen to incoming messages
  receiveMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Message received. ', payload);
      // Handle the payload here (e.g., show a notification)
    });
  }
}
