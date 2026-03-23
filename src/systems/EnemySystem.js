export default class EnemySystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.enemies = [];
    this.bullets = this.scene.physics.add.group({ allowGravity: false });
  }

  addEnemy(enemy) {
    if (!enemy || this.enemies.includes(enemy)) return;
    this.enemies.push(enemy);

    if (!enemy.enemyData) {
      enemy.enemyData = {
        isFollowing: false,
        isAttacking: false,
        lastDirection: 0,
        lastAttackTime: 0,
        postDamageTime: 0,
      };
    }

    const name = enemy.enemyData.type || "Enemy";
    enemy.nameLabel = this.scene.add
      .text(enemy.x, enemy.y - 60, name, {
        fontSize: "14px",
        fill: "#ffffff",
      })
      .setDepth(120);

    const barWidth = 50;
    enemy.hpBarBg = this.scene.add
      .rectangle(enemy.x, enemy.y - 45, barWidth, 6, 0x000000)
      .setDepth(119);
    enemy.hpBar = this.scene.add
      .rectangle(enemy.x, enemy.y - 45, barWidth, 6, 0xff3333)
      .setDepth(121);
  }

  removeEnemy(enemy) {
    const index = this.enemies.indexOf(enemy);
    if (index > -1) this.enemies.splice(index, 1);
    enemy?.nameLabel?.destroy();
    enemy?.hpBarBg?.destroy();
    enemy?.hpBar?.destroy();
    enemy?.destroy?.();
  }

  update() {
    this.enemies = this.enemies.filter(
      (e) => e?.active && e.enemyController && !e.enemyController.isDead
    );

    this.enemies.forEach((enemy) => {
      if (
        !enemy?.active ||
        !enemy.enemyController ||
        enemy.enemyController.isDead
      )
        return;

      // Delegar todo el comportamiento al controller individual
      enemy.enemyController.update();

      if (enemy.nameLabel) {
        enemy.nameLabel.x = enemy.x;
        enemy.nameLabel.y = enemy.y - 60;
      }

      if (enemy.hpBarBg && enemy.hpBar && enemy.healthSystem) {
        const max = enemy.healthSystem.getMaxHealth();
        const cur = enemy.healthSystem.getHealth();
        let pct = max > 0 ? cur / max : 0;
        if (pct < 0.001) pct = 0;
        pct = Phaser.Math.Clamp(pct, 0, 1);

        const barWidth = 50;
        enemy.hpBarBg.x = enemy.x;
        enemy.hpBarBg.y = enemy.y - 45;
        enemy.hpBar.y = enemy.y - 45;
        enemy.hpBar.width = barWidth * pct;
        enemy.hpBar.x = enemy.x - barWidth / 2 + enemy.hpBar.width / 2;
      }
    });

    this.updateBullets();
  }

  spawnBullet(enemy, speedX = 250) {
    const direction = enemy.flipX ? -1 : 1;
    const bx = enemy.x + direction * 20;
    const by = enemy.y - 20;

    const visual = this.scene.add.rectangle(bx, by, 8, 8, 0xff4444);
    const zone = this.scene.add.zone(bx, by, 8, 8);
    this.scene.physics.add.existing(zone);
    zone.body.setAllowGravity(false);
    zone.body.setVelocityX(direction * speedX);
    zone.visual = visual;
    zone.reflected = false;
    zone.sourceEnemy = enemy;
    this.bullets.add(zone);
  }

  updateBullets() {
    this.bullets.getChildren().forEach((b) => {
      if (!b.active) return;

      if (b.visual) {
        b.visual.x = b.x;
        b.visual.y = b.y;
      }

      const controller = this.scene.sakuraController;
      const parryHit =
        controller?.parryActive &&
        this.scene.physics.overlap(b, controller.parryZone);

      if (parryHit && !b.reflected) {
        b.reflected = true;
        b.body.setVelocityX(-b.body.velocity.x);
        if (this.scene.playerHealthSystem?.heal) {
          this.scene.playerHealthSystem.heal(20);
          this.scene.updateHealthBar?.();
        }
        return;
      }

      if (b.reflected) {
        this.enemies.forEach((enemy) => {
          if (enemy?.active && this.scene.physics.overlap(b, enemy)) {
            enemy.enemyController?.takeDamage();
            b.visual?.destroy();
            b.destroy();
          }
        });
        return;
      }

      if (this.scene.physics.overlap(b, this.player)) {
        if (controller?.parryActive) {
          b.reflected = true;
          b.body.setVelocityX(-b.body.velocity.x);
        } else {
          const dmg = b.sourceEnemy?.enemyData?.attackDamage ?? 10;
          this.scene.handlePlayerDamage?.(dmg);
          b.visual?.destroy();
          b.destroy();
        }
        return;
      }

      if (b.x < -6000 || b.x > 6000) {
        b.visual?.destroy();
        b.destroy();
      }
    });
  }

  damagePlayer(enemy) {
    const controller = this.scene.sakuraController;
    const now = this.scene.time.now;

    if (controller?.parryActive) {
      const delta = now - controller.parryStartTime;
      if (this.scene.playerHealthSystem?.heal) {
        this.scene.playerHealthSystem.heal(20);
        if (delta <= controller.parryPerfectMs) this.knockbackEnemiesAround();
        this.scene.updateHealthBar?.();
      }
      return;
    }

    const dmg = enemy?.enemyData?.attackDamage ?? 10;
    this.scene.handlePlayerDamage?.(dmg);
  }

  knockbackEnemiesAround() {
    this.enemies.forEach((enemy) => {
      if (enemy?.body) {
        const dir = enemy.x < this.player.x ? -1 : 1;
        enemy.setVelocityX(dir * -200);
      }
    });
  }

  clearAll() {
    this.enemies = [];
  }

  getActiveEnemies() {
    return this.enemies.filter(
      (e) => e?.active && e.enemyController && !e.enemyController.isDead
    );
  }
}
