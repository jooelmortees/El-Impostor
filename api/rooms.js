import { 
    createRoom, 
    getRoomByCode, 
    createPlayer, 
    isNameTakenInRoom,
    getPlayersByRoom,
    updateRoom,
    updatePlayer,
    getPlayerById,
    deletePlayer,
    emitGameEvent,
    supabase
} from './lib/supabase.js';
import { generateRoomCode, getCategories } from './lib/game-data.js';

// CORS helper
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Handlers para cada acción
async function handleCreate(req, res) {
    const { playerName } = req.body;
    
    if (!playerName || playerName.trim().length < 2) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nombre inválido (mínimo 2 caracteres)' 
        });
    }
    
    const name = playerName.trim().substring(0, 15);
    
    let code;
    let existingRoom;
    let attempts = 0;
    
    do {
        code = generateRoomCode();
        existingRoom = await getRoomByCode(code);
        attempts++;
    } while (existingRoom && attempts < 10);
    
    if (existingRoom) {
        return res.status(500).json({ 
            success: false, 
            error: 'No se pudo generar un código único' 
        });
    }
    
    const gameMode = req.body.gameMode || 'online';
    const tempHostId = '00000000-0000-0000-0000-000000000000';
    const room = await createRoom(code, tempHostId, {
        impostorCount: 1,
        hintMode: false,
        selectedCategories: ['animales', 'profesiones', 'lugares'],
        gameMode: gameMode
    });
    
    const player = await createPlayer(room.id, name, true);
    
    await supabase
        .from('rooms')
        .update({ host_id: player.id })
        .eq('id', room.id);
    
    return res.status(200).json({
        success: true,
        roomCode: code,
        roomId: room.id,
        playerId: player.id,
        isHost: true,
        categories: getCategories(),
        gameMode: gameMode
    });
}

async function handleJoin(req, res) {
    const { roomCode, playerName } = req.body;
    
    if (!playerName || playerName.trim().length < 2) {
        return res.status(400).json({ 
            success: false, 
            error: 'Nombre inválido (mínimo 2 caracteres)' 
        });
    }
    
    if (!roomCode || roomCode.trim().length !== 4) {
        return res.status(400).json({ 
            success: false, 
            error: 'Código de sala inválido' 
        });
    }
    
    const code = roomCode.trim().toUpperCase();
    const name = playerName.trim().substring(0, 15);
    
    const room = await getRoomByCode(code);
    
    if (!room) {
        return res.status(404).json({ 
            success: false, 
            error: 'Sala no encontrada' 
        });
    }
    
    if (room.game_state !== 'lobby') {
        return res.status(400).json({ 
            success: false, 
            error: 'La partida ya ha comenzado' 
        });
    }
    
    const nameTaken = await isNameTakenInRoom(room.id, name);
    if (nameTaken) {
        return res.status(400).json({ 
            success: false, 
            error: 'Ese nombre ya está en uso en esta sala' 
        });
    }
    
    const player = await createPlayer(room.id, name, false);
    
    return res.status(200).json({
        success: true,
        roomCode: code,
        roomId: room.id,
        playerId: player.id,
        isHost: false,
        categories: getCategories(),
        gameMode: room.settings?.gameMode || 'online'
    });
}

async function handlePlayers(req, res) {
    const { roomCode } = req.query;
    
    if (!roomCode) {
        return res.status(400).json({ 
            success: false, 
            error: 'Código de sala requerido' 
        });
    }
    
    const room = await getRoomByCode(roomCode);
    
    if (!room) {
        return res.status(404).json({ 
            success: false, 
            error: 'Sala no encontrada' 
        });
    }
    
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
}

async function handleAddLocalPlayer(req, res) {
    const { roomId, playerName } = req.body;
    
    if (!roomId || !playerName || playerName.trim().length < 2) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos inválidos' 
        });
    }
    
    const name = playerName.trim().substring(0, 15);
    
    const nameTaken = await isNameTakenInRoom(roomId, name);
    if (nameTaken) {
        return res.status(400).json({ 
            success: false, 
            error: 'Ese nombre ya está en uso' 
        });
    }
    
    const player = await createPlayer(roomId, name, false);
    
    return res.status(200).json({
        success: true,
        playerId: player.id,
        playerName: name
    });
}

async function handleRemovePlayer(req, res) {
    const { roomId, playerId } = req.body;
    
    if (!roomId || !playerId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos inválidos' 
        });
    }
    
    const player = await getPlayerById(playerId);
    
    if (!player || player.room_id !== roomId) {
        return res.status(404).json({ 
            success: false, 
            error: 'Jugador no encontrado' 
        });
    }
    
    if (player.is_host) {
        return res.status(400).json({ 
            success: false, 
            error: 'No puedes eliminar al anfitrión' 
        });
    }
    
    await deletePlayer(playerId);
    
    return res.status(200).json({
        success: true
    });
}

async function handleSettings(req, res) {
    const { roomCode, playerId, settings } = req.body;
    
    if (!roomCode || !playerId || !settings) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos incompletos' 
        });
    }
    
    const room = await getRoomByCode(roomCode);
    
    if (!room) {
        return res.status(404).json({ 
            success: false, 
            error: 'Sala no encontrada' 
        });
    }
    
    if (room.host_id !== playerId) {
        return res.status(403).json({ 
            success: false, 
            error: 'Solo el anfitrión puede cambiar la configuración' 
        });
    }
    
    const currentSettings = room.settings || {};
    const newSettings = {
        ...currentSettings,
        impostorCount: Math.max(1, Math.min(5, settings.impostorCount || 1)),
        hintMode: Boolean(settings.hintMode),
        selectedCategories: Array.isArray(settings.selectedCategories) && settings.selectedCategories.length > 0
            ? settings.selectedCategories
            : ['animales']
    };
    
    await updateRoom(room.id, { settings: newSettings });
    await emitGameEvent(roomCode, 'settings_update', newSettings);
    
    return res.status(200).json({
        success: true,
        settings: newSettings
    });
}

async function handleHeartbeat(req, res) {
    const { playerId } = req.body;
    
    if (!playerId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Player ID requerido' 
        });
    }
    
    try {
        await updatePlayer(playerId, {});
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(200).json({ success: true });
    }
}

async function handleLeave(req, res) {
    const { roomCode, playerId } = req.body;
    
    if (!roomCode || !playerId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos incompletos' 
        });
    }
    
    const room = await getRoomByCode(roomCode);
    
    if (!room) {
        return res.status(404).json({ 
            success: false, 
            error: 'Sala no encontrada' 
        });
    }
    
    const player = await getPlayerById(playerId);
    
    if (!player) {
        return res.status(404).json({ 
            success: false, 
            error: 'Jugador no encontrado' 
        });
    }
    
    const playerName = player.name;
    const wasHost = player.is_host;
    
    await updatePlayer(playerId, { is_connected: false });
    await emitGameEvent(roomCode, 'player_disconnected', { playerName });
    
    if (wasHost) {
        const remainingPlayers = await getPlayersByRoom(room.id);
        
        if (remainingPlayers.length > 0) {
            const newHost = remainingPlayers[0];
            await updatePlayer(newHost.id, { is_host: true });
            await updateRoom(room.id, { host_id: newHost.id });
            
            await emitGameEvent(roomCode, 'host_changed', {
                newHostId: newHost.id,
                newHostName: newHost.name
            });
        }
    }
    
    return res.status(200).json({ success: true });
}

// Main handler con routing
export default async function handler(req, res) {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Obtener la acción del query param
        const { action } = req.query;
        
        switch (action) {
            case 'create':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await handleCreate(req, res);
                
            case 'join':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await handleJoin(req, res);
                
            case 'players':
                if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
                return await handlePlayers(req, res);
                
            case 'settings':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await handleSettings(req, res);
                
            case 'heartbeat':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await handleHeartbeat(req, res);
                
            case 'leave':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await handleLeave(req, res);
            
            case 'addLocalPlayer':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await handleAddLocalPlayer(req, res);
            
            case 'removePlayer':
                if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
                return await handleRemovePlayer(req, res);
                
            default:
                return res.status(400).json({ 
                    success: false, 
                    error: 'Acción no válida' 
                });
        }
    } catch (error) {
        console.error('Error in rooms handler:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
}
