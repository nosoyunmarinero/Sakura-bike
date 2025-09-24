class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Background
        this.load.image('1', './assets/background/Layers/1.png');
        this.load.image('2', './assets/background/Layers/2.png');   
        this.load.image('3', './assets/background/Layers/3.png');   
        this.load.image('4', './assets/background/Layers/4.png');   
        this.load.image('5', './assets/background/Layers/5.png');   
        this.load.image('6', './assets/background/Layers/6.png');   
        this.load.image('7', './assets/background/Layers/7.png');   
        this.load.image('8', './assets/background/Layers/8.png');   
        


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