import BaseEnemy from "../BaseEnemy.js";

export default class ShooterController extends BaseEnemy {
  constructor(scene, enemy, player) {
    super(scene, enemy, player, {
      maxHp: 20,
      attackDamage: 8,
      speed: 60,
      attackRange: 350,
      attackCooldown: 2200,
      postDamageCooldown: 800,
      hurtDuration: 250,
      knockbackSpeed: 40,
      deathDelay: 1000,
    });

    this.anims = {
      idle: "shooter_idle",
      walk: "shooter_flying",
      attack: "shooter_attack",
      hurt: "shooter_hurt",
      death: "shooter_death",
    };

    this.preferredMinRange = 180;
    this.shootRange = 350;
    this.floatY = 460;

    if (enemy.enemyData) {
      enemy.enemyData.type = "Shooter";
      enemy.enemyData.attackType = "ranged";
    }

    enemy.body.setAllowGravity(false);
    enemy.setBodySize(30, 40);
    enemy.setOffset(25, 20);

    this.playAnim("idle");
  }

  update() {
    if (!super.update()) return;

    this.enemy.setVelocityY(0);
    if (Math.abs(this.enemy.y - this.floatY) > 1) {
      this.enemy.y = Phaser.Math.Linear(this.enemy.y, this.floatY, 0.1);
    }

    const dist = this.distanceToPlayer();

    if (dist < this.preferredMinRange) {
      this.moveAwayFromPlayer();
    } else if (dist <= this.shootRange) {
      this._shoot();
    } else {
      this.moveTowardsPlayer();
    }
  }

  facePlayer() {
    const dir = this.player.x - this.enemy.x;
    this.enemy.setFlipX(dir > 0);
  }

  _shoot() {
    this.enemy.setVelocityX(0);
    this.facePlayer();

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
    const bx = this.enemy.x + direction * 40;
    const by = this.enemy.y + 10;

    const bullet = this.scene.physics.add.sprite(bx, by, "shooter_projectile");

    // FISICA: Forzar cuerpo dinámico
    bullet.body.setAllowGravity(false);
    bullet.setScale(1.2);
    bullet.setBodySize(32, 20);
    bullet.setOffset(8, 6);

    // FLIP: Si la imagen original mira a la IZQUIERDA:
    // Si direction es 1 (derecha), necesitamos flipX = true.
    // Si direction es -1 (izquierda), necesitamos flipX = false.
    bullet.setFlipX(direction > 0);

    const speed = 350;

    // PROPIEDADES CUSTOM
    bullet.reflected = false;
    bullet.sourceEnemy = this.enemy;
    bullet.damage = this.attackDamage;
    bullet.isMorgans = this.enemy.isMorgans || false;

    // AÑADIR AL GRUPO Y LUEGO SETEAR VELOCIDAD
    // Esto evita que el grupo resetee la velocidad a 0
    if (this.scene.enemySystem && this.scene.enemySystem.bullets) {
      this.scene.enemySystem.bullets.add(bullet);
    }

    bullet.body.setVelocityX(direction * speed);

    this.scene.time.delayedCall(3000, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  moveTowardsPlayer() {
    const dir = this.directionToPlayer();
    this.enemy.setVelocityX(dir > 0 ? this.speed : -this.speed);
    this.enemy.setFlipX(dir > 0);
    this.playAnim("walk");
  }

  moveAwayFromPlayer() {
    const dir = this.directionToPlayer();
    const fleeDir = dir > 0 ? -1 : 1;
    this.enemy.setVelocityX(fleeDir * this.speed);
    this.enemy.setFlipX(dir > 0);
    this.playAnim("walk");
  }
}
