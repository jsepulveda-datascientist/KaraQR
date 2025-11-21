import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu, [app-menu]',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: ` <ul class="layout-menu" #menuContainer>
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`
})
export class AppMenu {
    el: ElementRef = inject(ElementRef);

    @ViewChild('menuContainer') menuContainer!: ElementRef;

    model: MenuItem[] = [
        {
            label: 'KaraQR',
            icon: 'pi pi-fw pi-microphone',
            items: [
                {
                    label: 'Inicio',
                    icon: 'pi pi-fw pi-home',
                    routerLink: ['/home']
                },
                {
                    label: 'Emparejamiento TV',
                    icon: 'pi pi-fw pi-desktop',
                    routerLink: ['/pairing']  // Updated from '/screen'
                },
                {
                    label: 'Cola de Karaoke',
                    icon: 'pi pi-fw pi-list',
                    routerLink: ['/queue']
                },
                {
                    label: 'Control Remoto',
                    icon: 'pi pi-fw pi-cog',
                    routerLink: ['/remote']  // Updated from '/admin'
                },
                {
                    label: 'Gestión de Tenants',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/tenant-management']
                },
                { separator: true },
                {
                    label: 'App Móvil (Nuevo)',
                    icon: 'pi pi-fw pi-mobile',
                    disabled: true,
                    title: 'Usa la nueva aplicación móvil Vue'
                },
                { separator: true }
            ]
        },
        {
            label: 'Pages',
            icon: 'pi pi-fw pi-briefcase',
            items: [
                {
                    label: 'Landing',
                    icon: 'pi pi-fw pi-globe',
                    routerLink: ['/landing']
                },
                {
                    label: 'Auth',
                    icon: 'pi pi-fw pi-user',
                    items: [
                        {
                            label: 'Login',
                            icon: 'pi pi-fw pi-sign-in',
                            routerLink: ['/auth/login']
                        },
                        {
                            label: 'Login 2',
                            icon: 'pi pi-fw pi-sign-in',
                            routerLink: ['/auth/login2']
                        },
                        {
                            label: 'Error',
                            icon: 'pi pi-fw pi-times-circle',
                            routerLink: ['/auth/error']
                        },
                        {
                            label: 'Error 2',
                            icon: 'pi pi-fw pi-times-circle',
                            routerLink: ['/auth/error2']
                        },
                        {
                            label: 'Access Denied',
                            icon: 'pi pi-fw pi-lock',
                            routerLink: ['/auth/access']
                        },
                        {
                            label: 'Access Denied 2',
                            icon: 'pi pi-fw pi-lock',
                            routerLink: ['/auth/access2']
                        },
                        {
                            label: 'Register',
                            icon: 'pi pi-fw pi-user-plus',
                            routerLink: ['/auth/register']
                        },
                        {
                            label: 'Forgot Password',
                            icon: 'pi pi-fw pi-question',
                            routerLink: ['/auth/forgotpassword']
                        },
                        {
                            label: 'New Password',
                            icon: 'pi pi-fw pi-cog',
                            routerLink: ['/auth/newpassword']
                        },
                        {
                            label: 'Verification',
                            icon: 'pi pi-fw pi-envelope',
                            routerLink: ['/auth/verification']
                        },
                        {
                            label: 'Lock Screen',
                            icon: 'pi pi-fw pi-eye-slash',
                            routerLink: ['/auth/lockscreen']
                        }
                    ]
                },
                {
                    label: 'Crud',
                    icon: 'pi pi-fw pi-pencil',
                    routerLink: ['/pages/crud']
                },
                {
                    label: 'Invoice',
                    icon: 'pi pi-fw pi-dollar',
                    routerLink: ['/pages/invoice']
                },
                {
                    label: 'Help',
                    icon: 'pi pi-fw pi-question-circle',
                    routerLink: ['/pages/help']
                },
                {
                    label: 'Not Found',
                    icon: 'pi pi-fw pi-exclamation-circle',
                    routerLink: ['/pages/notfound']
                },
                {
                    label: 'Empty',
                    icon: 'pi pi-fw pi-circle-off',
                    routerLink: ['/pages/empty']
                },
                {
                    label: 'Contact Us',
                    icon: 'pi pi-fw pi-phone',
                    routerLink: ['/pages/contact']
                }
            ]
        }
    ];
}
