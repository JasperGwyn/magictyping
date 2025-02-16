import BaseScene from './BaseScene';
import { COLORS, PALABRAS_POR_NIVEL, GAME_CONFIG, SCREEN_CONFIG } from '../config/gameConfig';

export default class GameScene extends BaseScene {
    constructor() {
        super('game');
        this.useCommonBackground = true;  // Activar el fondo común
        this.words = [];
        this.userText = '';
        this.score = 0;
        this.level = 1;
        this.wordsCompleted = 0;
        this.lives = GAME_CONFIG.VIDAS_INICIALES;
        this.lastSpawnTime = 0;
        this.speedMultiplier = 1.0;
        this.frequencyMultiplier = 1.0;
        this.gameOver = false;
        this.canSpawnWords = false;
        this.nextSpawnTime = 0;  // Nuevo: tiempo exacto para el próximo spawn
    }

    init() {
        // Reiniciar todas las variables del juego
        this.words = [];
        this.userText = '';
        this.score = 0;
        this.level = 1;
        this.wordsCompleted = 0;
        this.lives = GAME_CONFIG.VIDAS_INICIALES;
        this.lastSpawnTime = 0;
        this.speedMultiplier = 1.0;
        this.frequencyMultiplier = 1.0;
        this.gameOver = false;
        this.canSpawnWords = false;
        this.nextSpawnTime = 0;
    }

    preload() {
        super.preload();
        // Cargar solo los assets específicos del juego
        this.load.image('wizard', 'assets/images/characters/wizard.png');
        this.load.image('heart', 'assets/images/ui/heart.png');
        this.load.spritesheet('explosion', 'assets/images/effects/explosion.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // Cargar sonidos
        this.load.audio('success', 'assets/sounds/effects/powerUp2.ogg');
        this.load.audio('error', 'assets/sounds/effects/lowThreeTone.ogg');
        this.load.audio('explosion', 'assets/sounds/effects/sfx_explosionGoo.ogg');
        this.load.audio('game_music', `assets/sounds/music/game_theme_nivel${this.level}.ogg`);
        this.load.image('dedos_teclado', 'assets/images/ui/dedosteclado.png');
    }

    create() {
        console.log('GameScene create iniciando');
        super.create();  // Esto creará el fondo común

        // Detener todas las músicas activas antes de iniciar el juego
        this.game.sound.stopAll();

        // Crear la animación de explosión
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }),
            frameRate: 20,
            repeat: 0
        });

        // Configurar sonidos
        this.sounds = {
            success: this.sound.add('success', { volume: 0.3 }),
            error: this.sound.add('error', { volume: 0.3 }),
            explosion: this.sound.add('explosion', { volume: 0.4 })
        };

        // Iniciar música
        this.music = this.sound.add('game_music', { volume: 0.5, loop: true });
        this.music.play();

        // Crear elementos visuales específicos del juego
        this.createWizard();
        this.createUI();

        // Crear el texto de instrucción inicial
        this.initialText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT - 50, 'Escribí las palabras que van cayendo\n y luego apretá ENTER', {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#ffffff',
            align: 'center',
            backgroundColor: '#00000088',
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5);

        // Listener global para cualquier tecla
        const handleFirstKey = (event) => {
            // Remover el texto inicial
            if (this.initialText) {
                this.initialText.destroy();
                this.initialText = null;
            }
            
            // Remover este listener y configurar los listeners del juego
            this.input.keyboard.off('keydown', handleFirstKey);
            this.setupGameInputs();

            // Procesar la primera tecla como un input válido
            if (!this.gameOver && event.key.length === 1 && event.key.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/i)) {
                this.userText = event.key.toUpperCase();
                this.userTextField.setText(this.userText);
            }
        };

        // Agregar el listener inicial
        this.input.keyboard.on('keydown', handleFirstKey);

        // Mostrar introducción del nivel antes de comenzar
        this.showLevelIntro();

        // Emitir evento cuando todo esté listo
        console.log('GameScene emitiendo evento ready');
        this.events.emit('ready');
        console.log('GameScene evento ready emitido');

        // Agregar imagen de referencia de dedos con depth bajo
        const teclado = this.add.image(
            SCREEN_CONFIG.WIDTH - 120,
            SCREEN_CONFIG.HEIGHT / 3 - 30,
            'dedos_teclado'
        );
        teclado.setScale(120 / teclado.width);
        teclado.setAlpha(0.8);
        teclado.setDepth(1);  // Depth bajo para que otros elementos aparezcan encima
    }

    createWizard() {
        const wizardHeight = 120;
        this.wizard = this.add.image(SCREEN_CONFIG.WIDTH - 100, SCREEN_CONFIG.HEIGHT - wizardHeight/2, 'wizard');
        
        // Ajustar el tamaño manteniendo la proporción
        const scale = wizardHeight / this.wizard.height;
        this.wizard.setScale(scale);
        
        // Animación flotante
        this.tweens.add({
            targets: this.wizard,
            y: '-=20',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
        });
    }

    createUI() {
        // Crear corazones de vida
        this.hearts = [];
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(760 - i * 35, 30, 'heart')
                .setScale(0.5)
                .setTint(0xff0000);
            this.hearts.push(heart);
        }

        // Crear teclado visual
        this.createKeyboard();

        // Crear texto de puntuación
        this.scoreText = this.add.text(20, 20, `Puntuación: ${this.score}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#fff',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            }
        });

        // Crear texto de nivel
        this.levelText = this.add.text(20, 50, `Nivel: ${this.level}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#fff',
            padding: { x: 10, y: 5 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            }
        });

        // Crear campo de texto del usuario
        this.userTextField = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT - 50, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            fill: '#fff',
            backgroundColor: '#00000088',
            padding: { x: 15, y: 10 },
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            }
        }).setOrigin(0.5);
    }

    createKeyboard() {
        const keySize = 20;  // Reducido un poco para que quepa mejor
        const padding = 2;
        const startY = 70;  // Debajo de los corazones
        const rightMargin = 20;  // Margen desde el borde derecho
        
        // Definir las filas del teclado
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];

        // Definir colores por dedo
        const fingerColors = {
            'Q': 0xff0000, 'A': 0xff0000, 'Z': 0xff0000,  // Meñique izquierdo (rojo)
            'W': 0x00ff00, 'S': 0x00ff00, 'X': 0x00ff00,  // Anular izquierdo (verde)
            'E': 0x9933ff, 'D': 0x9933ff, 'C': 0x9933ff,  // Medio izquierdo (morado)
            'R': 0xff00ff, 'F': 0xff00ff, 'V': 0xff00ff,   // Índice izquierdo (rosa)
            'T': 0xff00ff, 'G': 0xff00ff, 'B': 0xff00ff,   // Índice izquierdo (rosa)
            'Y': 0x00ffff, 'H': 0x00ffff, 'N': 0x00ffff,   // Índice derecho (cyan)
            'U': 0x00ffff, 'J': 0x00ffff, 'M': 0x00ffff,   // Índice derecho (cyan)
            'I': 0x0000ff, 'K': 0x0000ff,                  // Medio derecho (azul)
            'O': 0xffa500, 'L': 0xffa500,                  // Anular derecho (naranja)
            'P': 0x006400, 'Ñ': 0x006400                   // Meñique derecho (verde oscuro)
        };

        // Calcular el ancho total del teclado para alinearlo a la derecha
        const maxRowLength = Math.max(...rows.map(row => row.length));
        const totalWidth = maxRowLength * (keySize + padding) - padding;
        const startX = SCREEN_CONFIG.WIDTH - totalWidth - rightMargin;

        // Crear el teclado
        rows.forEach((row, rowIndex) => {
            const rowWidth = row.length * (keySize + padding) - padding;
            let rowX;

            if (rowIndex === 1) {
                // Para la segunda fila (A-Ñ), desplazar un cuarto de tecla
                rowX = startX + (keySize + padding) * 0.25;
            } else if (rowIndex === 2) {
                // Para la tercera fila (Z-M), desplazar media tecla más que la segunda fila
                rowX = startX + (keySize + padding) * 0.75;
            } else {
                rowX = startX;
            }

            row.forEach((key, keyIndex) => {
                const x = rowX + keyIndex * (keySize + padding);
                const y = startY + rowIndex * (keySize + padding);

                // Crear fondo de la tecla
                const keyBackground = this.add.rectangle(x, y, keySize, keySize, fingerColors[key])
                    .setOrigin(0, 0)
                    .setAlpha(0.8);

                // Crear texto de la tecla
                this.add.text(x + keySize/2, y + keySize/2, key, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '8px',  // Reducido un poco para que quepa mejor
                    fill: '#fff'
                }).setOrigin(0.5);
            });
        });
    }

    checkWord() {
        const word = this.words.find(w => w.text === this.userText);
        if (word) {
            // Palabra correcta
            this.score += word.text.length * GAME_CONFIG.PUNTOS_POR_LETRA;
            this.wordsCompleted++;
            this.sounds.success.play();
            
            // Eliminar la palabra
            this.words = this.words.filter(w => w !== word);
            word.container.destroy();
            
            // Efectos visuales
            this.createSuccessEffect(word.container.x, word.container.y);

            // Si no hay palabras en pantalla, programar la siguiente palabra
            if (this.words.length === 0 && this.canSpawnWords) {
                this.nextSpawnTime = this.time.now;  // Spawn inmediato
            }
        } else {
            // Palabra incorrecta
            this.sounds.error.play();
        }

        // Limpiar texto del usuario
        this.userText = '';
        this.userTextField.setText('');

        // Verificar nivel completo
        this.checkLevelComplete();
    }

    createSuccessEffect(x, y) {
        // Crear una explosión más pequeña y brillante para el éxito
        const successExplosion = this.add.sprite(x, y, 'explosion')
            .setScale(1.5)
            .setTint(0x00ff00)  // Verde para éxito
            .setBlendMode('ADD')
            .play('explode');

        // Hacer que la explosión suba mientras se reproduce
        this.tweens.add({
            targets: successExplosion,
            y: y - 50,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeOut',
            onComplete: () => successExplosion.destroy()
        });

        // Crear explosiones más pequeñas alrededor
        for (let i = 0; i < 3; i++) {
            const offsetX = Phaser.Math.Between(-30, 30);
            const offsetY = Phaser.Math.Between(-30, 30);
            const smallExplosion = this.add.sprite(x + offsetX, y + offsetY, 'explosion')
                .setScale(0.8)
                .setTint(0x00ff00)
                .setBlendMode('ADD')
                .play('explode');

            this.tweens.add({
                targets: smallExplosion,
                y: (y + offsetY) - 30,
                alpha: 0,
                duration: 500,
                ease: 'Quad.easeOut',
                onComplete: () => smallExplosion.destroy()
            });
        }
    }

    spawnWord() {
        // No spawnear si no está permitido
        if (!this.canSpawnWords) return;
        
        const availableWords = PALABRAS_POR_NIVEL[this.level].palabras;
        const word = Phaser.Math.RND.pick(availableWords);
        const x = Phaser.Math.Between(100, SCREEN_CONFIG.WIDTH - 100);
        
        // Crear un contenedor para la palabra
        const container = this.add.container(x, 0);
        
        // Definir colores por letra (usando los mismos del teclado)
        const letterColors = {
            'Q': 0xff0000, 'A': 0xff0000, 'Z': 0xff0000,  // Meñique izquierdo (rojo)
            'W': 0x00ff00, 'S': 0x00ff00, 'X': 0x00ff00,  // Anular izquierdo (verde)
            'E': 0x9933ff, 'D': 0x9933ff, 'C': 0x9933ff,  // Medio izquierdo (morado)
            'R': 0xff00ff, 'F': 0xff00ff, 'V': 0xff00ff,   // Índice izquierdo (rosa)
            'T': 0xff00ff, 'G': 0xff00ff, 'B': 0xff00ff,   // Índice izquierdo (rosa)
            'Y': 0x00ffff, 'H': 0x00ffff, 'N': 0x00ffff,   // Índice derecho (cyan)
            'U': 0x00ffff, 'J': 0x00ffff, 'M': 0x00ffff,   // Índice derecho (cyan)
            'I': 0x0000ff, 'K': 0x0000ff,                  // Medio derecho (azul)
            'O': 0xffa500, 'L': 0xffa500,                  // Anular derecho (naranja)
            'P': 0x006400, 'Ñ': 0x006400                   // Meñique derecho (verde oscuro)
        };

        // Crear cada letra individualmente
        let totalWidth = 0;
        const letterSpacing = 5;
        const letterObjects = [];

        // Primero crear todas las letras para calcular el ancho total
        word.split('').forEach((letter, index) => {
            const letterText = this.add.text(0, 0, letter, {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#fff'
            });
            letterText.setTint(letterColors[letter] || 0xffffff);
            letterObjects.push(letterText);
            totalWidth += letterText.width + (index < word.length - 1 ? letterSpacing : 0);
        });

        // Ahora posicionar cada letra
        let currentX = -totalWidth / 2;
        letterObjects.forEach(letterText => {
            letterText.setPosition(currentX, 0);
            currentX += letterText.width + letterSpacing;
            container.add(letterText);
        });

        this.words.push({
            container,
            text: word,
            speed: GAME_CONFIG.VELOCIDAD_BASE * this.speedMultiplier
        });
    }

    getSpawnTime() {
        return GAME_CONFIG.FRECUENCIA_SPAWN / this.frequencyMultiplier;
    }

    showLevelIntro() {
        // Desactivar el spawning de palabras durante la introducción
        this.canSpawnWords = false;
        
        // Crear un fondo semi-transparente
        const bg = this.add.rectangle(0, 0, SCREEN_CONFIG.WIDTH, SCREEN_CONFIG.HEIGHT, 0x000000, 0.7)
            .setOrigin(0, 0);

        const centerY = SCREEN_CONFIG.HEIGHT * 0.4;

        // Texto del número de nivel
        const levelTitle = this.add.text(SCREEN_CONFIG.WIDTH/2, centerY, `NIVEL ${this.level}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Texto de la descripción
        const descText = this.add.text(SCREEN_CONFIG.WIDTH/2, centerY + 60, PALABRAS_POR_NIVEL[this.level].descripcion, {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#fff',
            align: 'center',
            wordWrap: { width: 600 }
        }).setOrigin(0.5);

        // Asegurarnos que el panel y el texto estén por encima de todo
        const depth = 1000;  // Un número alto para estar sobre otros elementos
        bg.setDepth(depth);
        levelTitle.setDepth(depth);
        descText.setDepth(depth);

        // Animación de fade out después de 2 segundos
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [bg, levelTitle, descText],
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    // Limpiar los elementos visuales
                    bg.destroy();
                    levelTitle.destroy();
                    descText.destroy();
                    
                    // Activar el spawning de palabras
                    this.canSpawnWords = true;
                    
                    // Spawnear la primera palabra y programar la siguiente
                    this.spawnWord();
                    this.nextSpawnTime = this.time.now + (GAME_CONFIG.FRECUENCIA_SPAWN / this.frequencyMultiplier);
                }
            });
        });
    }

    checkLevelComplete() {
        if (this.wordsCompleted >= GAME_CONFIG.PALABRAS_POR_NIVEL) {
            this.level++;
            this.speedMultiplier *= GAME_CONFIG.INCREMENTO_VELOCIDAD;
            this.frequencyMultiplier *= GAME_CONFIG.INCREMENTO_FRECUENCIA;
            
            // Si hay siguiente nivel, mostrar la introducción del nuevo nivel
            if (PALABRAS_POR_NIVEL[this.level]) {
                // Limpiar palabras existentes
                this.words.forEach(word => word.container.destroy());
                this.words = [];
                this.wordsCompleted = 0;
                
                // Mostrar la introducción del nuevo nivel
                this.showLevelIntro();
            } else {
                // Si no hay más niveles, ir a la pantalla de resultados
                this.registry.set('score', this.score);
                this.registry.set('level', this.level);
                
                // Detener la música actual
                if (this.music) this.music.stop();
                
                // Transición a la escena de resultados
                this.scene.start('results');
            }
        }
    }

    loseLife() {
        this.lives--;
        this.sounds.explosion.play();
        
        // Actualizar corazones
        if (this.hearts.length > 0) {
            const heart = this.hearts.pop();
            heart.destroy();
        }

        if (this.lives <= 0) {
            this.gameOver = true;
            this.showGameOver();
        }
    }

    showGameOver() {
        const gameOverText = this.add.text(SCREEN_CONFIG.WIDTH/2, SCREEN_CONFIG.HEIGHT/2, '¡GAME OVER!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '64px',
            fill: '#ff0000'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: gameOverText,
            alpha: 1,
            duration: 2000,
            onComplete: () => {
                // Guardar score y level en el registro global
                this.registry.set('score', this.score);
                this.registry.set('level', this.level);
                
                // Detener la música actual
                if (this.music) this.music.stop();
                
                // Transición a la escena de resultados
                this.scene.start('results');
            }
        });
    }

    update(time, delta) {
        // Actualizar palabras
        this.words.forEach(word => {
            word.container.y += (word.speed * delta) / 1000;
            
            // Verificar si la palabra llegó al fondo
            if (word.container.y > SCREEN_CONFIG.HEIGHT) {
                this.loseLife();
                // Crear efecto de explosión antes de destruir
                this.createExplosionEffect(word.container.x, SCREEN_CONFIG.HEIGHT);
                word.container.destroy();
                this.words = this.words.filter(w => w !== word);
            }
        });

        // Verificar si es tiempo de generar una nueva palabra
        if (this.canSpawnWords && time >= this.nextSpawnTime) {
            this.spawnWord();
            // Programar el próximo spawn
            this.nextSpawnTime = time + (GAME_CONFIG.FRECUENCIA_SPAWN / this.frequencyMultiplier);
        }

        // Actualizar textos de UI
        this.scoreText.setText(`Puntuación: ${this.score}`);
        this.levelText.setText(`Nivel: ${this.level}`);
    }

    createExplosionEffect(x, y) {
        // Explosión principal grande
        const mainExplosion = this.add.sprite(x, y, 'explosion')
            .setScale(3)
            .setTint(0xff6600)
            .play('explode');

        // Explosiones más pequeñas alrededor
        for (let i = 0; i < 4; i++) {
            const offsetX = Phaser.Math.Between(-40, 40);
            const offsetY = Phaser.Math.Between(-20, 20);
            const delay = Phaser.Math.Between(0, 200);
            
            this.time.delayedCall(delay, () => {
                const smallExplosion = this.add.sprite(x + offsetX, y + offsetY, 'explosion')
                    .setScale(1.5)
                    .setTint(0xff3300)
                    .play('explode');

                smallExplosion.on('animationcomplete', () => {
                    smallExplosion.destroy();
                });
            });
        }

        mainExplosion.on('animationcomplete', () => {
            mainExplosion.destroy();
        });
    }

    // Mover toda la configuración de inputs a un método separado
    setupGameInputs() {
        // Configurar entrada de texto (solo para ENTER y letras)
        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.gameOver) {
                this.checkWord();
            }
        }, this);

        this.input.keyboard.on('keydown-BACKSPACE', () => {
            if (!this.gameOver) {
                this.userText = this.userText.slice(0, -1);
                this.userTextField.setText(this.userText);
            }
        }, this);
        
        // Manejar letras individualmente
        this.input.keyboard.on('keydown', (event) => {
            if (!this.gameOver && event.key.length === 1 && event.key.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/i)) {
                this.userText += event.key.toUpperCase();
                this.userTextField.setText(this.userText);
            }
        }, this);

        // Restaurar el handler de ESC
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.music) this.music.stop();
            this.scene.start('menu');
        });
    }
} 