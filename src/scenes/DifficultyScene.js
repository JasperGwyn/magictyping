import BaseScene from './BaseScene';
import { SCREEN_CONFIG, DIFICULTADES } from '../config/gameConfig';
import i18n from '../services/localization';

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

        // Calcular el ancho máximo para el texto (panel width con márgenes)
        const textMaxWidth = panelWidth - 60; // 30px de margen a cada lado

        // Título
        this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT * 0.25,
            i18n.getText('scenes.difficulty.title'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }
        ).setOrigin(0.5);

        // Crear opciones de dificultad
        const spacing = 80;
        const startY = SCREEN_CONFIG.HEIGHT * 0.4;
        
        // Mapeo de claves de dificultad a claves de traducción
        const difficultyKeys = {
            'APRENDIZ': 'apprentice',
            'MAGO': 'wizard',
            'ENCANTADOR': 'enchanter'
        };
        
        this.optionTexts = this.options.map(([key, difficulty], index) => {
            const container = this.add.container(SCREEN_CONFIG.WIDTH / 2, startY + (spacing * index));
            
            // Obtener el nombre y descripción traducidos
            const translationKey = difficultyKeys[key];
            const title = this.add.text(0, 0, 
                i18n.getText(`scenes.difficulty.levels.${translationKey}.name`), {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }).setOrigin(0.5);

            // Descripción de la dificultad
            const desc = this.add.text(0, 30, 
                i18n.getText(`scenes.difficulty.levels.${translationKey}.description`), {
                fontFamily: '"Press Start 2P"',
                fontSize: '12px',
                color: '#cccccc',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }).setOrigin(0.5);

            container.add([title, desc]);
            return { title, desc, container };
        });

        // Texto de instrucción en dos líneas
        const pressSpaceText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            i18n.getText('scenes.difficulty.controls'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 10,
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
        
        // Corregir: Para Aprendiz (nivel fácil), queremos menor frecuencia (más tiempo entre palabras)
        // Para Encantador (nivel difícil), queremos mayor frecuencia (menos tiempo entre palabras)
        this.registry.set('frequencyMultiplier', DIFICULTADES[difficulty].multiplicador);
        
        // Transición a la escena de introducción
        this.transitionToScene('intro');
    }
} 