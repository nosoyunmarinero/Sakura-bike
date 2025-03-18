class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // No necesitamos precargar nada aquí
    }

    create() {
        this.scene.start('PreloadScene');
    }

    update() {
        // No necesitamos actualizar nada aquí
    }
}

export default BootScene;