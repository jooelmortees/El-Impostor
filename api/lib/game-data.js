// ============================================
// BASE DE DATOS DE PALABRAS POR CATEGORÍA
// ============================================

export const WORD_DATABASE = {
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

// Generar código de sala único de 4 letras
export function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Obtener categorías para el frontend
export function getCategories() {
    return Object.entries(WORD_DATABASE).map(([key, val]) => ({
        id: key,
        name: val.name
    }));
}

// Seleccionar palabra aleatoria de las categorías seleccionadas
export function selectRandomWord(selectedCategories) {
    const categories = selectedCategories.filter(c => WORD_DATABASE[c]);
    if (categories.length === 0) categories.push('animales');
    
    const randomCategoryKey = categories[Math.floor(Math.random() * categories.length)];
    const category = WORD_DATABASE[randomCategoryKey];
    const wordIndex = Math.floor(Math.random() * category.words.length);
    
    return {
        word: category.words[wordIndex],
        hint: category.hints[wordIndex],
        categoryName: category.name
    };
}
