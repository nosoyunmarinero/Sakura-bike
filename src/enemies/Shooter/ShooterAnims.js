export default class ShooterAnims {
    constructor(scene) {
        this.scene = scene;
        this.create();
    }

    create() {
        this.scene.anims.create({
            key: 'shooter_idle',
            frames: this.scene.anims.generateFrameNumbers('shooter_idle', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'shooter_flying',
            frames: this.scene.anims.generateFrameNumbers('shooter_flying', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'shooter_attack',
            frames: this.scene.anims.generateFrameNumbers('shooter_attack', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'shooter_hurt',
            frames: this.scene.anims.generateFrameNumbers('shooter_hurt', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'shooter_death',
            frames: this.scene.anims.generateFrameNumbers('shooter_death', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
        });
    }
}