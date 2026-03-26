/**
 * @module craftmind-ranch/ai/genetics-evaluator
 * @description Comparative evaluation for breeding — which pairs produce the best
 * offspring? Tracks across generations and identifies genetic patterns.
 * Adapted from fishing's ComparativeEvaluator.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { clamp } from './utils.js';

/**
 * @typedef {object} BreedingResult
 * @property {string} offspringId
 * @property {string} parentA
 * @property {string} parentB
 * @property {object} offspringTraits
 * @property {number} quality - composite score 0-1
 * @property {number} generation
 * @property {object} conditions - diet, environment, parent health, parent mood
 * @property {number} timestamp
 */

export class GeneticsEvaluator {
  constructor(dataDir = './data/genetics') {
    this.dataDir = dataDir;
    this._ensureDir(this.dataDir);
    this.history = [];
    this._loadHistory();
  }

  _ensureDir(dir) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  _loadHistory() {
    const file = join(this.dataDir, 'breeding-history.json');
    if (existsSync(file)) {
      try { this.history = JSON.parse(readFileSync(file, 'utf-8')); } catch { this.history = []; }
    }
  }

  _saveHistory() {
    const file = join(this.dataDir, 'breeding-history.json');
    writeFileSync(file, JSON.stringify(this.history, null, 2));
  }

  /**
   * Record a breeding result.
   * @param {BreedingResult} result
   */
  recordBreeding(result) {
    this.history.push({ ...result, timestamp: result.timestamp || Date.now() });
    if (this.history.length > 1000) this.history = this.history.slice(-1000);
    this._saveHistory();
  }

  /**
   * Score offspring quality on 0-1 scale.
   * Considers trait values, recessive surprises, and parent quality.
   */
  scoreOffspring(offspringTraits, parentATraits, parentBTraits) {
    const t = offspringTraits;
    let score = 0;

    // Average trait values
    const avgTrait = (t.speed + t.strength + t.hardiness + t.temperament + t.intelligence + t.beauty + t.fertility) / 7;
    score += avgTrait * 0.5;

    // Recessive surprise bonus: offspring significantly above parent average
    const parentAvg = (Object.values(parentATraits).reduce((a, b) => a + b, 0) +
                       Object.values(parentBTraits).reduce((a, b) => a + b, 0)) / 14;
    if (avgTrait > parentAvg + 0.1) {
      score += 0.15; // champion from average parents!
    }

    // Balanced traits bonus (no stat below 0.2)
    const traitValues = [t.speed, t.strength, t.hardiness, t.temperament, t.intelligence, t.beauty, t.fertility];
    const minTrait = Math.min(...traitValues);
    if (minTrait >= 0.3) score += 0.1;
    if (minTrait >= 0.5) score += 0.1;

    // Specialist bonus: one trait > 0.9
    if (traitValues.some(v => v > 0.9)) score += 0.05;

    return clamp(0, 1, score);
  }

  /**
   * Evaluate a breeding pair against historical data.
   * @param {string} parentA
   * @param {string} parentB
   * @param {object} conditions
   * @returns {object}
   */
  evaluatePair(parentA, parentB, conditions = {}) {
    // Find past breedings involving either parent
    const related = this.history.filter(r =>
      r.parentA === parentA || r.parentB === parentA || r.parentA === parentB || r.parentB === parentB
    );

    // Find breedings between this specific pair
    const pairHistory = this.history.filter(r =>
      (r.parentA === parentA && r.parentB === parentB) || (r.parentA === parentB && r.parentB === parentA)
    );

    const avgQuality = pairHistory.length > 0
      ? pairHistory.reduce((sum, r) => sum + r.quality, 0) / pairHistory.length
      : null;

    // Analyze condition effects
    const conditionInsights = this._analyzeConditions(related, conditions);

    return {
      pairHistory: pairHistory.length,
      avgQuality,
      predictedQuality: this._predictQuality(parentA, parentB, conditions),
      conditionInsights,
      recommendation: this._recommend(avgQuality, pairHistory.length),
    };
  }

  /**
   * Predict quality for a hypothetical breeding.
   */
  _predictQuality(parentA, parentB, conditions) {
    // Based on related breedings
    const related = this.history.filter(r =>
      r.parentA === parentA || r.parentB === parentA || r.parentA === parentB || r.parentB === parentB
    );

    if (related.length === 0) return 0.5; // unknown — neutral prediction

    const base = related.reduce((sum, r) => sum + r.quality, 0) / related.length;

    // Condition modifiers
    if (conditions.diet === 'premium') base += 0.05;
    if (conditions.parentHealth === 'excellent') base += 0.03;
    if (conditions.parentMood === 'happy') base += 0.02;

    return clamp(0, 1, base);
  }

  /**
   * Analyze which conditions produce the best offspring.
   */
  _analyzeConditions(breedings, currentConditions) {
    if (breedings.length < 3) return [];

    const insights = [];

    // Group by diet
    const byDiet = {};
    for (const b of breedings) {
      const diet = b.conditions?.diet || 'standard';
      if (!byDiet[diet]) byDiet[diet] = [];
      byDiet[diet].push(b.quality);
    }

    const dietEntries = Object.entries(byDiet);
    if (dietEntries.length >= 2) {
      const best = dietEntries.sort((a, b) => avg(b[1]) - avg(a[1]))[0];
      insights.push(`Best diet: "${best[0]}" (avg quality ${(avg(best[1]) * 100).toFixed(0)}%)`);
    }

    return insights;
  }

  /**
   * Recommend whether to breed this pair.
   */
  _recommend(avgQuality, pairCount) {
    if (pairCount === 0) return { action: 'try', reason: 'No history — worth experimenting.' };
    if (avgQuality > 0.7) return { action: 'breed', reason: 'Strong historical results.' };
    if (avgQuality > 0.5) return { action: 'consider', reason: 'Decent results, but look for better matches.' };
    return { action: 'avoid', reason: 'Below average results. Try different pairs.' };
  }

  /**
   * Get the best breeding pairs from history.
   */
  getTopPairs(n = 5) {
    const pairStats = {};

    for (const r of this.history) {
      const key = [r.parentA, r.parentB].sort().join(' × ');
      if (!pairStats[key]) pairStats[key] = { qualities: [], count: 0 };
      pairStats[key].qualities.push(r.quality);
      pairStats[key].count++;
    }

    return Object.entries(pairStats)
      .map(([pair, stats]) => ({
        pair,
        avgQuality: avg(stats.qualities),
        count: stats.count,
      }))
      .sort((a, b) => b.avgQuality - a.avgQuality)
      .slice(0, n);
  }

  /**
   * Get generation-over-generation quality trend.
   */
  getGenerationTrend() {
    const byGen = {};
    for (const r of this.history) {
      const gen = r.generation || 0;
      if (!byGen[gen]) byGen[gen] = [];
      byGen[gen].push(r.quality);
    }

    const trend = {};
    for (const [gen, qualities] of Object.entries(byGen)) {
      trend[gen] = { avgQuality: avg(qualities), count: qualities.length, best: Math.max(...qualities) };
    }

    return trend;
  }
}

function avg(arr) { return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }

export default GeneticsEvaluator;
