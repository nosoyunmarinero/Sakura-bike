export default class Create extends Phaser.Scene { 
    constructor() {
        super({ key: 'Create' });
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
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
    } );

    // Animación
    this.anims.create({
        key: 'sakura-walk',
        frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 12 }),
        frameRate: 17,
        repeat: 0
    });

    this.anims.create({
        key: 'sakura-idle',
        frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 7 }),
        frameRate: 17,
        repeat: 0
    });

    this.anims.create({
        key: 'sakura-protection',
        frames: this.anims.generateFrameNumbers('player_Protection', { start: 0, end: 7 }),
        frameRate: 17,
        repeat: 0
    });

    // colisiones
    this.physics.add.collider(this.sakura, this.floor);

   
} }