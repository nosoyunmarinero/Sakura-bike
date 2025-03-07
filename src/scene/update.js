export default class Update extends Phaser.Scene {
constructor() {
    super({ key: 'Update' });
}   

update() {
    // Controles
    if(this.keys.left.isDown){
       this.sakura.x -= 3;
       this.sakura.anims.play('sakura-walk', true);
       this.sakura.setFlipX(true); // Asegura que mire a la derecha
   }
   if(this.keys.right.isDown){
   this.sakura.x += 3;
   this.sakura.anims.play('sakura-walk', true);
   this.sakura.setFlipX(false); // Voltea hacia la izquierda
   }
   if(this.keys.space.isDown){
       this.sakura.y -=
   4;
   this.sakura.anims.play('sakura-protection', true);
   }
   if(!this.keys.left.isDown && !this.keys.right.isDown){
   this.sakura.anims.stop('sakura-walk');
   this.sakura.setFrame(0);
   this.sakura.anims.play('sakura-idle', true);
   }
} }