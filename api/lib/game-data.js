// ============================================
// BASE DE DATOS DE PALABRAS POR CATEGORÍA
// ============================================

// Cada palabra tiene múltiples pistas posibles para variedad
const WORDS_WITH_HINTS = {
    animales: {
        name: "🐾 Animales",
        words: [
            { word: "Elefante", hints: ["Tiene trompa", "Es el más grande terrestre", "Vive en África y Asia", "Tiene colmillos de marfil", "Nunca olvida"] },
            { word: "Delfín", hints: ["Mamífero marino", "Es muy inteligente", "Hace acrobacias", "Se comunica con sonidos", "Nada en grupos"] },
            { word: "Águila", hints: ["Ave rapaz", "Símbolo de libertad", "Tiene vista aguda", "Vuela muy alto", "Caza con garras"] },
            { word: "Serpiente", hints: ["Reptil sin patas", "Algunas son venenosas", "Muda de piel", "Se arrastra", "Tiene lengua bífida"] },
            { word: "Canguro", hints: ["Tiene bolsa", "Salta para moverse", "Vive en Australia", "Marsupial", "Tiene cola fuerte"] },
            { word: "Pingüino", hints: ["Ave que no vuela", "Vive en el frío", "Camina gracioso", "Blanco y negro", "Nada muy bien"] },
            { word: "Tigre", hints: ["Felino rayado", "El más grande de su familia", "Vive en Asia", "Caza solo", "Muy sigiloso"] },
            { word: "Jirafa", hints: ["Cuello muy largo", "El animal más alto", "Come hojas de árboles", "Tiene manchas", "Vive en África"] },
            { word: "Cocodrilo", hints: ["Reptil prehistórico", "Vive en agua y tierra", "Tiene escamas", "Mandíbula muy fuerte", "Puede vivir muchos años"] },
            { word: "Murciélago", hints: ["Único mamífero volador", "Duerme de día", "Usa ecolocación", "Cuelga boca abajo", "Sale de noche"] },
            { word: "León", hints: ["Rey de la selva", "Tiene melena", "Vive en manadas", "Ruge muy fuerte", "Felino africano"] },
            { word: "Oso", hints: ["Hiberna en invierno", "Come miel", "Muy grande y fuerte", "Puede ser polar o pardo", "Camina sobre sus patas"] },
            { word: "Mono", hints: ["Vive en árboles", "Muy ágil", "Come plátanos", "Pariente del humano", "Usa la cola para colgarse"] },
            { word: "Lobo", hints: ["Aúlla a la luna", "Vive en manadas", "Ancestro del perro", "Caza en grupo", "Muy territorial"] },
            { word: "Tiburón", hints: ["Depredador marino", "Tiene muchos dientes", "Huele sangre de lejos", "Nada constantemente", "Algunas especies son enormes"] },
            { word: "Caballo", hints: ["Se puede montar", "Corre muy rápido", "Come pasto", "Tiene herradura", "Relincha"] },
            { word: "Perro", hints: ["Mejor amigo del hombre", "Ladra", "Tiene muy buen olfato", "Mueve la cola", "Animal doméstico"] },
            { word: "Gato", hints: ["Ronronea", "Tiene 7 vidas", "Caza ratones", "Duerme mucho", "Muy independiente"] },
            { word: "Tortuga", hints: ["Lleva su casa", "Muy lenta", "Vive muchos años", "Tiene caparazón", "Reptil"] },
            { word: "Conejo", hints: ["Orejas largas", "Salta", "Come zanahorias", "Muy suave", "Se reproduce rápido"] },
            { word: "Ballena", hints: ["El animal más grande", "Mamífero marino", "Canta bajo el agua", "Respira aire", "Sale a la superficie"] },
            { word: "Pulpo", hints: ["Tiene 8 tentáculos", "Muy inteligente", "Cambia de color", "Vive en el mar", "Escupe tinta"] },
            { word: "Araña", hints: ["Tiene 8 patas", "Teje telarañas", "Algunas son venenosas", "Come insectos", "Arácnido"] },
            { word: "Abeja", hints: ["Produce miel", "Vive en colmenas", "Tiene aguijón", "Poliniza flores", "Muy trabajadora"] },
            { word: "Mariposa", hints: ["Tiene alas coloridas", "Era oruga", "Vive poco tiempo", "Metamorfosis", "Vuela de flor en flor"] }
        ]
    },
    profesiones: {
        name: "👔 Profesiones",
        words: [
            { word: "Astronauta", hints: ["Viaja al espacio", "Usa traje especial", "Flota sin gravedad", "Entrena mucho", "Vive en estación espacial"] },
            { word: "Chef", hints: ["Cocina profesionalmente", "Usa gorro alto", "Crea recetas", "Trabaja en cocina", "Dirige restaurantes"] },
            { word: "Detective", hints: ["Resuelve casos", "Busca pistas", "Investiga crímenes", "Usa lupa", "Muy observador"] },
            { word: "Piloto", hints: ["Vuela aviones", "Usa uniforme", "Trabaja en cabina", "Viaja mucho", "Necesita licencia"] },
            { word: "Cirujano", hints: ["Opera pacientes", "Usa bisturí", "Trabaja en quirófano", "Estudia muchos años", "Salva vidas"] },
            { word: "Arquitecto", hints: ["Diseña edificios", "Hace planos", "Estudia estructuras", "Crea espacios", "Trabaja con ingenieros"] },
            { word: "Bombero", hints: ["Apaga fuegos", "Usa manguera", "Muy valiente", "Rescata personas", "Conduce camión rojo"] },
            { word: "Veterinario", hints: ["Cuida animales", "Trabaja en clínica", "Pone vacunas", "Opera mascotas", "Ama a los animales"] },
            { word: "Abogado", hints: ["Defiende en juicios", "Estudia leyes", "Trabaja en tribunal", "Usa toga", "Da consejos legales"] },
            { word: "Fotógrafo", hints: ["Toma fotos", "Usa cámara", "Captura momentos", "Edita imágenes", "Trabaja con luz"] },
            { word: "Profesor", hints: ["Enseña", "Trabaja en escuela", "Corrige exámenes", "Explica lecciones", "Tiene alumnos"] },
            { word: "Médico", hints: ["Cura enfermos", "Usa bata blanca", "Receta medicinas", "Trabaja en hospital", "Escucha con estetoscopio"] },
            { word: "Policía", hints: ["Mantiene el orden", "Usa uniforme", "Lleva placa", "Patrulla calles", "Detiene criminales"] },
            { word: "Carpintero", hints: ["Trabaja con madera", "Usa martillo", "Hace muebles", "Corta tablas", "Clava clavos"] },
            { word: "Electricista", hints: ["Instala cables", "Arregla luces", "Trabaja con voltaje", "Usa herramientas", "Peligro de descarga"] },
            { word: "Plomero", hints: ["Arregla tuberías", "Destapa cañerías", "Instala grifos", "Trabaja con agua", "Usa llave inglesa"] },
            { word: "Panadero", hints: ["Hace pan", "Madruga mucho", "Usa horno", "Amasa", "Trabaja con harina"] },
            { word: "Periodista", hints: ["Escribe noticias", "Hace entrevistas", "Investiga", "Trabaja en medios", "Informa al público"] },
            { word: "Dentista", hints: ["Cuida dientes", "Usa torno", "Pone brackets", "Hace limpiezas", "Da anestesia"] },
            { word: "Cantante", hints: ["Canta canciones", "Tiene fans", "Da conciertos", "Usa micrófono", "Graba discos"] },
            { word: "Actor", hints: ["Actúa en películas", "Memoriza guiones", "Interpreta personajes", "Sale en TV", "Hace teatro"] },
            { word: "Científico", hints: ["Hace experimentos", "Investiga", "Trabaja en laboratorio", "Usa microscopio", "Descubre cosas"] },
            { word: "Programador", hints: ["Escribe código", "Crea software", "Usa computadora", "Arregla bugs", "Trabaja en tecnología"] },
            { word: "Mecánico", hints: ["Arregla coches", "Trabaja en taller", "Usa herramientas", "Cambia aceite", "Repara motores"] },
            { word: "Jardinero", hints: ["Cuida plantas", "Poda árboles", "Corta césped", "Trabaja al aire libre", "Riega flores"] }
        ]
    },
    lugares: {
        name: "🗺️ Lugares",
        words: [
            { word: "Hospital", hints: ["Hay enfermos", "Tienen ambulancias", "Huele a desinfectante", "Tiene quirófanos", "Nacen bebés"] },
            { word: "Aeropuerto", hints: ["Despegan aviones", "Hay maletas", "Control de pasaportes", "Tiendas duty-free", "Salas de espera"] },
            { word: "Biblioteca", hints: ["Llena de libros", "Hay silencio", "Puedes estudiar", "Préstamos de libros", "Tiene estanterías"] },
            { word: "Estadio", hints: ["Se juegan partidos", "Tiene gradas", "Hay aficionados", "Césped verde", "Se hacen conciertos"] },
            { word: "Museo", hints: ["Hay obras de arte", "Exposiciones", "Guías turísticos", "Historia y cultura", "No tocar nada"] },
            { word: "Parque de atracciones", hints: ["Montañas rusas", "Algodón de azúcar", "Diversión", "Hay colas", "Atracciones mecánicas"] },
            { word: "Submarino", hints: ["Viaja bajo el agua", "Tiene periscopio", "Tripulación", "Muy estrecho", "Usa sonar"] },
            { word: "Castillo", hints: ["Vivían reyes", "Tiene torres", "Medieval", "Murallas gruesas", "Puente levadizo"] },
            { word: "Crucero", hints: ["Barco de lujo", "Vacaciones en mar", "Tiene camarotes", "Buffet libre", "Hace escalas"] },
            { word: "Estación espacial", hints: ["Orbita la Tierra", "Astronautas viven ahí", "Sin gravedad", "Experimentos", "Se ve desde abajo"] },
            { word: "Playa", hints: ["Arena y mar", "Tomar el sol", "Olas", "Sombrillas", "Castillos de arena"] },
            { word: "Montaña", hints: ["Muy alta", "Se puede escalar", "Tiene nieve arriba", "Vista panorámica", "Aire fresco"] },
            { word: "Cine", hints: ["Películas", "Palomitas", "Pantalla grande", "Oscuro", "Butacas"] },
            { word: "Restaurante", hints: ["Sirven comida", "Hay camareros", "Menú", "Reservaciones", "Mesas"] },
            { word: "Supermercado", hints: ["Compras", "Carritos", "Estanterías", "Caja registradora", "Ofertas"] },
            { word: "Gimnasio", hints: ["Hacer ejercicio", "Máquinas", "Pesas", "Sudor", "Espejos"] },
            { word: "Zoológico", hints: ["Animales", "Jaulas", "Familias", "Visitas guiadas", "Conservación"] },
            { word: "Iglesia", hints: ["Religioso", "Campanario", "Misa", "Bancos de madera", "Altar"] },
            { word: "Prisión", hints: ["Presos", "Barrotes", "Guardias", "Celdas", "Seguridad"] },
            { word: "Universidad", hints: ["Estudiar carreras", "Campus", "Estudiantes", "Exámenes", "Graduaciones"] },
            { word: "Farmacia", hints: ["Medicinas", "Recetas", "Cruz verde", "Farmacéutico", "Abierta 24h"] },
            { word: "Banco", hints: ["Dinero", "Cuentas", "Cajeros", "Préstamos", "Caja fuerte"] },
            { word: "Hotel", hints: ["Dormir", "Habitaciones", "Recepción", "Servicio de cuarto", "Estrellas"] },
            { word: "Discoteca", hints: ["Bailar", "Música alta", "Luces", "DJ", "Bebidas"] },
            { word: "Cementerio", hints: ["Tumbas", "Flores", "Silencio", "Lápidas", "Visitar difuntos"] }
        ]
    },
    peliculas: {
        name: "🎬 Películas/Series",
        words: [
            { word: "Titanic", hints: ["Barco que se hunde", "Historia de amor", "DiCaprio", "Iceberg", "Nunca te soltaré"] },
            { word: "Star Wars", hints: ["Guerra de las galaxias", "La Fuerza", "Espadas láser", "Darth Vader", "En una galaxia muy lejana"] },
            { word: "Harry Potter", hints: ["Mago", "Hogwarts", "Varita mágica", "Cicatriz en la frente", "El niño que vivió"] },
            { word: "El Padrino", hints: ["Mafia italiana", "Marlon Brando", "Oferta que no puedes rechazar", "Familia Corleone", "Clásico del cine"] },
            { word: "Jurassic Park", hints: ["Dinosaurios", "Parque temático", "ADN", "Spielberg", "Velociraptor"] },
            { word: "Matrix", hints: ["Pastilla roja o azul", "Keanu Reeves", "Simulación", "Neo", "Esquivar balas"] },
            { word: "Avatar", hints: ["Planeta Pandora", "Azules", "James Cameron", "3D", "Na'vi"] },
            { word: "Frozen", hints: ["Let it go", "Princesa con poderes", "Nieve", "Olaf", "Disney"] },
            { word: "Breaking Bad", hints: ["Profesor de química", "Metanfetamina", "Walter White", "Heisenberg", "Desierto"] },
            { word: "Stranger Things", hints: ["Eleven", "Mundo del revés", "Años 80", "Netflix", "Demogorgon"] },
            { word: "El Rey León", hints: ["Simba", "Hakuna Matata", "África", "Mufasa", "Disney animado"] },
            { word: "Toy Story", hints: ["Juguetes que hablan", "Woody", "Buzz Lightyear", "Pixar", "Andy"] },
            { word: "Los Vengadores", hints: ["Marvel", "Superhéroes", "Thanos", "Iron Man", "Infinito"] },
            { word: "El Señor de los Anillos", hints: ["Hobbits", "Anillo único", "Mordor", "Gandalf", "Frodo"] },
            { word: "Piratas del Caribe", hints: ["Jack Sparrow", "Barco pirata", "Johnny Depp", "Ron", "Perla Negra"] },
            { word: "Shrek", hints: ["Ogro verde", "Burro parlante", "Pantano", "Princesa Fiona", "DreamWorks"] },
            { word: "La Casa de Papel", hints: ["Atracadores", "Profesor", "Bella Ciao", "Máscaras Dalí", "España"] },
            { word: "Game of Thrones", hints: ["Trono de hierro", "Dragones", "Invierno se acerca", "7 reinos", "Jon Snow"] },
            { word: "Friends", hints: ["6 amigos", "Central Perk", "Nueva York", "Sitcom", "Sofá naranja"] },
            { word: "The Office", hints: ["Oficina", "Michael Scott", "Mockumentary", "Dunder Mifflin", "Papel"] },
            { word: "Batman", hints: ["Murciélago", "Gotham", "Bruce Wayne", "Batimóvil", "Caballero oscuro"] },
            { word: "Spider-Man", hints: ["Hombre araña", "Peter Parker", "Telas de araña", "Nueva York", "Tío Ben"] },
            { word: "Indiana Jones", hints: ["Arqueólogo", "Látigo", "Sombrero", "Templos", "Harrison Ford"] },
            { word: "ET", hints: ["Extraterrestre", "Teléfono casa", "Bicicleta volando", "Spielberg", "Dedo brillante"] },
            { word: "Coco", hints: ["Día de muertos", "México", "Música", "Pixar", "Recuérdame"] }
        ]
    },
    comida: {
        name: "🍕 Comida",
        words: [
            { word: "Pizza", hints: ["Italiana", "Tiene queso", "Forma redonda", "Se hornea", "Muchos toppings"] },
            { word: "Sushi", hints: ["Japonés", "Arroz y pescado", "Se come con palillos", "Alga nori", "Wasabi y soja"] },
            { word: "Hamburguesa", hints: ["Americana", "Carne entre pan", "Fast food", "Con papas fritas", "McDonald's"] },
            { word: "Paella", hints: ["Española", "Arroz amarillo", "Mariscos", "Valencia", "Se hace en sartén grande"] },
            { word: "Tacos", hints: ["Mexicanos", "Tortilla de maíz", "Se dobla", "Salsa picante", "Carne y cilantro"] },
            { word: "Croissant", hints: ["Francés", "Forma de luna", "De mantequilla", "Desayuno", "Hojaldre"] },
            { word: "Ramen", hints: ["Japonés", "Sopa de fideos", "Caldo caliente", "Huevo", "Carne de cerdo"] },
            { word: "Lasaña", hints: ["Italiana", "Capas de pasta", "Boloñesa", "Bechamel", "Gratinada"] },
            { word: "Ceviche", hints: ["Peruano", "Pescado crudo", "Limón", "Marinado", "Cebolla y ají"] },
            { word: "Curry", hints: ["Indio", "Muy especiado", "Salsa amarilla", "Picante", "Con arroz"] },
            { word: "Hot Dog", hints: ["Salchicha", "En pan alargado", "Mostaza", "Americano", "Béisbol"] },
            { word: "Helado", hints: ["Frío", "Dulce", "De vainilla, chocolate...", "En cono", "Verano"] },
            { word: "Chocolate", hints: ["Del cacao", "Dulce", "Marrón", "Suizo o belga", "Se derrite"] },
            { word: "Tortilla española", hints: ["Con huevo", "Patatas", "Redonda", "España", "Se voltea"] },
            { word: "Pasta", hints: ["Italiana", "Espagueti, macarrones...", "Con salsa", "De trigo", "Al dente"] },
            { word: "Arroz", hints: ["Grano blanco", "Acompañamiento", "Asia", "Se hierve", "Muy común"] },
            { word: "Ensalada", hints: ["Verduras", "Saludable", "Lechuga", "Aliño", "Fresca"] },
            { word: "Pan", hints: ["De harina", "Se hornea", "Básico", "Panadería", "Tostado"] },
            { word: "Huevo frito", hints: ["De gallina", "En sartén", "Yema amarilla", "Desayuno", "Aceite"] },
            { word: "Galletas", hints: ["Dulces", "Crujientes", "Con chispas", "Merienda", "Oreo"] },
            { word: "Empanada", hints: ["Masa rellena", "Horno o frita", "Argentina, española...", "Carne o queso", "Media luna"] },
            { word: "Churros", hints: ["Españoles", "Fritos", "Con chocolate", "Alargados", "Azúcar"] },
            { word: "Pancakes", hints: ["Americanos", "Desayuno", "Con sirope", "Redondos", "Tortitas"] },
            { word: "Pollo frito", hints: ["Crujiente", "KFC", "Empanizado", "Americano", "Muslos y alitas"] },
            { word: "Donut", hints: ["Forma de anillo", "Glaseado", "Dulce", "Americano", "Homer Simpson"] }
        ]
    },
    deportes: {
        name: "⚽ Deportes",
        words: [
            { word: "Fútbol", hints: ["11 jugadores", "Pelota redonda", "Goles", "Mundial", "Messi y Ronaldo"] },
            { word: "Baloncesto", hints: ["Canasta", "NBA", "Pelota naranja", "Encestar", "Driblar"] },
            { word: "Natación", hints: ["En piscina", "Nadar", "Michael Phelps", "Estilos: crol, mariposa...", "Olímpico"] },
            { word: "Tenis", hints: ["Raqueta", "Pelota amarilla", "Red", "Wimbledon", "Sets y games"] },
            { word: "Golf", hints: ["Hoyos", "Palo y pelota", "18 hoyos", "Césped", "Bajo par"] },
            { word: "Boxeo", hints: ["Guantes", "Ring", "Knockout", "Rounds", "Pegar puñetazos"] },
            { word: "Ciclismo", hints: ["Bicicleta", "Tour de Francia", "Pedales", "Ruedas", "Casco"] },
            { word: "Surf", hints: ["Olas", "Tabla", "Playa", "Hawaii", "Equilibrio"] },
            { word: "Escalada", hints: ["Montañas", "Cuerdas", "Altura", "Rocas", "Arnés"] },
            { word: "Esgrima", hints: ["Espadas", "Máscara", "Tocar al rival", "Elegante", "Francés"] },
            { word: "Atletismo", hints: ["Correr", "Saltar", "Lanzar", "Pista", "Usain Bolt"] },
            { word: "Voleibol", hints: ["Red alta", "6 jugadores", "Remate", "Playa o pista", "Toques"] },
            { word: "Béisbol", hints: ["Bate", "Pelota pequeña", "9 innings", "MLB", "Home run"] },
            { word: "Hockey", hints: ["Hielo o césped", "Palo", "Disco o pelota", "Patines", "Portería"] },
            { word: "Rugby", hints: ["Pelota ovalada", "Placaje", "Try", "Nueva Zelanda", "Sin protección"] },
            { word: "Karate", hints: ["Arte marcial", "Japonés", "Cinturones", "Patadas", "Kata"] },
            { word: "Judo", hints: ["Arte marcial", "Llaves", "Judogi", "Japonés", "Olimpiadas"] },
            { word: "Esquí", hints: ["Nieve", "Montaña", "Tablas largas", "Bastones", "Descenso"] },
            { word: "Patinaje", hints: ["Hielo o ruedas", "Patines", "Piruetas", "Olímpico", "Música"] },
            { word: "Gimnasia", hints: ["Acrobacias", "Olimpiadas", "Barras", "Flexibilidad", "Simone Biles"] },
            { word: "Fórmula 1", hints: ["Coches", "Carreras", "Circuitos", "Muy rápido", "Hamilton"] },
            { word: "MotoGP", hints: ["Motos", "Carreras", "Circuitos", "Velocidad", "Valentino Rossi"] },
            { word: "Halterofilia", hints: ["Levantar pesas", "Fuerza", "Barra", "Discos", "Olímpico"] },
            { word: "Triatlón", hints: ["3 deportes", "Nadar, bici, correr", "Resistencia", "Ironman", "Transiciones"] },
            { word: "Ajedrez", hints: ["Tablero", "Piezas", "Rey y reina", "Jaque mate", "Estrategia"] }
        ]
    },
    tecnologia: {
        name: "💻 Tecnología",
        words: [
            { word: "Smartphone", hints: ["Teléfono inteligente", "Pantalla táctil", "Apps", "iPhone o Android", "Siempre lo llevas"] },
            { word: "Dron", hints: ["Vuela sin piloto", "Cámara aérea", "Control remoto", "Hélices", "Fotos desde arriba"] },
            { word: "Robot", hints: ["Máquina autónoma", "Inteligencia artificial", "Hace tareas", "De metal", "El futuro"] },
            { word: "Realidad Virtual", hints: ["Gafas especiales", "Mundo digital", "Inmersivo", "Videojuegos", "360 grados"] },
            { word: "Inteligencia Artificial", hints: ["Máquinas que aprenden", "ChatGPT", "Algoritmos", "El futuro", "Automatización"] },
            { word: "Blockchain", hints: ["Criptomonedas", "Descentralizado", "Bitcoin", "Cadena de bloques", "Seguro"] },
            { word: "Impresora 3D", hints: ["Crea objetos", "Capa por capa", "Plástico", "Diseño digital", "Fabricación"] },
            { word: "Tesla", hints: ["Coches eléctricos", "Elon Musk", "Autopilot", "Sin gasolina", "Moderno"] },
            { word: "Netflix", hints: ["Streaming", "Series y películas", "Suscripción", "Ver en casa", "Maratón"] },
            { word: "TikTok", hints: ["Vídeos cortos", "Red social", "Bailes", "Viral", "Jóvenes"] },
            { word: "YouTube", hints: ["Vídeos", "Google", "Creadores", "Tutoriales", "Suscribirse"] },
            { word: "Instagram", hints: ["Fotos", "Stories", "Filtros", "Influencers", "Meta"] },
            { word: "WhatsApp", hints: ["Mensajes", "Grupos", "Llamadas", "Verde", "Meta"] },
            { word: "WiFi", hints: ["Internet inalámbrico", "Contraseña", "Router", "Conexión", "Sin cables"] },
            { word: "USB", hints: ["Pendrive", "Almacenamiento", "Puerto", "Datos", "Se enchufa"] },
            { word: "GPS", hints: ["Navegación", "Satélite", "Ubicación", "Mapas", "No perderse"] },
            { word: "Laptop", hints: ["Ordenador portátil", "Pantalla y teclado", "Batería", "Trabajo", "Ligero"] },
            { word: "Tablet", hints: ["Pantalla táctil", "Entre móvil y PC", "iPad", "Leer y ver", "Portátil"] },
            { word: "Spotify", hints: ["Música", "Streaming", "Playlists", "Podcasts", "Verde"] },
            { word: "Amazon", hints: ["Compras online", "Envíos", "Jeff Bezos", "Prime", "Caja con sonrisa"] },
            { word: "PlayStation", hints: ["Consola", "Sony", "Videojuegos", "Mando", "PS5"] },
            { word: "Nintendo", hints: ["Videojuegos", "Mario", "Switch", "Japonés", "Pokémon"] },
            { word: "Alexa", hints: ["Asistente de voz", "Amazon", "Smart home", "Altavoz", "Preguntas"] },
            { word: "Cámara digital", hints: ["Fotos", "Sin rollo", "Memoria", "Megapíxeles", "Pantalla LCD"] },
            { word: "Auriculares inalámbricos", hints: ["Sin cables", "Bluetooth", "AirPods", "Música", "Oídos"] }
        ]
    },
    famosos: {
        name: "⭐ Famosos",
        words: [
            { word: "Messi", hints: ["Futbolista argentino", "El mejor del mundo", "Barcelona", "Inter Miami", "Pulga"] },
            { word: "Cristiano Ronaldo", hints: ["Futbolista portugués", "CR7", "Real Madrid", "Siuu", "Goleador"] },
            { word: "Taylor Swift", hints: ["Cantante americana", "Pop", "Eras Tour", "Swifties", "Rubia"] },
            { word: "Bad Bunny", hints: ["Reggaetón", "Puerto Rico", "Conejo malo", "Latin Grammy", "Gafas"] },
            { word: "Shakira", hints: ["Colombiana", "Las caderas no mienten", "Waka Waka", "Rubia", "Barranquilla"] },
            { word: "Elon Musk", hints: ["Tesla", "SpaceX", "Twitter/X", "El más rico", "Tecnología"] },
            { word: "Beyoncé", hints: ["Cantante", "Queen B", "Destiny's Child", "Single Ladies", "Jay-Z"] },
            { word: "Michael Jackson", hints: ["Rey del Pop", "Thriller", "Moonwalk", "Fallecido", "Guante blanco"] },
            { word: "Madonna", hints: ["Reina del Pop", "Material Girl", "Rubia", "Vogue", "Icónica"] },
            { word: "Ronaldinho", hints: ["Futbolista brasileño", "Sonrisa", "Barcelona", "Magia", "Joga bonito"] },
            { word: "Maradona", hints: ["Argentino", "Mano de Dios", "Nápoles", "Leyenda", "Fallecido"] },
            { word: "Rihanna", hints: ["Umbrella", "Barbados", "Fenty", "Cantante", "Super Bowl"] },
            { word: "Ed Sheeran", hints: ["Cantante británico", "Pelirrojo", "Shape of You", "Guitarra", "Baladas"] },
            { word: "Kim Kardashian", hints: ["Reality show", "Influencer", "Kanye West", "Instagram", "Familia famosa"] },
            { word: "LeBron James", hints: ["Baloncesto", "NBA", "Lakers", "El rey", "Cleveland"] },
            { word: "Serena Williams", hints: ["Tenis", "Americana", "Grand Slams", "Leyenda", "Hermana Venus"] },
            { word: "Usain Bolt", hints: ["El más rápido", "Jamaica", "100 metros", "Rayo", "Pose celebración"] },
            { word: "Roger Federer", hints: ["Tenis", "Suizo", "Elegante", "Wimbledon", "Leyenda"] },
            { word: "Adele", hints: ["Cantante británica", "Hello", "Voz potente", "Rolling in the Deep", "Baladas"] },
            { word: "Drake", hints: ["Rapero", "Canadiense", "God's Plan", "Toronto", "Hotline Bling"] }
        ]
    },
    objetos: {
        name: "🔧 Objetos",
        words: [
            { word: "Paraguas", hints: ["Protege de lluvia", "Se abre", "Tiene mango", "De tela", "Plegable"] },
            { word: "Reloj", hints: ["Da la hora", "En muñeca o pared", "Manecillas", "Segundos", "Despertador"] },
            { word: "Tijeras", hints: ["Para cortar", "Dos cuchillas", "Mango", "Papel", "Peluquería"] },
            { word: "Espejo", hints: ["Refleja imagen", "Cristal", "Verse", "Baño", "Retrovisor"] },
            { word: "Llave", hints: ["Abre puertas", "Metal", "Cerradura", "Llavero", "Casa"] },
            { word: "Gafas", hints: ["Ver mejor", "Cristales", "Montura", "Sol o graduadas", "En la cara"] },
            { word: "Lámpara", hints: ["Da luz", "Bombilla", "Mesa o techo", "Interruptor", "Decorativa"] },
            { word: "Silla", hints: ["Para sentarse", "4 patas", "Respaldo", "Madera o plástico", "Mesa"] },
            { word: "Mesa", hints: ["Superficie plana", "4 patas", "Comer o trabajar", "Madera", "Encima pones cosas"] },
            { word: "Cama", hints: ["Para dormir", "Colchón", "Sábanas", "Almohada", "Dormitorio"] },
            { word: "Televisión", hints: ["Ver programas", "Pantalla", "Mando", "Canales", "Entretenimiento"] },
            { word: "Nevera", hints: ["Enfriar comida", "Cocina", "Puerta", "Hielo", "Conservar"] },
            { word: "Lavadora", hints: ["Lavar ropa", "Tambor", "Detergente", "Centrifugado", "Electrodoméstico"] },
            { word: "Microondas", hints: ["Calentar comida", "Rápido", "Plato giratorio", "Pitido", "Cocina"] },
            { word: "Aspiradora", hints: ["Limpiar suelo", "Succiona polvo", "Bolsa", "Ruido", "Hogar"] },
            { word: "Cepillo de dientes", hints: ["Limpiar dientes", "Cerdas", "Pasta dental", "Baño", "Mañana y noche"] },
            { word: "Jabón", hints: ["Limpiar", "Espuma", "Olor", "Manos o cuerpo", "Barra o líquido"] },
            { word: "Toalla", hints: ["Secarse", "Tela absorbente", "Baño", "Playa", "Suave"] },
            { word: "Almohada", hints: ["Dormir", "Cabeza", "Suave", "Relleno", "Cama"] },
            { word: "Mochila", hints: ["Llevar cosas", "Espalda", "Correas", "Escuela", "Viaje"] },
            { word: "Billetera", hints: ["Guardar dinero", "Bolsillo", "Tarjetas", "Cuero", "DNI"] },
            { word: "Calcetines", hints: ["Pies", "Par", "Dentro de zapatos", "Algodón", "Tobillos"] },
            { word: "Bufanda", hints: ["Cuello", "Frío", "Lana", "Invierno", "Enrollar"] },
            { word: "Vela", hints: ["Luz", "Fuego", "Cera", "Mecha", "Cumpleaños"] },
            { word: "Globo", hints: ["Fiesta", "Aire o helio", "Colores", "Explotar", "Cumpleaños"] }
        ]
    }
};

// Exportar base de datos procesada
export const WORD_DATABASE = {};
for (const [key, category] of Object.entries(WORDS_WITH_HINTS)) {
    WORD_DATABASE[key] = {
        name: category.name,
        words: category.words.map(w => w.word),
        hints: category.words.map(w => w.hints)
    };
}

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
    
    // Seleccionar una pista aleatoria de las disponibles para esta palabra
    const hints = category.hints[wordIndex];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    return {
        word: category.words[wordIndex],
        hint: randomHint,
        categoryName: category.name
    };
}
