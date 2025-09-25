import AttackSystem from "../systems/AttackSystem.js";

export default class SakuraController {
    constructor(scene, sakura) {
        this.scene = scene;
        this.sakura = sakura;
        
        // 🔥 CONFIGURACIONES DE HITBOX Y ORIGEN VISUAL
        this.stateConfig = {
            normal: { 
                width: 25, height: 30, 
                offsetX: 10, offsetY: 10,
                originX: 0.5, originY: 1.0
            },
            attack: { 
                width: 25, height: 30, 
                offsetX: 30, offsetY: 18,
                originX: 0.5, originY: 1.1
            }
        }; 
        
        // 🔥 SISTEMA DE ATAQUE
        this.attackSystem = new AttackSystem(scene, sakura);
        this.enemies = []; // Array de enemigos (debes poblarlo después)

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

    setState(state) {
        const config = this.stateConfig[state];
        this.sakura.body.setSize(config.width, config.height);
        this.sakura.body.setOffset(config.offsetX, config.offsetY);
        this.sakura.setOrigin(config.originX, config.originY);
    }

    setupControls() {
        this.keys.j.on('down', () => this.attack());
        this.keys.space.on('down', () => this.jump());
    }

    update() {
        // 🔥 ACTUALIZAR EL SISTEMA DE ATAQUE CADA FRAME (IMPORTANTE!)
        this.attackSystem.update();

        // 🔥 APLICAR ESTADO ACTUAL CADA FRAME
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
        if (this.isAttacking) {
            return;
        }
        
        this.isAttacking = true;
        this.sakura.anims.play('sakura-attack', true);
        this.setState('attack');
        
        // 🔥 DETECTAR GOLPE AL INICIAR EL ATAQUE
        const hitDetected = this.attackSystem.checkAttackHit(this.enemies);

        
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
        }
    }

    // 🔥 MÉTODO PARA AGREGAR ENEMIGOS AL SISTEMA
    addEnemy(enemy) {
        if (enemy && !this.enemies.includes(enemy)) {
            this.enemies.push(enemy);
        }
    }

    // 🔥 MÉTODO PARA LIMPIAR ENEMIGOS
    clearEnemies() {
        this.enemies = [];
    }
}