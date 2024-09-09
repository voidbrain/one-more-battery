// src/app/firebase.config.ts
import { FirebaseOptions } from '@angular/fire/app';
import { initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

// Initialize Firebase app
export function initializeFirebaseApp() {
  return initializeApp(environment.firebase);
}

// Export Firebase providers
export const firebaseProviders = [
  provideAuth(() => getAuth()),
  provideMessaging(() => getMessaging()),
  provideFirestore(() => getFirestore()),
];
