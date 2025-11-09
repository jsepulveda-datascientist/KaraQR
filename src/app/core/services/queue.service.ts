import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, from, of, interval, Subscription } from 'rxjs';
import { map, catchError, switchMap, startWith } from 'rxjs/operators';
import { SupabaseService } from './supa.service';
import { QueueEntry, QueueResponse, QueueStats } from '../interfaces';
import { QueueStatus } from '../models/queue-entry';

@Injectable({
  providedIn: 'root'
})
export class QueueService implements OnDestroy {
  private queueSubject = new BehaviorSubject<QueueEntry[]>([]);
  private currentEntrySubject = new BehaviorSubject<QueueEntry | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  private pollingSubscription?: Subscription;
  private realtimeSubscription?: any;
  
  public queue$ = this.queueSubject.asObservable();
  public currentEntry$ = this.currentEntrySubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    this.loadQueue();
  }

  list(tenantId?: string): Observable<QueueResponse> {
    let query = this.supabaseService.client
      .from('queue')
      .select('*');
    
    // Filtrar por tenant_id si se proporciona
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    query = query.order('created_at', { ascending: true });
    
    return from(query).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al obtener cola:', error);
          throw error;
        }
        const entries = data || [];
        console.log('Entradas obtenidas de la BD:', entries);
        this.queueSubject.next(entries);
        
        // Actualizar entrada actual
        const current = entries.find((entry: QueueEntry) => entry.status === 'performing') || null;
        this.currentEntrySubject.next(current);
        return { data: entries, total: entries.length };
      }),
      catchError((error) => {
        console.error('Error en list():', error);
        return of({ data: [], total: 0 });
      })
    );
  }

  add(entry: Omit<QueueEntry, 'id' | 'created_at'>): Observable<QueueEntry> {
    console.log('QueueService.add() - entrada recibida:', entry);
    
    // Crear objeto con campos mínimos
    const newEntry: any = {
      name: entry.name,
      status: entry.status || 'waiting' as const
    };

    // Agregar campos opcionales solo si están presentes en la entrada
    if ((entry as any).title_raw) {
      newEntry.title_raw = (entry as any).title_raw;
    }
    if ((entry as any).youtube_url) {
      newEntry.youtube_url = (entry as any).youtube_url;
    }
    if ((entry as any).tenant_id) {
      newEntry.tenant_id = (entry as any).tenant_id;
    }
    
    // Fallbacks para compatibilidad
    if (entry.title) {
      newEntry.title_raw = entry.title;
    }
    if ((entry as any).song) {
      newEntry.title_raw = (entry as any).song;
    }
    if (entry.youtubeUrl) {
      newEntry.youtube_url = entry.youtubeUrl;
    }
    if (entry.youtubeLink) {
      newEntry.youtube_url = entry.youtubeLink;
    }

    // Eliminar campos undefined o null para evitar errores de esquema
    Object.keys(newEntry).forEach(key => {
      if (newEntry[key] === undefined || newEntry[key] === null) {
        delete newEntry[key];
      }
    });

    console.log('QueueService.add() - datos a enviar a Supabase:', newEntry);
    console.log('QueueService.add() - claves:', Object.keys(newEntry));

    return from(
      (this.supabaseService.client as any)
        .from('queue')
        .insert([newEntry])
        .select()
        .single()
    ).pipe(
      map(({ data, error }: any) => {
        if (error) throw error;
        this.loadQueue();
        return data!;
      })
    );
  }

  /**
   * Método de compatibilidad para JoinComponent - acepta múltiples firmas
   */
  addEntry(entryOrName: string | Omit<QueueEntry, 'id' | 'created_at'>, song?: string): Observable<QueueEntry> {
    if (typeof entryOrName === 'string' && song) {
      // Llamada antigua: addEntry(name: string, song: string)
      return this.add({ name: entryOrName, title: song, status: 'waiting' });
    } else if (typeof entryOrName === 'object') {
      // Llamada nueva: addEntry(entry: object)
      return this.add(entryOrName);
    } else {
      throw new Error('Parámetros inválidos para addEntry');
    }
  }

  updateStatus(id: number, status: QueueEntry['status']): Observable<QueueEntry> {
    return from(
      (this.supabaseService.client as any)
        .from('queue')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }: any) => {
        if (error) throw error;
        this.loadQueue();
        return data!;
      })
    );
  }

  private loadQueue(): void {
    this.list().subscribe();
  }

  /**
   * Iniciar polling automático de la cola - compatible con tenantId
   */
  startPolling(tenantIdOrInterval?: string | number, intervalMs?: number): Observable<QueueEntry[]> {
    this.stopPolling();
    
    // Determinar tenantId e intervalo basado en parámetros
    let pollingInterval = 5000; // default
    let tenantId: string | undefined;
    
    if (typeof tenantIdOrInterval === 'string') {
      tenantId = tenantIdOrInterval;
      if (typeof intervalMs === 'number') {
        pollingInterval = intervalMs;
      }
    } else if (typeof tenantIdOrInterval === 'number') {
      pollingInterval = tenantIdOrInterval;
    }
    
    const polling$ = interval(pollingInterval).pipe(
      startWith(0),
      switchMap(() => this.list(tenantId)), // Pasar tenantId al método list
      map((response: QueueResponse) => response.data), // Extraer solo los datos
      catchError(error => {
        console.error('Error en polling:', error);
        return of([]);
      })
    );

    // Subscribir internamente para mantener el polling
    this.pollingSubscription = polling$.subscribe();
    
    // Retornar el observable para compatibilidad con el componente
    return polling$;
  }

  /**
   * Detener el polling
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  /**
   * Configurar suscripción en tiempo real
   */
  /**
   * Desuscribirse de actualizaciones en tiempo real
   */
  unsubscribeRealtime(): void {
    if (this.realtimeSubscription) {
      this.supabaseService.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
  }

  /**
   * Eliminar entrada de la cola
   */
  remove(id: number): Observable<boolean> {
    return from(
      (this.supabaseService.client as any)
        .from('queue')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }: any) => {
        if (error) throw error;
        this.loadQueue();
        return true;
      })
    );
  }

  /**
   * Limpiar entradas completadas
   */
  clearCompleted(): Observable<boolean> {
    return from(
      (this.supabaseService.client as any)
        .from('queue')
        .delete()
        .eq('status', 'done')
    ).pipe(
      map(({ error }: any) => {
        if (error) throw error;
        this.loadQueue();
        return true;
      })
    );
  }

  /**
   * Obtener estadísticas de la cola
   */
  getStats(): Observable<QueueStats> {
    return this.queue$.pipe(
      map((entries: QueueEntry[]) => ({
        waiting: entries.filter(e => e.status === 'waiting').length,
        called: entries.filter(e => e.status === 'called').length,
        performing: entries.filter(e => e.status === 'performing').length,
        done: entries.filter(e => e.status === 'done').length
      }))
    );
  }

  // ===========================================
  // MÉTODOS DE ADMINISTRACIÓN
  // ===========================================

  /**
   * Actualizar el status de una entrada específica
   */
  setStatus(id: string, status: QueueStatus): Observable<QueueEntry> {
    return from(
      (this.supabaseService.client as any)
        .from('queue')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al actualizar status:', error);
          throw error;
        }
        console.log('Status actualizado:', data);
        this.loadQueue(); // Refrescar la cola
        return data;
      }),
      catchError((error) => {
        console.error('Error en setStatus:', error);
        throw error;
      })
    );
  }

  /**
   * Llamar al siguiente en la cola (RPC)
   * Pasa performing→done y primer waiting→performing
   */
  callNext(tenantId: string): Observable<any> {
    console.log('Ejecutando callNext para tenant:', tenantId);
    return from(
      (this.supabaseService.client as any).rpc('karaqr_call_next', { 
        p_tenant: tenantId 
      })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error en callNext RPC:', error);
          throw error;
        }
        console.log('CallNext ejecutado exitosamente:', data);
        this.loadQueue(); // Refrescar la cola
        return data;
      }),
      catchError((error) => {
        console.error('Error en callNext:', error);
        throw error;
      })
    );
  }

  /**
   * Alternar pausa (RPC)
   * Alterna performing↔called
   */
  togglePause(tenantId: string): Observable<any> {
    console.log('Ejecutando togglePause para tenant:', tenantId);
    return from(
      (this.supabaseService.client as any).rpc('karaqr_toggle_pause', { 
        p_tenant: tenantId 
      })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error en togglePause RPC:', error);
          throw error;
        }
        console.log('TogglePause ejecutado exitosamente:', data);
        this.loadQueue(); // Refrescar la cola
        return data;
      }),
      catchError((error) => {
        console.error('Error en togglePause:', error);
        throw error;
      })
    );
  }

  /**
   * Suscripción a cambios en tiempo real para un tenant específico
   */
  subscribeRealtime(tenantId: string, onAnyChange: () => void): void {
    console.log('Suscribiendo a tiempo real para tenant:', tenantId);
    this.unsubscribeRealtime(); // Limpiar suscripción anterior
    
    this.realtimeSubscription = this.supabaseService.channel(`queue_admin_${tenantId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'queue',
          filter: `tenant_id=eq.${tenantId}`
        }, 
        (payload: any) => {
          console.log('Cambio en tiempo real detectado:', payload);
          onAnyChange();
        }
      )
      .subscribe();
  }

  /**
   * Obtener lista filtrada por tenant (versión simplificada para admin)
   */
  listForTenant(tenantId: string): Observable<QueueEntry[]> {
    return from(
      this.supabaseService.client
        .from('queue')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: true })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al obtener cola para tenant:', error);
          throw error;
        }
        const entries = data || [];
        console.log(`Entradas obtenidas para tenant ${tenantId}:`, entries);
        return entries;
      }),
      catchError((error) => {
        console.error('Error en listForTenant:', error);
        return of([]);
      })
    );
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    this.stopPolling();
    this.unsubscribeRealtime();
    this.queueSubject.complete();
    this.currentEntrySubject.complete();
    this.isLoadingSubject.complete();
  }
}
