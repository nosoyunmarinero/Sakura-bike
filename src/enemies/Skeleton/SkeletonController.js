import BaseEnemy from '../BaseEnemy.js';

export default class SkeletonController extends BaseEnemy {
    constructor(scene, enemy, player) {
        super(scene, enemy, player, {
            maxHp:              30,
            attackDamage:       10,
            speed:              100,
            attackRange:        70,
            attackCooldown:     800,
            postDamageCooldown: 1000,
            hurtDuration:       300,
            knockbackSpeed:     80,
            deathDelay:         1200,
        });

        this.anims = {
            idle:   'skeleton_idle',
            walk:   'skeleton_walk',
            attack: 'skeleton_attack',
            hurt:   'skeleton_hit',
            death:  'skeleton_dead',
        };

        if (enemy.enemyData) {
            enemy.enemyData.type        = 'Skeleton';
            enemy.enemyData.attackType  = 'melee';
            enemy.enemyData.speed       = this.speed;
            enemy.enemyData.attackDamage = this.attackDamage;
        }

        this.playAnim('idle');
    }

    update() {
        if (!super.update()) return;

        const dist = this.distanceToPlayer();

        if (dist <= this.attackRange) {
            this._attack();
        } else {
            this.moveTowardsPlayer();
        }
    }

    _attack() {
        this.idle();

        if (!this.canAttack()) return;

        this.registerAttack();
        this.playAnim('attack');
        this.createMeleeZone(50, 40, 30);
    }
}