import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CardModule],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-icon">
            <i class="pi pi-microphone" style="font-size: 4rem; color: var(--primary-color);"></i>
          </div>
          <h1 class="hero-title">¡Bienvenido a KaraQR!</h1>
          <p class="hero-subtitle">
            La aplicación de karaoke más moderna y fácil de usar. 
            Únete a la cola, canta tus canciones favoritas y disfruta con tus amigos.
          </p>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="features-grid">
          
          <!-- Feature 1: Cola Digital -->
          <p-card styleClass="feature-card">
            <ng-template pTemplate="header">
              <div class="feature-icon queue">
                <i class="pi pi-list"></i>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <h3>Cola Digital</h3>
              <p>
                Únete a la cola de karaoke de forma rápida y sencilla. 
                Ve tu posición en tiempo real y prepárate para cantar.
              </p>
            </ng-template>
            <ng-template pTemplate="footer">
              <button pButton 
                label="Usar App Móvil" 
                icon="pi pi-mobile" 
                disabled="true"
                title="Escanea el QR para usar la nueva app móvil"
                class="p-button-outlined">
              </button>
            </ng-template>
          </p-card>

          <!-- Feature 2: Gestión para Administradores -->
          <p-card styleClass="feature-card">
            <ng-template pTemplate="header">
              <div class="feature-icon admin">
                <i class="pi pi-cog"></i>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <h3>Panel de Control</h3>
              <p>
                Administra la cola de karaoke, gestiona canciones y 
                controla el flujo del evento desde un panel centralizado.
              </p>
            </ng-template>
            <ng-template pTemplate="footer">
              <button pButton 
                label="Acceder al Panel" 
                icon="pi pi-cog" 
                routerLink="/remote"
                class="p-button-outlined">
              </button>
            </ng-template>
          </p-card>

          <!-- Feature 3: Pantalla TV -->
          <p-card styleClass="feature-card">
            <ng-template pTemplate="header">
              <div class="feature-icon screen">
                <i class="pi pi-desktop"></i>
              </div>
            </ng-template>
            <ng-template pTemplate="content">
              <h3>Pantalla Principal</h3>
              <p>
                Conecta una pantalla para mostrar la cola actual, 
                el cantante en turno y la siguiente canción.
              </p>
            </ng-template>
            <ng-template pTemplate="footer">
              <button pButton 
                label="Emparejar Pantalla" 
                icon="pi pi-desktop" 
                routerLink="/pairing"
                class="p-button-outlined">
              </button>
            </ng-template>
          </p-card>

        </div>
      </div>

      <!-- How it Works Section -->
      <div class="how-it-works-section">
        <p-card styleClass="how-it-works-card">
          <ng-template pTemplate="header">
            <h2 class="section-title">¿Cómo Funciona?</h2>
          </ng-template>
          <ng-template pTemplate="content">
            <div class="steps-container">
              <div class="step">
                <div class="step-number">1</div>
                <h4>Únete</h4>
                <p>Ingresa tu nombre y únete a la cola de karaoke</p>
              </div>
              <div class="step-arrow">
                <i class="pi pi-arrow-right"></i>
              </div>
              <div class="step">
                <div class="step-number">2</div>
                <h4>Espera</h4>
                <p>Ve tu posición en la cola y prepara tu canción</p>
              </div>
              <div class="step-arrow">
                <i class="pi pi-arrow-right"></i>
              </div>
              <div class="step">
                <div class="step-number">3</div>
                <h4>¡Canta!</h4>
                <p>Cuando sea tu turno, sube al escenario y disfruta</p>
              </div>
            </div>
          </ng-template>
        </p-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions-section">
        <h2 class="section-title">Acciones Rápidas</h2>
        <div class="quick-actions-grid">
          <button pButton 
            label="App Móvil - Unirse" 
            icon="pi pi-mobile" 
            disabled="true"
            title="Usa la nueva app móvil para unirte"
            class="p-button-lg p-button-success">
          </button>
          <button pButton 
            label="Pantalla - Ver Cola" 
            icon="pi pi-eye" 
            disabled="true"
            title="Conecta una pantalla para ver la cola"
            class="p-button-lg">
          </button>
          <button pButton 
            label="Administrar" 
            icon="pi pi-cog" 
            routerLink="/remote"
            class="p-button-lg p-button-secondary">
          </button>
        </div>
      </div>

    </div>
  `,
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}