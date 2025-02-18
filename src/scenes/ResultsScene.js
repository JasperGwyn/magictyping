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

        // Iniciar música
        if (this.music) this.music.stop();
        this.music = this.sound.add('results_music', { volume: 0.5, loop: true });
        this.music.play();

        // Obtener puntuación y nivel del registro
        const score = this.registry.get('score') || 0;
        console.log('Score actual:', score);

        // Debug: probar el sistema de highscores
        console.log('Scores antes de agregar:', HighScores.get());
        
        // Verificar y guardar highscore
        HighScores.isHighScore(score).then(isHigh => {
            if (isHigh) {
                console.log('Es un nuevo highscore!');
                HighScores.get().then(currentScores => {
                    this.previousScores = currentScores || [];
                    this.waitingForName = true;
                    this.createNameInput();
                });
            } else {
                console.log('No es un nuevo highscore');
                this.showLeaderboard();
            }
        });

        // Input handling
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
    }

    clearDisplayObjects() {
        // Detener el temporizador del cursor si existe
        if (this.cursorTimer) {
            this.cursorTimer.destroy();
            this.cursorTimer = null;
        }

        // Destruir todos los objetos de display excepto el panel
        this.displayObjects.forEach(obj => {
            if (obj && obj.destroy) {
                obj.destroy();
            }
        });
        this.displayObjects = [];
        this.nameText = null;
    }

    handleKeyInput(event) {
        if (this.waitingForName) {
            if (event.key === 'Enter' && this.playerName) {
                this.waitingForName = false;
                this.clearDisplayObjects();
                this.saveScore().then(() => {
                    this.showLeaderboard().then(() => {
                        // Habilitar el retorno al menú después de mostrar el leaderboard
                        this.canReturnToMenu = true;
                    });
                });
            } else if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
                this.updateNameText();
            } else if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/) && this.playerName.length < 10) {
                this.playerName += event.key.toUpperCase();
                this.updateNameText();
            }
        } else if ((event.key === ' ' || event.key === 'Enter') && this.canReturnToMenu) {
            this.clearDisplayObjects();
            if (this.music) this.music.stop();
            this.returnToMenu();
        }
    }

    createNameInput() {
        const centerY = SCREEN_CONFIG.HEIGHT / 2;
        const score = this.registry.get('score');
        const level = this.registry.get('level');

        // Resetear el nombre del jugador
        this.playerName = '';

        // Panel de fondo
        this.panel = this.add.rectangle(
            SCREEN_CONFIG.WIDTH/2,
            SCREEN_CONFIG.HEIGHT/2,
            SCREEN_CONFIG.WIDTH * 0.6,
            SCREEN_CONFIG.HEIGHT * 0.7,
            0x000000,
            0.7
        );

        // Resumen de la partida
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 100, 
                `¡PARTIDA TERMINADA!\n\nNivel alcanzado: ${level}\nPuntuación final: ${score}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center',
                lineSpacing: 10
            }).setOrigin(0.5)
        );

        // Texto de nuevo highscore
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 10, '\n\n¡NUEVO HIGH SCORE!', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffff00'
            }).setOrigin(0.5)
        );

        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY + 30, '\nINGRESA TU NOMBRE:', {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffff00'
            }).setOrigin(0.5)
        );

        // Crear un contenedor para el texto del nombre
        const nameContainer = this.add.container(SCREEN_CONFIG.WIDTH/2, centerY + 70);
        this.displayObjects.push(nameContainer);

        // Texto base (siempre visible)
        this.nameText = this.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Cursor separado (parpadea independientemente)
        this.cursorText = this.add.text(0, 0, '_', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        nameContainer.add([this.nameText, this.cursorText]);
        this.updateNameText();

        // Cursor parpadeante
        this.cursorTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                this.showCursor = !this.showCursor;
                this.cursorText.setAlpha(this.showCursor ? 1 : 0);
            },
            loop: true
        });
    }

    updateNameText() {
        if (this.nameText && this.nameText.active) {
            this.nameText.setText(this.playerName);
            
            // Actualizar posición del cursor
            if (this.cursorText && this.cursorText.active) {
                const textWidth = this.nameText.width;
                this.cursorText.setPosition(textWidth/2 + 5, 0);  // 5 pixels de espacio entre el texto y el cursor
            }
        }
    }

    async showLeaderboard() {
        // Limpiar objetos anteriores
        this.clearDisplayObjects();

        // Crear el panel si no existe
        if (!this.panel) {
            this.panel = this.add.rectangle(
                SCREEN_CONFIG.WIDTH / 2,
                SCREEN_CONFIG.HEIGHT / 2,
                SCREEN_CONFIG.WIDTH * 0.6,
                SCREEN_CONFIG.HEIGHT * 0.7,
                0x000000,
                0.7
            );
        }

        // En vez de obtener los scores de la API, usar la foto + el nuevo score
        let scores;
        if (this.previousScores) {
            // Si tenemos una foto, insertar el nuevo score en orden
            const newScore = {
                name: this.playerName,
                score: this.registry.get('score'),
                date: new Date().toISOString()
            };
            
            scores = [...this.previousScores, newScore]
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);  // Mantener solo los top 5
        } else {
            // Si no hay foto (no es highscore), obtener de la API
            scores = await HighScores.get();
        }

        console.log('Scores a mostrar:', scores);

        // Título del leaderboard
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, this.panel.y - (this.panel.height/2) + 80, 'MEJORES PUNTAJES', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffff00'
            }).setOrigin(0.5)
        );

        // Mostrar los mejores puntajes
        let yOffset = this.panel.y - (this.panel.height/4) + 60;
        const scoreSpacing = 35;  // Reducido de 40 a 35

        // Mostrar 5 entradas, rellenando con espacios vacíos si es necesario
        for (let i = 0; i < 5; i++) {
            const score = scores[i];
            let scoreText;
            let isCurrentScore = false;
            
            if (score) {
                isCurrentScore = score.name === this.playerName && score.score === this.registry.get('score');
                scoreText = `${i + 1}. ${score.name}: ${score.score}`;
            } else {
                scoreText = `${i + 1}. ---`;
            }
            
            this.displayObjects.push(
                this.add.text(SCREEN_CONFIG.WIDTH/2, yOffset + (i * scoreSpacing), scoreText, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '20px',
                    fill: score ? (isCurrentScore ? '#00ff00' : '#ffffff') : '#666666'
                }).setOrigin(0.5)
            );
        }

        // Texto para volver al menú
        const menuText = this.add.text(SCREEN_CONFIG.WIDTH/2, SCREEN_CONFIG.HEIGHT - 50, 
            'PRESIONA ESPACIO PARA VOLVER AL MENÚ', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.displayObjects.push(menuText);

        this.tweens.add({
            targets: menuText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    async saveScore() {
        const score = this.registry.get('score') || 0;
        console.log('Guardando score:', score, 'con nombre:', this.playerName);
        
        // Agregar el score con el nombre del jugador y esperar que termine
        await HighScores.add({
            score: score,
            name: this.playerName || 'undefined'
        });
        
        console.log('Score guardado, mostrando leaderboard');
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