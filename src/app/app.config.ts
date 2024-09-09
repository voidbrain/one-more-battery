// src/app/app.config.ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export function initializeFirebaseApp() {
  return initializeApp(environment.firebase);
}

export const appConfigProviders = [
  provideFirebaseApp(() => initializeFirebaseApp()),
  provideAuth(() => getAuth()),
  provideMessaging(() => getMessaging()),
  provideFirestore(() => getFirestore()),
];
