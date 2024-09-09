import { Injectable } from '@angular/core';
import { FirebaseConfigService } from './firebase.config.service';
import { initializeApp, FirebaseApp } from '@angular/fire/app';
import { getMessaging, getToken, onMessage, Messaging } from '@angular/fire/messaging';
import { getFirestore } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirebaseOptions } from '@angular/fire/app';

@Injectable({
  providedIn: 'root',
})
export class FirebaseInitializationService {
  private appInitialized = new BehaviorSubject<boolean>(false);
  private messaging!: Messaging;
  private firestore = getFirestore(); // Initialize Firestore here

  constructor(
    private firebaseConfigService: FirebaseConfigService
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    this.firebaseConfigService.getFirebaseConfig().subscribe((config: FirebaseOptions) => {
      // Initialize Firebase with the fetched configuration
      const app = initializeApp(config);
      this.messaging = getMessaging(app); // Initialize Messaging with the app
      console.log(config, this.appInitialized);
      this.appInitialized.next(true);

      // You can now use Firebase Messaging safely
      this.setupMessaging();
    });
  }

  private setupMessaging() {
    // Setup Firebase Messaging after Firebase initialization
    getToken(this.messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key if required
    }).then((token) => {
      console.log('Firebase Messaging Token:', token);
      // You can handle the token here
    }).catch((error) => {
      console.error('Error getting token', error);
    });

    onMessage(this.messaging, (payload) => {
      console.log('Message received:', payload);
      // Handle incoming messages here
    });
  }

  get isInitialized() {
    return this.appInitialized.asObservable();
  }
}
