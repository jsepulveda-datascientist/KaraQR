import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SingerLayoutComponent } from '../shared';

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  color: string;
}

interface SingerStats {
  songsToday: number;
  totalSongs: number;
  queuePosition?: number;
  isInQueue: boolean;
}

@Component({
  selector: 'app-singer-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    SingerLayoutComponent
  ],
  template: `
    <app-singer-layout>
      <!-- Estado actual del cantante -->
      <div class="field">
        <label class="block font-medium mb-2">
          🎵 Estado Actual
        </label>
        <div class="status-display">
          <div class="status-content">
            <div class="status-icon" [ngClass]="getStatusClass()">
              <i class="pi" [ngClass]="getStatusIcon()"></i>
            </div>
            <div class="status-info">
              <h3>{{ getStatusTitle() }}</h3>
              <p>{{ getStatusDescription() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Acciones rápidas -->
      <div class="field">
        <label class="block font-medium mb-2">
          ⚡ Acciones Rápidas
        </label>
        <div class="quick-actions-grid">
          <button 
            *ngFor="let action of quickActions" 
            pButton 
            [routerLink]="action.route"
            [label]="action.label"
            [icon]="action.icon"
            class="w-full quick-action-btn"
            [ngClass]="action.color">
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="field">
        <label class="block font-medium mb-2">
          📊 Mis Estadísticas
        </label>
        <div class="stats-display">
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-number">{{ stats.songsToday }}</span>
              <span class="stat-label">Hoy</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">{{ stats.totalSongs }}</span>
              <span class="stat-label">Total</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item" *ngIf="stats.isInQueue">
              <span class="stat-number">{{ stats.queuePosition }}</span>
              <span class="stat-label">Posición</span>
            </div>
            <div class="stat-item" *ngIf="!stats.isInQueue">
              <span class="stat-number">-</span>
              <span class="stat-label">Sin Cola</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tip del día -->
      <div class="field">
        <label class="block font-medium mb-2">
          💡 Tip del Día
        </label>
        <div class="tip-display">
          <p class="tip-content">{{ getCurrentTip() }}</p>
        </div>
      </div>
    </app-singer-layout>
  `,
  styleUrl: './singer-home.component.scss'
})
export class SingerHomeComponent implements OnInit {

  stats: SingerStats = {
    songsToday: 3,
    totalSongs: 47,
    queuePosition: 5,
    isInQueue: true
  };

  quickActions: QuickAction[] = [
    { 
      icon: 'pi pi-plus-circle', 
      label: 'Unirme', 
      route: '/singer/join',
      color: 'p-button-success'
    },
    { 
      icon: 'pi pi-list', 
      label: 'Mi Cola', 
      route: '/singer/queue',
      color: 'p-button-info'
    },
    { 
      icon: 'pi pi-heart', 
      label: 'Reacciones', 
      route: '/singer/reactions',
      color: 'p-button-secondary'
    },
    { 
      icon: 'pi pi-chart-line', 
      label: 'Stats', 
      route: '/singer/dashboard',
      color: 'p-button-help'
    }
  ];

  tips: string[] = [
    "Practica tu canción antes de subir al escenario",
    "Mantén contacto visual con la audiencia",
    "No tengas miedo de moverte al ritmo de la música",
    "Respira profundo antes de empezar a cantar",
    "Disfruta el momento, el karaoke es para divertirse",
    "Aplaude a otros cantantes para crear buen ambiente"
  ];

  ngOnInit(): void {
    // La inicialización del menú ahora se maneja en el layout compartido
  }

  getStatusClass(): string {
    if (this.stats.isInQueue) {
      return 'status-in-queue';
    }
    return 'status-available';
  }

  getStatusIcon(): string {
    if (this.stats.isInQueue) {
      return 'pi-clock';
    }
    return 'pi-check-circle';
  }

  getStatusTitle(): string {
    if (this.stats.isInQueue) {
      return `Posición #${this.stats.queuePosition}`;
    }
    return 'Disponible para cantar';
  }

  getStatusDescription(): string {
    if (this.stats.isInQueue) {
      return `Estás en la cola. Faltan ${(this.stats.queuePosition || 1) - 1} personas antes que tú.`;
    }
    return 'Únete a la cola para cantar tu próxima canción favorita.';
  }

  getCurrentTip(): string {
    const today = new Date();
    const tipIndex = today.getDate() % this.tips.length;
    return this.tips[tipIndex];
  }
}