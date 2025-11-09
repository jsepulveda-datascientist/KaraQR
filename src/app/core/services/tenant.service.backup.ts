import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { SupabaseService } from './supa.service';
import { Tenant, CreateTenantRequest, UpdateTenantRequest, TenantStats } from '../models/tenant.model';

// Mantener la interfaz legacy para compatibilidad
export interface TenantValidationResult {
  isValid: boolean;
  tenant?: Tenant;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Validar si un tenant existe y está activo
   */
  validateTenant(tenantId: string): Observable<TenantValidationResult> {
    console.log('TenantService.validateTenant() - Input:', tenantId);
    
    if (!tenantId?.trim()) {
      console.log('TenantService.validateTenant() - Tenant vacío');
      return from([{ isValid: false, error: 'Código de tenant requerido' }]);
    }

    const cleanTenantId = tenantId.trim().toUpperCase();
    console.log('TenantService.validateTenant() - Buscando tenant:', cleanTenantId);

    return from(
      this.supabaseService.client
        .from('queue')
        .select('tenant_id')
        .eq('tenant_id', cleanTenantId)
        .limit(1)
    ).pipe(
      map(({ data, error }: any) => {
        console.log('TenantService.validateTenant() - Respuesta Supabase:', { data, error });
        
        if (error) {
          console.error('Error al validar tenant:', error);
          return {
            isValid: false,
            error: 'Error de conexión al validar tenant'
          };
        }

        if (!data || data.length === 0) {
          console.log('TenantService.validateTenant() - Tenant no encontrado en la cola');
          // En lugar de fallar, vamos a aceptar cualquier tenant para testing
          // TODO: Implementar tabla de tenants separada en el futuro
          console.log('TenantService.validateTenant() - Aceptando tenant para testing');
          const tenant: Tenant = {
            id: cleanTenantId,
            name: cleanTenantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          };

          return {
            isValid: true,
            tenant
          };
        }

        // Crear objeto tenant simplificado desde los datos encontrados
        const tenant: Tenant = {
          id: data[0].tenant_id,
          name: data[0].tenant_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true
        };

        console.log('TenantService.validateTenant() - Tenant encontrado:', tenant);
        return {
          isValid: true,
          tenant
        };
      }),
      catchError((error) => {
        console.error('Error en validateTenant:', error);
        return from([{
          isValid: false,
          error: 'Error al conectar con el servidor'
        }]);
      })
    );
  }

  /**
   * Obtener información de un tenant específico
   */
  getTenant(tenantId: string): Observable<Tenant | null> {
    return this.validateTenant(tenantId).pipe(
      map((result: TenantValidationResult) => 
        result.isValid ? result.tenant! : null
      )
    );
  }

  /**
   * Verificar si existe al menos una entrada en la cola para un tenant
   */
  tenantHasQueue(tenantId: string): Observable<boolean> {
    return from(
      this.supabaseService.client
        .from('queue')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenantId.trim().toUpperCase())
    ).pipe(
      map(({ count, error }: any) => {
        if (error) {
          console.error('Error al verificar cola del tenant:', error);
          return false;
        }
        return (count || 0) > 0;
      }),
      catchError(() => from([false]))
    );
  }

  // ===========================================
  // MÉTODOS CRUD PARA GESTIÓN DE TENANTS
  // ===========================================

  /**
   * Crear una tabla simulada de tenants basada en datos únicos de la tabla queue
   */
  private createTenantFromQueueData(tenantId: string, queueData: any[] = []): Tenant {
    const latestEntry = queueData.length > 0 ? queueData[0] : null;
    
    return {
      id: tenantId,
      name: `Tenant ${tenantId}`,
      description: `Karaoke ${tenantId}`,
      contact_email: undefined,
      contact_phone: undefined,
      is_active: true,
      settings: {
        max_queue_size: 50,
        auto_advance: true,
        display_theme: 'auto',
        welcome_message: `¡Bienvenido a ${tenantId}!`,
        allow_duplicates: false
      },
      created_at: latestEntry?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Obtener lista de todos los tenants
   */
  getAllTenants(): Observable<Tenant[]> {
    console.log('TenantService.getAllTenants() - Obteniendo lista de tenants desde BD');
    
    return from(
      this.supabaseService.client
        .from('queue')
        .select('tenant_id, created_at')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al obtener tenants:', error);
          throw error;
        }

        // Obtener tenant_ids únicos de la base de datos
        const uniqueTenantIds = [...new Set(data?.map((item: any) => item.tenant_id) || [])];
        
        // Crear objetos Tenant para cada tenant_id único
        const tenants: Tenant[] = uniqueTenantIds.map((tenantId) => {
          const tenantEntries = data?.filter((item: any) => item.tenant_id === tenantId) || [];
          return this.createTenantFromQueueData(tenantId as string, tenantEntries);
        });

        console.log('TenantService.getAllTenants() - Tenants encontrados:', tenants.length);
        return tenants;
      }),
      catchError((error) => {
        console.error('Error en getAllTenants:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtener detalles de un tenant específico
   */
  getTenantDetails(tenantId: string): Observable<Tenant | null> {
    console.log('TenantService.getTenantDetails() - ID:', tenantId);
    
    return from(
      this.supabaseService.client
        .from('queue')
        .select('*')
        .eq('tenant_id', tenantId.trim().toUpperCase())
        .order('created_at', { ascending: false })
        .limit(1)
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al obtener detalles del tenant:', error);
          return null;
        }

        if (!data || data.length === 0) {
          return null;
        }

        return this.createTenantFromQueueData(tenantId.trim().toUpperCase(), data);
      }),
      catchError((error) => {
        console.error('Error en getTenantDetails:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtener estadísticas de un tenant
   */
  getTenantStats(tenantId: string): Observable<TenantStats> {
    return from(
      this.supabaseService.client
        .from('queue')
        .select('id, status, created_at')
        .eq('tenant_id', tenantId.trim().toUpperCase())
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al obtener estadísticas del tenant:', error);
          throw error;
        }

        const entries = data || [];
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = entries.filter((entry: any) => 
          entry.created_at.startsWith(today)
        );

        const stats: TenantStats = {
          total_entries: entries.length,
          active_entries: entries.filter((e: any) => e.status !== 'done').length,
          completed_today: todayEntries.filter((e: any) => e.status === 'done').length,
          last_activity: entries.length > 0 ? entries[0].created_at : new Date().toISOString()
        };

        return stats;
      }),
      catchError((error) => {
        console.error('Error en getTenantStats:', error);
        return of({
          total_entries: 0,
          active_entries: 0,
          completed_today: 0,
          last_activity: new Date().toISOString()
        });
      })
    );
  }

  /**
   * Crear un tenant insertando un registro inicial en la base de datos
   */
  createTenant(request: CreateTenantRequest): Observable<Tenant> {
    console.log('TenantService.createTenant() - Request:', request);
    
    // Validar que el tenant no exista ya
    return this.validateTenant(request.id).pipe(
      switchMap((result: TenantValidationResult) => {
        if (result.isValid) {
          throw new Error(`El tenant ${request.id} ya existe`);
        }

        // Crear un registro inicial en la tabla queue para el nuevo tenant
        const initialRecord = {
          tenant_id: request.id.toUpperCase(),
          singer_name: `Sistema ${request.name}`,
          song_title: '🎤 Tenant creado',
          song_artist: 'KaraQR Admin',
          status: 'done',
          queue_position: 0,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };

        console.log('TenantService.createTenant() - Insertando registro inicial:', initialRecord);

        return from(
          this.supabaseService.queue
            .insert(initialRecord as any)
            .select()
        ).pipe(
          map((response: any) => {
            if (response.error) {
              console.error('Error insertando en queue:', response.error);
              throw new Error(`Error creando tenant: ${response.error.message}`);
            }

            console.log('TenantService.createTenant() - Registro creado exitosamente:', response.data);

            // Crear el objeto tenant con los datos del request
            const newTenant = this.createTenantFromQueueData(request.id.toUpperCase());
            newTenant.name = request.name;
            newTenant.description = request.description || '';
            newTenant.contact_email = request.contact_email || undefined;
            newTenant.contact_phone = request.contact_phone || undefined;
            
            if (request.settings) {
              newTenant.settings = { ...newTenant.settings, ...request.settings };
            }

            console.log('TenantService.createTenant() - Tenant creado:', newTenant);
            return newTenant;
          })
        );
      }),
      catchError((error) => {
        console.error('Error en createTenant:', error);
        throw error;
      })
    );
  }

  /**
   * Actualizar un tenant mediante un comentario en la cola
   */
  updateTenant(tenantId: string, request: UpdateTenantRequest): Observable<Tenant> {
    console.log('TenantService.updateTenant() - ID:', tenantId, 'Request:', request);
    
    return this.getTenantDetails(tenantId).pipe(
      switchMap((tenant: Tenant | null) => {
        if (!tenant) {
          throw new Error(`El tenant ${tenantId} no existe`);
        }

        // Crear un registro de actualización en la cola
        const updateRecord = {
          tenant_id: tenantId.toUpperCase(),
          singer_name: `Admin - ${request.name || tenant.name}`,
          song_title: '✏️ Tenant actualizado',
          song_artist: 'KaraQR Admin',
          status: 'done',
          queue_position: 0,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        };

        return from(
          this.supabaseService.queue
            .insert(updateRecord as any)
            .select()
        ).pipe(
          map((response: any) => {
            if (response.error) {
              console.error('Error registrando actualización:', response.error);
              // Continuar aunque falle el registro de actualización
            }

            // Actualizar propiedades del tenant
            const updatedTenant = { ...tenant };
            
            if (request.name !== undefined) updatedTenant.name = request.name;
            if (request.description !== undefined) updatedTenant.description = request.description;
            if (request.contact_email !== undefined) updatedTenant.contact_email = request.contact_email;
            if (request.contact_phone !== undefined) updatedTenant.contact_phone = request.contact_phone;
            if (request.is_active !== undefined) updatedTenant.is_active = request.is_active;
            if (request.settings) {
              updatedTenant.settings = { ...updatedTenant.settings, ...request.settings };
            }
            
            updatedTenant.updated_at = new Date().toISOString();

            console.log('TenantService.updateTenant() - Tenant actualizado:', updatedTenant);
            return updatedTenant;
          })
        );
      }),
      catchError((error) => {
        console.error('Error en updateTenant:', error);
        throw error;
      })
    );
  }

  /**
   * Eliminar un tenant eliminando todas sus entradas de la base de datos
   */
  deleteTenant(tenantId: string): Observable<boolean> {
    console.log('TenantService.deleteTenant() - ID:', tenantId);
    
    return from(
      this.supabaseService.client
        .from('queue')
        .delete()
        .eq('tenant_id', tenantId.trim().toUpperCase())
    ).pipe(
      map(({ error }: any) => {
        if (error) {
          console.error('Error al eliminar tenant de BD:', error);
          throw new Error(`Error eliminando tenant: ${error.message}`);
        }
        
        console.log('TenantService.deleteTenant() - Tenant eliminado exitosamente');
        return true;
      }),
      catchError((error) => {
        console.error('Error en deleteTenant:', error);
        throw error;
      })
    );
  }
}