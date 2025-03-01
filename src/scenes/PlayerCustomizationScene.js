import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';
import i18n from '../services/localization';

export default class PlayerCustomizationScene extends BaseScene {
    constructor() {
        super('player-customization');
        this.useCommonBackground = true;
        this.playerName = '';
        this.selectedCharacter = 'wizard'; // Por defecto
        this.showCursor = true;
        this.cursorTimer = null;
        this.displayObjects = [];
        this.nameText = null;
        this.cursorText = null;
        this.wizardSprite = null;
        this.oldWizardSprite = null;
    }

    preload() {
        super.preload();
        this.load.image('wizard', 'assets/images/characters/she.png');
        this.load.image('oldwizard', 'assets/images/characters/he.png');
    }

    create() {
        super.create();

        // Reset player name and selected character each time the scene is created
        this.playerName = '';
        this.selectedCharacter = 'wizard';

        // Asegurarnos que LoadingScene esté activa
        if (!this.scene.isActive('loading')) {
            console.log('PlayerCustomizationScene: LoadingScene no está activa, iniciándola...');
            this.scene.launch('loading');
            this.scene.sendToBack('loading');
        } else {
            console.log('PlayerCustomizationScene: LoadingScene ya está activa');
            this.scene.sendToBack('loading');
        }

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

        // Título
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH / 2, 120, i18n.getText('scenes.playerCustomization.title'), {
                fontFamily: '"Press Start 2P"',
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }).setOrigin(0.5)
        );

        // Texto para ingresar nombre
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH / 2, 180, i18n.getText('scenes.playerCustomization.enterName'), {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffff00',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }).setOrigin(0.5)
        );

        // Contenedor para el nombre
        const nameContainer = this.add.container(SCREEN_CONFIG.WIDTH / 2, 220);
        this.displayObjects.push(nameContainer);

        // Texto del nombre
        this.nameText = this.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Cursor
        this.cursorText = this.add.text(0, 0, '_', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        nameContainer.add([this.nameText, this.cursorText]);

        // Cursor parpadeante
        this.cursorTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                this.showCursor = !this.showCursor;
                this.cursorText.setAlpha(this.showCursor ? 1 : 0);
            },
            loop: true
        });

        // Texto para selección de personaje
        this.displayObjects.push(
            this.add.text(SCREEN_CONFIG.WIDTH / 2, 300, i18n.getText('scenes.playerCustomization.chooseCharacter'), {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffff00',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }).setOrigin(0.5)
        );

        // Sprites de personajes
        const spriteY = 400;
        const spriteSpacing = 130;
        
        // Wizard joven
        this.wizardSprite = this.add.image(
            SCREEN_CONFIG.WIDTH / 2 - spriteSpacing,
            spriteY,
            'wizard'
        ).setScale(7);
        this.displayObjects.push(this.wizardSprite);
        
        // Wizard viejo
        this.oldWizardSprite = this.add.image(
            SCREEN_CONFIG.WIDTH / 2 + spriteSpacing,
            spriteY,
            'oldwizard'
        ).setScale(7);
        this.displayObjects.push(this.oldWizardSprite);

        // Texto de continuar
        const continueText = this.add.text(
            SCREEN_CONFIG.WIDTH / 2,
            SCREEN_CONFIG.HEIGHT - 50,
            i18n.getText('scenes.playerCustomization.continue'),
            {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: textMaxWidth }
            }
        ).setOrigin(0.5);
        this.displayObjects.push(continueText);

        // Animación de parpadeo
        this.tweens.add({
            targets: continueText,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // Resaltar personaje seleccionado
        this.updateCharacterSelection();

        // Input handling
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
        
        // Initialize the name text field to empty
        this.updateNameText();
    }

    handleKeyInput(event) {
        if (event.key === 'Enter' && this.playerName.length > 0) {
            // Guardar selecciones en el registro global
            this.registry.set('playerName', this.playerName);
            this.registry.set('characterType', this.selectedCharacter);
            
            // Transición a la escena de dificultad
            this.transitionToScene('difficulty');
        } else if (event.key === 'Backspace') {
            this.playerName = this.playerName.slice(0, -1);
            this.updateNameText();
        } else if (event.key === '1' || event.key === 'ArrowLeft') {
            this.selectedCharacter = 'wizard';
            this.updateCharacterSelection();
        } else if (event.key === '2' || event.key === 'ArrowRight') {
            this.selectedCharacter = 'oldwizard';
            this.updateCharacterSelection();
        } else if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/) && this.playerName.length < 10) {
            this.playerName += event.key.toUpperCase();
            this.updateNameText();
        }
    }

    updateNameText() {
        if (this.nameText && this.nameText.active) {
            this.nameText.setText(this.playerName);
            
            if (this.cursorText && this.cursorText.active) {
                const textWidth = this.nameText.width;
                this.cursorText.setPosition(textWidth/2 + 5, 0);
            }
        }
    }

    updateCharacterSelection() {
        // Resetear opacidad y escala
        this.wizardSprite.setAlpha(0.2);
        this.oldWizardSprite.setAlpha(0.2);
        this.wizardSprite.setScale(6);
        this.oldWizardSprite.setScale(6);

        // Resaltar y hacer más grande el seleccionado
        if (this.selectedCharacter === 'wizard') {
            this.wizardSprite.setAlpha(1);
            this.wizardSprite.setScale(7);
        } else {
            this.oldWizardSprite.setAlpha(1);
            this.oldWizardSprite.setScale(7);
        }

        // Efecto de transición suave
        this.tweens.add({
            targets: [this.wizardSprite, this.oldWizardSprite],
            duration: 200,
            ease: 'Power2'
        });
    }

    shutdown() {
        if (this.cursorTimer) {
            this.cursorTimer.destroy();
        }
        this.displayObjects.forEach(obj => {
            if (obj && obj.destroy) {
                obj.destroy();
            }
        });
        if (this.panel) {
            this.panel.destroy();
        }
        super.shutdown();
    }
} 