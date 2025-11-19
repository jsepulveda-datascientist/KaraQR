import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { BadgeModule } from 'primeng/badge';

interface SingerProfile {
  name: string;
  email: string;
  favoriteGenres: string[];
  notifications: {
    queueUpdates: boolean;
    turnReminder: boolean;
    newSongs: boolean;
  };
  stats: {
    totalSongs: number;
    favoriteGenre: string;
    joinDate: Date;
  };
}

@Component({
  selector: 'app-singer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    CheckboxModule,
    AvatarModule,
    TagModule,
    BadgeModule
  ],
  template: `
    <div class="profile-container">
      <!-- Header con avatar y stats básicos -->
      <div class="profile-header">
        <p-card styleClass="header-card">
          <div class="header-content">
            <div class="avatar-section">
              <p-avatar 
                [label]="getInitials(profile.name)"
                styleClass="profile-avatar"
                size="xlarge">
              </p-avatar>
              <button pButton 
                label="Cambiar Foto" 
                class="p-button-text p-button-sm"
                icon="pi pi-camera">
              </button>
            </div>
            <div class="profile-info">
              <h1 class="profile-name">{{ profile.name }}</h1>
              <p class="profile-email">{{ profile.email }}</p>
              <div class="stats-quick">
                <div class="stat-item">
                  <span class="stat-value">{{ profile.stats.totalSongs }}</span>
                  <span class="stat-label">Canciones</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ profile.stats.favoriteGenre }}</span>
                  <span class="stat-label">Género Favorito</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ getJoinDays() }}</span>
                  <span class="stat-label">Días Activo</span>
                </div>
              </div>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Información Personal -->
      <div class="section">
        <p-card styleClass="section-card">
          <ng-template pTemplate="header">
            <h2 class="section-title">
              <i class="pi pi-user"></i>
              Información Personal
            </h2>
          </ng-template>
          
          <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
            <div class="form-grid">
              
              <div class="field">
                <label for="name">Nombre *</label>
                <input pInputText 
                  id="name"
                  formControlName="name"
                  placeholder="Tu nombre completo"
                  class="w-full" />
                <small class="p-error" *ngIf="profileForm.get('name')?.invalid && profileForm.get('name')?.touched">
                  El nombre es requerido
                </small>
              </div>

              <div class="field">
                <label for="email">Email</label>
                <input pInputText 
                  id="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  class="w-full" />
              </div>

              <div class="selected-genres">
                <h4>Géneros Favoritos:</h4>
                <div class="genre-tags">
                  <p-tag 
                    *ngFor="let genre of profile.favoriteGenres"
                    [value]="genre"
                    icon="pi pi-music">
                  </p-tag>
                </div>
              </div>

              <div class="form-actions">
                <button pButton 
                  type="submit"
                  label="Guardar Cambios"
                  icon="pi pi-save"
                  [disabled]="profileForm.invalid"
                  class="save-btn">
                </button>
              </div>

            </div>
          </form>
        </p-card>
      </div>

      <!-- Notificaciones -->
      <div class="section">
        <p-card styleClass="section-card">
          <ng-template pTemplate="header">
            <h2 class="section-title">
              <i class="pi pi-bell"></i>
              Notificaciones
            </h2>
          </ng-template>
          
          <form [formGroup]="notificationsForm" (ngSubmit)="onSaveNotifications()">
            <div class="notifications-grid">
              
              <div class="notification-item">
                <div class="notification-info">
                  <h4>Actualizaciones de Cola</h4>
                  <p>Recibe notificaciones cuando cambie tu posición en la cola</p>
                </div>
                <p-checkbox 
                  formControlName="queueUpdates"
                  binary="true">
                </p-checkbox>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>Recordatorio de Turno</h4>
                  <p>Te avisamos cuando falten 2 canciones para tu turno</p>
                </div>
                <p-checkbox 
                  formControlName="turnReminder"
                  binary="true">
                </p-checkbox>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h4>Nuevas Canciones</h4>
                  <p>Entérate cuando agreguen canciones de tus géneros favoritos</p>
                </div>
                <p-checkbox 
                  formControlName="newSongs"
                  binary="true">
                </p-checkbox>
              </div>

              <div class="form-actions">
                <button pButton 
                  type="submit"
                  label="Guardar Preferencias"
                  icon="pi pi-save"
                  class="save-btn">
                </button>
              </div>

            </div>
          </form>
        </p-card>
      </div>

      <!-- Estadísticas -->
      <div class="section">
        <p-card styleClass="section-card">
          <ng-template pTemplate="header">
            <h2 class="section-title">
              <i class="pi pi-chart-line"></i>
              Mis Estadísticas
            </h2>
          </ng-template>
          
          <div class="stats-detailed">
            <div class="stats-cards">
              <div class="stat-card">
                <div class="stat-icon songs">
                  <i class="pi pi-music"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ profile.stats.totalSongs }}</span>
                  <span class="stat-label">Canciones Cantadas</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon genre">
                  <i class="pi pi-star"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ profile.stats.favoriteGenre }}</span>
                  <span class="stat-label">Género Favorito</span>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon days">
                  <i class="pi pi-calendar"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ getJoinDays() }}</span>
                  <span class="stat-label">Días Cantando</span>
                </div>
              </div>

            </div>

            <div class="achievements">
              <h3>Logros</h3>
              <div class="achievement-grid">
                <div class="achievement-badge" *ngFor="let achievement of achievements">
                  <i class="pi" [ngClass]="achievement.icon"></i>
                  <span class="achievement-name">{{ achievement.name }}</span>
                  <p-badge 
                    *ngIf="achievement.earned"
                    value="✓"
                    severity="success">
                  </p-badge>
                </div>
              </div>
            </div>

          </div>
        </p-card>
      </div>

    </div>
  `,
  styleUrl: './singer-profile.component.scss'
})
export class SingerProfileComponent implements OnInit {
  
  profileForm!: FormGroup;
  notificationsForm!: FormGroup;
  
  profile: SingerProfile = {
    name: 'Juan Pérez',
    email: 'juan@email.com',
    favoriteGenres: ['Rock', 'Pop'],
    notifications: {
      queueUpdates: true,
      turnReminder: true,
      newSongs: false
    },
    stats: {
      totalSongs: 45,
      favoriteGenre: 'Rock',
      joinDate: new Date('2024-01-15')
    }
  };

  achievements = [
    { name: 'Primer Canción', icon: 'pi-star', earned: true },
    { name: '10 Canciones', icon: 'pi-trophy', earned: true },
    { name: 'Noche Completa', icon: 'pi-moon', earned: false },
    { name: 'Género Master', icon: 'pi-crown', earned: false }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      name: [this.profile.name, [Validators.required, Validators.minLength(2)]],
      email: [this.profile.email, [Validators.email]]
    });

    this.notificationsForm = this.fb.group({
      queueUpdates: [this.profile.notifications.queueUpdates],
      turnReminder: [this.profile.notifications.turnReminder],
      newSongs: [this.profile.notifications.newSongs]
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getJoinDays(): number {
    const now = new Date();
    const joinDate = new Date(this.profile.stats.joinDate);
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  onSaveProfile(): void {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      this.profile = {
        ...this.profile,
        name: formValue.name,
        email: formValue.email
      };
      
      // TODO: Integrar con servicio para guardar en backend
      console.log('Perfil guardado:', this.profile);
    }
  }

  onSaveNotifications(): void {
    const formValue = this.notificationsForm.value;
    this.profile.notifications = formValue;
    
    // TODO: Integrar con servicio para guardar preferencias
    console.log('Notificaciones guardadas:', this.profile.notifications);
  }
}