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
    }
}

const game = new Phaser.Game(config);

function preload() {
    console.log("preload");
    this.load.image('cloud1', './assets/background/Clouds/Cloud2.png');
    this.load.image('floor', './assets/background/Misc/Assets.png');
}
function create() {
    console.log("create");
    
    this.add.image(0, 0, 'cloud1').setOrigin(0, 0).setScale(2.5);
    this.add.image(100, 0, 'cloud1').setOrigin(0, 0).setScale(2.5);
    this.add.image(350, 0, 'cloud1').setOrigin(0, 0).setScale(2.7);
    this.add.image(100,100, 'cloud1').setOrigin(0, 0).setScale(2.7);

    // Piso
    this.add.image(200, 700, 'floor').setScale(2.3);
    this.add.image(560, 700, 'floor').setScale(2.3);
}
function update() {
    console.log("update");
}