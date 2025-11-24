import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/batteries',
    pathMatch: 'full',
  },
  {
    path: 'ai',
      loadComponent: () => import('./pages/ai/ai.component').then((m) => m.AiComponent),
  },
  {
    path: 'train-ml',
    loadComponent: () => import('./pages/train-ml/train-ml.component').then((m) => m.TrainMlComponent),
  },
  {
    path: 'batteries',
    loadComponent: () => import('./pages/batteries/batteries').then((m) => m.Batteries),
  },
  {
    path: 'manage',
    loadComponent: () =>
      import('./pages/battery-management/battery-management').then((m) => m.BatteryManagement),
    children: [
      {
        path: '',
        redirectTo: 'batteries',
        pathMatch: 'full',
      },
      {
        path: 'batteries',
        loadComponent: () =>
          import('./pages/battery-management/battery-list/battery-list.component').then(
            (m) => m.BatteryListComponent,
          ),
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./pages/battery-management/brand-list/brand-list.component').then(
            (m) => m.BrandListComponent,
          ),
      },
      {
        path: 'series',
        loadComponent: () =>
          import('./pages/battery-management/series-list/series-list.component').then(
            (m) => m.SeriesListComponent,
          ),
      },
      {
        path: 'types',
        loadComponent: () =>
          import('./pages/battery-management/type-list/type-list.component').then(
            (m) => m.TypeListComponent,
          ),
      },
    ],
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
  },
  {
    path: 'glass-showcase',
    loadComponent: () => import('./pages/glass-showcase/glass-showcase').then((m) => m.GlassShowcase),
  },
];
