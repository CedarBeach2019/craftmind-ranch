# 🌾 CraftMind Ranch

> Genetic evolution engine for Minecraft animals — breed the perfect farm workforce.

## Features

- **8 Species** — Mooshroom, Duck, Goat, Shepherd, Stallion, Falcon, Trufflehog, Rooster
- **DNA System** — Genetic traits (speed, patience, strength, intelligence) with crossover
- **Mutation Engine** — Random genetic variation with configurable rates
- **Fitness Evaluation** — Multi-category scoring for breeding decisions
- **Population Management** — Extinction protection and population caps
- **Evolution Engine** — Run generations of selective breeding
- **43 Farm Tasks** — Across categories (harvesting, herding, scouting, etc.)
- **Smart Routing** — Assign tasks to best-fit animals based on DNA

## Quick Start

```bash
npm install
node examples/demo.js    # Run standalone demo
node scripts/playtest.js # Simulated plugin test
npm test                 # Run test suite (38 tests)
```

## API Documentation

### DNA (`src/dna.js`)
| Function | Description |
|---|---|
| `createDNA(speciesId, overrides)` | Create new DNA with random traits |
| `crossoverDNA(parentA, parentB, speciesId)` | Breed two parents |
| `mutateDNA(dna)` | Apply random mutations |
| `dnaToMarkdown(dna)` | Generate DNA report |

### Species (`src/species.js`)
| Function | Description |
|---|---|
| `allSpecies()` | Get all 8 species configs |
| `getSpecies(id)` | Look up species by ID |

### Evolution (`src/evolution.js`)
| Class/Method | Description |
|---|---|
| `new EvolutionEngine(population)` | Create evolution runner |
| `engine.evolve()` | Run one generation |

### Tasks (`src/farm-tasks.js`)
| Export | Description |
|---|---|
| `TASKS` | 43 task definitions |
| `getTasksByCategory(cat)` | Filter tasks |
| `buildChain(category)` | Build task dependency chain |

### Routing (`src/routing.js`)
| Function | Description |
|---|---|
| `analyzeTask(task)` | Get task requirements |
| `assignTask(task, candidates)` | Best-fit assignment |

## Plugin Integration

```js
import { registerWithCore } from 'craftmind-ranch';
registerWithCore(core); // Registers as 'ranch' plugin
```

## Architecture

```
┌──────────────────────────────────────────────────┐
│                CraftMind Ranch                    │
├──────────────────────────────────────────────────┤
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐ │
│  │ Species  │  │   DNA     │  │  Population  │ │
│  │ Catalog  │→ │  Engine   │→ │  Manager     │ │
│  │ (8 types)│  │(breed/mut)│  │ (caps/ctrl)  │ │
│  └────┬─────┘  └─────┬─────┘  └──────┬───────┘ │
│       │              │               │         │
│       ▼              ▼               ▼         │
│  ┌──────────────────────────────────────────┐   │
│  │         Evolution Pipeline               │   │
│  │  Create → Breed → Mutate → Fitness → Evolve│  │
│  └──────────────────┬───────────────────────┘   │
│                     │                           │
│  ┌──────────┐ ┌─────┴──────┐ ┌────────────┐   │
│  │ Fitness  │ │   Task     │ │  Routing   │   │
│  │ Evaluator│ │  System    │ │  Engine    │   │
│  │          │ │  (43 task) │ │(best-fit)  │   │
│  └──────────┘ └────────────┘ └────────────┘   │
├──────────────────────────────────────────────────┤
│              registerWithCore(core)              │
└──────────────────────────────────────────────────┘
```

## Testing

```bash
npm test          # 38 tests
node examples/demo.js
node scripts/playtest.js
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed plans.

## CraftMind Ecosystem

| Repo | Description |
|------|-------------|
| [craftmind](https://github.com/CedarBeach2019/craftmind) | 🤖 Core bot framework |
| [craftmind-fishing](https://github.com/CedarBeach2019/craftmind-fishing) | 🎣 Sitka Sound fishing RPG |
| [craftmind-studio](https://github.com/CedarBeach2019/craftmind-studio) | 🎬 AI filmmaking engine |
| [craftmind-courses](https://github.com/CedarBeach2019/craftmind-courses) | 📚 In-game learning system |
| [craftmind-researcher](https://github.com/CedarBeach2019/craftmind-researcher) | 🔬 AI research assistant |
| [craftmind-herding](https://github.com/CedarBeach2019/craftmind-herding) | 🐑 Livestock herding AI |
| [craftmind-circuits](https://github.com/CedarBeach2019/craftmind-circuits) | ⚡ Redstone circuit design |
| [**craftmind-ranch**](https://github.com/CedarBeach2019/craftmind-ranch) | 🌾 Genetic animal breeding |
| [craftmind-discgolf](https://github.com/CedarBeach2019/craftmind-discgolf) | 🥏 Disc golf simulation |

## License

MIT
