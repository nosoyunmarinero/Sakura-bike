import HealthSystem from '../systems/HealthSystem.js';

export default class EnemyController {
    constructor(scene, enemy, sakura) {
        this.scene = scene;
        this.enemy = enemy;
        this.sakura = sakura;
        this.isHurt = false;
        this.isDead = false;
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
       
       if (this.keys.y.isDown) {
            if (this.enemy.x > this.sakura.x) {
                this.enemy.setVelocityX(-500); // Velocidad negativa para moverse a la izquierda
                this.enemy.setFlipX(true); // Enemigo mira hacia la izquierda (hacia el jugador)
            } else if (this.enemy.x < this.sakura.x) {
                this.enemy.setVelocityX(500); // Velocidad positiva para moverse a la derecha
                this.enemy.setFlipX(false); // Enemigo mira hacia la derecha (hacia el jugador)
            } else {
                this.enemy.setVelocityX(0); // Si está alineado con el jugador, detener movimiento horizontal
            }
            // Reproducir animación del enemigo caminando
            this.enemy.anims.play('enemy_walk', true);
        } else {
            // Detener al enemigo cuando no se presiona la tecla
            this.enemy.setVelocityX(0);
            // Reproducir animación del enemigo en reposo
            this.enemy.anims.play('enemy_idle', true);
        }
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
    ;
    
    this.isHurt = true;
    
    this.enemy.anims.play('enemy_hurt', true);
    
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
    this.scene.time.delayedCall(3000, () => { // 3 segundos total (1s animación + 2s extra)
        this.enemy.setActive(false);
        this.enemy.setVisible(false);
    });
}

}
