import BaseScene from './BaseScene';
import { COLORS, GAME_CONFIG, SCREEN_CONFIG } from '../config/gameConfig';
import i18n from '../services/localization';

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
        this.difficultyMultiplier = 1.0;  // Multiplicador de dificultad
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
        this.difficultyMultiplier = 1.0;
    }

    preload() {
        super.preload();
        // Cargar solo los assets específicos del juego
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.image('heart', 'assets/images/ui/heart.png');
        this.load.spritesheet('explosion', 'assets/images/effects/explosion.png', { 
            frameWidth: 32, 
            frameHeight: 32 
        });
        
        // Cargar sonidos
        this.load.audio('success', 'assets/sounds/effects/powerUp2.ogg');
        this.load.audio('error', 'assets/sounds/effects/lowThreeTone.ogg');
        this.load.audio('explosion', 'assets/sounds/effects/sfx_explosionGoo.ogg');
        this.load.audio('game_music', [
            'assets/sounds/music/game_theme.opus',
            'assets/sounds/music/game_theme.mp3'
        ]);
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

        // Obtener el tipo de personaje seleccionado
        const characterType = this.registry.get('characterType') || 'wizard';
        const playerName = this.registry.get('playerName') || 'Lupita';

        // Crear el personaje
        this.wizard = this.add.image(
            SCREEN_CONFIG.WIDTH - 100,  // A 100 pixels del borde derecho
            SCREEN_CONFIG.HEIGHT - 100,
            characterType
        );
        this.wizard.setScale(7);  // Escala fija de 5

        // Animación de flotación para el personaje
        this.tweens.add({
            targets: this.wizard,
            y: '+=20',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });

        // Crear elementos visuales específicos del juego
        this.createUI();

        // Crear el texto de instrucción inicial usando el servicio de localización
        this.initialText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT - 50, i18n.getText('scenes.game.instructions'), {
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

        // Obtener y loguear el multiplicador de dificultad
        this.difficultyMultiplier = this.registry.get('speedMultiplier') || 1.0;
        console.log('=== Debug Velocidad ===');
        console.log('VELOCIDAD_BASE:', GAME_CONFIG.VELOCIDAD_BASE);
        console.log('speedMultiplier:', this.speedMultiplier);
        console.log('difficultyMultiplier:', this.difficultyMultiplier);
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

        // Crear texto de puntuación usando el servicio de localización
        this.scoreText = this.add.text(20, 20, i18n.getText('scenes.game.score', { score: this.score }), {
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

        // Crear texto de nivel usando el servicio de localización
        this.levelText = this.add.text(20, 50, i18n.getText('scenes.game.level', { level: this.level }), {
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
        
        // Obtener las palabras del nivel actual
        // FIX: Acceder correctamente al array de palabras desde las traducciones
        let availableWords;
        try {
            // Acceder directamente al objeto de traducciones para obtener el array de palabras
            availableWords = i18n.translations[i18n.currentLanguage]?.scenes?.game?.levels?.[this.level]?.words;
            
            // Si no se encuentran palabras, intentar con el fallback en inglés
            if (!Array.isArray(availableWords) && i18n.translations['en']) {
                console.warn(`[LETRAS] No se encontraron palabras para nivel ${this.level} en ${i18n.currentLanguage}, intentando con inglés`);
                availableWords = i18n.translations['en']?.scenes?.game?.levels?.[this.level]?.words;
            }
            
            // Verificar que sea un array
            if (!Array.isArray(availableWords)) {
                console.error(`[LETRAS] ERROR: No se encontraron palabras válidas para el nivel ${this.level}`);
                // Proporcionar un array de respaldo para evitar que el juego se rompa
                availableWords = ["F", "J", "R", "U", "T", "G", "V", "B", "Y", "H", "N", "M"];
            }
        } catch (error) {
            console.error(`[LETRAS] Error obteniendo palabras para nivel ${this.level}:`, error);
            // Proporcionar un array de respaldo
            availableWords = ["F", "J", "R", "U", "T", "G", "V", "B", "Y", "H", "N", "M"];
        }
        
        // Agregar logs específicos para la selección de letras
        console.log(`[LETRAS] Nivel ${this.level} - Lista de palabras disponibles:`, availableWords);
        
        const word = Phaser.Math.RND.pick(availableWords);
        console.log(`[LETRAS] Letra/palabra seleccionada: "${word}"`);
        
        const x = Phaser.Math.Between(100, SCREEN_CONFIG.WIDTH - 100);
        
        // Crear un contenedor para la palabra
        const container = this.add.container(x, 0);
        // Asignar una profundidad mayor que la imagen de dedos (que tiene depth=1)
        container.setDepth(10);
        
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

        const velocidadBase = GAME_CONFIG.VELOCIDAD_BASE;
        const velocidadNivel = this.speedMultiplier;
        const velocidadDificultad = this.difficultyMultiplier;
        
        // Reemplazar los logs de debug de velocidad por uno más conciso
        // console.log('=== Debug Spawn Palabra ===');
        // console.log('VELOCIDAD_BASE:', velocidadBase, typeof velocidadBase);
        // console.log('speedMultiplier:', velocidadNivel, typeof velocidadNivel);
        // console.log('difficultyMultiplier:', velocidadDificultad, typeof velocidadDificultad);
        
        const velocidadFinal = velocidadBase * velocidadNivel * velocidadDificultad;

        this.words.push({
            container,
            text: word,
            speed: velocidadFinal
        });

        // console.log('Velocidad final:', velocidadFinal);
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

        // Texto del número de nivel usando el servicio de localización
        const levelTitle = this.add.text(SCREEN_CONFIG.WIDTH/2, centerY, 
            i18n.getText('scenes.game.level', { level: this.level }), {
            fontFamily: '"Press Start 2P"',
            fontSize: '28px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Obtener la descripción del nivel actual
        let levelDescription = "";
        try {
            // FIX: Acceder directamente a la descripción del nivel
            levelDescription = i18n.translations[i18n.currentLanguage]?.scenes?.game?.levels?.[this.level]?.description;
            
            // Si no se encuentra, intentar con el fallback en inglés
            if (!levelDescription && i18n.translations['en']) {
                levelDescription = i18n.translations['en']?.scenes?.game?.levels?.[this.level]?.description;
            }
            
            // Si aún no hay descripción, usar un texto genérico
            if (!levelDescription) {
                levelDescription = `LEVEL ${this.level}`;
            }
        } catch (error) {
            console.error(`[LETRAS] Error obteniendo descripción para nivel ${this.level}:`, error);
            levelDescription = `LEVEL ${this.level}`;
        }

        // Texto de la descripción
        const descText = this.add.text(SCREEN_CONFIG.WIDTH/2, centerY + 60, 
            levelDescription, {
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
            
            // Verificar si hay un siguiente nivel en los archivos de localización
            try {
                // FIX: Acceder correctamente a las palabras del siguiente nivel
                const nextLevelWords = i18n.translations[i18n.currentLanguage]?.scenes?.game?.levels?.[this.level]?.words;
                
                // Verificar si existen palabras para el siguiente nivel
                if (Array.isArray(nextLevelWords) && nextLevelWords.length > 0) {
                    // Limpiar palabras existentes
                    this.words.forEach(word => word.container.destroy());
                    this.words = [];
                    this.wordsCompleted = 0;
                    
                    // Mostrar la introducción del nuevo nivel
                    this.showLevelIntro();
                } else {
                    console.log(`[LETRAS] No hay más niveles después del ${this.level-1}, finalizando juego`);
                    // Si no hay más niveles, ir a la pantalla de resultados
                    this.registry.set('score', this.score);
                    this.registry.set('level', this.level - 1); // Ajustar al último nivel válido
                    
                    // Detener la música actual
                    if (this.music) this.music.stop();
                    
                    // Transición a la escena de resultados
                    this.scene.start('results');
                }
            } catch(e) {
                console.error("[LETRAS] Error al cargar el siguiente nivel:", e);
                // Si hay error (nivel no existe), ir a resultados
                this.registry.set('score', this.score);
                this.registry.set('level', this.level - 1); // Volver al nivel completado
                
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
        const gameOverText = this.add.text(SCREEN_CONFIG.WIDTH/2, SCREEN_CONFIG.HEIGHT/2, 
            i18n.getText('scenes.results.gameOver'), {
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
            if (word.container.y >= SCREEN_CONFIG.HEIGHT - 15 ) {
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

        // Actualizar textos de UI usando el servicio de localización
        this.scoreText.setText(i18n.getText('scenes.game.score', { score: this.score }));
        this.levelText.setText(i18n.getText('scenes.game.level', { level: this.level }));
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

    gameOver() {
        this.isGameOver = true;
        this.stopTimer();
        this.saveGameResults();
        this.transitionToScene('results');
    }

    handleTimeUp() {
        this.isGameOver = true;
        this.saveGameResults();
        this.transitionToScene('results');
    }

    returnToMenu() {
        console.log('Regresando al menú...');
        if (this.music && this.music.isPlaying) {
            this.music.stop();
        }
        this.transitionToScene('title');
    }
} 