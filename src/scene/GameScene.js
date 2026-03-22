import SakuraController from '../controls/SakuraController.js';
import EnemyController from '../controls/EnemyController.js';
import EnemySystem from '../systems/EnemySystem.js';
import WaveSystem from '../systems/WaveSystem.js'; // 🔥 NUEVO IMPORT
import SakuraAnims from '../anims/SakuraAnims.js';
import EnemyAnims from '../anims/EnemyAnims.js';
import BackgroundManager from '../background/brackgroundManager.js';
import HealthSystem from '../systems/HealthSystem.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // La precarga principal se hace en PreloadScene
    }

    create() {
        // 🔥 VARIABLE DE CONTROL DE ESTADO
        this.isPlayerDead = false;
        this.isPaused = false;
        
        // Configurar gravedad
        this.physics.world.gravity.y = 800;
        
        // Background
        const layersConfig = [
            { key: '1', speed: 0.1 },
            { key: '2', speed: 0.2 },
            { key: '3', speed: 0.3 },
            { key: '4', speed: 0.4 },
            { key: '5', speed: 0.5 },
            { key: '6', speed: 0.6 },
            { key: '7', speed: 0.8 },
            { key: '8', speed: 1.0 }
        ];

        // Crear el manager de background
        this.backgroundManager = new BackgroundManager(this, layersConfig);

        // Player - posicionado más abajo, cerca del suelo
        this.sakura = this.physics.add.sprite(100, 300, 'player_walk').setScale(2,2);
        
        // Hitbox
        this.sakura.body.setSize(25, 30);
        this.sakura.body.setOffset(10, 10);
        
        // 🔥 SISTEMA DE SALUD DEL JUGADOR (10 golpes para morir)
        this.playerHealthSystem = new HealthSystem(this, this.sakura, 10);

        // Configurar cámara
        this.cameras.main.startFollow(this.sakura);
        this.cameras.main.setLerp(0.1, 0.1);
        
        // Configurar los límites de la cámara
        this.cameras.main.setBounds(-5000, 0, 10000, 540);

        // Enemy - posicionado a la misma altura que el personaje
        this.enemy = this.physics.add.sprite(500, 300, 'enemy_idle');
        this.enemy.anims.play('enemy_idle', true);
        this.enemy.body.setSize(40, 70);
        this.enemy.body.setOffset(25, 15);
        
        // 🔥 CREAR EL SUELO PRIMERO
        this.floor = this.physics.add.staticGroup();
        this.floor.create(480, 540, null).setSize(10000, 20).setVisible(false);

        // Controllers
        this.sakuraController = new SakuraController(this, this.sakura);
        this.enemyController = new EnemyController(this, this.enemy, this.sakura);

        // 🔥 CONFIGURAR ENEMIGO PARA QUE MUERA EN 3 GOLPES
        this.enemyController.healthSystem.hitsToDie = 3;
        
        // 🔥 CREAR SISTEMA DE ENEMIGOS
        this.enemySystem = new EnemySystem(this, this.sakura);
        this.enemySystem.addEnemy(this.enemy);
        
        // 🔥 CONECTAR ENEMIGO CON SU CONTROLADOR
        this.enemy.enemyController = this.enemyController;

        // 🔥 AGREGAR EL ENEMIGO AL SISTEMA DE DETECCIÓN DE ATAQUE
        this.sakuraController.addEnemy(this.enemy);
        
        // 🔥 CREAR SISTEMA DE OLEADAS
        this.waveSystem = new WaveSystem(this, this.sakura, this.enemySystem, this.sakuraController);
        
        // Animaciones
        this.SakuraAnims = new SakuraAnims(this);
        this.EnemyAnims = new EnemyAnims(this);

        // La altura 540 es el tamaño de tu pantalla, el suelo debe estar en Y = 540
        this.physics.world.setBounds(-5000, -50, 10000, 540);
        this.sakura.setCollideWorldBounds(true);
        this.enemy.setCollideWorldBounds(true);

        // Colisiones
        this.physics.add.collider(this.sakura, this.floor);
        this.physics.add.collider(this.enemy, this.floor);
        
        // Cambiamos overlap por collider para que no puedan atravesarse
        this.physics.add.collider(this.sakura, this.enemy, this.handleEnemyCollision, null, this);

        // 🔥 BARRA DE SALUD DEL JUGADOR
        this.createHealthBar();

        const pauseButton = this.add.text(900, 30, 'Pausa', { fontSize: '18px', fill: '#000000', backgroundColor: '#ffffff' });
        pauseButton.setOrigin(0.5);
        pauseButton.setScrollFactor(0);
        pauseButton.setDepth(400);
        pauseButton.setPadding(8, 4, 8, 4);
        pauseButton.setInteractive({ useHandCursor: true });
        pauseButton.on('pointerdown', () => this.togglePause());

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.pauseOverlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);
        this.pauseOverlay.setScrollFactor(0);
        this.pauseOverlay.setDepth(500);
        this.pauseOverlay.setVisible(false);
        this.pauseOverlay.setInteractive();
        this.pauseOverlay.on('pointerdown', () => this.togglePause());

        this.pauseText = this.add.text(centerX, centerY - 20, 'PAUSA', { fontSize: '48px', fill: '#ffffff' });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setScrollFactor(0);
        this.pauseText.setDepth(501);
        this.pauseText.setVisible(false);

        this.resumePrompt = this.add.text(centerX, centerY + 30, 'Presiona P o clic para continuar', { fontSize: '20px', fill: '#ffffff' });
        this.resumePrompt.setOrigin(0.5);
        this.resumePrompt.setScrollFactor(0);
        this.resumePrompt.setDepth(501);
        this.resumePrompt.setVisible(false);

        this.input.keyboard.on('keydown-P', () => this.togglePause());
    }

    // 🔥 MÉTODO PARA CREAR BARRA DE SALUD
    createHealthBar() {
        // Crear contenedor para la barra de salud
        this.healthBarBg = this.add.rectangle(100, 50, 200, 20, 0x000000);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(100);
        
        this.healthBar = this.add.rectangle(100, 50, 200, 20, 0xff0000);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(101);
        
        // Texto de salud
        const initCurrent = this.playerHealthSystem.getHealth();
        const initMax = this.playerHealthSystem.getMaxHealth();
        const initPct = initCurrent / initMax;
        this.healthBar.width = 200 * initPct;
        this.healthText = this.add.text(100, 80, `HP: ${initCurrent}/${initMax}`, {
            fontSize: '16px',
            fill: '#ffffff'
        });
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(102);
    }

    // 🔥 MÉTODO PARA ACTUALIZAR BARRA DE SALUD
    updateHealthBar() {
        const currentHealth = this.playerHealthSystem.getHealth();
        const maxHealth = this.playerHealthSystem.getMaxHealth();
        const healthPercentage = currentHealth / maxHealth;
        
        this.healthBar.width = 200 * healthPercentage;
        this.healthText.setText(`HP: ${currentHealth}/${maxHealth}`);
    }

    // 🔥 MÉTODO PARA MANEJAR DAÑO AL JUGADOR
    handlePlayerDamage(amount) {
        // 🔥 NO APLICAR DAÑO SI YA ESTÁ MUERTO
        if (this.isPlayerDead) {
            return;
        }
        
        this.playerHealthSystem.takeDamage(amount);
        this.updateHealthBar();
        
        // 🔥 REPRODUCIR ANIMACIÓN DE HURT CON MÁS CONTROL
        if (this.sakura && this.sakura.anims && !this.isPlayerDead) {
            // Detener animación actual y reproducir hurt
            this.sakura.anims.stop();
            this.sakura.anims.play('sakura-hurt', true);
            
            // 🔥 BLOQUEAR CONTROLES DURANTE LA ANIMACIÓN DE HURT
            if (this.sakuraController) {
                this.sakuraController.setCanMove(false);
                
                // 🔥 RESTABLECER CONTROLES DESPUÉS DE LA ANIMACIÓN
                this.time.delayedCall(500, () => {
                    if (this.sakuraController && !this.isPlayerDead) {
                        this.sakuraController.setCanMove(true);
                    }
                });
            }
        }
        
        // Verificar si el jugador murió
        if (this.playerHealthSystem.isDead()) {
            this.playerDeath();
        }
    }

    // 🔥 MÉTODO PARA MUERTE DEL JUGADOR
    playerDeath() {
        // 🔥 MARCAR AL JUGADOR COMO MUERTO INMEDIATAMENTE
        this.isPlayerDead = true;
        
        // 🔥 BLOQUEAR COMPLETAMENTE LOS CONTROLES DEL JUGADOR
        if (this.sakuraController) {
            this.sakuraController.setDead(true);
        }
        
        // 🔥 REPRODUCIR ANIMACIÓN DE MUERTE
        if (this.sakura && this.sakura.anims) {
            this.sakura.anims.stop();
            this.sakura.anims.play('sakura-death', true);
            
            // 🔥 BLOQUEAR CONTROLES PERMANENTEMENTE
            if (this.sakuraController) {
                this.sakuraController.setCanMove(false);
            }
            
            // 🔥 ESPERAR A QUE TERMINE LA ANIMACIÓN DE MUERTE
            this.time.delayedCall(1000, () => {
                // Detener el juego después de la animación
                this.physics.pause();
                
                // Mostrar mensaje de game over
                const gameOverText = this.add.text(400, 270, 'GAME OVER', {
                    fontSize: '64px',
                    fill: '#ff0000',
                    fontStyle: 'bold'
                });
                gameOverText.setOrigin(0.5);
                gameOverText.setScrollFactor(0);
                gameOverText.setDepth(200);
                
                // Opción para reiniciar
                const restartText = this.add.text(400, 320, 'Presiona R para reiniciar', {
                    fontSize: '24px',
                    fill: '#ffffff'
                });
                restartText.setOrigin(0.5);
                restartText.setScrollFactor(0);
                restartText.setDepth(201);
                
                // Reiniciar con la tecla R
                this.input.keyboard.once('keydown-R', () => {
                    this.scene.restart();
                });
            });
        }
    }

    // 🔥 MÉTODO PARA MANEJAR COLISIÓN ENTRE JUGADOR Y ENEMIGO
    handleEnemyCollision(sakura, enemy) {
        // Detener el movimiento del enemigo para que no se mueva lateralmente
        if (enemy.body) {
            enemy.setVelocityX(0);
        }
        
        // Si el enemigo tiene un controlador, detener su lógica de movimiento
        if (enemy.enemyController) {
            if (enemy.x > sakura.x) {
                enemy.setFlipX(true);
            } else {
                enemy.setFlipX(false);
            }
        }
    }

    togglePause() {
        if (this.isPlayerDead) {
            return;
        }
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            if (this.sakura && this.sakura.anims) this.sakura.anims.pause();
            if (this.enemy && this.enemy.anims) this.enemy.anims.pause();
            if (this.enemySystem && this.enemySystem.enemies) {
                this.enemySystem.enemies.forEach(e => {
                    if (e && e.anims) e.anims.pause();
                });
            }
            this.pauseOverlay.setVisible(true);
            this.pauseText.setVisible(true);
            this.resumePrompt.setVisible(true);
        } else {
            this.physics.resume();
            if (this.sakura && this.sakura.anims) this.sakura.anims.resume();
            if (this.enemy && this.enemy.anims) this.enemy.anims.resume();
            if (this.enemySystem && this.enemySystem.enemies) {
                this.enemySystem.enemies.forEach(e => {
                    if (e && e.anims) e.anims.resume();
                });
            }
            this.pauseOverlay.setVisible(false);
            this.pauseText.setVisible(false);
            this.resumePrompt.setVisible(false);
        }
    }

    update(time, delta) {
        // 🔥 NO ACTUALIZAR NADA SI EL JUGADOR ESTÁ MUERTO
        if (this.isPlayerDead || this.isPaused) {
            return;
        }
        
        // 🔥 ACTUALIZAR SISTEMA DE OLEADAS
        if (this.waveSystem) {
            this.waveSystem.update(delta);
        }
        
        // Background
        this.backgroundManager.update();

        // Sakura
        this.sakuraController.update();

        // 🔥 ACTUALIZAR SISTEMA DE ENEMIGOS
        if (this.enemySystem) {
            this.enemySystem.update();
        }

        // Enemigo individual original
        this.enemyController.update();
    }
}

export default GameScene;
