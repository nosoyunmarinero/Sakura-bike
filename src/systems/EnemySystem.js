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

    // Mantenemos tu lógica original de enemyData.type
    if (!enemy.enemyData) {
      enemy.enemyData = {
        isFollowing: false,
        isAttacking: false,
        lastDirection: 0,
        lastAttackTime: 0,
        postDamageTime: 0,
        type: enemy.texture.key.split("_")[0],
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
    // Filtramos enemigos activos que no estén en proceso de morir
    this.enemies = this.enemies.filter(
      (e) =>
        e?.active &&
        e.enemyController &&
        !e.enemyController.isDying &&
        !e.enemyController.isDead
    );

    this.enemies.forEach((enemy) => {
      if (!enemy?.active || !enemy.enemyController) return;

      // Delegar comportamiento al controller
      enemy.enemyController.update();

      // Actualizar posición de UI
      if (enemy.nameLabel) {
        enemy.nameLabel.x = enemy.x - enemy.nameLabel.width / 2;
        enemy.nameLabel.y = enemy.y - 70;
      }

      if (enemy.hpBarBg && enemy.hpBar && enemy.healthSystem) {
        const max = enemy.healthSystem.getMaxHealth();
        const cur = enemy.healthSystem.getHealth();
        let pct = Phaser.Math.Clamp(max > 0 ? cur / max : 0, 0, 1);

        const barWidth = 50;
        enemy.hpBarBg.x = enemy.x;
        enemy.hpBarBg.y = enemy.y - 55;
        enemy.hpBar.y = enemy.y - 55;
        enemy.hpBar.width = barWidth * pct;
        enemy.hpBar.x = enemy.x - barWidth / 2 + enemy.hpBar.width / 2;
      }
    });

    this.updateBullets();
  }

  _handleBulletDestruction(bullet) {
    // Si la bala tiene una función de explosión (Morgans), la ejecutamos
    if (bullet.isMorgans && typeof bullet.triggerExplosion === "function") {
      bullet.triggerExplosion();
    } else {
      if (bullet.visual) bullet.visual.destroy();
      bullet.destroy();
    }
  }

  updateBullets() {
    this.bullets.getChildren().forEach((b) => {
      if (!b || !b.active) return;

      // Sincronizar visual si existe (balas tipo zona)
      if (b.visual && b.visual.active) {
        b.visual.x = b.x;
        b.visual.y = b.y;
      }

      const controller = this.scene.sakuraController;
      const isParryActive = controller?.parryActive;

      // 1. Prioridad: Parry
      const parryHit =
        isParryActive && this.scene.physics.overlap(b, controller.parryZone);

      if (parryHit && !b.reflected) {
        b.reflected = true;
        if (b.body) b.body.setVelocityX(-b.body.velocity.x);
        if (b.setFlipX) b.setFlipX(!b.flipX);

        // Curación por parry exitoso
        if (this.scene.playerHealthSystem?.heal) {
          this.scene.playerHealthSystem.heal(50);
          this.scene.updateHealthBar?.();
        }
        return;
      }

      // 2. Colisión de balas reflejadas contra enemigos
      if (b.reflected) {
        for (let enemy of this.enemies) {
          if (enemy?.active && this.scene.physics.overlap(b, enemy)) {
            const damage = b.damage || 15;
            enemy.enemyController?.takeDamage(damage);
            this._handleBulletDestruction(b);
            return;
          }
        }
      }
      // 3. Colisión de balas normales contra el jugador
      else if (this.scene.physics.overlap(b, this.player)) {
        if (!isParryActive) {
          const dmg = b.damage || 10;
          this.scene.handlePlayerDamage?.(dmg);
          this._handleBulletDestruction(b);
          return;
        }
      }

      // Limpieza por distancia
      if (Math.abs(b.x - this.player.x) > 1500) {
        if (b.visual) b.visual.destroy();
        b.destroy();
      }
    });
  }

  damagePlayer(amount) {
    // Aseguramos que amount sea numérico para evitar el NaN
    const val = typeof amount === "number" ? amount : 10;
    this.scene.handlePlayerDamage?.(val);
  }

  knockbackEnemiesAround() {
    this.enemies.forEach((enemy) => {
      if (enemy?.body) {
        const dir = enemy.x < this.player.x ? -1 : 1;
        enemy.body.setVelocityX(dir * 200);
      }
    });
  }

  clearAll() {
    this.enemies.forEach((e) => {
      e.nameLabel?.destroy();
      e.hpBar?.destroy();
      e.hpBarBg?.destroy();
    });
    this.enemies = [];
    this.bullets.clear(true, true);
  }
}
