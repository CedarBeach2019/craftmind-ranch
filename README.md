# craftmind-ranch

A genetic evolution engine for Minecraft bot populations. Bots with unique DNA compete, breed, and specialize in farm tasks over generations.

**Limitation:** This manages the evolution logic only. You'll need to connect it to your own bot system to execute tasks in-game.

## Try it now
Live instance: https://the-fleet.casey-digennaro.workers.dev/ranch  
Watch populations evolve, export generation data, or fork your own instance.

## Quick start
1. **Fork** this repository
2. Deploy to Cloudflare Workers (zero dependencies)
3. Edit `src/dna.js` to adjust traits or mutation rates

## How it works
Each bot has a DNA blueprint controlling movement, task preference, learning rate, and behavior quirks. Bots earn fitness by completing farm work. High fitness bots breed, passing mixed DNA with random mutations to offspring. Over generations, populations naturally specialize.

## What makes this different
- Runs entirely on Cloudflare Workers – no local install or databases
- Fork-first philosophy – you own your entire ranch, modify freely
- Transparent evolution – all behavior from expressed genetic traits, inspect any bot's DNA
- Zero dependencies – ~1200 lines of plain JavaScript

## Key features
- Full genetic DNA system for heritable bot traits
- 8 base species with unique evolutionary paths
- Fitness awarded only for completed in-game work
- Configurable inheritance, mutation, and selection values
- Task confidence building – bots prefer jobs they're good at
- Population caps prevent stagnation

## Extend your ranch
This is a playground, not a finished game. Modify DNA parameters, add new farm tasks, change fitness rules, or invent new species. Make evolution favour lazy bots or set mutation rates to chaotic levels.

## Contributing
This project follows a fork-first philosophy. Fork the repo, build what you want, and submit a PR if it benefits others. We welcome new species, tasks, and genetic algorithm adjustments.

## License
MIT License. Part of the Cocapn Fleet.

**Attribution**: Superinstance & Lucineer (DiGennaro et al.)

---

<div align="center">
  <a href="https://the-fleet.casey-digennaro.workers