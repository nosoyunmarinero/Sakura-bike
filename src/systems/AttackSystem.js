import EnemyAnims from '../anims/EnemyAnims.js';

export default class AttackSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.attackRange = 50; // Rango de ataque
        this.attackWidth = 45; // Ancho del área de detección
        this.attackHeight = 60; // Alto del área de detección
        this.detector = null;
        
        this.createAttackDetector();
    }

    createAttackDetector() {
        // Crear zona de detección
        this.detector = this.scene.add.zone(0, 0, this.attackWidth, this.attackHeight);
        this.scene.physics.add.existing(this.detector);
        this.detector.body.setAllowGravity(false);
        
        // Hacerlo invisible (cambia a false en producción)
        this.detector.setVisible(true);
    }

    update() {
        if (!this.player.body || !this.detector.body) return;

        // Posicionar el detector frente al jugador
        const direction = this.player.flipX ? -1 : 1;
        const offsetX = direction * 55; // Distancia de ataque desde el centro del jugador
        
        // 🔥 POSICIÓN Y AJUSTABLE - AHORA CON DIRECCIÓN
        this.detector.x = this.player.x + offsetX;
        this.detector.y = this.player.y - 50; // 🔥 AQUÍ SE MODIFICA EL Y
        
        // Actualizar tamaño del cuerpo físico
        this.detector.body.setSize(this.attackWidth, this.attackHeight);
        
        // 🔥 ACTUALIZAR POSICIÓN DEL RECTÁNGULO DEBUG
        if (this.detector.debugRect) {
            this.detector.debugRect.x = this.detector.x;
            this.detector.debugRect.y = this.detector.y;
        }
    }

    checkAttackHit(enemies) {
    let hitDetected = false;
    
    enemies.forEach(enemy => {
        if (enemy && enemy.body && this.scene.physics.overlap(this.detector, enemy)) {

            
            // 🔥 USAR EL HEALTH SYSTEM DEL ENEMIGO
            if (enemy.enemyController) {
                const isDead = enemy.enemyController.takeDamage();
                if (isDead) {
                
                    // Aquí podrías triggerear efectos, sonidos, etc.
                }
            }
            
            hitDetected = true;
        }
    });
    
    return hitDetected;
}

    // 🔥 NUEVO MÉTODO: Destruir el detector cuando ya no se necesite
    destroy() {
        if (this.detector) {
            this.detector.destroy();
        }
    }
}