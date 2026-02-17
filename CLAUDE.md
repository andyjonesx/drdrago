# CLAUDE.md

## Project Overview

**Dr. Drago's Madcap Chase** (aka "Drago") is a browser-based board game — a recreation of the retro DOS game of the same name. Players race around a map of Europe, buy properties at cities, collect cards, and compete to become the richest. The game is fully client-side with no backend server.

## Tech Stack

- **Language:** Vanilla JavaScript (ES5), HTML5, CSS3
- **Rendering:** HTML5 Canvas API via a custom animation framework (HAF)
- **UI Library:** Custom `OZ` utility library (`oz.js`) providing class system, events, DOM utilities, audio, and AJAX
- **Build tools:** None — the project is deployed as static HTML/JS/CSS with no transpilation or bundling
- **Package manager:** None — no `package.json`, no npm dependencies
- **Testing:** No formal test suite
- **Linting:** No linting or formatting tools configured

## Repository Structure

```
drdrago/
├── game/                    # Main game application (this is what users play)
│   ├── js/                  # 37 JavaScript modules (~5,000 lines total)
│   │   ├── oz.js            # OZ utility library (class system, events, DOM)
│   │   ├── haf.js           # HAF animation/rendering engine
│   │   ├── game.js          # Main Game object and initialization
│   │   ├── player.js        # Player state, cards, movement
│   │   ├── card.js          # Card definitions and mechanics
│   │   ├── race.js          # Turn/race management
│   │   ├── map.js           # Map display and tile rendering
│   │   ├── tiles.js         # Tile sheet management
│   │   ├── movement.js      # Player movement logic
│   │   ├── keyboard.js      # Keyboard input handling
│   │   ├── port.js          # Viewport management
│   │   ├── slot.js          # Slot machine minigame
│   │   ├── status.js        # Status bar display
│   │   ├── menu*.js         # Menu system (main, player)
│   │   ├── setup.js         # Player selection/naming
│   │   ├── buysell*.js      # Trading interface
│   │   ├── finish*.js       # Game completion logic
│   │   └── ...              # Other UI and interface modules
│   ├── data/                # Pre-compiled game data
│   │   ├── graph.js         # Map graph (700 nodes, city connections)
│   │   ├── animations.js    # Animation definitions
│   │   └── views.js         # View/interface data
│   ├── img/                 # Graphics assets (sprites, UI, backgrounds)
│   ├── sound/               # Audio (music and sound effects)
│   ├── help/                # In-game help documentation
│   ├── index.html           # Game entry point (loads all scripts via <script> tags)
│   ├── style.css            # All game styling
│   └── TODO                 # Game development tasks
│
├── server/                  # Data conversion tools (v8cgi scripts)
│   ├── lib/                 # Utility libraries for binary data parsing
│   ├── *.js                 # Conversion scripts (graph2json, sbs2png, etc.)
│   ├── *.sh                 # Shell scripts for batch processing
│   ├── MAP/, SBS1/, VIEWS/  # Source data directories
│   └── players/             # Compiled player sprites
│
├── MAP/                     # Standalone map viewer tool
├── SBS/                     # Standalone sprite viewer tool
├── STR/                     # Standalone graph viewer tool
├── index.html               # Root entry point
├── oz.js                    # Root copy of OZ library
└── canvas.png               # Screenshot/preview image
```

## Architecture

### Core Frameworks

**OZ Library** (`game/js/oz.js`): Provides the foundational class system used throughout:
- `OZ.Class(parent)` — class creation with prototype inheritance
- `OZ.Event` — publish/subscribe event system
- `OZ.DOM` — DOM manipulation utilities
- `OZ.Audio` — audio playback with background music queue
- `OZ.Request` — AJAX-style data fetching
- `OZ.Touch` — unified mouse/touch event handling

**HAF Engine** (`game/js/haf.js`): Custom canvas rendering/animation framework:
- Layer-based rendering (`LAYER_BG`, `LAYER_PLAYERS`, `LAYER_TOP`, `LAYER_WIN`)
- Sprite and actor management
- `requestAnimationFrame`-driven game loop at 60 FPS
- Dirty-rectangle optimization (`DIRTY_CHANGED`, `DIRTY_ALL`)
- Clear modes (`CLEAR_NONE`, `CLEAR_ACTORS`)

### Game Object (`game/js/game.js`)

The `Game` singleton is the central state container:
- `Game.init()` — bootstraps the engine, loads tiles and map data
- `Game.play()` — starts a game session
- `Game.save()` / `Game.load()` — persistence via `localStorage.dragoSave`
- `Game.players[]` — array of active players
- `Game.cards[]` — pool of available cards
- `Game.engine` — HAF rendering engine instance

### Module Loading

Scripts are loaded via `<script>` tags in `game/index.html` in dependency order. There is no module bundler. The load order matters — modules attach themselves to the global `Game` namespace.

### Input System

Input flows through a stack-based handler system:
- `Game.Keyboard` manages a stack of `IInputHandler` implementations
- Handlers receive `handleInput(input, param)` calls
- Input types: `INPUT_KEY`, `INPUT_LEFT/RIGHT/UP/DOWN`, `INPUT_ENTER`, `INPUT_ESC`

### Data Model

**Graph:** 700+ nodes representing European cities and connections. Each node has:
- x, y coordinates (tile-based)
- 4 directional neighbors (up, right, down, left)
- Type: `blue`, `red`, `golden`, `purple`, `city`, or `view`
- Transportation flags and flight connections

**Tiles:** 18 sprite sheets × 192 tiles = ~3,456 tiles. Each tile is 16×16 pixels. The map is a 256×256 grid with two layers (background + overlay).

## Coding Conventions

### Class Definitions
```javascript
Game.MyClass = OZ.Class().extend(Game.ISomeInterface);
Game.MyClass.prototype.init = function() { /* constructor */ };
Game.MyClass.prototype._privateMethod = function() { /* ... */ };
```

### Naming
- **Private methods/properties:** prefixed with `_` (e.g., `_load`, `_remain`)
- **Constants:** `UPPER_CASE` (e.g., `Game.TILE`, `Game.LAYER_BG`)
- **Functions/variables:** `camelCase`
- **Classes:** `PascalCase` under `Game.*` namespace (e.g., `Game.Player`, `Game.Card.Sugar`)

### Patterns
- Event-driven communication via `OZ.Event.add()` / `OZ.Event.fire()`
- Interface pattern: `IInputHandler`, `IAsync` define contracts
- Singleton pattern for `Game` object
- All game classes attach to the global `Game` namespace

### Style
- ES5 syntax throughout (no arrow functions, `let`/`const`, classes, or template literals)
- Prototype-based inheritance via `OZ.Class`
- No semicolons are NOT omitted — semicolons are used consistently
- Tab indentation

## Running the Game

The game is a static site. Serve the `game/` directory with any HTTP server:

```bash
# Example using Python
cd game && python3 -m http.server 8000

# Example using Node.js
npx serve game
```

Then open `http://localhost:8000` in a browser.

## Data Conversion Tools

The `server/` directory contains scripts that convert original DOS game binary data into JSON for the browser game. These use `v8cgi` (a server-side JS engine) and are not needed for normal development — the compiled JSON files already exist in `game/data/`.

Key conversion scripts:
- `graph2json.js` — converts binary STR graph data to `graph.json`
- `animations2json.js` — converts animation data to `animations.json`
- `views2json.js` — converts view data to `views.json`
- `sbs2png.js` — converts SBS sprite format to PNG
- `merge-sprite.js` / `merge-map.js` — merge sprite/map tiles

## Game State Persistence

Game state is saved to `localStorage` under the key `dragoSave` as JSON. The save data includes:
- Current month/turn
- All player states (position, money, cards, properties)
- Race state
- Viewport center position

## Key Constants

- `Game.TILE = 16` — tile size in pixels
- Starting money: $30,000 per player
- Starting position: node index 399
- 8 playable characters
- 20 card types (movement, slot, and special cards)
