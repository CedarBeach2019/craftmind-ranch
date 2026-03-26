/**
 * @module craftmind-ranch/ai/animal-agent
 * @description Animals with personality, health, mood, and memory.
 * Each animal is a full agent — not just stats, but a being with preferences,
 * relationships, and emotional state that affects breeding outcomes.
 */

function clamp(min, max, v) { return Math.max(min, Math.min(max, v)); }

// ── Personality Types ──────────────────────────────────────────────────────

export const PERSONALITY_TYPES = ['aggressive', 'docile', 'curious', 'lazy', 'social', 'independent'];

// ── Mood System ────────────────────────────────────────────────────────────

export class Mood {
  constructor() {
    this.happiness = 0.5;   // 0-1
    this.stress = 0.0;      // 0-1
    this.energy = 0.8;      // 0-1
    this.hunger = 0.3;      // 0-1 (higher = hungrier)
  }

  /** Production multiplier based on mood. Happy animals produce more. */
  get productionMultiplier() {
    return clamp(0.3, 1.5, 0.5 + this.happiness * 0.6 - this.stress * 0.3 - this.hunger * 0.2);
  }

  /** Breeding success modifier. Stressed animals breed poorly. */
  get breedingModifier() {
    return clamp(0.1, 1.3, 0.5 + this.happiness * 0.4 - this.stress * 0.5);
  }

  /** Apply an event that affects mood. */
  apply(event) {
    switch (event) {
      case 'fed':          this.hunger = clamp(0, 1, this.hunger - 0.4); this.happiness = clamp(0, 1, this.happiness + 0.1); break;
      case 'petted':       this.happiness = clamp(0, 1, this.happiness + 0.15); this.stress = clamp(0, 1, this.stress - 0.1); break;
      case 'vaccinated':   this.stress = clamp(0, 1, this.stress + 0.2); break;
      case 'sick':         this.happiness = clamp(0, 1, this.happiness - 0.3); this.stress = clamp(0, 1, this.stress + 0.2); this.energy = clamp(0, 1, this.energy - 0.3); break;
      case 'injured':      this.stress = clamp(0, 1, this.stress + 0.3); this.happiness = clamp(0, 1, this.happiness - 0.2); break;
      case 'healed':       this.happiness = clamp(0, 1, this.happiness + 0.1); this.stress = clamp(0, 1, this.stress - 0.2); break;
      case 'escaped':      this.stress = clamp(0, 1, this.stress + 0.4); break;
      case 'returned':     this.happiness = clamp(0, 1, this.happiness + 0.05); this.stress = clamp(0, 1, this.stress - 0.1); break;
      case 'buddy_separated': this.happiness = clamp(0, 1, this.happiness - 0.3); this.stress = clamp(0, 1, this.stress + 0.3); break;
      case 'buddy_reunited':  this.happiness = clamp(0, 1, this.happiness + 0.25); this.stress = clamp(0, 1, this.stress - 0.2); break;
      case 'sold':          this.stress = clamp(0, 1, this.stress + 0.5); break;
      case 'good_weather':  this.happiness = clamp(0, 1, this.happiness + 0.05); break;
      case 'storm':         this.stress = clamp(0, 1, this.stress + 0.15); break;
      default: break;
    }
  }

  /** Simulate passage of time (one hour). */
  tick() {
    this.hunger = clamp(0, 1, this.hunger + 0.02);
    this.energy = clamp(0, 1, this.energy + 0.05);
    this.stress = clamp(0, 1, this.stress - 0.01);
  }
}

// ── Health System ──────────────────────────────────────────────────────────

export class Health {
  constructor() {
    this.hp = 100;
    this.maxHp = 100;
    this.status = 'healthy'; // healthy, sick, injured, recovering
    this.disease = null;
    this.injury = null;
    this.lastVaccination = null;
  }

  get isSick() { return this.status === 'sick'; }
  get isInjured() { return this.status === 'injured'; }
  get needsVet() { return this.isSick || this.isInjured; }

  infect(disease) {
    this.status = 'sick';
    this.disease = disease;
    this.hp = Math.max(20, this.hp - 20);
  }

  injure(injury) {
    this.status = 'injured';
    this.injury = injury;
    this.hp = Math.max(10, this.hp - 30);
  }

  vaccinate() {
    this.lastVaccination = Date.now();
    // Vaccination clears disease but doesn't heal injury
    if (this.isSick) {
      this.status = 'recovering';
      this.disease = null;
      this.hp = Math.min(this.maxHp, this.hp + 20);
    }
  }

  heal(amount = 30) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (this.hp >= this.maxHp) {
      this.status = 'healthy';
      this.disease = null;
      this.injury = null;
    } else if (this.status === 'sick' || this.status === 'injured') {
      this.status = 'recovering';
    }
  }

  tick() {
    if (this.status === 'recovering') {
      this.hp = Math.min(this.maxHp, this.hp + 5);
      if (this.hp >= this.maxHp) this.status = 'healthy';
    }
  }
}

// ── Memory ─────────────────────────────────────────────────────────────────

export class AnimalMemory {
  constructor() {
    this.events = [];        // [{ timestamp, type, details }]
    this.handlers = [];      // handler names who interacted
    this.preferredFood = null;
    this.bondedAnimals = []; // animal IDs this animal bonded with
    this.trauma = [];        // negative events that affect behavior
  }

  remember(event) {
    this.events.push({ timestamp: Date.now(), ...event });
    if (this.events.length > 100) this.events = this.events.slice(-100);

    if (event.type === 'handler' && event.name) {
      if (!this.handlers.includes(event.name)) this.handlers.push(event.name);
    }
    if (event.type === 'fed' && event.food) {
      this.preferredFood = event.food; // most recent food becomes preferred
    }
    if (event.type === 'bond') {
      if (!this.bondedAnimals.includes(event.animalId)) this.bondedAnimals.push(event.animalId);
    }
    if (event.type === 'trauma') {
      this.trauma.push({ ...event, timestamp: Date.now() });
      if (this.trauma.length > 10) this.trauma = this.trauma.slice(-10);
    }
  }

  knows(handlerName) { return this.handlers.includes(handlerName); }
  isBondedWith(animalId) { return this.bondedAnimals.includes(animalId); }
  hasTrauma(type) { return this.trauma.some(t => t.kind === type); }
}

// ── Animal Agent ───────────────────────────────────────────────────────────

export class AnimalAgent {
  /**
   * @param {object} config
   * @param {string} config.id - unique ID
   * @param {string} config.name - display name
   * @param {string} config.species - species ID
   * @param {object} config.traits - { speed, strength, hardiness, temperament, intelligence, beauty, fertility }
   * @param {string} config.personality - one of PERSONALITY_TYPES
   * @param {number} config.generation
   * @param {string[]} config.parentIds
   */
  constructor(config) {
    this.id = config.id;
    this.name = config.name || 'Unnamed';
    this.species = config.species;
    this.traits = { speed: 0.5, strength: 0.5, hardiness: 0.5, temperament: 0.5, intelligence: 0.5, beauty: 0.5, fertility: 0.5, ...config.traits };
    this.personality = config.personality || 'docile';
    this.generation = config.generation || 0;
    this.parentIds = config.parentIds || [];

    // Sub-systems
    this.mood = new Mood();
    this.health = new Health();
    this.memory = new AnimalMemory();

    // Location
    this.pen = null;
    this.position = { x: 0, y: 0, z: 0 };
  }

  /** Overall quality score used for breeding decisions. */
  get quality() {
    const t = this.traits;
    return (t.speed + t.strength + t.hardiness + t.temperament + t.intelligence + t.beauty + t.fertility) / 7;
  }

  /** Current production output considering mood, health, personality. */
  get production() {
    if (this.health.status !== 'healthy' && this.health.status !== 'recovering') return 0;
    if (this.mood.energy < 0.2) return 0;
    return this.quality * this.mood.productionMultiplier * this._personalityProductionMod();
  }

  _personalityProductionMod() {
    const mods = { aggressive: 0.9, docile: 1.1, curious: 1.0, lazy: 0.7, social: 1.05, independent: 0.95 };
    return mods[this.personality] || 1.0;
  }

  /** Feed the animal. */
  feed(food) {
    this.mood.apply('fed');
    this.memory.remember({ type: 'fed', food });
    return { eaten: true, mood: { ...this.mood } };
  }

  /** Pet the animal. */
  pet(handlerName) {
    this.mood.apply('petted');
    this.memory.remember({ type: 'handler', name: handlerName, action: 'petted' });
    return { reaction: this._petReaction() };
  }

  _petReaction() {
    if (this.personality === 'aggressive') return 'snorts and steps back';
    if (this.personality === 'curious') return 'nudges your hand, investigating';
    if (this.personality === 'lazy') return 'leans into your hand sleepily';
    if (this.personality === 'social') return 'nuzzles you happily';
    if (this.personality === 'independent') return 'tolerates it briefly, then wanders off';
    return 'relaxes and enjoys the attention';
  }

  /** Vaccinate. */
  vaccinate() {
    this.mood.apply('vaccinated');
    this.health.vaccinate();
    this.memory.remember({ type: 'vaccinated' });
    return { vaccinated: true, status: this.health.status };
  }

  /** Simulate one game hour. */
  tick() {
    this.mood.tick();
    this.health.tick();
  }

  /** Serialize for saving. */
  toJSON() {
    return {
      id: this.id, name: this.name, species: this.species,
      traits: this.traits, personality: this.personality,
      generation: this.generation, parentIds: this.parentIds,
      mood: { happiness: this.mood.happiness, stress: this.mood.stress, energy: this.mood.energy, hunger: this.mood.hunger },
      health: { hp: this.health.hp, maxHp: this.health.maxHp, status: this.health.status, disease: this.health.disease, injury: this.health.injury, lastVaccination: this.health.lastVaccination },
      memory: { handlers: this.memory.handlers, preferredFood: this.memory.preferredFood, bondedAnimals: this.memory.bondedAnimals, traumaCount: this.memory.trauma.length },
      pen: this.pen, quality: this.quality,
    };
  }
}

export default AnimalAgent;
