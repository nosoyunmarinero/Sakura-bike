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
        
        // Keys
        this.keys = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.LEFT,
            right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE,
            c: Phaser.Input.Keyboard.KeyCodes.C,
            s: Phaser.Input.Keyboard.KeyCodes.S
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

        // Animaciones enemigo
        this.anims.create({
            key:'enemy_dialogue',
            frames: this.anims.generateFrameNumbers('enemy_dialogue', { start: 0, end: 10 }),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key:"enemy_walk",
            frames: this.anims.generateFrameNumbers('enemy_walk', { start: 0, end: 11 }),
            frameRate: 1,
            repeat: 0
        })
    
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

    // Nuevo método para manejar la colisión con el enemigo
    handleEnemyCollision() {
        console.log("colision");
        // Aquí puedes agregar lógica adicional para la colisión
        // como reducir vida, mostrar animación de daño, etc.
    }

    update() {
        // CONTROLES
        // Definir velocidad de movimiento - adjusted for velocity-based movement
        const moveSpeed = 1000; // Single value instead of multiplying later
        
        // Reset velocity at the start of each update to prevent unwanted movement
        this.sakura.setVelocityX(0);
        
        //Izquierda
        if(this.keys.left.isDown){
            this.sakura.setVelocityX(-moveSpeed); // Simplified velocity value
            this.sakura.anims.play('sakura-walk', true);
            this.sakura.setFlipX(true);
        }
        //Derecha
        if(this.keys.right.isDown){
            this.sakura.setVelocityX(moveSpeed); // Simplified velocity value
            this.sakura.anims.play('sakura-walk', true);
            this.sakura.setFlipX(false);
        }
        //Salto
        if(this.keys.space.isDown && this.sakura.body.touching.down){
            this.sakura.setVelocityY(-350);
        }

        // Rest of the update method remains unchanged
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

        //Enemigo
        // Movimiento del enemigo solo cuando se presiona 's'
        if (this.keys.s.isDown) {
            if (this.enemy.x > this.sakura.x) {
                this.enemy.setVelocityX(-200); // Velocidad negativa para moverse a la izquierda
                this.enemy.setFlipX(true); // Enemigo mira hacia la izquierda (hacia el jugador)
            } else if (this.enemy.x < this.sakura.x) {
                this.enemy.setVelocityX(200); // Velocidad positiva para moverse a la derecha
                this.enemy.setFlipX(false); // Enemigo mira hacia la derecha (hacia el jugador)
            } else {
                this.enemy.setVelocityX(0); // Si está alineado con el jugador, detener movimiento horizontal
            }
            // Reproducir animación del enemigo caminando
            this.enemy.anims.play('enemy_walk', true);
        } else {
            // Detener al enemigo cuando no se presiona la tecla
            this.enemy.setVelocityX(0);
            // Reproducir animación del enemigo en reposo
            this.enemy.anims.play('enemy_dialogue', true);
        }
    }
}

export default GameScene;