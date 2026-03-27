/**
 * Species Card Display System
 * Generates text-based species cards for bot visualization
 */

export class SpeciesCard {
  constructor(options = {}) {
    this.options = {
      width: options.width ?? 40,
      barWidth: options.barWidth ?? 20,
      showDetails: options.showDetails ?? true,
      showHistory: options.showHistory ?? false,
      ...options
    };
  }

  /**
   * Generate a species card for an agent
   */
  render(agent) {
    const lines = [];

    // Header
    lines.push(this._border('top'));
    lines.push(this._title(agent));
    lines.push(this._separator());

    // Basic info
    lines.push(this._field('Generation', `Gen ${agent.generation}`));
    lines.push(this._field('Fitness', this._fitnessBar(agent.fitness)));
    lines.push(this._field('Species', agent.speciesId || 'Unknown'));

    if (agent.parentIds && agent.parentIds.length > 0) {
      lines.push(this._field('Parents', agent.parentIds.length > 0 ? 'Yes' : 'Founder'));
    }

    lines.push(this._separator());

    // Traits
    if (agent.dna) {
      lines.push('  🧬 TRAITS');
      for (const [trait, value] of Object.entries(agent.dna)) {
        lines.push(this._traitBar(trait, value));
      }
    }

    // Specialization
    if (this.options.showDetails) {
      lines.push(this._separator());
      const specialization = this._analyzeSpecialization(agent);
      lines.push(`  ⭐ SPECIALIZATION: ${specialization.name}`);
      lines.push(`  ${specialization.description}`);
    }

    // Task history
    if (this.options.showHistory && agent.taskHistory && agent.taskHistory.length > 0) {
      lines.push(this._separator());
      lines.push('  📋 TASK HISTORY');
      const recentTasks = agent.taskHistory.slice(-5);
      for (const record of recentTasks) {
        const status = record.success ? '✓' : '✗';
        lines.push(`  ${status} ${record.taskId} (${record.reward})`);
      }
      if (agent.taskHistory.length > 5) {
        lines.push(`  ... and ${agent.taskHistory.length - 5} more`);
      }
    }

    // Footer
    lines.push(this._border('bottom'));

    return lines.join('\n');
  }

  /**
   * Compare two agents side by side
   */
  compare(agentA, agentB) {
    const lines = [];

    const width = this.options.width;
    const fullWidth = (width * 2) + 3;

    lines.push('═'.repeat(fullWidth));
    lines.push(this._center(`${agentA.speciesId || 'Agent A'}  vs  ${agentB.speciesId || 'Agent B'}`, fullWidth));
    lines.push('═'.repeat(fullWidth));

    // Fitness comparison
    const fitnessA = this._fitnessBar(agentA.fitness);
    const fitnessB = this._fitnessBar(agentB.fitness);
    lines.push(`${this._pad('Fitness A', width - fitnessA.length)}${fitnessA} │ ${fitnessB}${this._pad('Fitness B', width - fitnessB.length - 1)}`);

    lines.push('─'.repeat(fullWidth));

    // Trait comparison
    if (agentA.dna && agentB.dna) {
      const allTraits = new Set([
        ...Object.keys(agentA.dna),
        ...Object.keys(agentB.dna)
      ]);

      for (const trait of allTraits) {
        const valA = agentA.dna[trait] ?? 0;
        const valB = agentB.dna[trait] ?? 0;
        const barA = this._bar(valA, 10);
        const barB = this._bar(valB, 10);
        lines.push(`${this._pad(trait, 10)} ${barA} ${valA.toFixed(2)} │ ${barB} ${valB.toFixed(2)} ${this._pad(trait, 10, true)}`);
      }
    }

    lines.push('═'.repeat(fullWidth));

    // Verdict
    lines.push('');
    if (agentA.fitness > agentB.fitness) {
      lines.push('🏆 Winner: Agent A (higher fitness)');
    } else if (agentB.fitness > agentA.fitness) {
      lines.push('🏆 Winner: Agent B (higher fitness)');
    } else {
      lines.push('🤝 Tie: Both agents have equal fitness');
    }

    return lines.join('\n');
  }

  /**
   * Generate leaderboard for population
   */
  leaderboard(agents, count = 10) {
    const lines = [];

    const sorted = [...agents].sort((a, b) => b.fitness - a.fitness);
    const topAgents = sorted.slice(0, count);

    lines.push('╔══════════════════════════════════════════════╗');
    lines.push('║          🏆 POPULATION LEADERBOARD          ║');
    lines.push('╠══════════════════════════════════════════════╣');

    for (let i = 0; i < topAgents.length; i++) {
      const agent = topAgents[i];
      const rank = i + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
      const fitness = agent.fitness.toFixed(3);
      const species = agent.speciesId || 'Unknown';
      const gen = agent.generation;

      const line = `║ ${medal} #${rank.toString().padStart(2)} ${species.padEnd(12)} Gen${gen} ${'█'.repeat(Math.floor(fitness * 10))}${fitness.padStart(5)} ║`;
      lines.push(line);
    }

    lines.push('╚══════════════════════════════════════════════╝');

    return lines.join('\n');
  }

  /**
   * Mini card for compact display
   */
  renderMini(agent) {
    const fitnessColor = agent.fitness > 0.7 ? '🟢' : agent.fitness > 0.4 ? '🟡' : '🔴';
    const topTraits = this._getTopTraits(agent, 2);

    return [
      `${fitnessColor} ${agent.speciesId || 'Agent'} (Gen ${agent.generation})`,
      `   Fitness: ${agent.fitness.toFixed(3)}`,
      `   Top: ${topTraits.join(', ')}`
    ].join('\n');
  }

  /**
   * Render for Minecraft book (limited width)
   */
  renderBook(agent) {
    const lines = [];

    lines.push(`Species: ${agent.speciesId || 'Unknown'}`);
    lines.push(`Gen: ${agent.generation}  Fit: ${agent.fitness.toFixed(2)}`);
    lines.push('');

    if (agent.dna) {
      const sortedTraits = Object.entries(agent.dna)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4);

      for (const [trait, value] of sortedTraits) {
        const bar = '■'.repeat(Math.ceil(value * 5));
        lines.push(`${trait}: ${bar} ${value.toFixed(1)}`);
      }
    }

    return lines.join('\n');
  }

  // Private helper methods

  _border(position) {
    const width = this.options.width;
    switch (position) {
      case 'top': return '┌' + '─'.repeat(width - 2) + '┐';
      case 'bottom': return '└' + '─'.repeat(width - 2) + '┘';
      default: return '─'.repeat(width);
    }
  }

  _separator() {
    return '├' + '─'.repeat(this.options.width - 2) + '┤';
  }

  _title(agent) {
    const name = agent.speciesId || 'Unknown Agent';
    const gen = `Gen ${agent.generation}`;
    const title = `${name} ${gen}`;
    const padding = (this.options.width - title.length - 2) / 2;
    return '│' + ' '.repeat(Math.floor(padding)) + title + ' '.repeat(Math.ceil(padding)) + '│';
  }

  _center(text, width) {
    const padding = (width - text.length) / 2;
    return ' '.repeat(Math.floor(padding)) + text + ' '.repeat(Math.ceil(padding));
  }

  _field(key, value) {
    const paddedKey = key.padEnd(12);
    const remaining = this.options.width - paddedKey.length - 2;
    const truncated = value.toString().substring(0, remaining);
    return `│ ${paddedKey}${truncated.padEnd(remaining)} │`;
  }

  _traitBar(trait, value) {
    const barWidth = this.options.barWidth;
    const bar = this._bar(value, barWidth);
    const paddedTrait = trait.padEnd(14);
    return `│   ${paddedTrait}${bar} ${value.toFixed(2)} │`;
  }

  _bar(value, width) {
    const filled = Math.round(value * width);
    return '█'.repeat(filled) + '░'.repeat(width - filled);
  }

  _fitnessBar(fitness) {
    const barWidth = 15;
    const bar = this._bar(fitness, barWidth);
    return `${bar} ${fitness.toFixed(2)}`;
  }

  _pad(text, length, right = false) {
    const padded = text.toString().padEnd(length);
    return right ? padded.toString().padStart(length) : padded;
  }

  _analyzeSpecialization(agent) {
    if (!agent.dna) {
      return { name: 'Unspecialized', description: 'No trait data available' };
    }

    const sortedTraits = Object.entries(agent.dna)
      .sort(([, a], [, b]) => b - a);

    const topTrait = sortedTraits[0];
    const threshold = 0.7;

    if (topTrait[1] >= threshold) {
      const specializations = {
        speed: { name: 'Scout', description: 'Fast exploration and quick tasks' },
        strength: { name: 'Laborer', description: 'Heavy lifting and construction' },
        intelligence: { name: 'Planner', description: 'Strategic thinking and optimization' },
        sociability: { name: 'Herder', description: 'Animal care and team coordination' },
        endurance: { name: 'Worker', description: 'Long tasks and repetitive work' },
        crafting_skill: { name: 'Artisan', description: 'Tool creation and complex crafting' },
        combat_skill: { name: 'Guard', description: 'Defense and protection duties' }
      };

      return specializations[topTrait[0]] || {
        name: 'Balanced',
        description: 'Well-rounded capabilities'
      };
    }

    const variance = this._calculateVariance(sortedTraits.map(([, v]) => v));
    if (variance < 0.1) {
      return { name: 'Generalist', description: 'Balanced across all traits' };
    }

    return { name: 'Developing', description: 'Still developing specialization' };
  }

  _getTopTraits(agent, count) {
    if (!agent.dna) return [];

    return Object.entries(agent.dna)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([trait, value]) => `${trait}(${value.toFixed(1)})`);
  }

  _calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }
}

export default SpeciesCard;
