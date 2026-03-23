import SkeletonController from '../enemies/Skeleton/SkeletonController.js';
import ShooterController  from '../enemies/Shooter/ShooterController.js';
import MorgansController  from '../enemies/Morgans/MorgansController.js';

// Controllers sin sprites propios — usan el genérico por ahora
// import RunnerController   from '../enemies/Runner/RunnerController.js';
// import PunisherController from '../enemies/Punisher/PunisherController.js';
// import GrimmController    from '../enemies/Grimm/GrimmController.js';

export default class WaveSystem {
    constructor(scene, sakura, enemySystem, sakuraController) {
        this.scene            = scene;
        this.sakura           = sakura;
        this.enemySystem      = enemySystem;
        this.sakuraController = sakuraController;

        this.enemySpawnTimer      = 0;
        this.enemySpawnInterval   = 3000;
        this.minSpawnInterval     = 1000;
        this.spawnIntervalDecrease = 100;
        this.maxEnemies           = 15;

        this.currentWave             = 1;
        this.enemiesSpawnedThisWave  = 0;
        this.enemiesPerWave          = 5;

        // Tabla de tipos — sprite key + controller factory
        this._types = [
            {
                type: 'Skeleton', hp: 30, dmg: 10, speed: 100,
                attackType: 'melee', weight: 5,
                spriteKey: 'skeleton_idle',
                bodySize: { w: 20, h: 28 }, bodyOffset: { x: 6, y: 4 },
                scale: 2,
                makeController: (scene, enemy, sakura) =>
                    new SkeletonController(scene, enemy, sakura),
            },
            {
                type: 'Runner', hp: 25, dmg: 12, speed: 180,
                attackType: 'melee', weight: 4,
                spriteKey: 'enemy_idle',
                bodySize: { w: 40, h: 70 }, bodyOffset: { x: 25, y: 15 },
                scale: 1,
                makeController: (scene, enemy, sakura) => {
                    // RunnerController aún no existe — usar BaseEnemy directamente
                    const { default: BaseEnemy } = { default: null };
                    // Mientras tanto importamos EnemyController viejo como fallback
                    const ctrl = new SkeletonController(scene, enemy, sakura);
                    ctrl.speed = 180;
                    if (enemy.enemyData) {
                        enemy.enemyData.type = 'Runner';
                        enemy.enemyData.speed = 180;
                    }
                    return ctrl;
                },
            },
            {
                type: 'Shooter', hp: 20, dmg: 8, speed: 90,
                attackType: 'ranged', weight: 3,
                spriteKey: 'shooter_idle',
                bodySize: { w: 40, h: 50 }, bodyOffset: { x: 15, y: 10 },
                scale: 1.5,
                makeController: (scene, enemy, sakura) =>
                    new ShooterController(scene, enemy, sakura),
            },
            {
                type: 'Morgans', hp: 30, dmg: 15, speed: 90,
                attackType: 'ranged', weight: 2,
                spriteKey: 'morgans_idle',
                bodySize: { w: 40, h: 80 }, bodyOffset: { x: 50, y: 30 },
                scale: 1,
                makeController: (scene, enemy, sakura) =>
                    new MorgansController(scene, enemy, sakura),
            },
            {
                type: 'Punisher', hp: 80, dmg: 25, speed: 70,
                attackType: 'melee', weight: 1,
                spriteKey: 'enemy_idle',
                bodySize: { w: 40, h: 70 }, bodyOffset: { x: 25, y: 15 },
                scale: 1,
                makeController: (scene, enemy, sakura) =>
                    new SkeletonController(scene, enemy, sakura),
            },
            {
                type: 'Grimm', hp: 50, dmg: 20, speed: 110,
                attackType: 'melee', weight: 1,
                spriteKey: 'enemy_idle',
                bodySize: { w: 40, h: 70 }, bodyOffset: { x: 25, y: 15 },
                scale: 1,
                makeController: (scene, enemy, sakura) =>
                    new SkeletonController(scene, enemy, sakura),
            },
        ];
    }

    update(delta) {
        this.enemySpawnTimer += delta;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnProceduralEnemy();
            this.enemySpawnTimer = 0;
        }
    }

    spawnProceduralEnemy() {
        const elapsedMs   = this.scene.time.now;
        const dynamicMax  = 8 + Math.min(6, Math.floor(elapsedMs / 120000));
        if (this.scene.isPlayerDead || this.enemySystem.enemies.length >= dynamicMax) return;

        const spawnX = this.calculateSpawnPosition();
        const spawnY = 300;

        // Elegir tipo por peso
        const chosen = this._pickType();

        // Crear sprite con el spritesheet correcto
        const newEnemy = this.scene.physics.add.sprite(spawnX, spawnY, chosen.spriteKey);
        newEnemy.setScale(chosen.scale);
        newEnemy.body.setSize(chosen.bodySize.w, chosen.bodySize.h);
        newEnemy.body.setOffset(chosen.bodyOffset.x, chosen.bodyOffset.y);
        newEnemy.setCollideWorldBounds(true);

        // enemyData inicial (el controller lo sobreescribirá)
        newEnemy.enemyData = {
            type:        chosen.type,
            attackDamage: chosen.dmg,
            speed:        chosen.speed,
            attackType:   chosen.attackType,
            isFollowing:  false,
            isAttacking:  false,
            lastDirection: 0,
            lastAttackTime: 0,
            postDamageTime: 0,
        };

        // Instanciar el controller correcto
        const controller = chosen.makeController(this.scene, newEnemy, this.sakura);
        newEnemy.enemyController = controller;
        newEnemy.healthSystem    = controller.healthSystem;

        // Reproducir animación inicial
        newEnemy.anims.play(chosen.spriteKey, true);

        // Agregar a sistemas
        this.enemySystem.addEnemy(newEnemy);
        this.sakuraController.addEnemy(newEnemy);

        // Colisiones
        this.scene.physics.add.collider(newEnemy, this.scene.floor);
        this.scene.physics.add.collider(
            this.sakura, newEnemy,
            this.scene.handleEnemyCollision, null, this.scene
        );

        this.enemiesSpawnedThisWave++;
        if (this.enemiesSpawnedThisWave >= this.enemiesPerWave) {
            this.nextWave();
        }
    }

    _pickType() {
        const totalWeight = this._types.reduce((a, b) => a + b.weight, 0);
        let r = Math.random() * totalWeight;
        for (const t of this._types) {
            if (r < t.weight) return t;
            r -= t.weight;
        }
        return this._types[0];
    }

    calculateSpawnPosition() {
        const playerX  = this.sakura.x;
        const worldMin = -5000;
        const worldMax =  5000;
        let spawnX, valid = false, attempts = 0;

        while (!valid && attempts < 10) {
            const side     = Math.random() < 0.5 ? -1 : 1;
            const distance = Phaser.Math.Between(400, 900);
            spawnX = playerX + side * distance;
            if (spawnX >= worldMin && spawnX <= worldMax) valid = true;
            attempts++;
        }

        if (!valid) spawnX = Phaser.Math.Clamp(playerX + 400, worldMin, worldMax);
        return spawnX;
    }

    nextWave() {
        this.currentWave++;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesPerWave += 2;
        this.enemySpawnInterval = Math.max(
            this.minSpawnInterval,
            this.enemySpawnInterval - this.spawnIntervalDecrease
        );
        this.showWaveNotification();
    }

    showWaveNotification() {
        const waveText = this.scene.add.text(400, 200, `OLEADA ${this.currentWave}`, {
            fontSize: '32px',
            fill: '#ff0000',
            fontStyle: 'bold'
        });
        waveText.setOrigin(0.5);
        waveText.setScrollFactor(0);
        waveText.setDepth(300);
        this.scene.time.delayedCall(2000, () => waveText.destroy());
    }

    getCurrentWave()     { return this.currentWave; }
    getEnemiesSpawned()  { return this.enemiesSpawnedThisWave; }
    getEnemiesPerWave()  { return this.enemiesPerWave; }

    reset() {
        this.enemySpawnTimer         = 0;
        this.enemySpawnInterval      = 3000;
        this.currentWave             = 1;
        this.enemiesSpawnedThisWave  = 0;
        this.enemiesPerWave          = 5;
    }
}