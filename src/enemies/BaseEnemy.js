import HealthSystem from '../systems/HealthSystem';

export default class BaseEnemy {
    constructor(scene, enemy, player, config = {}) {
        this.scene  = scene;
        this.enemy  = enemy;
        this.player = player;

        // ─── Estado ───────────────────────────────────────────────────────
        this.isHurt = false;
        this.isDead = false;

        // ─── Config con defaults ──────────────────────────────────────────
        this.maxHp              = config.maxHp              ?? 30;
        this.attackDamage       = config.attackDamage       ?? 10;
        this.speed              = config.speed              ?? 100;
        this.attackRange        = config.attackRange        ?? 70;
        this.attackCooldown     = config.attackCooldown     ?? 800;
        this.postDamageCooldown = config.postDamageCooldown ?? 1000;
        this.hurtDuration       = config.hurtDuration       ?? 300;
        this.knockbackSpeed     = config.knockbackSpeed     ?? 80;
        this.deathDelay         = config.deathDelay         ?? 1500;

        // Tiempo del último ataque (cada instancia lo lleva independiente)
        this.lastAttackTime = 0;

        // ─── Sistema de salud ─────────────────────────────────────────────
        this.healthSystem = new HealthSystem(scene, enemy, this.maxHp);
        this.healthSystem.onDeath.on('death', () => this.die());

        // Sincronizar attackDamage en enemyData para que EnemySystem lo lea
        if (enemy.enemyData) {
            enemy.enemyData.attackDamage  = this.attackDamage;
            enemy.enemyData.lastAttackTime = 0;
            enemy.enemyData.postDamageTime = 0;
            enemy.enemyData.isAttacking    = false;
        }

        // Exponer healthSystem en el sprite para que EnemySystem actualice la HP bar
        enemy.healthSystem    = this.healthSystem;
        enemy.enemyController = this;
    }

    // ─── Update (cada subclase llama super.update() si quiere los guards) ─

    update() {
        if (this.isDead || this.isHurt) return false; // false = no continuar
        return true; // true = ok para procesar comportamiento
    }

    // ─── Distancia al jugador ─────────────────────────────────────────────

    distanceToPlayer() {
        return Phaser.Math.Distance.Between(
            this.enemy.x, this.enemy.y,
            this.player.x, this.player.y
        );
    }

    directionToPlayer() {
        return this.player.x - this.enemy.x;
    }

    facePlayer() {
        this.enemy.setFlipX(this.player.x < this.enemy.x);
    }

    // ─── Recibir daño ─────────────────────────────────────────────────────

    takeDamage() {
        if (this.isHurt || this.isDead) return;

        const died = this.healthSystem.takeDamage();
        if (died) return;

        this.isHurt = true;

        if (this.enemy.enemyData) {
            this.enemy.enemyData.postDamageTime = this.scene.time.now;
        }

        // Knockback alejándose del jugador
        const dir = this.enemy.x < this.player.x ? -1 : 1;
        this.enemy.setVelocityX(dir * this.knockbackSpeed);

        this.playAnim('hurt');

        this.scene.time.delayedCall(this.hurtDuration, () => {
            this.isHurt = false;
            if (!this.isDead) this.playAnim('idle');
        });
    }

    // ─── Muerte ───────────────────────────────────────────────────────────

    die() {
        if (this.isDead) return;

        this.isDead = true;
        this.isHurt = false;
        this.enemy.setVelocityX(0);
        this.enemy.body.enable = false;

        // Colapsar HP bar visualmente
        if (this.enemy.hpBar) {
            this.enemy.hpBar.width = 0;
            this.enemy.hpBar.x = this.enemy.x - 25;
        }

        this.playAnim('death');

        // Notificar a la escena (drops, oleadas, etc.)
        this.scene.onEnemyDeath?.(this.enemy);

        // Eliminar del sistema tras la animación
        this.scene.time.delayedCall(this.deathDelay, () => {
            this.scene.enemySystem?.removeEnemy(this.enemy);
        });
    }

    // ─── Cooldown de ataque ───────────────────────────────────────────────

    canAttack() {
        const now = this.scene.time.now;
        const postDmg = this.enemy.enemyData?.postDamageTime ?? 0;
        if (now - postDmg < this.postDamageCooldown) return false;
        if (now - this.lastAttackTime < this.attackCooldown) return false;
        return true;
    }

    registerAttack() {
        this.lastAttackTime = this.scene.time.now;
        if (this.enemy.enemyData) this.enemy.enemyData.isAttacking = true;

        this.scene.time.delayedCall(300, () => {
            if (this.enemy.enemyData) this.enemy.enemyData.isAttacking = false;
        });
    }

    // ─── Animaciones ──────────────────────────────────────────────────────
    // Cada subclase define this.anims = { idle, walk, attack, hurt, death }

    playAnim(state) {
        const key = this.anims?.[state];
        if (key && this.enemy.anims) {
            this.enemy.anims.play(key, true);
        }
    }

    // ─── Movimiento básico hacia el jugador ───────────────────────────────

    moveTowardsPlayer() {
        const dir = this.directionToPlayer();
        if (Math.abs(dir) > 5) {
            this.enemy.setVelocityX(dir > 0 ? this.speed : -this.speed);
            this.enemy.setFlipX(dir < 0);
            this.playAnim('walk');
        } else {
            this.enemy.setVelocityX(0);
            this.playAnim('idle');
        }
    }

    // ─── Movimiento alejándose del jugador (ranged) ───────────────────────

    moveAwayFromPlayer() {
        const dir = this.directionToPlayer();
        const fleeDir = dir > 0 ? -1 : 1;
        this.enemy.setVelocityX(fleeDir * this.speed);
        this.enemy.setFlipX(dir < 0);
        this.playAnim('walk');
    }

    // ─── Idle ─────────────────────────────────────────────────────────────

    idle() {
        this.enemy.setVelocityX(0);
        this.facePlayer();
        this.playAnim('idle');
    }

    // ─── Zona de ataque melee ─────────────────────────────────────────────

    createMeleeZone(width = 50, height = 40, range = 30) {
        const dir = this.enemy.flipX ? -1 : 1;
        const zx  = this.enemy.x + dir * range;
        const zy  = this.enemy.y - 20;

        const zone = this.scene.add.zone(zx, zy, width, height);
        this.scene.physics.add.existing(zone);
        zone.body.setAllowGravity(false);

        const controller = this.scene.sakuraController;
        const parryHit   = controller?.parryActive &&
            this.scene.physics.overlap(zone, controller.parryZone);

        if (parryHit) {
            this.scene.enemySystem?.knockbackEnemiesAround();
            if (this.scene.playerHealthSystem?.heal) {
                this.scene.playerHealthSystem.heal(20);
                this.scene.updateHealthBar?.();
            }
        } else if (this.scene.physics.overlap(zone, this.player)) {
            this.scene.enemySystem?.damagePlayer(this.enemy);
        }

        this.scene.time.delayedCall(100, () => zone.destroy());
    }
}