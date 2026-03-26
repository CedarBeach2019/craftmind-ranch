/**
 * @module craftmind-ranch/ai/ranch-story-gen
 * @description Emergent ranch event generator — disease outbreaks, animal escapes,
 * auctions, bonding events, and surprise genetics. Creates memorable stories from
 * agent interactions, inspired by Dwarf Fortress/RimWorld emergent narratives.
 */

import { pickRandom, uuid } from './utils.js';
import { getDialogue, getGreeting, getNPC, HERD_DOG } from './ranch-npcs.js';

// ── Event Types ────────────────────────────────────────────────────────────

export const EVENT_TYPES = {
  DISEASE_OUTBREAK: {
    id: 'DISEASE_OUTBREAK',
    severity: 'critical',
    description: 'A disease spreads through the ranch',
    triggers: ['season_change', 'overcrowding', 'unvaccinated'],
  },
  ANIMAL_ESCAPE: {
    id: 'ANIMAL_ESCAPE',
    severity: 'high',
    description: 'An animal breaks out of its pen',
    triggers: ['damaged_fence', 'storm', 'frightened'],
  },
  AUCTION_DAY: {
    id: 'AUCTION_DAY',
    severity: 'normal',
    description: 'Auctioneer Sue arrives for market day',
    triggers: ['scheduled', 'weekly'],
  },
  ANIMAL_BOND: {
    id: 'ANIMAL_BOND',
    severity: 'normal',
    description: 'Two animals form a bond',
    triggers: ['proximity', 'shared_pen', 'time_together'],
  },
  GENETIC_SURPRISE: {
    id: 'GENETIC_SURPRISE',
    severity: 'special',
    description: 'Breeding produces unexpected champion traits',
    triggers: ['recessive_traits', 'average_parents'],
  },
  PREDATOR_THREAT: {
    id: 'PREDATOR_THREAT',
    severity: 'high',
    description: 'A predator threatens the herd',
    triggers: ['night', 'open_fence', 'forest_proximity'],
  },
  WEATHER_EVENT: {
    id: 'WEATHER_EVENT',
    severity: 'variable',
    description: 'Storm, drought, or flood affects the ranch',
    triggers: ['seasonal', 'random'],
  },
  PRIZE_ANIMAL_SICK: {
    id: 'PRIZE_ANIMAL_SICK',
    severity: 'critical',
    description: 'Your best breeding animal falls ill',
    triggers: ['random_bad_luck', 'overwork'],
  },
};

// ── Story Generator ────────────────────────────────────────────────────────

export class RanchStoryGenerator {
  constructor() {
    this.eventLog = [];
    this.activeEvents = [];
    this.storyCooldowns = new Map();
  }

  /**
   * Check for and generate emergent events based on ranch state.
   * @param {object} state - { animals, fences, weather, time, day, population }
   * @returns {object[]} generated events
   */
  generateEvents(state) {
    const events = [];

    // Disease outbreak — check for sick animals and unvaccinated
    if (this._canFire('DISEASE_OUTBREAK') && this._shouldOutbreak(state)) {
      events.push(this._generateDiseaseOutbreak(state));
    }

    // Animal escape — check fence conditions
    if (this._canFire('ANIMAL_ESCAPE') && this._shouldEscape(state)) {
      events.push(this._generateEscape(state));
    }

    // Auction day — weekly schedule
    if (state.day && state.day % 7 === 0 && this._canFire('AUCTION_DAY')) {
      events.push(this._generateAuctionDay(state));
    }

    // Animal bond — proximity-based
    if (this._canFire('ANIMAL_BOND') && state.animals?.length >= 2) {
      const bond = this._generateBond(state);
      if (bond) events.push(bond);
    }

    // Genetic surprise — after breeding
    if (this._canFire('GENETIC_SURPRISE') && state.recentBreeding) {
      events.push(this._generateGeneticSurprise(state));
    }

    // Predator threat — night
    if (this._canFire('PREDATOR_THREAT') && state.timeOfDay === 'night') {
      events.push(this._generatePredatorThreat(state));
    }

    // Weather event
    if (this._canFire('WEATHER_EVENT') && state.weather === 'storm') {
      events.push(this._generateWeatherEvent(state));
    }

    // Prize animal sick
    if (this._canFire('PRIZE_ANIMAL_SICK') && state.bestAnimal?.health?.status === 'sick') {
      events.push(this._generatePrizeSick(state));
    }

    for (const event of events) {
      this.eventLog.push({ ...event, timestamp: Date.now() });
      this.activeEvents.push(event);
      this.storyCooldowns.set(event.type, Date.now());
    }

    // Clean active events
    this.activeEvents = this.activeEvents.filter(e => Date.now() - e.timestamp < 3600000);

    return events;
  }

  _canFire(eventType) {
    const cooldowns = { DISEASE_OUTBREAK: 3600000, ANIMAL_ESCAPE: 1800000, AUCTION_DAY: 86400000, ANIMAL_BOND: 600000, GENETIC_SURPRISE: 3600000, PREDATOR_THREAT: 7200000, WEATHER_EVENT: 3600000, PRIZE_ANIMAL_SICK: 86400000 };
    const last = this.storyCooldowns.get(eventType) || 0;
    return Date.now() - last > (cooldowns[eventType] || 1800000);
  }

  _shouldOutbreak(state) {
    const animals = state.animals || [];
    const unvaccinated = animals.filter(a => !a.health?.lastVaccination).length;
    return animals.length > 3 && unvaccinated > animals.length * 0.5 && Math.random() < 0.15;
  }

  _shouldEscape(state) {
    const hasWeakFence = (state.fences || []).some(f => f.condition < 0.5);
    return hasWeakFence || state.weather === 'storm' ? Math.random() < 0.2 : Math.random() < 0.02;
  }

  _generateDiseaseOutbreak(state) {
    const diseases = ['hoof_rot', 'avian_flu', 'scours', 'pink_eye'];
    const disease = pickRandom(diseases);
    const animals = state.animals || [];
    const target = pickRandom(animals);

    return {
      type: 'DISEASE_OUTBREAK',
      id: uuid(),
      severity: 'critical',
      title: `Disease Alert: ${disease.replace('_', ' ')} detected!`,
      narrative: `${target?.name || 'An animal'} is showing symptoms of ${disease.replace('_', ' ')}. Doc Martinez should be notified immediately.`,
      affectedAnimals: [target?.id],
      npcReactions: {
        doc_martinez: getDialogue('doc_martinez', 'animal_sick', { animal: target?.name || 'the animal', disease: disease.replace('_', ' ') }),
        jake: `${target?.name || 'The animal'} doesn't look right. I'll keep it isolated until the doc gets here.`,
      },
      choices: [
        { id: 'quarantine', text: 'Quarantine the animal', consequence: 'prevents spread but production drops' },
        { id: 'treat', text: 'Call Doc Martinez for treatment', consequence: 'costs money but saves the animal' },
        { id: 'cull', text: 'Cull to prevent spread', consequence: 'harsh but effective, affects morale' },
      ],
    };
  }

  _generateEscape(state) {
    const animals = state.animals || [];
    const runner = pickRandom(animals.filter(a => a.personality === 'curious' || a.personality === 'aggressive')) || pickRandom(animals);

    return {
      type: 'ANIMAL_ESCAPE',
      id: uuid(),
      severity: 'high',
      title: `${runner?.name || 'An animal'} has escaped!`,
      narrative: `${runner?.name || 'An animal'} broke through a weak section of fence. Jake grabs Blue and heads out.`,
      escapedAnimal: runner?.id,
      npcReactions: {
        jake: getDialogue('jake', 'escape', { animal: runner?.name || 'The animal' }),
        herd_dog: 'Blue barks and circles, already searching the east tree line.',
      },
      choices: [
        { id: 'search', text: 'Help Jake search', consequence: 'faster recovery, builds relationship' },
        { id: 'wait', text: 'Let Jake handle it', consequence: 'takes longer but Jake gains experience' },
      ],
    };
  }

  _generateAuctionDay(state) {
    return {
      type: 'AUCTION_DAY',
      id: uuid(),
      severity: 'normal',
      title: 'Auction Day! Sue is here.',
      narrative: 'Auctioneer Sue has set up in the market yard. Time to see what your animals are worth.',
      npcReactions: {
        sue: getDialogue('sue', 'greeting', {}),
        jake: 'Sue\'s here. Which ones are we moving today?',
      },
      choices: [
        { id: 'sell', text: 'Take animals to auction', consequence: 'earn money, lose animals' },
        { id: 'browse', text: 'See what Sue is offering', consequence: 'might find a deal' },
        { id: 'skip', text: 'Not today', consequence: 'nothing happens' },
      ],
    };
  }

  _generateBond(state) {
    const animals = state.animals || [];
    if (animals.length < 2) return null;
    const a = pickRandom(animals);
    const b = pickRandom(animals.filter(x => x.id !== a.id));
    if (!b) return null;

    return {
      type: 'ANIMAL_BOND',
      id: uuid(),
      severity: 'normal',
      title: `${a.name} and ${b.name} have bonded!`,
      narrative: `You notice ${a.name} and ${b.name} staying close together. They seem calmer when near each other.`,
      bondedPair: [a.id, b.id],
      effect: { production: '+10% when together', separationStress: '-20% if separated' },
    };
  }

  _generateGeneticSurprise(state) {
    return {
      type: 'GENETIC_SURPRISE',
      id: uuid(),
      severity: 'special',
      title: 'A champion emerges!',
      narrative: 'Against all expectations, the offspring shows exceptional traits. Recessive genes created something special.',
      effect: 'New breeding candidate with unique genetic potential',
    };
  }

  _generatePredatorThreat(state) {
    const predators = ['wolf', 'fox', 'eagle'];
    const predator = pickRandom(predators);
    return {
      type: 'PREDATOR_THREAT',
      id: uuid(),
      severity: 'high',
      title: `A ${predator} is near the herd!`,
      narrative: `Blue goes rigid, ears forward. Something is out there in the dark.`,
      npcReactions: {
        herd_dog: `Blue barks at the ${predator}, positioning between the threat and the herd.`,
        jake: 'Did you hear that? Grab the rifle — something\'s after the animals.',
      },
      choices: [
        { id: 'scare', text: 'Scare it off', consequence: 'works usually, small risk' },
        { id: 'secure', text: 'Move animals to the barn', consequence: 'safe but disruptive' },
      ],
    };
  }

  _generateWeatherEvent(state) {
    return {
      type: 'WEATHER_EVENT',
      id: uuid(),
      severity: 'high',
      title: 'Storm incoming!',
      narrative: 'The sky darkens fast. Jake yells about securing the animals before the worst hits.',
      effects: ['animals stressed', 'fence damage risk', 'possible escape'],
    };
  }

  _generatePrizeSick(state) {
    const animal = state.bestAnimal;
    return {
      type: 'PRIZE_ANIMAL_SICK',
      id: uuid(),
      severity: 'critical',
      title: `${animal?.name || 'Your prize animal'} is sick!`,
      narrative: `Your best breeding animal has fallen ill. The entire breeding program is at risk.`,
      npcReactions: {
        doc_martinez: getDialogue('doc_martinez', 'animal_sick', { animal: animal?.name || 'the animal', disease: 'unknown illness' }),
      },
      choices: [
        { id: 'intensive_care', text: 'Expensive treatment', consequence: 'high survival chance, big cost' },
        { id: 'rest', text: 'Rest and hope', consequence: 'cheaper but risky' },
      ],
    };
  }

  /** Get the full story log. */
  getStoryLog() { return this.eventLog; }
}

export default RanchStoryGenerator;
