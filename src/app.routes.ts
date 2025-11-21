import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/components/app.layout';

export const appRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('@/pages/landing/landing').then((c) => c.Landing)
    },
    {
        path: 'home',
        loadComponent: () => import('@/pages/home').then((c) => c.HomeComponent)
    },
    {
        path: 'admin',  // Keep admin layout access
        component: AppLayout,
        children: [
            { path: '', redirectTo: '/dashboards', pathMatch: 'full' },
            {
                path: 'dashboards',
                data: { breadcrumb: 'Analytics Dashboard' },
                loadChildren: () => import('@/pages/dashboard/dashboard.routes')
            },
            {
                path: 'uikit',
                data: { breadcrumb: 'UI Kit' },
                loadChildren: () => import('@/pages/uikit/uikit.routes')
            },
            {
                path: 'documentation',
                data: { breadcrumb: 'Documentation' },
                loadComponent: () => import('@/pages/documentation/documentation').then((c) => c.Documentation)
            },
            {
                path: 'pages',
                data: { breadcrumb: 'Pages' },
                loadChildren: () => import('@/pages/pages.routes')
            },
            {
                path: 'apps',
                data: { breadcrumb: 'Apps' },
                loadChildren: () => import('./app/apps/apps.routes')
            },
            {
                path: 'tenant-management',
                data: { breadcrumb: 'Gestión de Tenants' },
                loadComponent: () => import('@/features/tenant-management/tenant-management.component').then((c) => c.TenantManagementComponent)
            },
            {
                path: 'ecommerce',
                data: { breadcrumb: 'E-Commerce' },
                loadChildren: () => import('@/pages/ecommerce/ecommerce.routes')
            },
            {
                path: 'blocks',
                data: { breadcrumb: 'Prime Blocks' },
                loadChildren: () => import('@/pages/blocks/blocks.routes')
            },
            {
                path: 'profile',
                data: { breadcrumb: 'User Management' },
                loadChildren: () => import('@/pages/usermanagement/usermanagement.routes')
            }
        ]
    },
    { path: 'auth', loadChildren: () => import('@/pages/auth/auth.routes') },
    {
        path: 'queue/:tenantId',
        loadComponent: () => import('@/features/queue/queue.component').then((c) => c.QueueComponent)
    },
    {
        path: 'join',
        loadComponent: () => import('@/features/join-redirect/join-redirect.component').then((c) => c.JoinRedirectComponent)
    },
    {
        path: 'remote',  // Renamed from 'admin'
        loadComponent: () => import('@/features/admin/admin.component').then((c) => c.AdminComponent)
    },
    {
        path: 'pairing',  // Renamed from 'screen'
        loadComponent: () => import('@/features/screen/screen.component').then((c) => c.ScreenComponent)
    },
    {
        path: 'notfound',
        loadComponent: () => import('@/pages/notfound/notfound').then((c) => c.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
