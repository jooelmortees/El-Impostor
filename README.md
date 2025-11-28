# El Impostor 🎭

Juego de deducción social multijugador en tiempo real, estilo "Spyfall" o "Among Us".

## Arquitectura

- **Frontend:** HTML5 + Tailwind CSS + Vanilla JS
- **Backend:** Vercel Serverless Functions
- **Base de datos:** Supabase (PostgreSQL + Realtime)
- **Hosting:** Vercel

## Estructura del Proyecto

```
El Impostor/
├── api/
│   ├── lib/
│   │   ├── game-data.js      # Palabras y categorías
│   │   └── supabase.js       # Cliente y funciones de BD
│   ├── game/
│   │   ├── start.js          # Iniciar partida
│   │   ├── ready.js          # Marcar jugador listo
│   │   ├── accuse.js         # Acusar jugador
│   │   ├── results.js        # Revelar resultados
│   │   └── new-round.js      # Nueva ronda
│   └── rooms/
│       ├── create.js         # Crear sala
│       ├── join.js           # Unirse a sala
│       ├── players.js        # Obtener jugadores
│       ├── settings.js       # Actualizar configuración
│       ├── heartbeat.js      # Mantener conexión viva
│       └── leave.js          # Salir de sala
├── public/
│   └── index.html            # Frontend completo
├── supabase/
│   └── schema.sql            # Esquema de base de datos
├── package.json
├── vercel.json
└── README.md
```

## Configuración

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. Ve a **Settings > API** y copia:
   - Project URL (`SUPABASE_URL`)
   - Service Role Key (`SUPABASE_SERVICE_KEY`)
   - Anon Key (para el frontend)

### 2. Habilitar Realtime

En Supabase Dashboard:
1. Ve a **Database > Replication**
2. Habilita Realtime para las tablas:
   - `rooms`
   - `players`
   - `game_events`

### 3. Configurar variables de entorno en Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Agregar secretos
vercel secrets add supabase-url "https://tu-proyecto.supabase.co"
vercel secrets add supabase-service-key "tu-service-role-key"
```

### 4. Actualizar el Frontend

En `public/index.html`, reemplaza estas líneas con tus valores de Supabase:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key';
```

### 5. Desplegar

```bash
# Desarrollo local
vercel dev

# Desplegar a producción
vercel --prod
```

## Flujo del Juego

1. **Pantalla de Inicio** - Crear o unirse a partida
2. **Lobby** - Configurar partida y esperar jugadores
3. **Revelación** - Ver rol secreto (Ciudadano/Impostor)
4. **Juego** - Describir palabras y encontrar al impostor
5. **Resultados** - Ver quién era el impostor

## Características

- ✅ Salas con códigos de 4 letras
- ✅ 3-20 jugadores por sala
- ✅ 1-3 impostores configurables
- ✅ 7 categorías con 10 palabras cada una
- ✅ Modo pista para impostores
- ✅ Timer sincronizado
- ✅ Comunicación en tiempo real
- ✅ Transferencia automática de host
- ✅ Diseño mobile-first

## Categorías de Palabras

- 🐾 Animales
- 👔 Profesiones
- 🗺️ Lugares
- 🎬 Películas/Series
- 🍕 Comida
- ⚽ Deportes
- 💻 Tecnología

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/rooms/create` | Crear nueva sala |
| POST | `/api/rooms/join` | Unirse a sala |
| GET | `/api/rooms/players` | Obtener jugadores |
| POST | `/api/rooms/settings` | Actualizar configuración |
| POST | `/api/rooms/heartbeat` | Mantener conexión |
| POST | `/api/rooms/leave` | Salir de sala |
| POST | `/api/game/start` | Iniciar partida |
| POST | `/api/game/ready` | Marcar como listo |
| POST | `/api/game/accuse` | Acusar jugador |
| POST | `/api/game/results` | Revelar resultados |
| POST | `/api/game/new-round` | Nueva ronda |

## Licencia

MIT
