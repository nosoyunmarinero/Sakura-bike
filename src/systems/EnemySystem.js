export default class EnemySystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.enemies = [];
        this.enemySpeed = 100;
        this.detectionRange = 400;
        this.attackRange = 70;
        this.attackCooldown = 400;
        this.attackDamage = 20;
        this.lastAttackTime = 0;
        this.bullets = this.scene.physics.add.group({ allowGravity: false });
    }

    // Devuelve la animation key correcta según el tipo de enemigo y el estado
    getAnim(enemy, state) {
        const type = (enemy.enemyData?.type || '').toLowerCase();
        const map = {
            skeleton: {
                idle:   'skeleton_idle',
                walk:   'skeleton_walk',
                attack: 'skeleton_attack',
                hurt:   'skeleton_hit',
                death:  'skeleton_dead',
            },
            shooter: {
                idle:   'shooter_idle',
                walk:   'shooter_flying',
                attack: 'shooter_attack',
                hurt:   'shooter_hurt',
                death:  'shooter_death',
            },
            morgans: {
                idle:   'morgans_idle',
                walk:   'morgans_walk',
                attack: 'morgans_attack',
                hurt:   'morgans_hit',
                death:  'morgans_death',
            },
        };
        return map[type]?.[state] ?? `enemy_${state}`;
    }

    addEnemy(enemy) {
        if (enemy && !this.enemies.includes(enemy)) {
            this.enemies.push(enemy);
            
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

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
        if (enemy && enemy.destroy) enemy.destroy();
        if (enemy && enemy.nameLabel) enemy.nameLabel.destroy();
        if (enemy && enemy.hpBarBg) enemy.hpBarBg.destroy();
        if (enemy && enemy.hpBar) enemy.hpBar.destroy();
    }

    update() {
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
                    if (max > 0) pct = cur / max;
                    if (pct < 0.001) pct = 0;
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

    updateEnemyBehavior(enemy) {
        const distanceToPlayer = Phaser.Math.Distance.Between(
            enemy.x, enemy.y,
            this.player.x, this.player.y
        );

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

    followPlayer(enemy) {
        const direction = this.player.x - enemy.x;
        const absDirection = Math.abs(direction);
        
        if (absDirection > 5) {
            let speed = enemy.enemyData.speed || this.enemySpeed;
            if (enemy.enemyData.type === 'Runner' && absDirection > 150) {
                speed = speed * 1.6;
            }
            const velocity = direction > 0 ? speed : -speed;
            enemy.setVelocityX(velocity);
            enemy.setFlipX(direction < 0);
            enemy.anims.play(this.getAnim(enemy, 'walk'), true);
            enemy.enemyData.isFollowing = true;
            enemy.enemyData.lastDirection = direction > 0 ? 1 : -1;
        } else {
            enemy.setVelocityX(0);
            enemy.anims.play(this.getAnim(enemy, 'idle'), true);
            enemy.enemyData.isFollowing = false;
        }
    }

    attackPlayer(enemy) {
        enemy.setVelocityX(0);
        
        const currentTime = this.scene.time.now;
        if (enemy.enemyData.postDamageTime && (currentTime - enemy.enemyData.postDamageTime < 1000)) {
            return;
        }
        if (currentTime - enemy.enemyData.lastAttackTime < this.attackCooldown) {
            return;
        }
        
        if (!enemy.enemyData.isAttacking) {
            enemy.anims.play(this.getAnim(enemy, 'attack'), true);
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

    createEnemyAttackZone(enemy) {
        const attackWidth = 50;
        const attackHeight = 40;
        const attackRange = 30;
        const direction = enemy.flipX ? -1 : 1;
        const attackX = enemy.x + (direction * attackRange);
        const attackY = enemy.y - 20;
        
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
        
        this.scene.time.delayedCall(100, () => {
            attackZone.destroy();
        });
    }

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
                if (this.scene.updateHealthBar) this.scene.updateHealthBar();
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

    idleEnemy(enemy) {
        enemy.setVelocityX(0);
        enemy.anims.play(this.getAnim(enemy, 'idle'), true);
        enemy.enemyData.isFollowing = false;
        enemy.enemyData.isAttacking = false;
    }

    clearAll() {
        this.enemies = [];
    }

    getActiveEnemies() {
        return this.enemies.filter(enemy => 
            enemy && enemy.active && enemy.enemyController && !enemy.enemyController.isDead
        );
    }
}