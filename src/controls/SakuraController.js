export default class SakuraController {
    constructor(scene, sakura) {
        this.scene = scene;
        this.sakura = sakura;
        
        // 🔥 CONFIGURACIONES DE HITBOX
        this.hitboxConfig = {
            normal: { width: 25, height: 30, offsetX: 10, offsetY: 10 },
            attack: { width: 25, height: 30, offsetX: 30, offsetY: 10 }
        };
        
        // 🔥 CONFIGURACIONES DE POSICIÓN
        this.positionConfig = {
            normal: { x: 0, y: 0 },        // Posición normal
            attack: { x: 0, y: 0 }        // ⚡ Ajusta estos valores
        };
        
        // Guardar posición original
        this.originalPosition = { x: sakura.x, y: sakura.y };
        
        // Configurar controles
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
        this.setState('normal');
    }

    // 🔥 MÉTODO PARA CAMBIAR ESTADO
    setState(state) {
        // Aplicar hitbox
        const hitbox = this.hitboxConfig[state];
        this.sakura.body.setSize(hitbox.width, hitbox.height);
        this.sakura.body.setOffset(hitbox.offsetX, hitbox.offsetY);
        
        // 🔥 APLICAR POSICIÓN
        const position = this.positionConfig[state];
        this.sakura.x = this.originalPosition.x + position.x;
        this.sakura.y = this.originalPosition.y + position.y;
    }

    setupControls() {
        this.keys.j.on('down', () => this.attack());
        this.keys.space.on('down', () => {
            this.jump();
        });
    }

    update() {
        // 🔥 ACTUALIZAR POSICIÓN ORIGINAL constantemente
        this.originalPosition.x = this.sakura.x;
        this.originalPosition.y = this.sakura.y;

        // 🔥 APLICAR ESTADO ACTUAL
        if (this.isAttacking) {
            this.setState('attack');
        } else {
            this.setState('normal');
        }

        // Movimiento horizontal
        if (this.wasd.A.isDown) {
            this.sakura.setVelocityX(-this.moveSpeed);
            this.sakura.setFlipX(true);
        } else if (this.wasd.D.isDown) {
            this.sakura.setVelocityX(this.moveSpeed);
            this.sakura.setFlipX(false);
        } else {
            this.sakura.setVelocityX(0);
        }

        // Animaciones
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
            this.sakura.anims.stop();
            this.setState('normal');
        }
    }

    attack() {
        // 🔥 GUARDAR POSICIÓN ANTES DE ATACAR
        this.originalPosition.x = this.sakura.x;
        this.originalPosition.y = this.sakura.y;
        
        this.isAttacking = true;
        this.sakura.anims.play('sakura-attack', true);
        this.setState('attack');
        
        this.scene.time.delayedCall(643, () => {
            this.isAttacking = false;
            this.setState('normal');
        });
    }

    jump() {
        if (this.sakura.body.blocked.down && !this.isJumping) {
            this.isJumping = true;
            this.sakura.setVelocityY(-400);
            this.sakura.anims.play('sakura-jump', true);
            this.sakura.anims.repeat = -1;
        }
    }
}