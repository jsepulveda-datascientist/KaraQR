# Módulos del Cantante (Singer)

Esta carpeta contiene todos los módulos y funcionalidades específicas para los cantantes en KaraQR.

## Estructura de Módulos

### 🏠 Dashboard (`/singer/dashboard`)
**Propósito**: Panel principal del cantante con resumen de actividad
**Funcionalidades**:
- Vista general de canciones en cola
- Estadísticas personales (canciones cantadas, tiempo promedio)
- Accesos rápidos a funciones principales
- Notificaciones sobre turnos próximos

### 🎵 Mi Cola (`/singer/queue`)
**Propósito**: Gestión de las canciones del cantante en la cola
**Funcionalidades**:
- Ver canciones pendientes del cantante
- Editar/cancelar canciones en espera
- Cambiar orden de prioridad (si permitido)
- Ver posición estimada en cola
- Agregar nuevas canciones

### 📚 Mi Historial (`/singer/history`)
**Propósito**: Historial personal de canciones cantadas
**Funcionalidades**:
- Lista de canciones cantadas previamente
- Fechas y horarios de presentaciones
- Ratings/puntuaciones recibidas
- Estadísticas de géneros favoritos
- Opción de repetir canciones favoritas

### 👤 Mi Perfil (`/singer/profile`)
**Propósito**: Gestión del perfil personal del cantante
**Funcionalidades**:
- Información personal (nombre, avatar)
- Preferencias de karaoke
- Géneros musicales favoritos
- Configuración de notificaciones
- Historial de participación

## Rutas Disponibles

```typescript
/singer/dashboard  → Dashboard principal
/singer/queue      → Gestión de cola personal
/singer/history    → Historial de canciones
/singer/profile    → Perfil del cantante
```

## Próximos Desarrollos

- **Reacciones**: Sistema de reacciones a presentaciones
- **Social**: Seguir a otros cantantes, dar "likes"
- **Challenges**: Desafíos musicales entre cantantes
- **Favorites**: Lista de canciones favoritas guardadas
- **Requests**: Solicitudes de duetos o colaboraciones