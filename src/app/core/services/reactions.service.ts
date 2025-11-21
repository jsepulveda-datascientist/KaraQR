import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supa.service';
import {
  Reaction,
  Comment,
  ReactionMessage,
  ReactionType,
  ReactionStats,
  ReactionFeedItem,
  ReactionChannelConfig,
  ReactionResponse
} from '../interfaces/reaction.interface';

/**
 * Servicio para manejar reacciones en tiempo real usando Supabase Broadcast
 * Compatible con el sistema Vue KaraQR Singer
 */
@Injectable({
  providedIn: 'root'
})
export class ReactionsService implements OnDestroy {
  private channel: any = null;
  private tenantId: string = '';
  private isConnected = false;

  // Subjects para el estado reactivo
  private connectionSubject = new BehaviorSubject<boolean>(false);
  private statsSubject = new BehaviorSubject<ReactionStats>({
    love: 0,
    fire: 0,
    clap: 0,
    music: 0,
    amazing: 0,
    totalComments: 0
  });
  private feedSubject = new BehaviorSubject<ReactionFeedItem[]>([]);

  // Observables públicos
  public connection$ = this.connectionSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();
  public feed$ = this.feedSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    console.log('ReactionsService inicializado');
  }

  /**
   * Conectar al canal de reacciones para un tenant específico
   */
  async connect(tenantId: string): Promise<ReactionResponse> {
    try {
      this.tenantId = tenantId;
      console.log('🔗 ReactionsService conectando al tenant:', tenantId);

      // Desconectar canal anterior si existe
      if (this.channel) {
        await this.disconnect();
      }

      // Crear canal específico para el tenant (mismo formato que Vue)
      const channelName = `reactions_${tenantId}`;
      console.log('🔗 Creando canal:', channelName);

      this.channel = this.supabaseService.channel(channelName, {
        config: {
          broadcast: {
            self: true, // Recibir confirmaciones
            ack: true   // Habilitar acknowledgments
          }
        }
      });

      // Configurar listeners para reacciones
      this.channel
        .on('broadcast', { event: 'reaction' }, (payload: any) => {
          console.log('📢 Reacción recibida:', payload);
          this.handleIncomingReaction(payload);
        })
        .on('broadcast', { event: 'comment' }, (payload: any) => {
          console.log('📢 Comentario recibido:', payload);
          this.handleIncomingComment(payload);
        });

      // Suscribirse al canal con Promise para manejar estados
      return new Promise((resolve, reject) => {
        this.channel.subscribe((status: string) => {
          console.log('🔗 Estado del canal de reacciones:', status);

          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            this.connectionSubject.next(true);
            console.log('✅ Canal de reacciones conectado exitosamente');
            resolve({
              success: true,
              message: 'Conectado al sistema de reacciones'
            });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            this.isConnected = false;
            this.connectionSubject.next(false);
            const errorMsg = `Error de conexión: ${status}`;
            console.error('❌', errorMsg);
            reject({
              success: false,
              message: errorMsg
            });
          }
        });

        // Timeout de seguridad
        setTimeout(() => {
          if (!this.isConnected) {
            reject({
              success: false,
              message: 'Timeout: No se pudo conectar en 10 segundos'
            });
          }
        }, 10000);
      });

    } catch (error) {
      console.error('💥 Error al conectar ReactionsService:', error);
      this.isConnected = false;
      this.connectionSubject.next(false);
      return {
        success: false,
        message: `Error de conexión: ${error}`
      };
    }
  }

  /**
   * Desconectar del canal de reacciones
   */
  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        console.log('🔌 Desconectando canal de reacciones');
        await this.supabaseService.removeChannel(this.channel);
        this.channel = null;
        this.isConnected = false;
        this.connectionSubject.next(false);
        console.log('✅ Canal desconectado');
      }
    } catch (error) {
      console.error('❌ Error al desconectar:', error);
    }
  }

  /**
   * Verificar si está conectado
   */
  isChannelConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Obtener información del canal
   */
  getChannelInfo(): ReactionChannelConfig {
    return {
      tenantId: this.tenantId,
      channelName: this.tenantId ? `reactions_${this.tenantId}` : '',
      isConnected: this.isConnected
    };
  }

  /**
   * Obtener estadísticas actuales
   */
  getCurrentStats(): ReactionStats {
    return this.statsSubject.value;
  }

  /**
   * Obtener feed actual
   */
  getCurrentFeed(): ReactionFeedItem[] {
    return this.feedSubject.value;
  }

  /**
   * Limpiar el feed de reacciones
   */
  clearFeed(): void {
    this.feedSubject.next([]);
  }

  /**
   * Resetear estadísticas
   */
  resetStats(): void {
    this.statsSubject.next({
      love: 0,
      fire: 0,
      clap: 0,
      music: 0,
      amazing: 0,
      totalComments: 0
    });
  }

  /**
   * Manejar reacción entrante del broadcast
   */
  private handleIncomingReaction(payload: any): void {
    try {
      const message = payload.payload as ReactionMessage;
      if (message.type === 'reaction' && message.tenantId === this.tenantId) {
        const reaction = message.data as Reaction;
        
        // Actualizar estadísticas
        const currentStats = this.statsSubject.value;
        const newStats = { 
          ...currentStats, 
          [reaction.type]: currentStats[reaction.type] + 1 
        };
        this.statsSubject.next(newStats);

        // Agregar al feed
        this.addToFeed({
          id: `reaction_${Date.now()}_${Math.random()}`,
          type: 'reaction',
          emoji: this.getEmojiForReaction(reaction.type),
          userName: reaction.userName || 'Anónimo',
          timestamp: new Date(reaction.timestamp),
          reactionType: reaction.type
        });
      }
    } catch (error) {
      console.error('Error procesando reacción entrante:', error);
    }
  }

  /**
   * Manejar comentario entrante del broadcast
   */
  private handleIncomingComment(payload: any): void {
    try {
      const message = payload.payload as ReactionMessage;
      if (message.type === 'comment' && message.tenantId === this.tenantId) {
        const comment = message.data as Comment;
        
        // Actualizar estadísticas
        const currentStats = this.statsSubject.value;
        this.statsSubject.next({ 
          ...currentStats, 
          totalComments: currentStats.totalComments + 1 
        });

        // Agregar al feed
        this.addToFeed({
          id: `comment_${Date.now()}_${Math.random()}`,
          type: 'comment',
          text: comment.text,
          userName: comment.userName || 'Anónimo',
          timestamp: new Date(comment.timestamp)
        });
      }
    } catch (error) {
      console.error('Error procesando comentario entrante:', error);
    }
  }

  /**
   * Agregar item al feed (mantiene máximo de 50 items)
   */
  private addToFeed(item: ReactionFeedItem): void {
    const currentFeed = this.feedSubject.value;
    const newFeed = [item, ...currentFeed].slice(0, 50); // Mantener últimos 50
    this.feedSubject.next(newFeed);
  }

  /**
   * Obtener emoji para tipo de reacción
   */
  private getEmojiForReaction(type: ReactionType): string {
    const emojiMap: Record<ReactionType, string> = {
      love: '❤️',
      fire: '🔥',
      clap: '👏',
      music: '🎵',
      amazing: '😍'
    };
    return emojiMap[type] || '👍';
  }

  /**
   * Obtener información de todas las reacciones disponibles
   */
  getAvailableReactions(): { type: ReactionType; emoji: string; label: string; color: string }[] {
    return [
      { type: 'love', emoji: '❤️', label: 'Amor', color: '#e91e63' },
      { type: 'fire', emoji: '🔥', label: 'Fuego', color: '#ff5722' },
      { type: 'clap', emoji: '👏', label: 'Aplauso', color: '#4caf50' },
      { type: 'music', emoji: '🎵', label: 'Música', color: '#2196f3' },
      { type: 'amazing', emoji: '😍', label: 'Increíble', color: '#9c27b0' }
    ];
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    this.disconnect();
    this.connectionSubject.complete();
    this.statsSubject.complete();
    this.feedSubject.complete();
  }
}