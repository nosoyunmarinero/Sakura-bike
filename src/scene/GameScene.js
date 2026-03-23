import SakuraController from '../controls/SakuraController.js';
import EnemyController from '../controls/EnemyController.js';
import EnemySystem from '../systems/EnemySystem.js';
import WaveSystem from '../systems/WaveSystem.js'; // 🔥 NUEVO IMPORT
import SakuraAnims from '../anims/SakuraAnims.js';
import EnemyAnims from '../anims/EnemyAnims.js';
import BackgroundManager from '../background/brackgroundManager.js';
import HealthSystem from '../systems/HealthSystem.js';
import CardStore from '../systems/CardStore.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // La precarga principal se hace en PreloadScene
    }

    create() {
        // 🔥 VARIABLE DE CONTROL DE ESTADO
        this.isPlayerDead = false;
        this.isPaused = false;
        this.isStoreOpen = false;
        this.isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        
        // Configurar gravedad
        this.physics.world.gravity.y = 800;
        
        // Background
        const layersConfig = [
            { key: '1', speed: 0.1 },
            { key: '2', speed: 0.2 },
            { key: '3', speed: 0.3 },
            { key: '4', speed: 0.4 },
            { key: '5', speed: 0.5 },
            { key: '6', speed: 0.6 },
            { key: '7', speed: 0.8 },
            { key: '8', speed: 1.0 }
        ];

        // Crear el manager de background
        this.backgroundManager = new BackgroundManager(this, layersConfig);

        // Player - posicionado más abajo, cerca del suelo
        this.sakura = this.physics.add.sprite(100, 300, 'player_walk').setScale(2,2);
        
        // Hitbox
        this.sakura.body.setSize(25, 30);
        this.sakura.body.setOffset(10, 10);
        
        // 🔥 SISTEMA DE SALUD DEL JUGADOR (100 HP)
        this.playerHealthSystem = new HealthSystem(this, this.sakura, 100);

        // Configurar cámara
        this.cameras.main.startFollow(this.sakura);
        this.cameras.main.setLerp(0.1, 0.1);
        
        // Configurar los límites de la cámara
        this.cameras.main.setBounds(-5000, 0, 10000, 540);

        // Enemy - posicionado a la misma altura que el personaje
        this.enemy = this.physics.add.sprite(500, 300, 'enemy_idle');
        this.enemy.anims.play('enemy_idle', true);
        this.enemy.body.setSize(40, 70);
        this.enemy.body.setOffset(25, 15);
        this.enemy.enemyData = { type: 'Skeleton', attackDamage: 10, speed: 100, attackType: 'melee' };
        
        // 🔥 CREAR EL SUELO PRIMERO
        this.floor = this.physics.add.staticGroup();
        this.floor.create(480, 540, null).setSize(10000, 20).setVisible(false);

        // Controllers
        this.sakuraController = new SakuraController(this, this.sakura);
        this.enemyController = new EnemyController(this, this.enemy, this.sakura);

        // 🔥 CONFIGURAR ENEMIGO PARA QUE MUERA EN 3 GOLPES
        this.enemyController.healthSystem.hitsToDie = 3;
        
        // 🔥 CREAR SISTEMA DE ENEMIGOS
        this.enemySystem = new EnemySystem(this, this.sakura);
        this.enemySystem.addEnemy(this.enemy);
        
        // 🔥 CONECTAR ENEMIGO CON SU CONTROLADOR
        this.enemy.enemyController = this.enemyController;

        // 🔥 AGREGAR EL ENEMIGO AL SISTEMA DE DETECCIÓN DE ATAQUE
        this.sakuraController.addEnemy(this.enemy);
        
        // 🔥 CREAR SISTEMA DE OLEADAS
        this.waveSystem = new WaveSystem(this, this.sakura, this.enemySystem, this.sakuraController);
        
        // Animaciones
        this.SakuraAnims = new SakuraAnims(this);
        this.EnemyAnims = new EnemyAnims(this);

        // La altura 540 es el tamaño de tu pantalla, el suelo debe estar en Y = 540
        this.physics.world.setBounds(-5000, -50, 10000, 540);
        this.sakura.setCollideWorldBounds(true);
        this.enemy.setCollideWorldBounds(true);

        // Colisiones
        this.physics.add.collider(this.sakura, this.floor);
        this.physics.add.collider(this.enemy, this.floor);
        
        // Cambiamos overlap por collider para que no puedan atravesarse
        this.physics.add.collider(this.sakura, this.enemy, this.handleEnemyCollision, null, this);

        // 🔥 BARRA DE SALUD DEL JUGADOR
        this.createHealthBar();
        this.flowers = 0;
        this.coins = 0;
        this.noFlowerDeaths = 0;
        this.createResourceHUD();
        this.ownedCards = [];
        const rightXOwned = this.cameras.main.width - 24;
        this.ownedCardsText = this.add.text(rightXOwned, 120, 'Cartas: -', { fontSize: '14px', fill: '#ffffff' });
        this.ownedCardsText.setOrigin(1, 0);
        this.ownedCardsText.setScrollFactor(0);
        this.ownedCardsText.setDepth(150);
        this.pickupsGroup = this.physics.add.group({ allowGravity: false, immovable: true });
        this.physics.add.overlap(this.sakura, this.pickupsGroup, this.handlePickupOverlap, null, this);
        this.cardStore = new CardStore(this);
        this.cards = {
            coronaEspinas: false,
            sakuraShuriken: false,
            ritmoEterno: { enabled: false, lastUse: 0, cooldown: 30000 },
            broteExplosivo: { enabled: false, counter: 0 },
            bendicionSilvestre: { enabled: false, activeUntil: 0 },
            semillaDorada: { enabled: false, flowerCount: 0 },
            espirituAliado: { enabled: false },
            vinculoEspiritual: { enabled: false },
            florCarmesi: false,
            luzEspectral: { enabled: false, activeUntil: 0, reduction: 0.95 }
        };
        this.hazards = this.physics.add.group({ allowGravity: false });
        this.physics.add.overlap(this.hazards, this.enemySystem ? this.enemySystem.enemies : [], (hazard, enemy) => {
            if (enemy && enemy.enemyController) enemy.enemyController.takeDamage();
        });

        const pauseButton = this.add.text(900, 30, 'Pausa', { fontSize: '18px', fill: '#000000', backgroundColor: '#ffffff' });
        pauseButton.setOrigin(0.5);
        pauseButton.setScrollFactor(0);
        pauseButton.setDepth(400);
        pauseButton.setPadding(8, 4, 8, 4);
        pauseButton.setInteractive({ useHandCursor: true });
        pauseButton.on('pointerdown', () => this.togglePause());
        const storeHint = this.add.text(820, 30, 'B: Tienda', { fontSize: '14px', fill: '#ffffff' });
        storeHint.setOrigin(0.5);
        storeHint.setScrollFactor(0);
        storeHint.setDepth(401);
        const fsButton = this.add.text(760, 30, 'Fullscreen', { fontSize: '14px', fill: '#ffffff', backgroundColor: '#333333' });
        fsButton.setOrigin(0.5);
        fsButton.setScrollFactor(0);
        fsButton.setDepth(401);
        fsButton.setPadding(6, 4, 6, 4);
        fsButton.setInteractive({ useHandCursor: true });
        fsButton.on('pointerdown', () => {
            if (this.scale && this.scale.startFullscreen) {
                this.scale.startFullscreen();
            } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        });

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.pauseOverlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);
        this.pauseOverlay.setScrollFactor(0);
        this.pauseOverlay.setDepth(500);
        this.pauseOverlay.setVisible(false);
        this.pauseOverlay.setInteractive();
        this.pauseOverlay.on('pointerdown', () => this.togglePause());

        this.pauseText = this.add.text(centerX, centerY - 20, 'PAUSA', { fontSize: '48px', fill: '#ffffff' });
        this.pauseText.setOrigin(0.5);
        this.pauseText.setScrollFactor(0);
        this.pauseText.setDepth(501);
        this.pauseText.setVisible(false);

        this.resumePrompt = this.add.text(centerX, centerY + 30, 'Presiona P o clic para continuar', { fontSize: '20px', fill: '#ffffff' });
        this.resumePrompt.setOrigin(0.5);
        this.resumePrompt.setScrollFactor(0);
        this.resumePrompt.setDepth(501);
        this.resumePrompt.setVisible(false);

        this.input.keyboard.on('keydown-P', () => this.togglePause());
        this.input.keyboard.on('keydown-B', () => this.toggleStore());
        this.setupMobileUI();
    }

    // 🔥 MÉTODO PARA CREAR BARRA DE SALUD
    createHealthBar() {
        // Crear contenedor para la barra de salud
        this.healthBarBg = this.add.rectangle(100, 50, 200, 20, 0x000000);
        this.healthBarBg.setScrollFactor(0);
        this.healthBarBg.setDepth(100);
        
        this.healthBar = this.add.rectangle(100, 50, 200, 20, 0xff0000);
        this.healthBar.setScrollFactor(0);
        this.healthBar.setDepth(101);
        
        // Texto de salud
        const initCurrent = this.playerHealthSystem.getHealth();
        const initMax = this.playerHealthSystem.getMaxHealth();
        const initPct = initCurrent / initMax;
        this.healthBar.width = 200 * initPct;
        this.healthText = this.add.text(100, 80, `HP: ${initCurrent}/${initMax}`, {
            fontSize: '16px',
            fill: '#ffffff'
        });
        this.healthText.setScrollFactor(0);
        this.healthText.setDepth(102);
    }

    // 🔥 MÉTODO PARA ACTUALIZAR BARRA DE SALUD
    updateHealthBar() {
        const currentHealth = this.playerHealthSystem.getHealth();
        const maxHealth = this.playerHealthSystem.getMaxHealth();
        const healthPercentage = currentHealth / maxHealth;
        
        this.healthBar.width = 200 * healthPercentage;
        this.healthText.setText(`HP: ${currentHealth}/${maxHealth}`);
    }

    createResourceHUD() {
        const rightX = this.cameras.main.width - 24;
        this.comboText = this.add.text(rightX, 60, `Combo: 0 x1`, { fontSize: '16px', fill: '#ffffff' });
        this.comboText.setOrigin(1, 0);
        this.comboText.setScrollFactor(0);
        this.comboText.setDepth(150);
        this.flowersText = this.add.text(rightX, 80, `Flores: ${this.flowers}`, { fontSize: '16px', fill: '#ffffff' });
        this.flowersText.setOrigin(1, 0);
        this.flowersText.setScrollFactor(0);
        this.flowersText.setDepth(150);
        this.coinsText = this.add.text(rightX, 100, `Monedas: ${this.coins}`, { fontSize: '16px', fill: '#ffffff' });
        this.coinsText.setOrigin(1, 0);
        this.coinsText.setScrollFactor(0);
        this.coinsText.setDepth(150);
    }

    collectResource(type, amount = 1) {
        if (type === 'flower') {
            this.flowers += amount;
            this.flowersText.setText(`Flores: ${this.flowers}`);
            if (this.cards.semillaDorada.enabled) {
                this.cards.semillaDorada.flowerCount += amount;
                if (this.cards.semillaDorada.flowerCount >= 5) {
                    this.cards.semillaDorada.flowerCount -= 5;
                    this.collectResource('coin', 1);
                }
            }
            if (this.cards.luzEspectral.enabled) {
                this.cards.luzEspectral.activeUntil = this.time.now + 10000;
            }
            if (this.cards.broteExplosivo.enabled) {
                this.cards.broteExplosivo.counter += amount;
                if (this.cards.broteExplosivo.counter >= 10) {
                    this.cards.broteExplosivo.counter -= 10;
                    this.spawnExplosionAoE(this.sakura.x, this.sakura.y, 90);
                }
            }
        } else if (type === 'coin') {
            this.coins += amount;
            this.coinsText.setText(`Monedas: ${this.coins}`);
        }
    }

    updateComboUI(count, mult) {
        if (this.comboText) {
            this.comboText.setText(`Combo: ${count} x${mult}`);
        }
    }

    onEnemyDeath(enemy) {
        const guaranteeFlower = this.noFlowerDeaths >= 10;
        if (guaranteeFlower || Math.random() < 0.6) {
            this.spawnPickup('flower', enemy.x, enemy.y);
            this.noFlowerDeaths = 0;
        } else {
            this.noFlowerDeaths++;
        }
        let coinProb = 0.3;
        if (this.cards.semillaDorada.enabled) {
            // handled via per-5 flowers; keep base prob
            coinProb = 0.3;
        }
        if (Math.random() < coinProb) {
            this.spawnPickup('coin', enemy.x, enemy.y);
        }
        if (this.cards.florCarmesi) {
            const trail = this.add.rectangle(enemy.x, enemy.y, 60, 10, 0xff0000);
            const zone = this.add.zone(enemy.x, enemy.y, 60, 10);
            this.physics.add.existing(zone);
            zone.body.setAllowGravity(false);
            zone.visual = trail;
            this.hazards.add(zone);
            this.time.delayedCall(2000, () => {
                if (zone.active) {
                    if (zone.visual) zone.visual.destroy();
                    zone.destroy();
                }
            });
        }
        const isElite = enemy.enemyData && (enemy.enemyData.type === 'Punisher' || enemy.enemyData.type === 'Grimm');
        if (isElite) {
            if (this.cards.bendicionSilvestre.enabled) {
                this.cards.bendicionSilvestre.activeUntil = this.time.now + 60000;
            }
            if (this.cards.espirituAliado.enabled && Math.random() < 0.1) {
                this.spawnAlly();
            }
        }
    }

    spawnPickup(type, x, y) {
        const size = 16;
        const zone = this.add.zone(x, y, size, size);
        this.physics.add.existing(zone);
        zone.body.setAllowGravity(false);
        zone.body.setImmovable(true);
        zone.pickupType = type;
        const color = type === 'flower' ? 0xff66cc : 0xffd700;
        const rect = this.add.rectangle(x, y, size, size, color);
        rect.setDepth(140);
        zone.visual = rect;
        this.pickupsGroup.add(zone);
        this.time.delayedCall(15000, () => {
            if (zone.active) {
                this.pickupsGroup.remove(zone, true, true);
            }
            if (rect && rect.active) rect.destroy();
        });
    }

    handlePickupOverlap(player, zone) {
        const type = zone.pickupType;
        if (!type) return;
        this.collectResource(type, 1);
        if (zone.visual) zone.visual.destroy();
        this.pickupsGroup.remove(zone, true, true);
    }

    toggleStore() {
        if (this.isPlayerDead) return;
        if (this.isStoreOpen) {
            this.closeStore();
            return;
        }
        const nearEnemy = this.enemySystem.enemies.some(e => Phaser.Math.Distance.Between(e.x, e.y, this.sakura.x, this.sakura.y) < 120);
        if (nearEnemy) {
            const warn = this.add.text(480, 100, 'No puedes abrir la tienda en combate', { fontSize: '18px', fill: '#ff6666' });
            warn.setOrigin(0.5);
            warn.setScrollFactor(0);
            warn.setDepth(600);
            this.time.delayedCall(1200, () => warn.destroy());
            return;
        }
        this.openStore();
    }

    openStore() {
        this.isStoreOpen = true;
        this.physics.pause();
        if (this.sakura && this.sakura.anims) this.sakura.anims.pause();
        if (this.enemySystem && this.enemySystem.enemies) {
            this.enemySystem.enemies.forEach(e => e.anims && e.anims.pause());
        }
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.storeOverlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);
        this.storeOverlay.setScrollFactor(0);
        this.storeOverlay.setDepth(700);
        this.storeOverlay.setInteractive();
        this.storeOverlay.on('pointerdown', () => this.closeStore());
        const offers = this.cardStore.rollOffers();
        this.renderStoreUI(offers, centerX, centerY);
        this.storeKeys = this.input.keyboard.addKeys({
            one: Phaser.Input.Keyboard.KeyCodes.ONE,
            two: Phaser.Input.Keyboard.KeyCodes.TWO,
            three: Phaser.Input.Keyboard.KeyCodes.THREE,
            r: Phaser.Input.Keyboard.KeyCodes.R
        });
        this.storeKeys.one.on('down', () => this.purchaseCard(0));
        this.storeKeys.two.on('down', () => this.purchaseCard(1));
        this.storeKeys.three.on('down', () => this.purchaseCard(2));
        this.storeKeys.r.on('down', () => this.rerollStore());
    }

    closeStore() {
        this.isStoreOpen = false;
        this.physics.resume();
        if (this.sakura && this.sakura.anims) this.sakura.anims.resume();
        if (this.enemySystem && this.enemySystem.enemies) {
            this.enemySystem.enemies.forEach(e => e.anims && e.anims.resume());
        }
        if (this.storeOverlay) this.storeOverlay.destroy();
        this.clearStoreUI();
        if (this.storeKeys) {
            this.storeKeys.one.destroy();
            this.storeKeys.two.destroy();
            this.storeKeys.three.destroy();
            this.storeKeys.r.destroy();
            this.storeKeys = null;
        }
    }

    purchaseCard(index) {
        const ok = this.cardStore.purchase(index);
        if (!ok) {
            const warn = this.add.text(480, 120, 'No tienes suficientes flores', { fontSize: '18px', fill: '#ff6666' });
            warn.setOrigin(0.5);
            warn.setScrollFactor(0);
            warn.setDepth(702);
            this.time.delayedCall(1200, () => warn.destroy());
            return;
        }
        const card = this.cardStore.offers[index];
        if (card) {
            this.ownedCards.push(card.name);
            this.refreshOwnedCardsUI();
        }
        this.closeStore();
    }

    rerollStore() {
        if (this.coins < 3) {
            const warn = this.add.text(480, 120, 'No tienes suficientes monedas', { fontSize: '18px', fill: '#ff6666' });
            warn.setOrigin(0.5);
            warn.setScrollFactor(0);
            warn.setDepth(702);
            this.time.delayedCall(1200, () => warn.destroy());
            return;
        }
        this.coins -= 3;
        this.coinsText.setText(`Monedas: ${this.coins}`);
        this.clearStoreUI();
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const offers = this.cardStore.rollOffers();
        this.renderStoreUI(offers, centerX, centerY);
    }

    renderStoreUI(offers, centerX, centerY) {
        this.storeUI = [];
        const header = this.add.text(centerX, centerY - 150, `Tienda de Cartas\nFlores: ${this.flowers}  Monedas: ${this.coins}`, { fontSize: '20px', fill: '#ffffff', align: 'center' });
        header.setOrigin(0.5);
        header.setScrollFactor(0);
        header.setDepth(701);
        this.storeUI.push(header);
        const positions = [-200, 0, 200];
        offers.forEach((card, i) => {
            const x = centerX + positions[i];
            const y = centerY;
            const color = this.cardStore.getRarityColor(card.rarity);
            const bg = this.add.rectangle(x, y, 180, 220, 0x111111, 0.9).setStrokeStyle(3, color);
            bg.setScrollFactor(0);
            bg.setDepth(701);
            bg.setInteractive();
            bg.on('pointerdown', () => this.purchaseCard(i));
            const title = this.add.text(x, y + 130, `${card.name}`, { fontSize: '18px', fill: '#ffffff', align: 'center', wordWrap: { width: 200 } });
            title.setOrigin(0.5, 0);
            title.setScrollFactor(0);
            title.setDepth(702);
            const sub = this.add.text(x, y + 152, `[${card.rarity}] - ${card.cost} flores`, { fontSize: '14px', fill: '#cccccc', align: 'center' });
            sub.setOrigin(0.5, 0);
            sub.setScrollFactor(0);
            sub.setDepth(702);
            const desc = this.add.text(x, y + 175, card.desc, { fontSize: '14px', fill: '#dddddd', align: 'center', wordWrap: { width: 220 } });
            desc.setOrigin(0.5, 0);
            desc.setScrollFactor(0);
            desc.setDepth(702);
            const key = this.add.text(x, y + 205, `Pulsa ${i + 1}`, { fontSize: '16px', fill: '#ffffff' });
            key.setOrigin(0.5);
            key.setScrollFactor(0);
            key.setDepth(702);
            this.storeUI.push(bg, title, sub, desc, key);
        });
        const reroll = this.add.text(centerX, centerY + 240, 'Re-roll: 3 monedas (R)  |  Cerrar: B o clic', { fontSize: '16px', fill: '#ffffff' });
        reroll.setOrigin(0.5);
        reroll.setScrollFactor(0);
        reroll.setDepth(701);
        this.storeUI.push(reroll);
    }

    clearStoreUI() {
        if (this.storeUI) {
            this.storeUI.forEach(el => el && el.destroy());
            this.storeUI = null;
        }
    }
    
    refreshOwnedCardsUI() {
        if (this.ownedCardsText) {
            const list = this.ownedCards.length ? this.ownedCards.join(', ') : '-';
            this.ownedCardsText.setText(`Cartas: ${list}`);
        }
    }

    applyCard(name) {
        if (name === 'Corona de espinas') {
            this.cards.coronaEspinas = true;
            if (!this.thornsTimer) {
                this.thornsTimer = this.time.addEvent({
                    delay: 3000,
                    loop: true,
                    callback: () => this.spawnExplosionAoE(this.sakura.x, this.sakura.y, 60)
                });
            }
        } else if (name === 'Sakura Shuriken') {
            this.cards.sakuraShuriken = true;
            if (!this.shurikenTimer) {
                this.shurikenTimer = this.time.addEvent({
                    delay: 2000,
                    loop: true,
                    callback: () => this.spawnPlayerProjectile()
                });
            }
        } else if (name === 'Ritmo eterno') {
            this.cards.ritmoEterno.enabled = true;
        } else if (name === 'Brote explosivo') {
            this.cards.broteExplosivo.enabled = true;
        } else if (name === 'Bendición silvestre') {
            this.cards.bendicionSilvestre.enabled = true;
        } else if (name === 'Semilla dorada') {
            this.cards.semillaDorada.enabled = true;
        } else if (name === 'Espíritu aliado') {
            this.cards.espirituAliado.enabled = true;
        } else if (name === 'Vínculo espiritual') {
            this.cards.vinculoEspiritual.enabled = true;
        } else if (name === 'Flor Carmesí') {
            this.cards.florCarmesi = true;
        } else if (name === 'Luz espectral') {
            this.cards.luzEspectral.enabled = true;
        }
    }

    spawnExplosionAoE(x, y, radius) {
        const zone = this.add.zone(x, y, radius * 2, radius * 2);
        this.physics.add.existing(zone);
        zone.body.setAllowGravity(false);
        if (this.enemySystem) {
            this.enemySystem.enemies.forEach(enemy => {
                if (enemy && enemy.active && this.physics.overlap(zone, enemy)) {
                    if (enemy.enemyController) enemy.enemyController.takeDamage();
                }
            });
        }
        this.time.delayedCall(50, () => zone.destroy());
    }

    spawnPlayerProjectile() {
        if (!this.enemySystem || this.enemySystem.enemies.length === 0) return;
        const target = this.enemySystem.enemies.reduce((best, e) => {
            if (!best) return e;
            const d = Phaser.Math.Distance.Between(this.sakura.x, this.sakura.y, e.x, e.y);
            const db = Phaser.Math.Distance.Between(this.sakura.x, this.sakura.y, best.x, best.y);
            return d < db ? e : best;
        }, null);
        if (!target) return;
        const bullet = this.add.rectangle(this.sakura.x, this.sakura.y - 20, 6, 6, 0x66ccff);
        const zone = this.add.zone(bullet.x, bullet.y, 6, 6);
        this.physics.add.existing(zone);
        zone.body.setAllowGravity(false);
        const angle = Phaser.Math.Angle.Between(zone.x, zone.y, target.x, target.y);
        zone.body.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
        zone.visual = bullet;
        this.time.addEvent({
            delay: 16,
            loop: true,
            callback: () => {
                if (!zone.active) return;
                bullet.x = zone.x;
                bullet.y = zone.y;
                if (this.physics.overlap(zone, target)) {
                    if (target.enemyController) target.enemyController.takeDamage();
                    bullet.destroy();
                    zone.destroy();
                }
            }
        });
        this.time.delayedCall(3000, () => {
            if (zone.active) {
                bullet.destroy();
                zone.destroy();
            }
        });
    }
    // 🔥 MÉTODO PARA MANEJAR DAÑO AL JUGADOR
    handlePlayerDamage(amount) {
        // 🔥 NO APLICAR DAÑO SI YA ESTÁ MUERTO
        if (this.isPlayerDead) {
            return;
        }
        if (this.cards.luzEspectral.enabled && this.cards.luzEspectral.activeUntil > this.time.now) {
            amount = Math.floor(amount * this.cards.luzEspectral.reduction);
        }
        if (this.cards.ritmoEterno.enabled) {
            const now = this.time.now;
            if (now - this.cards.ritmoEterno.lastUse >= this.cards.ritmoEterno.cooldown) {
                this.cards.ritmoEterno.lastUse = now;
            } else {
                if (this.sakuraController && this.sakuraController.resetCombo) {
                    // evitar reset por daño
                }
            }
        }
        
        this.playerHealthSystem.applyDamage(amount);
        this.updateHealthBar();
        if (this.cards.ritmoEterno.enabled) {
            const now = this.time.now;
            if (now - this.cards.ritmoEterno.lastUse < this.cards.ritmoEterno.cooldown) {
                // mantener combo
            } else {
                if (this.sakuraController && this.sakuraController.resetCombo) {
                    this.sakuraController.resetCombo();
                }
            }
        } else {
            if (this.sakuraController && this.sakuraController.resetCombo) {
                this.sakuraController.resetCombo();
            }
        }
        
        // 🔥 REPRODUCIR ANIMACIÓN DE HURT CON MÁS CONTROL
        if (this.sakura && this.sakura.anims && !this.isPlayerDead) {
            // Detener animación actual y reproducir hurt
            this.sakura.anims.stop();
            this.sakura.anims.play('sakura-hurt', true);
            
            // 🔥 BLOQUEAR CONTROLES DURANTE LA ANIMACIÓN DE HURT
            if (this.sakuraController) {
                this.sakuraController.setCanMove(false);
                
                // 🔥 RESTABLECER CONTROLES DESPUÉS DE LA ANIMACIÓN
                this.time.delayedCall(500, () => {
                    if (this.sakuraController && !this.isPlayerDead) {
                        this.sakuraController.setCanMove(true);
                    }
                });
            }
        }
        
        // Verificar si el jugador murió
        if (this.playerHealthSystem.isDead()) {
            this.playerDeath();
        }
    }

    // 🔥 MÉTODO PARA MUERTE DEL JUGADOR
    playerDeath() {
        // 🔥 MARCAR AL JUGADOR COMO MUERTO INMEDIATAMENTE
        this.isPlayerDead = true;
        
        // 🔥 BLOQUEAR COMPLETAMENTE LOS CONTROLES DEL JUGADOR
        if (this.sakuraController) {
            this.sakuraController.setDead(true);
        }
        
        // 🔥 REPRODUCIR ANIMACIÓN DE MUERTE
        if (this.sakura && this.sakura.anims) {
            this.sakura.anims.stop();
            this.sakura.anims.play('sakura-death', true);
            
            // 🔥 BLOQUEAR CONTROLES PERMANENTEMENTE
            if (this.sakuraController) {
                this.sakuraController.setCanMove(false);
            }
            
            // 🔥 ESPERAR A QUE TERMINE LA ANIMACIÓN DE MUERTE
            this.time.delayedCall(1000, () => {
                // Detener el juego después de la animación
                this.physics.pause();
                
                // Mostrar mensaje de game over
                const gameOverText = this.add.text(400, 270, 'GAME OVER', {
                    fontSize: '64px',
                    fill: '#ff0000',
                    fontStyle: 'bold'
                });
                gameOverText.setOrigin(0.5);
                gameOverText.setScrollFactor(0);
                gameOverText.setDepth(200);
                
                // Opción para reiniciar
                const restartText = this.add.text(400, 320, 'Presiona R para reiniciar', {
                    fontSize: '24px',
                    fill: '#ffffff'
                });
                restartText.setOrigin(0.5);
                restartText.setScrollFactor(0);
                restartText.setDepth(201);
                
                // Reiniciar con la tecla R
                this.input.keyboard.once('keydown-R', () => {
                    this.scene.restart();
                });
            });
        }
    }

    // 🔥 MÉTODO PARA MANEJAR COLISIÓN ENTRE JUGADOR Y ENEMIGO
    handleEnemyCollision(sakura, enemy) {
        // Detener el movimiento del enemigo para que no se mueva lateralmente
        if (enemy.body) {
            enemy.setVelocityX(0);
        }
        
        // Si el enemigo tiene un controlador, detener su lógica de movimiento
        if (enemy.enemyController) {
            if (enemy.x > sakura.x) {
                enemy.setFlipX(true);
            } else {
                enemy.setFlipX(false);
            }
        }
    }

    togglePause() {
        if (this.isPlayerDead) {
            return;
        }
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            if (this.sakura && this.sakura.anims) this.sakura.anims.pause();
            if (this.enemy && this.enemy.anims) this.enemy.anims.pause();
            if (this.enemySystem && this.enemySystem.enemies) {
                this.enemySystem.enemies.forEach(e => {
                    if (e && e.anims) e.anims.pause();
                });
            }
            this.pauseOverlay.setVisible(true);
            this.pauseText.setVisible(true);
            this.resumePrompt.setVisible(true);
        } else {
            this.physics.resume();
            if (this.sakura && this.sakura.anims) this.sakura.anims.resume();
            if (this.enemy && this.enemy.anims) this.enemy.anims.resume();
            if (this.enemySystem && this.enemySystem.enemies) {
                this.enemySystem.enemies.forEach(e => {
                    if (e && e.anims) e.anims.resume();
                });
            }
            this.pauseOverlay.setVisible(false);
            this.pauseText.setVisible(false);
            this.resumePrompt.setVisible(false);
        }
    }

    update(time, delta) {
        // 🔥 NO ACTUALIZAR NADA SI EL JUGADOR ESTÁ MUERTO
        if (this.isPlayerDead || this.isPaused || this.isStoreOpen) {
            return;
        }
        
        // 🔥 ACTUALIZAR SISTEMA DE OLEADAS
        if (this.waveSystem) {
            this.waveSystem.update(delta);
        }
        
        // Background
        this.backgroundManager.update();

        // Sakura
        this.sakuraController.update();

        // 🔥 ACTUALIZAR SISTEMA DE ENEMIGOS
        if (this.enemySystem) {
            this.enemySystem.update();
        }

        // Enemigo individual original
        this.enemyController.update();

        this.updateMobileUI();
    }

    setupMobileUI() {
        this.mobileInput = { left: false, right: false };
        const isPortrait = () => window.innerHeight > window.innerWidth;
        this.orientationOverlay = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Gira tu teléfono a horizontal', { fontSize: '20px', fill: '#ffffff' });
        this.orientationOverlay.setOrigin(0.5);
        this.orientationOverlay.setScrollFactor(0);
        this.orientationOverlay.setDepth(800);
        this.createMobileButtons();
        const updateVisibility = () => {
            const showPortrait = isPortrait();
            this.orientationOverlay.setVisible(this.isMobile && showPortrait);
            const visibleButtons = this.isMobile && !showPortrait;
            this.mobileButtons.forEach(b => b.setVisible(visibleButtons));
        };
        updateVisibility();
        window.addEventListener('resize', updateVisibility);
    }

    createMobileButtons() {
        this.mobileButtons = [];
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const mk = (x, y, label, cb, hold=false) => {
            const btn = this.add.rectangle(x, y, 80, 40, 0x222222).setStrokeStyle(2, 0xffffff);
            const txt = this.add.text(x, y, label, { fontSize: '14px', fill: '#ffffff' }); txt.setOrigin(0.5);
            btn.setScrollFactor(0); txt.setScrollFactor(0);
            btn.setDepth(700); txt.setDepth(701);
            btn.setInteractive({ useHandCursor: true });
            if (hold) {
                btn.on('pointerdown', () => cb(true));
                btn.on('pointerup', () => cb(false));
                btn.on('pointerout', () => cb(false));
            } else {
                btn.on('pointerdown', cb);
            }
            this.mobileButtons.push(btn, txt);
        };
        mk(70, h - 50, '←', v => this.mobileInput.left = v, true);
        mk(160, h - 50, '→', v => this.mobileInput.right = v, true);
        mk(w - 80, h - 50, 'Jump', () => this.sakuraController.jump());
        mk(w - 80, h - 100, 'Atk', () => this.sakuraController.attack());
        mk(w - 80, h - 150, 'Parry', () => this.sakuraController.parry());
        mk(w - 160, h - 50, 'Dash', () => this.sakuraController.dash());
    }

    updateMobileUI() {
        if (!this.isMobile) return;
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isPortrait) return;
        if (this.sakuraController && this.sakuraController.canMove && !this.sakuraController.isDashing) {
            if (this.mobileInput.left) {
                this.sakuraController.sakura.setVelocityX(-this.sakuraController.moveSpeed);
                this.sakuraController.sakura.setFlipX(true);
            } else if (this.mobileInput.right) {
                this.sakuraController.sakura.setVelocityX(this.sakuraController.moveSpeed);
                this.sakuraController.sakura.setFlipX(false);
            } else {
                // no-op, keyboard update will zero when needed
            }
        }
    }
}

export default GameScene;
