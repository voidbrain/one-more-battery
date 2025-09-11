import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'digit-test',
    loadComponent: () =>
      import('./components/digit-test/digit-test.component').then((m) => m.DigitTestComponent),
  }
];
