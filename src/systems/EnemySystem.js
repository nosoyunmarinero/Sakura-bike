export default class EnemySystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.enemies = [];
        this.enemySpeed = 100; // Velocidad de movimiento de los enemigos
        this.detectionRange = 400; // Rango de detección del jugador
        this.attackRange = 70; // 🔥 AUMENTADO: Rango de ataque (de 60 a 70)
        this.attackCooldown = 400; // 🔥 REDUCIDO: Tiempo entre ataques (de 1000ms a 300ms)
        this.attackDamage = 20; // Daño por ataque (20 para que muera en 6 golpes)
        this.lastAttackTime = 0; // Para controlar el cooldown
        this.bullets = this.scene.physics.add.group({ allowGravity: false });
    }

    // Agregar un enemigo al sistema
    addEnemy(enemy) {
        if (enemy && !this.enemies.includes(enemy)) {
            this.enemies.push(enemy);
            
            // Asegurar que el enemigo tenga las propiedades necesarias
            if (!enemy.enemyData) {
                enemy.enemyData = {
                    isFollowing: false,
                    isAttacking: false,
                    lastDirection: 0,
                    lastAttackTime: 0
                };
            }
            const name = enemy.enemyData.type || 'Enemy';
            enemy.nameLabel = this.scene.add.text(enemy.x, enemy.y - 60, name, { fontSize: '14px', fill: '#ffffff' });
            enemy.nameLabel.setDepth(120);
            const barWidth = 50;
            enemy.hpBarBg = this.scene.add.rectangle(enemy.x, enemy.y - 45, barWidth, 6, 0x000000);
            enemy.hpBarBg.setDepth(119);
            enemy.hpBar = this.scene.add.rectangle(enemy.x, enemy.y - 45, barWidth, 6, 0xff3333);
            enemy.hpBar.setDepth(121);
        }
    }

    // Eliminar un enemigo del sistema
    // 🔥 MÉTODO PARA REMOVER ENEMIGO
    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        
        // Limpiar el enemigo
        if (enemy && enemy.destroy) {
            enemy.destroy();
        }
        if (enemy && enemy.nameLabel) {
            enemy.nameLabel.destroy();
        }
        if (enemy && enemy.hpBarBg) enemy.hpBarBg.destroy();
        if (enemy && enemy.hpBar) enemy.hpBar.destroy();
    }

    // Actualizar todos los enemigos
    update() {
        // 🔥 LIMPIEZA: remover referencias a enemigos inactivos o muertos
        this.enemies = this.enemies.filter(enemy => enemy && enemy.active && enemy.enemyController && !enemy.enemyController.isDead);
        this.enemies.forEach(enemy => {
            if (enemy && enemy.active && enemy.enemyController && !enemy.enemyController.isDead) {
                this.updateEnemyBehavior(enemy);
                if (enemy.nameLabel) {
                    enemy.nameLabel.x = enemy.x;
                    enemy.nameLabel.y = enemy.y - 60;
                }
                if (enemy.hpBarBg && enemy.hpBar && enemy.healthSystem) {
                    const max = enemy.healthSystem.getMaxHealth ? enemy.healthSystem.getMaxHealth() : enemy.healthSystem.maxHealth;
                    const cur = enemy.healthSystem.getHealth ? enemy.healthSystem.getHealth() : enemy.healthSystem.currentHealth;
                    let pct = 0;
                    if (max > 0) {
                        pct = cur / max;
                    }
                    if (pct < 0.001) pct = 0; // evitar “sobras” por flotantes
                    pct = Phaser.Math.Clamp(pct, 0, 1);
                    const barWidth = 50;
                    enemy.hpBarBg.x = enemy.x;
                    enemy.hpBarBg.y = enemy.y - 45;
                    enemy.hpBar.y = enemy.y - 45;
                    enemy.hpBar.width = barWidth * pct;
                    enemy.hpBar.x = enemy.x - (barWidth / 2) + enemy.hpBar.width / 2;
                }
            }
        });
        this.updateBullets();
    }

    // Actualizar el comportamiento de un enemigo individual
    updateEnemyBehavior(enemy) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

        // Si el enemigo está herido o muerto, no hacer nada
        if (enemy.enemyController.isHurt || enemy.enemyController.isDead) {
            enemy.setVelocityX(0);
            return;
        }

        if (distanceToPlayer <= this.attackRange) {
            this.attackPlayer(enemy);
        } else {
            this.followPlayer(enemy);
        }
    }

    // Seguir al jugador
    followPlayer(enemy) {
        const direction = this.player.x - enemy.x;
        const absDirection = Math.abs(direction);
        
        if (absDirection > 5) { // Pequeña tolerancia para evitar micro-movimientos
            let speed = enemy.enemyData.speed || this.enemySpeed;
            if (enemy.enemyData.type === 'Runner' && absDirection > 150) {
                speed = speed * 1.6;
            }
            const velocity = direction > 0 ? speed : -speed;
            enemy.setVelocityX(velocity);
            
            // Hacer que el enemigo mire en la dirección correcta
            enemy.setFlipX(direction < 0);
            
            // Reproducir animación de caminar
            enemy.anims.play('enemy_walk', true);
            
            // Actualizar datos del enemigo
            enemy.enemyData.isFollowing = true;
            enemy.enemyData.lastDirection = direction > 0 ? 1 : -1;
        } else {
            // Si está muy cerca en X, detenerse
            enemy.setVelocityX(0);
            enemy.anims.play('enemy_idle', true);
            enemy.enemyData.isFollowing = false;
        }
    }

    // Atacar al jugador
    attackPlayer(enemy) {
        // Detener el movimiento
        enemy.setVelocityX(0);
        
        // 🔥 VERIFICAR POST-DAMAGE COOLDOWN
        const currentTime = this.scene.time.now;
        if (enemy.enemyData.postDamageTime && (currentTime - enemy.enemyData.postDamageTime < 1000)) {
            return; // Aún en post-damage cooldown
        }
        
        // Verificar cooldown individual del enemigo
        if (currentTime - enemy.enemyData.lastAttackTime < this.attackCooldown) {
            return; // Aún en cooldown normal
        }
        
        // Reproducir animación de ataque si no está ya atacando
        if (!enemy.enemyData.isAttacking) {
            enemy.anims.play('enemy_attack', true);
            enemy.enemyData.isAttacking = true;
            enemy.enemyData.lastAttackTime = currentTime;
            if (enemy.enemyData.attackType === 'ranged') {
                const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                if (dist >= 160) {
                    this.spawnEnemyProjectile(enemy);
                } else {
                    this.createEnemyAttackZone(enemy);
                }
            } else if (enemy.enemyData.attackType === 'hybrid') {
                if (Math.random() < 0.5) {
                    this.spawnEnemyProjectile(enemy);
                } else {
                    this.createEnemyAttackZone(enemy);
                }
            } else {
                this.createEnemyAttackZone(enemy);
            }
            this.scene.time.delayedCall(200, () => {
                enemy.enemyData.isAttacking = false;
            });
        }
    }

    // 🔥 NUEVO: Crear zona de ataque para el enemigo
    createEnemyAttackZone(enemy) {
        // Configurar el área de ataque del enemigo
        const attackWidth = 50;
        const attackHeight = 40;
        const attackRange = 30;
        
        // Calcular posición del ataque basada en la dirección del enemigo
        const direction = enemy.flipX ? -1 : 1;
        const attackX = enemy.x + (direction * attackRange);
        const attackY = enemy.y - 20;
        
        // Crear zona de ataque temporal
        const attackZone = this.scene.add.zone(attackX, attackY, attackWidth, attackHeight);
        this.scene.physics.add.existing(attackZone);
        attackZone.body.setAllowGravity(false);
        
        const controller = this.scene.sakuraController;
        const parryHit = controller && controller.parryActive && this.scene.physics.overlap(attackZone, controller.parryZone);
        if (parryHit) {
            if (this.scene.playerHealthSystem && typeof this.scene.playerHealthSystem.heal === 'function') {
                this.scene.playerHealthSystem.heal(20);
                if (this.scene.updateHealthBar) this.scene.updateHealthBar();
            }
            this.knockbackEnemiesAround();
        } else if (this.scene.physics.overlap(attackZone, this.player)) {
            this.damagePlayer(enemy);
        }
        
        // Destruir la zona después de un breve momento
        this.scene.time.delayedCall(100, () => {
            attackZone.destroy();
        });
    }

    // 🔥 NUEVO: Aplicar daño al jugador
    damagePlayer(enemy) {
        const controller = this.scene.sakuraController;
        const now = this.scene.time.now;
        if (controller && controller.parryActive) {
            const delta = now - controller.parryStartTime;
            if (this.scene.playerHealthSystem && typeof this.scene.playerHealthSystem.heal === 'function') {
                const healAmount = 20;
                this.scene.playerHealthSystem.heal(healAmount);
                if (delta <= controller.parryPerfectMs) {
                    this.knockbackEnemiesAround();
                }
                if (this.scene.updateHealthBar) {
                    this.scene.updateHealthBar();
                }
            }
            return;
        }
        if (this.scene.handlePlayerDamage && typeof this.scene.handlePlayerDamage === 'function') {
            const dmg = (enemy && enemy.enemyData && enemy.enemyData.attackDamage) ? enemy.enemyData.attackDamage : this.attackDamage;
            this.scene.handlePlayerDamage(dmg);
        }
    }

    knockbackEnemiesAround() {
        this.enemies.forEach(enemy => {
            if (enemy && enemy.body) {
                const dir = enemy.x < this.player.x ? -1 : 1;
                enemy.setVelocityX(dir * -200);
            }
        });
    }

    spawnEnemyProjectile(enemy) {
        const direction = enemy.flipX ? -1 : 1;
        const bullet = this.scene.add.rectangle(enemy.x + direction * 20, enemy.y - 20, 8, 8, 0xff4444);
        const zone = this.scene.add.zone(bullet.x, bullet.y, 8, 8);
        this.scene.physics.add.existing(zone);
        zone.body.setAllowGravity(false);
        zone.body.setVelocityX(direction * 250);
        zone.visual = bullet;
        zone.reflected = false;
        zone.sourceEnemy = enemy;
        this.bullets.add(zone);
    }

    updateBullets() {
        this.bullets.getChildren().forEach(b => {
            if (!b.active) return;
            if (b.visual) {
                b.visual.x = b.x;
                b.visual.y = b.y;
            }
            const controller = this.scene.sakuraController;
            const parryHit = controller && controller.parryActive && this.scene.physics.overlap(b, controller.parryZone);
            if (parryHit) {
                b.reflected = true;
                b.body.setVelocityX(-b.body.velocity.x);
            if (this.scene.playerHealthSystem && typeof this.scene.playerHealthSystem.heal === 'function') {
                    this.scene.playerHealthSystem.heal(20);
                    if (this.scene.updateHealthBar) this.scene.updateHealthBar();
                }
            } else if (this.scene.physics.overlap(b, this.player)) {
                const controller = this.scene.sakuraController;
                if (controller && controller.parryActive && !b.reflected) {
                    b.reflected = true;
                    b.body.setVelocityX(-b.body.velocity.x);
                } else {
                    const dmg = (b.sourceEnemy && b.sourceEnemy.enemyData && b.sourceEnemy.enemyData.attackDamage) ? b.sourceEnemy.enemyData.attackDamage : this.attackDamage;
                    if (this.scene.handlePlayerDamage) this.scene.handlePlayerDamage(dmg);
                    if (b.visual) b.visual.destroy();
                    b.destroy();
                }
            }
            if (b.reflected) {
                this.enemies.forEach(enemy => {
                    if (enemy && enemy.active && this.scene.physics.overlap(b, enemy)) {
                        if (enemy.enemyController) enemy.enemyController.takeDamage();
                        if (b.visual) b.visual.destroy();
                        b.destroy();
                    }
                });
            }
            if (b.x < -6000 || b.x > 6000) {
                if (b.visual) b.visual.destroy();
                b.destroy();
            }
        });
    }

    // Enemigo en estado idle (quieto)
    idleEnemy(enemy) {
        enemy.setVelocityX(0);
        enemy.anims.play('enemy_idle', true);
        enemy.enemyData.isFollowing = false;
        enemy.enemyData.isAttacking = false;
    }

    // Limpiar todos los enemigos
    clearAll() {
        this.enemies = [];
    }

    // Obtener enemigos vivos
    getActiveEnemies() {
        return this.enemies.filter(enemy => 
            enemy && enemy.active && enemy.enemyController && !enemy.enemyController.isDead
        );
    }
}
