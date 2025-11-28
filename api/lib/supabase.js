import { createClient } from '@supabase/supabase-js';

// Crear cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// ============================================
// FUNCIONES DE SALA
// ============================================

export async function createRoom(code, hostId, settings) {
    const { data, error } = await supabase
        .from('rooms')
        .insert({
            code,
            host_id: hostId,
            settings
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function getRoomByCode(code) {
    const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function updateRoom(roomId, updates) {
    const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function deleteRoom(roomId) {
    const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
    
    if (error) throw error;
}

// ============================================
// FUNCIONES DE JUGADOR
// ============================================

export async function createPlayer(roomId, name, isHost = false) {
    const { data, error } = await supabase
        .from('players')
        .insert({
            room_id: roomId,
            name,
            is_host: isHost
        })
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function getPlayerById(playerId) {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

export async function getPlayersByRoom(roomId) {
    const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_connected', true)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
}

export async function updatePlayer(playerId, updates) {
    const { data, error } = await supabase
        .from('players')
        .update({ ...updates, last_seen: new Date().toISOString() })
        .eq('id', playerId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
}

export async function deletePlayer(playerId) {
    const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);
    
    if (error) throw error;
}

export async function isNameTakenInRoom(roomId, name, excludePlayerId = null) {
    let query = supabase
        .from('players')
        .select('id')
        .eq('room_id', roomId)
        .eq('is_connected', true)
        .ilike('name', name);
    
    if (excludePlayerId) {
        query = query.neq('id', excludePlayerId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data && data.length > 0;
}

export async function resetPlayersForNewRound(roomId) {
    const { error } = await supabase
        .from('players')
        .update({ role: null, is_ready: false })
        .eq('room_id', roomId);
    
    if (error) throw error;
}

// ============================================
// FUNCIONES DE EVENTOS (Realtime)
// ============================================

export async function emitGameEvent(roomCode, eventType, payload = {}) {
    const { error } = await supabase
        .from('game_events')
        .insert({
            room_code: roomCode.toUpperCase(),
            event_type: eventType,
            payload
        });
    
    if (error) throw error;
}

export async function cleanupOldEvents() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { error } = await supabase
        .from('game_events')
        .delete()
        .lt('created_at', oneHourAgo);
    
    if (error) console.error('Error cleaning up events:', error);
}
