/**
 * @module craftmind-ranch/ai/ranch-npcs
 * @description Ranch NPC agent configs — Doc Martinez, Jake, Sue, and the Herd Dog.
 * Each has personality, schedule, opinions, and dialogue pools.
 */

import { pickRandom } from './utils.js';

// ── Doc Martinez (Veterinarian) ────────────────────────────────────────────

export const DOC_MARTINEZ = {
  id: 'doc_martinez',
  name: 'Doc Martinez',
  role: 'veterinarian',
  emoji: '🩺',
  personality: {
    traits: { compassion: 0.95, knowledge: 0.9, patience: 0.7, strictness: 0.6, humor: 0.3 },
    opinions: {
      breeding: 'cautious', // concerned about over-breeding
      animal_welfare: 'paramount',
      player_skill: 'developing',
    },
  },
  schedule: [
    { hours: [7, 12], location: 'clinic', activity: 'consultations' },
    { hours: [12, 13], location: 'cafe', activity: 'lunch' },
    { hours: [13, 17], location: 'ranch', activity: 'rounds' },
    { hours: [17, 18], location: 'clinic', activity: 'paperwork' },
  ],
  greetings: {
    morning: ['Morning. Any animals need checking today?', 'Early start. Good — the critters don\'t wait.'],
    afternoon: ['How are the herds looking?', 'I was just reviewing vaccination records. We\'re due.'],
    evening: ['Call me if anything gets worse overnight.', 'Animals heal on their own schedule. Ours is to watch.'],
  },
  dialogue: {
    animal_sick: [
      'This {animal} is running a fever. Keep it isolated — I don\'t want it spreading.',
      'I\'ve seen this before. {disease} — treatable if we catch it early. Don\'t wait.',
      'This {animal} needs rest, not more breeding. Sometimes doing nothing is the treatment.',
    ],
    breeding_advice: [
      'Those two? Interesting choice, but watch for temperament in the offspring.',
      'Before you breed again, let\'s see how the last litter turned out. Patience.',
      'You\'re breeding too fast. The line gets weaker if you don\'t let them recover.',
    ],
    overwork: [
      'Jake told me you\'ve been running the herd hard. Give them a day off.',
      'Stressed animals don\'t just produce less — they get sick more. Economics.',
      'I didn\'t go to vet school to see animals treated like machines.',
    ],
    player_praise: [
      'You noticed that symptom before I did. Good eye.',
      'You\'re learning. You actually listened when I said to watch their ears.',
    ],
  },
  concernThreshold: 0.3, // triggers worried dialogue when animal health drops below this
};

// ── Ranch Hand Jake ────────────────────────────────────────────────────────

export const RANCH_HAND_JAKE = {
  id: 'jake',
  name: 'Jake',
  role: 'ranch_hand',
  emoji: '🤠',
  personality: {
    traits: { practicality: 0.95, observation: 0.85, loyalty: 0.9, humor: 0.7, patience: 0.5 },
    opinions: {
      breeding: 'pragmatic',
      animal_welfare: 'important',
      player_skill: 'growing_on_him',
    },
  },
  schedule: [
    { hours: [5, 8], location: 'barn', activity: 'morning_feed' },
    { hours: [8, 12], location: 'pasture', activity: 'field_work' },
    { hours: [12, 13], location: 'barn', activity: 'lunch' },
    { hours: [13, 17], location: 'pasture', activity: 'maintenance' },
    { hours: [17, 18], location: 'barn', activity: 'evening_feed' },
  ],
  greetings: {
    morning: ['Mornin\'. Bessie\'s looking good today.', 'Fences held through the night. Small wins.'],
    afternoon: ['Hot one. The animals are in the shade where they can find it.'],
    evening: ['All fed and bedded down. See you at dawn.'],
  },
  dialogue: {
    animal_behavior: [
      'Bessie\'s been off her feed again. Might be the new hay — she\'s picky.',
      'The new calf won\'t leave its mother\'s side. Good sign — means she\'s attentive.',
      'Thunder\'s been pacing the fence line. Something\'s got him spooked.',
    ],
    fence_repair: [
      'North fence has a weak post. Rain softened the ground. I\'ll patch it today.',
      'Keep an eye on the east side. Those goats find a way out of anything.',
    ],
    escape: [
      '{animal} broke out again! I\'ll take the dog and circle east.',
      'Found tracks heading toward the creek. That\'s where they always go.',
    ],
    auction: [
      'Sue\'s offering fair prices today. Might be the time to move those two.',
      'Don\'t let Sue lowball you on the bull. She knows its worth.',
    ],
    player_teaching: [
      'See how {animal}\'s ears are back? That means irritated. Give it space.',
      'When you feed, stand to the side — not in front. They charge less that way.',
    ],
  },
};

// ── Auctioneer Sue ─────────────────────────────────────────────────────────

export const AUCTIONEER_SUE = {
  id: 'sue',
  name: 'Auctioneer Sue',
  role: 'auctioneer',
  emoji: '💰',
  personality: {
    traits: { shrewdness: 0.95, charm: 0.8, negotiation: 0.9, humor: 0.6, honesty: 0.4 },
    opinions: {
      breeding: 'business',
      animal_welfare: 'transactional',
      player_skill: 'naive',
    },
  },
  schedule: [
    { hours: [9, 15], location: 'market', activity: 'auction' }, // only shows up sale day
  ],
  greetings: {
    morning: ['What have you brought me today? Let\'s see what it\'s worth.'],
    afternoon: ['Still here? Most folks have made their deals by now.'],
    evening: ['Come back next week with something better.'],
  },
  dialogue: {
    price_low: [
      'I\'ve seen better. I can offer you {price} — take it or leave it.',
      'The market\'s soft. {price} is generous for what you\'re showing me.',
    ],
    price_high: [
      'Now THAT\'s breeding stock. {price} — and I\'m not negotiating up.',
      'Where\'d you get this one? I have a buyer who\'ll pay {price}. Easy.',
    ],
    haggle: [
      'You drive a hard bargain. I\'ll add 10% — final offer.',
      'Tell you what — meet me at {price} and we shake on it.',
    ],
    rival_bid: [
      'Another buyer\'s interested. Better decide fast.',
      'That bull just went up in value. Someone else saw what I saw.',
    ],
  },
};

// ── The Herd Dog ───────────────────────────────────────────────────────────

export const HERD_DOG = {
  id: 'herd_dog',
  name: 'Blue',
  role: 'herd_dog',
  emoji: '🐕',
  personality: {
    traits: { speed: 0.9, obedience: 0.85, instinct: 0.95, stamina: 0.8, intelligence: 0.8 },
    opinions: {
      handler: 'jake',
    },
  },
  commands: {
    gather: 'Circles and brings animals toward center',
    flank: 'Moves to side position to prevent stragglers',
    hold: 'Stops animals in place, blocks movement',
    drive: 'Pushes animals forward toward destination',
    recall: 'Returns to handler immediately',
    search: 'Scans area for lost animals',
  },
  reactions: {
    escape: 'Alerts Jake, begins search pattern',
    storm: 'Becomes anxious, checks fence perimeter',
    predator: 'Barks warning, positions between threat and herd',
    new_animal: 'Sniffs cautiously, establishes hierarchy',
  },
};

// ── Registry ───────────────────────────────────────────────────────────────

export const RANCH_NPCS = [DOC_MARTINEZ, RANCH_HAND_JAKE, AUCTIONEER_SUE, HERD_DOG];

export function getNPC(id) { return RANCH_NPCS.find(n => n.id === id); }

export function getNPCByName(name) { return RANCH_NPCS.find(n => n.name.toLowerCase() === name.toLowerCase()); }

/** Get NPC dialogue for a situation. */
export function getDialogue(npcId, situation, replacements = {}) {
  const npc = getNPC(npcId);
  if (!npc?.dialogue?.[situation]) return null;
  let line = pickRandom(npc.dialogue[situation]);
  if (line) {
    for (const [key, val] of Object.entries(replacements)) {
      line = line.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
    }
  }
  return line;
}

/** Get NPC greeting for time of day. */
export function getGreeting(npcId, hour) {
  const npc = getNPC(npcId);
  if (!npc?.greetings) return null;
  let period;
  if (hour < 12) period = 'morning';
  else if (hour < 17) period = 'afternoon';
  else period = 'evening';
  return pickRandom(npc.greetings[period] || npc.greetings.morning || []);
}

export default RANCH_NPCS;
