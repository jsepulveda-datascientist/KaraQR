import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ViewEncapsulation } from '@angular/core';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';

// Services
import { QueueService } from '../../../core/services/queue.service';
import { environment } from '../../../../environments/environment';

// Interfaces
import { QueueEntry } from '../../../core/interfaces/queue.interface';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    CardModule,
    AutoCompleteModule
  ],
  providers: [MessageService],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class JoinComponent implements OnInit, OnDestroy {
  joinForm!: FormGroup;
  tenantId!: string;
  tenantData: any = null;
  isSubmitting = false;
  showConfirmation = false;
  submittedData: any = null;
  filteredSongs: any[] = [];

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
              name: this.joinForm.value.name?.trim() || payload.name,
              song: this.joinForm.value.song?.trim() || payload.title_raw || 'Canción enviada',
              youtubeLink: this.joinForm.value.youtubeLink?.trim() || payload.youtube_url,
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

  completeSongs(event: any): void {
    // Implementar autocomplete para canciones si es necesario
    // Por ahora, simplemente mostrar sugerencias vacías
    this.filteredSongs = [];
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