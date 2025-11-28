import { 
    getRoomByCode, 
    updateRoom,
    getPlayersByRoom,
    getPlayerById,
    updatePlayer,
    resetPlayersForNewRound,
    emitGameEvent
} from './lib/supabase.js';
import { selectRandomWord } from './lib/game-data.js';

// CORS helper
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Handlers para cada acción
async function handleStart(req, res) {
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
    
    if (room.host_id !== playerId) {
        return res.status(403).json({ 
            success: false, 
            error: 'Solo el anfitrión puede iniciar la partida' 
        });
    }
    
    const players = await getPlayersByRoom(room.id);
    
    if (players.length < 3) {
        return res.status(400).json({ 
            success: false, 
            error: 'Se necesitan al menos 3 jugadores' 
        });
    }
    
    const settings = room.settings || { selectedCategories: ['animales'], impostorCount: 1, hintMode: false };
    const { word, hint, categoryName } = selectRandomWord(settings.selectedCategories);
    
    const impostorCount = Math.min(settings.impostorCount || 1, Math.floor(players.length / 3));
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledPlayers.length; i++) {
        const role = i < impostorCount ? 'impostor' : 'citizen';
        await updatePlayer(shuffledPlayers[i].id, { 
            role, 
            is_ready: false 
        });
    }
    
    await updateRoom(room.id, {
        game_state: 'revealing',
        current_word: word,
        current_hint: hint,
        current_category: categoryName,
        first_player_id: null
    });
    
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
}

async function handleReady(req, res) {
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
    
    if (room.game_state !== 'revealing') {
        return res.status(400).json({ 
            success: false, 
            error: 'La partida no está en fase de revelación' 
        });
    }
    
    await updatePlayer(playerId, { is_ready: true });
    
    const players = await getPlayersByRoom(room.id);
    const readyCount = players.filter(p => p.is_ready).length;
    const totalCount = players.length;
    
    await emitGameEvent(roomCode, 'ready_progress', {
        ready: readyCount,
        total: totalCount
    });
    
    if (readyCount >= totalCount) {
        const citizens = players.filter(p => p.role === 'citizen');
        const pool = citizens.length > 0 ? citizens : players;
        const firstPlayer = pool[Math.floor(Math.random() * pool.length)];
        
        const roundDuration = room.round_duration || 300;
        const timerEndTime = Date.now() + (roundDuration * 1000);
        
        await updateRoom(room.id, {
            game_state: 'playing',
            first_player_id: firstPlayer.id,
            timer_end_time: timerEndTime
        });
        
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
}

// Estado de votaciones activas en memoria (se resetea si la función se reinicia)
const activeVotings = new Map();

async function handleStartVote(req, res) {
    const { roomCode, playerId, accusedId } = req.body;
    
    if (!roomCode || !playerId || !accusedId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos incompletos' 
        });
    }
    
    const room = await getRoomByCode(roomCode);
    
    if (!room || room.game_state !== 'playing') {
        return res.status(400).json({ 
            success: false, 
            error: 'La partida no está en curso' 
        });
    }
    
    // Verificar si ya hay una votación activa
    if (activeVotings.has(roomCode)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Ya hay una votación en curso' 
        });
    }
    
    const accuser = await getPlayerById(playerId);
    const accused = await getPlayerById(accusedId);
    const players = await getPlayersByRoom(room.id);
    
    if (!accuser || !accused) {
        return res.status(404).json({ 
            success: false, 
            error: 'Jugador no encontrado' 
        });
    }
    
    // Verificar que no esté eliminado
    if (accused.is_eliminated) {
        return res.status(400).json({ 
            success: false, 
            error: 'Este jugador ya fue eliminado' 
        });
    }
    
    // Crear votación
    const votingData = {
        accusedId: accusedId,
        accusedName: accused.name,
        accuserName: accuser.name,
        votes: {}, // playerId -> vote ('guilty', 'innocent', 'null')
        totalVoters: players.filter(p => !p.is_eliminated).length,
        startTime: Date.now()
    };
    
    activeVotings.set(roomCode, votingData);
    
    // Emitir evento de inicio de votación
    await emitGameEvent(roomCode, 'voting_started', {
        accusedId: accusedId,
        accusedName: accused.name,
        accuserName: accuser.name,
        totalVoters: votingData.totalVoters
    });
    
    return res.status(200).json({ success: true });
}

async function handleCastVote(req, res) {
    const { roomCode, playerId, vote } = req.body;
    
    if (!roomCode || !playerId || !vote) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos incompletos' 
        });
    }
    
    if (!['guilty', 'innocent', 'null'].includes(vote)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Voto no válido' 
        });
    }
    
    const votingData = activeVotings.get(roomCode);
    
    if (!votingData) {
        return res.status(400).json({ 
            success: false, 
            error: 'No hay votación activa' 
        });
    }
    
    // Verificar que no haya votado ya
    if (votingData.votes[playerId]) {
        return res.status(400).json({ 
            success: false, 
            error: 'Ya has votado' 
        });
    }
    
    const player = await getPlayerById(playerId);
    if (!player || player.is_eliminated) {
        return res.status(403).json({ 
            success: false, 
            error: 'No puedes votar' 
        });
    }
    
    // Registrar voto
    votingData.votes[playerId] = vote;
    
    const voteCount = Object.keys(votingData.votes).length;
    
    // Emitir progreso de votación
    await emitGameEvent(roomCode, 'vote_progress', {
        votesCount: voteCount,
        totalVoters: votingData.totalVoters
    });
    
    // Si todos han votado, calcular resultado
    if (voteCount >= votingData.totalVoters) {
        await resolveVoting(roomCode, votingData);
    }
    
    return res.status(200).json({ 
        success: true,
        votesCount: voteCount,
        totalVoters: votingData.totalVoters
    });
}

async function resolveVoting(roomCode, votingData) {
    const room = await getRoomByCode(roomCode);
    if (!room) return;
    
    // Contar votos (los nulos no cuentan)
    let guiltyVotes = 0;
    let innocentVotes = 0;
    let nullVotes = 0;
    
    Object.values(votingData.votes).forEach(vote => {
        if (vote === 'guilty') guiltyVotes++;
        else if (vote === 'innocent') innocentVotes++;
        else nullVotes++;
    });
    
    const validVotes = guiltyVotes + innocentVotes;
    const majorityNeeded = Math.floor(validVotes / 2) + 1;
    const isEliminated = guiltyVotes >= majorityNeeded;
    
    let eliminatedPlayer = null;
    let gameOver = false;
    let impostorsWin = false;
    
    if (isEliminated) {
        // Eliminar al jugador acusado
        await updatePlayer(votingData.accusedId, { is_eliminated: true });
        eliminatedPlayer = await getPlayerById(votingData.accusedId);
        
        // Verificar condición de victoria
        const players = await getPlayersByRoom(room.id);
        const alivePlayers = players.filter(p => !p.is_eliminated);
        const aliveImpostors = alivePlayers.filter(p => p.role === 'impostor');
        const aliveCitizens = alivePlayers.filter(p => p.role === 'citizen');
        
        if (aliveImpostors.length === 0) {
            // Ciudadanos ganan
            gameOver = true;
            impostorsWin = false;
        } else if (aliveImpostors.length >= aliveCitizens.length) {
            // Impostores ganan
            gameOver = true;
            impostorsWin = true;
        }
    }
    
    // Limpiar votación
    activeVotings.delete(roomCode);
    
    // Emitir resultado de votación
    await emitGameEvent(roomCode, 'voting_result', {
        accusedId: votingData.accusedId,
        accusedName: votingData.accusedName,
        guiltyVotes,
        innocentVotes,
        nullVotes,
        majorityNeeded,
        isEliminated,
        eliminatedRole: eliminatedPlayer?.role || null,
        gameOver,
        impostorsWin
    });
    
    // Si el juego termina, actualizar estado y mostrar resultados
    if (gameOver) {
        await updateRoom(room.id, { game_state: 'results' });
        
        const players = await getPlayersByRoom(room.id);
        const results = players.map(p => ({
            id: p.id,
            name: p.name,
            role: p.role,
            isHost: p.is_host,
            isEliminated: p.is_eliminated
        }));
        
        setTimeout(async () => {
            await emitGameEvent(roomCode, 'game_results', {
                word: room.current_word,
                category: room.current_category,
                players: results,
                impostorsWin
            });
        }, 3000);
    }
}

async function handleCancelVote(req, res) {
    const { roomCode, playerId } = req.body;
    
    if (!roomCode || !playerId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos incompletos' 
        });
    }
    
    const room = await getRoomByCode(roomCode);
    if (!room || room.host_id !== playerId) {
        return res.status(403).json({ 
            success: false, 
            error: 'Solo el anfitrión puede cancelar la votación' 
        });
    }
    
    activeVotings.delete(roomCode);
    
    await emitGameEvent(roomCode, 'voting_cancelled', {});
    
    return res.status(200).json({ success: true });
}

async function handleResults(req, res) {
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
    
    if (room.host_id !== playerId) {
        return res.status(403).json({ 
            success: false, 
            error: 'Solo el anfitrión puede revelar resultados' 
        });
    }
    
    await updateRoom(room.id, { game_state: 'results' });
    
    const players = await getPlayersByRoom(room.id);
    
    const results = players.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        isHost: p.is_host
    }));
    
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
}

async function handleNewRound(req, res) {
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
    
    if (room.host_id !== playerId) {
        return res.status(403).json({ 
            success: false, 
            error: 'Solo el anfitrión puede iniciar una nueva ronda' 
        });
    }
    
    await updateRoom(room.id, {
        game_state: 'lobby',
        current_word: null,
        current_hint: null,
        current_category: null,
        first_player_id: null,
        timer_end_time: null
    });
    
    await resetPlayersForNewRound(room.id);
    await emitGameEvent(roomCode, 'back_to_lobby', {});
    
    return res.status(200).json({ success: true });
}

async function handleChat(req, res) {
    const { roomCode, playerId, playerName, text, msgId } = req.body;
    
    if (!roomCode || !playerId || !text) {
        return res.status(400).json({ 
            success: false, 
            error: 'Datos incompletos' 
        });
    }
    
    // Emit chat message event con el mismo msgId del cliente
    await emitGameEvent(roomCode, 'chat_message', {
        playerId,
        playerName,
        text: text.substring(0, 200),
        msgId: msgId || `${playerId}-${Date.now()}`
    });
    
    return res.status(200).json({ success: true });
}

// Main handler con routing
export default async function handler(req, res) {
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { action } = req.query;
        
        switch (action) {
            case 'start':
                return await handleStart(req, res);
                
            case 'ready':
                return await handleReady(req, res);
                
            case 'start-vote':
                return await handleStartVote(req, res);
                
            case 'cast-vote':
                return await handleCastVote(req, res);
                
            case 'cancel-vote':
                return await handleCancelVote(req, res);
                
            case 'results':
                return await handleResults(req, res);
                
            case 'new-round':
                return await handleNewRound(req, res);
                
            case 'chat':
                return await handleChat(req, res);
                
            default:
                return res.status(400).json({ 
                    success: false, 
                    error: 'Acción no válida. Usa: start, ready, start-vote, cast-vote, cancel-vote, results, new-round, chat' 
                });
        }
    } catch (error) {
        console.error('Error in game handler:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
}
