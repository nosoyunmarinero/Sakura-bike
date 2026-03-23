class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // Background
    this.load.image("1", "./assets/background/Layers/1.png");
    this.load.image("2", "./assets/background/Layers/2.png");
    this.load.image("3", "./assets/background/Layers/3.png");
    this.load.image("4", "./assets/background/Layers/4.png");
    this.load.image("5", "./assets/background/Layers/5.png");
    this.load.image("6", "./assets/background/Layers/6.png");
    this.load.image("7", "./assets/background/Layers/7.png");
    this.load.image("8", "./assets/background/Layers/8.png");

    // Player
    this.load.spritesheet(
      "player_walk",
      "./assets/character/example/katana-walk.png",
      { frameWidth: 48, frameHeight: 48 }
    );
    this.load.spritesheet(
      "player_run",
      "./assets/character/example/player-run.png",
      { frameWidth: 48, frameHeight: 48 }
    );
    this.load.spritesheet(
      "player_idle",
      "./assets/character/example/player-idle.png",
      { frameWidth: 48, frameHeight: 48 }
    );
    this.load.spritesheet(
      "player_jump",
      "./assets/character/example/player-jump.png",
      { frameWidth: 48, frameHeight: 48 }
    );
    this.load.spritesheet(
      "player_attack",
      "./assets/character/example/player-attack.png",
      { frameWidth: 80, frameHeight: 48 }
    );
    this.load.spritesheet(
      "player_hurt",
      "./assets/character/example/player-hurt.png",
      { frameWidth: 48, frameHeight: 48 }
    );
    this.load.spritesheet(
      "player_death",
      "./assets/character/example/player-death.png",
      { frameWidth: 48, frameHeight: 48 }
    );
    this.load.spritesheet(
      "player_dash",
      "./assets/character/example/dash.png",
      { frameWidth: 48, frameHeight: 48 }
    );

    // Enemy genérico (Runner, Punisher, Grimm)
    this.load.spritesheet("enemy_idle", "./assets/enemy/enemy-idle.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("enemy_walk", "./assets/enemy/enemy-walk.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("enemy_death", "./assets/enemy/enemy-death.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("enemy_attack", "./assets/enemy/enemy-attack.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("enemy_hurt", "./assets/enemy/enemy-hurt.png", {
      frameWidth: 96,
      frameHeight: 96,
    });

    // Skeleton
    this.load.spritesheet(
      "skeleton_idle",
      "./assets/enemy/Skeleton/Skeleton Idle.png",
      { frameWidth: 24, frameHeight: 32 }
    );
    this.load.spritesheet(
      "skeleton_walk",
      "./assets/enemy/Skeleton/Skeleton Walk.png",
      { frameWidth: 22, frameHeight: 33 }
    );
    this.load.spritesheet(
      "skeleton_attack",
      "./assets/enemy/Skeleton/Skeleton Attack.png",
      { frameWidth: 43, frameHeight: 37 }
    );
    this.load.spritesheet(
      "skeleton_hit",
      "./assets/enemy/Skeleton/Skeleton Hit.png",
      { frameWidth: 30, frameHeight: 32 }
    );
    this.load.spritesheet(
      "skeleton_dead",
      "./assets/enemy/Skeleton/Skeleton Dead.png",
      { frameWidth: 33, frameHeight: 32 }
    );
    this.load.spritesheet(
      "skeleton_react",
      "./assets/enemy/Skeleton/Skeleton React.png",
      { frameWidth: 44, frameHeight: 32 }
    );

    // Shooter
    this.load.spritesheet("shooter_idle", "./assets/enemy/Shooter/IDLE.png", {
      frameWidth: 79,
      frameHeight: 69,
    });
    this.load.spritesheet(
      "shooter_flying",
      "./assets/enemy/Shooter/FLYING.png",
      { frameWidth: 79, frameHeight: 69 }
    );
    this.load.spritesheet(
      "shooter_attack",
      "./assets/enemy/Shooter/ATTACK.png",
      { frameWidth: 79, frameHeight: 69 }
    );
    this.load.spritesheet("shooter_hurt", "./assets/enemy/Shooter/HURT.png", {
      frameWidth: 79,
      frameHeight: 69,
    });
    this.load.spritesheet("shooter_death", "./assets/enemy/Shooter/DEATH.png", {
      frameWidth: 69,
      frameHeight: 69,
    });
    this.load.spritesheet(
      "shooter_projectile",
      "./assets/enemy/Shooter/projectile.png",
      { frameWidth: 48, frameHeight: 32 }
    );

    // Morgans
    this.load.spritesheet("morgans_idle", "./assets/enemy/Morgans/Idle.png", {
      frameWidth: 140,
      frameHeight: 140,
    });
    this.load.spritesheet("morgans_walk", "./assets/enemy/Morgans/Walk.png", {
      frameWidth: 140,
      frameHeight: 140,
    });
    this.load.spritesheet("morgans_run", "./assets/enemy/Morgans/Run.png", {
      frameWidth: 140,
      frameHeight: 140,
    });
    this.load.spritesheet(
      "morgans_attack",
      "./assets/enemy/Morgans/Attack.png",
      { frameWidth: 140, frameHeight: 140 }
    );
    this.load.spritesheet("morgans_jump", "./assets/enemy/Morgans/Jump.png", {
      frameWidth: 140,
      frameHeight: 140,
    });
    this.load.spritesheet("morgans_fall", "./assets/enemy/Morgans/Fall.png", {
      frameWidth: 140,
      frameHeight: 140,
    });
    this.load.spritesheet("morgans_hit", "./assets/enemy/Morgans/Get hit.png", {
      frameWidth: 140,
      frameHeight: 140,
    });
    this.load.spritesheet("morgans_death", "./assets/enemy/Morgans/Death.png", {
      frameWidth: 140,
      frameHeight: 140,
    });
    this.load.spritesheet(
      "morgans_explode",
      "./assets/enemy/Morgans/Explode.png",
      { frameWidth: 50, frameHeight: 50 }
    );
    this.load.spritesheet(
      "morgans_moving",
      "./assets/enemy/Morgans/Moving.png",
      { frameWidth: 50, frameHeight: 50 }
    );
  }

  create() {
    this.scene.start("StartScene");
  }

  update() {}
}

export default PreloadScene;
