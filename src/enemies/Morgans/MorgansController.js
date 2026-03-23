import BaseEnemy from "../BaseEnemy.js";

export default class MorgansController extends BaseEnemy {
  constructor(scene, enemy, player) {
    super(scene, enemy, player, {
      maxHp: 40,
      attackDamage: 12,
      speed: 80,
      attackRange: 500,
      attackCooldown: 1500,
      postDamageCooldown: 600,
      hurtDuration: 200,
      knockbackSpeed: 30,
      deathDelay: 1700,
    });

    this.anims = {
      idle: "morgans_idle",
      walk: "morgans_walk",
      attack: "morgans_attack",
      hurt: "morgans_hit",
      death: "morgans_death",
    };

    // Volvemos al valor que no se veía "tan mal"
    this.floatY = 530;
    this.enemy.isMorgans = true;
    this.isDying = false;

    if (this.enemy.body) {
      this.enemy.body.setAllowGravity(false);
      // Hitbox estándar para evitar desajustes visuales
      this.enemy.setBodySize(60, 80);
      this.enemy.setOffset(40, 30);
      this.enemy.y = this.floatY;
    }

    this.playAnim("idle");
  }

  update() {
    if (this.isDead || this.isDying) {
      this.enemy.setVelocity(0, 0);
      return;
    }

    if (!super.update()) return;

    // Flotado suave original
    this.enemy.setVelocityY(0);
    this.enemy.y = Phaser.Math.Linear(this.enemy.y, this.floatY, 0.1);

    const dist = this.distanceToPlayer();

    if (dist < 220) {
      this.moveAwayFromPlayer();
    } else if (dist <= 500) {
      this._shoot();
    } else {
      this.moveTowardsPlayer();
    }
  }

  die() {
    if (this.isDying || this.isDead) return;
    this.isDying = true;

    // Ocultar UI
    if (this.enemy.hpBar) this.enemy.hpBar.setVisible(false);
    if (this.enemy.hpBarBg) this.enemy.hpBarBg.setVisible(false);
    if (this.enemy.nameLabel) this.enemy.nameLabel.setVisible(false);

    // Dejar que BaseEnemy maneje muerte, drops y cleanup
    super.die();
  }

  _shoot() {
    this.enemy.setVelocityX(0);
    const dir = this.player.x - this.enemy.x;
    this.enemy.setFlipX(dir < 0);

    if (!this.canAttack()) {
      if (
        !this.enemy.anims.isPlaying ||
        this.enemy.anims.currentAnim.key !== this.anims.attack
      ) {
        this.playAnim("idle");
      }
      return;
    }

    this.registerAttack();
    this.playAnim("attack");

    this.scene.time.delayedCall(600, () => {
      if (this.enemy.active && !this.isDead && !this.isHurt) {
        this._spawnProjectile();
      }
    });
  }

  _spawnProjectile() {
    const direction = this.player.x > this.enemy.x ? 1 : -1;
    const bullet = this.scene.physics.add.sprite(
      this.enemy.x + direction * 40,
      this.enemy.y + 10,
      "shooter_projectile"
    );

    bullet.setTint(0xcc44ff);
    bullet.body.setAllowGravity(false);
    bullet.setScale(1.8).setCircle(15).setOffset(5, 5);
    bullet.setFlipX(direction > 0);
    bullet.damage = this.attackDamage;
    bullet.isMorgans = true;

    bullet.triggerExplosion = () => {
      if (!bullet.active) return;
      const exp = this.scene.add.sprite(bullet.x, bullet.y, "morgans_explode");
      exp.setScale(2.5).play("morgans_explode");
      exp.on("animationcomplete", () => exp.destroy());
      bullet.destroy();
    };

    if (this.scene.enemySystem?.bullets) {
      this.scene.enemySystem.bullets.add(bullet);
    }
    bullet.body.setVelocityX(direction * 350);
  }

  moveTowardsPlayer() {
    const dir = this.directionToPlayer();
    this.enemy.setVelocityX(dir > 0 ? this.speed : -this.speed);
    this.enemy.setFlipX(this.player.x - this.enemy.x < 0);
    this.playAnim("walk");
  }

  moveAwayFromPlayer() {
    const dir = this.directionToPlayer();
    const fleeDir = dir > 0 ? -1 : 1;
    this.enemy.setVelocityX(fleeDir * this.speed);
    this.enemy.setFlipX(this.player.x - this.enemy.x < 0);
    this.playAnim("walk");
  }
}
