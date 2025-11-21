import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-join-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div class="text-center p-8">
        <div class="mb-6">
          <i class="pi pi-spin pi-spinner text-4xl text-primary-600"></i>
        </div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
          🎤 Redirigiendo a KaraQR Singer...
        </h2>
        <p class="text-gray-600 mb-6">
          Te estamos conectando a tu sesión de karaoke
        </p>
        <div class="text-sm text-gray-500">
          <p>Tenant: <span class="font-mono font-medium">{{ tenantId || 'Detectando...' }}</span></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class JoinRedirectComponent implements OnInit {
  tenantId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Obtener el tenant de los query parameters
    this.route.queryParams.subscribe(params => {
      this.tenantId = params['tenant'];
      console.log('🔗 JoinRedirect: Tenant detectado:', this.tenantId);
      
      // Construir URL de redirección
      const baseUrl = 'https://karaqr-singer.pages.dev/login';
      const redirectUrl = this.tenantId 
        ? `${baseUrl}?tenant=${this.tenantId}`
        : baseUrl;
      
      console.log('🚀 Redirigiendo a:', redirectUrl);
      
      // Redireccionar después de un breve delay para mostrar el mensaje
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    });
  }
}