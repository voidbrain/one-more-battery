// src/app/app.config.ts
// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment, Environment } from '../environments/environment';
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { routes } from './app.routes';
import { AngularDelegate } from '@ionic/angular';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common'; // Import APP_BASE_HREF from @angular/common
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
// import { FIREBASE_OPTIONS } from '@angular/fire/compat';

export function initializeFirebaseApp() {
  const typedEnvironment: Environment = environment;
  // return initializeApp(typedEnvironment.firebase);
}

export const appConfig: ApplicationConfig = {
  providers: [
    AngularDelegate,
    // { provide: FIREBASE_OPTIONS, useValue: (environment as Environment).firebase },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(routes),
    provideHttpClient(),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    // provideFirebaseApp(() => initializeApp((environment as Environment).firebase)),
    provideMessaging(() => getMessaging()),
    provideNoopAnimations(),
    { provide: APP_BASE_HREF, useValue: '/' }, // Provide APP_BASE_HREF for local development
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
};
