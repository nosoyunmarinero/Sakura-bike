import BootScene from './scene/BootScene.js';
import PreloadScene from './scene/PreloadScene.js';
import GameScene from './scene/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    backgroundColor: '#f8e1fc',
    parent: "game",
    scene: [BootScene, PreloadScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);