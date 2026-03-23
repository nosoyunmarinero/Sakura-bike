export default class MorgansAnims {
  constructor(scene) {
    this.scene = scene;
    this.create();
  }

  create() {
    this.scene.anims.create({
      key: "morgans_idle",
      frames: this.scene.anims.generateFrameNumbers("morgans_idle", {
        start: 0,
        end: 9,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "morgans_walk",
      frames: this.scene.anims.generateFrameNumbers("morgans_walk", {
        start: 0,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "morgans_run",
      frames: this.scene.anims.generateFrameNumbers("morgans_run", {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "morgans_attack",
      frames: this.scene.anims.generateFrameNumbers("morgans_attack", {
        start: 0,
        end: 12,
      }),
      frameRate: 12,
      repeat: 0,
    });
    this.scene.anims.create({
      key: "morgans_jump",
      frames: this.scene.anims.generateFrameNumbers("morgans_jump", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: 0,
    });
    this.scene.anims.create({
      key: "morgans_fall",
      frames: this.scene.anims.generateFrameNumbers("morgans_fall", {
        start: 0,
        end: 2,
      }),
      frameRate: 8,
      repeat: 0,
    });
    this.scene.anims.create({
      key: "morgans_hit",
      frames: this.scene.anims.generateFrameNumbers("morgans_hit", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.scene.anims.create({
      key: "morgans_death",
      frames: this.scene.anims.generateFrameNumbers("morgans_death", {
        start: 0,
        end: 17,
      }),
      frameRate: 10,
      repeat: 0,
    });
    this.scene.anims.create({
      key: "morgans_explode",
      frames: this.scene.anims.generateFrameNumbers("morgans_explode", {
        start: 0,
        end: 6,
      }),
      frameRate: 12,
      repeat: 0,
    });
  }
}
