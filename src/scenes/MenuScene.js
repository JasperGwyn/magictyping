import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';

export default class MenuScene extends BaseScene {
    constructor() {
        super('menu');
        this.useCommonBackground = true;
    }

    preload() {
        super.preload();
        this.load.audio('menu_music', 'assets/sounds/music/menu.mp3');
        this.load.audio('intro_music', 'assets/sounds/music/intro.mp3');
        this.load.image('wizard', 'assets/images/characters/wizard.png');
    }

    create() {
        super.create();
        
        // Verificar si hay alguna música sonando
        const menuMusic = this.sound.get('menu_music');
        if (!menuMusic || !menuMusic.isPlaying) {
            // Intentar reproducir la música del menú primero
            if (this.cache.audio.exists('menu_music')) {
                this.music = this.sound.add('menu_music', {
                    volume: 0.5,
                    loop: true
                });
                this.music.play();
            } 
            // Si no está disponible la música del menú, usar la de la intro
            else if (this.cache.audio.exists('intro_music')) {
                this.music = this.sound.add('intro_music', {
                    volume: 0.5,
                    loop: true
                });
                this.music.play();
            }
        }

        // Crear título con sombra
        const titleText = "LA AVENTURA\nMÁGICA DE LUPITA";
        
        // Sombra del título
        const titleShadow = this.add.text(SCREEN_CONFIG.WIDTH / 2 + 2, 96, titleText, {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#000000',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5).setAlpha(0);

        // Título principal
        const titleMain = this.add.text(SCREEN_CONFIG.WIDTH / 2, 94, titleText, {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5).setAlpha(0);

        // Agregar a Lupita en la misma posición que en la intro
        this.wizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            'wizard'
        ).setOrigin(0.5)
         .setScale(10)  // Mismo tamaño que en la intro
         .setAlpha(0);

        // Texto de "Presiona ESPACIO"
        const pressSpaceText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT - 80, 'PRESIONA ESPACIO PARA COMENZAR', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Fade in del título, wizard y el texto de espacio
        this.tweens.add({
            targets: [titleShadow, titleMain, this.wizard],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // Animación de flotación para Lupita (igual que en la intro)
                this.tweens.add({
                    targets: this.wizard,
                    y: this.wizard.y - 20,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.InOut'
                });
                
                // Iniciar la animación de parpadeo del texto de espacio
                this.tweens.add({
                    targets: pressSpaceText,
                    alpha: { from: 0, to: 1 },
                    duration: 500,
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // Evento de teclado para ESPACIO
        this.input.keyboard.on('keydown-SPACE', () => {
            // Detener la música actual
            if (this.music) this.music.stop();
            
            // Transición a la escena de instrucciones
            this.scene.start('instructions');
        });

        // Iniciar esta escena en modo transparente
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    }

    shutdown() {
        // Limpiar eventos y tweens al salir de la escena
        this.tweens.killAll();
        this.input.keyboard.removeAllListeners();
        super.shutdown();
    }
} 