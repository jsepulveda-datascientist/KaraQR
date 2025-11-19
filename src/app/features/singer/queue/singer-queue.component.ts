import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';

interface QueueItem {
  id: string;
  singer: string;
  song: string;
  position: number;
  estimatedTime: string;
  isCurrentUser: boolean;
}

@Component({
  selector: 'app-singer-queue',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ProgressBarModule,
    TagModule,
    BadgeModule,
    SkeletonModule
  ],
  template: `
    <div class="queue-container">
      
      <!-- Header con información de la cola -->
      <div class="queue-header">
        <h1 class="queue-title">Cola de Karaoke</h1>
        <p class="queue-subtitle">Basement415 • {{ queueItems.length }} canciones en espera</p>
      </div>

      <!-- Estado actual -->
      <div class="current-status" *ngIf="userInQueue">
        <p-card styleClass="status-card">
          <div class="status-content">
            <div class="status-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="status-info">
              <h3>Estás en posición #{{ userPosition }}</h3>
              <p>Tiempo estimado: {{ userEstimatedTime }} minutos</p>
            </div>
            <p-progressBar 
              [value]="getProgressPercentage()"
              [showValue]="false"
              styleClass="status-progress">
            </p-progressBar>
          </div>
        </p-card>
      </div>

      <!-- Lista de canciones en cola -->
      <div class="queue-list">
        <p-card *ngFor="let item of queueItems; trackBy: trackByPosition" 
                [styleClass]="getCardClass(item)">
          <div class="queue-item">
            
            <div class="position-badge">
              <span class="position-number">{{ item.position }}</span>
            </div>
            
            <div class="item-info">
              <h4 class="song-title">{{ item.song }}</h4>
              <p class="singer-name">
                <i class="pi pi-user"></i>
                {{ item.singer }}
                <p-tag *ngIf="item.isCurrentUser" 
                       value="Tú" 
                       severity="info"
                       styleClass="user-tag">
                </p-tag>
              </p>
              <small class="estimated-time">
                <i class="pi pi-clock"></i>
                Aprox. {{ item.estimatedTime }}
              </small>
            </div>
            
            <div class="item-actions" *ngIf="item.isCurrentUser">
              <button pButton 
                      type="button"
                      icon="pi pi-pencil"
                      class="p-button-text p-button-sm"
                      pTooltip="Editar canción">
              </button>
              <button pButton 
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-text p-button-danger p-button-sm"
                      pTooltip="Cancelar canción"
                      (click)="onCancelSong(item.id)">
              </button>
            </div>
            
          </div>
        </p-card>
      </div>

      <!-- Estado de cola vacía -->
      <div class="empty-queue" *ngIf="queueItems.length === 0">
        <i class="pi pi-music empty-icon"></i>
        <h3>¡La cola está vacía!</h3>
        <p>Sé el primero en agregar una canción</p>
        <button pButton 
                label="Anotarme Ahora"
                icon="pi pi-plus"
                class="add-song-btn"
                routerLink="/singer/join">
        </button>
      </div>

      <!-- Botón flotante para agregar canción -->
      <button pButton 
              *ngIf="queueItems.length > 0"
              type="button"
              icon="pi pi-plus"
              class="p-button-rounded fab"
              pTooltip="Agregar otra canción"
              tooltipPosition="left"
              routerLink="/singer/join">
      </button>

    </div>
  `,
  styleUrl: './singer-queue.component.scss'
})
export class SingerQueueComponent implements OnInit {
  
  queueItems: QueueItem[] = [];
  userInQueue = false;
  userPosition = 0;
  userEstimatedTime = 0;
  loading = true;

  ngOnInit(): void {
    this.loadQueueData();
  }

  private loadQueueData(): void {
    // Mock data - TODO: Integrar con servicio real
    setTimeout(() => {
      this.queueItems = [
        {
          id: '1',
          singer: 'Ana García',
          song: 'Bohemian Rhapsody - Queen',
          position: 1,
          estimatedTime: '5 min',
          isCurrentUser: false
        },
        {
          id: '2', 
          singer: 'Tú',
          song: 'Don\'t Stop Believin\' - Journey',
          position: 2,
          estimatedTime: '9 min',
          isCurrentUser: true
        },
        {
          id: '3',
          singer: 'Carlos Ruiz',
          song: 'Imagine - John Lennon',
          position: 3,
          estimatedTime: '13 min',
          isCurrentUser: false
        }
      ];
      
      const userItem = this.queueItems.find(item => item.isCurrentUser);
      if (userItem) {
        this.userInQueue = true;
        this.userPosition = userItem.position;
        this.userEstimatedTime = parseInt(userItem.estimatedTime);
      }
      
      this.loading = false;
    }, 1000);
  }

  trackByPosition(index: number, item: QueueItem): number {
    return item.position;
  }

  getCardClass(item: QueueItem): string {
    return item.isCurrentUser ? 'queue-card user-card' : 'queue-card';
  }

  getProgressPercentage(): number {
    if (!this.userInQueue || this.queueItems.length === 0) return 0;
    const totalItems = this.queueItems.length;
    const remaining = totalItems - this.userPosition + 1;
    return ((totalItems - remaining) / totalItems) * 100;
  }

  onCancelSong(songId: string): void {
    // TODO: Mostrar confirmación y integrar con servicio
    console.log('Cancelar canción:', songId);
  }
}