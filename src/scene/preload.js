export default class Preload extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {

        // Background
        this.load.image('cloud1', './assets/background/Clouds/Cloud2.png');
        this.load.image('floor', './assets/background/Misc/Assets.png');

        // Player
        this.load.spritesheet('player_walk', './assets/character/Walk.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('player_idle', './assets/character/Idle.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('player_Protection', './assets/character/Protection.png', { frameWidth: 128, frameHeight: 128 });
    }
    }
