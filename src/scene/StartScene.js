class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.6);
        overlay.setScrollFactor(0);

        const title = this.add.text(centerX, centerY - 100, 'Sakura Bike', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setScrollFactor(0);
        const fsBtn = this.add.text(this.cameras.main.width - 80, 30, 'Fullscreen', { fontSize: '14px', fill: '#ffffff', backgroundColor: '#333333' });
        fsBtn.setOrigin(0.5);
        fsBtn.setScrollFactor(0);
        fsBtn.setDepth(10);
        fsBtn.setPadding(6, 4, 6, 4);
        fsBtn.setInteractive({ useHandCursor: true });
        fsBtn.on('pointerdown', () => {
            if (this.scale && this.scale.startFullscreen) {
                this.scale.startFullscreen();
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        });
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale && this.scale.startFullscreen) {
                this.scale.startFullscreen();
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        });

        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const promptText = isMobile ? 'Toca JUGAR' : 'Presiona SPACE para iniciar';
        const prompt = this.add.text(centerX, centerY + 10, promptText, {
            fontSize: '20px',
            fill: '#ffffff'
        });
        prompt.setOrigin(0.5);
        prompt.setScrollFactor(0);

        const controls = [
            'Controles:',
            'J: Atacar',
            'K: Parry',
            'SHIFT: Dash',
            'SPACE: Saltar',
            'P: Pausa'
        ];
        const controlsText = this.add.text(centerX, centerY + 120, controls.join('\n'), {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        });
        controlsText.setOrigin(0.5);
        controlsText.setScrollFactor(0);

        if (isMobile) {
            const playBtn = this.add.rectangle(centerX, centerY + 50, 160, 40, 0x222222).setStrokeStyle(2, 0xffffff);
            const playTxt = this.add.text(centerX, centerY + 50, 'JUGAR', { fontSize: '18px', fill: '#ffffff' });
            playTxt.setOrigin(0.5);
            playBtn.setScrollFactor(0);
            playTxt.setScrollFactor(0);
            playBtn.setInteractive({ useHandCursor: true });
            playBtn.on('pointerdown', async () => {
                try {
                    if (this.scale && this.scale.startFullscreen) {
                        this.scale.startFullscreen();
                    } else if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                    }
                    if (screen.orientation && screen.orientation.lock) {
                        try { await screen.orientation.lock('landscape'); } catch(e) {}
                    }
                } catch(e) {}
                this.scene.start('GameScene');
            });
        } else {
            this.input.keyboard.once('keydown-SPACE', () => {
                this.scene.start('GameScene');
            });
        }

        overlay.setInteractive();
        if (isMobile) {
            overlay.on('pointerdown', async () => {
                try {
                    if (this.scale && this.scale.startFullscreen) {
                        this.scale.startFullscreen();
                    } else if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                    }
                    if (screen.orientation && screen.orientation.lock) {
                        try { await screen.orientation.lock('landscape'); } catch(e) {}
                    }
                } catch(e) {}
                this.scene.start('GameScene');
            });
        }
    }
}

export default StartScene;
