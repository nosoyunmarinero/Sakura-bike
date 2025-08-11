export default class SakuraController {
    constructor(scene, sakura) {
        this.scene = scene;
        this.sakura = sakura;
        
        // Configurar todos los controles necesarios
        this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
        this.keys = scene.input.keyboard.addKeys({
            j: Phaser.Input.Keyboard.KeyCodes.J,
            k: Phaser.Input.Keyboard.KeyCodes.K,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
        
        this.moveSpeed = 350;
        this.isAttacking = false;
        this.isJumping = false;
        this.setupControls();
    }

    setupControls() {
      
        this.keys.j.on('down', () => this.attack());
        this.keys.space.on('down', () => {
        this.jump();
    });
}

    update() {
        // Movimiento horizontal - siempre permitido
        if (this.wasd.A.isDown) {
            this.sakura.setVelocityX(-this.moveSpeed);
            this.sakura.setFlipX(true);
        } else if (this.wasd.D.isDown) {
            this.sakura.setVelocityX(this.moveSpeed);
            this.sakura.setFlipX(false);
        } else {
            this.sakura.setVelocityX(0);
        }

        // Animaciones solo cuando no está atacando
        if (!this.isAttacking && !this.isJumping) {
            if (this.wasd.A.isDown || this.wasd.D.isDown) {
                this.sakura.anims.play('sakura-walk', true);
            } else {
                this.sakura.anims.play('sakura-idle', true);
            }
        }

        // Detectar aterrizaje
          if (this.isJumping && this.sakura.body.blocked.down) {
        this.isJumping = false;
        this.sakura.anims.stop(); // Detener animación de salto
    }

    }

    attack() {
        this.isAttacking = true;
        this.sakura.anims.play('sakura-attack', true);
        
        // No detener el movimiento horizontal
        // this.sakura.setVelocityX(0); - ELIMINAR esta línea
        
        this.scene.time.delayedCall(643, () => {
            this.isAttacking = false;
        });
    }

    jump() {
    if (this.sakura.body.blocked.down && !this.isJumping) {
        this.isJumping = true;
        this.sakura.setVelocityY(-400);
        this.sakura.anims.play('sakura-jump', true);
        
        // Mantener la animación de salto activa
        this.sakura.anims.repeat = -1; // Repetir indefinidamente
    }
}
}