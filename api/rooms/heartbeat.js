import { updatePlayer } from '../lib/supabase.js';

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
        const { playerId } = req.body;
        
        if (!playerId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Player ID requerido' 
            });
        }
        
        // Actualizar last_seen del jugador
        await updatePlayer(playerId, {});
        
        return res.status(200).json({
            success: true
        });
        
    } catch (error) {
        // No hacer log de errores de heartbeat
        return res.status(200).json({ success: true });
    }
}
