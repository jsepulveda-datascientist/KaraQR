import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-singer-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    MenuModule
  ],
  template: `
    <div class="join-container p-fluid">
      <!-- Card principal con header reutilizable -->
      <p-card styleClass="join-card">
        <ng-template pTemplate="header">
          <div class="card-header">
            <div class="header-left">
              <button 
                pButton 
                type="button" 
                icon="pi pi-bars" 
                class="p-button-text p-button-rounded p-button-sm header-menu-btn"
                (click)="menu.toggle($event)"
              ></button>
              <h3 class="header-title">KaraQR</h3>
              <p-menu #menu [model]="menuItems" [popup]="true" styleClass="header-menu"></p-menu>
            </div>
            <span class="header-subtitle">Basement415</span>
          </div>
        </ng-template>

        <!-- Área de contenido dinámico -->
        <div class="singer-content">
          <ng-content></ng-content>
        </div>

        <!-- Footer reutilizable -->
        <div class="tenant-footer">
          <small class="text-500">
            <i class="pi pi-microphone mr-1"></i>
            Panel de cantante - <strong>Basement415</strong>
          </small>
        </div>

      </p-card>
    </div>
  `,
  styleUrl: './singer-layout.component.scss'
})
export class SingerLayoutComponent implements OnInit {

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.initializeMenu();
  }

  private initializeMenu(): void {
    this.menuItems = [
      {
        label: 'Inicio',
        icon: 'pi pi-home',
        command: () => {
          this.navigateTo('/singer/home');
        }
      },
      {
        label: 'Unirse a Cola',
        icon: 'pi pi-plus',
        command: () => {
          this.navigateTo('/singer/join');
        }
      },
      {
        label: 'Reacciones',
        icon: 'pi pi-heart',
        command: () => {
          this.navigateTo('/singer/reactions');
        }
      }
    ];
  }

  private navigateTo(route: string): void {
    window.location.href = route;
  }
}