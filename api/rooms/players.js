import { 
    getPlayersByRoom,
    getRoomByCode
} from '../lib/supabase.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { roomCode } = req.query;
        
        if (!roomCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Código de sala requerido' 
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
        
        // Obtener jugadores
        const players = await getPlayersByRoom(room.id);
        
        const playersList = players.map(p => ({
            id: p.id,
            name: p.name,
            isHost: p.is_host,
            isReady: p.is_ready
        }));
        
        return res.status(200).json({
            success: true,
            players: playersList,
            settings: room.settings,
            gameState: room.game_state
        });
        
    } catch (error) {
        console.error('Error getting players:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al obtener jugadores' 
        });
    }
}
