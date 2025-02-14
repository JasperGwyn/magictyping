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
        
        // Verificar si hay alguna música sonando usando el sistema de sonido global
        const allSounds = this.sound.sounds;
        
        // Logs para debug
        console.log('=== Debug Música ===');
        console.log('Todos los sonidos:', allSounds);
        console.log('Sonidos activos:', allSounds.filter(sound => sound.isPlaying));
        
        const isAnyMusicPlaying = allSounds.some(sound => 
            (sound.key === 'intro_music' || sound.key === 'menu_music') && 
            sound.isPlaying
        );
        
        console.log('isAnyMusicPlaying:', isAnyMusicPlaying);
        
        // Solo inicializar música si no hay ninguna sonando
        if (!isAnyMusicPlaying) {
            // Usar la música que ya esté cargada (intro o menu)
            const musicKey = this.cache.audio.exists('menu_music') ? 'menu_music' : 'intro_music';
            console.log('Iniciando nueva música:', musicKey);
            this.music = this.sound.add(musicKey, {
                volume: 0.5,
                loop: true
            });
            this.music.play();
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

        // Configurar el evento de SPACE una sola vez
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.spaceKey.on('down', this.handleSpaceKey, this);

        // Iniciar esta escena en modo transparente
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    }

    // Mover la lógica del manejo de SPACE a un método separado
    handleSpaceKey() {
        // Solo procesar si estamos en la escena del menú y está activa
        if (this.scene.key !== 'menu' || !this.scene.isActive()) {
            return;
        }

        // Detener la música si existe
        if (this.music) {
            this.music.stop();
        }

        // Transición limpia a la siguiente escena
        this.scene.stop('intro');    // Asegurarnos que la intro esté detenida
        this.scene.stop('menu');     // Detener esta escena
        this.scene.start('instructions'); // Iniciar la nueva escena
    }

    shutdown() {
        // Limpiar todos los recursos
        if (this.spaceKey) {
            this.spaceKey.removeAllListeners();
            this.spaceKey = null;
        }
        
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
        
        this.tweens.killAll();
        this.input.keyboard.removeAllListeners();
        this.events.removeAllListeners();
        
        super.shutdown();
    }
} 