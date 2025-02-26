import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';
import i18n from '../services/localization';

export default class LoadingScene extends BaseScene {
    constructor() {
        super('loading');
        this.useCommonBackground = true;
        this.loadingText = null;
    }

    preload() {
        super.preload();
    }

    create() {
        // Asegurarnos que las dimensiones estén disponibles
        this.cameras.main.setViewport(0, 0, SCREEN_CONFIG.WIDTH, SCREEN_CONFIG.HEIGHT);
        
        // Configurar la cámara para que no haga fade
        this.cameras.main.setAlpha(1);
        this.cameras.main.fadeEffect.reset();
        
        // Ahora sí podemos llamar a super.create()
        super.create();
        
        // Crear el texto de carga usando i18n
        this.loadingText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT / 2, 
            i18n.getText('scenes.loading.text') || 'CARGANDO...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Animación simple de parpadeo
        this.tweens.add({
            targets: this.loadingText,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Registrar callback para cambios de idioma
        i18n.onLanguageChanged(this.handleLanguageChange.bind(this));
    }
    
    // Manejar cambios de idioma
    handleLanguageChange(newLang) {
        if (this.loadingText) {
            this.loadingText.setText(i18n.getText('scenes.loading.text') || 'CARGANDO...');
        }
    }
    
    shutdown() {
        // Limpiar recursos
        if (this.loadingText) {
            this.tweens.killTweensOf(this.loadingText);
        }
        
        // Remover callback de cambio de idioma
        i18n.onLanguageChanged((lang) => {});
        
        super.shutdown();
    }
} 