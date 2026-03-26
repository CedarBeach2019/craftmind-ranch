/**
 * Tests for CraftMind Ranch AI modules.
 */

import { AnimalAgent, Mood, Health, AnimalMemory, PERSONALITY_TYPES } from '../src/ai/animal-agent.js';
import { RANCH_ACTIONS, parseRanchCommand, validateAction } from '../src/ai/ranch-actions.js';
import { RANCH_NPCS, DOC_MARTINEZ, RANCH_HAND_JAKE, AUCTIONEER_SUE, HERD_DOG, getDialogue, getGreeting, getNPC } from '../src/ai/ranch-npcs.js';
import { GeneticsEvaluator } from '../src/ai/genetics-evaluator.js';
import { RanchStoryGenerator, EVENT_TYPES } from '../src/ai/ranch-story-gen.js';

let passed = 0, failed = 0;
function assert(label, cond) { if (cond) { passed++; console.log(`  ✅ ${label}`); } else { failed++; console.log(`  ❌ ${label}`); } }

console.log('🧪 CraftMind Ranch AI — Tests\n');

// ─── Animal Agent Tests ────────────────────────────────────────────────────
console.log('── Animal Agent ──');

const animal = new AnimalAgent({ id: 'test1', name: 'Thunder', species: 'sheep', traits: { speed: 0.8, strength: 0.6, hardiness: 0.7, temperament: 0.9, intelligence: 0.5, beauty: 0.7, fertility: 0.8 }, personality: 'curious' });
assert('Animal created', animal.name === 'Thunder');
assert('Traits set', animal.traits.speed === 0.8);
assert('Personality set', animal.personality === 'curious');
assert('Quality in range', animal.quality >= 0 && animal.quality <= 1);
assert('Initial mood happiness', animal.mood.happiness === 0.5);
assert('Initial health', animal.health.status === 'healthy');

// Feeding
const feedResult = animal.feed('premium oats');
assert('Feed returns eaten', feedResult.eaten === true);
assert('Feeding reduces hunger', animal.mood.hunger < 0.3);
assert('Feeding increases happiness', animal.mood.happiness > 0.5);
assert('Memory records food', animal.memory.preferredFood === 'premium oats');

// Petting (set some stress first so decrease is measurable)
animal.mood.stress = 0.2;
const petResult = animal.pet('Jake');
assert('Pet returns reaction', typeof petResult.reaction === 'string');
assert('Memory records handler', animal.memory.knows('Jake'));
assert('Petting increases happiness', animal.mood.happiness > 0.5);
assert('Petting decreases stress', animal.mood.stress < 0.2);

// Vaccination
const vacResult = animal.vaccinate();
assert('Vaccinate works', vacResult.vaccinated === true);
assert('Vaccination causes stress', animal.mood.stress > 0);

// Production
const prod = animal.production;
assert('Production is a number', typeof prod === 'number');
assert('Healthy animal produces', prod > 0);

// Health system
const sickAnimal = new AnimalAgent({ id: 'sick1', name: 'Bessie', species: 'cow' });
sickAnimal.health.infect('hoof_rot');
assert('Infection works', sickAnimal.health.isSick);
assert('HP reduced', sickAnimal.health.hp < 100);
assert('Needs vet', sickAnimal.health.needsVet);
sickAnimal.mood.apply('sick');
assert('Sick animal less happy', sickAnimal.mood.happiness < 0.5);

sickAnimal.vaccinate();
assert('Vaccine helps', sickAnimal.health.status === 'recovering');
sickAnimal.health.heal(50);
assert('Healing works', sickAnimal.health.hp > 50);

// Mood tick
animal.mood.hunger = 0.5;
animal.tick();
assert('Tick increases hunger', animal.mood.hunger > 0.5);

// Personality production mods
const lazy = new AnimalAgent({ id: 'lazy1', name: 'Slowpoke', species: 'goat', personality: 'lazy', traits: { speed: 0.5, strength: 0.5, hardiness: 0.5, temperament: 0.5, intelligence: 0.5, beauty: 0.5, fertility: 0.5 } });
const docile = new AnimalAgent({ id: 'docile1', name: 'Sweetie', species: 'goat', personality: 'docile', traits: { speed: 0.5, strength: 0.5, hardiness: 0.5, temperament: 0.5, intelligence: 0.5, beauty: 0.5, fertility: 0.5 } });
assert('Docile produces more than lazy', docile.production >= lazy.production);

// Breeding modifier
const stressed = new AnimalAgent({ id: 'stressed1', name: 'Anxious', species: 'cow', personality: 'aggressive' });
stressed.mood.stress = 0.8;
assert('Stressed animals breed poorly', stressed.mood.breedingModifier < 0.5);

// Memory
const memAnimal = new AnimalAgent({ id: 'mem1', name: 'Memory', species: 'horse' });
memAnimal.memory.remember({ type: 'bond', animalId: 'other1' });
assert('Bonding recorded', memAnimal.memory.isBondedWith('other1'));
assert('Not bonded with stranger', !memAnimal.memory.isBondedWith('stranger'));

// Personality types
assert('6 personality types', PERSONALITY_TYPES.length === 6);

// Serialization
const json = animal.toJSON();
assert('Serialization works', json.name === 'Thunder');
assert('JSON has quality', typeof json.quality === 'number');

// ─── Ranch Actions Tests ──────────────────────────────────────────────────
console.log('\n── Ranch Actions ──');

assert('10 actions defined', Object.keys(RANCH_ACTIONS).length === 10);
assert('BREED has params', RANCH_ACTIONS.BREED.params.length > 0);
assert('GATHER has examples', RANCH_ACTIONS.GATHER.examples.length > 0);

const cmd1 = parseRanchCommand('Breed the two fastest sheep');
assert('Parse BREED command', cmd1.action === 'BREED');
const cmd2 = parseRanchCommand('Feed the chickens');
assert('Parse FEED command', cmd2.action === 'FEED');
const cmd3 = parseRanchCommand('Collect eggs from the coop');
assert('Parse GATHER command', cmd3.action === 'GATHER');
const cmd4 = parseRanchCommand('Build a bigger barn');
assert('Parse BUILD command', cmd4.action === 'BUILD');
const cmd5 = parseRanchCommand('Sell the pig at market');
assert('Parse SELL command', cmd5.action === 'SELL');
const cmd6 = parseRanchCommand('Check this animal\'s stats');
assert('Parse INSPECT command', cmd6.action === 'INSPECT');
const cmd7 = parseRanchCommand('Name this one Thunder');
assert('Parse NAME command', cmd7.action === 'NAME');
const cmd8 = parseRanchCommand('Give the herd their shots');
assert('Parse VACCINATE command', cmd8.action === 'VACCINATE');
const cmd9 = parseRanchCommand('Repair the north pasture fence');
assert('Parse FENCE command', cmd9.action === 'FENCE');
const cmd10 = parseRanchCommand('Run a DNA analysis on this horse');
assert('Parse GENETIC_TEST command', cmd10.action === 'GENETIC_TEST');

const unknown = parseRanchCommand('go jump');
assert('Unknown command returns null action', unknown.action === null);

const valid = validateAction('BREED', { parentA: 'a1', parentB: 'b1' });
assert('Valid BREED action', valid.valid === true);
const invalid = validateAction('BREED', {});
assert('Invalid BREED without parents', !invalid.valid);
const unknownAction = validateAction('FLY', {});
assert('Unknown action validation', !unknownAction.valid);

// ─── Ranch NPCs Tests ─────────────────────────────────────────────────────
console.log('\n── Ranch NPCs ──');

assert('4 NPCs defined', RANCH_NPCS.length === 4);
assert('Doc Martinez found', getNPC('doc_martinez')?.name === 'Doc Martinez');
assert('Jake found', getNPC('jake')?.name === 'Jake');
assert('Sue found', getNPC('sue')?.name === 'Auctioneer Sue');
assert('Blue found', getNPC('herd_dog')?.name === 'Blue');

// Dialogue
const dlg = getDialogue('doc_martinez', 'animal_sick', { animal: 'Bessie', disease: 'hoof rot' });
assert('Doc gives sick dialogue', dlg !== null && dlg.length > 0);
assert('Dialogue substitution', dlg?.includes('Bessie'));

const jakeDlg = getDialogue('jake', 'escape', { animal: 'Thunder' });
assert('Jake gives escape dialogue', jakeDlg !== null && jakeDlg.length > 0);

// Greetings
const morning = getGreeting('jake', 8);
assert('Morning greeting', morning !== null && morning.length > 0);
const evening = getGreeting('doc_martinez', 19);
assert('Evening greeting', evening !== null && evening.length > 0);

// NPC structure
assert('Doc has compassion', DOC_MARTINEZ.personality.traits.compassion > 0.9);
assert('Jake has practicality', RANCH_HAND_JAKE.personality.traits.practicality > 0.9);
assert('Sue has shrewdness', AUCTIONEER_SUE.personality.traits.shrewdness > 0.9);
assert('Dog has instinct', HERD_DOG.personality.traits.instinct > 0.9);

// Dog commands
assert('Dog has commands', Object.keys(HERD_DOG.commands).length >= 5);

// Schedule
assert('Doc has schedule', DOC_MARTINEZ.schedule.length > 0);

// ─── Genetics Evaluator Tests ─────────────────────────────────────────────
console.log('\n── Genetics Evaluator ──');

const evalDir = `./test-data/genetics-${Date.now()}`;
const ge = new GeneticsEvaluator(evalDir);

// Score offspring
const score1 = ge.scoreOffspring({ speed: 0.8, strength: 0.7, hardiness: 0.6, temperament: 0.9, intelligence: 0.5, beauty: 0.7, fertility: 0.8 }, { speed: 0.5, strength: 0.5, hardiness: 0.5, temperament: 0.5, intelligence: 0.5, beauty: 0.5, fertility: 0.5 }, { speed: 0.5, strength: 0.5, hardiness: 0.5, temperament: 0.5, intelligence: 0.5, beauty: 0.5, fertility: 0.5 });
assert('Offspring score in range', score1 >= 0 && score1 <= 1);
assert('Good offspring scores higher', score1 > 0.3);

// Champion from average parents
const champScore = ge.scoreOffspring({ speed: 0.9, strength: 0.9, hardiness: 0.9, temperament: 0.9, intelligence: 0.9, beauty: 0.9, fertility: 0.9 }, { speed: 0.5, strength: 0.5, hardiness: 0.5, temperament: 0.5, intelligence: 0.5, beauty: 0.5, fertility: 0.5 }, { speed: 0.5, strength: 0.5, hardiness: 0.5, temperament: 0.5, intelligence: 0.5, beauty: 0.5, fertility: 0.5 });
assert('Champion from average parents scores higher', champScore > score1);

// Record and evaluate
ge.recordBreeding({ offspringId: 'o1', parentA: 'a1', parentB: 'b1', offspringTraits: { speed: 0.7, strength: 0.7, hardiness: 0.7, temperament: 0.7, intelligence: 0.7, beauty: 0.7, fertility: 0.7 }, quality: 0.7, generation: 1, conditions: { diet: 'premium' } });
ge.recordBreeding({ offspringId: 'o2', parentA: 'a1', parentB: 'b1', offspringTraits: { speed: 0.6, strength: 0.6, hardiness: 0.6, temperament: 0.6, intelligence: 0.6, beauty: 0.6, fertility: 0.6 }, quality: 0.6, generation: 1, conditions: { diet: 'standard' } });
ge.recordBreeding({ offspringId: 'o3', parentA: 'a2', parentB: 'b2', offspringTraits: { speed: 0.8, strength: 0.8, hardiness: 0.8, temperament: 0.8, intelligence: 0.8, beauty: 0.8, fertility: 0.8 }, quality: 0.8, generation: 2, conditions: { diet: 'premium' } });
assert('History has 3 entries', ge.history.length === 3);

const pairEval = ge.evaluatePair('a1', 'b1');
assert('Pair evaluation has history', pairEval.pairHistory === 2);
assert('Pair evaluation has quality', pairEval.avgQuality !== null);
assert('Pair evaluation has recommendation', pairEval.recommendation.action);

const noHistory = ge.evaluatePair('x1', 'x2');
assert('No history pair predicts', noHistory.predictedQuality === 0.5);
assert('No history recommends try', noHistory.recommendation.action === 'try');

const topPairs = ge.getTopPairs(3);
assert('Top pairs returned', topPairs.length > 0);

const trend = ge.getGenerationTrend();
assert('Generation trend returned', typeof trend === 'object');

// ─── Ranch Story Generator Tests ──────────────────────────────────────────
console.log('\n── Ranch Story Generator ──');

const sg = new RanchStoryGenerator();

// Disease outbreak
const events1 = sg.generateEvents({
  animals: [
    new AnimalAgent({ id: 'a1', name: 'Bessie', species: 'cow' }),
    new AnimalAgent({ id: 'a2', name: 'Thunder', species: 'horse' }),
    new AnimalAgent({ id: 'a3', name: 'Daisy', species: 'cow' }),
    new AnimalAgent({ id: 'a4', name: 'Lightning', species: 'sheep' }),
  ],
  fences: [{ condition: 0.8 }],
  weather: 'sunny', timeOfDay: 'day', day: 3,
});
assert('Events returned (may be empty)', Array.isArray(events1));

// Auction day (day % 7 === 0)
const events2 = sg.generateEvents({
  animals: [new AnimalAgent({ id: 'a1', name: 'Test', species: 'cow' })],
  fences: [{ condition: 0.9 }], weather: 'sunny', timeOfDay: 'day', day: 7,
});
// Day 7 should trigger auction (if cooldown allows)

// Animal escape (weak fence)
const events3 = sg.generateEvents({
  animals: [
    new AnimalAgent({ id: 'a1', name: 'Runner', species: 'goat', personality: 'curious' }),
  ],
  fences: [{ condition: 0.2 }], weather: 'sunny', timeOfDay: 'day', day: 2,
});

// Storm events
const events4 = sg.generateEvents({
  animals: [new AnimalAgent({ id: 'a1', name: 'Stormy', species: 'horse' })],
  fences: [{ condition: 0.5 }], weather: 'storm', timeOfDay: 'day', day: 5,
});

// Predator (night)
const events5 = sg.generateEvents({
  animals: [new AnimalAgent({ id: 'a1', name: 'Night', species: 'sheep' })],
  fences: [{ condition: 0.7 }], weather: 'clear', timeOfDay: 'night', day: 4,
});

// Event types defined
assert('8 event types', Object.keys(EVENT_TYPES).length === 8);
assert('Event log accessible', Array.isArray(sg.getStoryLog()));

// Clean up test data
import { rmSync } from 'fs';
try { rmSync(evalDir, { recursive: true }); } catch {}

// ─── Summary ──────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(40)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(40)}`);
process.exit(failed > 0 ? 1 : 0);
