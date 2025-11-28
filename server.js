// ============================================
// EL IMPOSTOR - Servidor Node.js + Socket.io
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// BASE DE DATOS DE PALABRAS POR CATEGORÍA
// ============================================
const WORD_DATABASE = {
    animales: {
        name: "🐾 Animales",
        words: ["Elefante", "Delfín", "Águila", "Serpiente", "Canguro", "Pingüino", "Tigre", "Jirafa", "Cocodrilo", "Murciélago"],
        hints: ["Tiene patas", "Vive en la naturaleza", "Tiene ojos", "Se mueve", "Necesita alimentarse", "Respira", "Tiene cuerpo", "Es un ser vivo", "Puede tener crías", "Existe en la Tierra"]
    },
    profesiones: {
        name: "👔 Profesiones",
        words: ["Astronauta", "Chef", "Detective", "Piloto", "Cirujano", "Arquitecto", "Bombero", "Veterinario", "Abogado", "Fotógrafo"],
        hints: ["Es un trabajo", "Requiere formación", "Se hace por dinero", "Ayuda a otros", "Tiene horario", "Usa herramientas", "Requiere habilidad", "Es una ocupación", "Tiene responsabilidades", "Se ejerce profesionalmente"]
    },
    lugares: {
        name: "🗺️ Lugares",
        words: ["Hospital", "Aeropuerto", "Biblioteca", "Estadio", "Museo", "Parque de atracciones", "Submarino", "Castillo", "Crucero", "Estación espacial"],
        hints: ["Puedes ir allí", "Es un sitio", "Tiene estructura", "Ocupa espacio", "Tiene nombre", "Está en algún lugar", "Gente lo visita", "Tiene propósito", "Existe físicamente", "Se puede describir"]
    },
    peliculas: {
        name: "🎬 Películas/Series",
        words: ["Titanic", "Star Wars", "Harry Potter", "El Padrino", "Jurassic Park", "Matrix", "Avatar", "Frozen", "Breaking Bad", "Stranger Things"],
        hints: ["Es entretenimiento", "Tiene historia", "Tiene personajes", "Es famoso/a", "Se puede ver", "Tiene fans", "Tiene escenas", "Fue producido/a", "Tiene título", "Es audiovisual"]
    },
    comida: {
        name: "🍕 Comida",
        words: ["Pizza", "Sushi", "Hamburguesa", "Paella", "Tacos", "Croissant", "Ramen", "Lasaña", "Ceviche", "Curry"],
        hints: ["Se come", "Tiene sabor", "Es alimento", "Nutre", "Se prepara", "Tiene ingredientes", "Se sirve", "Tiene textura", "Puede cocinarse", "Es comestible"]
    },
    deportes: {
        name: "⚽ Deportes",
        words: ["Fútbol", "Baloncesto", "Natación", "Tenis", "Golf", "Boxeo", "Ciclismo", "Surf", "Escalada", "Esgrima"],
        hints: ["Es actividad física", "Tiene reglas", "Se compite", "Requiere esfuerzo", "Tiene atletas", "Es ejercicio", "Tiene equipamiento", "Se practica", "Tiene ganadores", "Es recreativo"]
    },
    tecnologia: {
        name: "💻 Tecnología",
        words: ["Smartphone", "Dron", "Robot", "Realidad Virtual", "Inteligencia Artificial", "Blockchain", "Impresora 3D", "Tesla", "Netflix", "TikTok"],
        hints: ["Es moderno", "Usa electricidad", "Es innovador", "Fue inventado", "Es digital", "Tiene usuarios", "Evolucionó", "Es tecnológico", "Tiene funciones", "Existe actualmente"]
    }
};

// ============================================
// GESTIÓN DE SALAS
// ============================================
const rooms = new Map();

// Generar código de sala único de 4 letras
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code;
    do {
        code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (rooms.has(code));
    return code;
}

// Crear nueva sala
function createRoom(hostSocketId, hostName) {
    const code = generateRoomCode();
    const room = {
        code: code,
        hostId: hostSocketId,
        players: new Map(),
        settings: {
            impostorCount: 1,
            hintMode: false,
            selectedCategories: ['animales', 'profesiones', 'lugares']
        },
        gameState: 'lobby', // lobby, revealing, playing, voting, results
        currentWord: null,
        currentHint: null,
        currentCategory: null,
        playersReady: new Set(),
        firstPlayer: null,
        timerEndTime: null,
        roundDuration: 300 // 5 minutos en segundos
    };
    
    rooms.set(code, room);
    return room;
}

// Obtener sala por código
function getRoom(code) {
    return rooms.get(code?.toUpperCase());
}

// Agregar jugador a sala
function addPlayerToRoom(room, socketId, playerName) {
    const player = {
        id: socketId,
        name: playerName,
        isHost: room.hostId === socketId,
        role: null, // 'citizen' o 'impostor'
        isReady: false,
        isConnected: true
    };
    room.players.set(socketId, player);
    return player;
}

// Verificar si nombre está duplicado
function isNameTaken(room, name, excludeSocketId = null) {
    for (const [socketId, player] of room.players) {
        if (socketId !== excludeSocketId && player.name.toLowerCase() === name.toLowerCase() && player.isConnected) {
            return true;
        }
    }
    return false;
}

// Obtener lista de jugadores para enviar al cliente
function getPlayersList(room) {
    const players = [];
    for (const [socketId, player] of room.players) {
        if (player.isConnected) {
            players.push({
                id: socketId,
                name: player.name,
                isHost: player.isHost,
                isReady: room.playersReady.has(socketId)
            });
        }
    }
    return players;
}

// Obtener jugadores conectados
function getConnectedPlayers(room) {
    return Array.from(room.players.values()).filter(p => p.isConnected);
}

// Seleccionar palabra y asignar roles
function assignRolesAndWord(room) {
    const connectedPlayers = getConnectedPlayers(room);
    const playerCount = connectedPlayers.length;
    const impostorCount = Math.min(room.settings.impostorCount, Math.floor(playerCount / 3));
    
    // Seleccionar categoría y palabra aleatoria
    const categories = room.settings.selectedCategories;
    const randomCategoryKey = categories[Math.floor(Math.random() * categories.length)];
    const category = WORD_DATABASE[randomCategoryKey];
    const wordIndex = Math.floor(Math.random() * category.words.length);
    const word = category.words[wordIndex];
    const hint = category.hints[wordIndex];
    
    room.currentWord = word;
    room.currentHint = hint;
    room.currentCategory = category.name;
    
    // Resetear roles
    for (const player of room.players.values()) {
        player.role = 'citizen';
    }
    
    // Seleccionar impostores aleatoriamente
    const shuffled = [...connectedPlayers].sort(() => Math.random() - 0.5);
    for (let i = 0; i < impostorCount; i++) {
        shuffled[i].role = 'impostor';
    }
    
    // Limpiar jugadores listos
    room.playersReady.clear();
    room.firstPlayer = null;
}

// Seleccionar primer jugador (que no sea impostor preferiblemente, y que esté conectado)
function selectFirstPlayer(room) {
    const connectedPlayers = getConnectedPlayers(room);
    const citizens = connectedPlayers.filter(p => p.role === 'citizen');
    const pool = citizens.length > 0 ? citizens : connectedPlayers;
    const firstPlayer = pool[Math.floor(Math.random() * pool.length)];
    room.firstPlayer = firstPlayer.id;
    return firstPlayer;
}

// Transferir host a otro jugador
function transferHost(room) {
    const connectedPlayers = getConnectedPlayers(room);
    if (connectedPlayers.length > 0) {
        const newHost = connectedPlayers[0];
        room.hostId = newHost.id;
        newHost.isHost = true;
        return newHost;
    }
    return null;
}

// ============================================
// EVENTOS DE SOCKET.IO
// ============================================
io.on('connection', (socket) => {
    console.log(`🔌 Usuario conectado: ${socket.id}`);
    
    let currentRoom = null;
    
    // CREAR SALA
    socket.on('createRoom', (data, callback) => {
        const { playerName } = data;
        
        if (!playerName || playerName.trim().length < 2) {
            return callback({ success: false, error: 'Nombre inválido (mínimo 2 caracteres)' });
        }
        
        const room = createRoom(socket.id, playerName.trim());
        addPlayerToRoom(room, socket.id, playerName.trim());
        
        socket.join(room.code);
        currentRoom = room.code;
        
        console.log(`🏠 Sala creada: ${room.code} por ${playerName}`);
        
        callback({ 
            success: true, 
            roomCode: room.code,
            isHost: true,
            categories: Object.entries(WORD_DATABASE).map(([key, val]) => ({
                id: key,
                name: val.name
            }))
        });
        
        io.to(room.code).emit('playersUpdate', getPlayersList(room));
    });
    
    // UNIRSE A SALA
    socket.on('joinRoom', (data, callback) => {
        const { roomCode, playerName } = data;
        
        if (!playerName || playerName.trim().length < 2) {
            return callback({ success: false, error: 'Nombre inválido (mínimo 2 caracteres)' });
        }
        
        const room = getRoom(roomCode);
        
        if (!room) {
            return callback({ success: false, error: 'Sala no encontrada' });
        }
        
        if (room.gameState !== 'lobby') {
            return callback({ success: false, error: 'La partida ya ha comenzado' });
        }
        
        if (isNameTaken(room, playerName.trim())) {
            return callback({ success: false, error: 'Ese nombre ya está en uso' });
        }
        
        addPlayerToRoom(room, socket.id, playerName.trim());
        socket.join(room.code);
        currentRoom = room.code;
        
        console.log(`👤 ${playerName} se unió a sala ${room.code}`);
        
        callback({ 
            success: true, 
            roomCode: room.code,
            isHost: false,
            categories: Object.entries(WORD_DATABASE).map(([key, val]) => ({
                id: key,
                name: val.name
            }))
        });
        
        io.to(room.code).emit('playersUpdate', getPlayersList(room));
    });
    
    // ACTUALIZAR CONFIGURACIÓN
    socket.on('updateSettings', (data) => {
        const room = getRoom(currentRoom);
        if (!room || room.hostId !== socket.id) return;
        
        if (data.impostorCount !== undefined) {
            room.settings.impostorCount = Math.max(1, Math.min(5, data.impostorCount));
        }
        if (data.hintMode !== undefined) {
            room.settings.hintMode = Boolean(data.hintMode);
        }
        if (data.selectedCategories !== undefined && Array.isArray(data.selectedCategories)) {
            room.settings.selectedCategories = data.selectedCategories.filter(c => WORD_DATABASE[c]);
            if (room.settings.selectedCategories.length === 0) {
                room.settings.selectedCategories = ['animales'];
            }
        }
        
        io.to(room.code).emit('settingsUpdate', room.settings);
    });
    
    // INICIAR PARTIDA
    socket.on('startGame', (callback) => {
        const room = getRoom(currentRoom);
        
        if (!room || room.hostId !== socket.id) {
            return callback?.({ success: false, error: 'No eres el host' });
        }
        
        const connectedPlayers = getConnectedPlayers(room);
        if (connectedPlayers.length < 3) {
            return callback?.({ success: false, error: 'Se necesitan al menos 3 jugadores' });
        }
        
        // Asignar roles y palabra
        assignRolesAndWord(room);
        room.gameState = 'revealing';
        
        console.log(`🎮 Partida iniciada en sala ${room.code}`);
        
        // Enviar a cada jugador su rol
        for (const [socketId, player] of room.players) {
            if (player.isConnected) {
                io.to(socketId).emit('gameStarted', {
                    role: player.role,
                    word: player.role === 'citizen' ? room.currentWord : null,
                    hint: player.role === 'impostor' && room.settings.hintMode ? room.currentHint : null,
                    category: room.currentCategory,
                    totalPlayers: connectedPlayers.length
                });
            }
        }
        
        callback?.({ success: true });
    });
    
    // JUGADOR LISTO (después de ver su rol)
    socket.on('playerReady', () => {
        const room = getRoom(currentRoom);
        if (!room || room.gameState !== 'revealing') return;
        
        room.playersReady.add(socket.id);
        
        const connectedPlayers = getConnectedPlayers(room);
        const readyCount = room.playersReady.size;
        const totalCount = connectedPlayers.length;
        
        // Notificar progreso a todos
        io.to(room.code).emit('readyProgress', {
            ready: readyCount,
            total: totalCount
        });
        
        console.log(`✅ Jugador listo: ${readyCount}/${totalCount} en sala ${room.code}`);
        
        // Si todos están listos, iniciar fase de juego
        if (readyCount >= totalCount) {
            const firstPlayer = selectFirstPlayer(room);
            room.gameState = 'playing';
            room.timerEndTime = Date.now() + (room.roundDuration * 1000);
            
            console.log(`🎯 Todos listos. Primer jugador: ${firstPlayer.name}`);
            
            io.to(room.code).emit('roundStart', {
                firstPlayerName: firstPlayer.name,
                firstPlayerId: firstPlayer.id,
                timerEndTime: room.timerEndTime,
                duration: room.roundDuration
            });
        }
    });
    
    // VOTACIÓN - Acusar a jugador
    socket.on('accusePlayer', (data) => {
        const room = getRoom(currentRoom);
        if (!room || room.gameState !== 'playing') return;
        
        const { accusedId } = data;
        const accuser = room.players.get(socket.id);
        const accused = room.players.get(accusedId);
        
        if (!accuser || !accused || !accused.isConnected) return;
        
        // Notificar a todos sobre la acusación
        io.to(room.code).emit('playerAccused', {
            accuserName: accuser.name,
            accusedName: accused.name,
            accusedId: accusedId
        });
    });
    
    // REVELAR RESULTADO
    socket.on('revealResults', () => {
        const room = getRoom(currentRoom);
        if (!room || room.hostId !== socket.id) return;
        
        room.gameState = 'results';
        
        const results = [];
        for (const [socketId, player] of room.players) {
            if (player.isConnected) {
                results.push({
                    id: socketId,
                    name: player.name,
                    role: player.role,
                    isHost: player.isHost
                });
            }
        }
        
        io.to(room.code).emit('gameResults', {
            word: room.currentWord,
            category: room.currentCategory,
            players: results
        });
    });
    
    // NUEVA RONDA
    socket.on('newRound', () => {
        const room = getRoom(currentRoom);
        if (!room || room.hostId !== socket.id) return;
        
        room.gameState = 'lobby';
        room.currentWord = null;
        room.currentHint = null;
        room.currentCategory = null;
        room.playersReady.clear();
        room.firstPlayer = null;
        
        // Resetear roles de todos
        for (const player of room.players.values()) {
            player.role = null;
        }
        
        io.to(room.code).emit('backToLobby');
        io.to(room.code).emit('playersUpdate', getPlayersList(room));
        io.to(room.code).emit('settingsUpdate', room.settings);
    });
    
    // DESCONEXIÓN
    socket.on('disconnect', () => {
        console.log(`🔌 Usuario desconectado: ${socket.id}`);
        
        if (!currentRoom) return;
        
        const room = getRoom(currentRoom);
        if (!room) return;
        
        const player = room.players.get(socket.id);
        if (!player) return;
        
        player.isConnected = false;
        room.playersReady.delete(socket.id);
        
        // Si era el host, transferir
        if (room.hostId === socket.id) {
            const newHost = transferHost(room);
            if (newHost) {
                console.log(`👑 Nuevo host: ${newHost.name} en sala ${room.code}`);
                io.to(room.code).emit('hostChanged', {
                    newHostId: newHost.id,
                    newHostName: newHost.name
                });
            } else {
                // No quedan jugadores, eliminar sala
                rooms.delete(room.code);
                console.log(`🗑️ Sala ${room.code} eliminada (vacía)`);
                return;
            }
        }
        
        io.to(room.code).emit('playersUpdate', getPlayersList(room));
        io.to(room.code).emit('playerDisconnected', { playerName: player.name });
        
        // Si estábamos en fase de revelación, verificar si todos los restantes están listos
        if (room.gameState === 'revealing') {
            const connectedPlayers = getConnectedPlayers(room);
            const readyCount = Array.from(room.playersReady).filter(id => {
                const p = room.players.get(id);
                return p && p.isConnected;
            }).length;
            
            io.to(room.code).emit('readyProgress', {
                ready: readyCount,
                total: connectedPlayers.length
            });
            
            if (readyCount >= connectedPlayers.length && connectedPlayers.length >= 3) {
                const firstPlayer = selectFirstPlayer(room);
                room.gameState = 'playing';
                room.timerEndTime = Date.now() + (room.roundDuration * 1000);
                
                io.to(room.code).emit('roundStart', {
                    firstPlayerName: firstPlayer.name,
                    firstPlayerId: firstPlayer.id,
                    timerEndTime: room.timerEndTime,
                    duration: room.roundDuration
                });
            }
        }
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════╗
    ║                                          ║
    ║     🎭 EL IMPOSTOR - Servidor Activo     ║
    ║                                          ║
    ║     http://localhost:${PORT}               ║
    ║                                          ║
    ╚══════════════════════════════════════════╝
    `);
});
