import BaseEnemy from '../BaseEnemy.js';

export default class ShooterController extends BaseEnemy {
    constructor(scene, enemy, player) {
        super(scene, enemy, player, {
            maxHp:              20,
            attackDamage:       8,
            speed:              110,
            attackRange:        300,
            attackCooldown:     1200,
            postDamageCooldown: 800,
            hurtDuration:       250,
            knockbackSpeed:     60,
            deathDelay:         1000,
        });

        this.anims = {
            idle:   'shooter_idle',
            walk:   'shooter_flying',
            attack: 'shooter_attack',
            hurt:   'shooter_hurt',
            death:  'shooter_death',
        };

        // Rango mínimo que quiere mantener del jugador
        this.preferredMinRange = 180;
        // Rango desde el que empieza a disparar
        this.shootRange        = 300;

        if (enemy.enemyData) {
            enemy.enemyData.type         = 'Shooter';
            enemy.enemyData.attackType   = 'ranged';
            enemy.enemyData.speed        = this.speed;
            enemy.enemyData.attackDamage = this.attackDamage;
        }

        // El Shooter flota — sin gravedad
        enemy.body.setAllowGravity(false);

        this.playAnim('idle');
    }

    update() {
        if (!super.update()) return;

        const dist = this.distanceToPlayer();

        if (dist < this.preferredMinRange) {
            // Demasiado cerca — huir
            this._flee();
        } else if (dist <= this.shootRange) {
            // En rango óptimo — detenerse y disparar
            this._shoot();
        } else {
            // Muy lejos — acercarse un poco
            this.moveTowardsPlayer();
        }
    }

    _flee() {
        this.moveAwayFromPlayer();
    }

    _shoot() {
        this.idle();
        this.facePlayer();

        if (!this.canAttack()) return;

        this.registerAttack();
        this.playAnim('attack');

        // Disparar al final de la animación de ataque
        this.scene.time.delayedCall(300, () => {
            if (!this.isDead) {
                this.scene.enemySystem?.spawnBullet(this.enemy, 280);
            }
        });
    }
}