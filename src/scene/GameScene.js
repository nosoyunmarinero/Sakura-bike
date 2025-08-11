import SakuraController from '../controls/SakuraController.js';
import EnemyController from '../controls/EnemyController.js';
import SakuraAnims from '../anims/SakuraAnims.js';
import EnemyAnims from '../anims/EnemyAnims.js';
import background from '../background/brackground1.js';



class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // La precarga principal se hace en PreloadScene
    }

    create() {
        
        // Background
        this.background = new background(this);

        // Player
        this.sakura = this.physics.add.sprite(50, 400, 'player_walk');
        // Adjust player hitbox
        this.sakura.body.setSize(45, 80); // Reducimos la altura de 110 a 90
        this.sakura.body.setOffset(45, 50); // Aumentamos el offset Y de 20 a 40

        //Enemy
        this.enemy = this.physics.add.sprite(700, 400, 'enemy_dialogue');
        // Adjust enemy hitbox
        this.enemy.body.setSize(45, 90); // Reducimos la altura de 110 a 90
        this.enemy.body.setOffset(45, 40); // Aumentamos el offset Y de 20 a 40
        // Adjust enemy hitbox
        this.enemy.body.setSize(45, 80); // Reduce width, keep height appropriate
        this.enemy.body.setOffset(45, 50); // Adjust offset to center the hitbox
        
        //Sakura controller
        this.sakuraController = new SakuraController(this, this.sakura);
         //Enemy controller
        this.enemyController = new EnemyController(this, this.enemy, this.sakura);
        
        // Animación
        this.SakuraAnims = new SakuraAnims(this);

        // Animaciones enemigo
       this.EnemyAnims = new EnemyAnims(this);

       

        // Definir límites del mundo - reduced size
        this.physics.world.setBounds(0, 0, 800, 500); // Smaller bounds
        this.sakura.setCollideWorldBounds(true);
        this.enemy.setCollideWorldBounds(true);
        
        // colisiones
        this.physics.add.collider(this.sakura, this.floor);
        this.physics.add.collider(this.enemy, this.floor);
        
        // Cambiamos overlap por collider para que no puedan atravesarse
        this.physics.add.collider(this.sakura, this.enemy, this.handleEnemyCollision, null, this);
    
        // Add this after setting up all physics bodies
                this.physics.world.createDebugGraphic();
                this.physics.world.debugGraphic.visible = true;
                
                // Add this line to make world bounds visible
                this.physics.world.drawDebug = true;
                
                // Optional: Set different colors for different types of bodies
                this.physics.world.debugGraphic.lineStyle(1, 0x00ff00, 1); // Green for world bounds
    }

    handleEnemyCollision() {
        console.log("colision");
    }

    update() {
        //Sakura
        this.sakuraController.update();

        //Enemigo
        this.enemyController.update();
}
}
export default GameScene;