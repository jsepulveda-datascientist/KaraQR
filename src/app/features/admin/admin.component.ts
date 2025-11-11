import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputOtpModule } from 'primeng/inputotp';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Services y modelos
import { QueueService } from '../../core/services/queue.service';
import { QueueEntry } from '../../core/interfaces/queue.interface';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputTextModule,
    InputOtpModule,
    ToastModule,
    DividerModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private pollingSubscription?: Subscription;
  
  // Estado
  entries: QueueEntry[] = [];
  tenantId: string = '';
  now = new Date();
  isMobileView = false;
  
  // Control de acceso
  adminPinDialog = true;
  adminPinInput = '';
  private readonly ADMIN_PIN = '1234';
  isValidatingPin = false;
  
  // Estados de carga
  isLoadingQueue = false;
  isLoadingAction = false;

  constructor(
    private route: ActivatedRoute,
    private queueService: QueueService,
    private messageService: MessageService
  ) {
    // Obtener tenantId
    this.tenantId = this.route.snapshot.queryParamMap.get('tenant') || environment.defaultTenant || 'default';
  }

  ngOnInit(): void {
    console.log('AdminComponent inicializado para tenant:', this.tenantId);
    
    // Detectar cambios de viewport
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
    
    // Verificar si ya tiene PIN guardado
    const savedPin = sessionStorage.getItem('adminPin');
    if (savedPin === this.ADMIN_PIN) {
      this.adminPinDialog = false;
      this.initializeAdmin();
    }

    // Actualizar hora cada 30 segundos
    interval(30000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.now = new Date();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  /**
   * Validar PIN de administrador
   */
  validatePin(): void {
    if (this.adminPinInput?.length !== 4) {
      this.messageService.add({
        severity: 'warn',
        summary: 'PIN Incompleto',
        detail: 'Por favor ingrese los 4 dígitos del PIN'
      });
      return;
    }

    this.isValidatingPin = true;
    
    // Simular validación (agregar delay para mejor UX)
    setTimeout(() => {
      if (this.adminPinInput === this.ADMIN_PIN) {
        sessionStorage.setItem('adminPin', this.adminPinInput);
        this.adminPinDialog = false;
        this.initializeAdmin();
        this.messageService.add({
          severity: 'success',
          summary: 'Acceso Concedido',
          detail: 'Bienvenido al panel de administración',
          life: 3000
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'PIN Incorrecto',
          detail: 'El PIN ingresado no es válido',
          life: 5000
        });
        this.clearPin();
      }
      this.isValidatingPin = false;
    }, 800);
  }

  /**
   * Limpiar PIN ingresado
   */
  clearPin(): void {
    this.adminPinInput = '';
  }

  /**
   * Inicializar funcionalidades de admin
   */
  private initializeAdmin(): void {
    console.log('Inicializando admin para tenant:', this.tenantId);
    
    // Cargar cola inicial
    this.reloadQueue();
    
    // Iniciar polling cada 4 segundos
    this.startPolling();
    
    // Suscribirse a tiempo real
    this.queueService.subscribeRealtime(this.tenantId, () => {
      console.log('Cambio en tiempo real detectado, recargando...');
      this.loadQueueData();
    });
  }

  /**
   * Iniciar polling automático
   */
  private startPolling(): void {
    this.pollingSubscription = interval(4000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadQueueData();
    });
  }

  /**
   * Cargar datos de la cola
   */
  private loadQueueData(): void {
    console.log('Cargando datos para tenant:', this.tenantId);
    this.isLoadingQueue = true;
    this.queueService.listForTenant(this.tenantId).subscribe({
      next: (entries) => {
        console.log('Entradas recibidas:', entries.length);
        this.entries = entries;
        this.isLoadingQueue = false;
      },
      error: (error) => {
        console.error('Error al cargar cola:', error);
        this.isLoadingQueue = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la cola'
        });
      }
    });
  }

  /**
   * Recargar cola manualmente
   */
  reloadQueue(): void {
    this.loadQueueData();
    this.messageService.add({
      severity: 'info',
      summary: 'Recargado',
      detail: 'Cola actualizada'
    });
  }

  /**
   * Obtener el cantante actual (performing)
   */
  getCurrentPerformer(): QueueEntry | null {
    return this.entries.find(entry => entry.status === 'performing') || null;
  }

  /**
   * Verificar si se puede llamar al siguiente
   */
  canCallNext(): boolean {
    return this.entries.some(entry => entry.status === 'waiting');
  }

  /**
   * Llamar al siguiente en la cola
   */
  callNext(): void {
    if (!this.canCallNext()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No disponible',
        detail: 'No hay cantantes en espera'
      });
      return;
    }

    this.isLoadingAction = true;
    this.queueService.callNext(this.tenantId).subscribe({
      next: () => {
        this.isLoadingAction = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Siguiente llamado',
          detail: 'El siguiente cantante ha sido llamado a escena'
        });
      },
      error: (error) => {
        console.error('Error en callNext:', error);
        this.isLoadingAction = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo llamar al siguiente cantante'
        });
      }
    });
  }

  /**
   * Alternar pausa del cantante actual
   */
  togglePause(): void {
    const current = this.getCurrentPerformer();
    if (!current) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No disponible',
        detail: 'No hay cantante en escena'
      });
      return;
    }

    this.isLoadingAction = true;
    this.queueService.togglePause(this.tenantId).subscribe({
      next: () => {
        this.isLoadingAction = false;
        const action = current.status === 'performing' ? 'pausado' : 'reanudado';
        this.messageService.add({
          severity: 'info',
          summary: 'Estado cambiado',
          detail: `El cantante ha sido ${action}`
        });
      },
      error: (error) => {
        console.error('Error en togglePause:', error);
        this.isLoadingAction = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cambiar el estado'
        });
      }
    });
  }

  /**
   * Marcar cantante actual como terminado
   */
  markCurrentDone(): void {
    const current = this.getCurrentPerformer();
    if (!current || !current.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No disponible',
        detail: 'No hay cantante en escena'
      });
      return;
    }

    this.markDone(current);
  }

  /**
   * Poner cantante en escena
   */
  setPerforming(entry: QueueEntry): void {
    if (!entry.id) return;
    
    this.isLoadingAction = true;
    this.queueService.setStatus(entry.id, 'performing').subscribe({
      next: () => {
        this.isLoadingAction = false;
        this.messageService.add({
          severity: 'success',
          summary: 'En escena',
          detail: `${entry.name} ahora está en escena`
        });
      },
      error: (error) => {
        console.error('Error al poner en escena:', error);
        this.isLoadingAction = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo poner en escena'
        });
      }
    });
  }

  /**
   * Marcar cantante como terminado
   */
  markDone(entry: QueueEntry): void {
    if (!entry.id) return;
    
    this.isLoadingAction = true;
    this.queueService.setStatus(entry.id, 'done').subscribe({
      next: () => {
        this.isLoadingAction = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Terminado',
          detail: `${entry.name} marcado como terminado`
        });
      },
      error: (error) => {
        console.error('Error al marcar como terminado:', error);
        this.isLoadingAction = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo marcar como terminado'
        });
      }
    });
  }

  /**
   * Obtener tamaño de botón según vista
   */
  getButtonSize(): 'small' | 'large' {
    return this.isMobileView ? 'small' : 'large';
  }

  /**
   * Detectar si estamos en vista móvil
   */
  private checkMobileView(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  /**
   * Obtener estilos dinámicos para grid de controles según viewport
   */
  getControlsGridStyle(): any {
    if (this.isMobileView) {
      return {
        'display': 'grid',
        'grid-template-columns': 'repeat(2, 1fr)',
        'gap': '0.5rem',
        'width': '100%',
        'margin': '0',
        'padding': '0'
      };
    } else if (window.innerWidth < 1024) {
      return {
        'display': 'grid',
        'grid-template-columns': 'repeat(4, 1fr)',
        'gap': '1rem',
        'width': '100%',
        'margin': '0',
        'padding': '0'
      };
    } else {
      return {
        'display': 'grid',
        'grid-template-columns': 'repeat(4, 1fr)',
        'gap': '1.5rem',
        'width': '100%',
        'margin': '0',
        'padding': '0'
      };
    }
  }

  /**
   * Obtener estilos dinámicos para botones según viewport
   */
  getControlButtonStyle(): any {
    if (this.isMobileView) {
      return {
        'min-height': '2.75rem',
        'padding': '0.5rem',
        'width': '100%',
        'font-size': '0.8rem',
        'font-weight': '600'
      };
    } else if (window.innerWidth < 1024) {
      return {
        'min-height': '3.5rem',
        'padding': '0.75rem',
        'width': '100%',
        'font-size': '1rem',
        'font-weight': '600'
      };
    } else {
      return {
        'min-height': '4rem',
        'padding': '1rem',
        'width': '100%',
        'font-size': '1.1rem',
        'font-weight': '600'
      };
    }
  }

  /**
   * Obtener texto legible del estado
   */
  getStatusText(status?: QueueEntry['status']): string {
    switch (status) {
      case 'waiting': return 'Esperando';
      case 'called': return 'Llamado';
      case 'performing': return 'En Escena';
      case 'done': return 'Terminado';
      default: return 'Pendiente';
    }
  }

  /**
   * Obtener severity para el tag de estado
   */
  getStatusSeverity(status?: QueueEntry['status']): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case 'waiting': return 'secondary';
      case 'called': return 'info';
      case 'performing': return 'success';
      case 'done': return 'warning';
      default: return 'secondary';
    }
  }
}