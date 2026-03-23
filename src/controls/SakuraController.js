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
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        });
        
        this.moveSpeed = 350;
        this.isAttacking = false;
        this.isJumping = false;
        this.isDashing = false;
        this.canMove = true;
        this.isDead = false; // 🔥 NUEVO: Estado de muerte
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.chainHits = 0;
        this.parryActive = false;
        this.parryStartTime = 0;
        this.parryWindowMs = 250;
        this.parryPerfectMs = 80;
        this.parryCooldownMs = 800;
        this.lastParryTime = 0;
        this.parryZone = this.scene.add.zone(0, 0, 40, 60);
        this.scene.physics.add.existing(this.parryZone);
        this.parryZone.body.setAllowGravity(false);
        this.parryZone.setVisible(false);
        
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
        this.keys.k.on('down', () => this.parry());
        this.keys.shift.on('down', () => this.dash());
        this.keys.space.on('down', () => this.jump());
    }

    update() {
        // 🔥 SI ESTÁ MUERTO, NO HACER NADA
        if (this.isDead) {
            this.sakura.setVelocityX(0); // Detener movimiento
            return;
        }

        // 🔥 ACTUALIZAR EL SISTEMA DE ATAQUE CADA FRAME (IMPORTANTE!)
        this.attackSystem.update();
        const dir = this.sakura.flipX ? -1 : 1;
        this.parryZone.x = this.sakura.x + dir * 30;
        this.parryZone.y = this.sakura.y - 20;

        // 🔥 APLICAR ESTADO ACTUAL CADA FRAME
        if (this.isAttacking) {
            this.setState('attack');
        } else {
            this.setState('normal');
        }

        // 🔥 MOVIMIENTO CONDICIONAL: Solo si puede moverse
        if (this.canMove && !this.isDashing) {
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
        }

        // Animaciones
        if (this.isDashing) {
            this.sakura.anims.play('sakura-walk', true);
        } else if (!this.isAttacking && !this.isJumping) {
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
        // 🔥 NO ATACAR SI ESTÁ MUERTO
        if (this.isDead || this.isAttacking) {
            return;
        }
        
        this.isAttacking = true;
        this.sakura.anims.play('sakura-attack', true);
        this.setState('attack');
        
        const hitDetected = this.attackSystem.checkAttackHit(this.enemies);
        if (hitDetected) {
            this.registerHit();
        }

        this.scene.time.delayedCall(380, () => {
            this.isAttacking = false;
            this.setState('normal');
        });
    }

    jump() {
        // 🔥 NO SALTAR SI ESTÁ MUERTO
        if (this.isDead || this.isJumping || !this.sakura.body.blocked.down) {
            return;
        }
        
        this.isJumping = true;
        this.sakura.setVelocityY(-400);
        this.sakura.anims.play('sakura-jump', true);
    }

    parry() {
        if (this.isDead) return;
        const now = this.scene.time.now;
        if (now - this.lastParryTime < this.parryCooldownMs) return;
        this.lastParryTime = now;
        this.parryActive = true;
        this.parryStartTime = this.scene.time.now;
        this.sakura.anims.play('sakura-idle', true);
        this.sakura.setTint(0x99ccff);
        this.scene.time.delayedCall(this.parryWindowMs, () => {
            this.parryActive = false;
            this.sakura.clearTint();
        });
    }

    dash() {
        if (this.isDead || this.isDashing || !this.canMove) return;
        this.isDashing = true;
        const direction = this.sakura.flipX ? -1 : 1;
        this.sakura.setVelocityX(direction * 600);
        if (this.scene.playerHealthSystem) {
            this.scene.playerHealthSystem.setInvulnerable(250);
        }
        this.scene.time.delayedCall(250, () => {
            this.isDashing = false;
        });
    }

    registerHit() {
        this.comboCount++;
        this.chainHits++;
        if (this.comboCount % 5 === 0) {
            this.comboMultiplier = Math.min(3, this.comboMultiplier + 1);
        }
        if (this.chainHits % 3 === 0) {
            this.attackSystem.spawnFinisherAoE(this.enemies);
        }
        if (this.scene.updateComboUI) {
            this.scene.updateComboUI(this.comboCount, this.comboMultiplier);
        }
    }

    resetCombo() {
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.chainHits = 0;
        if (this.scene.updateComboUI) {
            this.scene.updateComboUI(this.comboCount, this.comboMultiplier);
        }
    }

    // 🔥 NUEVO: MÉTODO PARA ESTABLECER ESTADO DE MUERTE
    setDead(isDead) {
        this.isDead = isDead;
        this.canMove = !isDead; // También bloquear movimiento
        this.sakura.setVelocityX(0); // Detener movimiento inmediatamente
        
        if (isDead) {
            // Detener cualquier animación actual
            this.sakura.anims.stop();
            // Opcionalmente reproducir animación de muerte si existe
            // this.sakura.anims.play('sakura-death', true);
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

    // 🔥 NUEVO: MÉTODO PARA CONTROLAR SI PUEDE MOVERSE
    setCanMove(canMove) {
        this.canMove = canMove;
        if (!canMove) {
            this.sakura.setVelocityX(0); // Detener movimiento inmediatamente
        }
    }
}
