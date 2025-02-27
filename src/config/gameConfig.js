console.log('=== Debug Variables de Entorno ===');
console.log('process.env.VELOCIDAD_BASE:', process.env.VELOCIDAD_BASE);
console.log('process.env.FRECUENCIA_SPAWN:', process.env.FRECUENCIA_SPAWN);
console.log('process.env.INCREMENTO_VELOCIDAD:', process.env.INCREMENTO_VELOCIDAD);
console.log('process.env.INCREMENTO_FRECUENCIA:', process.env.INCREMENTO_FRECUENCIA);
console.log('process.env.PALABRAS_POR_NIVEL:', process.env.PALABRAS_POR_NIVEL);
console.log('process.env.PUNTOS_POR_LETRA:', process.env.PUNTOS_POR_LETRA);

export const GAME_CONFIG = {
    // Configuración del jugador
    VIDAS_INICIALES: 3,
    
    // Velocidad y dificultad
    VELOCIDAD_BASE: parseInt(process.env.VELOCIDAD_BASE) || 30,
    FRECUENCIA_SPAWN: parseInt(process.env.FRECUENCIA_SPAWN) || 2000,
    INCREMENTO_VELOCIDAD: parseFloat(process.env.INCREMENTO_VELOCIDAD) || 1.2,
    INCREMENTO_FRECUENCIA: parseFloat(process.env.INCREMENTO_FRECUENCIA) || 1.1,
    
    // Progresión y puntuación
    PALABRAS_POR_NIVEL: parseInt(process.env.PALABRAS_POR_NIVEL) || 10,
    PUNTOS_POR_LETRA: parseInt(process.env.PUNTOS_POR_LETRA) || 10
};

export const SCREEN_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600
};

export const DIFICULTADES = {
    APRENDIZ: {
        nombre: 'ESTUDIANTE DE MAGIA',
        descripcion: 'Primeros pasos en el arte de la magia',
        multiplicador: 0.7
    },
    MAGO: {
        nombre: 'HECHICERO EXPERTO',
        descripcion: 'Dominio avanzado de los hechizos',
        multiplicador: 1.0
    },
    ENCANTADOR: {
        nombre: 'ARCHIMAGO SUPREMO',
        descripcion: 'Maestría total de las artes místicas',
        multiplicador: 1.3
    }
}; 
