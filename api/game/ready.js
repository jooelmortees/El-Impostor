import { 
    getRoomByCode, 
    updateRoom,
    getPlayersByRoom,
    updatePlayer,
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
        
        if (room.game_state !== 'revealing') {
            return res.status(400).json({ 
                success: false, 
                error: 'La partida no está en fase de revelación' 
            });
        }
        
        // Marcar jugador como listo
        await updatePlayer(playerId, { is_ready: true });
        
        // Obtener todos los jugadores para verificar si todos están listos
        const players = await getPlayersByRoom(room.id);
        const readyCount = players.filter(p => p.is_ready).length;
        const totalCount = players.length;
        
        // Emitir evento de progreso
        await emitGameEvent(roomCode, 'ready_progress', {
            ready: readyCount,
            total: totalCount
        });
        
        // Si todos están listos, iniciar la ronda
        if (readyCount >= totalCount) {
            // Seleccionar primer jugador (preferiblemente ciudadano)
            const citizens = players.filter(p => p.role === 'citizen');
            const pool = citizens.length > 0 ? citizens : players;
            const firstPlayer = pool[Math.floor(Math.random() * pool.length)];
            
            // Calcular tiempo de fin
            const roundDuration = room.round_duration || 300;
            const timerEndTime = Date.now() + (roundDuration * 1000);
            
            // Actualizar sala
            await updateRoom(room.id, {
                game_state: 'playing',
                first_player_id: firstPlayer.id,
                timer_end_time: timerEndTime
            });
            
            // Emitir evento de inicio de ronda
            await emitGameEvent(roomCode, 'round_start', {
                firstPlayerName: firstPlayer.name,
                firstPlayerId: firstPlayer.id,
                timerEndTime,
                duration: roundDuration
            });
        }
        
        return res.status(200).json({
            success: true,
            ready: readyCount,
            total: totalCount,
            allReady: readyCount >= totalCount
        });
        
    } catch (error) {
        console.error('Error marking player ready:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al marcar como listo' 
        });
    }
}
