import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

// QR Code
import { QRCodeComponent } from 'angularx-qrcode';

// Reactions Component
import { ReactionsDisplayComponent } from './reactions-display/reactions-display.component';

// Services
import { QueueService } from '../../core/services/queue.service';
import { TenantService } from '../../core/services/tenant.service';
import { UrlService } from '../../core/services/url.service';
import { ReactionsService } from '../../core/services/reactions.service';
import { QueueEntry } from '../../core/interfaces';
import { Tenant } from '../../core/models/tenant.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TagModule,
    CardModule,
    ButtonModule,
    DividerModule,
    QRCodeComponent,
    ReactionsDisplayComponent
  ],
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timeInterval?: any;
  private queueRefreshInterval?: any; // Add auto-refresh interval
  private currentPerformingEntry: QueueEntry | null = null;
  private currentVideoId: string | null = null;
  private presentationPlayer: any = null; // Only keep presentation overlay player

  // Component properties
  tenantId: string = '';
  tenantData?: Tenant;
  entries: QueueEntry[] = [];
  performingEntry: QueueEntry | null = null;
  now: Date = new Date();
  joinUrl: string = '';
  presentationMode = false; // Control for presentation overlay

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private queueService: QueueService,
    private tenantService: TenantService,
    private urlService: UrlService,
    private reactionsService: ReactionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.validateTenantAndRedirect();
    this.setupTimeUpdater();
    this.loadYouTubeAPI(); // Load YouTube API for presentation overlay
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.queueRefreshInterval) {
      clearInterval(this.queueRefreshInterval);
    }
    this.destroyPresentationPlayer();
  }

  private validateTenantAndRedirect(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      console.log('🔍 Route params received:', params);
      this.tenantId = params['tenantId'];
      console.log('🏢 Tenant ID:', this.tenantId);
      
      if (!this.tenantId) {
        console.log('❌ No tenant ID found, redirecting to home');
        this.router.navigate(['/']);
        return;
      }

      console.log('✅ Valid tenant ID, loading data...');
      this.loadTenantData();
      this.generateJoinUrl();
      this.loadQueue();
      this.setupQueueAutoRefresh(); // Add auto-refresh for queue
    });
  }

  private loadTenantData(): void {
    this.tenantService.getTenant(this.tenantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenant: Tenant | null) => {
          this.tenantData = tenant || undefined;
        },
        error: (error: any) => {
          console.error('Error loading tenant data:', error);
        }
      });
  }

  private generateJoinUrl(): void {
    this.joinUrl = this.urlService.buildJoinUrl(this.tenantId);
  }

  private setupTimeUpdater(): void {
    this.now = new Date();
    this.timeInterval = setInterval(() => {
      this.now = new Date();
    }, 30000);
  }

  private setupQueueAutoRefresh(): void {
    // Auto-refresh queue every 5 seconds for real-time updates
    console.log('🔄 Setting up auto-refresh for queue every 5 seconds');
    this.queueRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing queue...');
      this.loadQueue();
    }, 5000);
  }

  private loadQueue(): void {
    this.queueService.list(this.tenantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const entries = (response.data || response || []).sort((a: QueueEntry, b: QueueEntry) => {
            const aTime = new Date(a.created_at || 0).getTime();
            const bTime = new Date(b.created_at || 0).getTime();
            return aTime - bTime;
          });
          
          console.log(`📋 Queue loaded: ${entries.length} entries`);
          
          // Always use real data - no test data override
          this.entries = entries;
          this.updateCurrentPerformer();
        },
        error: (error: any) => {
          console.error('Error loading queue:', error);
          // On error, show empty queue - no test data fallback
          this.entries = [];
          this.updateCurrentPerformer();
        }
      });
  }

  private updateCurrentPerformer(): void {
    const newPerforming = this.entries.find(entry => entry.status === 'performing') || null;
    
    if (newPerforming?.id !== this.currentPerformingEntry?.id) {
      this.currentPerformingEntry = newPerforming;
      this.performingEntry = newPerforming;
      this.onPerformingStatusChange(newPerforming);
    }
  }

  private onPerformingStatusChange(newPerformingEntry: QueueEntry | null): void {
    console.log('🎭 Performing status changed:', newPerformingEntry);
    
    if (newPerformingEntry) {
      // Check all possible fields for YouTube URL
      const title = newPerformingEntry.title_raw || newPerformingEntry.song || '';
      const youtubeUrl = newPerformingEntry.youtube_url || newPerformingEntry.youtubeUrl || '';
      
      console.log('🎵 Checking title for YouTube:', title);
      console.log('🎵 Checking youtube_url field:', youtubeUrl);
      console.log('🎵 Full entry data:', newPerformingEntry);
      
      // Try to extract from title first, then from dedicated youtube field
      let videoId = this.extractYouTubeId(title);
      if (!videoId && youtubeUrl) {
        console.log('🔍 Trying dedicated YouTube URL field...');
        videoId = this.extractYouTubeId(youtubeUrl);
      }
      
      console.log('🎬 Final extracted video ID:', videoId);
      
      if (videoId && videoId !== this.currentVideoId) {
        this.currentVideoId = videoId;
        // Auto-activate presentation mode when YouTube video is detected
        console.log('🎥 Auto-activating video for TV projection');
        console.log('🎭 REACCIONES: Cambiando a modo presentación - desactivando pantalla principal, activando video');
        this.presentationMode = true;
        this.cdr.detectChanges(); // Forzar detección de cambios
        
        // Wait for DOM and YouTube API
        setTimeout(() => {
          console.log('🎬 Creating presentation player...');
          this.createPresentationPlayer();
        }, 500);
      } else if (!videoId) {
        // No video available, deactivate presentation mode
        console.log('❌ No video detected, deactivating presentation mode');
        console.log('🎭 REACCIONES: Volviendo a modo normal - activando pantalla principal, desactivando video');
        this.presentationMode = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        this.destroyPresentationPlayer();
      }
    } else {
      console.log('❌ No performing entry, deactivating presentation mode');
      console.log('🎭 REACCIONES: Sin cantante actual - volviendo a modo normal');
      this.currentVideoId = null;
      this.presentationMode = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
      this.destroyPresentationPlayer();
    }
  }

  // Computed properties
  current() {
    return this.performingEntry;
  }

  called() {
    return this.entries.find(entry => entry.status === 'called') || null;
  }

  next() {
    return this.entries
      .filter(entry => entry.status === 'waiting')
      .sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return aTime - bTime;
      });
  }

  // YouTube API and Player Management
  private loadYouTubeAPI(): void {
    console.log('🔧 Loading YouTube IFrame API...');
    
    if (typeof window !== 'undefined' && !(window as any).YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);

      (window as any).onYouTubeIframeAPIReady = () => {
        console.log('✅ YouTube API Ready!');
      };
    } else if ((window as any).YT) {
      console.log('✅ YouTube API already loaded');
    }
  }

  private createPresentationPlayer(): void {
    if (!this.currentVideoId) {
      console.log('❌ No video ID available for player');
      return;
    }

    console.log('🎬 Creating presentation player for video ID:', this.currentVideoId);
    this.destroyPresentationPlayer();

    const element = document.getElementById('presentation-youtube-player');
    if (!element) {
      console.error('❌ Player element not found in DOM');
      return;
    }

    console.log('✅ Player element found, checking YouTube API...');

    if (typeof window !== 'undefined' && (window as any).YT && (window as any).YT.Player) {
      console.log('✅ YouTube API ready, creating player...');
      try {
        this.presentationPlayer = new (window as any).YT.Player('presentation-youtube-player', {
          videoId: this.currentVideoId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3
          },
          events: {
            onReady: (event: any) => {
              console.log('🎉 Presentation YouTube player ready!');
              event.target.playVideo();
            },
            onError: (event: any) => {
              console.error('❌ Presentation YouTube player error:', event.data);
            }
          }
        });
      } catch (error) {
        console.error('❌ Error creating YouTube player:', error);
      }
    } else {
      console.log('⏳ YouTube API not ready yet, retrying in 1 second...');
      setTimeout(() => {
        this.createPresentationPlayer();
      }, 1000);
    }
  }

  private destroyPresentationPlayer(): void {
    if (this.presentationPlayer) {
      try {
        this.presentationPlayer.destroy();
      } catch (error) {
        console.warn('Error destroying presentation player:', error);
      }
      this.presentationPlayer = null;
    }
  }

  // Public methods for YouTube functionality
  extractYouTubeId(text: string | undefined): string | null {
    if (!text) return null;
    
    console.log('🔍 Checking for YouTube URL in:', text);
    
    // Only extract YouTube IDs from actual URLs - respect user's song choice
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        console.log('✅ YouTube ID found from URL:', match[1]);
        return match[1];
      }
    }
    
    console.log('ℹ️ No YouTube URL found - respecting user song choice');
    return null;
  }

  parseTitle(title: string | undefined): { artist?: string; title: string } {
    if (!title) return { title: '' };

    const separators = [' - ', ' by ', ' | '];
    for (const separator of separators) {
      const parts = title.split(separator);
      if (parts.length >= 2) {
        const artist = parts[0].trim();
        const songTitle = parts.slice(1).join(separator).trim();
        return {
          artist: artist,
          title: songTitle
        };
      }
    }

    return { title: title.trim() };
  }

  // Presentation Mode Management (Auto-activation)
  private activatePresentationModeAuto(): void {
    if (this.currentVideoId) {
      console.log('🎬 Auto-activating presentation mode for TV');
      this.presentationMode = true;
      this.cdr.detectChanges(); // Forzar detección de cambios
      setTimeout(() => {
        this.createPresentationPlayer();
      }, 100);
    }
  }

  // Utility methods
  onImageError(event: any): void {
    event.target.src = '/layout/images/logo/logo.png';
  }
}