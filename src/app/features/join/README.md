# JoinComponent - Documentación de Uso

## Descripción
Componente standalone de Angular 20 para que los clientes se anoten a cantar karaoke. Incluye formulario reactivo con validaciones, autocomplete de canciones y mensajería de éxito/error.

## Características
- ✅ Angular 20 standalone component
- ✅ PrimeNG 20 (InputText, AutoComplete, Button, Toast, Card)
- ✅ Reactive Forms con validaciones
- ✅ Mobile-first responsive design
- ✅ Accesibilidad (ARIA, labels, focus management)
- ✅ Toast notifications para feedback
- ✅ Autocomplete de canciones con mock service
- ✅ Integración con QueueService (stub para backend)
- ✅ Obtención de tenantId desde query parameters

## Uso

### 1. Importar en una ruta o componente padre

```typescript
// En app.routes.ts o donde corresponda
import { JoinComponent } from './features/join/join.component';

export const routes: Routes = [
  {
    path: 'join',
    component: JoinComponent,
    title: 'Anótate para cantar'
  }
  // ... otras rutas
];
```

### 2. URL de acceso
```
http://localhost:4200/join?tenant=mi-local
```

### 3. Dependencias necesarias

Asegúrate de tener instalado en package.json:
```json
{
  "dependencies": {
    "@angular/core": "^20.x",
    "@angular/common": "^20.x", 
    "@angular/forms": "^20.x",
    "@angular/router": "^20.x",
    "primeng": "^20.x",
    "primeicons": "^7.x",
    "primeflex": "^3.x"
  }
}
```

### 4. Configuración del HttpClient (necesario para QueueService)

En tu main.ts o app.config.ts:
```typescript
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... otros providers
  ]
};
```

## API del componente

### Inputs
- Obtiene `tenant` desde query parameters automáticamente
- Fallback a `environment.defaultTenant` si no se especifica

### Outputs
- Toast notifications para éxito/error
- Reseteo del formulario después de envío exitoso

### Servicios utilizados

#### SongService
Mock service que proporciona autocomplete de canciones:
- `search(term: string): Observable<string[]>`
- Lista base de 20+ canciones populares
- Filtrado por coincidencias de texto

#### QueueService  
Service stub para integración con backend:
- `addEntry(payload: QueueEntry): Observable<QueueResponse>`
- Simulación de respuesta con delay
- Manejo de errores HTTP

## Validaciones implementadas

### Campo Nombre
- Requerido
- Mínimo 2 caracteres
- Mensaje: "Ingresa tu nombre (mín. 2 caracteres)"

### Campo Canción
- Requerido  
- Mensaje: "Selecciona o escribe la canción"

### Formulario
- Submit habilitado solo cuando válido y no pristine
- Prevención de múltiples envíos
- Enter key trigger en cualquier campo

## Responsive Design

### Breakpoints
- Móvil: 320px - 480px (diseño principal)
- Tablet+: 481px+ (centrado con max-width)

### Optimizaciones móviles
- Font-size 16px en inputs (evita zoom en iOS)
- Área táctil ampliada en botones
- Toast posicionado apropiadamente
- AutoComplete con appendTo="body"

## Accesibilidad

### ARIA
- `aria-invalid` en campos con errores
- `aria-describedby` vincula errores con campos
- `role="alert"` en mensajes de error

### Labels y Focus
- Labels explícitos con `for` e `id`
- Focus management con outline visible
- Keyboard navigation completa

### Reducción de movimiento
- Soporte para `prefers-reduced-motion`
- Animaciones opcionales

## Próximos pasos

1. **Backend Integration**: Reemplazar `QueueService.simulateApiCall()` con HTTP calls reales
2. **Environment**: Configurar `environment.apiBase` con URL real
3. **Song Database**: Conectar `SongService` con API de canciones
4. **Theme**: Ajustar variables CSS según tema Ultima específico
5. **Testing**: Agregar unit tests y e2e tests
6. **Analytics**: Implementar tracking de eventos de cola

## Estructura de archivos creados

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       ├── queue.service.ts     # Stub para backend
│   │       └── song.service.ts      # Mock de canciones
│   └── features/
│       └── join/
│           ├── join.component.ts    # Componente principal
│           ├── join.component.html  # Template
│           └── join.component.scss  # Estilos mobile-first
└── environments/
    ├── environment.ts               # Config desarrollo
    └── environment.prod.ts          # Config producción
```

El componente está listo para usar y cumple con todos los requisitos especificados.