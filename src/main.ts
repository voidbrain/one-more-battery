/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('assets/data/firebase-messaging-sw.js')
    .then((registration) => {
      console.info('[SW]: Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.error('[SW]: Service Worker registration failed:', error);
    });
}
