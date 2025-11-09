/**
 * Tipos y modelos para la cola de karaoke
 * Basado en el esquema SQL de la tabla 'queue'
 */

export type QueueStatus = 'waiting' | 'called' | 'performing' | 'done';

export interface QueueEntry {
  id?: string;
  tenant_id: string;
  name: string;
  title_raw: string;
  youtube_url?: string;
  status?: QueueStatus;
  created_at?: string;
}