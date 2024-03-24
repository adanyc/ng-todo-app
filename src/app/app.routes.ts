import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'labs',
    loadComponent: () => import('./pages/labs/labs.component').then(m => m.LabsComponent),
  },
];
