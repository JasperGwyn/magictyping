import BaseScene from './BaseScene';
import { SCREEN_CONFIG, PALABRAS_POR_NIVEL } from '../config/gameConfig';
import { HighScores } from '../services/storage/scores';
import i18n from '../services/localization';
import { saveHighScore, isHighScore } from '../services/highscores';

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
        this.panelBorder = null;
    }

    preload() {
        super.preload();
        this.load.image('star', 'assets/images/ui/star.png');
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.audio('results_music', [
            'assets/sounds/music/endmusic.opus',
            'assets/sounds/music/endmusic.mp3'
        ], {
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

        // Recuperar el score y nivel del registro global
        const score = this.registry.get('score') || 0;
        const level = this.registry.get('level') || 1;
        const playerName = this.registry.get('playerName') || 'JUGADOR';
        
        // Panel semi-transparente
        const panelWidth = SCREEN_CONFIG.WIDTH * 0.8;
        const panelHeight = SCREEN_CONFIG.HEIGHT * 0.7;
        const panel = this.add.rectangle(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            panelWidth,
            panelHeight,
            0x000000,
            0.7
        );
        
        // Margen para centrar el texto dentro del panel
        const textWidth = panelWidth - 100; // 50px de margen a cada lado
        
        // Título Game Over
        const gameOverText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2, 
            SCREEN_CONFIG.HEIGHT * 0.25,
            i18n.getText('scenes.results.gameOver'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '38px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: textWidth }
            }
        ).setOrigin(0.5);
        
        // Información del nivel alcanzado
        const levelText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT * 0.35,
            i18n.getText('scenes.results.levelReached', { level }),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: textWidth }
            }
        ).setOrigin(0.5);
        
        // Puntaje final
        const scoreText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT * 0.43,
            i18n.getText('scenes.results.finalScore', { score }),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: textWidth }
            }
        ).setOrigin(0.5);
        
        // Guardar el puntaje y comprobar si es un nuevo highscore
        const result = saveHighScore(playerName, score, level);
        
        // Si es un nuevo highscore, mostrar mensaje
        if (result.isNewHighScore) {
            const newHighscoreText = this.add.text(
                SCREEN_CONFIG.WIDTH / 2,
                SCREEN_CONFIG.HEIGHT * 0.52,
                i18n.getText('scenes.results.newHighScore'),
                {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '24px',
                    fill: '#ffff00',
                    align: 'center',
                    wordWrap: { width: textWidth }
                }
            ).setOrigin(0.5);
            
            // Animación de parpadeo para el texto de nuevo highscore
            this.tweens.add({
                targets: newHighscoreText,
                alpha: 0.5,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Título de mejores puntajes
        this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT * 0.6,
            i18n.getText('scenes.results.bestScores'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Mostrar los 5 mejores puntajes
        const highscoreStartY = SCREEN_CONFIG.HEIGHT * 0.67;
        const highscoreSpacing = 25;
        
        result.scores.forEach((highscore, index) => {
            const isNewScore = index === result.newScoreIndex;
            const color = isNewScore ? '#ffff00' : '#ffffff';
            
            // Formato: 1. NOMBRE: PUNTAJE
            const highscoreText = this.add.text(
                SCREEN_CONFIG.WIDTH / 2,
                highscoreStartY + (index * highscoreSpacing),
                `${index + 1}. ${highscore.name}: ${highscore.score}`,
                {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '16px',
                    fill: color,
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // Si es el nuevo puntaje, hacerlo parpadear
            if (isNewScore) {
                this.tweens.add({
                    targets: highscoreText,
                    alpha: 0.7,
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            }
        });
        
        // Instrucciones para volver al menú
        const returnText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            i18n.getText('scenes.results.returnToMenu'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: textWidth }
            }
        ).setOrigin(0.5);
        
        // Animación de parpadeo para el texto de retorno
        this.tweens.add({
            targets: returnText,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Configurar input para volver al menú
        this.input.keyboard.once('keydown-SPACE', () => this.returnToMenu());
        this.input.keyboard.once('keydown-ENTER', () => this.returnToMenu());
    }

    returnToMenu() {
        this.transitionToScene('title');
    }

    shutdown() {
        this.clearDisplayObjects();
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
        if (this.panelBorder) {
            this.panelBorder.destroy();
            this.panelBorder = null;
        }
        super.shutdown();
    }
} 