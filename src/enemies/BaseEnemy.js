import HealthSystem from "../systems/HealthSystem.js";

export default class BaseEnemy {
  constructor(scene, enemy, player, config = {}) {
    this.scene = scene;
    this.enemy = enemy;
    this.player = player;

    this.isHurt = false;
    this.isDead = false;
    this.isAttacking = false;

    this.maxHp = config.maxHp ?? 30;
    this.attackDamage = config.attackDamage ?? 10;
    this.speed = config.speed ?? 100;
    this.attackRange = config.attackRange ?? 70;
    this.attackCooldown = config.attackCooldown ?? 800;
    this.postDamageCooldown = config.postDamageCooldown ?? 1000;
    this.hurtDuration = config.hurtDuration ?? 300;
    this.knockbackSpeed = config.knockbackSpeed ?? 80;
    this.deathDelay = config.deathDelay ?? 1500;

    this.lastAttackTime = 0;

    this.healthSystem = new HealthSystem(scene, enemy, this.maxHp);
    this.healthSystem.onDeath.on("death", () => this.die());

    if (enemy.enemyData) {
      enemy.enemyData.attackDamage = this.attackDamage;
      enemy.enemyData.lastAttackTime = 0;
      enemy.enemyData.postDamageTime = 0;
      enemy.enemyData.isAttacking = false;
    }

    enemy.healthSystem = this.healthSystem;
    enemy.enemyController = this;
  }

  update() {
    if (this.isDead || this.isHurt || this.isAttacking) return false;
    return true;
  }

  distanceToPlayer() {
    return Phaser.Math.Distance.Between(
      this.enemy.x,
      this.enemy.y,
      this.player.x,
      this.player.y
    );
  }

  directionToPlayer() {
    return this.player.x - this.enemy.x;
  }

  facePlayer() {
    this.enemy.setFlipX(this.player.x < this.enemy.x);
  }

  takeDamage(amount = 10) {
    if (this.isHurt || this.isDead) return;

    const died = this.healthSystem.applyDamage(amount);
    if (died) return;

    this.isHurt = true;

    if (this.enemy.enemyData) {
      this.enemy.enemyData.postDamageTime = this.scene.time.now;
    }

    const dir = this.enemy.x < this.player.x ? -1 : 1;
    this.enemy.setVelocityX(dir * this.knockbackSpeed);
    this.playAnim("hurt");

    this.scene.time.delayedCall(this.hurtDuration, () => {
      this.isHurt = false;
      if (!this.isDead) this.playAnim("idle");
    });
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;
    this.isHurt = false;
    this.isAttacking = false;
    this.enemy.setVelocityX(0);
    this.enemy.body.enable = false;

    if (this.enemy.hpBar) {
      this.enemy.hpBar.width = 0;
      this.enemy.hpBar.x = this.enemy.x - 25;
    }

    this.playAnim("death");
    this.scene.onEnemyDeath?.(this.enemy);

    this.scene.time.delayedCall(this.deathDelay, () => {
      this.scene.enemySystem?.removeEnemy(this.enemy);
    });
  }

  canAttack() {
    const now = this.scene.time.now;
    const postDmg = this.enemy.enemyData?.postDamageTime ?? 0;
    if (now - postDmg < this.postDamageCooldown) return false;
    if (now - this.lastAttackTime < this.attackCooldown) return false;
    return true;
  }

  // Llama esto al inicio del ataque — bloquea hasta que termina el cooldown completo
  registerAttack() {
    this.lastAttackTime = this.scene.time.now;
    this.isAttacking = true;

    if (this.enemy.enemyData) this.enemy.enemyData.isAttacking = true;

    // Liberar solo cuando el cooldown completo haya pasado
    this.scene.time.delayedCall(this.attackCooldown, () => {
      this.isAttacking = false;
      if (this.enemy.enemyData) this.enemy.enemyData.isAttacking = false;
    });
  }

  playAnim(state) {
    const key = this.anims?.[state];
    if (key && this.enemy.anims) {
      this.enemy.anims.play(key, true);
    }
  }

  moveTowardsPlayer() {
    const dir = this.directionToPlayer();
    if (Math.abs(dir) > 5) {
      this.enemy.setVelocityX(dir > 0 ? this.speed : -this.speed);
      this.enemy.setFlipX(dir < 0);
      this.playAnim("walk");
    } else {
      this.enemy.setVelocityX(0);
      this.playAnim("idle");
    }
  }

  moveAwayFromPlayer() {
    const dir = this.directionToPlayer();
    const fleeDir = dir > 0 ? -1 : 1;
    this.enemy.setVelocityX(fleeDir * this.speed);
    this.enemy.setFlipX(dir < 0);
    this.playAnim("walk");
  }

  idle() {
    this.enemy.setVelocityX(0);
    this.facePlayer();
    this.playAnim("idle");
  }

  // delay: ms a esperar antes de aplicar el daño (para sincronizar con la animación)
  // damageWindow: ms que la zona permanece activa (golpe puede conectar en ese rango)
  createMeleeZone(
    width = 40,
    height = 40,
    range = 20,
    delay = 0,
    damageWindow = 150
  ) {
    this.scene.time.delayedCall(delay, () => {
      if (this.isDead) return;

      const dir = this.player.x > this.enemy.x ? 1 : -1;
      const zx = this.enemy.x + dir * range;
      const zy = this.enemy.y - 20;

      const zone = this.scene.add.zone(zx, zy, width, height);
      this.scene.physics.add.existing(zone);
      zone.body.setAllowGravity(false);

      let hit = false; // Solo un golpe por zona

      const controller = this.scene.sakuraController;
      const parryHit =
        controller?.parryActive &&
        this.scene.physics.overlap(zone, controller.parryZone);

      if (parryHit) {
        this.scene.enemySystem?.knockbackEnemiesAround();
        if (this.scene.playerHealthSystem?.heal) {
          this.scene.playerHealthSystem.heal(20);
          this.scene.updateHealthBar?.();
        }
        hit = true;
      } else if (!hit && this.scene.physics.overlap(zone, this.player)) {
        this.scene.enemySystem?.damagePlayer(this.enemy);
        hit = true;
      }

      this.scene.time.delayedCall(damageWindow, () => zone.destroy());
    });
  }
}
