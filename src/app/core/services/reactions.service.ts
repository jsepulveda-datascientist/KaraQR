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
  
  // Sistema de reconexión
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 1000; // 1 segundo base
  private reconnectTimeout: any = null;
  private isReconnecting = false;
  
  // Límites de rate para evitar spam
  private lastConnectionAttempt = 0;
  private minConnectionInterval = 5000; // 5 segundos mínimo entre reconexiones
  
  // Control de estado
  private isDisconnecting = false;

  // Subjects para el estado reactivo
  private connectionSubject = new BehaviorSubject<boolean>(false);
  private statsSubject = new BehaviorSubject<ReactionStats>({
    love: 0,
    clap: 0,
    rock: 0,
    mindblown: 0,
    fire: 0,
    guitar: 0,
    electric: 0,
    music: 0,
    loud: 0,
    cool: 0,
    praise: 0,
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
      // Control de rate limiting
      const now = Date.now();
      if (now - this.lastConnectionAttempt < this.minConnectionInterval) {
        const waitTime = this.minConnectionInterval - (now - this.lastConnectionAttempt);
        console.warn(`⏱️ Rate limit: esperando ${waitTime}ms antes de reconectar`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.lastConnectionAttempt = Date.now();
      
      this.tenantId = tenantId;
      console.log('🔗 ReactionsService conectando al tenant:', tenantId);

      // Desconectar canal anterior si existe (con timeout)
      if (this.channel && !this.isDisconnecting) {
        await Promise.race([
          this.disconnect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout en disconnect')), 5000))
        ]);
      }

      // Crear canal específico para el tenant con configuración optimizada
      const channelName = `reactions_${tenantId}`;
      console.log('🔗 Creando canal:', channelName);

      this.channel = this.supabaseService.channel(channelName, {
        config: {
          broadcast: {
            self: false, // ❌ CAMBIO CRÍTICO: false para evitar loops
            ack: false   // ❌ Deshabilitar para reducir overhead
          },
          presence: {
            key: 'presence'
          },
          postgres_changes: {
            enabled: false  // ❌ Deshabilitar para reducir carga
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
        })
        .on('broadcast', { event: 'heartbeat' }, () => {
          // Heartbeat silencioso
        });

      // Suscribirse al canal con timeout más robusto
      return new Promise((resolve, reject) => {
        let isResolved = false;
        
        // Timeout extendido para conexiones lentas (45 segundos)
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            this.isConnected = false;
            this.connectionSubject.next(false);
            console.error('⏰ Timeout: No se pudo conectar al canal en 45 segundos');
            reject({
              success: false,
              message: 'Timeout de conexión extendido - red lenta detectada'
            });
          }
        }, 45000);
        
        this.channel.subscribe((status: string) => {
          console.log('🔗 Estado del canal de reacciones:', status);

          if (status === 'SUBSCRIBED' && !isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            this.isConnected = true;
            this.connectionSubject.next(true);
            this.reconnectAttempts = 0; // Reset contador de reconexiones
            this.clearReconnectTimeout();
            console.log('✅ Canal de reacciones conectado exitosamente');
            resolve({
              success: true,
              message: 'Conectado al sistema de reacciones'
            });
          } else if ((status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') && !isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            this.isConnected = false;
            this.connectionSubject.next(false);
            const errorMsg = `Error de conexión: ${status}`;
            console.error('❌', errorMsg);
            
            // Para TIMED_OUT, intentar reconexión inmediata si es el primer intento
            if (status === 'TIMED_OUT' && this.reconnectAttempts === 0) {
              console.log('🔄 TIMEOUT detectado, programando reconexión inmediata...');
              setTimeout(() => {
                if (!this.isDisconnecting) {
                  this.scheduleReconnect();
                }
              }, 2000);
            }
            
            reject({
              success: false,
              message: errorMsg
            });
          } else if (status === 'CLOSED') {
            this.isConnected = false;
            this.connectionSubject.next(false);
            console.warn(`❌ Error de conexión: ${status}`);
            // Solo programar reconexión si no estamos desconectando intencionalmente
            if (!this.isDisconnecting) {
              this.scheduleReconnect();
            }
          }
        });
      });

    } catch (error) {
      console.error('💥 Error al conectar ReactionsService:', error);
      this.isConnected = false;
      this.connectionSubject.next(false);
      
      // Solo programar reconexión si hay tenantId válido y no estamos desconectando
      if (this.tenantId && !this.isDisconnecting) {
        this.scheduleReconnect();
      }
      
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
      this.isDisconnecting = true;
      this.clearReconnectTimeout();
      
      if (this.channel) {
        console.log('🔌 Desconectando canal de reacciones');
        
        try {
          await Promise.race([
            this.supabaseService.removeChannel(this.channel),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout en disconnect')), 10000)
            )
          ]);
          console.log('✅ Canal desconectado');
        } catch (unsubError) {
          console.warn('⚠️ Error al desconectar canal:', unsubError);
          // Forzar limpieza aún con errores
        }
        
        this.channel = null;
        this.isConnected = false;
        this.connectionSubject.next(false);
      }
    } catch (error) {
      console.error('❌ Error al desconectar:', error);
    } finally {
      this.isDisconnecting = false;
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
      clap: 0,
      rock: 0,
      mindblown: 0,
      fire: 0,
      guitar: 0,
      electric: 0,
      music: 0,
      loud: 0,
      cool: 0,
      praise: 0,
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
   * Agregar item al feed (mantiene máximo de 200 items para sesiones largas)
   */
  private addToFeed(item: ReactionFeedItem): void {
    const currentFeed = this.feedSubject.value;
    const newFeed = [item, ...currentFeed].slice(0, 200); // Mantener últimos 200
    this.feedSubject.next(newFeed);
  }

  /**
   * Obtener emoji para tipo de reacción
   */
  private getEmojiForReaction(type: ReactionType): string {
    const emojiMap: Record<ReactionType, string> = {
      love: '❤️',
      clap: '👏',
      rock: '🤘',
      mindblown: '🤩',
      fire: '🔥',
      guitar: '🎸',
      electric: '⚡',
      music: '🎵',
      loud: '🔊',
      cool: '😎',
      praise: '🙌'
    };
    return emojiMap[type] || '👍';
  }

  /**
   * Obtener información de todas las reacciones disponibles
   */
  getAvailableReactions(): { type: ReactionType; emoji: string; label: string; color: string }[] {
    return [
      { type: 'love', emoji: '❤️', label: 'Amor', color: '#e91e63' },
      { type: 'clap', emoji: '👏', label: 'Aplauso', color: '#4caf50' },
      { type: 'rock', emoji: '🤘', label: 'Rock', color: '#f44336' },
      { type: 'mindblown', emoji: '🤩', label: 'Increíble', color: '#9c27b0' },
      { type: 'fire', emoji: '🔥', label: 'Fuego', color: '#ff5722' },
      { type: 'guitar', emoji: '🎸', label: 'Guitarra', color: '#8e24aa' },
      { type: 'electric', emoji: '⚡', label: 'Eléctrico', color: '#ffc107' },
      { type: 'music', emoji: '🎵', label: 'Música', color: '#2196f3' },
      { type: 'loud', emoji: '🔊', label: 'Volumen', color: '#009688' },
      { type: 'cool', emoji: '😎', label: 'Cool', color: '#3f51b5' },
      { type: 'praise', emoji: '🙌', label: 'Alabanza', color: '#00bcd4' }
    ];
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    this.clearReconnectTimeout();
    this.disconnect();
    this.connectionSubject.complete();
    this.statsSubject.complete();
    this.feedSubject.complete();
  }

  /**
   * Programar reconexión automática con backoff exponencial
   */
  private scheduleReconnect(): void {
    // No reconectar si estamos desconectando intencionalmente
    if (this.isDisconnecting) {
      console.info('🚫 No se programa reconexión: desconexión intencional');
      return;
    }
    
    // No reconectar si ya se agotaron los intentos
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('🚫 Se agotaron los intentos de reconexión');
      return;
    }
    
    // No reconectar si ya hay una reconexión en progreso
    if (this.isReconnecting) {
      console.warn('🔄 Ya hay una reconexión en progreso, saltando...');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    
    // Backoff exponencial con jitter: 1s, 2s, 4s, 8s, 16s
    const baseDelay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    // Agregar jitter para evitar thundering herd
    const jitter = Math.random() * 1000;
    const delay = Math.min(baseDelay + jitter, 30000); // Máximo 30 segundos
    
    console.log(`🔄 Programando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${Math.round(delay)}ms`);
    
    this.reconnectTimeout = setTimeout(async () => {
      try {
        console.log(`🔄 Intentando reconectar (intento ${this.reconnectAttempts})...`);
        await this.connect(this.tenantId);
        this.isReconnecting = false;
        console.log('✅ Reconexión exitosa');
      } catch (error) {
        console.error(`❌ Fallo en reconexión ${this.reconnectAttempts}:`, { 
          success: false, 
          message: `Error de conexión: ${error}` 
        });
        this.isReconnecting = false;
        
        // Solo continuar reconectando si no hemos alcanzado el límite
        if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isDisconnecting) {
          this.scheduleReconnect();
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('🚫 Límite de reconexiones alcanzado. Deteniendo intentos.');
        }
      }
    }, delay);
  }

  /**
   * Limpiar timeout de reconexión
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
      this.isReconnecting = false;
    }
  }

  /**
   * Forzar reconexión manual
   */
  async forceReconnect(): Promise<ReactionResponse> {
    console.log('🔄 Forzando reconexión manual...');
    this.reconnectAttempts = 0;
    this.clearReconnectTimeout();
    
    if (this.tenantId) {
      return await this.connect(this.tenantId);
    } else {
      return {
        success: false,
        message: 'No hay tenantId configurado para reconectar'
      };
    }
  }
}