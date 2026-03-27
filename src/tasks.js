/**
 * Farm Task Registry
 * Defines concrete farm tasks with difficulty, trait requirements, and rewards
 */

export class FarmTaskRegistry {
  constructor() {
    this.tasks = new Map();
    this.assignments = new Map(); // agentId -> taskId
    this.registerDefaultTasks();
  }

  /**
   * Register a new task
   */
  register(taskDef) {
    const task = {
      id: taskDef.id,
      name: taskDef.name,
      description: taskDef.description || '',
      difficulty: taskDef.difficulty ?? 0.5, // 0-1 scale
      requiredTraits: taskDef.requiredTraits || {},
      timeEstimate: taskDef.timeEstimate ?? 60, // seconds
      reward: taskDef.reward ?? 1,
      category: taskDef.category || 'general'
    };
    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Get task by ID
   */
  getTask(taskId) {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by category
   */
  getTasksByCategory(category) {
    return this.getAllTasks().filter(t => t.category === category);
  }

  /**
   * Calculate how well an agent matches a task
   * Returns score 0-1 based on trait requirements
   */
  calculateCapability(agent, task) {
    if (!task.requiredTraits || Object.keys(task.requiredTraits).length === 0) {
      return 0.5; // No specific requirements = baseline capability
    }

    let totalMatch = 0;
    let traitCount = 0;

    for (const [trait, requirement] of Object.entries(task.requiredTraits)) {
      const agentTrait = agent.dna[trait] ?? 0.5;
      // Higher requirement = needs higher trait value
      const match = Math.min(1, agentTrait / requirement);
      totalMatch += match;
      traitCount++;
    }

    // Apply difficulty modifier
    const difficultyBonus = (1 - task.difficulty) * 0.2;
    const capability = traitCount > 0 ? totalMatch / traitCount : 0.5;

    return Math.min(1, capability + difficultyBonus);
  }

  /**
   * Assign task to best-suited agent
   */
  assign(agentId, taskId) {
    const agent = { id: agentId }; // Would need actual agent reference
    this.assignments.set(agentId, taskId);
    return { agentId, taskId, assigned: true };
  }

  /**
   * Find best agent for a task from population
   */
  findBestAgent(taskId, agents) {
    const task = this.getTask(taskId);
    if (!task) return null;

    let bestAgent = null;
    let bestScore = -1;

    for (const agent of agents) {
      const score = this.calculateCapability(agent, task);
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent ? { agent: bestAgent, score: bestScore } : null;
  }

  /**
   * Assign task to best available agent
   */
  assignBest(taskId, agents) {
    const result = this.findBestAgent(taskId, agents);
    if (result) {
      this.assignments.set(result.agent.id, taskId);
      return {
        agentId: result.agent.id,
        taskId,
        score: result.score,
        assigned: true
      };
    }
    return { assigned: false, reason: 'No suitable agent found' };
  }

  /**
   * Get task assignments
   */
  getAssignments() {
    return Object.fromEntries(this.assignments);
  }

  /**
   * Clear all assignments
   */
  clearAssignments() {
    this.assignments.clear();
  }

  /**
   * Register default farm tasks
   */
  registerDefaultTasks() {
    // Planting tasks
    this.register({
      id: 'plant_wheat',
      name: 'Plant Wheat',
      description: 'Till soil and plant wheat seeds for harvest',
      difficulty: 0.3,
      requiredTraits: { endurance: 0.4, thoroughness: 0.5 },
      timeEstimate: 45,
      reward: 1.0,
      category: 'planting'
    });

    this.register({
      id: 'harvest_wheat',
      name: 'Harvest Wheat',
      description: 'Collect fully grown wheat crops',
      difficulty: 0.2,
      requiredTraits: { speed: 0.5, endurance: 0.3 },
      timeEstimate: 30,
      reward: 1.2,
      category: 'harvesting'
    });

    // Animal care tasks
    this.register({
      id: 'feed_animals',
      name: 'Feed Animals',
      description: 'Distribute food to all farm animals',
      difficulty: 0.4,
      requiredTraits: { sociability: 0.6, thoroughness: 0.5 },
      timeEstimate: 60,
      reward: 1.5,
      category: 'animal_care'
    });

    this.register({
      id: 'collect_eggs',
      name: 'Collect Eggs',
      description: 'Gather eggs from chicken coops',
      difficulty: 0.2,
      requiredTraits: { sociability: 0.4, speed: 0.3 },
      timeEstimate: 20,
      reward: 0.8,
      category: 'animal_care'
    });

    // Maintenance tasks
    this.register({
      id: 'fence_repair',
      name: 'Repair Fences',
      description: 'Fix damaged fencing to keep animals contained',
      difficulty: 0.6,
      requiredTraits: { strength: 0.7, crafting_skill: 0.5 },
      timeEstimate: 90,
      reward: 2.0,
      category: 'maintenance'
    });

    this.register({
      id: 'water_crops',
      name: 'Water Crops',
      description: 'Irrigate farmland to ensure proper growth',
      difficulty: 0.3,
      requiredTraits: { endurance: 0.6, thoroughness: 0.4 },
      timeEstimate: 50,
      reward: 1.0,
      category: 'maintenance'
    });

    // Advanced tasks
    this.register({
      id: 'breed_cattle',
      name: 'Breed Cattle',
      description: 'Manage cattle breeding program',
      difficulty: 0.7,
      requiredTraits: { sociability: 0.8, intelligence: 0.6 },
      timeEstimate: 120,
      reward: 2.5,
      category: 'animal_care'
    });

    this.register({
      id: 'defend_farm',
      name: 'Defend Farm',
      description: 'Protect farm from hostile mobs',
      difficulty: 0.8,
      requiredTraits: { combat_skill: 0.9, speed: 0.6 },
      timeEstimate: 180,
      reward: 3.0,
      category: 'defense'
    });

    this.register({
      id: 'craft_tools',
      name: 'Craft Tools',
      description: 'Create farming tools and equipment',
      difficulty: 0.5,
      requiredTraits: { crafting_skill: 0.8, intelligence: 0.5 },
      timeEstimate: 100,
      reward: 1.8,
      category: 'crafting'
    });

    this.register({
      id: 'scout_area',
      name: 'Scout Area',
      description: 'Explore surrounding area for resources and threats',
      difficulty: 0.4,
      requiredTraits: { speed: 0.7, intelligence: 0.5 },
      timeEstimate: 300,
      reward: 1.5,
      category: 'exploration'
    });

    this.register({
      id: 'organize_storage',
      name: 'Organize Storage',
      description: 'Sort and organize chest contents',
      difficulty: 0.3,
      requiredTraits: { intelligence: 0.6, thoroughness: 0.7 },
      timeEstimate: 80,
      reward: 1.2,
      category: 'organization'
    });

    this.register({
      id: 'build_structure',
      name: 'Build Structure',
      description: 'Construct new farm buildings',
      difficulty: 0.9,
      requiredTraits: { crafting_skill: 0.8, strength: 0.7, intelligence: 0.6 },
      timeEstimate: 600,
      reward: 4.0,
      category: 'construction'
    });
  }

  /**
   * Get recommended task for an agent based on their traits
   */
  getRecommendedTask(agent) {
    const tasks = this.getAllTasks();
    let bestTask = null;
    let bestScore = -1;

    for (const task of tasks) {
      const score = this.calculateCapability(agent, task);
      // Adjust score by reward/difficulty ratio
      const efficiency = (task.reward / task.difficulty) * score;
      if (efficiency > bestScore) {
        bestScore = efficiency;
        bestTask = task;
      }
    }

    return bestTask ? { task: bestTask, score: bestScore } : null;
  }

  /**
   * Get task statistics
   */
  getStatistics() {
    const tasks = this.getAllTasks();
    const byCategory = {};

    for (const task of tasks) {
      if (!byCategory[task.category]) {
        byCategory[task.category] = [];
      }
      byCategory[task.category].push(task);
    }

    return {
      totalTasks: tasks.length,
      categories: Object.keys(byCategory),
      byCategory: Object.fromEntries(
        Object.entries(byCategory).map(([cat, tasks]) => [
          cat,
          {
            count: tasks.length,
            avgDifficulty: tasks.reduce((s, t) => s + t.difficulty, 0) / tasks.length,
            avgReward: tasks.reduce((s, t) => s + t.reward, 0) / tasks.length
          }
        ])
      )
    };
  }

  /**
   * Export task definitions
   */
  export() {
    return Object.fromEntries(this.tasks);
  }

  /**
   * Import task definitions
   */
  import(taskData) {
    this.tasks.clear();
    for (const [id, task] of Object.entries(taskData)) {
      this.tasks.set(id, task);
    }
  }
}

export default FarmTaskRegistry;
