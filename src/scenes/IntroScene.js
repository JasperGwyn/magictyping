import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';

export default class IntroScene extends BaseScene {
    constructor() {
        super('intro');
        this.currentPage = 0;
        this.storyTexts = [
            "¡HOLA! SOY LUPITA",
            "QUIERO SER UNA GRAN MAGA",
            "¡PERO PRIMERO DEBO APRENDER A TIPEAR!",
            "¿ME AYUDAS?"
        ];
        this.animationState = "FADE_IN";
        this.textAlpha = 0;
        this.useCommonBackground = true;
    }

    preload() {
        super.preload();
        this.load.image('wizard', 'assets/images/characters/wizard.png');
        this.load.audio('intro_music', 'assets/sounds/music/intro.mp3');
    }

    create() {
        super.create();

        // Iniciar música
        this.music = this.sound.add('intro_music', { 
            volume: 0.5,
            loop: true 
        });
        this.music.play();

        // Agregar personaje inicialmente fuera de la pantalla
        this.wizard = this.add.image(-100, SCREEN_CONFIG.HEIGHT / 2, 'wizard')
            .setScale(10)
            .setOrigin(0.5);

        // Crear el texto actual con sombra
        const textY = 82; // Misma posición Y que el menú
        this.currentText = this.add.text(SCREEN_CONFIG.WIDTH / 2 + 2, textY, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#000000', // Sombra
            align: 'center',
            wordWrap: { width: SCREEN_CONFIG.WIDTH - 100 }
        }).setOrigin(0.5).setAlpha(0);

        // Texto principal
        this.currentTextMain = this.add.text(SCREEN_CONFIG.WIDTH / 2, textY - 2, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: SCREEN_CONFIG.WIDTH - 100 }
        }).setOrigin(0.5).setAlpha(0);

        // Texto de "Presiona ESPACIO"
        this.pressSpaceText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT - 80, 'PRESIONA ESPACIO', {
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
        this.cameras.main.fadeIn(1000, 0, 0, 0);
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
        
        // Transición al menú
        this.transitionToScene('menu', 1000);
    }
} 