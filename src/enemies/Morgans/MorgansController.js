import BaseEnemy from '../BaseEnemy.js';

export default class MorgansController extends BaseEnemy {
    constructor(scene, enemy, player) {
        super(scene, enemy, player, {
            maxHp:              30,
            attackDamage:       15,
            speed:              120,
            attackRange:        320,
            attackCooldown:     1500,
            postDamageCooldown: 800,
            hurtDuration:       300,
            knockbackSpeed:     70,
            deathDelay:         1800,
        });

        this.anims = {
            idle:   'morgans_idle',
            walk:   'morgans_walk',
            attack: 'morgans_attack',
            hurt:   'morgans_hit',
            death:  'morgans_death',
        };

        this.preferredMinRange = 200;
        this.shootRange        = 320;

        if (enemy.enemyData) {
            enemy.enemyData.type         = 'Morgans';
            enemy.enemyData.attackType   = 'ranged';
            enemy.enemyData.speed        = this.speed;
            enemy.enemyData.attackDamage = this.attackDamage;
        }

        this.playAnim('idle');
    }

    update() {
        if (!super.update()) return;

        const dist = this.distanceToPlayer();

        if (dist < this.preferredMinRange) {
            this._flee();
        } else if (dist <= this.shootRange) {
            this._shoot();
        } else {
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

        // Disparar a mitad de la animación de ataque
        this.scene.time.delayedCall(400, () => {
            if (!this.isDead) {
                this._spawnParryableProjectile();
            }
        });
    }

    // Proyectil de Morgans — se devuelve contra enemigos al ser parryado
    _spawnParryableProjectile() {
        const direction = this.enemy.flipX ? -1 : 1;
        const bx = this.enemy.x + direction * 20;
        const by = this.enemy.y - 20;

        const visual = this.scene.add.rectangle(bx, by, 10, 10, 0xcc44ff);
        const zone   = this.scene.add.zone(bx, by, 10, 10);
        this.scene.physics.add.existing(zone);
        zone.body.setAllowGravity(false);
        zone.body.setVelocityX(direction * 260);
        zone.visual      = visual;
        zone.reflected   = false;
        zone.sourceEnemy = this.enemy;
        zone.isMorgans   = true;

        this.scene.enemySystem?.bullets.add(zone);
    }
}