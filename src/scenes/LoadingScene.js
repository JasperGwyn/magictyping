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
        console.log('LoadingScene shutdown iniciado');
        super.shutdown();
        console.log('LoadingScene shutdown completado');
    }
} 