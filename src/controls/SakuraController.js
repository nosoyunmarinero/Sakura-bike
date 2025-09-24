export default class SakuraController {
    constructor(scene, sakura) {
        this.scene = scene;
        this.sakura = sakura;
        
        // 🔥 CONFIGURACIONES DE HITBOX POR ESTADO
        this.hitboxConfig = {
            normal: { width: 25, height: 30, offsetX: 10, offsetY: 10 },
            attack: { width: 25, height: 30, offsetX: 30, offsetY: 10 } // Ajusta estos valores
        };
        
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
        this.setCurrentHitbox('normal'); // 🔥 INICIALIZAR HITBOX
    }

    // 🔥 MÉTODO PARA CAMBIAR HITBOX MANUALMENTE
    setCurrentHitbox(state) {
        const config = this.hitboxConfig[state];
        this.sakura.body.setSize(config.width, config.height);
        this.sakura.body.setOffset(config.offsetX, config.offsetY);
    }

    setupControls() {
        this.keys.j.on('down', () => this.attack());
        this.keys.space.on('down', () => {
            this.jump();
        });
    }

    update() {
        // 🔥 ACTUALIZAR HITBOX BASADO EN ESTADO ACTUAL
        if (this.isAttacking) {
            this.setCurrentHitbox('attack');
        } else {
            this.setCurrentHitbox('normal');
        }

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
            // 🔥 ASEGURAR HITBOX NORMAL AL ATERRIZAR
            this.setCurrentHitbox('normal');
        }
    }

    attack() {
        this.isAttacking = true;
        this.sakura.anims.play('sakura-attack', true);
        
        // 🔥 CAMBIAR A HITBOX DE ATAQUE
        this.setCurrentHitbox('attack');
        
        this.scene.time.delayedCall(643, () => {
            this.isAttacking = false;
            // 🔥 VOLVER A HITBOX NORMAL
            this.setCurrentHitbox('normal');
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