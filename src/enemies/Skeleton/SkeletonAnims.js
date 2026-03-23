export default class SkeletonAnims {
    constructor(scene) {
        this.scene = scene;
        this.create();
    }

    create() {
        this.scene.anims.create({
            key: 'skeleton_idle',
            frames: this.scene.anims.generateFrameNumbers('skeleton_idle', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'skeleton_walk',
            frames: this.scene.anims.generateFrameNumbers('skeleton_walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'skeleton_attack',
            frames: this.scene.anims.generateFrameNumbers('skeleton_attack', { start: 0, end: 17 }),
            frameRate: 12,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'skeleton_hit',
            frames: this.scene.anims.generateFrameNumbers('skeleton_hit', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'skeleton_dead',
            frames: this.scene.anims.generateFrameNumbers('skeleton_dead', { start: 0, end: 14 }),
            frameRate: 10,
            repeat: 0
        });
        this.scene.anims.create({
            key: 'skeleton_react',
            frames: this.scene.anims.generateFrameNumbers('skeleton_react', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: 0
        });
    }
}