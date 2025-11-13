/**
 * Polyfills para compatibilidad con navegadores antiguos
 * 
 * Este archivo importa polyfills necesarios para soportar:
 * - Chromium 104 y versiones anteriores
 * - Navegadores de Smart TV (LG webOS, Samsung SmartTV, etc.)
 * - APIs modernas no disponibles en navegadores legacy
 * 
 * TARGET: Chromium 104 (2022) y versiones anteriores
 * 
 * En Angular 20 (configuración moderna), los polyfills se pueden
 * importar aquí. Este archivo se carga automáticamente al compilar.
 */

// ============================================================================
// CORE-JS: Polyfills para APIs de JavaScript modernas
// ============================================================================

/**
 * Promesas (Promise)
 * Soporte para async/await y callbacks de promesas
 * Necesario: Chromium < 32 (2014)
 */
import 'core-js/features/promise';

/**
 * URL y URLSearchParams
 * APIs para manipulación de URLs
 * Necesario: Chromium < 32 (2014)
 */
import 'core-js/features/url';
import 'core-js/features/url-search-params';

/**
 * Array methods modernos
 * Métodos como flat() y flatMap() para arrays anidados
 * Necesario: Chromium < 69 (2018)
 */
import 'core-js/features/array/flat';
import 'core-js/features/array/flat-map';

/**
 * Object methods modernos
 * Object.assign(), Object.values(), Object.entries()
 * Necesario: Chromium < 45 (2015)
 */
import 'core-js/features/object/assign';
import 'core-js/features/object/values';
import 'core-js/features/object/entries';

/**
 * String methods modernos
 * String.prototype.padStart(), padEnd(), repeat()
 * Necesario: Chromium < 57 (2017)
 */
import 'core-js/features/string/pad-start';
import 'core-js/features/string/pad-end';
import 'core-js/features/string/repeat';

/**
 * Map y Set
 * Estructuras de datos modernas
 * Necesario: Chromium < 38 (2014)
 */
import 'core-js/features/map';
import 'core-js/features/set';

/**
 * Symbol
 * Tipo de dato único e inmutable
 * Necesario: Chromium < 38 (2014)
 */
import 'core-js/features/symbol';

/**
 * Polyfill global de core-js para mayor compatibilidad
 * Esto importa todos los polyfills estables recomendados
 * Se carga al final para asegurar que todo está disponible
 */
import 'core-js/stable';

// ============================================================================
// POLYFILLS ESPECÍFICOS PARA NAVEGADORES LEGACY
// ============================================================================

/**
 * ResizeObserver
 * API para observar cambios de tamaño en elementos DOM
 * Usado por: PrimeNG, bibliotecas de layout responsivo
 * Necesario: Chromium < 64 (2018)
 */
import 'resize-observer-polyfill';

// ============================================================================
// POLYFILLS MANUALES ADICIONALES
// ============================================================================

/**
 * Polyfill manual para Array.prototype.at()
 * 
 * Método at() permite acceder a elementos de arrays con índices negativos:
 *   arr.at(-1) // último elemento
 *   arr.at(0)  // primer elemento
 * 
 * Necesario: Chromium < 92 (2021)
 * 
 * Referencia: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
 */
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

/**
 * Polyfill manual para String.prototype.at()
 * Similar a Array.at() pero para strings
 * Necesario: Chromium < 92 (2021)
 */
if (!String.prototype.at) {
  // eslint-disable-next-line no-extend-native
  Object.defineProperty(String.prototype, 'at', {
    value: function (index: number): any {
      const str = this.toString();
      const len = str.length >>> 0;
      if (len === 0) return undefined;

      let k = Number(index) || 0;

      if (k < 0) {
        k = len + k;
      }

      if (k < 0 || k >= len) {
        return undefined;
      }

      return str[k];
    },
    writable: true,
    configurable: true,
  });
}

// ============================================================================
// VERIFICACIÓN Y LOGGING
// ============================================================================

const polyfillsEnabled = {
  'core-js/Promise': typeof Promise !== 'undefined',
  'core-js/URL': typeof URL !== 'undefined',
  'core-js/Map': typeof Map !== 'undefined',
  'core-js/Set': typeof Set !== 'undefined',
  'core-js/Symbol': typeof Symbol !== 'undefined',
  'core-js/Proxy': typeof Proxy !== 'undefined',
  'ResizeObserver': typeof ResizeObserver !== 'undefined',
  'Array.prototype.at': typeof Array.prototype.at === 'function',
  'String.prototype.at': typeof String.prototype.at === 'function',
};

const disabledPolyfills = Object.entries(polyfillsEnabled)
  .filter(([, enabled]) => !enabled)
  .map(([name]) => name);

if (disabledPolyfills.length > 0) {
  console.warn('⚠️ Polyfills no disponibles:', disabledPolyfills);
} else {
  console.log('✅ Todos los polyfills cargados correctamente para Chromium 104 y anteriores');
}

// ============================================================================
// DOCUMENTACIÓN: COMPATIBILIDAD Y CARGA
// ============================================================================

/*
 * COMPATIBILIDAD CON CHROMIUM 104 Y ANTERIORES:
 * 
 * Este archivo proporciona soporte para:
 * - Chromium 104 (2022) y versiones anteriores
 * - Smart TV (LG webOS, Samsung SmartTV, etc.)
 * - Navegadores legacy que faltan APIs modernas
 * 
 * POLYFILLS INCLUIDOS:
 * ✓ core-js: Proporciona Promise, URL, Array methods, Object methods, String methods, Map, Set, Symbol, Proxy, Reflect
 * ✓ resize-observer-polyfill: Para ResizeObserver (usado por PrimeNG)
 * ✓ Polyfills manuales: Array.at(), String.at()
 * 
 * CARGA EN ANGULAR 20:
 * Los polyfills se cargan automáticamente desde src/polyfills.ts
 * en el orden correcto (ANTES que la aplicación).
 * 
 * VERSIONES MÍNIMAS SOPORTADAS:
 * - Chromium: 104+ (o tan bajo como 32 con core-js)
 * - Firefox: 104+ (o más bajo con polyfills)
 * - Safari: 12+
 * - Edge: 104+
 * 
 * REFERENCIAS:
 * - core-js: https://github.com/zloirock/core-js
 * - resize-observer-polyfill: https://github.com/que-etc/resize-observer-polyfill
 * - MDN - Polyfills: https://developer.mozilla.org/es/docs/Glossary/Polyfill
 */
