import { Injectable } from '@angular/core';
import { FirebaseConfigService } from './firebase.config.service';
import { initializeApp, FirebaseApp } from '@angular/fire/app';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
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
    private afMessaging: AngularFireMessaging,
    private afFirestore: AngularFirestore
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    this.firebaseConfigService.getFirebaseConfig().subscribe((config: FirebaseOptions) => {
      // Initialize Firebase with the fetched configuration
      initializeApp(config);
      console.log(config, this.appInitialized)
      this.appInitialized.next(true);
    });
  }

  get isInitialized() {
    return this.appInitialized.asObservable();
  }
}
