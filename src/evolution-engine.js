/**
 * Evolution Engine - Genetic evolution for bot populations
 * Implements tournament selection, single-point crossover, and mutation
 */

export class EvolutionEngine {
  constructor(config = {}) {
    this.population = new Map(); // botId -> Agent
    this.generation = 0;
    this.fitnessHistory = [];
    this.config = {
      populationSize: config.populationSize ?? 20,
      tournamentSize: config.tournamentSize ?? 5,
      tournamentWinners: config.tournamentWinners ?? 3,
      mutationRate: config.mutationRate ?? 0.1,
      mutationStrength: config.mutationStrength ?? 0.2,
      elitismCount: config.elitismCount ?? 2,
      ...config
    };
  }

  /**
   * Create a new agent with random DNA
   */
  createAgent(speciesId = 'human') {
    const agent = {
      id: crypto.randomUUID(),
      speciesId,
      generation: this.generation,
      dna: this.randomDNA(),
      fitness: 0,
      taskHistory: []
    };
    this.population.set(agent.id, agent);
    return agent;
  }

  /**
   * Generate random DNA with all traits
   */
  randomDNA() {
    return {
      speed: Math.random(),
      strength: Math.random(),
      intelligence: Math.random(),
      sociability: Math.random(),
      endurance: Math.random(),
      crafting_skill: Math.random(),
      combat_skill: Math.random()
    };
  }

  /**
   * Tournament selection: pick k random agents, return top n
   */
  tournamentSelect(k = this.config.tournamentSize, n = this.config.tournamentWinners) {
    const candidates = [];
    const keys = Array.from(this.population.keys());

    for (let i = 0; i < k && i < keys.length; i++) {
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const agent = this.population.get(randomKey);
      if (agent && !candidates.includes(agent)) {
        candidates.push(agent);
      }
    }

    // Sort by fitness descending
    candidates.sort((a, b) => b.fitness - a.fitness);
    return candidates.slice(0, n);
  }

  /**
   * Single-point crossover: combine DNA from two parents at random point
   */
  crossover(parentA, parentB) {
    const traits = Object.keys(parentA.dna);
    const crossoverPoint = Math.floor(Math.random() * (traits.length - 1)) + 1;

    const childDNA = {};
    for (let i = 0; i < traits.length; i++) {
      const trait = traits[i];
      if (i < crossoverPoint) {
        childDNA[trait] = parentA.dna[trait];
      } else {
        childDNA[trait] = parentB.dna[trait];
      }
    }

    return {
      id: crypto.randomUUID(),
      speciesId: parentA.speciesId,
      generation: this.generation + 1,
      parentIds: [parentA.id, parentB.id],
      dna: childDNA,
      fitness: 0,
      taskHistory: []
    };
  }

  /**
   * Mutate DNA with random adjustments
   */
  mutate(agent) {
    const dna = agent.dna;
    for (const trait of Object.keys(dna)) {
      if (Math.random() < this.config.mutationRate) {
        const change = (Math.random() - 0.5) * this.config.mutationStrength;
        dna[trait] = Math.max(0, Math.min(1, dna[trait] + change));
      }
    }
    return agent;
  }

  /**
   * Calculate fitness based on task completion history
   */
  calculateFitness(agent) {
    if (agent.taskHistory.length === 0) return 0.1;

    let totalScore = 0;
    for (const record of agent.taskHistory) {
      totalScore += record.success ? record.reward : 0;
    }

    // Bonus for task variety
    const uniqueTasks = new Set(agent.taskHistory.map(r => r.taskId)).size;
    const varietyBonus = uniqueTasks * 0.05;

    // Average performance
    const avgScore = totalScore / agent.taskHistory.length;
    return Math.min(1, avgScore + varietyBonus);
  }

  /**
   * Record a task completion for an agent
   */
  recordTask(agentId, taskId, success, efficiency = 1, reward = 1) {
    const agent = this.population.get(agentId);
    if (!agent) return false;

    agent.taskHistory.push({
      taskId,
      success,
      efficiency,
      reward,
      timestamp: Date.now()
    });

    agent.fitness = this.calculateFitness(agent);
    return true;
  }

  /**
   * Run one generation of evolution
   */
  evolve() {
    this.generation++;

    // Record current generation fitness
    const fitnessSnapshot = {
      generation: this.generation,
      avgFitness: this.getAverageFitness(),
      bestFitness: this.getBestFitness(),
      populationSize: this.population.size,
      timestamp: Date.now()
    };
    this.fitnessHistory.push(fitnessSnapshot);

    // Sort current population by fitness
    const ranked = Array.from(this.population.values())
      .sort((a, b) => b.fitness - a.fitness);

    // Keep elite agents
    const elites = ranked.slice(0, this.config.elitismCount);
    const newPopulation = new Map();

    // Elitism: keep best performers unchanged
    for (const elite of elites) {
      const eliteClone = { ...elite, id: crypto.randomUUID() };
      eliteClone.taskHistory = []; // Reset history for new generation
      eliteClone.fitness = 0;
      newPopulation.set(eliteClone.id, eliteClone);
    }

    // Breed new generation
    while (newPopulation.size < this.config.populationSize) {
      // Tournament selection
      const winners = this.tournamentSelect();

      if (winners.length >= 2) {
        // Crossover top two winners
        const child = this.crossover(winners[0], winners[1]);
        this.mutate(child);
        newPopulation.set(child.id, child);
      }
    }

    this.population = newPopulation;
    return fitnessSnapshot;
  }

  /**
   * Get current population
   */
  getPopulation() {
    return Array.from(this.population.values());
  }

  /**
   * Get best agent(s) by fitness
   */
  getBest(count = 1) {
    return Array.from(this.population.values())
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, count);
  }

  /**
   * Get current generation number
   */
  getGeneration() {
    return this.generation;
  }

  /**
   * Get fitness history
   */
  getFitnessHistory() {
    return this.fitnessHistory;
  }

  /**
   * Get average fitness of population
   */
  getAverageFitness() {
    if (this.population.size === 0) return 0;
    const total = Array.from(this.population.values())
      .reduce((sum, agent) => sum + agent.fitness, 0);
    return total / this.population.size;
  }

  /**
   * Get best fitness in population
   */
  getBestFitness() {
    if (this.population.size === 0) return 0;
    return Math.max(...Array.from(this.population.values()).map(a => a.fitness));
  }

  /**
   * Get population diversity (average trait std dev)
   */
  getDiversity() {
    if (this.population.size < 2) return 0;

    const traits = Object.keys(this.randomDNA());
    let totalDiversity = 0;

    for (const trait of traits) {
      const values = Array.from(this.population.values())
        .map(a => a.dna[trait]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      totalDiversity += Math.sqrt(variance);
    }

    return totalDiversity / traits.length;
  }

  /**
   * Initialize population with random agents
   */
  initializePopulation(count = this.config.populationSize, speciesId = 'human') {
    this.population.clear();
    for (let i = 0; i < count; i++) {
      this.createAgent(speciesId);
    }
    this.generation = 0;
    this.fitnessHistory = [];
  }

  /**
   * Export population state
   */
  export() {
    return {
      generation: this.generation,
      population: Array.from(this.population.values()),
      fitnessHistory: this.fitnessHistory,
      config: this.config
    };
  }

  /**
   * Import population state
   */
  import(data) {
    this.generation = data.generation;
    this.fitnessHistory = data.fitnessHistory || [];
    this.config = { ...this.config, ...data.config };
    this.population = new Map();
    for (const agent of data.population) {
      this.population.set(agent.id, agent);
    }
  }
}

export default EvolutionEngine;
