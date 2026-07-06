# Portfolio Recon — read-only investigation

Vanilla HTML/CSS/JS, no build step. Everything below is grounded in the actual code (`file:line` refs).

## 1. The oneko cat — why it's laggy

- **Where:** all in `oneko.js` (self-invoking IIFE), loaded at `index.html:654` (`<script defer src="oneko.js">`). CSS is just `#oneko-cat` at `style.css:102` (32×32, `image-rendering:pixelated`, `will-change:transform`, **no transition**).
- **Not a GIF, not a sprite sheet.** There's no image asset at all. The cat is a `<canvas>` drawn **procedurally** with Canvas 2D rounded-rects in `draw()` (`oneko.js:57-125`), recolored from CSS vars via `colors()` (`oneko.js:38-46`). That's actually its best feature — it re-themes for free. "Frames" are code branches (sleep/idle/run); the walk has only **2 leg poses** (`frame ^= 1`, `oneko.js:145`).
- **Motion:** `requestAnimationFrame` + a fixed-step accumulator, `STEP = 100ms`, `SPEED = 12px` per step (`oneko.js:15-16,127-149`). rAF itself is fine.
- **Root cause of the lag (the important bit):** `place()` — the `translate` — is called **only inside** the `while(acc >= STEP)` block (`oneko.js:146`). So position updates at **10 fps**: the cat freezes for 6–14 refresh frames, then hard-snaps 12px, against an otherwise smooth page. Position *and* the leg toggle are locked to the same 10Hz clock, so the gait flip-flops in the same coarse steps → reads as "skipping." Occasionally `while(acc>=STEP)` runs 2+ steps in one frame → a visible lurch. The `pixelated` blockiness is aesthetic, **not** the lag.

## 2. The slime runner ("Slime Hop")

- **Where:** one revealing-module IIFE `var Game = (…)()` at `script.js:328-541`; exposes only `{bind, flap, close, isOpen}` (`script.js:540`). It's a slime-reskinned Chrome dino.
- **Loop:** `requestAnimationFrame` with a fixed-timestep accumulator (`STEP = 1000/60`, dt-clamped to 100ms, max 5 substeps), defined inline in `start()` (`script.js:420-429`). Torn down via `cancelAnimationFrame(raf)` in `stop()` (`script.js:490`).
- **Rendering:** **Canvas 2D**, DPR-scaled (`#game-canvas`, `index.html:600`). Only the play field is canvas; idle/game-over are DOM overlays (`#game-idle`/`#game-over`).
- **Structure:** all state in one object `g` built in `start()` (`script.js:411-416`); clean `step()` (physics/spawn/score/collision, `432`) vs `draw()` (render, `455`) split. Difficulty config `DIFF` is a **module-global** at `script.js:25-29`.
- **Input:** global keydown (`script.js:550-553`, gated on `Game.isOpen()`) maps Space/ArrowUp→`flap`, Esc→`close`; canvas click→`flap`. `flap()` doubles as start-from-idle. Coyote-time jump guard at `script.js:487`.
- **Collision:** AABB with hand-tuned forgiveness insets (`script.js:448-452`).

## 3. The game window — how swappable it is today

- **DOM (`index.html:587-635`), all styling inline:** `#game-modal` backdrop → `#game-panel` window (`width:min(600px,96vw)`, 3px border, pixel drop-shadow) → header (`▸ SLIME HOP` title, score/best, reset/close) → play-frame div → `#game-canvas` (**hardcoded `height:300px`**) + idle/over overlays → footer hint.
- **`style.css` has zero game rules** (`grep game|canvas` → 0 hits); every value is inline. Two openers share `.game-open` (hero card `index.html:114`, float mascot `:554`).
- **Coupling that blocks a carousel today:**
  - Hardcoded ids everywhere (`el()` at `script.js:341-343`, plus `#over-*`, `#diff-*`, `#game-*` buttons) — two modules can't share these.
  - **No teardown path:** `bind()` (`script.js:510-537`) attaches listeners once and never removes them; open/close just toggle `modal.hidden`. Plus an **untracked `wait()` rAF** in `open()` (`script.js:378-382`) that's never cancelled.
  - Chrome text (title/hint/score labels) is Slime-hardcoded; key router is Slime-hardcoded; single `cg-best` localStorage key.
- **Good seams:** the `step()`/`draw()` split, the fixed-timestep loop shell, and the `state` machine are exactly the interface boundary you'd wrap a module around. The header row is the natural home for ◀ ▶.

## 4. Theming

- **Setup:** flat set of `--var`s on `:root` (= Everforest Light Vibrant default, `style.css:8-12`), overridden by `html[data-theme="…"]` blocks (`style.css:13-17`). No class-based theming.
- **Switcher:** toggles `data-theme` on `<html>`, persists to localStorage `cg-theme`, no-flash inline script at `index.html:10-17`. `#dark-btn` flips light↔dark via `DARK_MAP` (`script.js:20-24`). Logic in `initTheme` (`script.js:58-88`).
- **Four Everforest variants — confirmed & wired:** `ef-light-vibrant` (`:root` default), `ef-dark-vibrant`, `ef-light-soft`, `ef-dark-soft` (buttons `index.html:567-570`). Plus two Catppuccin as a bonus. ⚠️ Note: `ef-light-vibrant` has **no explicit `[data-theme]` block** — it relies on falling through to `:root`.
- **Variables a new game should use** (the runner already reads `--ink`, `--accent`, `--accent-2`, `--grid` via `getComputedStyle`):

  | Role | Vars |
  |---|---|
  | Backgrounds | `--bg`, `--bg-1`, `--bg-2`, `--bg-inset` |
  | Text | `--fg`, `--fg-strong`, `--fg-muted` |
  | Borders | `--line`, `--ink` |
  | Accents | `--accent` (green), `--accent-2` (aqua), `--accent-soft`, `--on-accent` |
  | Misc | `--shadow`, `--grid`, `--liquid-1/2` |

  ⚠️ **No semantic `--red/--green/--danger/--success` vars exist.** The runner's difficulty colors are **hardcoded hex** (`#8DA101/#DFA000/#F57D26`, `script.js:25-29`) and do *not* follow the theme — don't repeat that pattern in a new game.

## 5. Assets & dependencies

- **Truly vanilla:** no `package.json`, no `node_modules`, no bundler/config. Just `index.html`, `style.css`, `script.js`, `oneko.js`, `favicon.svg`, `assets/`.
- **Only external dependency: Google Fonts** (`index.html:33-35` — Bricolage Grotesque, Hanken Grotesk, Pixelify Sans). Everything else is self-hosted. No CDN JS libs at all.
- **Assets:** `assets/certs/*.jpg` + `assets/badges/*.png` are the live portfolio images (8 refs). ⚠️ **`assets/images/` (avatar.png + a duplicate badges/ + certificates/) is referenced 0 times** — stale/orphaned tree, safe to ignore or clean up. The cat and game use **no** image assets (both procedural canvas).

---

## Recommendation (a): make the cat snappy

The fix is small — **decouple rendering from the 10Hz sim**, keep the procedural draw (so it keeps theming for free). Don't add a CSS transition, and don't switch to a PNG sprite sheet (that would kill the per-theme recolor).

1. **Render every rAF frame; integrate position with real `dt`.** Rewrite `tick()` so `place()` runs each frame at the same effective speed (`SPEED/STEP*1000` = 120 px/s), and keep a 100ms accumulator **only** for the gait toggle + idle/sleep counters. This alone removes the 12px snap. ~15 lines.
2. **Clamp `dt`** (`if(dt>100) dt=100`) to kill the post-tab-switch lurch — same guard the runner already uses (`script.js:423`).
3. **Expand the gait to 4 poses** (add two branches in the run block `oneko.js:97-105`) so "properly animated" holds now that legs cycle independent of framerate.
4. Leave `image-rendering:pixelated` alone (it's the aesthetic, not the lag); optional HiDPI crispness via `cat.width = 32*dpr` + `ctx.scale(dpr,dpr)`.

Steps 1–2 fix the reported lag; 3 makes the walk cycle read as intentional.

## Recommendation (b): swappable pet / runner / clicker carousel

The seams already exist. Wrap each game behind a tiny contract and drive them from a host; put ◀ ▶ in the header, turn the play-frame div into an empty mount slot.

**Module contract:**
```js
{ id, title, hint, showScore,
  mount(container, theme),   // builds its OWN canvas/overlays inside container, starts its rAF
  destroy(),                 // cancels every rAF/interval + empties container
  onKey(e) -> bool,          // returns true if it consumed the key
  reset() }
```

**Host (~30 lines):** a `Games[]` registry + `switchTo(i)` that calls `active.destroy()`, `host.innerHTML=''`, then `mount()`s the next module and updates the chrome (title/hint/score labels — currently Slime-hardcoded at `index.html:591,593-594,633`).

**Least-churn trick — listeners die with the DOM:** have each module attach *all* its listeners to elements *inside* `container`. Then `destroy()` = cancel rAFs + `container.innerHTML=''`, and every click/button/slider listener is GC'd for free — that kills the current "listeners never removed" leak (`bind()`, `script.js:510-537`). The host owns just **one** `window` keydown that routes: Esc→close, `active.onKey(e)` (Slime consumes Space/ArrowUp), else ArrowLeft/Right→switch.

**Wrapping the existing runner (smallest diff):** move the slime markup into a template string that `SlimeModule.mount()` injects; make `el()` query *within* container; add `destroy()` = existing `stop()` **+ cancel the untracked `wait()` rAF** (`script.js:378-382`); `step()`/`draw()`/`loop` untouched.

**Pet slot:** refactor `oneko.js`'s IIFE into a `createOneko({container,bounds})` factory (not a singleton) reusing the procedural `draw()` — a second bounded instance that wanders inside the slot. The page-wide cat keeps running independently.

**Clicker slot:** simplest module and the best test of the contract — it uses `setInterval` for idle income, which **must** be cleared in `destroy()`.

**Pitfalls (all real here):** leaked timers (the untracked `wait()` rAF + any future interval); shared `#game-canvas` id — each module builds its own canvas and you drop the single-canvas reacquire hack (`script.js:456-460`); namespace bests as `cg-best-<id>`; read live theme vars via `getComputedStyle` instead of hardcoding hex.

**Blast radius:** HTML — add ◀▶ + dynamic title/hint, empty the play slot; JS — ~30-line host + `destroy()` on `Game`; CSS — none required.
