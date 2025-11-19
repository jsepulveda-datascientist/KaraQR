import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface HistoryItem {
  id: string;
  song: string;
  artist: string;
  genre: string;
  date: Date;
  rating?: number;
  venue: string;
}

interface FilterOptions {
  searchTerm: string;
}

@Component({
  selector: 'app-singer-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <div class="history-container">
      
      <!-- Header -->
      <div class="history-header">
        <h1 class="history-title">Mi Historial</h1>
        <p class="history-subtitle">{{ filteredHistory.length }} canciones cantadas</p>
      </div>

      <!-- Filtros -->
      <div class="filters-section">
        <p-card styleClass="filters-card">
          <div class="filters-grid">
            
            <div class="filter-item">
              <label for="search">Buscar canción</label>
              <p-iconField>
                <p-inputIcon styleClass="pi pi-search" />
                <input pInputText 
                       id="search"
                       [(ngModel)]="filters.searchTerm"
                       placeholder="Buscar por canción o artista"
                       (input)="applyFilters()"
                       class="w-full" />
              </p-iconField>
            </div>

            <div class="filter-actions">
              <button pButton 
                      label="Limpiar Filtros"
                      icon="pi pi-filter-slash"
                      class="p-button-outlined"
                      (click)="clearFilters()">
              </button>
            </div>

          </div>
        </p-card>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-section">
        <div class="stats-grid">
          
          <div class="stat-card">
            <div class="stat-icon total">
              <i class="pi pi-music"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ historyItems.length }}</span>
              <span class="stat-label">Total Canciones</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon genre">
              <i class="pi pi-star"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ getFavoriteGenre() }}</span>
              <span class="stat-label">Género Favorito</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon recent">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-content">
              <span class="stat-number">{{ getThisMonthCount() }}</span>
              <span class="stat-label">Este Mes</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Lista de historial -->
      <div class="history-list">
        <p-card *ngFor="let item of filteredHistory; trackBy: trackByItem" 
                styleClass="history-item-card">
          <div class="history-item">
            
            <div class="item-main">
              <h3 class="song-title">{{ item.song }}</h3>
              <p class="artist-name">
                <i class="pi pi-user"></i>
                {{ item.artist }}
              </p>
              
              <div class="item-meta">
                <p-tag [value]="item.genre" 
                       [style]="getGenreStyle(item.genre)"
                       styleClass="genre-tag">
                </p-tag>
                
                <span class="date-info">
                  <i class="pi pi-calendar"></i>
                  {{ formatDate(item.date) }}
                </span>
                
                <span class="venue-info">
                  <i class="pi pi-map-marker"></i>
                  {{ item.venue }}
                </span>
              </div>
            </div>
            
            <div class="item-actions">
              <div class="rating" *ngIf="item.rating">
                <span class="rating-stars">
                  <i class="pi pi-star-fill" 
                     *ngFor="let star of getStarsArray(item.rating)"
                     [class.filled]="star <= item.rating">
                  </i>
                </span>
                <span class="rating-value">{{ item.rating }}/5</span>
              </div>
              
              <button pButton 
                      type="button"
                      icon="pi pi-refresh"
                      class="p-button-text p-button-sm"
                      pTooltip="Cantar de nuevo"
                      (click)="onRepeatSong(item)">
              </button>
            </div>
            
          </div>
        </p-card>
      </div>

      <!-- Estado vacío -->
      <div class="empty-history" *ngIf="filteredHistory.length === 0 && historyItems.length > 0">
        <i class="pi pi-search empty-icon"></i>
        <h3>No se encontraron canciones</h3>
        <p>Prueba ajustando los filtros de búsqueda</p>
      </div>

      <div class="empty-history" *ngIf="historyItems.length === 0">
        <i class="pi pi-music empty-icon"></i>
        <h3>¡Aún no has cantado!</h3>
        <p>Tu historial aparecerá aquí después de tu primera canción</p>
        <button pButton 
                label="Cantar Ahora"
                icon="pi pi-plus"
                class="start-singing-btn"
                routerLink="/singer/join">
        </button>
      </div>

    </div>
  `,
  styleUrl: './singer-history.component.scss'
})
export class SingerHistoryComponent implements OnInit {
  
  historyItems: HistoryItem[] = [];
  filteredHistory: HistoryItem[] = [];
  
  filters: FilterOptions = {
    searchTerm: ''
  };
  
  genreOptions = [
    { label: 'Rock', value: 'Rock' },
    { label: 'Pop', value: 'Pop' },
    { label: 'Reggaeton', value: 'Reggaeton' },
    { label: 'Salsa', value: 'Salsa' },
    { label: 'Balada', value: 'Balada' },
    { label: 'Jazz', value: 'Jazz' }
  ];

  ngOnInit(): void {
    this.loadHistoryData();
  }

  private loadHistoryData(): void {
    // Mock data - TODO: Integrar con servicio real
    this.historyItems = [
      {
        id: '1',
        song: 'Bohemian Rhapsody',
        artist: 'Queen',
        genre: 'Rock',
        date: new Date('2024-11-15'),
        rating: 5,
        venue: 'Basement415'
      },
      {
        id: '2',
        song: 'Don\'t Stop Believin\'',
        artist: 'Journey',
        genre: 'Rock',
        date: new Date('2024-11-10'),
        rating: 4,
        venue: 'Basement415'
      },
      {
        id: '3',
        song: 'Imagine',
        artist: 'John Lennon',
        genre: 'Pop',
        date: new Date('2024-11-08'),
        rating: 5,
        venue: 'Basement415'
      },
      {
        id: '4',
        song: 'Hotel California',
        artist: 'Eagles',
        genre: 'Rock',
        date: new Date('2024-10-28'),
        rating: 4,
        venue: 'Basement415'
      }
    ];
    
    this.filteredHistory = [...this.historyItems];
  }

  applyFilters(): void {
    let filtered = [...this.historyItems];
    
    // Filtro por término de búsqueda
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.song.toLowerCase().includes(term) ||
        item.artist.toLowerCase().includes(term)
      );
    }
    
    this.filteredHistory = filtered;
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: ''
    };
    this.filteredHistory = [...this.historyItems];
  }

  getFavoriteGenre(): string {
    if (this.historyItems.length === 0) return 'N/A';
    
    const genreCounts = this.historyItems.reduce((acc, item) => {
      acc[item.genre] = (acc[item.genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  getThisMonthCount(): number {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    return this.historyItems.filter(item => 
      item.date.getMonth() === thisMonth && 
      item.date.getFullYear() === thisYear
    ).length;
  }

  trackByItem(index: number, item: HistoryItem): string {
    return item.id;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getGenreStyle(genre: string): any {
    const styles: Record<string, any> = {
      'Rock': { 'background-color': '#ef4444', color: 'white' },
      'Pop': { 'background-color': '#ec4899', color: 'white' },
      'Reggaeton': { 'background-color': '#f59e0b', color: 'white' },
      'Salsa': { 'background-color': '#10b981', color: 'white' },
      'Balada': { 'background-color': '#6366f1', color: 'white' },
      'Jazz': { 'background-color': '#8b5cf6', color: 'white' }
    };
    
    return styles[genre] || { 'background-color': '#6b7280', color: 'white' };
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  onRepeatSong(item: HistoryItem): void {
    // TODO: Integrar con servicio para agregar canción a la cola
    console.log('Repetir canción:', item);
  }
}