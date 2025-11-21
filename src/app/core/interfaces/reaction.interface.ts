/**
 * Interfaces para el sistema de reacciones en tiempo real
 * Compatible con el sistema Vue KaraQR Singer
 */

/**
 * Tipos de reacciones disponibles
 */
export type ReactionType = 'love' | 'fire' | 'clap' | 'music' | 'amazing';

/**
 * Estructura de una reacción individual
 */
export interface Reaction {
  type: ReactionType;
  emoji: string;
  userId?: string;
  userName?: string;
  timestamp: number;
  tenantId: string;
}

/**
 * Estructura de un comentario
 */
export interface Comment {
  text: string;
  userId?: string;
  userName?: string;
  timestamp: number;
  tenantId: string;
}

/**
 * Mensaje de broadcast que se envía por los canales
 */
export interface ReactionMessage {
  type: 'reaction' | 'comment';
  data: Reaction | Comment;
  tenantId: string;
}

/**
 * Estadísticas de reacciones para la UI
 */
export interface ReactionStats {
  love: number;
  fire: number;
  clap: number;
  music: number;
  amazing: number;
  totalComments: number;
}

/**
 * Item del feed en tiempo real para mostrar en la UI
 */
export interface ReactionFeedItem {
  id: string;
  type: 'reaction' | 'comment';
  emoji?: string;
  text?: string;
  userName: string;
  timestamp: Date;
  reactionType?: ReactionType;
}

/**
 * Configuración del canal de reacciones
 */
export interface ReactionChannelConfig {
  tenantId: string;
  channelName: string;
  isConnected: boolean;
}

/**
 * Respuesta del servicio de reacciones
 */
export interface ReactionResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Configuración de visualización de reacciones
 */
export interface ReactionDisplayConfig {
  showAnimations: boolean;
  maxFeedItems: number;
  autoHideDelay: number;
  position: 'top' | 'bottom' | 'overlay';
}