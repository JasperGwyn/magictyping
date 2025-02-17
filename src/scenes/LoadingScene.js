import BaseScene from './BaseScene';
import { SCREEN_CONFIG } from '../config/gameConfig';

export default class LoadingScene extends BaseScene {
    constructor() {
        super('loading');
        this.useCommonBackground = true;
        console.log('LoadingScene constructor llamado');
    }

    preload() {
        console.log('LoadingScene preload llamado');
        super.preload();
    }

    create() {
        console.log('LoadingScene create iniciando');
        super.create();
        
        // Crear el fondo animado
        this.createBackground();

        // Si venimos de la intro, iniciar el juego
        if (this.scene.get('instructions').scene.isActive()) {
            // Poner esta escena al fondo
            this.scene.sendToBack();
            // Iniciar el juego
            this.scene.launch('game');
        } else {
            // Si es el inicio del juego, ir a instrucciones
            this.scene.start('instructions');
        }
        
        // Texto de "CARGANDO..." simple, sin animaciones
        const loadingText = this.add.text(SCREEN_CONFIG.WIDTH / 2, SCREEN_CONFIG.HEIGHT / 2, 'CARGANDO...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '40px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        console.log('Texto de carga creado');

        // Delay más largo antes de lanzar el juego
        this.time.delayedCall(500, () => {
            console.log('Iniciando launch de game scene');
            this.scene.launch('game');
            console.log('Game scene launched');
            
            // Configurar el listener antes de que el juego emita ready
            this.scene.get('game').events.once('ready', () => {
                console.log('Evento ready recibido de game scene');
                
                // Agregar delay antes de la transición
                this.time.delayedCall(1000, () => {
                    console.log('Deteniendo escenas...');
                    this.scene.stop('loading');
                    this.scene.stop('instructions');
                    console.log('Escenas detenidas');
                });
            });
        });
        
        console.log('LoadingScene create completado');
    }

    shutdown() {
        // Sobreescribir shutdown para que no limpie nada
        // No llamar a super.shutdown()
    }

    stop() {
        // Sobreescribir stop para que no se detenga
        // No llamar a super.stop()
    }
} 