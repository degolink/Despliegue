/**
 * Banco de preguntas del Test de Personalidad del Coleccionista para el cliente React.
 * Compatible con la definición de servidor en server/src/data/quizQuestions.js.
 */
import { Sparkles, Target, Compass, Award, DollarSign, Shield, Flame, BookOpen, Layers } from 'lucide-react';

export const DIMENSION_WEIGHTS = {
  universos: 0.25,
  categorias: 0.25,
  personajes: 0.15,
  eventos: 0.15,
  nostalgia: 0.10,
  rareza: 0.10,
};

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    dimension: 'universos',
    pregunta: '¿Cuál de estos mundos ficticios te despierta una mayor fascinación por explorar?',
    subtitulo: 'Selecciona el universo que resuene con tu imaginación.',
    opciones: [
      {
        id: '1a',
        texto: 'La galaxia lejana, la Fuerza y la Orden Jedi',
        franquicia: 'Star Wars',
        universo: 'Sci-Fi Espacial',
        categoria: 'Figuras de Acción',
      },
      {
        id: '1b',
        texto: 'El mundo de criaturas fantásticas, entrenadores y medallas de gimnasio',
        franquicia: 'Pokémon',
        universo: 'Monstruos y Aventuras',
        categoria: 'Cartas TCG',
      },
      {
        id: '1c',
        texto: 'Guerra cibernética entre robots alienígenas que se transforman',
        franquicia: 'Transformers',
        universo: 'Meca y Robótica',
        categoria: 'Figuras de Acción',
      },
      {
        id: '1d',
        texto: 'Reinos de fantasía heroica, hechicería y espadas legendarias',
        franquicia: 'Masters of the Universe',
        universo: 'Fantasía Épica',
        categoria: 'Figuras de Acción',
      },
    ],
  },
  {
    id: 2,
    dimension: 'categorias',
    pregunta: 'Cuando imaginas tu vitrina ideal, ¿qué tipo de pieza es la pieza central?',
    subtitulo: 'El formato que define tu devoción como coleccionista.',
    opciones: [
      {
        id: '2a',
        texto: 'Figuras de acción articuladas con armas y accesorios originales',
        categoria: 'Figuras de Acción',
      },
      {
        id: '2b',
        texto: 'Cartas coleccionables holográficas protegidas en cápsulas graduadas',
        categoria: 'Cartas TCG',
      },
      {
        id: '2c',
        texto: 'Cartuchos y consolas de videojuegos retro en su caja original',
        categoria: 'Videojuegos Retro',
      },
      {
        id: '2d',
        texto: 'Ejemplares de cómics históricos o memorabilia icónica de época',
        categoria: 'Cómics',
      },
    ],
  },
  {
    id: 3,
    dimension: 'personajes',
    pregunta: '¿Qué tipo de personaje te resulta más magnético y digno de ser exhibido?',
    subtitulo: 'La psicología y presencia de los protagonistas de tu colección.',
    opciones: [
      {
        id: '3a',
        texto: 'El héroe noble con brújula moral inquebrantable (ej. Superman, Optimus Prime, Luke)',
        arquetipo: 'Héroe Legendario',
      },
      {
        id: '3b',
        texto: 'El villano imponente, temible y de silueta inconfundible (ej. Darth Vader, Megatron, Skeletor)',
        arquetipo: 'Villano Icónico',
      },
      {
        id: '3c',
        texto: 'El vigilante nocturno o antihéroe solitario (ej. Batman, Wolverine, Snake Eyes)',
        arquetipo: 'Antihéroe',
      },
      {
        id: '3d',
        texto: 'Criaturas míticas, dragones o compañeros leales (ej. Charizard, R2-D2, Yoshi)',
        arquetipo: 'Criatura / Compañero',
      },
    ],
  },
  {
    id: 4,
    dimension: 'eventos',
    pregunta: '¿Qué momento histórico o narrativo te produce mayor impacto emocional?',
    subtitulo: 'Las escenas y giros que consagraron a las leyendas.',
    opciones: [
      {
        id: '4a',
        texto: 'La primera aparición y debut de un mito viviente (un primer número o primera edición)',
        evento: 'Debut Histórico',
        categoria: 'Cómics',
      },
      {
        id: '4b',
        texto: 'El enfrentamiento climático a duelo entre el bien y el mal absoluto',
        evento: 'Duelo Legendario',
        categoria: 'Figuras de Acción',
      },
      {
        id: '4c',
        texto: 'La primera vez que encendiste una pantalla y completaste un mapa laberíntico',
        evento: 'Aventura Interactiva',
        categoria: 'Videojuegos Retro',
      },
      {
        id: '4d',
        texto: 'Abrir un sobre y ver el destello holográfico de una carta legendaria',
        evento: 'Momento Revelación',
        categoria: 'Cartas TCG',
      },
    ],
  },
  {
    id: 5,
    dimension: 'universos',
    pregunta: 'En cuanto al mundo de los cómics y novelas gráficas, ¿cuál es tu panteón preferido?',
    subtitulo: 'Los cimientos del noveno arte.',
    opciones: [
      {
        id: '5a',
        texto: 'DC Comics: Arquetipos mitológicos, Gotham City y Metropolis',
        franquicia: 'DC Comics',
        categoria: 'Cómics',
      },
      {
        id: '5b',
        texto: 'Marvel Comics: Mutantes, héroes con fallas humanas y la era de Stan Lee y Jack Kirby',
        franquicia: 'Marvel Comics',
        categoria: 'Cómics',
      },
      {
        id: '5c',
        texto: 'Manga japonés y franquicias niponas de monstruos y batallas',
        franquicia: 'Pokémon',
        categoria: 'Cartas TCG',
      },
      {
        id: '5d',
        texto: 'Prefiero universos de ciencia ficción y animación ochentera sobre cómics tradicionales',
        franquicia: 'Transformers',
        categoria: 'Figuras de Acción',
      },
    ],
  },
  {
    id: 6,
    dimension: 'categorias',
    pregunta: '¿Cómo prefieres que se conserve y exhiba un objeto de colección?',
    subtitulo: 'La estética del coleccionismo según su presentación.',
    opciones: [
      {
        id: '6a',
        texto: 'Sellado de fábrica en su blister original o empaque sin abrir (MISB)',
        motivacion: 'Sellado y Preservación',
      },
      {
        id: '6b',
        texto: 'Graduado profesionalmente con puntuación certificada (PSA, AFA, Wata)',
        motivacion: 'Graduación y Certificación',
      },
      {
        id: '6c',
        texto: 'Pieza suelta completa en estado impecable para admirar cada detalle 360°',
        motivacion: 'Exhibición y Apreciación',
      },
      {
        id: '6d',
        texto: 'Objetos funcionales o piezas de tecnología histórica que aún pueden encenderse',
        motivacion: 'Historia Viva',
        categoria: 'Videojuegos Retro',
      },
    ],
  },
  {
    id: 7,
    dimension: 'nostalgia',
    pregunta: '¿Qué atmósfera estética te cautiva con mayor intensidad?',
    subtitulo: 'La identidad visual y artística de tus recuerdos y gustos.',
    opciones: [
      {
        id: '7a',
        texto: 'Estética espacial clásica de los 70s: naves analógicas, maquetas y cromo',
        nostalgia: 'Sci-Fi 70s',
        franquicia: 'Star Wars',
      },
      {
        id: '7b',
        texto: 'Estética enérgica de los 80s: síntesis de neón, cajas ilustradas y fantasía bárbara',
        nostalgia: 'Ochentas Pop',
        franquicia: 'Transformers',
      },
      {
        id: '7c',
        texto: 'Fiebre de los 90s: sprites de 16-bit, fiebre Pokémon y cartas holográficas',
        nostalgia: 'Noventas Dorado',
        franquicia: 'Pokémon',
      },
      {
        id: '7d',
        texto: 'Elegancia de mediados de siglo XX: ilustración de la Edad de Oro y cromo vintage',
        nostalgia: 'Vintage Clásico',
        franquicia: 'DC Comics',
      },
    ],
  },
  {
    id: 8,
    dimension: 'personajes',
    pregunta: 'Si pudieras rescatar un vehículo legendario a escala para tu hangar personal, ¿cuál sería?',
    subtitulo: 'La ingeniería y diseño que trasciende la pantalla.',
    opciones: [
      {
        id: '8a',
        texto: 'El Halcón Milenario o un caza X-Wing de Star Wars',
        categoria: 'Vehículos y Naves',
        franquicia: 'Star Wars',
      },
      {
        id: '8b',
        texto: 'Una nave de exploración intergaláctica LEGO Classic Space',
        categoria: 'Sets de Construcción',
        franquicia: 'LEGO',
      },
      {
        id: '8c',
        texto: 'Un camión semirremolque que oculta al líder de los Autobots',
        categoria: 'Figuras de Acción',
        franquicia: 'Transformers',
      },
      {
        id: '8d',
        texto: 'Un Custom Camaro Redline original de 1968 de Hot Wheels',
        categoria: 'Vehículos a Escala',
        franquicia: 'Hot Wheels',
      },
    ],
  },
  {
    id: 9,
    dimension: 'universos',
    pregunta: '¿Cuál es tu relación con los videojuegos clásicos y su legado cultural?',
    subtitulo: 'El arte interactivo que definió a nuestra generación.',
    opciones: [
      {
        id: '9a',
        texto: 'Nintendo es mi templo: la música de Koji Kondo, cartuchos dorados y el Game Boy gris',
        franquicia: 'Nintendo',
        categoria: 'Videojuegos Retro',
      },
      {
        id: '9b',
        texto: 'Sega y la velocidad rebelde de Sonic en cartucho negro Mega Drive',
        franquicia: 'Sega',
        categoria: 'Videojuegos Retro',
      },
      {
        id: '9c',
        texto: 'Los orígenes de la industria en la sala de estar: Atari 2600 y paneles de madera',
        franquicia: 'Atari',
        categoria: 'Videojuegos Retro',
      },
      {
        id: '9d',
        texto: 'Prefiero coleccionables de mesa físicos (cartas o figuras) antes que consolas de pantalla',
        categoria: 'Cartas TCG',
      },
    ],
  },
  {
    id: 10,
    dimension: 'rareza',
    pregunta: '¿Cuál es tu principal motivación al adquirir un coleccionable de alto valor?',
    subtitulo: 'El valor íntimo que le das a cada tesoro.',
    opciones: [
      {
        id: '10a',
        texto: 'Preservar un trozo tangible de historia cultural que cambió el mundo',
        motivacion: 'Patrimonio Cultural',
      },
      {
        id: '10b',
        texto: 'Poseer el "Santo Grial" que pocos han visto en persona (tiradas ínfimas o errores célebres)',
        motivacion: 'Búsqueda del Grial',
      },
      {
        id: '10c',
        texto: 'La belleza del diseño industrial de juguetes, esculpido y empaque de época',
        motivacion: 'Apreciación Estética',
      },
      {
        id: '10d',
        texto: 'Inversión patrimonial con alta demanda y certificación reconocida internacionalmente',
        motivacion: 'Valor de Inversión',
      },
    ],
  },
  {
    id: 11,
    dimension: 'universos',
    pregunta: 'Entre los pioneros de la ciencia ficción galáctica, ¿qué elemento te emociona más?',
    subtitulo: 'La épica de las estrellas.',
    opciones: [
      {
        id: '11a',
        texto: 'El sable de luz, el zumbido de la empuñadura y la mitología de la Fuerza',
        franquicia: 'Star Wars',
        categoria: 'Figuras de Acción',
      },
      {
        id: '11b',
        texto: 'Droides con personalidad propia capaces de salvar toda una misión',
        franquicia: 'Star Wars',
        categoria: 'Figuras de Acción',
      },
      {
        id: '11c',
        texto: 'El diseño arquitectónico de bases espaciales y vehículos modulares con astronautas',
        franquicia: 'LEGO',
        categoria: 'Sets de Construcción',
      },
      {
        id: '11d',
        texto: 'Naves espaciales con sonidos mecánicos y detalles de combate realistas',
        franquicia: 'Star Wars',
        categoria: 'Vehículos y Naves',
      },
    ],
  },
  {
    id: 12,
    dimension: 'categorias',
    pregunta: 'En el universo de cartas coleccionables (TCG), ¿qué joya representa el pináculo?',
    subtitulo: 'El cartón más codiciado del planeta.',
    opciones: [
      {
        id: '12a',
        texto: 'El Charizard 1st Edition Base Set con su fuego implacable',
        franquicia: 'Pokémon',
        categoria: 'Cartas TCG',
      },
      {
        id: '12b',
        texto: 'El mítico Black Lotus de Magic: The Gathering (Alpha 1993)',
        franquicia: 'Magic: The Gathering',
        categoria: 'Cartas TCG',
      },
      {
        id: '12c',
        texto: 'Cartas de concursos japoneses ultra-escasas (como Pikachu Illustrator)',
        franquicia: 'Pokémon',
        categoria: 'Cartas TCG',
      },
      {
        id: '12d',
        texto: 'Cromos fundacionales de leyendas del deporte de la posguerra (Topps 1952)',
        franquicia: 'Topps Baseball',
        categoria: 'Cartas Deportivas',
      },
    ],
  },
  {
    id: 13,
    dimension: 'personajes',
    pregunta: '¿Cuál de estos superhéroes de la Edad de Oro o Plata admiras más?',
    subtitulo: 'Los titanes que dieron origen al género.',
    opciones: [
      {
        id: '13a',
        texto: 'Superman levantando el automóvil verde en Action Comics #1',
        franquicia: 'DC Comics',
        categoria: 'Cómics',
      },
      {
        id: '13b',
        texto: 'Batman acechando desde las cornisas en Detective Comics #27',
        franquicia: 'DC Comics',
        categoria: 'Cómics',
      },
      {
        id: '13c',
        texto: 'Spider-Man balanceándose por primera vez en Amazing Fantasy #15',
        franquicia: 'Marvel Comics',
        categoria: 'Cómics',
      },
      {
        id: '13d',
        texto: 'Wolverine desatando sus garras de adamantium en The Incredible Hulk #181',
        franquicia: 'Marvel Comics',
        categoria: 'Cómics',
      },
    ],
  },
  {
    id: 14,
    dimension: 'eventos',
    pregunta: '¿Qué tipo de rivalidad ficticia te parece insuperable?',
    subtitulo: 'El choque de voluntades épico.',
    opciones: [
      {
        id: '14a',
        texto: 'Optimus Prime contra Megatron por el destino de Cybertron',
        franquicia: 'Transformers',
        categoria: 'Figuras de Acción',
      },
      {
        id: '14b',
        texto: 'He-Man defendiendo el Castillo Grayskull frente a Skeletor',
        franquicia: 'Masters of the Universe',
        categoria: 'Figuras de Acción',
      },
      {
        id: '14c',
        texto: 'Batman enfrentando la mente retorcida del Joker',
        franquicia: 'DC Comics',
        categoria: 'Cómics',
      },
      {
        id: '14d',
        texto: 'Los X-Men luchando por la coexistencia en Días del Futuro Pasado',
        franquicia: 'Marvel Comics',
        categoria: 'Cómics',
      },
    ],
  },
  {
    id: 15,
    dimension: 'nostalgia',
    pregunta: '¿Qué sensación de juego físico te transporta instantáneamente al asombro?',
    subtitulo: 'El contacto táctil con la creatividad.',
    opciones: [
      {
        id: '15a',
        texto: 'El "click" perfecto de los bloques de construcción LEGO y sus minifiguras',
        franquicia: 'LEGO',
        categoria: 'Sets de Construcción',
      },
      {
        id: '15b',
        texto: 'La transformación paso a paso de un robot que se convierte en vehículo de combate',
        franquicia: 'Transformers',
        categoria: 'Figuras de Acción',
      },
      {
        id: '15c',
        texto: 'La textura metálica pesada de un auto a escala deslizándose por la pista',
        franquicia: 'Hot Wheels',
        categoria: 'Vehículos a Escala',
      },
      {
        id: '15d',
        texto: 'Cuidar una diminuta mascota virtual que pita en tu llavero',
        franquicia: 'Tamagotchi',
        categoria: 'Memorabilia',
      },
    ],
  },
  {
    id: 16,
    dimension: 'universos',
    pregunta: 'En cuanto a la cultura de muñecas y moda icónica en el coleccionismo:',
    subtitulo: 'Los iconos que transformaron el diseño global.',
    opciones: [
      {
        id: '16a',
        texto: 'Barbie original de 1959 con su traje de baño rayado y peinado sofisticado',
        franquicia: 'Barbie',
        categoria: 'Muñecas',
      },
      {
        id: '16b',
        texto: 'G.I. Joe de 12 pulgadas de 1964 que inauguró la era de la figura de acción militar',
        franquicia: 'G.I. Joe',
        categoria: 'Figuras de Acción',
      },
      {
        id: '16c',
        texto: 'El reloj original de Mickey Mouse de 1933 que salvó a una compañía de relojería',
        franquicia: 'Disney',
        categoria: 'Memorabilia',
      },
      {
        id: '16d',
        texto: 'Prefiero enfocarme exclusivamente en figuras de superhéroes y robots de acción',
        categoria: 'Figuras de Acción',
      },
    ],
  },
  {
    id: 17,
    dimension: 'rareza',
    pregunta: 'Frente a dos piezas equivalentes, ¿cuál atrae más tu atención?',
    subtitulo: 'El dilema de pureza del coleccionista.',
    opciones: [
      {
        id: '17a',
        texto: 'El primer tiraje con una variante de fábrica o error de impresión nunca repetido',
        motivacion: 'Variantes de Tirada',
      },
      {
        id: '17b',
        texto: 'La edición impecable con grado numérico casi perfecto (ej. 9.2 o PSA 9)',
        motivacion: 'Estado de Grado',
      },
      {
        id: '17c',
        texto: 'La pieza que viene con toda su documentación de procedencia y caja original',
        motivacion: 'Completismo Histórico',
      },
      {
        id: '17d',
        texto: 'Una reimpresión conmemorativa oficial de aniversario a precio accesible',
        motivacion: 'Tributo Accesible',
      },
    ],
  },
  {
    id: 18,
    dimension: 'eventos',
    pregunta: '¿Cuál de estos hitos de la industria del entretenimiento te despierta mayor respeto?',
    subtitulo: 'Momentos en que la cultura pop cambió para siempre.',
    opciones: [
      {
        id: '18a',
        texto: 'El rescate del mercado de videojuegos en 1985 con el lanzamiento norteamericano del NES',
        franquicia: 'Nintendo',
        categoria: 'Videojuegos Retro',
      },
      {
        id: '18b',
        texto: 'El fenómeno de merchandising masivo de Star Wars que inventó el cine moderno en 1977',
        franquicia: 'Star Wars',
        categoria: 'Figuras de Acción',
      },
      {
        id: '18c',
        texto: 'La revolución de las cartas coleccionables desatada en 1993 y expandida globalmente en 1999',
        franquicia: 'Pokémon',
        categoria: 'Cartas TCG',
      },
      {
        id: '18d',
        texto: 'El nacimiento del cómic de superhéroes en los albores de la Segunda Guerra Mundial',
        franquicia: 'Marvel Comics',
        categoria: 'Cómics',
      },
    ],
  },
  {
    id: 19,
    dimension: 'categorias',
    pregunta: 'Respecto al rango de inversión económica que consideras para tu colección:',
    subtitulo: 'La escala en la que construyes tu legado.',
    opciones: [
      {
        id: '19a',
        texto: 'Piezas accesibles y significativas entre $40 y $150 USD para enriquecer el expositor',
        presupuesto_min: 40,
        presupuesto_max: 150,
      },
      {
        id: '19b',
        texto: 'Tesoros de gama media entre $150 y $400 USD con alta calidad histórica y empaque',
        presupuesto_min: 150,
        presupuesto_max: 400,
      },
      {
        id: '19c',
        texto: 'Joyas mayores entre $400 y $800 USD con alta graduación o escasez notable',
        presupuesto_min: 400,
        presupuesto_max: 800,
      },
      {
        id: '19d',
        texto: 'Griales de museo de más de $800 USD (Action Comics #1, Black Lotus, Pikachu Illustrator)',
        presupuesto_min: 800,
        presupuesto_max: 3000,
      },
    ],
  },
  {
    id: 20,
    dimension: 'motivacion',
    pregunta: 'Finalmente, al contemplar tu colección, ¿qué frase resume mejor tu filosofía?',
    subtitulo: 'La identidad del verdadero guardián de reliquias.',
    opciones: [
      {
        id: '20a',
        texto: '"Soy un custodio del tiempo: preservo las historias y creaciones que nos hicieron soñar."',
        perfilTitulo: 'Guardián del Archivo Histórico',
      },
      {
        id: '20b',
        texto: '"Persigo lo inalcanzable: la rareza absoluta y la cumbre del coleccionismo."',
        perfilTitulo: 'Cazador de Griales Míticos',
      },
      {
        id: '20c',
        texto: '"Colecciono por nostalgia pura: cada pieza es un portal vivo a momentos que no olvido."',
        perfilTitulo: 'Nostálgico de la Época Dorada',
      },
      {
        id: '20d',
        texto: '"Valoro el arte del diseño, la escultura física y la ingeniería de los creadores."',
        perfilTitulo: 'Connoisseur de Escultura y Diseño',
      },
    ],
  },
];

