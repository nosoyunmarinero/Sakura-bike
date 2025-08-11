export default class background {
    constructor(scene){
        this.scene = scene;
        this.createBackground();
    }

    createBackground(){
        // Background
        this.scene.add.image(0, 0, 'cloud1').setOrigin(0, 0).setScale(2.5);
        this.scene.add.image(100, 0, 'cloud1').setOrigin(0, 0).setScale(2.5);
        this.scene.add.image(350, 0, 'cloud1').setOrigin(0, 0).setScale(2.7);
        this.scene.add.image(100,100, 'cloud1').setOrigin(0, 0).setScale(2.7);
    
        // Piso
        this.floor = this.scene.physics.add.staticGroup();

        // Piso más bajo para dar espacio (Y=450 en lugar de 410)
        // Línea 1: Crea suelo central - posición (232, 450), ancho 300px, alto 20px con offset vertical
        this.floor.create(232, 430, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(300, 20).setOffset(0, 70);
        
        // Línea 2: Crea suelo izquierdo extendido - posición (-100, 450), ancho 1000px, alto 20px con offset vertical  
        this.floor.create(-100, 430, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(1000, 20).setOffset(0, 70);
        
        // Línea 3: Crea suelo derecho extendido - posición (1000, 450), ancho 1000px, alto 20px con offset vertical
        this.floor.create(1000, 430, 'floor').setOrigin(0, 0).setScale(2.3).refreshBody().body.setSize(1000, 20).setOffset(0, 70);
    }
}
