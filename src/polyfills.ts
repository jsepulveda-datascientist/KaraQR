/**
 * Polyfills para compatibilidad con navegadores antiguos
 * 
 * Este archivo importa polyfills necesarios para soportar:
 * - Navegadores de Smart TV (LG webOS, Samsung SmartTV, etc.)
 * - Chromium 104 y versiones anteriores
 * - APIs modernas no disponibles en navegadores legacy
 * 
 * En Angular 20 (configuración moderna), los polyfills se pueden
 * importar aquí o en main.ts. Este archivo se carga automáticamente
 * si se referencia en angular.json o main.ts.
 */

// ============================================================================
// CORE-JS: Polyfills para APIs de JavaScript modernas
// ============================================================================

/**
 * Promesas (Promise)
 * Soporte para async/await y callbacks de promesas
 * Requerido: Navegadores muy antiguos (pre-2015)
 */
import 'core-js/features/promise';

/**
 * URL y URLSearchParams
 * APIs para manipulación de URLs
 * Requerido: Navegadores antiguos sin soporte nativo
 */
import 'core-js/features/url';
import 'core-js/features/url-search-params';

/**
 * Array methods modernas
 * Métodos como flat() y flatMap() para arrays anidados
 * Requerido: Navegadores < Chromium 69 (2018)
 */
import 'core-js/features/array/flat';
import 'core-js/features/array/flat-map';

/**
 * Object methods
 * Object.assign() y Object.values()
 * Requerido: Navegadores < Chromium 45 (2015)
 */
import 'core-js/features/object/assign';
import 'core-js/features/object/values';

// ============================================================================
// FETCH API y otros polyfills
// ============================================================================

/**
 * Fetch API
 * Reemplazo moderno para XMLHttpRequest
 * Requerido: Navegadores < Chromium 42 (2015)
 * Nota: Angular ya incluye HttpClient, pero algunos libs externas pueden necesitarlo
 */
import 'whatwg-fetch';

/**
 * ResizeObserver
 * API para observar cambios de tamaño en elementos DOM
 * Usado por: PrimeNG, bibliotecas de layout responsivo
 * Requerido: Navegadores < Chromium 64 (2018)
 */
import 'resize-observer-polyfill';

// ============================================================================
// POLYFILLS MANUALES
// ============================================================================

/**
 * Polyfill manual para Array.prototype.at()
 * 
 * Método at() permite acceder a elementos de arrays con índices negativos:
 *   arr.at(-1) // último elemento
 *   arr.at(0)  // primer elemento
 * 
 * Requerido: Navegadores < Chromium 92 (2021), Smart TV antiguas
 * 
 * Referencia: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
 */
declare global {
  interface Array<T> {
    at(index: number): T | undefined;
  }
}

if (!Array.prototype.at) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(Array.prototype, 'at', {
    value: function (index: number): any {
      const len = this.length >>> 0;
      if (len === 0) return undefined;

      let k = Number(index) || 0;

      // Manejo de índices negativos
      if (k < 0) {
        k = len + k;
      }

      // Validar rango
      if (k < 0 || k >= len) {
        return undefined;
      }

      return this[k];
    },
    writable: true,
    configurable: true,
  });
}

// ============================================================================
// DOCUMENTACIÓN ADICIONAL
// ============================================================================

/*
 * CÓMO CARGAN LOS POLYFILLS EN ANGULAR 20:
 * 
 * 1. Opción A: Import en main.ts (recomendado en Angular 15+)
 *    main.ts incluye: import './polyfills'
 *    Esto carga todos los polyfills ANTES de la aplicación
 * 
 * 2. Opción B: Referencia en angular.json
 *    En la config de build, la propiedad "polyfills" especifica los archivos
 *    a cargar al inicio (este archivo).
 * 
 * 3. ORDEN IMPORTANTE:
 *    Los polyfills deben cargarse ANTES que el código de la aplicación.
 *    Por eso están en src/polyfills.ts (se importan primero).
 * 
 * VERSIÓN DE ANGULAR:
 * - Angular 20 (v20.x.x) utiliza la arquitectura moderna con ViewEngine
 *   y soporta módulos ES2020+
 * - Los polyfills legacy NO se necesitan en Angular 20 para navegadores modernos
 * - Pero ESTOS polyfills son específicos para compatibilidad con Smart TV
 *   y Chromium 104 (que es bastante antiguo, 2022)
 */

console.log('✅ Polyfills cargados para compatibilidad con navegadores antiguos');
