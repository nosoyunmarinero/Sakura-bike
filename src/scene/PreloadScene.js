class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Background
        this.load.image('cloud1', './assets/background/Clouds/Cloud2.png');
        this.load.image('floor', './assets/background/Misc/Assets.png');

        // Player
        this.load.spritesheet('player_walk', './assets/character/Walk.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('player_idle', './assets/character/Idle.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('player_Protection', './assets/character/Protection.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('player_attack', './assets/character/Attack.png', { frameWidth: 128, frameHeight: 128 });

        // Enemy 
        this.load.spritesheet('enemy_dialogue', './assets/enemy/Dialogue.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('enemy_walk', './assets/enemy/enemy-walk.png', { frameWidth: 128, frameHeight: 128 });
    }

    create() {
        this.scene.start('GameScene');
    }

    update() {
        // No necesitamos actualizar nada aquí
    }
}

export default PreloadScene;