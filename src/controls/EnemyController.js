import HealthSystem from '../systems/HealthSystem.js';

export default class EnemyController {
    constructor(scene, enemy, sakura, hitsToDie = 3, healthSystem = null) {
    this.scene = scene;
    this.enemy = enemy;
    this.sakura = sakura;
    this.isHurt = false;
    this.isDead = false;
    this.postDamageCooldown = 1000;
    this.keys = scene.input.keyboard.addKeys({
        y: Phaser.Input.Keyboard.KeyCodes.Y,
    });
    
    // 🔥 SISTEMA DE SALUD: permitir inyectar instancia externa
    this.healthSystem = healthSystem ? healthSystem : new HealthSystem(scene, enemy, 100);
    if (hitsToDie !== undefined && hitsToDie !== null) {
        this.healthSystem.hitsToDie = hitsToDie;
    }
    
    console.log(`🎯 Enemigo creado - Morirá en ${hitsToDie} golpes`); // 🔥 DEBUG
    
    // 🔥 ESCUCHAR EVENTO DE MUERTE
    this.healthSystem.onDeath.on('death', () => {
        this.die();
    });
}
    update() {
       // 🔥 SI ESTÁ MUERTO, NO HACER NADA
       if (this.isDead) {
           return;
       }
       
       // 🔥 SI ESTÁ HURT, NO HACER NADA MÁS QUE LA ANIMACIÓN DE HURT
       if (this.isHurt) {
           return;
       }
       
       // 🔥 EL MOVIMIENTO AHORA ES CONTROLADO POR EL ENEMY SYSTEM
       // No hacer nada aquí, el EnemySystem se encarga del movimiento
    }

    takeDamage() {
        if (this.isHurt) {
            return;
        }
        
        // 🔥 APLICAR DAÑO AL SISTEMA DE SALUD
        const died = this.healthSystem.takeDamage();
        
        if (died) {
            return; // Si murió, no hacer nada más
        }
        
        this.isHurt = true;
        this.enemy.anims.play('enemy_hurt', true);
        
        // 🔥 Establecer tiempo de post-damage cooldown
        if (this.enemy.enemyData) {
            this.enemy.enemyData.postDamageTime = this.scene.time.now;
        }
        
        // 🔥 Pequeño retroceso (opcional)
        this.enemy.setVelocityX(this.sakura.flipX ? 50 : -50);
        
        this.scene.time.delayedCall(300, () => {
            this.isHurt = false;
            // Volver a animación normal solo si sigue vivo
            if (this.healthSystem.isAlive) {
                this.enemy.anims.play('enemy_idle', true);
            }
        });
    }

    // 🔥 MÉTODO DE MUERTE
    die() {
        this.isDead = true;
        this.isHurt = false; // Asegurar que no esté en estado hurt
        this.enemy.setVelocityX(0);
        
        // 🔥 DESACTIVAR HITBOX INMEDIATAMENTE
        this.enemy.body.enable = false;
        
        // 🔥 OCULTAR DEBUG DEL ENEMIGO
        if (this.enemy.body.debugShowBody) {
            this.enemy.body.debugShowBody = false;
        }
        
        if (this.enemy.hpBar) {
            this.enemy.hpBar.width = 0;
            this.enemy.hpBar.x = this.enemy.x - 25;
        }
        if (this.enemy.hpBarBg) {
            this.enemy.hpBarBg.x = this.enemy.x;
        }
        
        this.enemy.anims.play('enemy_death', true);
        if (this.scene.onEnemyDeath) {
            this.scene.onEnemyDeath(this.enemy);
        }
        this.scene.time.delayedCall(1500, () => {
            if (this.scene.enemySystem) {
                this.scene.enemySystem.removeEnemy(this.enemy);
            } else {
                this.enemy.destroy();
            }
        });
    }
}
