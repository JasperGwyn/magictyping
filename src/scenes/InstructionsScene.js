import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';
import i18n from '../services/localization';

export default class InstructionsScene extends BaseScene {
    constructor() {
        super('instructions');
        this.useCommonBackground = true;
        this.instructions = [];
        this.currentScreen = 'instructions'; // Para controlar qué pantalla mostrar
        this.instructionTexts = [];
    }

    preload() {
        super.preload();
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.image('dedos_teclado', 'assets/images/ui/dedosteclado.png');
        this.load.image('dedos_indices', 'assets/images/ui/dedosindices.png');
    }

    create() {
        super.create();

        // Inicializar las instrucciones usando el servicio de localización
        this.instructions = [
            i18n.getText('scenes.instructions.welcome'),
            i18n.getText('scenes.instructions.typing'),
            i18n.getText('scenes.instructions.warning')
        ];

        // Obtener el nombre del jugador y tipo de personaje del registro
        const playerName = this.registry.get('playerName') || 'Lupita';
        const characterType = this.registry.get('characterType') || 'wizard';

        // Agregar el personaje seleccionado en el centro
        const wizardHeight = 150;
        this.wizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            characterType
        ).setOrigin(0.5);

        // Ajustar el tamaño del personaje
        const scale = wizardHeight / this.wizard.height;
        this.wizard.setScale(scale);

        // Animación de flotación
        this.tweens.add({
            targets: this.wizard,
            y: '+=30',
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });

        // Panel semi-transparente
        this.panel = this.add.rectangle(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            SCREEN_CONFIG.WIDTH * 0.8,
            SCREEN_CONFIG.HEIGHT * 0.7,
            0x000000,
            0.7
        );

        // Calcular el ancho máximo para el texto (panel width con márgenes)
        const panelWidth = SCREEN_CONFIG.WIDTH * 0.8;
        const textMaxWidth = panelWidth - 60; // 30px de margen a cada lado

        // Mostrar la primera pantalla de instrucciones
        this.showInstructionsScreen(textMaxWidth);

        // Configurar evento de teclado
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.currentScreen === 'instructions') {
                // Limpiar pantalla actual
                this.clearCurrentScreen();
                // Mostrar pantalla de índices
                this.currentScreen = 'indices';
                this.showIndicesScreen();
            } else if (this.currentScreen === 'indices') {
                // Limpiar pantalla actual
                this.clearCurrentScreen();
                // Mostrar pantalla de teclado
                this.currentScreen = 'keyboard';
                this.showKeyboardScreen();
            } else if (this.currentScreen === 'keyboard') {
                // Ir al juego
                if (this.music) this.music.stop();
                this.transitionToScene('game');
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.currentScreen === 'instructions') {
                this.clearCurrentScreen();
                this.currentScreen = 'indices';
                this.showIndicesScreen();
            } else if (this.currentScreen === 'indices') {
                this.clearCurrentScreen();
                this.currentScreen = 'keyboard';
                this.showKeyboardScreen();
            } else if (this.currentScreen === 'keyboard') {
                if (this.music) this.music.stop();
                this.transitionToScene('game');
            }
        });
    }

    showInstructionsScreen(textMaxWidth) {
        // Configuración de espaciado
        const fontSize = 20;
        const lineSpacing = 35;
        const titleParagraphHeight = 100; // Altura específica para el título (más pequeña)
        const fixedParagraphHeight = 150; // Altura para el resto de párrafos

        // Calcular altura total y posición inicial (ajustando por la altura especial del título)
        const totalHeight = titleParagraphHeight + (fixedParagraphHeight * (this.instructions.length - 1));
        let startY = this.panel.y - (totalHeight / 2) + (titleParagraphHeight / 2);

        // Agregar instrucciones
        this.instructions.forEach((instruction, index) => {
            const text = this.add.text(SCREEN_CONFIG.WIDTH / 2, startY, instruction, {
                fontFamily: '"Press Start 2P"',
                fontSize: `${fontSize}px`,
                color: index === 0 ? '#ffff00' : '#ffffff', // Primer texto en amarillo, resto en blanco
                align: 'center',
                lineSpacing: lineSpacing/2, 
                wordWrap: { width: textMaxWidth }
            }).setOrigin(0.5);
            
            this.instructionTexts.push(text);
            
            // Usar altura diferente para el título
            if (index === 0) {
                startY += titleParagraphHeight;
            } else {
                startY += fixedParagraphHeight;
            }
        });

        // Texto de "Presiona ESPACIO"
        const pressSpaceText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            i18n.getText('scenes.instructions.continue'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }
        ).setOrigin(0.5);
        this.instructionTexts.push(pressSpaceText);
        
        // Animación de parpadeo
        this.tweens.add({
            targets: pressSpaceText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    clearCurrentScreen() {
        // Destruir todos los textos de instrucciones
        this.instructionTexts.forEach(text => text.destroy());
        this.instructionTexts = [];
    }

    showKeyboardScreen() {
        // Calcular el ancho máximo para el texto (panel width con márgenes)
        const panelWidth = SCREEN_CONFIG.WIDTH * 0.8;
        const textMaxWidth = panelWidth - 60; // 30px de margen a cada lado
        
        // Crear el teclado visual dentro del panel
        this.createKeyboard();

        // Agregar imagen de referencia de dedos
        const teclado = this.add.image(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2 +10,  // Ajustado para caber en el panel
            'dedos_teclado'
        );
        teclado.setScale(1.8);  // Reducido para caber en el panel
        teclado.setAlpha(0.9);

        // Agregar texto explicativo
        const explanationText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2 + 130,  // Ajustado para estar debajo del teclado
            i18n.getText('scenes.instructions.fingers'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',  // Reducido para mejor ajuste
                color: '#ffffff',
                align: 'center',
                lineSpacing: 20,
                wordWrap: { width: textMaxWidth }
            }
        ).setOrigin(0.5);

        // Texto de "Presiona ESPACIO"
        const pressSpaceText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            i18n.getText('scenes.instructions.start'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }
        ).setOrigin(0.5);
        
        // Animación de parpadeo
        this.tweens.add({
            targets: pressSpaceText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    createKeyboard() {
        const keySize = 30;  // Reducido para caber en el panel
        const padding = 4;
        const startY = SCREEN_CONFIG.HEIGHT / 2 - 170;  // Ajustado para estar en la parte superior del panel
        
        // Definir las filas del teclado
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];

        // Definir colores por dedo (igual que en GameScene)
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

        // Calcular el ancho total del teclado
        const maxRowLength = Math.max(...rows.map(row => row.length));
        const totalWidth = maxRowLength * (keySize + padding) - padding;
        const startX = (SCREEN_CONFIG.WIDTH - totalWidth) / 2;

        // Crear el teclado
        rows.forEach((row, rowIndex) => {
            const rowWidth = row.length * (keySize + padding) - padding;
            let rowX;

            if (rowIndex === 1) {
                rowX = startX + (keySize + padding) * 0.25;
            } else if (rowIndex === 2) {
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
                    fontSize: '12px',  // Reducido para ajustarse a las teclas más pequeñas
                    fill: '#fff'
                }).setOrigin(0.5);
            });
        });
    }

    showIndicesScreen() {
        // Calcular el ancho máximo para el texto (panel width con márgenes)
        const panelWidth = SCREEN_CONFIG.WIDTH * 0.8;
        const textMaxWidth = panelWidth - 60; // 30px de margen a cada lado
        
        // Agregar imagen de dedos
        const dedosIndices = this.add.image(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2 - 50,
            'dedos_indices'
        );
        dedosIndices.setScale(0.7);
        this.instructionTexts.push(dedosIndices);
        
        // Texto explicativo
        const explanationText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2 + 100,
            i18n.getText('scenes.instructions.indices'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 20,
                wordWrap: { width: textMaxWidth }
            }
        ).setOrigin(0.5);
        this.instructionTexts.push(explanationText);
        
        // Crear teclado con F y J resaltadas
        this.createIndicesKeyboard();
        
        // Texto de "Presiona ESPACIO"
        const pressSpaceText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            i18n.getText('scenes.instructions.continue'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }
        ).setOrigin(0.5);
        this.instructionTexts.push(pressSpaceText);
        
        // Animación de parpadeo
        this.tweens.add({
            targets: pressSpaceText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    createIndicesKeyboard() {
        const keySize = 30;
        const padding = 4;
        const startY = SCREEN_CONFIG.HEIGHT / 2 - 170;
        
        // Definir las filas del teclado
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
        ];

        // Color gris para todas las teclas
        const grayColor = 0x777777;
        // Colores específicos para F y J
        const fColor = 0xff00ff; // rosa para F
        const jColor = 0x00ffff; // cyan para J

        // Calcular el ancho total del teclado
        const maxRowLength = Math.max(...rows.map(row => row.length));
        const totalWidth = maxRowLength * (keySize + padding) - padding;
        const startX = (SCREEN_CONFIG.WIDTH - totalWidth) / 2;

        // Crear el teclado
        rows.forEach((row, rowIndex) => {
            const rowWidth = row.length * (keySize + padding) - padding;
            let rowX;

            if (rowIndex === 1) {
                rowX = startX + (keySize + padding) * 0.25;
            } else if (rowIndex === 2) {
                rowX = startX + (keySize + padding) * 0.75;
            } else {
                rowX = startX;
            }

            row.forEach((key, keyIndex) => {
                const x = rowX + keyIndex * (keySize + padding);
                const y = startY + rowIndex * (keySize + padding);

                // Determinar el color de la tecla (solo F y J destacadas)
                let keyColor = grayColor;
                if (key === 'F') {
                    keyColor = fColor;
                } else if (key === 'J') {
                    keyColor = jColor;
                }

                // Crear fondo de la tecla
                const keyBackground = this.add.rectangle(x, y, keySize, keySize, keyColor)
                    .setOrigin(0, 0)
                    .setAlpha(0.8);
                this.instructionTexts.push(keyBackground);

                // Crear texto de la tecla
                const keyText = this.add.text(x + keySize/2, y + keySize/2, key, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '12px',
                    fill: '#fff'
                }).setOrigin(0.5);
                this.instructionTexts.push(keyText);
            });
        });
    }
} 