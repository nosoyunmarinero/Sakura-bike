import SakuraController from '../controls/SakuraController.js';
import EnemyController from '../controls/EnemyController.js';
import SakuraAnims from '../anims/SakuraAnims.js';
import EnemyAnims from '../anims/EnemyAnims.js';
import BackgroundManager from '../background/brackgroundManager.js';



class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // La precarga principal se hace en PreloadScene
    }

   create() {
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
    this.sakura = this.physics.add.sprite(100, 300, 'player_walk').setScale(2,2); // Cambiado Y a 300
    this.sakura.anims.play;
    
    
    //Hitbox
    this.sakura.body.setSize(25, 30);
    this.sakura.body.setOffset(10, 10);
    

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
    this.floor.create(480, 540, null).setSize(10000, 20).setVisible(false); // Suelo invisible

    // Controllers
    this.sakuraController = new SakuraController(this, this.sakura);
    this.enemyController = new EnemyController(this, this.enemy, this.sakura);
    
        // 🔥 CONECTAR ENEMIGO CON SU CONTROLADOR
        this.enemy.enemyController = this.enemyController;

       // 🔥 AGREGAR EL ENEMIGO AL SISTEMA DE DETECCIÓN DE ATAQUE
        this.sakuraController.addEnemy(this.enemy);
    
    // Animaciones
    this.SakuraAnims = new SakuraAnims(this);
    this.EnemyAnims = new EnemyAnims(this);

    // La altura 540 es el tamaño de tu pantalla, el suelo debe estar en Y = 540
    this.physics.world.setBounds(-5000, -50, 10000, 540); // x, y, width, height
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

    // Debug (opcional)
    this.physics.world.createDebugGraphic();
    this.physics.world.debugGraphic.visible = true;
    this.physics.world.drawDebug = true;
    this.physics.world.debugGraphic.lineStyle(2, 0xff0000, 1); // Grosor 2, color rojo, opacidad 1
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
    
    // Agregar al sistema de ataque
    this.sakuraController.addEnemy(newEnemy);
    
    // Colisiones
    this.physics.add.collider(newEnemy, this.floor);
    this.physics.add.collider(this.sakura, newEnemy, this.handleEnemyCollision, null, this);
    
}

update() {
    // Background
    this.backgroundManager.update();

    // Sakura
    this.sakuraController.update();

    // Enemigo
    this.enemyController.update();
}
}
export default GameScene;