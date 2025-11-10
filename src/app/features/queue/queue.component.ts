import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { TenantService } from '../../core/services/tenant.service';
import { UrlService } from '../../core/services/url.service';
import { QueueEntry } from '../../core/interfaces';
import { Tenant } from '../../core/models/tenant.model';
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
          <div class="tenant-header-info">
            <img 
              [src]="tenantData?.logo_url || '/layout/images/logo/logo.png'" 
              [alt]="tenantData?.display_name || tenantId"
              class="tenant-header-logo"
              (error)="onImageError($event)"
            />
            <div class="tenant-header-text">
              <span class="tenant-header-name">{{ tenantData?.display_name || tenantId }}</span>
              <span class="current-time">{{ now | date:'shortTime' }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido Principal -->
      <main class="queue-main">
        
        <!-- Layout Horizontal para TV / Desktop -->
        <div class="performers-horizontal-layout">
          
          <!-- Cantante Actual -->
          <section class="current-performer-section">
            <div class="section-title">
              <i class="pi pi-play-circle"></i>
              <span>Ahora en escena</span>
            </div>
            
            <!-- Cuando hay cantante actual -->
            <div class="performer-card" *ngIf="current() as currentSinger; else noCurrentSinger">
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
                  label="YouTube"
                  severity="help"
                  size="large"
                  class="youtube-btn"
                  (click)="openYouTube(currentSinger.youtube_url || currentSinger.youtubeLink || '')"
                  [outlined]="true">
                </p-button>
              </div>
            </div>

            <!-- Template cuando no hay cantante actual -->
            <ng-template #noCurrentSinger>
              <div class="performer-card waiting-state">
                <div class="waiting-content">
                  <i class="pi pi-clock waiting-icon"></i>
                  <h2 class="waiting-title">🎶 En espera del próximo cantante...</h2>
                  <p class="waiting-subtitle">¡Escanea el QR para anotarte al karaoke!</p>
                </div>
              </div>
            </ng-template>
          </section>

          <!-- Divisor Vertical -->
          <div class="vertical-divider"></div>

          <!-- Próximos Cantantes -->
          <section class="next-performers-section">
            <div class="section-title">
              <i class="pi pi-forward"></i>
              <span>Siguen</span>
            </div>
            
            <!-- Cuando hay próximos cantantes -->
            <div *ngIf="next() as nextSingers">
              <div *ngIf="nextSingers.length > 0; else showQRCodeWhenEmpty">
                <div class="performers-list">
                  <div 
                    class="performer-item" 
                    *ngFor="let performer of nextSingers; let i = index; trackBy: trackByPerformer"
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

                <!-- QR Code cuando hay cantantes -->
                <div class="qr-section-next">
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

              <!-- Template cuando lista está vacía - Mostrar QR prominente -->
              <ng-template #showQRCodeWhenEmpty>
                <div class="qr-section-next prominent">
                  <qrcode 
                    [qrdata]="joinUrl" 
                    [width]="120"
                    [elementType]="'canvas'"
                    [margin]="2"
                    class="qr-code">
                  </qrcode>
                  <span class="qr-label">Escanea para anotarte al karaoke</span>
                </div>
              </ng-template>
            </div>

            <!-- Fallback si next() es null/undefined -->
            <div *ngIf="!next()" class="qr-section-next prominent">
              <qrcode 
                [qrdata]="joinUrl" 
                [width]="120"
                [elementType]="'canvas'"
                [margin]="2"
                class="qr-code">
              </qrcode>
              <span class="qr-label">Escanea para anotarte al karaoke</span>
            </div>
          </section>

        </div>

      </main>

      <!-- Compact Footer -->
      <footer class="queue-footer">
        <div class="footer-content">
          <div class="tenant-info">
            <img 
              [src]="tenantData?.logo_url || '/layout/images/logo/logo.png'" 
              [alt]="tenantData?.display_name || tenantId"
              class="tenant-logo"
              (error)="onImageError($event)"
            />
            <span class="tenant-name">{{ tenantData?.display_name || tenantId }}</span>
          </div>
          <span class="powered-by">Powered by KaraQR</span>
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
      overflow-y: auto;
    }

    /* Layout Horizontal para pantallas grandes */
    .performers-horizontal-layout {
      display: grid;
      grid-template-columns: 2fr auto 1.5fr;
      gap: 2rem;
      align-items: start;
      min-height: 0;
      height: 100%;
    }

    /* Divisor vertical */
    .vertical-divider {
      width: 2px;
      background: linear-gradient(to bottom, transparent, var(--brand-primary), transparent);
      min-height: 200px;
      margin: 2rem 0;
      position: relative;
    }

    .vertical-divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 12px;
      height: 12px;
      background: var(--brand-primary);
      border-radius: 50%;
      box-shadow: 0 0 15px var(--brand-primary);
    }

    /* Secciones principales */
    .current-performer-section,
    .next-performers-section {
      display: flex;
      flex-direction: column;
      height: 100%;
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
      padding: 2rem;
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      height: 100%;
      min-height: 250px;
    }

    /* Waiting state styles */
    .performer-card.waiting-state {
      border: 2px solid rgba(156, 163, 175, 0.5);
      box-shadow: 0 0 20px rgba(156, 163, 175, 0.2);
      background: linear-gradient(135deg, rgba(55, 65, 81, 0.6), rgba(75, 85, 99, 0.4));
    }

    .waiting-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
      gap: 1rem;
    }

    .waiting-icon {
      font-size: 3rem;
      color: #9ca3af;
      margin-bottom: 0.5rem;
    }

    .waiting-title {
      font-size: clamp(1.5rem, 3vw, 2.5rem);
      font-weight: 700;
      margin: 0;
      color: #d1d5db;
    }

    .waiting-subtitle {
      font-size: clamp(1rem, 2vw, 1.3rem);
      color: #9ca3af;
      margin: 0;
    }

    .performer-info {
      flex: 1;
    }

    .performer-name {
      font-size: clamp(2rem, 4vw, 3.5rem);
      font-weight: 900;
      margin: 0 0 1rem 0;
      color: #ffffff;
      text-shadow: 0 0 20px var(--glow-color);
      animation: text-glow 2s ease-in-out infinite alternate;
      line-height: 1.1;
    }

    .song-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .song-details {
      font-size: clamp(1rem, 2vw, 1.4rem);
      font-weight: 500;
      line-height: 1.3;
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
      gap: 0.8rem;
      height: 100%;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .performer-item {
      background: rgba(31, 41, 55, 0.6);
      border: 1px solid rgba(75, 85, 99, 0.5);
      border-radius: 0.8rem;
      padding: 1rem 1.2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      min-height: 60px;
      flex-shrink: 0;
    }

    .performer-item:hover {
      border-color: var(--brand-primary);
      background: rgba(99, 102, 241, 0.1);
      transform: translateX(5px);
    }

    .position-number {
      font-size: 1.4rem;
      font-weight: 900;
      color: var(--brand-primary);
      background: rgba(99, 102, 241, 0.2);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .performer-details {
      flex: 1;
      min-width: 0;
    }

    .performer-details .name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff;
      display: block;
      margin-bottom: 0.3rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .performer-details .song {
      font-size: 0.95rem;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .youtube-indicator {
      color: #ff0000;
      font-size: 1.5rem;
    }

    /* QR Section in Next Performers */
    .qr-section-next {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.95);
      padding: 1rem;
      border-radius: 1rem;
      margin-top: 1.5rem;
    }

    .qr-section-next .qr-code {
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .qr-section-next .qr-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #1f2937;
      text-align: center;
    }

    /* QR Section prominent when no singers */
    .qr-section-next.prominent {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.95));
      padding: 2rem;
      margin-top: 2rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      border: 2px solid rgba(59, 130, 246, 0.3);
    }

    .qr-section-next.prominent .qr-label {
      font-size: 1.1rem;
      color: #374151;
      margin-top: 0.5rem;
    }

    /* QR Section Central when no singers */
    .qr-section-central {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      background: rgba(255, 255, 255, 0.95);
      padding: 2rem;
      border-radius: 1.5rem;
      margin-top: 2rem;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .qr-code-large {
      border-radius: 1rem;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .qr-label-central {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      text-align: center;
      margin-top: 0.5rem;
    }

    /* Compact Footer */
    .queue-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1rem 3rem;
      background: rgba(0, 0, 0, 0.4);
      border-top: 1px solid rgba(75, 85, 99, 0.3);
    }

    .footer-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .tenant-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.95);
      padding: 0.75rem 1rem;
      border-radius: 1rem;
    }

    .tenant-logo {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 50%;
      border: 2px solid var(--brand-primary);
    }

    .tenant-name {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .powered-by {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
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

    /* Responsividad para pantallas medianas (tablets landscape) */
    @media (max-width: 1400px) {
      .performers-horizontal-layout {
        grid-template-columns: 1.8fr auto 1.2fr;
        gap: 1.5rem;
      }
      
      .performer-name {
        font-size: clamp(1.8rem, 3.5vw, 3rem);
      }
      
      .song-details {
        font-size: clamp(0.9rem, 1.8vw, 1.2rem);
      }
    }

    /* Responsividad para pantallas pequeñas (tablets portrait y móviles) */
    @media (max-width: 1024px) {
      .queue-header {
        padding: 1rem 2rem;
        flex-wrap: wrap;
        gap: 1rem;
        min-height: auto;
      }

      .header-center {
        order: 3;
        flex-basis: 100%;
      }

      .tagline {
        font-size: 1.2rem;
      }

      .queue-main {
        padding: 1.5rem 2rem;
      }

      /* Layout vertical para pantallas pequeñas */
      .performers-horizontal-layout {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .vertical-divider {
        display: none;
      }

      .current-performer-section {
        order: 1;
      }

      .next-performers-section {
        order: 2;
        max-height: 300px;
        overflow-y: auto;
      }

      .performer-card {
        padding: 1.5rem;
        min-height: 200px;
      }

      .performer-name {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        margin-bottom: 0.8rem;
      }

      .song-details {
        font-size: clamp(0.9rem, 2.5vw, 1.1rem);
      }

      .queue-footer {
        padding: 1rem 2rem;
      }

      .footer-content {
        gap: 1.5rem;
      }

      .qr-section-next {
        padding: 0.8rem;
        margin-top: 1.2rem;
      }
    }

    /* Responsividad para móviles */
    @media (max-width: 768px) {
      .queue-header {
        padding: 0.8rem 1rem;
      }

      .logo-text {
        font-size: 1.8rem;
      }

      .logo-icon {
        font-size: 2rem;
      }

      .tagline {
        font-size: 1rem;
      }

      .current-time {
        font-size: 1.1rem;
        padding: 0.4rem 0.8rem;
      }

      .queue-main {
        padding: 1rem;
      }

      .section-title i {
        font-size: 1.5rem;
      }

      .section-title span {
        font-size: 1.4rem;
      }

      .performer-card {
        padding: 1.2rem;
        min-height: 150px;
      }

      .waiting-icon {
        font-size: 2rem;
      }

      .waiting-title {
        font-size: 1.5rem;
      }

      .waiting-subtitle {
        font-size: 1rem;
      }

      .qr-section-next.prominent {
        padding: 1.5rem;
        margin-top: 1.5rem;
      }

      .performer-item {
        padding: 0.8rem 1rem;
        min-height: 50px;
      }

      .position-number {
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
      }

      .performer-details .name {
        font-size: 1rem;
      }

      .performer-details .song {
        font-size: 0.85rem;
      }

      .youtube-indicator {
        font-size: 1.2rem;
      }

      .queue-footer {
        padding: 0.8rem 1rem;
      }

      .footer-content {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
      }

      .qr-section-next {
        margin-top: 1rem;
        padding: 0.8rem;
      }

      .qr-section-central {
        padding: 1.5rem;
        margin-top: 1.5rem;
      }

      .qr-label-central {
        font-size: 1rem;
      }

      .tenant-info {
        padding: 0.5rem;
        gap: 0.5rem;
      }

      .tenant-logo {
        width: 28px;
        height: 28px;
      }

      .tenant-name {
        font-size: 0.9rem;
      }
    }
  `]
})
export class QueueComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timeInterval?: any;

  entries: QueueEntry[] = [];
  tenantId: string;
  tenantData: Tenant | null = null;
  now = new Date();
  joinUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private queueService: QueueService,
    private tenantService: TenantService,
    private urlService: UrlService
  ) {
    // Obtener tenantId desde queryParams
    this.tenantId = this.route.snapshot.queryParamMap.get('tenant') || environment.defaultTenant;
    this.joinUrl = this.urlService.buildJoinUrl(this.tenantId);
    
    // LOG para verificar environment en producción
    console.log('Environment baseUrl:', environment.baseUrl);
    console.log('Environment production:', environment.production);
    console.log('Generated joinUrl:', this.joinUrl);
  }

  ngOnInit(): void {
    console.log('QueueComponent inicializado para tenant:', this.tenantId);
    
    // Validar tenant antes de continuar
    this.validateTenantAndRedirect();
  }

  /**
   * Valida que el tenant existe y redirige a screen si es inválido
   */
  private validateTenantAndRedirect(): void {
    // Si no hay tenant ID, redirigir a screen
    if (!this.tenantId || this.tenantId.trim() === '') {
      console.log('No tenant ID proporcionado, redirigiendo a screen');
      this.router.navigate(['/screen']);
      return;
    }

    // Cargar datos del tenant y verificar que existe
    this.tenantService.getTenantDetails(this.tenantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenant) => {
          if (!tenant) {
            console.log('Tenant no encontrado:', this.tenantId, 'redirigiendo a screen');
            this.router.navigate(['/screen']);
            return;
          }

          // Tenant válido, continuar con la inicialización
          this.tenantData = tenant;
          console.log('Tenant válido, cargando queue:', tenant);
          this.initializeQueue();
        },
        error: (error) => {
          console.error('Error validando tenant:', error);
          this.router.navigate(['/screen']);
        }
      });
  }

  /**
   * Inicializar la cola después de validar el tenant
   */
  private initializeQueue(): void {
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

  /**
   * TrackBy function para optimizar la lista de performers
   * @param index Índice del elemento
   * @param item QueueEntry
   * @returns ID único del elemento
   */
  trackByPerformer(index: number, item: QueueEntry): any {
    return item.id || index;
  }

  /**
   * Manejar errores de carga de imagen del logo
   */
  onImageError(event: any): void {
    console.log('Error cargando logo del tenant, usando imagen por defecto');
    event.target.src = '/layout/images/logo/logo.png';
  }
}