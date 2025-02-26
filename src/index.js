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

// Crear instancia de Phaser
const game = new Phaser.Game(config);

// Iniciar la escena especificada en las variables de entorno o la de título por defecto
const startScene = process.env.START_SCENE || 'title';
game.scene.start(startScene);

console.log(`Juego inicializado con escena: ${startScene}`); 