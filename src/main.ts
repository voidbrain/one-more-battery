/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/* Core CSS required for Ionic components to work properly */
import '@ionic/angular/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/angular/css/normalize.css';
import '@ionic/angular/css/structure.css';
import '@ionic/angular/css/typography.css';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
