import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FirebaseInitializationService } from './services/firebase.initialization.service';

import { AngularFireModule } from '@angular/fire/compat'; // Ensure compatibility module
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from 'src/environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth'; // Ensure Auth is provided
import { AngularFireAuthModule } from '@angular/fire/compat/auth';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,

    AngularFireModule.initializeApp(environment.firebase), // Initialize Firebase here
    AngularFireMessagingModule,  // Import Firebase Messaging Module
    AngularFirestoreModule, // Import Firestore Module
    AngularFireAuthModule,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),

  ],
  providers: [
    provideHttpClient(),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    FirebaseInitializationService, // Ensure this service initializes Firebase
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
