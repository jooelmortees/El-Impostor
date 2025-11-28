import { 
    getRoomByCode, 
    updateRoom,
    getPlayersByRoom,
    updatePlayer,
    emitGameEvent
} from '../lib/supabase.js';
import { selectRandomWord } from '../lib/game-data.js';

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
                error: 'Solo el anfitrión puede iniciar la partida' 
            });
        }
        
        // Obtener jugadores conectados
        const players = await getPlayersByRoom(room.id);
        
        if (players.length < 3) {
            return res.status(400).json({ 
                success: false, 
                error: 'Se necesitan al menos 3 jugadores' 
            });
        }
        
        // Seleccionar palabra y categoría
        const settings = room.settings || { selectedCategories: ['animales'], impostorCount: 1, hintMode: false };
        const { word, hint, categoryName } = selectRandomWord(settings.selectedCategories);
        
        // Asignar roles
        const impostorCount = Math.min(settings.impostorCount || 1, Math.floor(players.length / 3));
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        
        // Actualizar roles de jugadores
        for (let i = 0; i < shuffledPlayers.length; i++) {
            const role = i < impostorCount ? 'impostor' : 'citizen';
            await updatePlayer(shuffledPlayers[i].id, { 
                role, 
                is_ready: false 
            });
        }
        
        // Actualizar sala
        await updateRoom(room.id, {
            game_state: 'revealing',
            current_word: word,
            current_hint: hint,
            current_category: categoryName,
            first_player_id: null
        });
        
        // Emitir evento de inicio de juego con los roles
        const rolesData = {};
        for (let i = 0; i < shuffledPlayers.length; i++) {
            const role = i < impostorCount ? 'impostor' : 'citizen';
            rolesData[shuffledPlayers[i].id] = {
                role,
                word: role === 'citizen' ? word : null,
                hint: role === 'impostor' && settings.hintMode ? hint : null,
                category: categoryName
            };
        }
        
        await emitGameEvent(roomCode, 'game_started', {
            roles: rolesData,
            totalPlayers: players.length,
            category: categoryName
        });
        
        return res.status(200).json({
            success: true,
            message: 'Partida iniciada'
        });
        
    } catch (error) {
        console.error('Error starting game:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al iniciar la partida' 
        });
    }
}
