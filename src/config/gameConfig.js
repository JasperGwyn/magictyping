console.log('=== Debug Variables de Entorno ===');
console.log('process.env.VELOCIDAD_BASE:', process.env.VELOCIDAD_BASE);
console.log('process.env.FRECUENCIA_SPAWN:', process.env.FRECUENCIA_SPAWN);
console.log('process.env.INCREMENTO_VELOCIDAD:', process.env.INCREMENTO_VELOCIDAD);
console.log('process.env.INCREMENTO_FRECUENCIA:', process.env.INCREMENTO_FRECUENCIA);
console.log('process.env.PALABRAS_POR_NIVEL:', process.env.PALABRAS_POR_NIVEL);
console.log('process.env.PUNTOS_POR_LETRA:', process.env.PUNTOS_POR_LETRA);

export const PALABRAS_POR_NIVEL = {
    1: {  // Nivel 1: Solo Dedos índices (posición base)
        palabras: ['JU', 'FU', 'RYU','VU','TU', 'GY','MU','MY','JUR','FUR','RYU','JUR','BU','BY','HY','HV'],
        descripcion: 'POSICIÓN BASE - SOLO DEDOS ÍNDICES'
    },
    2: {  // Nivel 2: Solo Dedos medios
        palabras: ['DEDI', 'KIKE', 'DICE','DIKE','DECE','KEKE','KIKI','IKE','CEDEC'],
        descripcion: 'SOLO DEDOS MEDIOS'
    },
    3: {  // Nivel 3: Solo Dedos anulares
        palabras: ['SOL', 'LOS', 'SOX','WOS','SOS','XOXO'],
        descripcion: 'SOLO DEDOS ANULARES'
    },
    4: {  // Nivel 4: Solo Dedos meñiques
        palabras: ['PAZ',  'PAQA','ZAP', 'PAQ','ÑAZ','QAPA','ÑAÑA','QAP'],
        descripcion: 'SOLO DEDOS MEÑIQUES'
    },
    5: {  // Nivel 5: Combinaciones índices y medios
        palabras: ['JUNTE', 'VERDE', 'TIENE', 'MENTE', 'VIENE', 'DICE', 'JEFE', 'MIDE', 'RINDE', 'CINE'],
        descripcion: 'COMBINANDO DEDOS ÍNDICES Y MEDIOS'
    },
    6: {  // Nivel 6: Combinaciones índices, medios y anulares
        palabras: ['SENDERO', 'VENTILE', 'CLIENTE', 'SILENCIO', 'DESTINO', 'VECINOS', 'SEMILLA', 'DECIRLE', 'SERVIR', 'MIELES'],
        descripcion: 'COMBINANDO DEDOS ÍNDICES, MEDIOS Y ANULARES'
    },
    7: {  // Nivel 7: Todos los dedos - Palabras mágicas
        palabras: ['MAGIA', 'POCION', 'VARITA', 'HECHIZO', 'MISTICA', 'CONJURO', 'MAGICO', 'PORTAL', 'BRUJA', 'WIZARD'],
        descripcion: 'USANDO TODOS LOS DEDOS - ¡PALABRAS MÁGICAS!'
    }
};

export const GAME_CONFIG = {
    VIDAS_INICIALES: 3,
    VELOCIDAD_BASE: parseInt(process.env.VELOCIDAD_BASE),
    FRECUENCIA_SPAWN: parseInt(process.env.FRECUENCIA_SPAWN),
    INCREMENTO_VELOCIDAD: parseFloat(process.env.INCREMENTO_VELOCIDAD),
    INCREMENTO_FRECUENCIA: parseFloat(process.env.INCREMENTO_FRECUENCIA),
    PALABRAS_POR_NIVEL: parseInt(process.env.PALABRAS_POR_NIVEL),
    PUNTOS_POR_LETRA: parseInt(process.env.PUNTOS_POR_LETRA)
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
