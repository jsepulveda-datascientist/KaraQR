import { Routes } from '@angular/router';

export const SINGER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./home/singer-home.component').then(m => m.SingerHomeComponent),
    title: 'Home - KaraQR'
  },
  {
    path: 'join',
    loadComponent: () => import('./join/join.component').then(m => m.JoinComponent),
    title: 'Anotarse - KaraQR'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/singer-dashboard.component').then(m => m.SingerDashboardComponent),
    title: 'Dashboard del Cantante - KaraQR'
  },
  {
    path: 'queue',
    loadComponent: () => import('./queue/singer-queue.component').then(m => m.SingerQueueComponent),
    title: 'Mi Cola - KaraQR'
  },
  {
    path: 'history',
    loadComponent: () => import('./history/singer-history.component').then(m => m.SingerHistoryComponent),
    title: 'Mi Historial - KaraQR'
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/singer-profile.component').then(m => m.SingerProfileComponent),
    title: 'Mi Perfil - KaraQR'
  },
  {
    path: 'reactions',
    loadComponent: () => import('./reactions').then(m => m.SingerReactionsComponent),
    title: 'Reacciones - KaraQR'
  }
];