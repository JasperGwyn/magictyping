import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';

export default class TitleScene extends BaseScene {
    constructor() {
        super('title');
        this.useCommonBackground = true;
    }

    preload() {
        super.preload();
        // Cargar la música del intro que sabemos que existe
        this.load.audio('intro_music', 'assets/sounds/music/intro.mp3');
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.image('oldwizard', 'assets/images/characters/he.png');
    }

    create() {
        super.create();
        
        // Iniciar LoadingScene al iniciar la escena de título y mantenerla en el fondo
        if (!this.scene.isActive('loading')) {
            this.scene.launch('loading');
            this.scene.sendToBack('loading');
        }
        
        // Verificar si hay alguna música sonando usando el sistema de sonido global
        const allSounds = this.sound.sounds;
        
        const isAnyMusicPlaying = allSounds.some(sound => 
            sound.key === 'intro_music' && sound.isPlaying
        );
        
        // Solo inicializar música si no hay ninguna sonando
        if (!isAnyMusicPlaying) {
            this.music = this.sound.add('intro_music', {
                volume: 0.5,
                loop: true
            });
            this.music.play();
        }

        // Color amarillo para el título principal (usado en highscores)
        const amarilloHighscore = '#FFD700'; // Color dorado/amarillo

        // TÍTULO PRINCIPAL: "MAGIC TYPING"
        // Sombra del título principal
        const titleMainShadow = this.add.text(SCREEN_CONFIG.WIDTH / 2 + 2, 80, 'MAGIC TYPING', {
            fontFamily: '"Press Start 2P"',
            fontSize: '50px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Título principal
        const titleMain = this.add.text(SCREEN_CONFIG.WIDTH / 2, 78, 'MAGIC TYPING', {
            fontFamily: '"Press Start 2P"',
            fontSize: '50px',
            color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // SUBTÍTULO: "LA AVENTURA MÁGICA"
        // Sombra del subtítulo
        const subtitleShadow = this.add.text(SCREEN_CONFIG.WIDTH / 2 + 2, 140, 'LA AVENTURA MÁGICA', {
            fontFamily: '"Press Start 2P"',
            fontSize: '34px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Subtítulo
        const subtitle = this.add.text(SCREEN_CONFIG.WIDTH / 2, 138, 'LA AVENTURA MÁGICA', {
            fontFamily: '"Press Start 2P"',
            fontSize: '34px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Agregar los dos personajes
        this.wizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2 - 100,
            SCREEN_CONFIG.HEIGHT / 2 + 20,
            'wizard'
        ).setOrigin(0.5)
         .setScale(8)
         .setAlpha(0);
        
        this.oldwizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2 + 100,
            SCREEN_CONFIG.HEIGHT / 2 + 20,
            'oldwizard'
        ).setOrigin(0.5)
         .setScale(8)
         .setAlpha(0);

        // Texto de "Presiona ESPACIO"
        const pressSpaceText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT - 80, 'PRESIONA ESPACIO PARA COMENZAR', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Fade in del título, subtítulo, personajes y el texto de espacio
        this.tweens.add({
            targets: [titleMainShadow, titleMain, subtitleShadow, subtitle, this.wizard, this.oldwizard],
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // Animación de flotación para los personajes
                this.tweens.add({
                    targets: this.wizard,
                    y: this.wizard.y - 20,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.InOut'
                });
                
                this.tweens.add({
                    targets: this.oldwizard,
                    y: this.oldwizard.y - 20,
                    duration: 2000,
                    delay: 500, // Desfase para que no floten al mismo tiempo
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
        // Solo procesar si estamos en la escena del título y está activa
        if (this.scene.key !== 'title' || !this.scene.isActive()) {
            return;
        }

        // Detener la música si existe
        if (this.music) {
            this.music.stop();
        }

        // Transición limpia a la escena de personalización
        this.transitionToScene('player-customization');
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