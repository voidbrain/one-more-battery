import { Injectable } from '@angular/core';
import { FirebaseConfigService } from './firebase.config.service';
import { initializeApp } from '@angular/fire/app';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';  // Correct Import
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject } from 'rxjs';
import { FirebaseOptions } from '@angular/fire/app';

@Injectable({
  providedIn: 'root',
})
export class FirebaseInitializationService {
  private appInitialized = new BehaviorSubject<boolean>(false);

  constructor(
    private firebaseConfigService: FirebaseConfigService,
    private afMessaging: AngularFireMessaging,  // Correctly inject AngularFireMessaging
    private afFirestore: AngularFirestore
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    this.firebaseConfigService.getFirebaseConfig().subscribe((config: FirebaseOptions) => {
      // Initialize Firebase with the fetched configuration
      initializeApp(config);
      console.log(config, this.appInitialized);
      this.appInitialized.next(true);

      // You can now use AngularFireMessaging safely
      this.setupMessaging();
    });
  }

  private setupMessaging() {
    // Setup Firebase Messaging after Firebase initialization
    this.afMessaging.requestToken.subscribe(
      (token) => console.log('Firebase Messaging Token:', token),
      (error) => console.error('Error getting token', error)
    );
  }

  get isInitialized() {
    return this.appInitialized.asObservable();
  }
}
