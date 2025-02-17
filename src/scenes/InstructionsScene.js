import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';

export default class InstructionsScene extends BaseScene {
    constructor() {
        super('instructions');
        this.useCommonBackground = true;
        this.instructions = [
            "¡BIENVENIDO A LA AVENTURA!",
            "ESCRIBE LAS PALABRAS QUE CAEN\nY PRESIONA ENTER\n PARA QUE DESAPAREZCAN",
            "USA LOS DEDOS CORRECTOS",
            "¡NO DEJES QUE LAS PALABRAS\nLLEGUEN AL PISO!"
        ];
    }

    preload() {
        super.preload();
        this.load.image('wizard', 'assets/images/characters/wizard.png');
    }

    create() {
        super.create();

        // Agregar a Lupita en el centro
        const wizardHeight = 150;
        this.wizard = this.add.image(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            'wizard'
        ).setOrigin(0.5);

        // Ajustar el tamaño de Lupita
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

        // Panel semi-transparente para las instrucciones
        const panelWidth = SCREEN_CONFIG.WIDTH * 0.8;
        const panelHeight = SCREEN_CONFIG.HEIGHT * 0.7;
        const panel = this.add.rectangle(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT / 2,
            panelWidth,
            panelHeight,
            0x000000,
            0.5
        );

        // Configuración simple de espaciado
        const fontSize = 20;
        const lineSpacing = 35;
        const fixedParagraphHeight = 100; // Altura fija para cada párrafo

        // Calcular altura total y posición inicial
        const totalHeight = fixedParagraphHeight * this.instructions.length;
        let startY = panel.y - (totalHeight / 2) + (fixedParagraphHeight / 2);

        // Agregar instrucciones
        this.instructions.forEach(instruction => {
            this.add.text(SCREEN_CONFIG.WIDTH / 2, startY, instruction, {
                fontFamily: '"Press Start 2P"',
                fontSize: `${fontSize}px`,
                color: '#ffffff',
                align: 'center',
                lineSpacing: lineSpacing / 2
            }).setOrigin(0.5);
            
            // Simplemente avanzar una altura fija para cada párrafo
            startY += fixedParagraphHeight;
        });

        // Texto de "Presiona ESPACIO"
        const pressSpaceText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            'PRESIONA ESPACIO PARA COMENZAR',
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                color: '#ffffff',
                align: 'center'
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

        // Evento de teclado para ESPACIO
        this.input.keyboard.on('keydown-SPACE', () => {
            // Detener la música actual si existe
            if (this.music) this.music.stop();
            
            // Transición a la escena de carga
            this.transitionToScene('game', 500);
        });
    }
} 