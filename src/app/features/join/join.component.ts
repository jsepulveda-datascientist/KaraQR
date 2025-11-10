import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

// Services
import { QueueService } from '../../core/services/queue.service';
import { environment } from '../../../environments/environment';

// Interfaces
import { QueueEntry } from '../../core/interfaces/queue.interface';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    CardModule
  ],
  providers: [MessageService],
  template: `
    <div class="join-container p-fluid">
      
      <!-- Formulario de inscripción -->
      <p-card header="🎤 Anótate para cantar" *ngIf="!showConfirmation">
        <form [formGroup]="joinForm" (ngSubmit)="onSubmit()" (keydown)="onKeyDown($event)">
          
          <!-- Campo Nombre -->
          <div class="field">
            <label for="name" class="block text-900 font-medium mb-2">
              Nombre *
            </label>
            <input 
              pInputText 
              id="name"
              formControlName="name"
              placeholder="Ingresa tu nombre"
              class="w-full"
              [class.ng-invalid]="hasFieldError('name', 'required') || hasFieldError('name', 'minlength')"
              autocomplete="given-name"
            />
            <small 
              class="p-error block mt-1" 
              *ngIf="hasFieldError('name', 'required') || hasFieldError('name', 'minlength')"
            >
              {{ getFieldErrorMessage('name') }}
            </small>
          </div>

          <!-- Campo Canción -->
          <div class="field">
            <label for="song" class="block text-900 font-medium mb-2">
              Canción (Artista - Tema) *
            </label>
            <input 
              pInputText 
              id="song"
              formControlName="song"
              placeholder="Ej: Queen - Bohemian Rhapsody"
              class="w-full"
              [class.ng-invalid]="hasFieldError('song', 'required') || hasFieldError('song', 'minlength')"
            />
            <small 
              class="p-error block mt-1" 
              *ngIf="hasFieldError('song', 'required') || hasFieldError('song', 'minlength')"
            >
              {{ getFieldErrorMessage('song') }}
            </small>
          </div>

          <!-- Campo YouTube Link (opcional) -->
          <div class="field">
            <label for="youtubeLink" class="block text-900 font-medium mb-2">
              Link de YouTube (opcional)
            </label>
            <input 
              pInputText 
              id="youtubeLink"
              formControlName="youtubeLink"
              placeholder="https://www.youtube.com/watch?v=..."
              class="w-full"
              [class.ng-invalid]="hasFieldError('youtubeLink', 'invalidUrl')"
            />
            <small 
              class="p-error block mt-1" 
              *ngIf="hasFieldError('youtubeLink', 'invalidUrl')"
            >
              {{ getFieldErrorMessage('youtubeLink') }}
            </small>
            <small class="text-500 block mt-1" *ngIf="!hasFieldError('youtubeLink', 'invalidUrl')">
              Si tienes una versión específica que prefieres
            </small>
          </div>

          <!-- Botón Submit -->
          <div class="field mt-4">
            <button 
              pButton 
              type="submit"
              label="Anotarme 🎵"
              class="w-full p-button-lg"
              [disabled]="joinForm.invalid || joinForm.pristine || isSubmitting"
              [loading]="isSubmitting"
              loadingIcon="pi pi-spinner pi-spin"
              (click)="onButtonClick($event)"
            >
            </button>
          </div>

        </form>

        <!-- Footer con información del tenant -->
        <div class="tenant-footer">
          <small class="text-500">
            <i class="pi pi-qrcode mr-1"></i>
            Escaneado para <strong>{{ tenantId }}</strong>
          </small>
        </div>

      </p-card>

      <!-- Pantalla de confirmación -->
      <p-card *ngIf="showConfirmation" class="confirmation-card">
        <div class="confirmation-content">
          
          <!-- Ícono de éxito -->
          <div class="success-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          
          <!-- Mensaje principal -->
          <h2 class="confirmation-title">¡Listo para cantar! 🎤</h2>
          <p class="confirmation-message">
            Te has anotado exitosamente en la cola de karaoke
          </p>
          
          <!-- Detalles de la inscripción -->
          <div class="inscription-details">
            <div class="detail-item">
              <i class="pi pi-user detail-icon"></i>
              <span class="detail-label">Cantante:</span>
              <span class="detail-value">{{ submittedData?.name }}</span>
            </div>
            
            <div class="detail-item">
              <i class="pi pi-music detail-icon"></i>
              <span class="detail-label">Canción:</span>
              <span class="detail-value">{{ submittedData?.song }}</span>
            </div>
            
            <div class="detail-item" *ngIf="submittedData?.youtubeLink">
              <i class="pi pi-youtube detail-icon"></i>
              <span class="detail-label">YouTube:</span>
              <span class="detail-value">Link incluido</span>
            </div>
          </div>
          
          <!-- Información adicional -->
          <div class="info-message">
            <i class="pi pi-info-circle mr-2"></i>
            Te avisaremos cuando sea tu turno. ¡Mantente atento!
          </div>
          
          <!-- Botones de acción -->
          <div class="action-buttons">
            <button 
              pButton 
              label="🎵 Anotar otra canción"
              class="p-button-outlined w-full mb-2"
              (click)="requestAnotherSong()"
            ></button>
            
            <button 
              pButton 
              label="📋 Ver la cola"
              class="p-button-secondary w-full"
              (click)="goToQueue()"
            ></button>
          </div>
          
        </div>
      </p-card>

      <!-- Toast para errores solamente -->
      <p-toast position="top-center" [life]="5000"></p-toast>
    </div>
  `,
  styles: [`
    .join-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: linear-gradient(135deg, var(--surface-50, #f8f9fa) 0%, var(--surface-100, #e9ecef) 100%);
    }

    .join-container ::ng-deep .p-card {
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .tenant-footer {
      margin-top: 1.5rem;
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }
    
    /* Estilos de confirmación */
    .confirmation-card {
      text-align: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    }

    .confirmation-card ::ng-deep .p-card-header {
      background: transparent;
      border: none;
      color: white;
      display: none; /* No necesitamos header en confirmación */
    }

    .confirmation-card ::ng-deep .p-card-body,
    .confirmation-card ::ng-deep .p-card-content {
      background: transparent;
      color: white;
    }

    .confirmation-content {
      padding: 1rem 0;
    }

    .success-icon {
      margin-bottom: 1.5rem;
    }

    .success-icon .pi {
      font-size: 4rem;
      color: #4ade80;
      background: white;
      border-radius: 50%;
      padding: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .confirmation-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
    }

    .confirmation-message {
      margin: 0 0 1.5rem 0;
      font-size: 1rem;
      opacity: 0.9;
    }

    .inscription-details {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .detail-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.75rem;
      gap: 0.75rem;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .detail-icon {
      color: #4ade80;
      width: 20px;
      flex-shrink: 0;
    }

    .detail-label {
      font-weight: 500;
      min-width: 70px;
      opacity: 0.9;
    }

    .detail-value {
      font-weight: 600;
      flex: 1;
      word-break: break-word;
    }

    .info-message {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.75rem;
      border-radius: 6px;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-buttons ::ng-deep .p-button {
      border-radius: 8px;
      font-weight: 500;
      padding: 0.75rem 1.5rem;
    }

    .action-buttons ::ng-deep .p-button-outlined {
      background: white;
      color: #667eea;
      border-color: white;
    }

    .action-buttons ::ng-deep .p-button-outlined:hover {
      background: rgba(255, 255, 255, 0.9);
      color: #5a67d8;
    }

    .action-buttons ::ng-deep .p-button-secondary {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
      color: white;
    }

    .action-buttons ::ng-deep .p-button-secondary:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Responsive */
    @media (max-width: 576px) {
      .join-container {
        padding: 0.5rem;
      }
      
      .success-icon .pi {
        font-size: 3rem;
        padding: 0.75rem;
      }
      
      .confirmation-title {
        font-size: 1.25rem;
      }
      
      .detail-item {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .detail-label {
        min-width: 60px;
        font-size: 0.9rem;
      }
    }
  `]
})
export class JoinComponent implements OnInit, OnDestroy {
  joinForm!: FormGroup;
  tenantId!: string;
  isSubmitting = false;
  showConfirmation = false;
  submittedData: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private queueService: QueueService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getTenantFromRoute();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.joinForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      song: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      youtubeLink: ['', [this.youtubeValidator]]
    });
  }

  private getTenantFromRoute(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.tenantId = params['tenant'] || 'default';
        console.log('Tenant ID obtenido:', this.tenantId);
      });
  }

  private youtubeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    
    if (!youtubeRegex.test(control.value)) {
      return { invalidUrl: true };
    }
    
    return null;
  }

  onButtonClick(event: Event): void {
    console.log('=== BOTÓN CLICKEADO ===');
    console.log('Event:', event);
    console.log('Formulario válido:', this.joinForm.valid);
    console.log('Formulario pristine:', this.joinForm.pristine);
    console.log('Está enviando:', this.isSubmitting);
  }

  onSubmit(): void {
    console.log('=== INICIO onSubmit ===');
    
    if (this.joinForm.invalid || this.isSubmitting) {
      console.log('Formulario inválido o ya enviando:', {
        invalid: this.joinForm.invalid,
        isSubmitting: this.isSubmitting,
        errors: this.joinForm.errors
      });
      this.joinForm.markAllAsTouched();
      return;
    }

    console.log('Formulario válido, procediendo...');
    this.isSubmitting = true;
    
    try {
      console.log('Datos del formulario:', this.joinForm.value);

      const formValue = this.joinForm.value;
      // Usar la estructura exacta de la tabla según el schema SQL
      const payload: any = {
        tenant_id: this.tenantId,
        name: formValue.name.trim(),
        title_raw: formValue.song.trim(), // Campo correcto según el schema
        status: 'waiting'
      };

      // Agregar YouTube URL si está presente
      if (formValue.youtubeLink?.trim()) {
        payload.youtube_url = formValue.youtubeLink.trim();
      }

      console.log('Payload preparado:', payload);
      console.log('Claves del payload:', Object.keys(payload));
      console.log('QueueService disponible:', !!this.queueService);
      console.log('Tipo de QueueService:', typeof this.queueService);
      console.log('Método add disponible:', typeof this.queueService?.add);

      // Verificar que NO hay campo 'song' en el payload
      if ('song' in payload) {
        console.error('ERROR: El payload contiene el campo "song" que no debería estar');
        delete payload.song;
        console.log('Campo "song" eliminado. Nuevo payload:', payload);
      }

      // Llamada real a Supabase
      console.log('Iniciando llamada a Supabase...');
      this.queueService.add(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            console.log('=== RESPUESTA EXITOSA DE SUPABASE ===');
            console.log('Respuesta:', response);
            
            // Guardar datos para mostrar en confirmación
            this.submittedData = {
              name: payload.name,
              song: payload.song_title || payload.title || 'Canción enviada', // Usar cualquier campo que hayamos enviado
              youtubeLink: payload.youtube_url || payload.youtubeLink,
              timestamp: new Date()
            };
            
            // Mostrar pantalla de confirmación
            this.showConfirmation = true;
            this.isSubmitting = false;
            console.log('=== ÉXITO - Mostrando confirmación ===');
          },
          error: (error: any) => {
            console.error('=== ERROR DE SUPABASE ===');
            console.error('Error completo:', error);
            console.error('Tipo de error:', typeof error);
            console.error('Constructor del error:', error.constructor?.name);
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
            
            if (error.details) console.error('Details:', error.details);
            if (error.hint) console.error('Hint:', error.hint);
            if (error.code) console.error('Code:', error.code);
            
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al guardar: ${error.message || 'Error desconocido'}`,
              life: 5000
            });
            this.isSubmitting = false;
          }
        });

    } catch (error) {
      console.error('Error en el try-catch:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error inesperado en el formulario',
        life: 5000
      });
      this.isSubmitting = false;
    }
  }

  requestAnotherSong(): void {
    this.showConfirmation = false;
    this.submittedData = null;
    this.joinForm.reset();
    this.isSubmitting = false;
  }

  goToQueue(): void {
    this.router.navigate(['/queue', this.tenantId]); // Updated to use path params instead of query params
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.joinForm.valid) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  hasFieldError(fieldName: string, errorType: string): boolean {
    const control = this.joinForm.get(fieldName);
    return !!(control && control.hasError(errorType) && (control.dirty || control.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.joinForm.get(fieldName);
    
    if (!control || !control.errors) return '';
    
    const errors = control.errors;
    
    switch (fieldName) {
      case 'name':
        if (errors['required']) return 'El nombre es requerido';
        if (errors['minlength']) return 'Mínimo 2 caracteres';
        if (errors['maxlength']) return 'Máximo 50 caracteres';
        break;
        
      case 'song':
        if (errors['required']) return 'La canción es requerida';
        if (errors['minlength']) return 'Mínimo 3 caracteres';
        if (errors['maxlength']) return 'Máximo 200 caracteres';
        break;
        
      case 'youtubeLink':
        if (errors['invalidUrl']) return 'URL de YouTube inválida';
        break;
    }
    
    return 'Campo inválido';
  }
}