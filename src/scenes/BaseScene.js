import { SCREEN_CONFIG } from '../config/gameConfig';

export default class BaseScene extends Phaser.Scene {
    constructor(key) {
        super(key);
        this.isUpdateBackgroundBound = false;
        this.introMusicScenes = ['intro', 'title', 'instructions'];
    }

    preload() {
        // Suprimir logs de error de carga
        this.load.on('loaderror', (file) => {
            console.log(`Archivo no encontrado: ${file.src}`);
        });
        
        if (!this.textures.exists('castle')) {
            // Cargar todos los assets necesarios para el fondo
            this.load.image('castle', 'assets/images/backgrounds/castle.png');
            this.load.image('sun', 'assets/images/backgrounds/sun.png');
            
            // Cargar todas las variantes de nubes
            for (let i = 1; i <= 9; i++) {
                this.load.image(`cloud${i}`, `assets/images/backgrounds/cloud${i}.png`);
            }
            
            this.load.image('tree1', 'assets/images/backgrounds/tree1.png');
            this.load.image('tree2', 'assets/images/backgrounds/tree2.png');
            this.load.image('fence', 'assets/images/backgrounds/fence.png');
            this.load.image('grass1', 'assets/images/backgrounds/grass1.png');
            this.load.image('grass2', 'assets/images/backgrounds/grass2.png');
            this.load.image('grass3', 'assets/images/backgrounds/grass3.png');
        }
    }

    create() {
        // Configurar eventos de teclado globales
        this.input.keyboard.on('keydown', this.handleKeyDown, this);
        
        // Inicializar el fondo común si la escena lo requiere
        if (this.useCommonBackground) {
            this.initBackground();
        }
    }

    initBackground() {
        // Limpiar eventos anteriores si existen
        if (this.isUpdateBackgroundBound) {
            this.events.off('update', this.updateBackground, this);
        }

        // Asegurarnos que tenemos las dimensiones correctas
        const width = this.cameras.main.width || SCREEN_CONFIG.WIDTH;
        const height = this.cameras.main.height || SCREEN_CONFIG.HEIGHT;

        // Fondo azul cielo
        this.add.rectangle(0, 0, width, height, 0x87CEEB)
            .setOrigin(0);

        // Sol - mantenemos proporción 1:1 para el sol
        const sunSize = 100;
        this.sun = this.add.image(50, 50, 'sun')
            .setDisplaySize(sunSize, sunSize);
        
        // Animación del sol
        this.tweens.add({
            targets: this.sun,
            y: '+=20',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });

        // Nubes con proporciones originales
        this.clouds = [];
        for (let i = 0; i < 5; i++) {
            const baseWidth = 200;
            
            // Seleccionar aleatoriamente una de las 9 nubes
            const cloudNumber = Phaser.Math.Between(1, 9);
            const cloudTexture = `cloud${cloudNumber}`;
            
            const cloud = this.add.image(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(30, 200),
                cloudTexture
            );
            
            // Mantener proporción original
            const scale = cloud.width ? baseWidth / cloud.width : 1;
            
            // Aplicar variación aleatoria de tamaño entre 80% y 120%
            const sizeVariation = Phaser.Math.FloatBetween(0.8, 1.2);
            cloud.setScale(scale * sizeVariation);
            
            cloud.speed = Phaser.Math.FloatBetween(0.3, 1.0);
            this.clouds.push(cloud);
        }

        // Castillo con proporción original
        const castleTargetHeight = height / 2;
        this.castle = this.add.image(width / 2, height, 'castle')
            .setOrigin(0.5, 1);
        const castleScale = castleTargetHeight / this.castle.height;
        this.castle.setScale(castleScale);

        // Árboles con proporción original
        const treeTargetHeight = 200;
        const tree1 = this.add.image(width * 0.05, height, 'tree1')
            .setOrigin(0, 1);
        const tree1Scale = treeTargetHeight / tree1.height;
        tree1.setScale(tree1Scale);
        
        const tree2 = this.add.image(width * 0.8, height, 'tree2')
            .setOrigin(0, 1);
        const tree2Scale = treeTargetHeight / tree2.height;
        tree2.setScale(tree2Scale);

        // Cerca con proporción original
        const fenceTargetHeight = 45;
        // Crear una cerca temporal fuera de la pantalla
        const tempFence = this.add.image(-1000, -1000, 'fence');
        const fenceScale = fenceTargetHeight / tempFence.height;
        const fenceWidth = tempFence.width * fenceScale;
        const fenceSpacing = fenceWidth - 5;
        const numFences = Math.ceil(width / fenceSpacing) + 1;
        // Destruir la cerca temporal
        tempFence.destroy();
        
        for (let i = 0; i < numFences; i++) {
            this.add.image(i * fenceSpacing, height, 'fence')
                .setOrigin(0, 1)
                .setScale(fenceScale);
        }

        // Pasto con proporción original
        const grassTargetHeight = 12;
        for (let i = 0; i < 10; i++) {
            const grassType = `grass${Phaser.Math.Between(1, 3)}`;
            const xPos = i * (width / 10) + Phaser.Math.Between(-20, 20);
            const grass = this.add.image(xPos, height, grassType)
                .setOrigin(0, 1);
            const grassScale = grassTargetHeight / grass.height;
            grass.setScale(grassScale);
        }

        // Evento de update para las nubes
        this.events.on('update', this.updateBackground, this);
        this.isUpdateBackgroundBound = true;
    }

    updateBackground() {
        // Mover las nubes
        if (this.clouds && Array.isArray(this.clouds)) {
            this.clouds.forEach(cloud => {
                if (cloud && cloud.active) {  // Verificar que la nube existe y está activa
                    cloud.x -= cloud.speed;
                    // Usar getBounds() para obtener las dimensiones actuales
                    const bounds = cloud.getBounds();
                    if (bounds && (cloud.x + bounds.width) < -200) {
                        cloud.x = this.cameras.main.width + Phaser.Math.Between(100, 300);
                        cloud.y = Phaser.Math.Between(30, 200);
                    }
                }
            });
        }
    }

    shutdown() {
        // Limpiar eventos de update del fondo
        if (this.events && this.isUpdateBackgroundBound) {
            this.events.off('update', this.updateBackground, this);
            this.isUpdateBackgroundBound = false;
        }
        
        // Limpiar tweens
        if (this.tweens) {
            this.tweens.killAll();
        }
        
        // Limpiar nubes
        if (this.clouds && Array.isArray(this.clouds)) {
            this.clouds.forEach(cloud => {
                if (cloud && cloud.destroy) {
                    cloud.destroy();
                }
            });
            this.clouds = [];
        }
    }

    handleKeyDown(event) {
        // Manejar tecla ESC para volver a la pantalla de título
        if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ESC) {
            // Si ya estamos en la pantalla de título, solo la recargamos
            if (this.scene.key === 'title') {
                this.scene.restart();
                return;
            }
            
            // Para otras escenas, procedemos con la transición normal a la pantalla de título
            const currentScene = this.scene.key;
            
            // Modificar el manejo de la música
            if (this.music && !this.introMusicScenes.includes('title')) {
                this.music.stop();
            }
            
            // Asegurarnos que loading esté activa y al fondo
            if (!this.scene.isActive('loading')) {
                this.scene.launch('loading');
                this.scene.sendToBack('loading');
            } else {
                // Si ya está activa, asegurarnos que esté en el fondo
                this.scene.sendToBack('loading');
            }

            // Iniciar la nueva escena antes de detener la actual
            this.scene.start('title');

            // Detener la escena actual, pero nunca la escena de loading
            if (currentScene !== 'loading') {
                this.scene.stop(currentScene);
            }

            // Log del estado final
            const escenasActivas = this.scene.manager.scenes
                .filter(s => s.scene.isActive())
                .map(s => s.scene.key);
            console.log('Escenas activas:', escenasActivas);
        }
    }

    transitionToScene(targetScene) {
        console.log(`\n=== TRANSICIÓN: ${this.scene.key} -> ${targetScene} ===`);
        
        const currentScene = this.scene.key;
        
        // Modificar el manejo de la música
        // Solo detener la música si estamos cambiando entre grupos de escenas diferentes
        const currentIsIntroScene = this.introMusicScenes.includes(currentScene);
        const targetIsIntroScene = this.introMusicScenes.includes(targetScene);
        
        if (this.music && currentIsIntroScene !== targetIsIntroScene) {
            this.music.stop();
        }

        // Asegurarnos que loading esté activa y al fondo ANTES de cualquier transición
        if (!this.scene.isActive('loading')) {
            this.scene.launch('loading');
        }
        
        // Siempre enviar loading al fondo
        this.scene.sendToBack('loading');

        // Iniciar la nueva escena antes de detener la actual
        this.scene.start(targetScene);

        // IMPORTANTE: Nunca detener la escena de loading
        // Detener la escena actual solo si no es loading
        if (currentScene !== 'loading') {
            this.scene.stop(currentScene);
        }
    }

    // Métodos de utilidad para crear elementos de UI con estilos mejorados
    createButton(x, y, text, callback) {
        const padding = { x: 20, y: 10 };
        const button = this.add.container(x, y);

        // Crear el fondo del botón
        const background = this.add.rectangle(0, 0, 200, 50, 0x333333)
            .setOrigin(0.5);

        // Crear el texto del botón con mejor estilo
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: 'Roboto Mono',
            fontSize: '24px',
            fill: '#fff',
            padding: padding
        }).setOrigin(0.5);

        // Ajustar el tamaño del fondo al texto
        background.width = buttonText.width + padding.x * 2;
        background.height = buttonText.height + padding.y * 2;

        // Agregar elementos al contenedor
        button.add([background, buttonText]);

        // Hacer el botón interactivo
        button.setSize(background.width, background.height);
        button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                background.setFillStyle(0x444444);
                buttonText.setStyle({ fill: '#ffff00' });
            })
            .on('pointerout', () => {
                background.setFillStyle(0x333333);
                buttonText.setStyle({ fill: '#ffffff' });
            })
            .on('pointerdown', () => {
                background.setFillStyle(0x222222);
                this.time.delayedCall(100, callback);
            });

        return button;
    }

    createText(x, y, text, fontSize = '32px', shadow = true) {
        const textStyle = {
            fontFamily: 'Roboto Mono',
            fontSize: fontSize,
            fill: '#fff',
            padding: { x: 20, y: 10 }
        };

        if (shadow) {
            textStyle.shadow = {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            };
        }

        return this.add.text(x, y, text, textStyle).setOrigin(0.5);
    }

    // Método para crear fondos con degradado
    createGradientBackground(fromColor, toColor) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const texture = this.textures.createCanvas('gradientTexture', width, height);
        const context = texture.getContext();
        
        const gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, fromColor);
        gradient.addColorStop(1, toColor);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
        
        texture.refresh();
        
        return this.add.image(width/2, height/2, 'gradientTexture');
    }

    // Agregar método helper para manejar la música
    setupBackgroundMusic(key, volume = 1, loop = true) {
        // Si ya existe música de intro en otra escena, no crear una nueva instancia
        if (this.introMusicScenes.includes(this.scene.key)) {
            const activeScenes = this.scene.manager.scenes.filter(s => s.scene.isActive());
            const existingMusic = activeScenes.find(s => s.music && s.introMusicScenes.includes(s.scene.key));
            
            if (existingMusic) {
                this.music = existingMusic.music;
                return;
            }
        }

        // Si no existe, crear nueva instancia
        this.music = this.sound.add(key, {
            volume: volume,
            loop: loop
        });
        this.music.play();
    }
} 