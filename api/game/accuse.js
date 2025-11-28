import { 
    getRoomByCode, 
    getPlayersByRoom,
    getPlayerById,
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
        const { roomCode, playerId, accusedId } = req.body;
        
        if (!roomCode || !playerId || !accusedId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Datos incompletos' 
            });
        }
        
        // Buscar sala
        const room = await getRoomByCode(roomCode);
        
        if (!room || room.game_state !== 'playing') {
            return res.status(400).json({ 
                success: false, 
                error: 'La partida no está en curso' 
            });
        }
        
        // Obtener jugadores
        const accuser = await getPlayerById(playerId);
        const accused = await getPlayerById(accusedId);
        
        if (!accuser || !accused) {
            return res.status(404).json({ 
                success: false, 
                error: 'Jugador no encontrado' 
            });
        }
        
        // Emitir evento de acusación
        await emitGameEvent(roomCode, 'player_accused', {
            accuserName: accuser.name,
            accusedName: accused.name,
            accusedId: accusedId
        });
        
        return res.status(200).json({
            success: true
        });
        
    } catch (error) {
        console.error('Error accusing player:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al acusar jugador' 
        });
    }
}
