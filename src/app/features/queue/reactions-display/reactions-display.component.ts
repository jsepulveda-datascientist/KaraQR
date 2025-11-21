import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate, keyframes, state } from '@angular/animations';

// Services
import { ReactionsService } from '../../../core/services/reactions.service';

// Interfaces
import { 
  ReactionStats, 
  ReactionFeedItem, 
  ReactionType 
} from '../../../core/interfaces/reaction.interface';

interface FlyingReaction {
  id: string;
  emoji: string;
  x: number;
  color: string;
  type: ReactionType;
  userName: string;
}

interface FlyingComment {
  id: string;
  text: string;
  x: number;
  userName: string;
}

@Component({
  selector: 'app-reactions-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reactions-display.component.html',
  styleUrls: ['./reactions-display.component.scss'],
  animations: [
    // Animación para reacciones volando
    trigger('flyAnimation', [
      transition(':enter', [
        style({ 
          transform: 'translateY(100px) scale(0)', 
          opacity: 0 
        }),
        animate('4s ease-out', keyframes([
          style({ 
            transform: 'translateY(80px) scale(0.8)', 
            opacity: 0.5, 
            offset: 0.15 
          }),
          style({ 
            transform: 'translateY(40px) scale(1.2)', 
            opacity: 0.9, 
            offset: 0.4 
          }),
          style({ 
            transform: 'translateY(0px) scale(1)', 
            opacity: 1, 
            offset: 0.6 
          }),
          style({ 
            transform: 'translateY(-40px) scale(0.9)', 
            opacity: 0.8, 
            offset: 0.85 
          }),
          style({ 
            transform: 'translateY(-80px) scale(0.6)', 
            opacity: 0.3, 
            offset: 0.96 
          }),
          style({ 
            transform: 'translateY(-120px) scale(0)', 
            opacity: 0, 
            offset: 1 
          })
        ]))
      ]),
      transition(':leave', [
        animate('0ms', style({ 
          opacity: 0, 
          transform: 'scale(0)' 
        }))
      ])
    ]),
    
    // Animación para contadores
    trigger('countAnimation', [
      transition('* => *', [
        style({ transform: 'scale(1.3)', color: '#ff6b6b' }),
        animate('300ms ease-out', style({ transform: 'scale(1)', color: '*' }))
      ])
    ]),
    
    // Animación para items del feed
    trigger('slideInAnimation', [
      transition(':enter', [
        style({ 
          transform: 'translateX(-100%)', 
          opacity: 0 
        }),
        animate('300ms ease-out', style({ 
          transform: 'translateX(0)', 
          opacity: 1 
        }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ 
          transform: 'translateX(100%)', 
          opacity: 0 
        }))
      ])
    ])
  ]
})
export class ReactionsDisplayComponent implements OnInit, OnDestroy, OnChanges {
  @Input() tenantId: string = '';
  @Input() showStats: boolean = true;
  @Input() showFeed: boolean = true;
  @Input() showAnimations: boolean = true;
  @Input() autoConnect: boolean = true;
  @Input() isVisible: boolean = true;

  private destroy$ = new Subject<void>();
  private animationCleanup$ = new Subject<void>();

  // Observables del servicio
  stats$: Observable<ReactionStats>;
  feed$: Observable<ReactionFeedItem[]>;
  isConnected$: Observable<boolean>;

  // Estado local
  flyingReactions: FlyingReaction[] = [];
  flyingComments: FlyingComment[] = [];
  availableReactions = [
    { type: 'love' as ReactionType, emoji: '❤️', label: 'Amor', color: '#e91e63' },
    { type: 'fire' as ReactionType, emoji: '🔥', label: 'Fuego', color: '#ff5722' },
    { type: 'clap' as ReactionType, emoji: '👏', label: 'Aplauso', color: '#4caf50' },
    { type: 'music' as ReactionType, emoji: '🎵', label: 'Música', color: '#2196f3' },
    { type: 'amazing' as ReactionType, emoji: '😍', label: 'Increíble', color: '#9c27b0' }
  ];

  constructor(private reactionsService: ReactionsService) {
    // Conectar observables
    this.stats$ = this.reactionsService.stats$;
    this.feed$ = this.reactionsService.feed$;
    this.isConnected$ = this.reactionsService.connection$;
  }

  async ngOnInit(): Promise<void> {
    console.log(`📋 ReactionsDisplayComponent inicializado:`, {
      tenantId: this.tenantId,
      autoConnect: this.autoConnect,
      isVisible: this.isVisible,
      showStats: this.showStats,
      showAnimations: this.showAnimations
    });

    // Conectar siempre si tenemos tenantId (mantenemos conexión estable)
    if (this.tenantId) {
      try {
        console.log(`🚀 [${this.tenantId}] Conectando en ngOnInit (conexión estable)`);
        await this.connectToReactions();
      } catch (error) {
        console.error('Error en auto-conexión:', error);
      }
    } else {
      console.log(`⏸️ [${this.tenantId}] No conectando: falta tenantId`);
    }

    // Escuchar cambios en el feed para animaciones
    if (this.showAnimations) {
      this.setupFeedAnimations();
    }

    // Limpiar animaciones periódicamente
    this.setupAnimationCleanup();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    // Solo registrar cambios para debugging, no reconectar
    if (changes['autoConnect'] || changes['isVisible'] || changes['showStats']) {
      console.log(`🔄 ReactionsDisplay [${this.tenantId}] - Props cambiaron:`, {
        autoConnect: changes['autoConnect']?.currentValue ?? this.autoConnect,
        isVisible: changes['isVisible']?.currentValue ?? this.isVisible,
        showStats: changes['showStats']?.currentValue ?? this.showStats,
        tenantId: this.tenantId
      });
      
      // Ya no desconectamos/reconectamos, mantenemos la conexión estable
    }
  }

  ngOnDestroy(): void {
    console.log(`ReactionsDisplay [${this.tenantId}] - Destruyendo componente`);
    this.disconnectFromReactions();
    this.destroy$.next();
    this.destroy$.complete();
    this.animationCleanup$.next();
    this.animationCleanup$.complete();
  }

  /**
   * Conectar al servicio de reacciones
   */
  async connectToReactions(): Promise<void> {
    if (!this.tenantId) {
      console.warn('⚠️ No se puede conectar: tenantId no proporcionado');
      return;
    }

    try {
      console.log(`🔗 [${this.tenantId}] Conectando display de reacciones...`);
      const response = await this.reactionsService.connect(this.tenantId);
      
      if (response.success) {
        console.log('✅ Display de reacciones conectado');
      } else {
        console.error('❌ Error conectando display:', response.message);
      }
    } catch (error) {
      console.error('💥 Error en conexión de display:', error);
    }
  }

  /**
   * Desconectar del servicio de reacciones
   */
  async disconnectFromReactions(): Promise<void> {
    try {
      console.log(`🔌 Desconectando display de reacciones [${this.tenantId}]`);
      await this.reactionsService.disconnect();
      console.log(`✅ Display de reacciones desconectado [${this.tenantId}]`);
    } catch (error) {
      console.error('💥 Error al desconectar display:', error);
    }
  }

  /**
   * Configurar animaciones basadas en el feed
   */
  private setupFeedAnimations(): void {
    let lastFeedLength = 0;

    this.feed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(feed => {
        // Solo animar si hay nuevos items
        if (feed.length > lastFeedLength) {
          const newItems = feed.slice(0, feed.length - lastFeedLength);
          
          newItems.forEach(item => {
            if (item.type === 'reaction' && item.reactionType) {
              this.createFlyingReaction(item.reactionType, item.userName);
            } else if (item.type === 'comment' && item.text) {
              this.createFlyingComment(item.text, item.userName);
            }
          });
        }
        
        lastFeedLength = feed.length;
      });
  }

  /**
   * Crear animación de reacción voladora
   */
  private createFlyingReaction(type: ReactionType, userName: string = 'Alguien'): void {
    const reaction = this.availableReactions.find(r => r.type === type);
    if (!reaction) return;

    const flyingReaction: FlyingReaction = {
      id: `flying_${Date.now()}_${Math.random()}`,
      emoji: reaction.emoji,
      x: Math.random() * 70 + 15, // 15% a 85% del ancho para evitar bordes
      color: reaction.color,
      type: type,
      userName: userName
    };

    this.flyingReactions.push(flyingReaction);

    // Remover exactamente cuando termina la animación (4 segundos)
    setTimeout(() => {
      this.flyingReactions = this.flyingReactions.filter(
        r => r.id !== flyingReaction.id
      );
    }, 4000);
  }

  /**
   * Crear animación de comentario volador
   */
  private createFlyingComment(text: string, userName: string = 'Alguien'): void {
    const flyingComment: FlyingComment = {
      id: `comment_${Date.now()}_${Math.random()}`,
      text: text.length > 50 ? text.substring(0, 47) + '...' : text, // Limitar longitud
      x: Math.random() * 60 + 20, // 20% a 80% del ancho para comentarios más largos
      userName: userName
    };

    this.flyingComments.push(flyingComment);

    // Remover exactamente cuando termina la animación (4 segundos)
    setTimeout(() => {
      this.flyingComments = this.flyingComments.filter(
        c => c.id !== flyingComment.id
      );
    }, 4000);
  }

  /**
   * Configurar limpieza automática de animaciones
   */
  private setupAnimationCleanup(): void {
    interval(5000)
      .pipe(takeUntil(this.animationCleanup$))
      .subscribe(() => {
        // Limpiar animaciones viejas
        this.flyingReactions = this.flyingReactions.slice(-20);
        this.flyingComments = this.flyingComments.slice(-20);
      });
  }

  /**
   * Obtener valor de estadística para un tipo de reacción
   */
  getStatValue(stats: ReactionStats, type: ReactionType): number {
    return stats[type] || 0;
  }

  /**
   * Formatear timestamp para mostrar
   */
  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) { // Menos de 1 minuto
      return 'ahora';
    } else if (diff < 3600000) { // Menos de 1 hora
      const minutes = Math.floor(diff / 60000);
      return `hace ${minutes}m`;
    } else {
      const hours = Math.floor(diff / 3600000);
      return `hace ${hours}h`;
    }
  }

  /**
   * Limpiar feed de reacciones
   */
  clearFeed(): void {
    this.reactionsService.clearFeed();
  }

  /**
   * Tracking functions para *ngFor optimization
   */
  trackByReaction(index: number, item: FlyingReaction): string {
    return item.id;
  }

  trackByComment(index: number, item: FlyingComment): string {
    return item.id;
  }

  trackByFeedItem(index: number, item: ReactionFeedItem): string {
    return item.id;
  }
}