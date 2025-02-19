import BaseScene from './BaseScene';
import { SCREEN_CONFIG, PALABRAS_POR_NIVEL } from '../config/gameConfig';
import { HighScores } from '../services/storage/scores';

export default class ResultsScene extends BaseScene {
    constructor() {
        super('results');
        this.useCommonBackground = true;
        this.playerName = '';
        this.waitingForName = false;
        this.showCursor = true;
        this.cursorTimer = null;
        this.displayObjects = [];
        this.panel = null;
        this.previousScores = null;
        this.canReturnToMenu = false;
    }

    preload() {
        super.preload();
        this.load.image('star', 'assets/images/ui/star.png');
        this.load.image('wizard', 'assets/images/characters/wizard.png');
        this.load.audio('results_music', 'assets/sounds/music/endmusic.mp3', {
            instances: 1
        });
    }

    create() {
        super.create();

        // Si la escena se inicia directamente (START_SCENE=results)5
        if (process.env.START_SCENE === 'results') {
            this.registry.set('score', 999);
            this.registry.set('level', 999);
        }

        console.log('ResultsScene create iniciando');

        // Panel semi-transparente (más grande)
        this.panel = this.add.rectangle(
            SCREEN_CONFIG.WIDTH/2,
            SCREEN_CONFIG.HEIGHT/2,
            SCREEN_CONFIG.WIDTH * 0.9,  // Aumentado de 0.6 a 0.9
            SCREEN_CONFIG.HEIGHT * 0.9,  // Aumentado de 0.7 a 0.9
            0x000000,
            0.7
        );

        // Iniciar música
        if (this.music) this.music.stop();
        this.music = this.sound.add('results_music', { volume: 0.5, loop: true });
        this.music.play();

        // Obtener puntuación, nivel y nombre del jugador
        const score = this.registry.get('score') || 0;
        const level = this.registry.get('level') || 1;
        const playerName = this.registry.get('playerName') || 'LUPITA';
        
        console.log('Score actual:', score);

        // Verificar y guardar highscore
        HighScores.isHighScore(score).then(isHigh => {
            if (isHigh) {
                console.log('Es un nuevo highscore!');
                // Guardar directamente el score con el nombre de la configuración
                this.saveScore(score, playerName).then(() => {
                    this.showResults(score, level, true);
                });
            } else {
                console.log('No es un nuevo highscore');
                this.showResults(score, level, false);
            }
        });

        // Input handling
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
    }

    async showResults(score, level, isHighScore) {
        const centerY = SCREEN_CONFIG.HEIGHT / 2;
        
        // Título
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 200, 
                '¡PARTIDA TERMINADA!', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5)
        );

        // Resumen de la partida
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 120, 
                `Nivel alcanzado: ${level}\nPuntuación final: ${score}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 20
            }).setOrigin(0.5)
        );

        // Mensaje de high score si corresponde
        if (isHighScore) {
            this.displayObjects.push(
                this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 40, 
                    '¡NUEVO HIGH SCORE!', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '28px',
                    fill: '#ffff00'
                }).setOrigin(0.5)
            );
        }

        // Mostrar leaderboard
        const scores = await HighScores.get();
        if (scores && scores.length > 0) {
            // Título del leaderboard
            this.displayObjects.push(
                this.add.text(SCREEN_CONFIG.WIDTH/2, centerY + 20,
                    'MEJORES PUNTAJES', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '24px',
                    fill: '#ffffff'
                }).setOrigin(0.5)
            );

            // Mostrar los top 5 scores
            const topScores = scores.slice(0, 5);
            topScores.forEach((scoreData, index) => {
                const scoreText = `${index + 1}. ${scoreData.name}: ${scoreData.score}`;
                this.displayObjects.push(
                    this.add.text(SCREEN_CONFIG.WIDTH/2, centerY + 60 + (index * 30),
                        scoreText, {
                        fontFamily: '"Press Start 2P"',
                        fontSize: '20px',
                        fill: index === 0 ? '#ffff00' : '#ffffff'
                    }).setOrigin(0.5)
                );
            });
        }

        // Texto para volver al menú
        const menuText = this.add.text(
            SCREEN_CONFIG.WIDTH/2,
            SCREEN_CONFIG.HEIGHT - 50,
            'PRESIONA ESPACIO PARA VOLVER AL MENÚ',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffffff'
            }
        ).setOrigin(0.5);
        this.displayObjects.push(menuText);

        // Animación de parpadeo
        this.tweens.add({
            targets: menuText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Habilitar el retorno al menú
        this.canReturnToMenu = true;
    }

    async saveScore(score, playerName) {
        console.log('Guardando score:', score, 'con nombre:', playerName);
        
        await HighScores.add({
            score: score,
            name: playerName
        });
        
        console.log('Score guardado');
    }

    handleKeyInput(event) {
        if ((event.key === ' ' || event.key === 'Enter') && this.canReturnToMenu) {
            this.clearDisplayObjects();
            if (this.music) this.music.stop();
            this.returnToMenu();
        }
    }

    clearDisplayObjects() {
        this.displayObjects.forEach(obj => {
            if (obj && obj.destroy) {
                obj.destroy();
            }
        });
        this.displayObjects = [];
    }

    returnToMenu() {
        if (this.music) {
            this.music.stop();
        }
        this.transitionToScene('menu');
    }

    shutdown() {
        this.clearDisplayObjects();
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
        super.shutdown();
    }
} 