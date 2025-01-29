/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

defineCustomElements(window);

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));


if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./firebase-messaging-sw.js')
    .then((registration) => {
      console.info('[SW]: Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('[SW]: Service Worker registration failed:', error);
    });
}
