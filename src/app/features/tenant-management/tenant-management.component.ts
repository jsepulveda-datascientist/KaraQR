import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';

// Servicios y modelos
import { TenantService } from '../../core/services/tenant.service';
import { Tenant, CreateTenantRequest, UpdateTenantRequest, TenantStats } from '../../core/models/tenant.model';

interface TenantWithStats extends Tenant {
  stats?: TenantStats;
}

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
    DividerModule,
    BadgeModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './tenant-management.component.html',
  styleUrl: './tenant-management.component.scss'
})
export class TenantManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado principal
  tenants: TenantWithStats[] = [];
  selectedTenant: TenantWithStats | null = null;
  isLoading: boolean = false;

  // Diálogos
  showCreateDialog: boolean = false;
  showEditDialog: boolean = false;
  showViewDialog: boolean = false;

  // Formularios
  createForm: CreateTenantRequest = {
    id: '',
    display_name: '',
    primary_hex: '#00B8FF',
    accent_hex: '#FF3FA4',
    logo_url: ''
  };

  editForm: UpdateTenantRequest = {};

  // Columnas de la tabla
  cols = [
    { field: 'id', header: 'ID Tenant' },
    { field: 'display_name', header: 'Nombre' },
    { field: 'primary_hex', header: 'Color Principal' },
    { field: 'accent_hex', header: 'Color Acento' },
    { field: 'created_at', header: 'Creado' }
  ];

  constructor(
    private tenantService: TenantService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar lista de tenants con sus estadísticas
   */
  loadTenants(): void {
    this.isLoading = true;
    console.log('TenantManagementComponent.loadTenants() - Iniciando');

    this.tenantService.getAllTenants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tenants: Tenant[]) => {
          console.log('TenantManagementComponent.loadTenants() - Tenants recibidos:', tenants);
          
          // Cargar estadísticas para cada tenant
          this.tenants = tenants.map(tenant => ({ ...tenant, stats: undefined }));
          
          // Cargar estadísticas de forma asíncrona
          tenants.forEach((tenant, index) => {
            this.loadTenantStats(tenant.id, index);
          });
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar tenants:', error);
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los tenants'
          });
        }
      });
  }

  /**
   * Cargar estadísticas de un tenant específico
   */
  private loadTenantStats(tenantId: string, index: number): void {
    this.tenantService.getTenantStats(tenantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: TenantStats) => {
          if (this.tenants[index]) {
            this.tenants[index].stats = stats;
          }
        },
        error: (error) => {
          console.error(`Error al cargar stats para ${tenantId}:`, error);
        }
      });
  }

  /**
   * Abrir diálogo para crear tenant
   */
  openCreateDialog(): void {
    this.createForm = {
      id: '',
      display_name: '',
      primary_hex: '#00B8FF',
      accent_hex: '#FF3FA4',
      logo_url: ''
    };
    this.showCreateDialog = true;
  }

  /**
   * Crear nuevo tenant
   */
  createTenant(): void {
    if (!this.createForm.id.trim() || !this.createForm.display_name.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'ID y nombre son requeridos'
      });
      return;
    }

    // Limpiar y validar ID
    this.createForm.id = this.createForm.id.trim().toUpperCase();
    
    if (!/^[A-Z0-9_-]+$/.test(this.createForm.id)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El ID debe contener solo letras, números, guiones y guiones bajos'
      });
      return;
    }

    this.isLoading = true;
    
    this.tenantService.createTenant(this.createForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newTenant: Tenant) => {
          this.isLoading = false;
          this.showCreateDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Tenant ${newTenant.id} creado exitosamente`
          });
          this.loadTenants();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al crear tenant:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al crear el tenant'
          });
        }
      });
  }

  /**
   * Abrir diálogo para editar tenant
   */
  openEditDialog(tenant: TenantWithStats): void {
    this.selectedTenant = tenant;
    this.editForm = {
      display_name: tenant.display_name,
      primary_hex: tenant.primary_hex,
      accent_hex: tenant.accent_hex,
      logo_url: tenant.logo_url
    };
    this.showEditDialog = true;
  }

  /**
   * Actualizar tenant
   */
  updateTenant(): void {
    if (!this.selectedTenant) return;

    if (!this.editForm.display_name?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validación',
        detail: 'El nombre es requerido'
      });
      return;
    }

    this.isLoading = true;
    
    // Limpiar valores null/undefined problemáticos
    const cleanForm: UpdateTenantRequest = {
      display_name: this.editForm.display_name?.trim(),
      primary_hex: this.editForm.primary_hex?.trim() || undefined,
      accent_hex: this.editForm.accent_hex?.trim() || undefined,
      logo_url: this.editForm.logo_url?.trim() || undefined
    };
    
    console.log('TenantManagementComponent.updateTenant() - Datos limpiados:', cleanForm);
    
    this.tenantService.updateTenant(this.selectedTenant.id, cleanForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedTenant: Tenant) => {
          this.isLoading = false;
          this.showEditDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Tenant ${updatedTenant.id} actualizado exitosamente`
          });
          this.loadTenants();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar tenant:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al actualizar el tenant'
          });
        }
      });
  }

  /**
   * Confirmar eliminación de tenant
   */
  confirmDelete(tenant: TenantWithStats): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el tenant "${tenant.display_name}" (${tenant.id})? Esta acción eliminará el tenant de la base de datos.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteTenant(tenant);
      }
    });
  }

  /**
   * Eliminar tenant
   */
  deleteTenant(tenant: TenantWithStats): void {
    this.isLoading = true;
    
    this.tenantService.deleteTenant(tenant.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Tenant ${tenant.id} eliminado exitosamente`
          });
          this.loadTenants();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al eliminar tenant:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al eliminar el tenant'
          });
        }
      });
  }

  /**
   * Ver detalles del tenant
   */
  viewTenant(tenant: TenantWithStats): void {
    this.selectedTenant = tenant;
    this.showViewDialog = true;
  }

  /**
   * Refrescar lista
   */
  refresh(): void {
    this.loadTenants();
  }

  /**
   * Método de prueba para verificar permisos de base de datos
   */
  testDatabasePermissions(): void {
    console.log('TenantManagementComponent.testDatabasePermissions() - Ejecutando pruebas...');
    
    this.tenantService.testDatabasePermissions().subscribe({
      next: (result) => {
        console.log('Resultado de pruebas de permisos:', result);
        this.messageService.add({
          severity: 'info',
          summary: 'Test Completado',
          detail: 'Revisa la consola para ver los resultados detallados'
        });
      },
      error: (error) => {
        console.error('Error en pruebas de permisos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error en Test',
          detail: `Error ejecutando pruebas: ${error.message}`
        });
      }
    });
  }

  /**
   * Formatear fecha
   */
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}