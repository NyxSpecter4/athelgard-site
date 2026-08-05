# 🌊 OceanPulse

**A 3D Marine Wildlife MMO** — Explore real-world sanctuaries, document ocean life, and build the ultimate sighting collection.

Built by Captain (nyxspecter4) and team, extending the bountywarz 3D engine for underwater worlds.

---

## 🚀 Quick Start

```bash
# 1. Clone and enter the repo
cd oceanpulse

# 2. Install dependencies (same stack as bountywarz)
npm install three

# 3. Serve with any static server
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` and dive in.

---

## 🏗️ Architecture

```
oceanpulse/
├── engine/
│   └── three-adaptor.js        # Core 3D engine (adapted from bountywarz)
├── worlds/
│   └── underwater.js            # Underwater environment renderer
├── wildlife/
│   └── animal.js                # Whale, Dolphin, Shark entity system
├── data/
│   └── sanctuaries.json         # Real-world sanctuary data (GPS, biomes, species)
├── cards/
│   └── sighting-card.js         # Collectible card system with rarity
├── athelgard/
│   └── marine-biologist.js      # AI companion dialogue system
├── utils/                       # Shared utilities (math, GPS helpers)
├── assets/                      # Textures, models, sounds (populate as needed)
└── index.html                   # Entry point (create your own)
```

### Module Map

```
┌─────────────────┐
│   index.html    │  Entry point — canvas + UI overlay
└────────┬────────┘
         │
    ┌────▼────┐
    │  Engine │  OceanPulseEngine (three-adaptor.js)
    │ Three.js│  Scene, camera, renderer, underwater fog, caustics
    └────┬────┘
         │
    ┌────┴────┐
    │  World  │  UnderwaterWorld (worlds/underwater.js)
    │ Seabed, │  Kelp, bubbles, light rays, particles
    │ kelp,   │
    │ bubbles │
    └────┬────┘
         │
    ┌────┴────┐
    │ Wildlife│  MarineAnimal base class (wildlife/animal.js)
    │ Whale   │  + Whale, Dolphin, Shark subclasses
    │ Dolphin │  GPS mapping, movement patterns, animation
    │ Shark   │
    └────┬────┘
         │
    ┌────┴────┐
    │  Cards  │  SightingCard (cards/sighting-card.js)
    │ Collect │  Rarity tiers, stats, lore, traits
    │ & Trade │  PlayerCollection, CardPack
    └────┬────┘
         │
    ┌────┴────┐
    │  A.I.   │  MarineBiologist (athelgard/marine-biologist.js)
    │ Dr.Marin│  Dialogue system, identification, lore, conservation
    └─────────┘
```

---

## 🗺️ Sanctuaries

| Sanctuary | Location | Key Species | Difficulty |
|-----------|----------|-------------|------------|
| **Monterey Bay** | 36.8°N, 121.9°W | Humpback, Blue Whale, Great White, Dolphin | Beginner |
| **Great Barrier Reef** | 18.3°S, 147.7°E | Whale Shark, Tiger Shark, Humpback, Orca | Intermediate |
| **Galápagos** | 0.95°S, 90.97°W | Hammerhead, Whale Shark, Sperm Whale, Orca | Advanced |

All coordinates, bounding boxes, and species abundance data are real. GPS in-game maps to actual sanctuary boundaries.

---

## 🐋 Wildlife System

### Animal Classes

```javascript
import { Whale, Dolphin, Shark } from './wildlife/animal.js';

// Spawn a humpback whale at Monterey Bay coordinates
const whale = new Whale({
  subtype: 'humpback',
  lat: 36.8007,
  lon: -121.9473,
  depth: -15,
  cruiseSpeed: 3,
  waypoints: [
    { x: 0, y: -15, z: 0 },
    { x: 50, y: -20, z: 30 },
    { x: -30, y: -10, z: 60 }
  ]
});

// Add to engine
engine.add(whale);
engine.onUpdate((time, delta) => whale.update(time, delta));
```

### Movement Patterns

- **Swimming** — Default cruise, follows waypoint patrols
- **Breaching** — Launches toward surface (whales, dolphins)
- **Diving** — Descends to deeper depth (all species)
- **Feeding** — Slow circling, surface lunging (baleen whales)
- **Resting** — Stationary or slow drift (sharks, some whales)

### GPS Mapping

Animal positions in-world map 1:1 to real GPS coordinates within sanctuary bounding boxes. Use `animal.setGPS(lat, lon)` to update real-world position.

---

## 🃏 Sighting Cards

Every animal encounter generates a collectible card:

```javascript
import { SightingCard, CardPack, PlayerCollection } from './cards/sighting-card.js';

// From a live encounter
const card = new SightingCard({
  species: 'whale',
  subtype: 'humpback',
  name: 'Echo',  // animal's given name
  lat: 36.8007,
  lon: -121.9473,
  depth: -15,
  behavior: 'breaching'
});

console.log(card.getDisplayName());  // [Uncommon] Echo the Humpback Whale
console.log(card.getScore());        // 347

// Collection management
const collection = new PlayerCollection();
collection.addCard(card);
console.log(collection.getTopCards(5));
```

### Rarity Tiers

| Tier | Color | Drop Rate | Glow |
|------|-------|-----------|------|
| Common | Gray | 55% | None |
| Uncommon | Green | 25% | Low |
| Rare | Blue | 12% | Medium |
| Epic | Purple | 6% | High |
| Legendary | Gold | 2% | Intense |

---

## 🤖 Marine Biologist AI (Dr. Marin)

The AI companion system — reskinned from bountywarz's Athelgard mentor:

```javascript
import { MarineBiologist } from './athelgard/marine-biologist.js';

const drMarin = new MarineBiologist('Dr. Marin');

// First greeting
const greeting = drMarin.greet('player-123', { collectionSize: 5 });
console.log(greeting.text);

// Respond to player message
const response = drMarin.talk('player-123', 'How do I find rare whales?', { collectionSize: 5 });
console.log(response.text);
// → "Whales migrate seasonally. In spring, head to Monterey Bay for humpbacks..."

// Live sighting commentary
const commentary = drMarin.onSighting('player-123', {
  species: 'shark',
  subtype: 'great_white',
  rarity: 'rare',
  behavior: 'breaching'
});
```

Features:
- **Intent detection** — Recognizes player questions and routes to appropriate topics
- **Context memory** — Remembers player history, first sightings, affinity score
- **Lore generation** — Random marine facts and species-specific stories
- **Conservation messaging** — Educates about real ocean issues
- **Personality scaling** — Gets more enthusiastic as player affinity increases

---

## 🛠️ Development Guide

### Adding a New Species

1. Extend `MarineAnimal` in `wildlife/animal.js`
2. Override `_buildMesh()` for species-specific geometry
3. Override `_animate()` for swimming style (tail motion, fin movement)
4. Add to `sanctuaries.json` species pool
5. Add lore entries in `marine-biologist.js`

### Adding a New Sanctuary

1. Add entry to `data/sanctuaries.json` with real coordinates, bounding box, species
2. Create biome renderer in `worlds/` (optional — kelp forest, coral reef, etc.)
3. Add biologist dialogue nodes for sanctuary-specific tips

### Adding a New Card Trait

1. Add to `allTraits` array in `cards/sighting-card.js`
2. Add to lore database in `marine-biologist.js`
3. Update rarity calculation if it affects scoring

---

## 🤝 Contributing

### For Cindy (and all collaborators)

OceanPulse is designed to be **modular and approachable**. Every module is a standalone ES6 module with a single responsibility.

**Jump-in points:**
- 🎨 **Artist?** Add textures to `assets/`, improve `animal.js` mesh generation
- 🎮 **Gameplay?** Extend the card system, add achievements, design missions
- 🌐 **Backend?** Wire `PlayerCollection` to Supabase, add real-time multiplayer
- 📝 **Writer?** Add lore entries to `marine-biologist.js`, write card flavor text
- 🐋 **Marine bio?** Review sanctuary data, add real species stats, verify conservation facts

**Code style:**
- ES6 modules, no bundler required (use `import`/`export`)
- Comment generously — explain WHY, not just WHAT
- One class per file, clear constructor signatures
- Use `THREE.js` conventions for 3D objects

### Branch Strategy

```
main          ← stable, deployable
  develop     ← integration branch
    feature/wildlife-octopus
    feature/sanctuary-arctic
    feature/multiplayer-sync
```

---

## 📦 Dependencies

- `three` (^0.160+) — 3D engine
- `supabase-js` (optional) — backend, auth, real-time
- `vercel` (optional) — hosting

No build step required. Pure ES6 modules served statically.

---

## 🎯 Roadmap (2-Week Sprint)

### Week 1 — Foundation ✅
- [x] Project structure and engine adapter
- [x] Underwater environment (fog, lighting, particles)
- [x] Animal base classes + Whale/Dolphin/Shark
- [x] Sanctuary data with real coordinates
- [x] Sighting card system with rarity
- [x] Marine Biologist AI dialogue

### Week 2 — Polish + Ship
- [ ] Player controller (swim, dive, scan)
- [ ] Supabase integration (accounts, collections, leaderboard)
- [ ] Multiplayer sync (WebRTC or socket.io)
- [ ] Sound design (underwater ambience, whale songs)
- [ ] Mobile controls (touch, gyro)
- [ ] First community event: "Great White Watch" at Monterey Bay

---

## 🌊 Credits

- **Captain** (nyxspecter4) — Engine, architecture, direction
- **Cindy** (CindyL789) — Collaboration partner, wildlife data, design
- **Dr. Marin** — AI companion (powered by Athelgard lineage)
- **Three.js Community** — The underwater rendering pipeline
- **Real Sanctuaries** — Monterey Bay, Great Barrier Reef, Galápagos

---

## 📜 License

MIT — Build open, share freely, protect the ocean.

> *"The ocean is the largest unexplored place on Earth. We're not even trying to map it — we're trying to love it into protection."* — Dr. Marin

---

## 🔗 Related

- **bountywarz** — Parent project, 3D drone simulator engine
- **athelgard.io** — Ethical bounty hunting guide (sister site)
- **kinetigor.com / makothoth.dev** — Future company homes

---

*OceanPulse is currently in pre-alpha. Break things, report issues, and remember: the best sightings happen when you're not looking for them.* 🐋✨
