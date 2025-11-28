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
        const { roomCode, playerId, settings } = req.body;
        
        // Validar datos
        if (!roomCode || !playerId || !settings) {
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
                error: 'Solo el anfitrión puede cambiar la configuración' 
            });
        }
        
        // Preparar configuración actualizada
        const currentSettings = room.settings || {};
        const newSettings = {
            ...currentSettings,
            impostorCount: Math.max(1, Math.min(5, settings.impostorCount || 1)),
            hintMode: Boolean(settings.hintMode),
            selectedCategories: Array.isArray(settings.selectedCategories) && settings.selectedCategories.length > 0
                ? settings.selectedCategories
                : ['animales']
        };
        
        // Actualizar sala
        await updateRoom(room.id, { settings: newSettings });
        
        // Emitir evento para notificar a todos los jugadores
        await emitGameEvent(roomCode, 'settings_update', newSettings);
        
        return res.status(200).json({
            success: true,
            settings: newSettings
        });
        
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Error al actualizar configuración' 
        });
    }
}
