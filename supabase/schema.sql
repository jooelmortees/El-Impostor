-- ============================================
-- EL IMPOSTOR - Esquema de Base de Datos Supabase
-- ============================================
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Habilitar la extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: rooms (Salas de juego)
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(4) UNIQUE NOT NULL,
    host_id UUID NOT NULL,
    game_state VARCHAR(20) DEFAULT 'lobby' CHECK (game_state IN ('lobby', 'revealing', 'playing', 'results')),
    current_word VARCHAR(100),
    current_hint VARCHAR(200),
    current_category VARCHAR(100),
    first_player_id UUID,
    timer_end_time BIGINT,
    round_duration INTEGER DEFAULT 300,
    settings JSONB DEFAULT '{"impostorCount": 1, "hintMode": false, "selectedCategories": ["animales", "profesiones", "lugares"]}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: players (Jugadores)
-- ============================================
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(15) NOT NULL,
    is_host BOOLEAN DEFAULT FALSE,
    role VARCHAR(10) CHECK (role IN ('citizen', 'impostor', NULL)),
    is_ready BOOLEAN DEFAULT FALSE,
    is_connected BOOLEAN DEFAULT TRUE,
    is_eliminated BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: game_events (Eventos del juego para Realtime)
-- ============================================
CREATE TABLE IF NOT EXISTS game_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_code VARCHAR(4) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_events_room_code ON game_events(room_code);
CREATE INDEX IF NOT EXISTS idx_game_events_created_at ON game_events(created_at);

-- ============================================
-- FUNCIÓN: Limpiar eventos antiguos (más de 1 hora)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void AS $$
BEGIN
    DELETE FROM game_events WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Limpiar salas inactivas (más de 2 horas)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
    DELETE FROM rooms WHERE updated_at < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para rooms
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Políticas para rooms (acceso público para el juego)
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON rooms;
CREATE POLICY "Rooms are viewable by everyone" ON rooms
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Rooms are insertable by everyone" ON rooms;
CREATE POLICY "Rooms are insertable by everyone" ON rooms
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Rooms are updatable by everyone" ON rooms;
CREATE POLICY "Rooms are updatable by everyone" ON rooms
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Rooms are deletable by everyone" ON rooms;
CREATE POLICY "Rooms are deletable by everyone" ON rooms
    FOR DELETE USING (true);

-- Políticas para players
DROP POLICY IF EXISTS "Players are viewable by everyone" ON players;
CREATE POLICY "Players are viewable by everyone" ON players
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players are insertable by everyone" ON players;
CREATE POLICY "Players are insertable by everyone" ON players
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Players are updatable by everyone" ON players;
CREATE POLICY "Players are updatable by everyone" ON players
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Players are deletable by everyone" ON players;
CREATE POLICY "Players are deletable by everyone" ON players
    FOR DELETE USING (true);

-- Políticas para game_events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON game_events;
CREATE POLICY "Events are viewable by everyone" ON game_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Events are insertable by everyone" ON game_events;
CREATE POLICY "Events are insertable by everyone" ON game_events
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Events are deletable by everyone" ON game_events;
CREATE POLICY "Events are deletable by everyone" ON game_events
    FOR DELETE USING (true);

-- ============================================
-- HABILITAR REALTIME
-- ============================================
-- Ejecutar en Supabase Dashboard > Database > Replication
-- O usar estos comandos:

ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_events;

-- ============================================
-- MIGRACIÓN: Agregar columna is_eliminated (si no existe)
-- ============================================
-- Ejecutar esto si ya tienes la base de datos creada:
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_eliminated BOOLEAN DEFAULT FALSE;
