export default class BackgroundManager {
    constructor(scene, layers) {
        this.scene = scene;
        this.backgroundLayers = [];
        this.gameWidth = 960;
        this.gameHeight = 540;
        this.createLayers(layers);
    }

    createLayers(layersConfig) {
        layersConfig.forEach((layer, index) => {
            // Crear el tileSprite con el tamaño del juego
            const tileSprite = this.scene.add.tileSprite(
                0, 0, 
                1920, // Tamaño original de la imagen
                1080, // Tamaño original de la imagen
                layer.key
            )
            .setOrigin(0, 0)
            .setScrollFactor(0);
            
            // Escalar a la mitad (0.5) para ajustar a la resolución del juego 960x540
            tileSprite.setScale(0.5);
            
            this.backgroundLayers[index] = {
                sprite: tileSprite,
                speed: layer.speed
            };
        });
    }

    update() {
        const camera = this.scene.cameras.main;
        this.backgroundLayers.forEach(layer => {
            layer.sprite.tilePositionX = camera.scrollX * layer.speed;
        });
    }

    setLayerSpeed(layerIndex, speed) {
        if (this.backgroundLayers[layerIndex]) {
            this.backgroundLayers[layerIndex].speed = speed;
        }
    }

    destroy() {
        this.backgroundLayers.forEach(layer => {
            layer.sprite.destroy();
        });
        this.backgroundLayers = [];
    }
}