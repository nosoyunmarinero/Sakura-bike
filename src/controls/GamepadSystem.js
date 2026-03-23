export default class GamepadSystem {

    static BUTTONS = {
        A: 0, B: 1, X: 2, Y: 3,
        LB: 4, RB: 5, LT: 6, RT: 7,
        BACK: 8, START: 9, LS: 10, RS: 11,
        DPAD_UP: 12, DPAD_DOWN: 13, DPAD_LEFT: 14, DPAD_RIGHT: 15,
    };

    static AXES = { LEFT_X: 0, LEFT_Y: 1, RIGHT_X: 2, RIGHT_Y: 3 };

    static DEADZONE = 0.2;

    constructor(scene, controller) {
        this.scene        = scene;
        this.controller   = controller;
        this._ready       = false;
        this._prevButtons = {};
        this._hintText    = null;
        this._hintBg      = null;
        this._flashTimer  = null;

        this._activated = scene.registry.get('gamepadActivated') === true;
        if (this._activated) scene.registry.set('gamepadActivated', false);

        // Estado de la tienda para el sistema de selección con mando
        this._storeSelectedIndex = 0;
        this._storeSelectorUI    = null;
    }

    update() {
        if (!this._ready) {
            this._tryInit();
            if (!this._ready) return;
        }

        const pad = this._getActivePad();
        if (!pad) return;

        if (!this._activated) {
            if (this._justPressed(pad, GamepadSystem.BUTTONS.START)) this._activate();
            this._savePrevButtons(pad);
            return;
        }

        if (this.scene.isStoreOpen) {
            this._handleStore(pad);
        } else if (this.scene.isPaused) {
            this._handlePause(pad);
        } else {
            this._handleMovement(pad);
            this._handleActions(pad);
        }

        this._savePrevButtons(pad);
    }

    _tryInit() {
        if (!this.scene.input?.gamepad) return;

        this.scene.input.gamepad.on('connected', () => {
            if (!this._activated) this._showHint('🎮  Mando conectado  ·  Presiona  START  para activar');
        });

        this.scene.input.gamepad.on('disconnected', () => {
            this._activated = false;
            this._showHint('⚠️  Mando desconectado', 0xff6666);
        });

        this._ready = true;

        const pad = this._getActivePad();
        if (pad && !this._activated) this._showHint('🎮  Mando detectado  ·  Presiona  START  para activar');
        if (pad && this._activated)  this._showFlash('🎮  Mando listo', 0x66ff99, 1800);
    }

    _activate() {
        this._activated = true;
        this._destroyHint();
        this._showFlash('¡Mando activado!', 0x66ff99, 1800);
    }

    // ─── Gameplay ─────────────────────────────────────────────────────────

    _handleMovement(pad) {
        const ctrl = this.controller;
        if (!ctrl.canMove || ctrl.isDashing || ctrl.isDead) return;

        const axisX     = pad.axes[GamepadSystem.AXES.LEFT_X]?.getValue() ?? 0;
        const dpadLeft  = pad.buttons[GamepadSystem.BUTTONS.DPAD_LEFT]?.pressed  ?? false;
        const dpadRight = pad.buttons[GamepadSystem.BUTTONS.DPAD_RIGHT]?.pressed ?? false;

        if (axisX < -GamepadSystem.DEADZONE || dpadLeft) {
            ctrl.sakura.setVelocityX(-ctrl.moveSpeed);
            ctrl.sakura.setFlipX(true);
            ctrl.isMovingByGamepad = true;
        } else if (axisX > GamepadSystem.DEADZONE || dpadRight) {
            ctrl.sakura.setVelocityX(ctrl.moveSpeed);
            ctrl.sakura.setFlipX(false);
            ctrl.isMovingByGamepad = true;
        }
    }

    _handleActions(pad) {
        const B = GamepadSystem.BUTTONS;

        if (this._justPressed(pad, B.A))     this.controller.jump();
        if (this._justPressed(pad, B.X))     this.controller.attack();
        if (this._justPressed(pad, B.LT))    this.controller.parry();   // LT → Parry
        if (this._justPressed(pad, B.RT))    this.controller.dash();    // RT → Dash
        if (this._justPressed(pad, B.START)) this.scene.togglePause?.();
        if (this._justPressed(pad, B.Y))     this.scene.toggleStore?.(); // Y → Abrir tienda
    }

    // ─── Pausa ────────────────────────────────────────────────────────────

    _handlePause(pad) {
        const B = GamepadSystem.BUTTONS;
        if (this._justPressed(pad, B.START)) this.scene.togglePause?.(); // Start → quitar pausa
    }

    // ─── Tienda ───────────────────────────────────────────────────────────

    _handleStore(pad) {
        const B = GamepadSystem.BUTTONS;
        const offers = this.scene.cardStore?.offers;
        if (!offers || offers.length === 0) return;

        // Navegar entre cartas con D-pad o stick izquierdo
        if (this._justPressed(pad, B.DPAD_LEFT)) {
            this._storeSelectedIndex = (this._storeSelectedIndex - 1 + offers.length) % offers.length;
            this._updateStoreSelector();
        }
        if (this._justPressed(pad, B.DPAD_RIGHT)) {
            this._storeSelectedIndex = (this._storeSelectedIndex + 1) % offers.length;
            this._updateStoreSelector();
        }

        // Comprar con A
        if (this._justPressed(pad, B.A)) {
            this.scene.purchaseCard(this._storeSelectedIndex);
        }

        // Re-roll con X
        if (this._justPressed(pad, B.X)) {
            this.scene.rerollStore?.();
            this._storeSelectedIndex = 0;
            this._updateStoreSelector();
        }

        // Cerrar con B
        if (this._justPressed(pad, B.B)) {
            this._destroyStoreSelector();
            this.scene.toggleStore?.();
        }
    }

    // Dibuja/mueve el indicador de selección encima de la carta activa
    _updateStoreSelector() {
        this._destroyStoreSelector();

        // Las cartas están en posiciones calculadas igual que en renderStoreUI
        const centerX  = this.scene.cameras.main.width  / 2;
        const centerY  = this.scene.cameras.main.height / 2;
        const positions = [-200, 0, 200];
        const x = centerX + (positions[this._storeSelectedIndex] ?? 0);
        const y = centerY - 120;

        this._storeSelectorUI = this.scene.add.text(x, y, '▼', {
            fontSize: '22px',
            fill: '#ffff00',
            fontStyle: 'bold'
        });
        this._storeSelectorUI.setOrigin(0.5).setScrollFactor(0).setDepth(710);

        // Pulsar tween para que llame la atención
        this.scene.tweens.add({
            targets: this._storeSelectorUI,
            y: y + 6,
            duration: 400,
            yoyo: true,
            repeat: -1
        });
    }

    _destroyStoreSelector() {
        if (this._storeSelectorUI) {
            this._storeSelectorUI.destroy();
            this._storeSelectorUI = null;
        }
    }

    // Llamar esto desde GameScene cuando se abre la tienda
    onStoreOpen() {
        this._storeSelectedIndex = 0;
        this._updateStoreSelector();
    }

    // Llamar esto desde GameScene cuando se cierra la tienda
    onStoreClose() {
        this._destroyStoreSelector();
    }

    // ─── UI de feedback ───────────────────────────────────────────────────

    _showHint(msg, color = 0xffffff) {
        this._destroyHint();

        const cx = this.scene.cameras.main.width  / 2;
        const cy = this.scene.cameras.main.height - 48;

        this._hintBg = this.scene.add.rectangle(cx, cy, 560, 36, 0x000000, 0.65);
        this._hintBg.setScrollFactor(0).setDepth(900);

        this._hintText = this.scene.add.text(cx, cy, msg, {
            fontSize: '15px',
            fill: '#' + color.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
        });
        this._hintText.setOrigin(0.5).setScrollFactor(0).setDepth(901);

        this._flashTimer = this.scene.tweens.add({
            targets: this._hintText,
            alpha: { from: 1, to: 0.35 },
            duration: 700,
            yoyo: true,
            repeat: -1,
        });
    }

    _showFlash(msg, color = 0x66ff99, duration = 2000) {
        const cx = this.scene.cameras.main.width  / 2;
        const cy = this.scene.cameras.main.height - 48;

        const bg = this.scene.add.rectangle(cx, cy, 320, 36, 0x000000, 0.65);
        bg.setScrollFactor(0).setDepth(900);

        const txt = this.scene.add.text(cx, cy, msg, {
            fontSize: '16px',
            fill: '#' + color.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
        });
        txt.setOrigin(0.5).setScrollFactor(0).setDepth(901);

        this.scene.tweens.add({
            targets: [bg, txt],
            alpha: 0,
            delay: duration - 400,
            duration: 400,
            onComplete: () => { bg.destroy(); txt.destroy(); },
        });
    }

    _destroyHint() {
        if (this._flashTimer) { this._flashTimer.stop(); this._flashTimer = null; }
        if (this._hintText)   { this._hintText.destroy();  this._hintText  = null; }
        if (this._hintBg)     { this._hintBg.destroy();    this._hintBg    = null; }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    _getActivePad() {
        const gp = this.scene.input?.gamepad;
        if (!gp) return null;
        for (const pad of gp.gamepads) {
            if (pad?.connected) return pad;
        }
        return null;
    }

    _justPressed(pad, index) {
        const cur  = pad.buttons[index]?.pressed ?? false;
        const prev = this._prevButtons[index]    ?? false;
        return cur && !prev;
    }

    _savePrevButtons(pad) {
        pad.buttons.forEach((btn, i) => { this._prevButtons[i] = btn?.pressed ?? false; });
    }

    isConnected() { return this._getActivePad() !== null; }
    isActivated()  { return this._activated; }

    remap(action, newIndex) {
        const map = { jump: 'A', attack: 'X', parry: 'LT', dash: 'RT' };
        if (map[action]) GamepadSystem.BUTTONS[map[action]] = newIndex;
    }
}