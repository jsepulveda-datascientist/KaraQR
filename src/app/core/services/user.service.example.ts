import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supa.service';
// Aquí podrías importar interfaces de usuario cuando las crees:
// import { User, UserProfile } from '../interfaces';

/**
 * Ejemplo de cómo usar SupabaseService en otros servicios
 * Este sería un servicio hipotético para gestionar usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Ejemplo de uso directo del cliente para otra tabla
   */
  getUsers(): Observable<any[]> {
    return from(
      this.supabaseService.client
        .from('users')
        .select('*')
    ).pipe(
      map(({ data, error }: any) => {
        if (error) throw error;
        return data || [];
      })
    );
  }

  /**
   * Ejemplo de uso de RPC
   */
  callCustomFunction(params: any): Observable<any> {
    return from(
      this.supabaseService.rpc('custom_user_function', params)
    ).pipe(
      map(({ data, error }: any) => {
        if (error) throw error;
        return data;
      })
    );
  }

  /**
   * Ejemplo de uso de autenticación
   */
  async signIn(email: string, password: string) {
    return await this.supabaseService.auth.signInWithPassword({
      email,
      password
    });
  }

  /**
   * Ejemplo de uso de storage
   */
  async uploadFile(file: File, path: string) {
    return await this.supabaseService.storage
      .from('avatars')
      .upload(path, file);
  }
}