import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Servicios
import { TenantService, TenantValidationResult } from '../../core/services/tenant.service';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    DividerModule,
    TagModule,
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './screen.component.html',
  styleUrl: './screen.component.css'
})
export class ScreenComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Estado
  tenantCode: string = '';
  isPaired: boolean = false;
  pairedTenantId: string = '';
  now = new Date();
  isLoading: boolean = false;
  rememberDevice: boolean = true; // Por defecto activado
  hasError: boolean = false;
  errorMessage: string = '';
  
  constructor(
    private router: Router,
    private messageService: MessageService,
    private tenantService: TenantService
  ) {}

  ngOnInit(): void {
    // Verificar si ya está emparejado
    this.checkExistingPairing();
    
    // Actualizar hora cada minuto
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.now = new Date();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Verificar si ya existe un emparejamiento guardado
   */
  checkExistingPairing(): void {
    const savedTenant = localStorage.getItem('karaqr-tv-tenant');
    
    if (savedTenant) {
      this.pairedTenantId = savedTenant;
      this.isPaired = true;
      
      // Auto-redirigir a la cola después de 3 segundos si ya está emparejado
      setTimeout(() => {
        this.goToQueue();
      }, 3000);
    }
  }

  /**
   * Confirmar y guardar el código de tenant
   */
  confirmTenantCode(): void {
    // Limpiar errores previos
    this.clearError();
    
    if (!this.tenantCode.trim()) {
      this.setError('Por favor ingresa un código de pantalla');
      return;
    }

    // Validar formato básico del código
    if (this.tenantCode.trim().length < 4) {
      this.setError('El código debe tener al menos 4 caracteres');
      return;
    }

    this.isLoading = true;
    console.log('ScreenComponent.confirmTenantCode() - Validando tenant:', this.tenantCode);
    
    // Validar el tenant contra el backend
    this.tenantService.validateTenant(this.tenantCode.trim())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: TenantValidationResult) => {
          console.log('ScreenComponent.confirmTenantCode() - Resultado validación:', result);
          this.isLoading = false;
          
          if (result.isValid && result.tenant) {
            // Tenant válido - proceder con el emparejamiento
            this.handleValidTenant(result.tenant.id);
          } else {
            // Tenant inválido - mostrar error
            this.handleInvalidTenant(result.error || 'Código de tenant no válido');
          }
        },
        error: (error) => {
          console.error('Error al validar tenant:', error);
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error de conexión',
            detail: 'No se pudo verificar el código. Revisa tu conexión a internet.'
          });
        }
      });
  }

  /**
   * Manejar tenant válido
   */
  private handleValidTenant(tenantId: string): void {
    console.log('ScreenComponent.handleValidTenant() - Tenant ID:', tenantId);
    console.log('ScreenComponent.handleValidTenant() - Remember device:', this.rememberDevice);
    
    // Guardar en localStorage solo si está marcado el checkbox
    if (this.rememberDevice) {
      localStorage.setItem('karaqr-tv-tenant', tenantId);
      console.log('ScreenComponent.handleValidTenant() - Guardado en localStorage');
      this.messageService.add({
        severity: 'success',
        summary: '¡TV emparejado y recordado!',
        detail: `Televisor configurado para ${tenantId}`
      });
    } else {
      console.log('ScreenComponent.handleValidTenant() - NO guardado en localStorage (temporal)');
      this.messageService.add({
        severity: 'success',
        summary: '¡TV emparejado!',
        detail: `Conectado a ${tenantId} (sesión temporal)`
      });
    }
    
    this.pairedTenantId = tenantId;
    this.isPaired = true;

    // Redirigir a la cola después de un momento
    setTimeout(() => {
      console.log('ScreenComponent.handleValidTenant() - Redirigiendo a la cola');
      this.goToQueue();
    }, 2000);
  }

  /**
   * Manejar tenant inválido
   */
  private handleInvalidTenant(errorMessage: string): void {
    console.log('ScreenComponent.handleInvalidTenant() - Error:', errorMessage);
    
    // Establecer estado de error visual
    this.setError(errorMessage);
    
    // También mostrar toast para mayor visibilidad
    this.messageService.add({
      severity: 'error',
      summary: 'Código no encontrado',
      detail: errorMessage,
      life: 4000
    });
  }

  /**
   * Limpiar el emparejamiento
   */
  clearPairing(): void {
    localStorage.removeItem('karaqr-tv-tenant');
    this.isPaired = false;
    this.pairedTenantId = '';
    this.tenantCode = '';
    
    this.messageService.add({
      severity: 'info',
      summary: 'Emparejamiento eliminado',
      detail: 'Puedes ingresar un nuevo código'
    });
  }

  /**
   * Ir a pantalla completa
   */
  goFullscreen(): void {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'Pantalla completa',
          detail: 'Presiona ESC para salir'
        });
        
        // Ir a la cola después de activar fullscreen
        setTimeout(() => {
          this.goToQueue();
        }, 1000);
      }).catch(() => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Pantalla completa no disponible',
          detail: 'Tu navegador no soporta esta función'
        });
        
        // Ir a la cola de todas formas
        this.goToQueue();
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Pantalla completa no soportada',
        detail: 'Redirigiendo a la pantalla de cola...'
      });
      
      this.goToQueue();
    }
  }

  /**
   * Limpiar el estado de error
   */
  clearError(): void {
    this.hasError = false;
    this.errorMessage = '';
  }

  /**
   * Establecer un error
   */
  setError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
  }

  /**
   * Manejar tecla Enter
   */
  onEnterKey(): void {
    if (this.tenantCode.trim() && !this.isLoading) {
      this.confirmTenantCode();
    }
  }

  /**
   * Navegar a la pantalla de cola
   */
  goToQueue(): void {
    if (this.pairedTenantId) {
      this.router.navigate(['/queue'], { 
        queryParams: { tenant: this.pairedTenantId } 
      });
    }
  }
}