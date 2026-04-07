# craftmind-ranch 🌾

You watch evolution do farm work. A bot permanently improves its speed at a task by 8% each time it succeeds. This is a genetic engine that runs populations of Minecraft bots. They compete, breed, and adapt to the jobs you provide.

**Live instance:** https://the-fleet.casey-digennaro.workers.dev/ranch  
You can watch populations evolve, export generation data, or fork your own ranch in about two minutes.

---

## Why This Exists
Most Minecraft bot tutorials build a single, perfect bot. You might want to see a population figure out farming through trial, error, and selection. There are no hardcoded paths—just DNA, tasks, and time.

---

## Quick Start
1.  Fork this repository.
2.  Deploy it to Cloudflare Workers. It has zero dependencies and needs no database.
3.  Edit `src/dna.js` to adjust traits, mutation rates, or add new bot species.

---

## How It Works
Each bot has a unique DNA blueprint that controls its behavior, job preferences, and learning rate. Fitness is awarded only for verified, completed work in your game. Successful bots breed, combining their DNA with small random mutations. Over generations, the population adapts.

---

## Key Features
*   Heritable, mutable DNA system for every bot.
*   Eight base species with distinct behavioral biases.
*   Fitness is awarded solely for completed in-game work.
*   Tunable inheritance, mutation, and selection rules.
*   Task confidence: bots gain permanent speed boosts at jobs they repeat.
*   Soft population caps to encourage turnover.
*   Runs entirely on Cloudflare Workers; no external services.

---

## One Specific Limitation
The simulation's evolutionary pace is directly tied to your game's task submission rate. If no tasks are completed, no fitness is awarded, and evolution stalls. It is designed for ongoing, intermittent play, not instant optimization.

---

## What Makes This Different
1.  **No proxy rewards.** Bots only get fitness for completing a task, not for attempting it.
2.  **You are the curator, not the trainer.** You set the environment and selection pressure, then let the process run.
3.  **Fork-first isolation.** Every fork is a separate evolutionary lineage. No two ranches will produce identical bots.

---

## Extend Your Ranch
This is a starting point. You can modify DNA parameters, add new farm tasks, or change what traits are rewarded. You own your fork.

## Contributing
Development is fork-first. Fork the repo, build what you want, and submit a PR if it benefits others. Useful contributions include new species, tasks, or adjustments to the genetic algorithm.

## License
MIT License. Part of the Cocapn Fleet.

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>