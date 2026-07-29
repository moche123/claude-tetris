# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Classic Tetris implemented in vanilla JavaScript with HTML5 Canvas. No build process, no dependencies, no package.json. Three files: `index.html`, `style.css`, `game.js`.

## Running

No build/install step. Either:

```bash
start index.html       # open directly (Windows)
```

or serve statically (recommended, avoids file:// canvas quirks):

```bash
npx serve .
python3 -m http.server 8000
php -S localhost:8000
```

No test suite, no linter configured.

## Architecture

All game logic lives in `game.js` (~300 lines, single file, no modules). Key pieces:

- **Board model**: `board` is a `ROWS × COLS` matrix (20×10). Each cell is `0` (empty) or `1-7` (color index identifying which piece locked there). `COLORS[]` maps index → hex color.
- **Pieces**: `PIECES[]` defines the 7 tetrominoes as square matrices (index 0 unused/null so piece type == array index == color index). `randomPiece()` deep-copies a shape and centers it at spawn.
- **Rotation**: `rotateCW(shape)` does matrix transpose+reverse (no per-piece rotation states, one generic algorithm for all shapes). `tryRotate()` applies it to `current` and attempts wall kicks via offsets `[0, -1, 1, -2, 2]`, falling back to no-op if every kick collides.
- **Collision**: `collide(shape, ox, oy)` checks bounds and overlap against `board`. Reused for movement, rotation, ghost-piece projection, and spawn game-over detection.
- **Game loop**: `loop(ts)` runs via `requestAnimationFrame`, accumulates `dropAccum` and drops the piece one row once it exceeds `dropInterval`. `dropInterval` shrinks as level increases (`max(100, 1000 - (level-1)*90)` ms).
- **Locking/clearing**: `lockPiece()` → `merge()` (bakes current piece into `board`) → `clearLines()` (bottom-up scan, splices full rows, unshifts empty rows, updates score/level) → `spawn()` (promotes `next` to `current`, generates new `next`, checks game-over collision at spawn position).
- **Scoring**: `LINE_SCORES = [0, 100, 300, 500, 800]` indexed by lines cleared at once, multiplied by `level`. Hard drop adds 2 pts/row dropped, soft drop adds 1 pt/row.
- **Rendering**: `draw()` clears and redraws grid + locked board + ghost piece (`globalAlpha 0.2`, computed via `ghostY()` which projects `current` straight down) + `current` piece, every frame. `drawNext()` renders the preview canvas separately.
- **State**: module-level `let` variables (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, timing vars) hold all game state — no framework, no classes.
- **Input**: single `keydown` listener switches on `e.code` (arrows + `KeyX` for rotate + `Space` for hard drop + `KeyP` for pause), gated by `paused`/`gameOver` checks.

Tunable constants at the top of `game.js`: `COLS`, `ROWS`, `BLOCK` (px per cell), `COLORS`, `LINE_SCORES`, `dropInterval`. If `COLS`/`ROWS`/`BLOCK` change, the `<canvas id="board">` `width`/`height` in `index.html` must be updated to match (`COLS × BLOCK` and `ROWS × BLOCK`).
