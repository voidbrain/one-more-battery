// src/app/app.config.ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { routes } from './app.routes';
import { AngularDelegate } from '@ionic/angular';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import {provideHttpClient} from '@angular/common/http';

export function initializeFirebaseApp() {
  return initializeApp(environment.firebase);
}

export const appConfig: ApplicationConfig = {
  providers: [
    // AngularDelegate,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes),
    provideHttpClient(),

    provideAuth(() => getAuth()),

    provideFirestore(() => getFirestore()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),

  ],
};
