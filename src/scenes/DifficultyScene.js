import BaseScene from './BaseScene';
import { SCREEN_CONFIG, DIFICULTADES } from '../config/gameConfig';

export default class DifficultyScene extends BaseScene {
    constructor() {
        super('difficulty');
        this.useCommonBackground = true;
        this.selectedIndex = 1;  // Empezar con MAGO seleccionado (índice 1)
        this.options = Object.entries(DIFICULTADES);
    }

    create() {
        super.create();

        // Panel semi-transparente
        const panelWidth = SCREEN_CONFIG.WIDTH * 0.8;
        const panelHeight = SCREEN_CONFIG.HEIGHT * 0.7;
        this.add.rectangle(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            panelWidth,
            panelHeight,
            0x000000,
            0.5
        );

        // Título
        this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT * 0.25,
            'ELIGE TU NIVEL DE PODER',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);

        // Crear opciones de dificultad
        const spacing = 80;
        const startY = SCREEN_CONFIG.HEIGHT * 0.4;
        
        this.optionTexts = this.options.map(([key, difficulty], index) => {
            const container = this.add.container(SCREEN_CONFIG.WIDTH / 2, startY + (spacing * index));

            // Título de la dificultad
            const title = this.add.text(0, 0, difficulty.nombre, {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            // Descripción de la dificultad
            const desc = this.add.text(0, 30, difficulty.descripcion, {
                fontFamily: '"Press Start 2P"',
                fontSize: '12px',
                color: '#cccccc',
                align: 'center'
            }).setOrigin(0.5);

            container.add([title, desc]);
            return { title, desc, container };
        });

        // Texto de instrucción en dos líneas
        const pressSpaceText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            'USA ↑↓ PARA ELEGIR\nPULSA ESPACIO O ENTER PARA CONFIRMAR',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 10
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

        // Configurar controles de teclado
        this.input.keyboard.on('keydown-UP', () => {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
            this.updateSelection();
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
            this.updateSelection();
        });

        // Agregar ENTER como alternativa a SPACE
        const confirmSelection = () => {
            const [difficulty] = this.options[this.selectedIndex];
            this.selectDifficulty(difficulty);
        };

        this.input.keyboard.on('keydown-SPACE', confirmSelection);
        this.input.keyboard.on('keydown-ENTER', confirmSelection);

        // Actualizar la selección inicial
        this.updateSelection();
    }

    updateSelection() {
        this.optionTexts.forEach(({ title, desc }, index) => {
            if (index === this.selectedIndex) {
                title.setColor('#FFFF00');  // Amarillo para la opción seleccionada
                desc.setColor('#FFFFFF');
            } else {
                title.setColor('#FFFFFF');
                desc.setColor('#CCCCCC');
            }
        });
    }

    selectDifficulty(difficulty) {
        // Guardar la dificultad seleccionada en el registro global
        this.registry.set('difficulty', difficulty);
        this.registry.set('speedMultiplier', DIFICULTADES[difficulty].multiplicador);
        
        // Transición a la escena de instrucciones
        this.transitionToScene('instructions');
    }
} 