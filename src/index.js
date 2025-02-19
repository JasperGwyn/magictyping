import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import ResultsScene from './scenes/ResultsScene';
import IntroScene from './scenes/IntroScene';
import InstructionsScene from './scenes/InstructionsScene';
import LoadingScene from './scenes/LoadingScene';
import DifficultyScene from './scenes/DifficultyScene';
import PlayerCustomizationScene from './scenes/PlayerCustomizationScene';
import { SCREEN_CONFIG } from './config/gameConfig';

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
        PlayerCustomizationScene,  // 1. Personalización del personaje
        IntroScene,                // 2. Introducción
        MenuScene,                 // 3. Menú principal
        DifficultyScene,          // 4. Selección de dificultad
        InstructionsScene,         // 5. Instrucciones
        GameScene,                 // 6. Gameplay
        ResultsScene,              // 7. Resultados
        LoadingScene              // Escena de carga (cuando sea necesaria)
    ]
};

// Si hay una escena inicial especificada en las variables de entorno, usarla
if (process.env.START_SCENE) {
    const sceneMap = {
        'player-customization': PlayerCustomizationScene,
        'intro': IntroScene,
        'menu': MenuScene,
        'difficulty': DifficultyScene,
        'instructions': InstructionsScene,
        'game': GameScene,
        'results': ResultsScene
    };
    
    // Reorganizar las escenas para poner la escena inicial primero
    const startScene = sceneMap[process.env.START_SCENE];
    if (startScene) {
        config.scene = [
            startScene,
            ...Object.values(sceneMap).filter(scene => scene !== startScene)
        ];
    }
}

// Crear instancia de Phaser
new Phaser.Game(config); 