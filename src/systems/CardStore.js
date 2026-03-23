export default class CardStore {
    constructor(scene) {
        this.scene = scene;
        this.cards = [
            { name: 'Corona de espinas', rarity: 'Común', cost: 6, desc: 'Espinas giran cada 3s, daño leve en área' },
            { name: 'Sakura Shuriken', rarity: 'Rara', cost: 10, desc: 'Proyectil automático cada 2s' },
            { name: 'Ritmo eterno', rarity: 'Rara', cost: 10, desc: 'Combo no se reinicia una vez cada 30s' },
            { name: 'Brote explosivo', rarity: 'Rara', cost: 10, desc: 'Cada 10 flores → explosión en área' },
            { name: 'Bendición silvestre', rarity: 'Épica', cost: 16, desc: '+10% flor por 60s tras matar élite' },
            { name: 'Semilla dorada', rarity: 'Común', cost: 6, desc: '+1 moneda cada 5 flores' },
            { name: 'Espíritu aliado', rarity: 'Épica', cost: 16, desc: '10% invocar aliado al matar élite' },
            { name: 'Vínculo espiritual', rarity: 'Épica', cost: 16, desc: 'Aliado dura +5s y lanza proyectiles' },
            { name: 'Flor Carmesí', rarity: 'Rara', cost: 10, desc: 'Rastro dañino 2s al morir enemigo' },
            { name: 'Luz espectral', rarity: 'Épica', cost: 16, desc: 'Aura reduce daño 5% por 10s al recoger flor' }
        ];
        this.offers = [];
    }

    getWeight(card) {
        if (card.rarity === 'Común') return 5;
        if (card.rarity === 'Rara') return 3;
        return 1;
    }

    rollOffers() {
        const pool = this.cards.slice();
        const offers = [];
        for (let i = 0; i < 3; i++) {
            const total = pool.reduce((a, c) => a + this.getWeight(c), 0);
            let r = Math.random() * total;
            let chosenIndex = 0;
            for (let idx = 0; idx < pool.length; idx++) {
                const w = this.getWeight(pool[idx]);
                if (r < w) { chosenIndex = idx; break; }
                r -= w;
            }
            offers.push(pool[chosenIndex]);
            pool.splice(chosenIndex, 1);
        }
        this.offers = offers;
        return offers;
    }

    canAfford(card) {
        return this.scene.flowers >= card.cost;
    }

    purchase(index) {
        const card = this.offers[index];
        if (!card) return false;
        if (!this.canAfford(card)) return false;
        this.scene.flowers -= card.cost;
        if (this.scene.flowersText) {
            this.scene.flowersText.setText(`Flores: ${this.scene.flowers}`);
        }
        this.scene.applyCard(card.name);
        return true;
    }

    getRarityColor(rarity) {
        if (rarity === 'Común') return 0x4caf50;
        if (rarity === 'Rara') return 0x2196f3;
        return 0x9c27b0;
    }
}
