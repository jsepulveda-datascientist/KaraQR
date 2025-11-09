import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

// QR Code
import { QRCodeComponent } from 'angularx-qrcode';

// Services
import { QueueService } from '../../core/services/queue.service';
import { QueueEntry } from '../../core/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    CardModule,
    ButtonModule,
    DividerModule,
    QRCodeComponent
  ],
  template: `
    <!-- Pantalla de Espera / Escenario KaraQR -->
    <div class="queue-screen">
      
      <!-- Encabezado -->
      <header class="queue-header">
        <div class="header-left">
          <i class="pi pi-microphone logo-icon"></i>
          <h1 class="logo-text">KaraQR</h1>
        </div>
        <div class="header-center">
          <span class="tagline">🎤 Tu turno para brillar 🎤</span>
        </div>
        <div class="header-right">
          <div class="current-time">
            {{ now | date:'shortTime' }}
          </div>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="queue-main" *ngIf="hasEntries(); else noEntries">
        
        <!-- Cantante Actual -->
        <section class="current-performer" *ngIf="current() as currentSinger">
          <div class="section-title">
            <i class="pi pi-play-circle"></i>
            <span>Ahora en escena</span>
          </div>
          
          <div class="performer-card">
            <div class="performer-info">
              <h2 class="performer-name">{{ currentSinger.name }}</h2>
              <div class="song-info">
                <div class="song-details" *ngIf="parseTitle(currentSinger.title_raw || currentSinger.song) as song">
                  <span class="artist" *ngIf="song.artist">{{ song.artist }}</span>
                  <span class="separator" *ngIf="song.artist"> - </span>
                  <span class="title">{{ song.title }}</span>
                </div>
                <p-tag 
                  [value]="getStatusText(currentSinger.status)" 
                  [severity]="severity(currentSinger.status)"
                  class="status-tag">
                </p-tag>
              </div>
            </div>
            
            <!-- YouTube Button -->
            <div class="youtube-section" *ngIf="currentSinger.youtube_url || currentSinger.youtubeLink">
              <p-button 
                icon="pi pi-youtube"
                label="Ver en YouTube"
                severity="help"
                size="large"
                class="youtube-btn"
                (click)="openYouTube(currentSinger.youtube_url || currentSinger.youtubeLink || '')"
                [outlined]="true">
              </p-button>
            </div>
          </div>
        </section>

        <p-divider></p-divider>

        <!-- Próximos Cantantes -->
        <section class="next-performers" *ngIf="next() as nextSingers">
          <div class="section-title">
            <i class="pi pi-forward"></i>
            <span>Siguen</span>
          </div>
          
          <div class="performers-list" *ngIf="nextSingers.length > 0; else noNext">
            <div 
              class="performer-item" 
              *ngFor="let performer of nextSingers; let i = index"
            >
              <div class="position-number">{{ i + 1 }}</div>
              <div class="performer-details">
                <span class="name">{{ performer.name }}</span>
                <div class="song" *ngIf="parseTitle(performer.title_raw || performer.song) as song">
                  <span class="artist" *ngIf="song.artist">{{ song.artist }}</span>
                  <span class="separator" *ngIf="song.artist"> - </span>
                  <span class="title">{{ song.title }}</span>
                </div>
              </div>
              <div class="youtube-indicator" *ngIf="performer.youtube_url || performer.youtubeLink">
                <i class="pi pi-youtube youtube-icon"></i>
              </div>
            </div>
          </div>

          <ng-template #noNext>
            <div class="empty-message">
              <i class="pi pi-users"></i>
              <p>No hay más cantantes en espera</p>
            </div>
          </ng-template>
        </section>

      </main>

      <!-- Mensaje cuando no hay entradas -->
      <ng-template #noEntries>
        <main class="queue-empty">
          <div class="empty-content">
            <i class="pi pi-music-note empty-icon"></i>
            <h2>🎶 Esperando próximo cantante...</h2>
            <p>¡Escanea el QR para anotarte!</p>
          </div>
        </main>
      </ng-template>

      <!-- Footer -->
      <footer class="queue-footer">
        <div class="footer-left">
          <div class="qr-section">
            <qrcode 
              [qrdata]="joinUrl" 
              [width]="120"
              [elementType]="'canvas'"
              [margin]="2"
              class="qr-code">
            </qrcode>
            <span class="qr-label">Escanea para anotarte</span>
          </div>
        </div>
        
        <div class="footer-center">
          <span class="tenant-info">{{ tenantId }}</span>
        </div>
        
        <div class="footer-right">
          <span class="brand-hashtag">#KaraQR</span>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    .queue-screen {
      min-height: 100vh;
      background: linear-gradient(135deg, #0b0b10 0%, #1a1a2e 50%, #0b0b10 100%);
      color: #f2f2f2;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      --brand-primary: #6366f1;
      --brand-accent: #f59e0b;
      --glow-color: #06b6d4;
    }

    .queue-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 3rem;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border-bottom: 2px solid rgba(99, 102, 241, 0.3);
      min-height: 80px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      font-size: 2.5rem;
      color: var(--brand-primary);
      filter: drop-shadow(0 0 10px var(--brand-primary));
    }

    .logo-text {
      font-size: 2.2rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(45deg, var(--brand-primary), var(--glow-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    }

    .header-center {
      flex: 1;
      text-align: center;
    }

    .tagline {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--brand-accent);
      text-shadow: 0 0 15px rgba(245, 158, 11, 0.6);
      animation: subtle-glow 3s ease-in-out infinite alternate;
    }

    .current-time {
      font-size: 1.4rem;
      font-weight: 600;
      color: #e5e7eb;
      background: rgba(17, 24, 39, 0.6);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
    }

    .queue-main {
      flex: 1;
      padding: 2rem 3rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
      overflow-y: auto;
    }

    .queue-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem;
    }

    .empty-content {
      text-align: center;
    }

    .empty-icon {
      font-size: 6rem;
      color: var(--brand-primary);
      margin-bottom: 2rem;
      animation: gentle-bounce 2s ease-in-out infinite;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .section-title i {
      font-size: 2rem;
      color: var(--brand-primary);
    }

    .section-title span {
      font-size: 1.8rem;
      font-weight: 700;
      color: #e5e7eb;
      text-transform: uppercase;
    }

    .performer-card {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.8), rgba(31, 41, 55, 0.6));
      border: 2px solid var(--glow-color);
      border-radius: 1.5rem;
      padding: 3rem;
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .performer-name {
      font-size: clamp(2.5rem, 5vw, 4.5rem);
      font-weight: 900;
      margin: 0 0 1rem 0;
      color: #ffffff;
      text-shadow: 0 0 20px var(--glow-color);
      animation: text-glow 2s ease-in-out infinite alternate;
    }

    .song-info {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .song-details {
      font-size: clamp(1.2rem, 2.5vw, 1.8rem);
      font-weight: 500;
    }

    .artist {
      color: var(--brand-accent);
      font-weight: 600;
    }

    .title {
      color: #e5e7eb;
    }

    .youtube-btn {
      background: linear-gradient(45deg, #ff0000, #cc0000) !important;
      border: none !important;
      color: white !important;
    }

    .performers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 400px;
      overflow-y: auto;
    }

    .performer-item {
      background: rgba(31, 41, 55, 0.6);
      border: 1px solid rgba(75, 85, 99, 0.5);
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: all 0.3s ease;
    }

    .performer-item:hover {
      border-color: var(--brand-primary);
      background: rgba(99, 102, 241, 0.1);
    }

    .position-number {
      font-size: 2rem;
      font-weight: 900;
      color: var(--brand-primary);
      background: rgba(99, 102, 241, 0.2);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .performer-details .name {
      font-size: 1.4rem;
      font-weight: 700;
      color: #ffffff;
      display: block;
      margin-bottom: 0.5rem;
    }

    .performer-details .song {
      font-size: 1.1rem;
      color: #9ca3af;
    }

    .youtube-indicator {
      color: #ff0000;
      font-size: 1.5rem;
    }

    .queue-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 3rem;
      background: rgba(0, 0, 0, 0.4);
      border-top: 1px solid rgba(75, 85, 99, 0.3);
    }

    .qr-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.95);
      padding: 1rem;
      border-radius: 1rem;
    }

    .qr-label {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .footer-right {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--brand-accent);
    }

    @keyframes text-glow {
      0% { text-shadow: 0 0 20px var(--glow-color); }
      100% { text-shadow: 0 0 30px var(--glow-color); }
    }

    @keyframes subtle-glow {
      0% { text-shadow: 0 0 15px rgba(245, 158, 11, 0.6); }
      100% { text-shadow: 0 0 25px rgba(245, 158, 11, 0.8); }
    }

    @keyframes gentle-bounce {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    @media (max-width: 1200px) {
      .performer-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class QueueComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timeInterval?: any;

  entries: QueueEntry[] = [];
  tenantId: string;
  now = new Date();
  joinUrl = '';

  constructor(
    private route: ActivatedRoute,
    private queueService: QueueService
  ) {
    // Obtener tenantId desde queryParams
    this.tenantId = this.route.snapshot.queryParamMap.get('tenant') || environment.defaultTenant;
    this.joinUrl = `${window.location.origin}/join?tenant=${this.tenantId}`;
  }

  ngOnInit(): void {
    console.log('QueueComponent inicializado para tenant:', this.tenantId);
    
    // Iniciar polling para obtener las entradas de la cola
    this.queueService.startPolling(this.tenantId, 4000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entries) => {
          this.entries = entries;
          console.log('Entradas de la cola actualizadas:', entries);
        },
        error: (error) => {
          console.error('Error al obtener entradas de la cola:', error);
        }
      });

    // Actualizar hora cada 30 segundos
    this.timeInterval = setInterval(() => {
      this.now = new Date();
    }, 30000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  /**
   * Obtiene la entrada que está actualmente cantando
   * @returns QueueEntry del cantante actual o null si nadie está performing
   */
  current(): QueueEntry | null {
    // Solo devolver si alguien está explícitamente performing
    const performing = this.entries.find(entry => entry.status === 'performing');
    return performing || null;
  }

  /**
   * Obtiene los siguientes en la cola (máximo 5)
   * @returns Array de QueueEntry con los próximos cantantes
   */
  next(): QueueEntry[] {
    const currentEntry = this.current();
    
    if (!currentEntry) {
      // Si no hay nadie performing, mostrar todos los que están waiting
      return this.entries.filter(entry => entry.status === 'waiting').slice(0, 5);
    }
    
    // Si hay alguien performing, mostrar los waiting excluyendo al actual
    const waitingEntries = this.entries.filter(entry => 
      entry.status === 'waiting' && entry.id !== currentEntry.id
    );
    
    return waitingEntries.slice(0, 5);
  }

  /**
   * Abre un enlace de YouTube en una nueva pestaña
   * @param url URL de YouTube
   */
  openYouTube(url: string): void {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Obtiene el severity para PrimeNG Tag basado en el status
   * @param status Status de la entrada
   * @returns String con el severity para p-tag
   */
  severity(status?: string): string {
    switch (status) {
      case 'performing':
        return 'success';
      case 'called':
        return 'info';
      case 'waiting':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  /**
   * Parsea el título de la canción para separar artista y tema
   * @param raw Título completo de la canción
   * @returns Objeto con artista y tema separados
   */
  parseTitle(raw?: string): { artist: string; title: string } {
    if (!raw) {
      return { artist: '', title: 'Sin título' };
    }

    // Intentar dividir por " - "
    const parts = raw.split(' - ');
    
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim()
      };
    }
    
    // Si no hay " - ", devolver todo como título
    return {
      artist: '',
      title: raw.trim()
    };
  }

  /**
   * Obtiene el texto de estado legible
   * @param status Status de la entrada
   * @returns String con el texto del status
   */
  getStatusText(status?: string): string {
    switch (status) {
      case 'performing':
        return 'EN ESCENA';
      case 'called':
        return 'LLAMADO';
      case 'waiting':
        return 'ESPERANDO';
      default:
        return 'PENDIENTE';
    }
  }

  /**
   * Verifica si hay entradas en la cola
   * @returns true si hay entradas, false si está vacía
   */
  hasEntries(): boolean {
    return this.entries.length > 0;
  }
}