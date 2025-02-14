import BaseScene from './BaseScene';
import { SCREEN_CONFIG, PALABRAS_POR_NIVEL } from '../config/gameConfig';

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

        // Iniciar música
        if (this.music) this.music.stop();
        this.music = this.sound.add('results_music', { volume: 0.5, loop: true });
        this.music.play();

        // Panel semi-transparente (ahora como propiedad de la clase)
        this.panel = this.add.rectangle(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            SCREEN_CONFIG.WIDTH * 0.8,
            SCREEN_CONFIG.HEIGHT * 0.7,
            0x000000,
            0.7
        );

        // Calcular la posición superior del panel
        const panelTop = this.panel.y - (this.panel.height / 2);

        // Obtener puntuación y nivel del registro
        const score = this.registry.get('score') || 0;
        const level = this.registry.get('level') || 1;

        // Título principal (ahora dentro del panel)
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, panelTop + 40, '¡JUEGO TERMINADO!', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ffffff'
            }).setOrigin(0.5)
        );

        // Mostrar puntuación y nivel
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, panelTop + 90, `PUNTUACIÓN FINAL: ${score}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5)
        );

        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, panelTop + 130, `NIVEL ALCANZADO: ${level}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5)
        );

        // Verificar si es high score
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        this.waitingForName = highScores.length < 10 || score > highScores[highScores.length - 1].score;

        if (this.waitingForName) {
            this.createNameInput();
        } else {
            this.showLeaderboard();
        }

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
                this.saveScore();
                this.waitingForName = false;
                this.clearDisplayObjects();
                this.showLeaderboard();
            } else if (event.key === 'Backspace') {
                this.playerName = this.playerName.slice(0, -1);
                this.updateNameText();
            } else if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/) && this.playerName.length < 10) {
                this.playerName += event.key.toUpperCase();
                this.updateNameText();
            }
        } else if (event.key === ' ') {
            this.clearDisplayObjects();
            // Detener la música actual
            if (this.music) this.music.stop();
            // Transición al menú
            this.scene.start('menu');
        }
    }

    createNameInput() {
        const centerY = SCREEN_CONFIG.HEIGHT / 2;

        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY - 40, '¡NUEVO HIGH SCORE!', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffff00'
            }).setOrigin(0.5)
        );

        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, centerY, 'INGRESA TU NOMBRE:', {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffff00'
            }).setOrigin(0.5)
        );

        // Crear un contenedor para el texto del nombre
        const nameContainer = this.add.container(SCREEN_CONFIG.WIDTH/2, centerY + 40);
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
                if (this.cursorText && this.cursorText.active) {
                    this.showCursor = !this.showCursor;
                    this.cursorText.setAlpha(this.showCursor ? 1 : 0);
                }
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

    showLeaderboard() {
        // Limpiar objetos anteriores pero mantener el panel
        this.clearDisplayObjects();

        // Título del leaderboard
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH/2, this.panel.y - (this.panel.height/2) + 40, 'MEJORES PUNTAJES', {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffffff'
            }).setOrigin(0.5)
        );

        // Mostrar los mejores puntajes
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        let yOffset = this.panel.y - (this.panel.height/4);

        // Mostrar 5 entradas, rellenando con espacios vacíos si es necesario
        for (let i = 0; i < 5; i++) {
            const score = highScores[i];
            const isCurrentScore = score && score.name === this.playerName && score.score === this.registry.get('score');
            const color = isCurrentScore ? '#00ff00' : '#ffffff';
            
            let scoreText;
            if (score) {
                scoreText = `${i + 1}. ${score.name}: ${score.score} (Nivel ${score.level})`;
            } else {
                scoreText = `${i + 1}. ---`;
            }
            
            this.displayObjects.push(
                this.add.text(SCREEN_CONFIG.WIDTH/2, yOffset + (i * 40), scoreText, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '20px',
                    fill: color
                }).setOrigin(0.5)
            );
        }

        // Texto para volver al menú con parpadeo
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

    saveScore() {
        try {
            const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
            highScores.push({
                name: this.playerName,
                score: this.registry.get('score') || 0,
                level: this.registry.get('level') || 1,
                date: new Date().toISOString()
            });
            
            // Ordenar por puntuación y mantener solo los mejores 10
            highScores.sort((a, b) => b.score - a.score);
            highScores.splice(10);
            
            localStorage.setItem('highScores', JSON.stringify(highScores));
        } catch (error) {
            console.error('Error saving score:', error);
        }
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