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
 * NOTA: Se usan polyfills selectivos en lugar de core-js/stable para evitar
 * conflictos de memoria (STATUS_ACCESS_VIOLATION) en navegadores antiguos.
 */

// ============================================================================
// POLYFILLS SELECTIVOS DE CORE-JS (Sin usar core-js/stable)
// ============================================================================

/**
 * IMPORTANTE: No cargamos core-js/stable ni core-js/features/proxy/reflect
 * porque pueden causar STATUS_ACCESS_VIOLATION en Chrome 104.
 * En su lugar, cargamos solo los polyfills más críticos y seguros.
 */

/**
 * Promesas (Promise)
 * Soporte para async/await y callbacks de promesas
 * Necesario: Chromium < 32 (2014)
 * Riesgo: BAJO - Es un polyfill muy estable
 */
import 'core-js/features/promise';

/**
 * URL y URLSearchParams
 * APIs para manipulación de URLs
 * Necesario: Chromium < 32 (2014)
 * Riesgo: BAJO - Es un polyfill muy estable
 */
import 'core-js/features/url';
import 'core-js/features/url-search-params';

/**
 * Array methods modernos
 * Métodos como flat() y flatMap() para arrays anidados
 * Necesario: Chromium < 69 (2018)
 * Riesgo: BAJO - Son métodos simples bien soportados
 */
import 'core-js/features/array/flat';
import 'core-js/features/array/flat-map';

/**
 * Object methods modernos
 * Object.assign(), Object.values(), Object.entries()
 * Necesario: Chromium < 45 (2015)
 * Riesgo: BAJO - Son métodos muy comunes y seguros
 */
import 'core-js/features/object/assign';
import 'core-js/features/object/values';
import 'core-js/features/object/entries';

/**
 * String methods modernos
 * String.prototype.padStart(), padEnd(), repeat()
 * Necesario: Chromium < 57 (2017)
 * Riesgo: BAJO - Métodos simples de manipulación de strings
 */
import 'core-js/features/string/pad-start';
import 'core-js/features/string/pad-end';
import 'core-js/features/string/repeat';

/**
 * Map y Set
 * Estructuras de datos modernas
 * Necesario: Chromium < 38 (2014)
 * Riesgo: BAJO-MEDIO - Generalmente seguros pero pueden tener problemas de memoria
 */
import 'core-js/features/map';
import 'core-js/features/set';

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
// POLYFILLS MANUALES SEGUROS
// ============================================================================

/**
 * Polyfill manual para Array.prototype.at()
 * 
 * Método at() permite acceder a elementos de arrays con índices negativos:
 *   arr.at(-1) // último elemento
 *   arr.at(0)  // primer elemento
 * 
 * Necesario: Chromium < 92 (2021)
 * Riesgo: BAJO - Es un polyfill simple y seguro
 * 
 * Referencia: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
 */
if (!Array.prototype.at) {
  try {
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
  } catch (e) {
    console.warn('⚠️ No se pudo agregar Array.prototype.at():', e);
  }
}

/**
 * Polyfill manual para String.prototype.at()
 * Similar a Array.at() pero para strings
 * Necesario: Chromium < 92 (2021)
 * Riesgo: BAJO - Es un polyfill simple y seguro
 */
if (!String.prototype.at) {
  try {
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
  } catch (e) {
    console.warn('⚠️ No se pudo agregar String.prototype.at():', e);
  }
}

// ============================================================================
// VERIFICACIÓN Y LOGGING
// ============================================================================

try {
  const polyfillsEnabled = {
    'core-js/Promise': typeof Promise !== 'undefined',
    'core-js/URL': typeof URL !== 'undefined',
    'core-js/Map': typeof Map !== 'undefined',
    'core-js/Set': typeof Set !== 'undefined',
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
    console.log('✅ Polyfills cargados correctamente para Chromium 104 y anteriores');
  }
} catch (e) {
  console.error('Error al verificar polyfills:', e);
}

// ============================================================================
// DOCUMENTACIÓN: COMPATIBILIDAD Y SOLUCIÓN A PROBLEMAS
// ============================================================================

/*
 * COMPATIBILIDAD CON CHROMIUM 104 Y ANTERIORES:
 * 
 * Este archivo proporciona soporte selectivo para:
 * - Chromium 104 (2022) y versiones anteriores
 * - Smart TV (LG webOS, Samsung SmartTV, etc.)
 * - Navegadores legacy que faltan APIs modernas
 * 
 * POLYFILLS INCLUIDOS (VERSIÓN OPTIMIZADA):
 * ✓ core-js/features/promise: Promise, async/await
 * ✓ core-js/features/url: URL, URLSearchParams
 * ✓ core-js/features/array: flat(), flatMap()
 * ✓ core-js/features/object: assign(), values(), entries()
 * ✓ core-js/features/string: padStart(), padEnd(), repeat()
 * ✓ core-js/features/map: Map
 * ✓ core-js/features/set: Set
 * ✓ resize-observer-polyfill: ResizeObserver (PrimeNG)
 * ✓ Polyfills manuales: Array.at(), String.at()
 * 
 * POLYFILLS EXCLUIDOS (Para evitar STATUS_ACCESS_VIOLATION):
 * ✗ core-js/stable: NO SE CARGA (causa conflictos de memoria)
 * ✗ core-js/features/symbol: NO SE CARGA (problemas con Chrome 104)
 * ✗ core-js/features/proxy: NO SE CARGA (causa violaciones de acceso)
 * ✗ core-js/features/reflect: NO SE CARGA (causa violaciones de acceso)
 * 
 * RAZÓN: Chrome 104 tiene limitaciones de memoria con ciertos polyfills
 * que requieren metaprogramación (Proxy, Reflect, Symbol).
 * 
 * CARGA EN ANGULAR 20:
 * Los polyfills se cargan automáticamente desde src/polyfills.ts
 * en el orden correcto (ANTES que la aplicación).
 * 
 * VERSIONES MÍNIMAS SOPORTADAS:
 * - Chromium: 104 (sin problemas), <104 (con limitaciones)
 * - Firefox: 104+
 * - Safari: 12+
 * - Edge: 104+
 * 
 * SOLUCIÓN DE PROBLEMAS:
 * 
 * Si obtienes STATUS_ACCESS_VIOLATION en Chrome 104:
 * 1. Este error indica conflicto de memoria con polyfills pesados
 * 2. Los polyfills Proxy/Reflect/Symbol causan este problema
 * 3. Esta versión los excluye ya para evitar el problema
 * 4. Si aún ocurre, verifica que no haya otros polyfills externos
 * 
 * Si necesitas Proxy/Reflect/Symbol:
 * 1. Considera usar una librería alternativa para esa funcionalidad
 * 2. O actualiza a navegadores más modernos (Chromium 105+)
 * 3. O implementa fallbacks específicos en tu código
 * 
 * REFERENCIAS:
 * - core-js: https://github.com/zloirock/core-js
 * - resize-observer-polyfill: https://github.com/que-etc/resize-observer-polyfill
 * - Chrome 104 Issues: https://bugs.chromium.org/p/chromium/issues
 * - MDN - Polyfills: https://developer.mozilla.org/es/docs/Glossary/Polyfill
 */
