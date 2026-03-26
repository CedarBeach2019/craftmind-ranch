/**
 * @module craftmind-ranch/ai/ranch-actions
 * @description Ranch-specific action schema — structured actions the player
 * (and agents) can take. Mirrors the fishing game's action system.
 */

export const RANCH_ACTIONS = {
  BREED: {
    id: 'BREED',
    description: 'Breed two animals together',
    params: ['parentA', 'parentB'],
    examples: ['Breed the two fastest sheep', 'Breed Thunder with Lightning'],
    requires: ['two_compatible_animals'],
    effects: ['creates_offspring', 'affects_parent_mood'],
  },
  FEED: {
    id: 'FEED',
    description: 'Feed an animal or group',
    params: ['target', 'food'],
    examples: ['Feed the chickens', 'Give Bessie the premium oats'],
    requires: ['food_in_inventory'],
    effects: ['reduces_hunger', 'increases_happiness'],
  },
  GATHER: {
    id: 'GATHER',
    description: 'Collect animal products',
    params: ['resourceType', 'location'],
    examples: ['Collect eggs from the coop', 'Milk the goats', 'Shear the sheep'],
    requires: ['animals_present'],
    effects: ['adds_to_inventory', 'animal_mood_change'],
  },
  BUILD: {
    id: 'BUILD',
    description: 'Build or upgrade ranch structures',
    params: ['structureType', 'location'],
    examples: ['Build a bigger barn', 'Upgrade the chicken coop', 'Add a water trough'],
    requires: ['materials', 'funds'],
    effects: ['increases_capacity', 'unlocks_features'],
  },
  SELL: {
    id: 'SELL',
    description: 'Sell an animal at market',
    params: ['animalId', 'price'],
    examples: ['Sell the pig at market', 'Auction the prize bull'],
    requires: ['animal_selected', 'buyer_available'],
    effects: ['removes_animal', 'adds_funds'],
  },
  INSPECT: {
    id: 'INSPECT',
    description: 'Check an animal\'s detailed stats',
    params: ['animalId'],
    examples: ['Check this animal\'s stats', 'Show me Thunder\'s DNA'],
    requires: ['animal_selected'],
    effects: ['displays_info'],
  },
  NAME: {
    id: 'NAME',
    description: 'Name an animal',
    params: ['animalId', 'name'],
    examples: ['Name this one Thunder', 'Call the calf Buttons'],
    requires: ['unnamed_or_rename'],
    effects: ['sets_name', 'increases_bond'],
  },
  VACCINATE: {
    id: 'VACCINATE',
    description: 'Give vaccinations to animals',
    params: ['targets'],
    examples: ['Give the herd their shots', 'Vaccinate all the cattle'],
    requires: ['vaccine_in_stock', 'vet_available'],
    effects: ['prevents_disease', 'temporary_stress'],
  },
  FENCE: {
    id: 'FENCE',
    description: 'Repair or build fences',
    params: ['location', 'material'],
    examples: ['Repair the north pasture fence', 'Build a fence around the new pen'],
    requires: ['materials'],
    effects: ['prevents_escapes'],
  },
  GENETIC_TEST: {
    id: 'GENETIC_TEST',
    description: 'Run DNA analysis on an animal',
    params: ['animalId'],
    examples: ['Run a DNA analysis on this horse', 'Test the new calf\'s genetics'],
    requires: ['lab_access'],
    effects: ['reveals_hidden_traits', 'improves_breeding_decisions'],
  },
};

/** Parse a natural language command into a structured action. */
export function parseRanchCommand(text) {
  const lower = text.toLowerCase();

  for (const [key, action] of Object.entries(RANCH_ACTIONS)) {
    // Match against keywords
    const keywords = {
      BREED: ['breed', 'mate', 'cross'],
      FEED: ['feed', 'give food', 'nourish'],
      GATHER: ['collect', 'gather', 'harvest', 'milk', 'shear', 'eggs'],
      BUILD: ['build', 'construct', 'upgrade', 'expand'],
      SELL: ['sell', 'auction', 'market'],
      INSPECT: ['inspect', 'check', 'stats', 'examine', 'look at'],
      NAME: ['name', 'call', 'rename'],
      VACCINATE: ['vaccinate', 'vaccination', 'shots', 'inoculate'],
      FENCE: ['fence', 'repair fence', 'build fence'],
      GENETIC_TEST: ['genetic', 'dna', 'test', 'analyze'],
    };

    if (keywords[key].some(kw => lower.includes(kw))) {
      return { action: key, rawText: text, confidence: 0.8 };
    }
  }

  return { action: null, rawText: text, confidence: 0 };
}

/** Validate an action has required parameters. */
export function validateAction(actionId, params) {
  const action = RANCH_ACTIONS[actionId];
  if (!action) return { valid: false, errors: [`Unknown action: ${actionId}`] };

  const errors = [];
  for (const req of action.params) {
    if (req === 'parentA' && !params.parentA) errors.push('Need parent A');
    if (req === 'parentB' && !params.parentB) errors.push('Need parent B');
    if (req === 'target' && !params.target) errors.push('Need a target');
    if (req === 'animalId' && !params.animalId) errors.push('Need an animal');
  }

  return { valid: errors.length === 0, errors };
}

export default RANCH_ACTIONS;
