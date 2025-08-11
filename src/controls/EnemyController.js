export default class EnemyController {
    constructor(scene, enemy, sakura) {
        this.scene = scene;
        this.enemy = enemy;
        this.sakura = sakura;
         this.keys = scene.input.keyboard.addKeys({
            y: Phaser.Input.Keyboard.KeyCodes.Y,
        });
    }

    update() {
       if (this.keys.y.isDown) {
            if (this.enemy.x > this.sakura.x) {
                this.enemy.setVelocityX(-900); // Velocidad negativa para moverse a la izquierda
                this.enemy.setFlipX(true); // Enemigo mira hacia la izquierda (hacia el jugador)
            } else if (this.enemy.x < this.sakura.x) {
                this.enemy.setVelocityX(900); // Velocidad positiva para moverse a la derecha
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
