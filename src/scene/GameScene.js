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
    
    // 🔥 SISTEMA DE SPAWNEO PROCEDURAL
    this.enemySpawnTimer = 0;
    this.enemySpawnInterval = 3000; // 3 segundos inicial
    this.minSpawnInterval = 1000; // Mínimo 1 segundo
    this.spawnIntervalDecrease = 100; // Disminuir 100ms cada vez
    this.maxEnemies = 15; // Máximo 15 enemigos simultáneos
    this.currentWave = 1;
    this.enemiesSpawnedThisWave = 0;
    this.enemiesPerWave = 5; // 5 enemigos por oleada
    
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
    
    // 🔥 SISTEMA DE SALUD DEL JUGADOR (10 golpes para morir)
    
    this.playerHealthSystem = new HealthSystem(this, this.sakura, 10); // 6 golpes para morir
    

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
    this.enemyController.healthSystem.hitsToDie = 3; // 🔥 3 golpes para morir
    
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
// 🔥 MÉTODO SIMPLIFICADO PARA SPAWNEAR ENEMIGO (si lo necesitas manualmente)
spawnEnemy() {
    // Solo llama al método procedural
    this.spawnProceduralEnemy();
}
spawnProceduralEnemy() {
    // No spawnear si el jugador está muerto o hay demasiados enemigos
    if (this.isPlayerDead || this.enemySystem.enemies.length >= this.maxEnemies) {
        return;
    }
    
    // Calcular posición aleatoria (lejos del jugador)
    const playerX = this.sakura.x;
    let spawnX;
    
    do {
        spawnX = Phaser.Math.Between(200, 800);
    } while (Math.abs(spawnX - playerX) < 200); // Alejado del jugador
    
    const spawnY = 300; // Misma altura que el jugador
    
    // Crear enemigo
    const newEnemy = this.physics.add.sprite(spawnX, spawnY, 'enemy_idle');
    newEnemy.anims.play('enemy_idle', true);
    newEnemy.body.setSize(40, 70);
    newEnemy.body.setOffset(25, 15);
    newEnemy.setCollideWorldBounds(true);
    
    // Crear controlador y sistema de salud
    const enemyController = new EnemyController(this, newEnemy, this.sakura);
    const enemyHealthSystem = new HealthSystem(this, newEnemy, 3); // 3 golpes para morir
    
    // Conectar todo
    newEnemy.enemyController = enemyController;
    newEnemy.healthSystem = enemyHealthSystem;
    
    // Agregar a sistemas
    this.enemySystem.addEnemy(newEnemy);
    this.sakuraController.addEnemy(newEnemy);
    
    // Colisiones
    this.physics.add.collider(newEnemy, this.floor);
    this.physics.add.collider(this.sakura, newEnemy, this.handleEnemyCollision, null, this);
    
    // Evento de muerte del enemigo
    enemyHealthSystem.onDeath.on('death', () => {
        this.enemySystem.removeEnemy(newEnemy);
    });
    
    this.enemiesSpawnedThisWave++;
    
    // Verificar si completó la oleada
    if (this.enemiesSpawnedThisWave >= this.enemiesPerWave) {
        this.nextWave();
    }
}

// 🔥 MÉTODO PARA SIGUIENTE OLEADA
nextWave() {
    this.currentWave++;
    this.enemiesSpawnedThisWave = 0;
    this.enemiesPerWave += 2; // +2 enemigos por oleada
    
    // Disminuir intervalo de spawn (más rápido)
    this.enemySpawnInterval = Math.max(
        this.minSpawnInterval, 
        this.enemySpawnInterval - this.spawnIntervalDecrease
    );
    
    // Mostrar notificación de oleada
    const waveText = this.add.text(400, 200, `OLEADA ${this.currentWave}`, {
        fontSize: '32px',
        fill: '#ff0000',
        fontStyle: 'bold'
    });
    waveText.setOrigin(0.5);
    waveText.setScrollFactor(0);
    waveText.setDepth(300);
    
    this.time.delayedCall(2000, () => {
        waveText.destroy();
    });
}

update(time, delta) {
    // 🔥 NO ACTUALIZAR NADA SI EL JUGADOR ESTÁ MUERTO
    if (this.isPlayerDead) {
        return;
    }
    
    // 🔥 SISTEMA DE SPAWNEO PROCEDURAL
    this.enemySpawnTimer += delta;
    if (this.enemySpawnTimer >= this.enemySpawnInterval) {
        this.spawnProceduralEnemy();
        this.enemySpawnTimer = 0;
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