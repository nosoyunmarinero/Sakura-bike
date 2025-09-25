export default class SakuraAnims {
    constructor(scene) {
        this.scene = scene;
        this.createAnimations();
    }

    createAnimations() {
         this.scene.anims.create({
            key:'enemy_idle',
            frames: this.scene.anims.generateFrameNumbers('enemy_idle', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: 0
        });

        this.scene.anims.create({
            key:"enemy_walk",
            frames: this.scene.anims.generateFrameNumbers('enemy_walk', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.scene.anims.create({
            key:"enemy_death",
            frames: this.scene.anims.generateFrameNumbers('enemy_death', { start: 0, end: 9 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.scene.anims.create({
            key:"enemy_attack",
            frames: this.scene.anims.generateFrameNumbers('enemy_attack', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: 0
        });
        
        this.scene.anims.create({
            key:"enemy_hurt",
            frames: this.scene.anims.generateFrameNumbers('enemy_hurt', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: 0
        });
    }
}