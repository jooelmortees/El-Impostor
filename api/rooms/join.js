import { 
    getRoomByCode, 
    createPlayer, 
    isNameTakenInRoom 
} from '../lib/supabase.js';
import { getCategories } from '../lib/game-data.js';

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
        const { roomCode, playerName } = req.body;
        
        // Validar nombre
        if (!playerName || playerName.trim().length < 2) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre inválido (mínimo 2 caracteres)' 
            });
        }
        
        // Validar código
        if (!roomCode || roomCode.trim().length !== 4) {
            return res.status(400).json({ 
                success: false, 
                error: 'Código de sala inválido' 
            });
        }
        
        const code = roomCode.trim().toUpperCase();
        const name = playerName.trim().substring(0, 15);
        
        // Buscar sala
        const room = await getRoomByCode(code);
        
        if (!room) {
            return res.status(404).json({ 
                success: false, 
                error: 'Sala no encontrada' 
            });
        }
        
        // Verificar estado del juego
        if (room.game_state !== 'lobby') {
            return res.status(400).json({ 
                success: false, 
                error: 'La partida ya ha comenzado' 
            });
        }
        
        // Verificar nombre duplicado
        const nameTaken = await isNameTakenInRoom(room.id, name);
        if (nameTaken) {
            return res.status(400).json({ 
                success: false, 
                error: 'Ese nombre ya está en uso en esta sala' 
            });
        }
        
        // Crear jugador
        const player = await createPlayer(room.id, name, false);
        
        return res.status(200).json({
            success: true,
            roomCode: code,
            roomId: room.id,
            playerId: player.id,
            isHost: false,
            categories: getCategories()
        });
        
    } catch (error) {
        console.error('Error joining room:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al unirse a la sala' 
        });
    }
}
