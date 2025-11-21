import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );
  }

  /**
   * Obtener cliente Supabase
   */
  get client(): SupabaseClient<Database> {
    return this.supabase;
  }

  /**
   * Métodos de conveniencia para la tabla queue
   */
  get queue() {
    return this.supabase.from('queue');
  }

  /**
   * Acceso directo al cliente
   */
  from(table: string) {
    return this.supabase.from(table);
  }

  /**
   * Método para llamadas RPC
   */
  rpc<T = any>(functionName: string, params?: any): any {
    return this.supabase.rpc(functionName, params);
  }

  /**
   * Crear canal para subscripciones en tiempo real
   */
  channel(name: string, config?: any) {
    return this.supabase.channel(name, config);
  }

  /**
   * Remover canal
   */
  removeChannel(channel: any) {
    return this.supabase.removeChannel(channel);
  }

  /**
   * Obtener información de autenticación
   */
  get auth() {
    return this.supabase.auth;
  }

  /**
   * Obtener información de storage
   */
  get storage() {
    return this.supabase.storage;
  }
}

// Exportar instancia para compatibilidad temporal (deprecated)
export const supa = createClient(
  environment.supabaseUrl, 
  environment.supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
