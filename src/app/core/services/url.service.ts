import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UrlService {

  /**
   * Construye una URL completa para la aplicación
   * @param path Ruta relativa (ej: '/join', '/queue')
   * @param params Parámetros de query string opcionales
   * @returns URL completa basada en el environment
   */
  buildUrl(path: string, params?: Record<string, string>): string {
    // Asegurar que el path empiece con /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Construir URL base
    let url = `${environment.baseUrl}${cleanPath}`;
    
    // Agregar parámetros si existen
    if (params && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Construye la URL para unirse a un tenant específico
   * @param tenantId ID del tenant
   * @returns URL completa para join
   */
  buildJoinUrl(tenantId: string): string {
    return this.buildUrl('/join', { tenant: tenantId });
  }

  /**
   * Construye la URL para la pantalla de queue de un tenant específico
   * @param tenantId ID del tenant
   * @returns URL completa para queue
   */
  buildQueueUrl(tenantId: string): string {
    return this.buildUrl('/queue', { tenant: tenantId });
  }

  /**
   * Obtiene la URL base configurada para el ambiente actual
   * @returns URL base del ambiente
   */
  getBaseUrl(): string {
    return environment.baseUrl;
  }
}