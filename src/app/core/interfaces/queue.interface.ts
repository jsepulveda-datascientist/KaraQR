/**
 * Interfaz para las entradas de la cola de karaoke
 * Basada en el esquema SQL de la tabla 'queue'
 */
export interface QueueEntry {
  id?: string; // uuid en PostgreSQL
  tenant_id?: string; // Campo requerido en la BD
  name: string; // Campo requerido
  title_raw?: string; // Campo principal según el esquema SQL
  youtube_url?: string; // Campo opcional según el esquema SQL
  status?: 'waiting' | 'called' | 'performing' | 'done'; // Estados según el enum queue_status
  created_at?: string; // timestamp con zona horaria
  
  // Campos de compatibilidad para transición
  title?: string; 
  titleRaw?: string; 
  song?: string; 
  youtubeUrl?: string; 
  youtubeLink?: string; 
}

/**
 * Respuesta del servicio de cola que incluye datos y total
 */
export interface QueueResponse {
  data: QueueEntry[];
  total: number;
}

/**
 * Estadísticas de la cola
 * Basada en el enum queue_status del esquema SQL
 */
export interface QueueStats {
  waiting: number;
  called: number;
  performing: number;
  done: number;
}