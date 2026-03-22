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
    }

    // Actualizar todos los enemigos
    update() {
        // 🔥 LIMPIEZA: remover referencias a enemigos inactivos o muertos
        this.enemies = this.enemies.filter(enemy => enemy && enemy.active && enemy.enemyController && !enemy.enemyController.isDead);
        this.enemies.forEach(enemy => {
            if (enemy && enemy.active && enemy.enemyController && !enemy.enemyController.isDead) {
                this.updateEnemyBehavior(enemy);
            }
        });
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
            const velocity = direction > 0 ? this.enemySpeed : -this.enemySpeed;
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
            
            // 🔥 CREAR ZONA DE ATAQUE PARA EL ENEMIGO
            this.createEnemyAttackZone(enemy);
            
            // 🔥 Resetear el estado de ataque
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
        
        // Verificar si el jugador está en la zona de ataque
        if (this.scene.physics.overlap(attackZone, this.player)) {
            // 🔥 APLICAR DAÑO AL JUGADOR
            this.damagePlayer();
        }
        
        // Destruir la zona después de un breve momento
        this.scene.time.delayedCall(100, () => {
            attackZone.destroy();
        });
    }

    // 🔥 NUEVO: Aplicar daño al jugador
    damagePlayer() {
        // Verificar si el GameScene tiene el método handlePlayerDamage
        if (this.scene.handlePlayerDamage && typeof this.scene.handlePlayerDamage === 'function') {
            this.scene.handlePlayerDamage(this.attackDamage);
            console.log(`¡El enemigo ha golpeado al jugador por ${this.attackDamage} de daño!`);
        } else {
            console.log('¡El enemigo ha golpeado al jugador!');
        }
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
