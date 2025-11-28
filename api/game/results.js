import { 
    getRoomByCode, 
    updateRoom,
    getPlayersByRoom,
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
                error: 'Solo el anfitrión puede revelar resultados' 
            });
        }
        
        // Actualizar estado de la sala
        await updateRoom(room.id, { game_state: 'results' });
        
        // Obtener jugadores con sus roles
        const players = await getPlayersByRoom(room.id);
        
        const results = players.map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            isHost: p.is_host
        }));
        
        // Emitir evento de resultados
        await emitGameEvent(roomCode, 'game_results', {
            word: room.current_word,
            category: room.current_category,
            players: results
        });
        
        return res.status(200).json({
            success: true,
            word: room.current_word,
            category: room.current_category,
            players: results
        });
        
    } catch (error) {
        console.error('Error revealing results:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al revelar resultados' 
        });
    }
}
