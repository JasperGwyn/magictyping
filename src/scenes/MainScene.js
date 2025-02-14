export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Aquí cargaremos los assets
    }

    create() {
        // Configuración inicial de la escena
        this.add.text(400, 300, 'Lupita Typing Game', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
    }

    update() {
        // Lógica que se ejecuta en cada frame
    }
} 