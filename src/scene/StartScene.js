class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6);
        overlay.setScrollFactor(0);

        const title = this.add.text(centerX, centerY - 40, 'Sakura Bike', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setScrollFactor(0);

        const prompt = this.add.text(centerX, centerY + 20, 'Presiona SPACE para iniciar', {
            fontSize: '20px',
            fill: '#ffffff'
        });
        prompt.setOrigin(0.5);
        prompt.setScrollFactor(0);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });

        overlay.setInteractive();
    }
}

export default StartScene;
