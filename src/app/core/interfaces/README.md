# Core Interfaces

Esta carpeta contiene todas las interfaces TypeScript utilizadas en el proyecto KaraQR.

## Estructura

```
interfaces/
├── queue.interface.ts      # Interfaces relacionadas con la cola de karaoke
├── database.interface.ts   # Tipos de base de datos Supabase
└── index.ts               # Barrel export para importaciones centralizadas
```

## Uso

### Importación Centralizada

```typescript
// Recomendado: importar desde el barrel export
import { QueueEntry, QueueResponse, Database } from '../interfaces';

// También válido: importar desde archivos específicos
import { QueueEntry } from '../interfaces/queue.interface';
import { Database } from '../interfaces/database.interface';
```

### En Servicios

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QueueEntry, QueueResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class MyService {
  getEntries(): Observable<QueueResponse> {
    // implementación
  }
}
```

### En Componentes

```typescript
import { Component } from '@angular/core';
import { QueueEntry, QueueStats } from '../../core/interfaces';

@Component({
  selector: 'app-my-component',
  template: ''
})
export class MyComponent {
  entries: QueueEntry[] = [];
  stats: QueueStats | null = null;
}
```

## Interfaces Disponibles

### QueueInterface

- **`QueueEntry`** - Representa una entrada individual en la cola
- **`QueueResponse`** - Respuesta del servicio que incluye datos y total
- **`QueueStats`** - Estadísticas agregadas de la cola

### DatabaseInterface

- **`Database`** - Esquema completo de la base de datos Supabase
- Incluye tipos para tablas, funciones RPC y procedimientos

## Beneficios

1. **Centralización**: Todas las interfaces en un solo lugar
2. **Reutilización**: Fácil importación desde cualquier parte del proyecto
3. **Mantenibilidad**: Cambios centralizados se propagan automáticamente
4. **Tipado Fuerte**: TypeScript garantiza consistencia en todo el proyecto
5. **Escalabilidad**: Fácil agregar nuevas interfaces sin contaminar servicios

## Convenciones

- Use nombres descriptivos terminados en `Interface` para archivos
- Documente interfaces complejas con comentarios JSDoc
- Exporte todas las interfaces desde `index.ts`
- Mantenga interfaces relacionadas en el mismo archivo
- Use tipos de unión para enums y estados