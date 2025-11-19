import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-singer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    BadgeModule
  ],
  template: `
    <div class="singer-dashboard">
      <div class="dashboard-header">
        <h1>¡Hola, Cantante! 🎤</h1>
        <p>Bienvenido a tu espacio personal en KaraQR</p>
      </div>

      <div class="dashboard-grid">
        
        <!-- Canciones en Cola -->
        <p-card header="🎵 Mis Canciones" styleClass="dashboard-card">
          <div class="stat-content">
            <div class="stat-number">{{ songsInQueue }}</div>
            <div class="stat-label">En cola</div>
            <p-button 
              label="Ver Cola" 
              icon="pi pi-list" 
              routerLink="/singer/queue"
              styleClass="p-button-outlined p-button-sm"
            ></p-button>
          </div>
        </p-card>

        <!-- Historial -->
        <p-card header="📚 Mi Historial" styleClass="dashboard-card">
          <div class="stat-content">
            <div class="stat-number">{{ songsCompleted }}</div>
            <div class="stat-label">Cantadas</div>
            <p-button 
              label="Ver Historial" 
              icon="pi pi-history" 
              routerLink="/singer/history"
              styleClass="p-button-outlined p-button-sm"
            ></p-button>
          </div>
        </p-card>

        <!-- Perfil -->
        <p-card header="👤 Mi Perfil" styleClass="dashboard-card">
          <div class="stat-content">
            <div class="stat-number">⭐</div>
            <div class="stat-label">Perfil</div>
            <p-button 
              label="Editar Perfil" 
              icon="pi pi-user-edit" 
              routerLink="/singer/profile"
              styleClass="p-button-outlined p-button-sm"
            ></p-button>
          </div>
        </p-card>

        <!-- Acciones Rápidas -->
        <p-card header="⚡ Acciones Rápidas" styleClass="dashboard-card quick-actions">
          <div class="actions-grid">
            <p-button 
              label="Nueva Canción" 
              icon="pi pi-plus" 
              routerLink="/join"
              styleClass="p-button-success"
            ></p-button>
            <p-button 
              label="Ver Cola General" 
              icon="pi pi-users" 
              routerLink="/queue"
              styleClass="p-button-info"
            ></p-button>
          </div>
        </p-card>

      </div>
    </div>
  `,
  styles: [`
    .singer-dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .dashboard-header p {
      font-size: 1.1rem;
      color: #6b7280;
      margin: 0;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    ::ng-deep .dashboard-card {
      height: 100%;
    }

    ::ng-deep .dashboard-card .p-card-body {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .stat-content {
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 1rem;
    }

    .quick-actions .actions-grid {
      display: grid;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .singer-dashboard {
        padding: 1rem;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class SingerDashboardComponent implements OnInit {
  songsInQueue = 2;
  songsCompleted = 15;

  ngOnInit(): void {
    // Aquí se pueden cargar datos del cantante desde un servicio
    this.loadSingerStats();
  }

  private loadSingerStats(): void {
    // TODO: Implementar carga de estadísticas del cantante
    // Ejemplo de datos que se podrían cargar:
    // - Número de canciones en cola
    // - Historial de canciones cantadas  
    // - Rating promedio
    // - Géneros favoritos
  }
}