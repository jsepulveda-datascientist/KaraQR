/**
 * Cargar polyfills ANTES que la aplicación
 * Esto asegura compatibilidad con navegadores antiguos (Smart TV, Chromium 104, etc.)
 */
import './polyfills';

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
