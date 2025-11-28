import { 
    createRoom, 
    getRoomByCode, 
    createPlayer, 
    isNameTakenInRoom 
} from '../lib/supabase.js';
import { generateRoomCode, getCategories } from '../lib/game-data.js';

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
        const { playerName } = req.body;
        
        // Validar nombre
        if (!playerName || playerName.trim().length < 2) {
            return res.status(400).json({ 
                success: false, 
                error: 'Nombre inválido (mínimo 2 caracteres)' 
            });
        }
        
        const name = playerName.trim().substring(0, 15);
        
        // Generar código único
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
        
        // Crear sala primero con un placeholder para host_id
        const tempHostId = '00000000-0000-0000-0000-000000000000';
        const room = await createRoom(code, tempHostId, {
            impostorCount: 1,
            hintMode: false,
            selectedCategories: ['animales', 'profesiones', 'lugares']
        });
        
        // Crear jugador host
        const player = await createPlayer(room.id, name, true);
        
        // Actualizar la sala con el ID real del host
        const { supabase } = await import('../lib/supabase.js');
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
            categories: getCategories()
        });
        
    } catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al crear la sala' 
        });
    }
}
