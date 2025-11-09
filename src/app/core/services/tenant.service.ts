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
      (this.supabaseService as any).client
        .from('tenants')
        .select('*')
        .eq('id', cleanTenantId)
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

        const exists = data && data.length > 0;
        const result = {
          isValid: exists,
          tenant: exists ? data[0] as Tenant : undefined,
          error: exists ? undefined : 'Tenant no encontrado'
        };

        console.log('TenantService.validateTenant() - Resultado:', result);
        return result;
      }),
      catchError((error) => {
        console.error('Error en validateTenant:', error);
        return of({
          isValid: false,
          error: 'Error al validar tenant'
        });
      })
    );
  }

  /**
   * Crear un tenant insertando directamente en la tabla tenants
   */
  createTenant(request: CreateTenantRequest): Observable<Tenant> {
    console.log('TenantService.createTenant() - Request:', request);
    
    // Validar que el tenant no exista ya
    return this.validateTenant(request.id).pipe(
      switchMap((result: TenantValidationResult) => {
        if (result.isValid) {
          throw new Error(`El tenant ${request.id} ya existe`);
        }

        // Crear el registro del tenant en la tabla tenants
        const tenantRecord = {
          id: request.id.toUpperCase(),
          display_name: request.display_name,
          primary_hex: request.primary_hex || '#00B8FF',
          accent_hex: request.accent_hex || '#FF3FA4',
          logo_url: request.logo_url || null
        };

        console.log('TenantService.createTenant() - Insertando tenant:', tenantRecord);

        return from(
          (this.supabaseService as any).client
            .from('tenants')
            .insert(tenantRecord as any)
            .select()
        ).pipe(
          map((response: any) => {
            if (response.error) {
              console.error('Error insertando tenant:', response.error);
              throw new Error(`Error creando tenant: ${response.error.message}`);
            }

            console.log('TenantService.createTenant() - Tenant creado exitosamente:', response.data);
            const newTenant = response.data[0] as Tenant;

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
   * Obtener un tenant por ID
   */
  getTenant(tenantId: string): Observable<Tenant | null> {
    return this.validateTenant(tenantId).pipe(
      map((result: TenantValidationResult) => 
        result.isValid ? result.tenant! : null
      )
    );
  }

  /**
   * Crear un objeto Tenant básico con datos mínimos
   */
  private createTenantFromQueueData(tenantId: string, queueData: any[] = []): Tenant {
    const latestEntry = queueData.length > 0 ? queueData[0] : null;
    
    return {
      id: tenantId,
      display_name: `Tenant ${tenantId}`,
      primary_hex: '#00B8FF',
      accent_hex: '#FF3FA4',
      logo_url: undefined,
      created_at: latestEntry?.created_at || new Date().toISOString()
    };
  }

  /**
   * Método de prueba para verificar conectividad con tabla tenants
   */
  testTableAccess(): Observable<any> {
    console.log('TenantService.testTableAccess() - Probando acceso a tabla tenants');
    
    return from(
      (this.supabaseService as any).client
        .from('tenants')
        .select('id, display_name')
        .limit(5)
    ).pipe(
      map((response: any) => {
        console.log('TenantService.testTableAccess() - Respuesta:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Error en testTableAccess:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener todos los tenants de la tabla tenants
   */
  getAllTenants(): Observable<Tenant[]> {
    console.log('TenantService.getAllTenants() - Obteniendo todos los tenants');
    
    return from(
      (this.supabaseService as any).client
        .from('tenants')
        .select('*')
    ).pipe(
      map((response: any) => {
        if (response.error) {
          console.error('Error obteniendo tenants:', response.error);
          throw new Error(`Error obteniendo tenants: ${response.error.message}`);
        }

        const tenants = response.data as Tenant[];
        console.log('TenantService.getAllTenants() - Tenants obtenidos:', tenants);
        
        return tenants;
      }),
      catchError((error) => {
        console.error('Error en getAllTenants:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener detalles de un tenant específico
   */
  getTenantDetails(tenantId: string): Observable<Tenant | null> {
    console.log('TenantService.getTenantDetails() - ID:', tenantId);

    return from(
      (this.supabaseService as any).client
        .from('tenants')
        .select('*')
        .eq('id', tenantId.trim().toUpperCase())
        .limit(1)
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al obtener detalles del tenant:', error);
          return null;
        }

        if (!data || data.length === 0) {
          console.log(`Tenant ${tenantId} no encontrado en tabla tenants`);
          return null;
        }

        const tenant = data[0] as Tenant;
        console.log('TenantService.getTenantDetails() - Tenant encontrado:', tenant);
        return tenant;
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
    console.log('TenantService.getTenantStats() - ID:', tenantId);
    
    return from(
      this.supabaseService.client
        .from('queue')
        .select('*')
        .eq('tenant_id', tenantId.trim().toUpperCase())
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error al obtener stats:', error);
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
   * Actualizar un tenant en la tabla tenants
   */
  updateTenant(tenantId: string, request: UpdateTenantRequest): Observable<Tenant> {
    console.log('TenantService.updateTenant() - ID:', tenantId, 'Request:', request);
    
    // Preparar los datos de actualización
    const updateData: any = {};
    
    if (request.display_name !== undefined && request.display_name !== null) {
      updateData.display_name = request.display_name;
    }
    if (request.primary_hex !== undefined && request.primary_hex !== null) {
      updateData.primary_hex = request.primary_hex;
    }
    if (request.accent_hex !== undefined && request.accent_hex !== null) {
      updateData.accent_hex = request.accent_hex;
    }
    if (request.logo_url !== undefined) {
      // Permitir null para logo_url (para eliminarlo), pero filtrar undefined
      updateData.logo_url = request.logo_url;
    }

    console.log('TenantService.updateTenant() - Datos de actualización:', updateData);
    console.log('TenantService.updateTenant() - Buscando tenant con ID:', tenantId.toUpperCase());

    // Primero verificar que el registro existe
    return from(
      (this.supabaseService as any).client
        .from('tenants')
        .select('id, display_name')
        .eq('id', tenantId.toUpperCase())
        .limit(1)
    ).pipe(
      switchMap((selectResponse: any) => {
        console.log('TenantService.updateTenant() - Verificación existencia:', selectResponse);
        
        if (!selectResponse.data || selectResponse.data.length === 0) {
          throw new Error(`Tenant ${tenantId} no encontrado en verificación previa`);
        }
        
        // Si existe, intentar la actualización
        return from(
          (this.supabaseService as any).client
            .from('tenants')
            .update(updateData)
            .eq('id', tenantId.toUpperCase())
            .select()
        );
      }),
      map((response: any) => {
        console.log('TenantService.updateTenant() - Respuesta completa:', response);
        
        if (response.error) {
          console.error('Error actualizando tenant:', response.error);
          throw new Error(`Error actualizando tenant: ${response.error.message}`);
        }

        console.log('TenantService.updateTenant() - Data recibida:', response.data);
        console.log('TenantService.updateTenant() - Cantidad de registros:', response.data?.length || 0);

        if (!response.data || response.data.length === 0) {
          throw new Error(`No se encontró el tenant ${tenantId} para actualizar. Verifique que el ID existe en la tabla tenants.`);
        }

        const updatedTenant = response.data[0] as Tenant;
        console.log('TenantService.updateTenant() - Tenant actualizado:', updatedTenant);
        
        return updatedTenant;
      }),
      catchError((error) => {
        console.error('Error en updateTenant:', error);
        throw error;
      })
    );
  }

  /**
   * Método de debug para probar diferentes operaciones y permisos
   */
  testDatabasePermissions(): Observable<any> {
    console.log('TenantService.testDatabasePermissions() - Iniciando tests...');
    
    // Primero obtener un ID real de la base de datos
    return from(
      (this.supabaseService as any).client
        .from('tenants')
        .select('id')
        .limit(1)
    ).pipe(
      switchMap((listResult: any) => {
        console.log('Lista de tenants para test:', listResult);
        
        if (!listResult.data || listResult.data.length === 0) {
          return of({ error: 'No hay tenants en la base de datos para hacer el test' });
        }
        
        const testId = listResult.data[0].id;
        console.log('Usando ID para test:', testId);
        
        // Test 1: SELECT con el ID real
        return from(
          (this.supabaseService as any).client
            .from('tenants')
            .select('*')
            .eq('id', testId)
        ).pipe(
          switchMap((selectResult: any) => {
            console.log('Test SELECT:', selectResult);
            
            if (!selectResult.data || selectResult.data.length === 0) {
              return of({ error: 'SELECT falló con ID real' });
            }
            
            // Test 2: UPDATE con un campo simple (sin null values)
            const updateData = { 
              display_name: 'Test Update ' + new Date().getTime()
            };
            console.log('Datos para UPDATE:', updateData);
            
            return from(
              (this.supabaseService as any).client
                .from('tenants')
                .update(updateData)
                .eq('id', testId)
                .select()
            );
          })
        );
      }),
      map((updateResult: any) => {
        console.log('Test UPDATE resultado:', updateResult);
        return updateResult;
      }),
      catchError(error => {
        console.error('Error en test de permisos:', error);
        return of({ error: error.message });
      })
    );
  }

  /**
   * Eliminar un tenant de la tabla tenants
   */
  deleteTenant(tenantId: string): Observable<boolean> {
    console.log('TenantService.deleteTenant() - ID:', tenantId);
    
    return from(
      (this.supabaseService as any).client
        .from('tenants')
        .delete()
        .eq('id', tenantId.trim().toUpperCase())
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