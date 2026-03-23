import EnemyController from '../controls/EnemyController.js';
import HealthSystem from './HealthSystem.js';

export default class WaveSystem {
    constructor(scene, sakura, enemySystem, sakuraController) {
        this.scene = scene;
        this.sakura = sakura;
        this.enemySystem = enemySystem;
        this.sakuraController = sakuraController;
        
        // 🔥 CONFIGURACIÓN DE SPAWNEO
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000; // 3 segundos inicial
        this.minSpawnInterval = 1000; // Mínimo 1 segundo
        this.spawnIntervalDecrease = 100; // Disminuir 100ms cada vez
        this.maxEnemies = 15; // Máximo 15 enemigos simultáneos
        
        // 🔥 CONFIGURACIÓN DE OLEADAS
        this.currentWave = 1;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesPerWave = 5; // 5 enemigos por oleada
        
        // 🔥 CONFIGURACIÓN DE ENEMIGOS
        this.enemyHitsToDie = 3; // Golpes necesarios para matar un enemigo
    }

    // 🔥 ACTUALIZAR SISTEMA (llamar desde GameScene update)
    update(delta) {
        this.enemySpawnTimer += delta;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnProceduralEnemy();
            this.enemySpawnTimer = 0;
        }
    }

    // 🔥 SPAWNEO PROCEDURAL DE ENEMIGOS
    spawnProceduralEnemy() {
        // No spawnear si el jugador está muerto o hay demasiados enemigos
        const elapsedMs = this.scene.time.now;
        const dynamicMax = 8 + Math.min(6, Math.floor(elapsedMs / 120000)); // +1 cada 2 min, máx 14
        if (this.scene.isPlayerDead || this.enemySystem.enemies.length >= dynamicMax) {
            return;
        }

        // Calcular posición de spawn
        const spawnX = this.calculateSpawnPosition();
        const spawnY = 300; // Misma altura que el jugador
        
        const types = [
            { type: 'Skeleton', hp: 30, dmg: 10, speed: 100, attackType: 'melee', weight: 5 },
            { type: 'Runner', hp: 25, dmg: 12, speed: 180, attackType: 'melee', weight: 4 },
            { type: 'Shooter', hp: 20, dmg: 8, speed: 90, attackType: 'ranged', weight: 3 },
            { type: 'Morgans', hp: 30, dmg: 15, speed: 90, attackType: 'ranged', weight: 2 },
            { type: 'Punisher', hp: 80, dmg: 25, speed: 70, attackType: 'melee', weight: 1 },
            { type: 'Grimm', hp: 50, dmg: 20, speed: 110, attackType: 'melee', weight: 1 }
        ];
        const totalWeight = types.reduce((a, b) => a + b.weight, 0);
        let r = Math.random() * totalWeight;
        let chosen = types[0];
        for (let t of types) {
            if (r < t.weight) { chosen = t; break; }
            r -= t.weight;
        }
        const newEnemy = this.scene.physics.add.sprite(spawnX, spawnY, 'enemy_idle');
        newEnemy.anims.play('enemy_idle', true);
        newEnemy.body.setSize(40, 70);
        newEnemy.body.setOffset(25, 15);
        newEnemy.setCollideWorldBounds(true);
        newEnemy.enemyData = { type: chosen.type, attackDamage: chosen.dmg, speed: chosen.speed, attackType: chosen.attackType };
        
        // Crear controlador y sistema de salud
        const enemyController = new EnemyController(this.scene, newEnemy, this.sakura);
        const enemyHealthSystem = new HealthSystem(this.scene, newEnemy, chosen.hp);
        enemyHealthSystem.hitsToDie = chosen.hp;
        
        // Conectar todo
        newEnemy.enemyController = enemyController;
        newEnemy.healthSystem = enemyHealthSystem;
        
        // Agregar a sistemas
        this.enemySystem.addEnemy(newEnemy);
        this.sakuraController.addEnemy(newEnemy);
        
        // Colisiones
        this.scene.physics.add.collider(newEnemy, this.scene.floor);
        this.scene.physics.add.collider(this.sakura, newEnemy, this.scene.handleEnemyCollision, null, this.scene);
        
        // Manejo de muerte desde EnemyController
        
        this.enemiesSpawnedThisWave++;
        
        // Verificar si completó la oleada
        if (this.enemiesSpawnedThisWave >= this.enemiesPerWave) {
            this.nextWave();
        }
    }

    // 🔥 CALCULAR POSICIÓN DE SPAWN ALEATORIA
    calculateSpawnPosition() {
        const playerX = this.sakura.x;
        const minDistance = 400; // Distancia mínima (fuera de pantalla aprox)
        const maxDistance = 900; // Distancia máxima
        
        // Límites del mundo
        const worldMinX = -5000;
        const worldMaxX = 5000;
    
        let spawnX;
        let validPosition = false;
        let attempts = 0;
    
        while (!validPosition && attempts < 10) {
            // Decidir lado aleatorio (-1 izq, 1 der)
            const side = Math.random() < 0.5 ? -1 : 1;
            const distance = Phaser.Math.Between(minDistance, maxDistance);
            spawnX = playerX + (side * distance);
    
            // Verificar límites del mundo
            if (spawnX >= worldMinX && spawnX <= worldMaxX) {
                validPosition = true;
            }
            attempts++;
        }
    
        // Si no se encontró posición válida, forzar dentro de los límites cerca del jugador
        if (!validPosition) {
            spawnX = Phaser.Math.Clamp(playerX + 400, worldMinX, worldMaxX);
        }

        return spawnX;
    }

    // 🔥 AVANZAR A LA SIGUIENTE OLEADA
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
        this.showWaveNotification();
    }

    // 🔥 MOSTRAR NOTIFICACIÓN DE OLEADA
    showWaveNotification() {
        const waveText = this.scene.add.text(400, 200, `OLEADA ${this.currentWave}`, {
            fontSize: '32px',
            fill: '#ff0000',
            fontStyle: 'bold'
        });
        waveText.setOrigin(0.5);
        waveText.setScrollFactor(0);
        waveText.setDepth(300);
        
        this.scene.time.delayedCall(2000, () => {
            waveText.destroy();
        });
    }

    // 🔥 OBTENER INFORMACIÓN DE LA OLEADA ACTUAL
    getCurrentWave() {
        return this.currentWave;
    }

    getEnemiesSpawned() {
        return this.enemiesSpawnedThisWave;
    }

    getEnemiesPerWave() {
        return this.enemiesPerWave;
    }

    // 🔥 RESETEAR SISTEMA
    reset() {
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000;
        this.currentWave = 1;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesPerWave = 5;
    }
}
