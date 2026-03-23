export default class HealthSystem {
    constructor(scene, target, maxHealth = 100) {
        this.scene = scene;
        this.target = target; // Puede ser enemigo o jugador
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isAlive = true;
        this.isInvulnerable = false;
        this.hitCount = 0; // 🔥 Contador de golpes recibidos
        this.hitsToDie = 10; // 🔥 Muere a los 10 golpes
        this.hitsToDieEnemy = 3; // 🔥 Muere a los 3 golpes 
        
        // Eventos para comunicación
        this.onDamage = new Phaser.Events.EventEmitter();
        this.onDeath = new Phaser.Events.EventEmitter();
    }

    // 🔥 MÉTODO PARA RECIBIR DAÑO (versión simple por golpes)
    takeDamage(damage = 1) {
        if (!this.isAlive || this.isInvulnerable) return false;
        
        this.hitCount++; // 🔥 Contar golpes
        this.currentHealth = this.maxHealth - (this.hitCount * (this.maxHealth / this.hitsToDie));
        
        // Emitir evento de daño
        this.onDamage.emit('damage', {
            target: this.target,
            hitCount: this.hitCount,
            health: this.currentHealth,
            isCritical: this.hitCount >= this.hitsToDie - 1 // Último golpe
        });
        
        // 🔥 INVULNERABILIDAD TEMPORAL (opcional, evita golpes consecutivos)
        this.setInvulnerable(300);
        
        // Verificar muerte
        if (this.hitCount >= this.hitsToDie) {
            this.die();
            return true;
        }
        
        return false;
    }

    // 🔥 MÉTODO DE MUERTE
    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.hitCount = this.hitsToDie; // Asegurar que esté en máximo
        
        // Emitir evento de muerte
        this.onDeath.emit('death', {
            target: this.target,
            hitCount: this.hitCount
        });
    }

    // 🔥 INVULNERABILIDAD TEMPORAL
    setInvulnerable(duration = 300) {
        this.isInvulnerable = true;
        this.scene.time.delayedCall(duration, () => {
            this.isInvulnerable = false;
        });
    }

    // 🔥 CURACIÓN
    heal(amount = 1) {
        if (!this.isAlive) return;
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
        if (this.hitCount > 0) {
            const perHit = this.maxHealth / this.hitsToDie;
            const healedHits = Math.floor(amount / perHit);
            this.hitCount = Math.max(0, this.hitCount - healedHits);
        }
    }

    // 🔥 REINICIAR VIDA
    reset() {
        this.currentHealth = this.maxHealth;
        this.hitCount = 0;
        this.isAlive = true;
        this.isInvulnerable = false;
    }

    // 🔥 MÉTODOS DE CONSULTA (AGREGADOS PARA CORREGIR EL ERROR)
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
    
    getRemainingHits() {
        return this.hitsToDie - this.hitCount;
    }
    
    isAboutToDie() {
        return this.hitCount >= this.hitsToDie - 1;
    }

    // 🔥 NUEVO: Aplicar daño directo (por cantidad de daño)
    applyDamage(amount = 0) {
        if (!this.isAlive || this.isInvulnerable) return false;
        this.currentHealth = Math.max(0, this.currentHealth - amount);
        if (this.currentHealth <= 0) {
            this.die();
            return true;
        }
        return false;
    }
}
