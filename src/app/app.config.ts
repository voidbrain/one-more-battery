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
// import { FIREBASE_OPTIONS } from '@angular/fire/compat'; // Commented out Firebase
// import { firebaseProviders } from './firebase.config'; // Commented out Firebase
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app'; // Commented out Firebase

export const appConfig: ApplicationConfig = {
  providers: [
    AngularDelegate,
    // { provide: FIREBASE_OPTIONS, useValue: (environment as Environment).firebase }, // Commented out Firebase
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes),
    provideHttpClient(),
    // provideFirebaseApp(() => initializeApp((environment as Environment).firebase)), // Commented out Firebase
    // ...firebaseProviders, // Commented out Firebase
    provideNoopAnimations(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};
