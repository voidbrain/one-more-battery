import { Routes } from '@angular/router';

import { DigitTestComponent } from './components/digit-test/digit-test.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/tabs/tabs.module').then((m) => m.TabsPageModule),
  },

];
