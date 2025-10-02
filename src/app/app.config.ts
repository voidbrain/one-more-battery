// src/app/app.config.ts
import { environment, Environment } from '../environments/environment';
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { routes } from './app.routes';
import { AngularDelegate } from '@ionic/angular';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { firebaseProviders } from './firebase.config'; // Import firebaseProviders
import { provideFirebaseApp, initializeApp } from '@angular/fire/app'; // Import provideFirebaseApp and initializeApp

export const appConfig: ApplicationConfig = {
  providers: [
    AngularDelegate,
    { provide: FIREBASE_OPTIONS, useValue: (environment as Environment).firebase },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp((environment as Environment).firebase)), // Initialize Firebase app once
    ...firebaseProviders, // Spread the Firebase providers from firebase.config.ts
    provideNoopAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};
