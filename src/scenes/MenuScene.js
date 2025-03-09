import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';

export default class MenuScene extends BaseScene {
    constructor() {
        super('menu');
        this.useCommonBackground = true;
    }

    preload() {
        super.preload();
        // Solo cargar la música del intro que sabemos que existe
        this.load.audio('intro_music', [
            'assets/sounds/music/intro.opus',
            'assets/sounds/music/intro.mp3'
        ]);
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.image('oldwizard', 'assets/images/characters/he.png');
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
            sound.key === 'intro_music' && sound.isPlaying
        );
        
        console.log('isAnyMusicPlaying:', isAnyMusicPlaying);
        
        // Solo inicializar música si no hay ninguna sonando
        if (!isAnyMusicPlaying) {
            console.log('Iniciando música del intro');
            this.music = this.sound.add('intro_music', {
                volume: 0.5,
                loop: true
            });
            this.music.play();
        }

        // Obtener el nombre y tipo de personaje del jugador del registro
        const playerName = this.registry.get('playerName') || 'LUPITA';
        const characterType = this.registry.get('characterType') || 'wizard';
        
        // Crear título con sombra usando el nombre del jugador
        const titleText = `LA AVENTURA\nMÁGICA DE ${playerName}`;
        
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

        // Agregar el personaje seleccionado
        this.wizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            characterType
        ).setOrigin(0.5)
         .setScale(10)
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

        // Configurar el evento de SPACE y ENTER
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        this.enterKey = this.input.keyboard.addKey('ENTER');
        this.spaceKey.on('down', this.handleSpaceKey, this);
        this.enterKey.on('down', this.handleSpaceKey, this);

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
        this.transitionToScene('difficulty');
    }

    shutdown() {
        // Limpiar todos los recursos
        if (this.spaceKey) {
            this.spaceKey.removeAllListeners();
            this.spaceKey = null;
        }
        if (this.enterKey) {
            this.enterKey.removeAllListeners();
            this.enterKey = null;
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