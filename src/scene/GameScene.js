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
    this.enemy = this.physics.add.sprite(700, 300, 'enemy_dialogue');
    this.enemy.body.setSize(45, 90);
    this.enemy.body.setOffset(45, 40);

    // Controllers
    this.sakuraController = new SakuraController(this, this.sakura);
    this.enemyController = new EnemyController(this, this.enemy, this.sakura);
    
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

    // Debug (opcional)
    this.physics.world.createDebugGraphic();
    this.physics.world.debugGraphic.visible = true;
    this.physics.world.drawDebug = true;
    this.physics.world.debugGraphic.lineStyle(1, 0x00ff00, 1);
}

handleEnemyCollision() {
    console.log("colision");
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