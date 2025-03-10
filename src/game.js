const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#f8e1fc',
    parent: "game",
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    physics:{
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
    }
}
}

const game = new Phaser.Game(config);

function preload() {
     // Background
     this.load.image('cloud1', './assets/background/Clouds/Cloud2.png');
     this.load.image('floor', './assets/background/Misc/Assets.png');

     // Player
     this.load.spritesheet('player_walk', './assets/character/Walk.png', { frameWidth: 128, frameHeight: 128 });
     this.load.spritesheet('player_idle', './assets/character/Idle.png', { frameWidth: 128, frameHeight: 128 });
     this.load.spritesheet('player_Protection', './assets/character/Protection.png', { frameWidth: 128, frameHeight: 128 });
     this.load.spritesheet('player_attack', './assets/character/Attack.png', { frameWidth: 128, frameHeight: 128 });
}
function create() {
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
     } );
 
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
        frameRate: 17,
        repeat: 0
    });
 
     // colisiones
     this.physics.add.collider(this.sakura, this.floor);
}
function update() {
     // CONTROLES
     //Izquierda
     if(this.keys.left.isDown){
        this.sakura.x -= 3;
        this.sakura.anims.play('sakura-walk', true);
        this.sakura.setFlipX(true); // Asegura que mire a la derecha
    }
    //Derecha
    if(this.keys.right.isDown){
    this.sakura.x += 3;
    this.sakura.anims.play('sakura-walk', true);
    this.sakura.setFlipX(false); // Voltea hacia la izquierda
    }
    //Salto
    if(this.keys.space.isDown && this.sakura.body.touching.down){
        
    this.sakura.setVelocityY(-300); // Salta hacia arriba con fuerza
    }

    if(!this.sakura.body.touching.down){
        this.sakura.anims.play('sakura-protection', true);
    }
    //Ataque
    if(this.keys.c.isDown ){
    console.log("ataque")
    this.sakura.anims.play('sakura-attack', true)
    return;
    }

    //Quedarse
    if(this.sakura.body.touching.down && !this.keys.left.isDown && !this.keys.right.isDown && !this.keys.c.isDown){
        this.sakura.anims.play("sakura-idle", true)
    }
    
}