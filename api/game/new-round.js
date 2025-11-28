import { 
    getRoomByCode, 
    updateRoom,
    resetPlayersForNewRound,
    emitGameEvent
} from '../lib/supabase.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { roomCode, playerId } = req.body;
        
        if (!roomCode || !playerId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Datos incompletos' 
            });
        }
        
        // Buscar sala
        const room = await getRoomByCode(roomCode);
        
        if (!room) {
            return res.status(404).json({ 
                success: false, 
                error: 'Sala no encontrada' 
            });
        }
        
        // Verificar que es el host
        if (room.host_id !== playerId) {
            return res.status(403).json({ 
                success: false, 
                error: 'Solo el anfitrión puede iniciar una nueva ronda' 
            });
        }
        
        // Resetear sala
        await updateRoom(room.id, {
            game_state: 'lobby',
            current_word: null,
            current_hint: null,
            current_category: null,
            first_player_id: null,
            timer_end_time: null
        });
        
        // Resetear jugadores
        await resetPlayersForNewRound(room.id);
        
        // Emitir evento de vuelta al lobby
        await emitGameEvent(roomCode, 'back_to_lobby', {});
        
        return res.status(200).json({
            success: true
        });
        
    } catch (error) {
        console.error('Error starting new round:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al iniciar nueva ronda' 
        });
    }
}
