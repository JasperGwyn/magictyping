import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import ResultsScene from './scenes/ResultsScene';
import IntroScene from './scenes/IntroScene';
import InstructionsScene from './scenes/InstructionsScene';
import LoadingScene from './scenes/LoadingScene';
import DifficultyScene from './scenes/DifficultyScene';
import PlayerCustomizationScene from './scenes/PlayerCustomizationScene';
import TitleScene from './scenes/TitleScene';
import { SCREEN_CONFIG } from './config/gameConfig';
import i18n from './services/localization';

// Fallback translations for critical UI elements
const fallbackTranslations = {
    en: {
        metadata: {
            language: "en",
            displayName: "English",
            direction: "ltr"
        },
        common: {
            buttons: {
                continue: "CONTINUE",
                back: "BACK",
                confirm: "CONFIRM",
                pressSpace: "PRESS SPACE",
                pressEnter: "PRESS ENTER"
            }
        },
        scenes: {
            title: {
                pressStart: "PRESS SPACE TO START"
            },
            playerCustomization: {
                title: "CUSTOMIZE YOUR CHARACTER!",
                enterName: "ENTER YOUR NAME:",
                chooseCharacter: "CHOOSE YOUR CHARACTER: (← →)",
                continue: "PRESS ENTER TO CONTINUE"
            },
            // Minimal set of essential translations
            intro: {
                greetings: "HELLO! I'M {nombre}",
                desire: "I WANT TO MASTER MAGIC",
                challenge: "BUT FIRST I MUST LEARN TO TYPE!",
                request: "WILL YOU HELP ME?",
                pressSpace: "PRESS SPACE"
            },
            // Agregar datos de nivel para el fallback
            game: {
                instructions: "Type the falling letters and words\nand then press ENTER",
                score: "Score: {score}",
                level: "Level: {level}",
                levels: {
                    "1": {
                        "description": "HOME POSITION - INDEX FINGERS ONLY",
                        "words": ["F", "J", "R", "U", "T", "G", "V", "B", "Y", "H", "N", "M"]
                    },
                    "2": {
                        "description": "MIDDLE FINGERS ONLY",
                        "words": ["D", "E", "I", "K", "C"]
                    },
                    "3": {
                        "description": "RING FINGERS ONLY",
                        "words": ["S", "L", "W", "O", "X"]
                    }
                }
            }
        }
    },
    es: {
        metadata: {
            language: "es",
            displayName: "Español",
            direction: "ltr"
        },
        common: {
            buttons: {
                continue: "CONTINUAR",
                back: "VOLVER",
                confirm: "CONFIRMAR",
                pressSpace: "PRESIONA ESPACIO",
                pressEnter: "PRESIONA ENTER"
            }
        },
        scenes: {
            title: {
                pressStart: "PRESIONA ESPACIO PARA COMENZAR"
            },
            playerCustomization: {
                title: "¡PERSONALIZA TU PERSONAJE!",
                enterName: "INGRESA TU NOMBRE:",
                chooseCharacter: "ELIGE TU PERSONAJE: (← →)",
                continue: "PRESIONA ENTER PARA CONTINUAR"
            },
            // Minimal set of essential translations
            intro: {
                greetings: "¡HOLA! SOY {nombre}",
                desire: "QUIERO DOMINAR LA MAGIA",
                challenge: "¡PERO PRIMERO DEBO APRENDER A TIPEAR!",
                request: "¿ME AYUDAS?",
                pressSpace: "PRESIONA ESPACIO"
            },
            // Agregar datos de nivel para el fallback
            game: {
                instructions: "Escribí las letras y palabras que van cayendo\ny luego apretá ENTER",
                score: "Puntuación: {score}",
                level: "Nivel: {level}",
                levels: {
                    "1": {
                        "description": "POSICIÓN BASE - SOLO DEDOS ÍNDICES",
                        "words": ["F", "J", "R", "U", "T", "G", "V", "B", "Y", "H", "N", "M"]
                    },
                    "2": {
                        "description": "SOLO DEDOS MEDIOS",
                        "words": ["D", "E", "I", "K", "C"]
                    },
                    "3": {
                        "description": "SOLO DEDOS ANULARES",
                        "words": ["S", "L", "W", "O", "X"]
                    }
                }
            }
        }
    }
};

// Configuración global del juego
const config = {
    type: Phaser.AUTO,
    width: SCREEN_CONFIG.WIDTH,
    height: SCREEN_CONFIG.HEIGHT,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: process.env.NODE_ENV === 'development'
        }
    },
    render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true
    },
    scene: [
        LoadingScene,              // 0. Escena de carga PRIMERO
        TitleScene,                // 1. Pantalla de título inicial
        PlayerCustomizationScene,  // 2. Personalización del personaje
        IntroScene,                // 3. Introducción
        DifficultyScene,           // 4. Selección de dificultad
        InstructionsScene,         // 5. Instrucciones
        GameScene,                 // 6. Gameplay
        ResultsScene,              // 7. Resultados
    ]
};

// Si hay una escena inicial especificada en las variables de entorno, usarla
if (process.env.START_SCENE) {
    const sceneMap = {
        'loading': LoadingScene,    // Agregamos loading al mapa
        'title': TitleScene,
        'player-customization': PlayerCustomizationScene,
        'intro': IntroScene,
        'difficulty': DifficultyScene,
        'instructions': InstructionsScene,
        'game': GameScene,
        'results': ResultsScene
    };
    
    // Reorganizar las escenas para poner la escena inicial primero, pero mantener LoadingScene siempre
    const startScene = sceneMap[process.env.START_SCENE];
    if (startScene && startScene !== LoadingScene) {
        config.scene = [
            LoadingScene, // Siempre mantener LoadingScene primero
            startScene,
            ...Object.values(sceneMap).filter(scene => scene !== startScene && scene !== LoadingScene)
        ];
    }

    console.log('Escena inicial:', process.env.START_SCENE);
}

// Inicializar el servicio de localización
console.log('[index] Iniciando carga del servicio de localización');
i18n.initialize().then(() => {
    console.log(`[index] Idioma cargado: ${i18n.currentLanguage}`);
    console.log('[index] Estado de traducciones:', {
        idiomaCargado: i18n.currentLanguage,
        idiomasDisponibles: Object.keys(i18n.translations),
        traduccionesCargadas: i18n.isLoaded
    });
    
    // Verificar los niveles de juego y las palabras para nivel 1
    try {
        const i18nData = i18n.translations[i18n.currentLanguage];
        if (i18nData?.scenes?.game?.levels) {
            console.log(`[LETRAS:INIT] Niveles de juego disponibles:`, Object.keys(i18nData.scenes.game.levels));
            
            // Verificar específicamente nivel 1
            if (i18nData.scenes.game.levels['1']?.words) {
                const level1Words = i18nData.scenes.game.levels['1'].words;
                console.log(`[LETRAS:INIT] Palabras nivel 1:`, level1Words);
                
                // Verificar si hay números en el array de palabras
                const numericChars = level1Words.filter(word => /\d/.test(word));
                if (numericChars.length > 0) {
                    console.warn(`[LETRAS:INIT] ¡ALERTA! Hay caracteres numéricos en nivel 1:`, numericChars);
                }
            } else {
                console.warn(`[LETRAS:INIT] No se encontraron palabras para el nivel 1`);
            }
        } else {
            console.warn(`[LETRAS:INIT] No se encontraron niveles de juego en las traducciones`);
        }
    } catch (error) {
        console.error(`[LETRAS:INIT] Error verificando niveles:`, error);
    }
    
    // Iniciar juego después de cargar idioma
    initializeGame();
}).catch(error => {
    console.error('[index] Error inicializando el servicio de localización:', error);
    console.log('[index] Usando traducciones de respaldo');
    
    // Usar fallback translations
    i18n.initializeWithTranslations(fallbackTranslations, 'en');
    
    // Verificar si hay niveles de juego en las traducciones de respaldo
    console.warn(`[LETRAS:INIT] Usando traducciones de respaldo - verificar si incluyen niveles de juego`);
    
    // Iniciar juego con traducciones de respaldo
    initializeGame();
});

/**
 * Inicializa el juego con Phaser
 */
function initializeGame() {
    console.log('[index] Creando instancia de Phaser');
    const game = new Phaser.Game(config);

    // Iniciar la escena especificada en las variables de entorno o la de título por defecto
    const startScene = process.env.START_SCENE || 'title';
    console.log(`[index] Iniciando escena: ${startScene}`);
    game.scene.start(startScene);

    console.log(`[index] Juego inicializado con escena: ${startScene}`);
} 