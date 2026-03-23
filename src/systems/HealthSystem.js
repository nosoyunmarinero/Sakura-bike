export default class HealthSystem {
  constructor(scene, target, maxHealth = 100) {
    this.scene = scene;
    this.target = target;
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.isAlive = true;
    this.isInvulnerable = false;

    this.onDamage = new Phaser.Events.EventEmitter();
    this.onDeath = new Phaser.Events.EventEmitter();
  }

  applyDamage(amount = 0) {
    if (!this.isAlive || this.isInvulnerable) return false;
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.onDamage.emit("damage", {
      target: this.target,
      health: this.currentHealth,
    });
    this.setInvulnerable(300);
    if (this.currentHealth <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.currentHealth = 0;
    this.onDeath.emit("death", { target: this.target });
  }

  heal(amount = 0) {
    if (!this.isAlive) return;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }

  setInvulnerable(duration = 300) {
    this.isInvulnerable = true;
    this.scene.time.delayedCall(duration, () => {
      this.isInvulnerable = false;
    });
  }

  reset() {
    this.currentHealth = this.maxHealth;
    this.isAlive = true;
    this.isInvulnerable = false;
  }

  getHealth() {
    return this.currentHealth;
  }
  getMaxHealth() {
    return this.maxHealth;
  }
  isDead() {
    return !this.isAlive;
  }
  getHealthPercentage() {
    return (this.currentHealth / this.maxHealth) * 100;
  }
}
