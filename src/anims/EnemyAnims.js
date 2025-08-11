export default class SakuraAnims {
    constructor(scene) {
        this.scene = scene;
        this.createAnimations();
    }

    createAnimations() {
         this.scene.anims.create({
            key:'enemy_dialogue',
            frames: this.scene.anims.generateFrameNumbers('enemy_dialogue', { start: 0, end: 10 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key:"enemy_walk",
            frames: this.scene.anims.generateFrameNumbers('enemy_walk', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: 0
        })
    }
}