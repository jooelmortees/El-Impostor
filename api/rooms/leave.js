import { 
    getRoomByCode, 
    updateRoom,
    updatePlayer,
    getPlayersByRoom,
    getPlayerById,
    deletePlayer,
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
        
        // Obtener jugador que se desconecta
        const player = await getPlayerById(playerId);
        
        if (!player) {
            return res.status(404).json({ 
                success: false, 
                error: 'Jugador no encontrado' 
            });
        }
        
        const playerName = player.name;
        const wasHost = player.is_host;
        
        // Marcar como desconectado
        await updatePlayer(playerId, { is_connected: false });
        
        // Emitir evento de desconexión
        await emitGameEvent(roomCode, 'player_disconnected', { playerName });
        
        // Si era el host, transferir
        if (wasHost) {
            const remainingPlayers = await getPlayersByRoom(room.id);
            
            if (remainingPlayers.length > 0) {
                // Transferir host al primer jugador restante
                const newHost = remainingPlayers[0];
                await updatePlayer(newHost.id, { is_host: true });
                await updateRoom(room.id, { host_id: newHost.id });
                
                await emitGameEvent(roomCode, 'host_changed', {
                    newHostId: newHost.id,
                    newHostName: newHost.name
                });
            }
            // Si no quedan jugadores, la sala se limpiará automáticamente
        }
        
        return res.status(200).json({
            success: true
        });
        
    } catch (error) {
        console.error('Error handling leave:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al salir de la sala' 
        });
    }
}
