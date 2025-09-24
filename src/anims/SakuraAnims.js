export default class SakuraAnims {
    constructor(scene) {
        this.scene = scene;
        this.createAnimations();
    }
  
   createAnimations() {
    // Sakura animations
    this.scene.anims.create({
        key: 'sakura-walk',
        frames: this.scene.anims.generateFrameNumbers('player_walk', { start: 0, end: 9 }),
        frameRate: 15,
        repeat: 0
    });

    this.scene.anims.create({
        key: 'sakura-run',
        frames: this.scene.anims.generateFrameNumbers('player_run', { start: 0, end: 7 }),
        frameRate: 11,
        repeat: 0
    });

    this.scene.anims.create({
        key: 'sakura-idle',
        frames: this.scene.anims.generateFrameNumbers('player_idle', { start: 0, end: 9 }),
        frameRate: 10,
        repeat: 0
    });

    this.scene.anims.create({
        key: 'sakura-jump',
        frames: this.scene.anims.generateFrameNumbers('player_jump', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    this.scene.anims.create({
        key: 'sakura-attack',
        frames: this.scene.anims.generateFrameNumbers('player_attack', { start: 0, end: 8 }),
        frameRate: 15,
        repeat: 0
    });

    // Enemy animations (opcional, si también tienen problemas)
    this.scene.anims.create({
        key: 'enemy_dialogue',
        frames: this.scene.anims.generateFrameNumbers('enemy_dialogue', { start: 0, end: 10 }),
        frameRate: 10,
        repeat: 0
    });

    this.scene.anims.create({
        key: 'enemy_walk',
        frames: this.scene.anims.generateFrameNumbers('enemy_walk', { start: 0, end: 11 }),
        frameRate: 10,
        repeat: 0
    });
}
}
