# QueueService - Karaoke Queue Management

## Descripción

Servicio Angular 20 standalone que gestiona la cola de karaoke usando Supabase como backend a través del `SupabaseService`.

## Arquitectura Refactorizada

### Estructura de Servicios

- **`SupabaseService`** (`src/app/core/services/supa.service.ts`) - Servicio centralizado para todas las operaciones con Supabase
- **`QueueService`** (`src/app/core/services/queue.service.ts`) - Servicio específico para gestión de cola, usa SupabaseService

### Estructura de Interfaces

- **`QueueInterface`** (`src/app/core/interfaces/queue.interface.ts`) - Interfaces relacionadas con la cola
- **`DatabaseInterface`** (`src/app/core/interfaces/database.interface.ts`) - Tipos de base de datos Supabase
- **`index.ts`** (`src/app/core/interfaces/index.ts`) - Barrel export para todas las interfaces

### Ventajas de la Refactorización

1. **Separación de Responsabilidades**: SupabaseService maneja la conexión, QueueService maneja la lógica de negocio
2. **Interfaces Organizadas**: Tipos centralizados en `core/interfaces` para mejor reutilización
3. **Reutilizable**: SupabaseService puede ser usado por otros servicios del proyecto
4. **Inyección de Dependencias**: Uso correcto del patrón DI de Angular
5. **Tipado Mejorado**: Tipos centralizados y bien organizados
6. **Mantenibilidad**: Código más organizado y fácil de mantener
7. **Escalabilidad**: Fácil agregar nuevas interfaces sin contaminar servicios

## Configuración

### 1. Archivos de Servicio e Interfaces

- `src/app/core/services/supa.service.ts` - Cliente Supabase 
- `src/app/core/services/queue.service.ts` - Lógica de cola
- `src/app/core/interfaces/` - Todas las interfaces TypeScript
- `src/environments/environment.ts` - Variables de entorno

### 2. Uso de Interfaces

```typescript
// Importar desde el barrel export
import { QueueEntry, QueueResponse, QueueStats, Database } from '../interfaces';

// O importar específicamente
import { QueueEntry } from '../interfaces/queue.interface';
import { Database } from '../interfaces/database.interface';
```

### 2. Variables de Entorno

```typescript
export const environment = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your-anon-key'
};
```

## Características

- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar entradas de la cola
- ✅ **Estados de Cola**: `waiting`, `current`, `performing`, `completed`
- ✅ **Polling Automático**: Actualización periódica de la cola
- ✅ **Tiempo Real**: Subscripciones WebSocket vía Supabase
- ✅ **Compatibilidad**: Mantiene compatibilidad con componentes existentes
- ✅ **TypeScript**: Tipado fuerte con interfaces definidas
- ✅ **Observables RxJS**: API reactiva para componentes
- ✅ **Arquitectura Limpia**: Servicios separados y organizados
- ✅ **Inyección de Dependencias**: Patrón DI correcto de Angular

## SupabaseService API

### Propiedades

```typescript
// Cliente Supabase completo
client: SupabaseClient<Database>

// Acceso directo a tabla queue
queue: QueryBuilder

// Métodos de conveniencia
from(table: string): QueryBuilder
rpc(functionName: string, params?: any): Promise<any>
channel(name: string): RealtimeChannel
removeChannel(channel: any): Promise<void>
auth: SupabaseAuthClient
storage: SupabaseStorageClient
```

### Uso del SupabaseService

```typescript
// En otro servicio
constructor(private supabaseService: SupabaseService) {}

// Acceso directo al cliente
this.supabaseService.client.from('other_table').select('*')

// Usar getter de conveniencia
this.supabaseService.queue.select('*')

// RPC calls
this.supabaseService.rpc('custom_function')

// Realtime
this.supabaseService.channel('custom_channel')
```

## Interfaces Disponibles

### QueueInterface (`queue.interface.ts`)

```typescript
// Entrada individual de la cola
interface QueueEntry {
  id?: number;
  name: string;
  song: string;
  titleRaw?: string;
  youtubeUrl?: string;
  youtubeLink?: string;
  status?: 'waiting' | 'current' | 'completed' | 'performing';
  created_at?: string;
  called_at?: string;
}

// Respuesta del servicio
interface QueueResponse {
  data: QueueEntry[];
  total: number;
}

// Estadísticas de la cola
interface QueueStats {
  waiting: number;
  completed: number;
  current: number;
  performing: number;
}
```

### DatabaseInterface (`database.interface.ts`)

```typescript
// Tipos completos de la base de datos Supabase
interface Database {
  public: {
    Tables: {
      queue: {
        Row: { /* schema de tabla */ };
        Insert: { /* schema para inserción */ };
        Update: { /* schema para actualización */ };
      };
    };
    Functions: {
      karaqr_call_next: { /* definición de función RPC */ };
    };
  };
}
```

### 3. Esquema de Base de Datos
```

```sql
CREATE TABLE queue (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  song VARCHAR NOT NULL,
  title_raw VARCHAR,
  youtube_url VARCHAR,
  youtube_link VARCHAR,
  status VARCHAR DEFAULT 'waiting' CHECK (status IN ('waiting', 'current', 'performing', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  called_at TIMESTAMP
);

-- Función RPC para llamar al siguiente
CREATE OR REPLACE FUNCTION karaqr_call_next()
RETURNS SETOF queue AS $$
BEGIN
  -- Marcar actual como completado
  UPDATE queue SET status = 'completed' WHERE status = 'current';
  
  -- Obtener y marcar el siguiente como actual
  UPDATE queue 
  SET status = 'current', called_at = NOW()
  WHERE id = (
    SELECT id FROM queue 
    WHERE status = 'waiting' 
    ORDER BY created_at 
    LIMIT 1
  );
  
  -- Retornar el registro actualizado
  RETURN QUERY SELECT * FROM queue WHERE status = 'current';
END;
$$ LANGUAGE plpgsql;
```

## API

### Propiedades Observables

```typescript
// Cola completa
queue$: Observable<QueueEntry[]>

// Entrada actual (current/performing)
currentEntry$: Observable<QueueEntry | null>

// Estado de carga
isLoading$: Observable<boolean>
```

### Métodos Principales

```typescript
// Listar todas las entradas
list(): Observable<QueueResponse>

// Agregar nueva entrada
add(entry: Omit<QueueEntry, 'id' | 'created_at'>): Observable<QueueEntry>

// Método de compatibilidad
addEntry(nameOrEntry: string | object, song?: string): Observable<QueueEntry>

// Actualizar estado
updateStatus(id: number, status: QueueEntry['status']): Observable<QueueEntry>

// Llamar al siguiente
callNext(): Observable<QueueEntry | null>

// Eliminar entrada
remove(id: number): Observable<boolean>

// Limpiar completadas
clearCompleted(): Observable<boolean>

// Estadísticas
getStats(): Observable<{waiting: number, completed: number, current: number, performing: number}>
```

### Métodos de Polling y Tiempo Real

```typescript
// Iniciar polling (compatible con tenantId)
startPolling(tenantIdOrInterval?: string | number, intervalMs?: number): Observable<QueueEntry[]>

// Detener polling
stopPolling(): void

// Subscripción tiempo real
subscribeRealtime(): void

// Desuscribir tiempo real
unsubscribeRealtime(): void
```

## Uso en Componentes

### JoinComponent (Agregar Entrada)

```typescript
const payload = {
  name: 'Juan Pérez',
  song: 'Bohemian Rhapsody',
  youtubeLink: 'https://youtube.com/watch?v=...'
};

this.queueService.addEntry(payload).subscribe(entry => {
  console.log('Entrada agregada:', entry);
});
```

### QueueComponent (Polling)

```typescript
ngOnInit() {
  this.queueService.startPolling(this.tenantId, 4000).subscribe(entries => {
    this.entries = entries;
  });
}

ngOnDestroy() {
  this.queueService.stopPolling();
}
```

### Manejo de Estados

```typescript
// Llamar al siguiente en la cola
callNext() {
  this.queueService.callNext().subscribe(nextEntry => {
    if (nextEntry) {
      console.log('Ahora cantando:', nextEntry.name);
    }
  });
}

// Marcar como completado
markCompleted(entryId: number) {
  this.queueService.updateStatus(entryId, 'completed').subscribe();
}
```

## Migración

Este servicio reemplaza implementaciones mock anteriores manteniendo total compatibilidad con:

- `JoinComponent.addEntry(payload)`
- `QueueComponent.startPolling(tenantId, interval)`
- Todas las interfaces `QueueEntry` existentes

## Beneficios

1. **Datos Persistentes**: Cola real en PostgreSQL
2. **Multiusuario**: Sincronización en tiempo real
3. **Escalable**: Backend gestionado por Supabase
4. **Confiable**: Manejo de errores y fallbacks
5. **Mantenible**: Código limpio con TypeScript