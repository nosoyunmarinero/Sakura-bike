class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Background
        this.load.image('cloud1', './assets/background/Clouds/Cloud2.png');
        this.load.image('floor', './assets/background/Misc/Assets.png');

        // Player
        this.load.spritesheet('player_walk', './assets/character/example/katana-walk.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player_run', './assets/character/example/player-run.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player_idle', './assets/character/example/player-idle.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player_jump', './assets/character/example/player-jump.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('player_attack', './assets/character/example/player-attack.png', { frameWidth: 80, frameHeight: 48 });

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