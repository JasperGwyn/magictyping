import BaseScene from './BaseScene';
import { SCREEN_CONFIG, PALABRAS_POR_NIVEL } from '../config/gameConfig';
import { HighScores } from '../services/storage/scores';
import i18n from '../services/localization';

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
        this.load.image('wizard', 'assets/images/characters/she.png');
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
            SCREEN_CONFIG.HEIGHT * 0.7,  // Reducido de 0.9 a 0.8 para dejar espacio al texto inferior
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
        
        // Título - posición ajustada
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 180, // Ajustado de -200 a -180
                i18n.getText('scenes.results.gameOver'), {
                fontFamily: '"Press Start 2P"',
                fontSize: '28px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5)
        );

        // Resumen de la partida - posición ajustada
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 110, // Ajustado de -120 a -110
                i18n.getText('scenes.results.summary', { level: level, score: score }), {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 15 // Reducido de 20 a 15
            }).setOrigin(0.5)
        );

        // Mensaje de high score si corresponde - posición ajustada
        if (isHighScore) {
            this.displayObjects.push(
                this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 35, // Ajustado de -40 a -35
                    i18n.getText('scenes.results.newHighScore'), {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '24px',
                    fill: '#ffff00'
                }).setOrigin(0.5)
            );
        }

        // Obtener el nombre del jugador actual
        const playerName = this.registry.get('playerName') || 'LUPITA';

        // Mostrar leaderboard - posición ajustada
        let scores = await HighScores.get();
        
        // Verificar si el puntaje actual ya está en el leaderboard
        const scoreAlreadyInLeaderboard = scores.some(s => s.name === playerName && s.score === score);
        
        // Si es un nuevo highscore pero no está en el leaderboard, lo agregamos manualmente
        if (isHighScore && !scoreAlreadyInLeaderboard) {
            console.log("Agregando manualmente el score al leaderboard para mostrar");
            
            // Crear objeto de puntaje para el jugador actual
            const currentScoreData = {
                name: playerName,
                score: score
            };
            
            // Agregar a la lista de puntajes y ordenar
            scores.push(currentScoreData);
            
            // Ordenar puntajes de mayor a menor
            scores.sort((a, b) => b.score - a.score);
        }
        
        if (scores && scores.length > 0) {
            // Título del leaderboard
            this.displayObjects.push(
                this.add.text(SCREEN_CONFIG.WIDTH/2, centerY + 10, // Ajustado de +20 a +10
                    i18n.getText('scenes.results.leaderboard'), {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '20px',
                    fill: '#ffffff'
                }).setOrigin(0.5)
            );

            // Mostrar los top 5 scores - posiciones ajustadas
            const topScores = scores.slice(0, 5);
            let foundCurrentScore = false; // Variable para rastrear si ya encontramos el score actual
            
            topScores.forEach((scoreData, index) => {
                const scoreText = `${index + 1}. ${scoreData.name}: ${scoreData.score}`;
                
                // Resaltar solo la primera coincidencia de nombre y puntaje
                // que corresponde al puntaje que acaba de conseguir el jugador
                const isCurrentPlayerScore = !foundCurrentScore && 
                                           scoreData.name === playerName && 
                                           scoreData.score === score;
                
                // Si este es el score actual, marcamos que ya lo encontramos
                if (isCurrentPlayerScore) {
                    foundCurrentScore = true;
                }
                
                this.displayObjects.push(
                    this.add.text(SCREEN_CONFIG.WIDTH/2, centerY + 45 + (index * 26), // Ajustado de +60 y espaciado 28 a +45 y espaciado 26
                        scoreText, {
                        fontFamily: '"Press Start 2P"',
                        fontSize: '18px',
                        fill: isCurrentPlayerScore ? '#ffff00' : '#ffffff'
                    }).setOrigin(0.5)
                );
            });
        }

        // Texto para volver al menú
        const menuText = this.add.text(
            SCREEN_CONFIG.WIDTH/2,
            SCREEN_CONFIG.HEIGHT - 45, // Ajustado de -50 a -45
            i18n.getText('scenes.results.returnToMenu'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '18px',
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
        if (this.homeKey) {
            this.homeKey.removeAllListeners();
        }
        
        // Transición a la pantalla principal
        this.transitionToScene('title');
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