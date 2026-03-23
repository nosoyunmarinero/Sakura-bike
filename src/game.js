import BootScene from './scene/BootScene.js';
import PreloadScene from './scene/PreloadScene.js';
import GameScene from './scene/GameScene.js';
import StartScene from './scene/StartScene.js';

// Patch del bug interno de Phaser: el GamepadPlugin llama removeAllListeners
// sobre un objeto que ya fue destruido durante el shutdown de la escena.
const _originalStopListeners = Phaser.Input.Gamepad.GamepadPlugin.prototype.stopListeners;
Phaser.Input.Gamepad.GamepadPlugin.prototype.stopListeners = function () {
    try { _originalStopListeners.call(this); } catch (e) {}
};

const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    backgroundColor: '#f8e1fc',
    parent: "game",
    scale: {
        mode: Phaser.Scale.NONE
    },
    scene: [BootScene, PreloadScene, StartScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 600 },
            debug: false
        }
    },
    input: {
        gamepad: true
    }
};

const game = new Phaser.Game(config);