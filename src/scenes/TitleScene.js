import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';
import i18n from '../services/localization';

export default class TitleScene extends BaseScene {
    constructor() {
        super('title');
        this.useCommonBackground = true;
        this.menuOptions = [
            { key: 'es', displayName: 'Español' },
            { key: 'en', displayName: 'English' }
        ];
        this.selectedOptionIndex = 0; // Default selected option
        this.musicPreloaded = false; // Control para música precargada
        this.musicStarted = false;
    }

    init() {
        // Reiniciar las variables de control de música cuando se vuelve a entrar a la escena
        this.musicStarted = false;
        
        // Si la música ya estaba cargada previamente, marcarla como disponible
        if (this.cache.audio.exists('intro_music')) {
            this.musicPreloaded = true;
        }
    }

    preload() {
        super.preload();
        // Cargar la música con mayor prioridad
        this.load.audio('intro_music', [
            'assets/sounds/music/intro.opus',
            'assets/sounds/music/intro.mp3'
        ], {
            priority: 1 // Alta prioridad para cargar primero
        });
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.image('oldwizard', 'assets/images/characters/he.png');
        
        // Detectar cuando la música ha sido cargada
        this.load.on('filecomplete-audio-intro_music', () => {
            this.musicPreloaded = true;
            // Si ya estamos en create, iniciar la música
            if (this.scene.isActive() && !this.musicStarted) {
                this.startMusic();
            }
        });
    }
    
    // Método para iniciar la música
    startMusic() {
        // Verificar si hay alguna música sonando
        const allSounds = this.sound.sounds;
        const isAnyMusicPlaying = allSounds.some(sound => 
            sound.key === 'intro_music' && sound.isPlaying
        );
        
        // Solo inicializar música si no hay ninguna sonando
        if (!isAnyMusicPlaying) {
            // Detener cualquier otra música que pudiera estar sonando
            this.sound.stopAll();
            
            // Crear y reproducir la música de intro
            this.music = this.sound.add('intro_music', {
                volume: 0.5,
                loop: true
            });
            this.music.play();
            console.log('Iniciando música de intro en TitleScene');
        }
        this.musicStarted = true;
    }

    create() {
        super.create();
        
        console.log('TitleScene create - musicPreloaded:', this.musicPreloaded, 'musicStarted:', this.musicStarted);
        
        // Si la música ya está cargada, iniciarla inmediatamente
        if (this.musicPreloaded && !this.musicStarted) {
            this.startMusic();
        } else if (!this.musicStarted) {
            // Si no está cargada, forzar la carga ahora
            this.load.audio('intro_music', [
                'assets/sounds/music/intro.opus',
                'assets/sounds/music/intro.mp3'
            ]);
            this.load.start();
        }

        // TÍTULO PRINCIPAL: "MAGIC TYPING" - Posicionado más arriba y visible desde el inicio
 
        // Sombra del título principal
        const titleMainShadow = this.add.text(SCREEN_CONFIG.WIDTH / 2 + 4, 122, 'MAGIC TYPING', {
            fontFamily: '"Press Start 2P"',
            fontSize: '50px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        // Título principal - inicialmente visible
        const titleMain = this.add.text(SCREEN_CONFIG.WIDTH / 2, 120, 'MAGIC TYPING', {
            fontFamily: '"Press Start 2P"',
            fontSize: '50px',
            color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        // Agregar los dos personajes - visibles desde el inicio (sin fade)
        this.wizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2 - 100,
            SCREEN_CONFIG.HEIGHT / 2 + 20,
            'wizard'
        ).setOrigin(0.5)
         .setScale(8);
        
        this.oldwizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2 + 100,
            SCREEN_CONFIG.HEIGHT / 2 + 20,
            'oldwizard'
        ).setOrigin(0.5)
         .setScale(8);

        // Crear el menú de selección de idioma
        this.createLanguageMenu();

        // Mostrar el menú de selección de idioma inmediatamente
        this.menuOptionTexts.forEach(text => {
            text.setAlpha(1);
        });
        this.selectionIndicator.setAlpha(1);

        // Animación de flotación para los personajes (solo movimiento vertical, sin cambio de opacidad)
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
        
        // Iniciar LoadingScene
        if (!this.scene.isActive('loading')) {
            console.log('TitleScene: Iniciando LoadingScene en el fondo...');
            this.scene.launch('loading');
            this.scene.sendToBack('loading');
        }
        
        // Iniciar la animación de parpadeo de la opción seleccionada
        this.updateSelectedOption();

        // Configurar teclas para navegar el menú
        this.leftKey = this.input.keyboard.addKey('LEFT');
        this.rightKey = this.input.keyboard.addKey('RIGHT');
        this.enterKey = this.input.keyboard.addKey('ENTER');
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        
        this.leftKey.on('down', this.selectPreviousOption, this);
        this.rightKey.on('down', this.selectNextOption, this);
        this.enterKey.on('down', this.confirmSelection, this);
        this.spaceKey.on('down', this.confirmSelection, this);

        // Iniciar esta escena en modo transparente
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
        
        // Registrar callback para cambios de idioma
        i18n.onLanguageChanged(this.handleLanguageChange.bind(this));
        
        // Establecer el índice seleccionado según el idioma actual
        this.setSelectedLanguage(i18n.currentLanguage);
    }
    
    // Crear el menú de selección de idioma
    createLanguageMenu() {
        // Crear un contenedor para los textos de las opciones
        this.menuOptionTexts = [];
        
        // AQUÍ SE DEFINE LA ALTURA DEL MENÚ DE IDIOMAS
        // Esta constante define la posición Y (altura) del menú de selección de idioma
        // El valor actual lo coloca a 120 píxeles desde la parte inferior de la pantalla
        const baseY = SCREEN_CONFIG.HEIGHT - 100;
        
        // Calcular posición X inicial
        const totalOptions = this.menuOptions.length;
        const spacing = 200; // Espacio entre opciones
        const totalWidth = spacing * (totalOptions - 1);
        const startX = (SCREEN_CONFIG.WIDTH - totalWidth) / 2;
        
        // Crear textos para cada opción
        this.menuOptions.forEach((option, index) => {
            const x = startX + (index * spacing);
            const text = this.add.text(x, baseY, option.displayName, {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            this.menuOptionTexts.push(text);
        });
        
        // Crear el indicador de selección (triángulo o cursor)
        this.selectionIndicator = this.add.text(0, baseY + 40, '▲', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    // Actualizar la visualización de la opción seleccionada
    updateSelectedOption() {
        // Actualizar posición del indicador
        const baseY = SCREEN_CONFIG.HEIGHT - 120;
        const spacing = 200;
        const totalWidth = spacing * (this.menuOptions.length - 1);
        const startX = (SCREEN_CONFIG.WIDTH - totalWidth) / 2;
        const selectedX = startX + (this.selectedOptionIndex * spacing);
        
        this.selectionIndicator.setPosition(selectedX, baseY + 40);
        
        // Actualizar estilo de los textos
        this.menuOptionTexts.forEach((text, index) => {
            if (index < this.menuOptions.length) { // Excluir el indicador
                if (index === this.selectedOptionIndex) {
                    text.setColor('#ffff00'); // Amarillo para la opción seleccionada
                    // Añadir animación de parpadeo a la opción seleccionada
                    this.tweens.add({
                        targets: text,
                        alpha: { from: 1, to: 0.7 },
                        duration: 500,
                        yoyo: true,
                        repeat: -1
                    });
                } else {
                    text.setColor('#ffffff'); // Blanco para las opciones no seleccionadas
                    this.tweens.killTweensOf(text);
                    text.setAlpha(1);
                }
            }
        });
    }
    
    // Seleccionar la opción anterior
    selectPreviousOption() {
        this.selectedOptionIndex = (this.selectedOptionIndex - 1 + this.menuOptions.length) % this.menuOptions.length;
        this.updateSelectedOption();
    }
    
    // Seleccionar la siguiente opción
    selectNextOption() {
        this.selectedOptionIndex = (this.selectedOptionIndex + 1) % this.menuOptions.length;
        this.updateSelectedOption();
    }
    
    // Confirmar la selección actual
    async confirmSelection() {
        // Obtener la opción seleccionada
        const selectedOption = this.menuOptions[this.selectedOptionIndex];
        
        // Cambiar el idioma usando el servicio de localización
        const success = await i18n.changeLanguage(selectedOption.key);
        
        if (success) {
            console.log(`Idioma cambiado a: ${selectedOption.key}`);
            
            // Transición a la siguiente escena
            // Eliminar la detención de la música para permitir que continúe
            // Transición limpia a la escena de personalización
            this.transitionToScene('player-customization');
        } else {
            console.error(`Error al cambiar al idioma: ${selectedOption.key}`);
        }
    }
    
    // Establecer el índice seleccionado según el idioma actual
    setSelectedLanguage(lang) {
        const index = this.menuOptions.findIndex(option => option.key === lang);
        if (index !== -1) {
            this.selectedOptionIndex = index;
            this.updateSelectedOption();
        }
    }
    
    // Manejar cambios de idioma
    handleLanguageChange(newLang) {
        // Actualizar el índice seleccionado
        this.setSelectedLanguage(newLang);
    }

    shutdown() {
        // Limpiar todos los recursos
        if (this.leftKey) {
            this.leftKey.removeAllListeners();
            this.leftKey = null;
        }
        if (this.rightKey) {
            this.rightKey.removeAllListeners();
            this.rightKey = null;
        }
        if (this.enterKey) {
            this.enterKey.removeAllListeners();
            this.enterKey = null;
        }
        if (this.spaceKey) {
            this.spaceKey.removeAllListeners();
            this.spaceKey = null;
        }
        
        if (this.music) {
            this.music.stop();
            this.music = null;
        }
        
        // Remover callback de cambio de idioma
        i18n.onLanguageChanged((lang) => {});
        
        this.tweens.killAll();
        this.input.keyboard.removeAllListeners();
        this.events.removeAllListeners();
        
        super.shutdown();
    }
} 