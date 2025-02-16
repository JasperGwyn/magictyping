export const COLORS = {
    NEGRO: '#000000',
    BLANCO: '#FFFFFF',
    ROJO: '#FF0000',
    VERDE: '#00FF00',
    AZUL: '#0000FF',
    AMARILLO: '#FFFF00',
    MEÑIQUE_IZQ: '#FF69B4',  // Rosa
    ANULAR_IZQ: '#4B0082',   // Índigo
    MEDIO_IZQ: '#9400D3',    // Violeta
    INDICE_IZQ: '#0000FF',   // Azul
    PULGAR_IZQ: '#FFFFFF',   // Blanco
    INDICE_DER: '#00FF00',   // Verde
    MEDIO_DER: '#FFFF00',    // Amarillo
    ANULAR_DER: '#FFA500',   // Naranja
    MEÑIQUE_DER: '#FF0000'   // Rojo
};

export const TECLAS_POR_DEDO = {
    MEÑIQUE_IZQ: ['Q', 'A', 'Z'],
    ANULAR_IZQ: ['W', 'S', 'X'],
    MEDIO_IZQ: ['E', 'D', 'C'],
    INDICE_IZQ: ['R', 'F', 'V'],
    PULGAR_IZQ: [' '],
    INDICE_DER: ['Y', 'H', 'N'],
    MEDIO_DER: ['U', 'J', 'M'],
    ANULAR_DER: ['I', 'K'],
    MEÑIQUE_DER: ['O', 'L', 'P', 'Ñ']
};

export const PALABRAS_POR_NIVEL = {
    1: {  // Nivel 1: Solo Dedos índices (posición base)
        palabras: ['JU', 'FU', 'RYU','VU','TU', 'GY','MU','MY','JUR','FUR','RYU','JUR','BU','BY','HY','HV'],
        descripcion: 'POSICIÓN BASE - SOLO DEDOS ÍNDICES (F Y J)'
    },
    2: {  // Nivel 2: Solo Dedos medios
        palabras: ['DEDI', 'KIKE', 'DICE','DIKE','DECE','KEKE','KIKI','IKE','CEDEC'],
        descripcion: 'SOLO DEDOS MEDIOS (D Y K)'
    },
    3: {  // Nivel 3: Solo Dedos anulares
        palabras: ['SOL', 'LOS', 'SOX','WOS','SOS','XOXO'],
        descripcion: 'SOLO DEDOS ANULARES (S Y L)'
    },
    4: {  // Nivel 4: Solo Dedos meñiques
        palabras: ['PAZ',  'PAQA','ZAP', 'PAQ','ÑAZ','QAPA','ÑAÑA','QAP'],
        descripcion: 'SOLO DEDOS MEÑIQUES (Q Y P)'
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
    VELOCIDAD_BASE: 30,        // Velocidad inicial de caída
    FRECUENCIA_SPAWN: 4000,     // Tiempo entre palabras en milisegundos
    INCREMENTO_VELOCIDAD: 1.1,  // Multiplicador de velocidad por nivel
    INCREMENTO_FRECUENCIA: 1.5, // Multiplicador de frecuencia por nivel
    PALABRAS_POR_NIVEL: 5,      // Cantidad de palabras para pasar de nivel
    PUNTOS_POR_LETRA: 10        // Puntos base por cada letra correcta
};

export const SCREEN_CONFIG = {
    WIDTH: 800,
    HEIGHT: 600
}; 
