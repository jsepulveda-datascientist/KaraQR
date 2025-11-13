/**
 * Polyfills MÍNIMOS para Chrome 104+
 * 
 * ESTRATEGIA: Máxima simplicidad para evitar STATUS_ACCESS_VIOLATION
 * 
 * Chrome 104 TIENE nativamente:
 * ✓ Promise, async/await
 * ✓ URL, URLSearchParams
 * ✓ Array.flat(), flatMap()
 * ✓ Object.assign(), values(), entries()
 * ✓ Map, Set
 * ✓ String methods
 * 
 * Este archivo SOLO carga polyfills absolutamente necesarios.
 */

// ============================================================================
// RESIZE OBSERVER - CRÍTICO PARA PRIMENG
// ============================================================================

/**
 * ResizeObserver polyfill (detecta cambios de tamaño en DOM)
 * Necesario para PrimeNG y componentes responsive
 */
import 'resize-observer-polyfill';

// ============================================================================
// POLYFILLS MANUALES SIMPLES - 100% SEGUROS
// ============================================================================

/**
 * Array.at() - Acceso a elementos con índices negativos
 * arr.at(-1) devuelve el último elemento
 */
if (!Array.prototype.at) {
  try {
    Object.defineProperty(Array.prototype, 'at', {
      value: function (index: number): any {
        const len = this.length >>> 0;
        if (len === 0) return undefined;
        let k = Number(index) || 0;
        if (k < 0) k = len + k;
        if (k < 0 || k >= len) return undefined;
        return this[k];
      },
      writable: true,
      configurable: true,
    });
  } catch (e) {
    // Error silencioso - Chrome 104 ya lo tiene
  }
}

/**
 * String.at() - Acceso a caracteres con índices negativos
 */
if (!String.prototype.at) {
  try {
    Object.defineProperty(String.prototype, 'at', {
      value: function (index: number): string | undefined {
        const str = String(this);
        const len = str.length >>> 0;
        if (len === 0) return undefined;
        let k = Number(index) || 0;
        if (k < 0) k = len + k;
        if (k < 0 || k >= len) return undefined;
        return str[k];
      },
      writable: true,
      configurable: true,
    });
  } catch (e) {
    // Error silencioso - Chrome 104 ya lo tiene
  }
}

// ============================================================================
// LOGGING
// ============================================================================

console.log('✅ Polyfills cargados (modo minimalista para Chrome 104)');

// Log de APIs disponibles
const apis = {
  'ResizeObserver': typeof ResizeObserver,
  'Promise': typeof Promise,
  'Map': typeof Map,
  'Set': typeof Set,
  'URL': typeof URL,
  'Array.at': typeof Array.prototype.at,
  'String.at': typeof String.prototype.at,
};

console.table(apis);
