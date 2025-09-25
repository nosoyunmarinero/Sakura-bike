import HealthSystem from '../systems/HealthSystem.js';

export default class EnemyController {
    constructor(scene, enemy, sakura) {
        this.scene = scene;
        this.enemy = enemy;
        this.sakura = sakura;
        this.isHurt = false;
        this.isDead = false;
        this.postDamageCooldown = 1000; // 🔥 1 segundo de cooldown después de daño
        this.keys = scene.input.keyboard.addKeys({
            y: Phaser.Input.Keyboard.KeyCodes.Y,
        });
        
        // 🔥 SISTEMA DE SALUD
        this.healthSystem = new HealthSystem(scene, enemy, 100);
        
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
        
        this.enemy.anims.play('enemy_death', true);
        
        // 🔥 DESACTIVAR ENEMIGO DESPUÉS DE LA ANIMACIÓN + TIEMPO EXTRA
        this.scene.time.delayedCall(10000, () => { // 3 segundos total (1s animación + 2s extra)
            this.enemy.setActive(false);
            this.enemy.setVisible(false);
        });
    }
}
