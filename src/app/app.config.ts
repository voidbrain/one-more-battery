import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { TranslocoHttpLoader } from './services/utils/transloco-loader';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  batteryCharging,
  batteryHalf,
  batteryDead,
  close,
  checkmarkCircle,
  closeCircle,
  alertCircle,
  square,
  diamond,
  flag,
  sunny,
  moon,
  checkmark,
  chevronDown,
  chevronUp,
  qrCode,
  camera,
  images,
  barChart,
  informationCircle,
  analytics,
  settings,
  pulse,
  ellipsisVertical,
  trash,
  print,
  eye,
  eyeOff,
  image,
  search
} from 'ionicons/icons';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

// Register Ionicons
addIcons({
  'battery-charging': batteryCharging,
  'battery-half': batteryHalf,
  'battery-empty': batteryDead,
  close: close,
  'checkmark-circle': checkmarkCircle,
  'close-circle': closeCircle,
  'alert-circle': alertCircle,
  square: square,
  diamond: diamond,
  flag: flag,
  sunny: sunny,
  moon: moon,
  checkmark: checkmark,
  'chevron-down': chevronDown,
  'chevron-up': chevronUp,
  'qr-code': qrCode,
  camera: camera,
  images: images,
  'bar-chart': barChart,
  'information-circle': informationCircle,
  analytics: analytics,
  settings: settings,
  pulse: pulse,
  'ellipsis-vertical': ellipsisVertical,
  trash: trash,
  print: print,
  eye: eye,
  'eye-off': eyeOff,
  image: image,
  search: search
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideIonicAngular(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'it'],
        defaultLang: 'en',
        reRenderOnLangChange: true,
        prodMode: true,
      },
      loader: TranslocoHttpLoader,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
