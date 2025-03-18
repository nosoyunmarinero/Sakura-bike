class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // La precarga principal se hace en PreloadScene
    }

    create() {
        // Background
        this.add.image(0, 0, 'cloud1').setOrigin(0, 0).setScale(2.5);
        this.add.image(100, 0, 'cloud1').setOrigin(0, 0).setScale(2.5);
        this.add.image(350, 0, 'cloud1').setOrigin(0, 0).setScale(2.7);
        this.add.image(100,100, 'cloud1').setOrigin(0, 0).setScale(2.7);
    
        // Piso
        this.floor = this.physics.add.staticGroup();
        this.floor.create(232, 410, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(300, 20).setOffset(0, 70);
        this.floor.create(-100, 410, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(1000, 20).setOffset(0, 70);
    
        // Player
        this.sakura = this.physics.add.sprite(50, 400, 'player_walk');
    
        // Keys
        this.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            c: Phaser.Input.Keyboard.KeyCodes.C
        });
    
        // Animación
        this.anims.create({
            key: 'sakura-walk',
            frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 11 }),
            frameRate: 17,
            repeat: 0
        });
    
        this.anims.create({
            key: 'sakura-idle',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 6 }),
            frameRate: 10,
            repeat: 0
        });
    
        this.anims.create({
            key: 'sakura-protection',
            frames: this.anims.generateFrameNumbers('player_Protection', { start: 0, end: 1 }),
            frameRate: 1,
            repeat: 0
        });

        this.anims.create({
            key: 'sakura-attack',
            frames: this.anims.generateFrameNumbers('player_attack', { start: 0, end: 8 }),
            frameRate: 14,
            repeat: 0
        });
    
        // colisiones
        this.physics.add.collider(this.sakura, this.floor);
    }

    update() {
        // CONTROLES
        // Definir velocidad de movimiento
        const moveSpeed = 5; // Aumentado de 3 a 5 para mayor velocidad
        
        //Izquierda
        if(this.keys.left.isDown){
            this.sakura.x -= moveSpeed; // Usando la variable de velocidad
            this.sakura.anims.play('sakura-walk', true);
            this.sakura.setFlipX(true); // Asegura que mire a la derecha
        }
        //Derecha
        if(this.keys.right.isDown){
            this.sakura.x += moveSpeed; // Usando la variable de velocidad
            this.sakura.anims.play('sakura-walk', true);
            this.sakura.setFlipX(false); // Voltea hacia la izquierda
        }
        //Salto
        if(this.keys.space.isDown && this.sakura.body.touching.down){
            this.sakura.setVelocityY(-350); // Salta hacia arriba con fuerza
        }

        if(!this.sakura.body.touching.down){
            this.sakura.anims.play('sakura-protection', true);
        }
        //Ataque
        if(this.keys.c.isDown){
            console.log("ataque");
            this.sakura.anims.play('sakura-attack', true);
            return;
        }

        //Quedarse
        if(this.sakura.body.touching.down && !this.keys.left.isDown && !this.keys.right.isDown && !this.keys.c.isDown){
            this.sakura.anims.play("sakura-idle", true);
        }
    }
}

export default GameScene;