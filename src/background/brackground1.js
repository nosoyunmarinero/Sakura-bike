export default class background {
    constructor(scene){
        this.scene = scene;
        this.createBackground();
    }

    createBackground(){
        // Background
        this.scene.add.image(0, 0, 'cloud1').setOrigin(0, 0).setScale(5);
        this.scene.add.image(100, 0, 'cloud1').setOrigin(0, 0).setScale(5);
        this.scene.add.image(350, 0, 'cloud1').setOrigin(0, 0).setScale(7);
        this.scene.add.image(100,100, 'cloud1').setOrigin(0, 0).setScale(7);
    
        // Piso
        this.floor = this.scene.physics.add.staticGroup();

        // Piso más bajo para dar espacio (Y=450 en lugar de 410)
        // Línea 1: 
        this.floor.create(-70, 575, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(300, 20).setOffset(0, 70);

        // Línea 2: Crea suelo izquierdo extendido - posición (-100, 450), ancho 1000px, alto 20px con offset vertical  
        this.floor.create(420, 575, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(1000, 20).setOffset(0, 70);
        
        // Línea 3: 
        this.floor.create(910, 575, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(1000, 20).setOffset(0, 70);

        // Línea 4: 
        this.floor.create(1400, 575, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(1000, 20).setOffset(0, 70);
    }
}
