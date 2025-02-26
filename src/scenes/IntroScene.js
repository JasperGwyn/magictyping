import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';
import i18n from '../services/localization';

export default class IntroScene extends BaseScene {
    constructor() {
        super('intro');
        this.currentPage = 0;
        this.storyTexts = [];
        this.textAlpha = 0;
        this.useCommonBackground = true;
    }

    preload() {
        super.preload();
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.image('oldwizard', 'assets/images/characters/he.png');
        this.load.audio('intro_music', 'assets/sounds/music/intro.mp3');
    }

    create() {
        super.create();

        // Obtener el nombre y tipo de personaje del jugador del registro
        const playerName = this.registry.get('playerName') || 'LUPITA';
        const characterType = this.registry.get('characterType') || 'wizard';

        // Inicializar storyTexts usando el servicio de localización
        this.storyTexts = [
            i18n.getText('scenes.intro.greetings', { nombre: playerName }),
            i18n.getText('scenes.intro.desire'),
            i18n.getText('scenes.intro.challenge'),
            i18n.getText('scenes.intro.request')
        ];

        // Iniciar música
        this.music = this.sound.add('intro_music', { 
            volume: 0.5,
            loop: true 
        });
        this.music.play();

        // Agregar personaje inicialmente fuera de la pantalla
        this.wizard = this.add.image(-100, SCREEN_CONFIG.HEIGHT / 2, characterType)
            .setScale(10)
            .setOrigin(0.5);

        // Crear el texto actual con sombra
        const textY = 82; // Misma posición Y que el menú
        this.currentText = this.add.text(SCREEN_CONFIG.WIDTH / 2 + 2, textY, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#000000', // Sombra
            align: 'center',
            lineSpacing: 15,
            wordWrap: { width: SCREEN_CONFIG.WIDTH - 100 }
        }).setOrigin(0.5).setAlpha(0);

        // Texto principal
        this.currentTextMain = this.add.text(SCREEN_CONFIG.WIDTH / 2, textY - 2, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 15,
            wordWrap: { width: SCREEN_CONFIG.WIDTH - 100 }
        }).setOrigin(0.5).setAlpha(0);

        // Texto de "Presiona ESPACIO"
        this.pressSpaceText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT - 80, i18n.getText('scenes.intro.pressSpace'), {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Animación de entrada del personaje
        this.tweens.add({
            targets: this.wizard,
            x: SCREEN_CONFIG.WIDTH / 2,
            duration: 2000,
            ease: 'Power1',
            onComplete: () => {
                this.startFloatingAnimation();
                this.showCurrentText();
                // Iniciar LoadingScene después de que la intro esté lista
                this.scene.launch('loading');
                this.scene.sendToBack('loading');
            }
        });

        // Configurar evento de teclado
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.animationState === "WAIT") {
                this.nextText();
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.animationState === "WAIT") {
                this.nextText();
            }
        });

        // Efecto de fade in al inicio
       // this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    startFloatingAnimation() {
        this.tweens.add({
            targets: this.wizard,
            y: this.wizard.y - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });
    }

    showCurrentText() {
        if (this.currentPage >= this.storyTexts.length) {
            this.finishIntro();
            return;
        }

        this.animationState = "SHOW_TEXT";
        this.currentText.setText(this.storyTexts[this.currentPage]);
        this.currentTextMain.setText(this.storyTexts[this.currentPage]);
        
        // Mostrar textos inmediatamente
        this.currentText.setAlpha(1);
        this.currentTextMain.setAlpha(1);
        
        // Mostrar y animar el texto de "Presiona ESPACIO"
        this.pressSpaceText.setAlpha(1);
        this.tweens.add({
            targets: this.pressSpaceText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        this.animationState = "WAIT";
    }

    nextText() {
        // Detener la animación del texto "Presiona ESPACIO"
        this.tweens.killTweensOf(this.pressSpaceText);
        
        // Quitamos el texto inmediatamente
        this.currentText.setAlpha(0);
        this.currentTextMain.setAlpha(0);
        this.pressSpaceText.setAlpha(0);
        
        this.currentPage++;
        this.showCurrentText();
    }

    finishIntro() {
        // Quitamos los textos inmediatamente
        this.currentText.setAlpha(0);
        this.currentTextMain.setAlpha(0);
        this.pressSpaceText.setAlpha(0);
        
        // Solo procesar si estamos en la escena de intro y está activa
        if (this.scene.key !== 'intro' || !this.scene.isActive()) {
            return;
        }
        
        // Detener cualquier reproducción de audio si existe
        if (this.typingSound && this.typingSound.isPlaying) {
            this.typingSound.stop();
        }
        
        // Transición a la pantalla de instrucciones
        this.transitionToScene('instructions');
    }
} 