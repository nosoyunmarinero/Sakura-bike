import AttackSystem from "../systems/AttackSystem.js";

export default class SakuraController {
  constructor(scene, sakura) {
    this.scene = scene;
    this.sakura = sakura;

    this.stateConfig = {
      normal: {
        width: 25, height: 30,
        offsetX: 10, offsetY: 10,
        originX: 0.5, originY: 1.0,
      },
      attack: {
        width: 25, height: 30,
        offsetX: 30, offsetY: 18,
        originX: 0.5, originY: 1.1,
      },
    };

    this.attackSystem = new AttackSystem(scene, sakura);
    this.enemies = [];

    this.wasd = scene.input.keyboard.addKeys("W,S,A,D");
    this.keys = scene.input.keyboard.addKeys({
      j: Phaser.Input.Keyboard.KeyCodes.J,
      k: Phaser.Input.Keyboard.KeyCodes.K,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.moveSpeed = 350;
    this.isAttacking = false;
    this.isJumping = false;
    this.isDashing = false;
    this.canMove = true;
    this.isDead = false;
    this.isMovingByGamepad = false; // 🔥 flag para que el gamepad informe que está moviendo
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.chainHits = 0;
    this.parryActive = false;
    this.parryStartTime = 0;
    this.parryWindowMs = 250;
    this.parryPerfectMs = 80;
    this.parryCooldownMs = 800;
    this.lastParryTime = 0;
    this.parryZone = this.scene.add.zone(0, 0, 40, 60);
    this.scene.physics.add.existing(this.parryZone);
    this.parryZone.body.setAllowGravity(false);
    this.parryZone.setVisible(false);

    this.setupControls();
    this.setState("normal");
  }

  setState(state) {
    const config = this.stateConfig[state];
    this.sakura.body.setSize(config.width, config.height);
    this.sakura.body.setOffset(config.offsetX, config.offsetY);
    this.sakura.setOrigin(config.originX, config.originY);
  }

  setupControls() {
    this.keys.j.on("down", () => this.attack());
    this.keys.k.on("down", () => this.parry());
    this.keys.shift.on("down", () => this.dash());
    this.keys.space.on("down", () => this.jump());
  }

  update() {
    if (this.isDead) {
      this.sakura.setVelocityX(0);
      return;
    }

    this.attackSystem.update();
    const dir = this.sakura.flipX ? -1 : 1;
    this.parryZone.x = this.sakura.x + dir * 30;
    this.parryZone.y = this.sakura.y - 20;

    if (this.isAttacking) {
      this.setState("attack");
    } else {
      this.setState("normal");
    }

    // Movimiento: solo aplica teclado si el gamepad NO está moviendo
    if (this.canMove && !this.isDashing && !this.isMovingByGamepad) {
      if (this.wasd.A.isDown) {
        this.sakura.setVelocityX(-this.moveSpeed);
        this.sakura.setFlipX(true);
      } else if (this.wasd.D.isDown) {
        this.sakura.setVelocityX(this.moveSpeed);
        this.sakura.setFlipX(false);
      } else {
        this.sakura.setVelocityX(0);
      }
    }

    // Resetear el flag cada frame — GamepadSystem lo vuelve a setear si sigue activo
    this.isMovingByGamepad = false;

    // Animaciones
    if (this.isDashing) {
      // sakura-dash corre sola
    } else if (!this.isAttacking && !this.isJumping) {
      const isMoving = Math.abs(this.sakura.body.velocity.x) > 10;
      if (isMoving) {
        this.sakura.anims.play("sakura-walk", true);
      } else {
        this.sakura.anims.play("sakura-idle", true);
      }
    }

    // Detectar aterrizaje
    if (this.isJumping && this.sakura.body.blocked.down) {
      this.isJumping = false;
      this.sakura.anims.stop();
      this.setState("normal");
    }
  }

  attack() {
    if (this.isDead || this.isAttacking) return;

    this.isAttacking = true;
    this.sakura.anims.play("sakura-attack", true);
    this.setState("attack");

    const hitDetected = this.attackSystem.checkAttackHit(this.enemies);
    if (hitDetected) this.registerHit();

    this.scene.time.delayedCall(380, () => {
      this.isAttacking = false;
      this.setState("normal");
    });
  }

  jump() {
    if (this.isDead || this.isJumping || !this.sakura.body.blocked.down) return;
    this.isJumping = true;
    this.sakura.setVelocityY(-400);
    this.sakura.anims.play("sakura-jump", true);
  }

  parry() {
    if (this.isDead) return;
    const now = this.scene.time.now;
    if (now - this.lastParryTime < this.parryCooldownMs) return;
    this.lastParryTime = now;
    this.parryActive = true;
    this.parryStartTime = this.scene.time.now;
    this.sakura.anims.play("sakura-idle", true);
    this.sakura.setTint(0x99ccff);
    this.scene.time.delayedCall(this.parryWindowMs, () => {
      this.parryActive = false;
      this.sakura.clearTint();
    });
  }

  dash() {
    if (this.isDead || this.isDashing || !this.canMove) return;
    this.isDashing = true;
    const direction = this.sakura.flipX ? -1 : 1;
    this.sakura.setVelocityX(direction * 600);
    this.sakura.anims.play("sakura-dash", true);
    if (this.scene.playerHealthSystem) {
      this.scene.playerHealthSystem.setInvulnerable(250);
    }
    this.scene.time.delayedCall(250, () => {
      this.isDashing = false;
    });
  }

  registerHit() {
    this.comboCount++;
    this.chainHits++;
    if (this.comboCount % 5 === 0) {
      this.comboMultiplier = Math.min(3, this.comboMultiplier + 1);
    }
    if (this.chainHits % 3 === 0) {
      this.attackSystem.spawnFinisherAoE(this.enemies);
    }
    if (this.scene.updateComboUI) {
      this.scene.updateComboUI(this.comboCount, this.comboMultiplier);
    }
  }

  resetCombo() {
    this.comboCount = 0;
    this.comboMultiplier = 1;
    this.chainHits = 0;
    if (this.scene.updateComboUI) {
      this.scene.updateComboUI(this.comboCount, this.comboMultiplier);
    }
  }

  setDead(isDead) {
    this.isDead = isDead;
    this.canMove = !isDead;
    this.sakura.setVelocityX(0);
    if (isDead) this.sakura.anims.stop();
  }

  addEnemy(enemy) {
    if (enemy && !this.enemies.includes(enemy)) this.enemies.push(enemy);
  }

  clearEnemies() {
    this.enemies = [];
  }

  setCanMove(canMove) {
    this.canMove = canMove;
    if (!canMove) this.sakura.setVelocityX(0);
  }
}