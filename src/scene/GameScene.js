import SakuraController from '../controls/SakuraController.js';
import EnemyController from '../controls/EnemyController.js';
import EnemySystem from '../systems/EnemySystem.js';
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
    
    //Hitbox
    this.sakura.body.setSize(25, 30);
    this.sakura.body.setOffset(10, 10);
    
    // 🔥 SISTEMA DE SALUD DEL JUGADOR (6 golpes para morir)
    // En el create() de GameScene.js, cambia la línea:
    this.playerHealthSystem = new HealthSystem(this, this.sakura, 120);
    
    // Por:
    this.playerHealthSystem = new HealthSystem(this, this.sakura, 6); // 6 golpes para morir
    
    // Y para el enemigo, agrega después de crear el enemigo:
    this.enemyHealthSystem = new HealthSystem(this, this.enemy, 3); // 3 golpes para morir

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
    
    // 🔥 CREAR SISTEMA DE ENEMIGOS
    this.enemySystem = new EnemySystem(this, this.sakura);
    this.enemySystem.addEnemy(this.enemy);
    
    // 🔥 CONECTAR ENEMIGO CON SU CONTROLADOR
    this.enemy.enemyController = this.enemyController;

    // 🔥 AGREGAR EL ENEMIGO AL SISTEMA DE DETECCIÓN DE ATAQUE
    this.sakuraController.addEnemy(this.enemy);
    
    // Animaciones
    this.SakuraAnims = new SakuraAnims(this);
    this.EnemyAnims = new EnemyAnims(this);

    // La altura 540 es el tamaño de tu pantalla, el suelo debe estar en Y = 540
    this.physics.world.setBounds(-5000, -50, 10000, 540);
    this.sakura.setCollideWorldBounds(true);
    this.enemy.setCollideWorldBounds(true);
    

    // colisiones
    this.physics.add.collider(this.sakura, this.floor);
    this.physics.add.collider(this.enemy, this.floor);
    
    // Cambiamos overlap por collider para que no puedan atravesarse
    this.physics.add.collider(this.sakura, this.enemy, this.handleEnemyCollision, null, this);

    // 🔥 TECLA R PARA RESPAWN
    this.input.keyboard.on('keydown-R', () => {
        this.spawnEnemy();
    });

    // 🔥 BARRA DE SALUD DEL JUGADOR
    this.createHealthBar();

    // Debug (opcional) - DESACTIVADO para mejor rendimiento
    // this.physics.world.createDebugGraphic();
    // this.physics.world.debugGraphic.visible = true;
    // this.physics.world.drawDebug = true;
    // this.physics.world.debugGraphic.lineStyle(2, 0xff0000, 1);
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
    this.healthText = this.add.text(100, 80, 'HP: 120/120', {
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

// 🔥 MÉTODO PARA CREAR ENEMIGO NUEVO
spawnEnemy() {
    // Crear enemigo en posición aleatoria
    const x = Phaser.Math.Between(200, 700);
    const y = 300;
    
    const newEnemy = this.physics.add.sprite(x, y, 'enemy_idle');
    newEnemy.anims.play('enemy_idle', true);
    newEnemy.body.setSize(40, 70);
    newEnemy.body.setOffset(25, 15);
    newEnemy.setCollideWorldBounds(true);
    
    // Crear controlador para el nuevo enemigo
    const enemyController = new EnemyController(this, newEnemy, this.sakura);
    newEnemy.enemyController = enemyController;
    
    // 🔥 AGREGAR AL SISTEMA DE ENEMIGOS
    if (this.enemySystem) {
        this.enemySystem.addEnemy(newEnemy);
    }
    
    // Agregar al sistema de ataque
    this.sakuraController.addEnemy(newEnemy);
    
    // Colisiones
    this.physics.add.collider(newEnemy, this.floor);
    this.physics.add.collider(this.sakura, newEnemy, this.handleEnemyCollision, null, this);
}

update() {
    // 🔥 NO ACTUALIZAR NADA SI EL JUGADOR ESTÁ MUERTO
    if (this.isPlayerDead) {
        return;
    }
    
    // Background
    this.backgroundManager.update();

    // Sakura
    this.sakuraController.update();

    // 🔥 ACTUALIZAR SISTEMA DE ENEMIGOS (movimiento automático)
    if (this.enemySystem) {
        this.enemySystem.update();
    }

    // Enemigo individual (ahora controlado por el sistema)
    this.enemyController.update();
}
}

export default GameScene;