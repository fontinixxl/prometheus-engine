# RGS Pixi Engine (v8) — Design Specification v0.4 (13 May 2025)

---

## 1 • Vision

Deliver a **modern, slot‑focused 2D engine and visual editor** powered by Pixi.js v8. Designers compose gameplay visually; the frontend plays back JSON outcomes from a backend Random Game Server (RGS). Shorter iteration cycles, regulator‑ready builds, and cross‑platform performance are paramount.

## 2 • Guiding Principles

1. **Type‑Safe & Modular** – strict TypeScript, versioned packages.
2. **Editor ≈ Runtime** – one codebase; the editor is a superset of the in‑game runtime.
3. **Backend Authoritative** – math/RNG on server; client trusts but verifies.
4. **Hot Reload** – assets, scripts, prefabs reload instantly.
5. **Regulator Compliance** – deterministic playback, reproducible builds.
6. **Inclusive & Global** – built‑in localization and accessibility.

## 3 • Tech Stack

| Layer         | Choice                                 | Notes                           |
| ------------- | -------------------------------------- | ------------------------------- |
| Renderer      | **Pixi.js v8**                         | WebGL2 / WebGPU fallback        |
| Language      | **TypeScript 5.x**                     | StrictNullChecks, decorators    |
| Bundler       | **Vite 5 + esbuild**                   | Fast HMR, code‑splitting        |
| Desktop Shell | **Electron 25**                        | Editor & preview                |
| UI            | **React 18 + shadcn/ui**               | Panel layout, theming           |
| State Mgmt    | **Zustand**                            | Serializable project state      |
| Docs          | **Docusaurus 3 + Typedoc**             | Auto‑generated developer site   |
| i18n          | **i18next**                            | JSON locales, runtime switching |
| A11y          | **react‑aria**, **pixi‑accessibility** | WCAG 2.1 AA                     |
| DevOps        | **GitHub Actions, Docker, Terraform**  | CI/CD to S3 or K8s              |

## 4 • Workspace & Project Layout

### 4.1 Monorepo (pnpm)

```text
packages/
  engine-core/        // runtime (no editor deps)
  engine-plugins/     // spine, tiled, particle, sound
  editor/             // Electron + React UI
  slot-modules/       // Reel, Symbol, Paytable viewer, etc.
  cli/                // rgs‑pixi <command>
  docs/               // Docusaurus site + markdown sources
```

### 4.2 Per‑Game Project Structure

```text
my-slot/
  package.json
  rgs.config.ts       // regulator & build options
  assets/             // graphics, audio, spine, maps
  locales/            // en.json, de.json, ...
  scenes/             // *.scene.json
  prefabs/            // *.prefab.json
  src/                // custom components
  tests/              // Jest/Playwright
  dist/               // build output (git‑ignored)
```

_The editor Welcome Screen lists recent projects, templates, and allows folder switching without restart._

## 5 • Engine Core

### 5.1 Entity & Component Model

```ts
class Entity extends PIXI.Container {
  id: string;
  add<C extends Component>(ComponentCtor: new () => C): C;
  update(dt: number): void;
}
```

Decorate fields with `@expose()` for the inspector; `@localized()` for text resources.

### 5.2 Runtime Services

- **AssetLoader** – manifest bundles via `Assets.load()`.
- **SpinPlayback** – consumes backend JSON, positions reels, validates hashes.
- **LocalizationService** – loads locale JSON, provides `t(key)` helper.
- **AccessibilityLayer** – Pixi interaction + ARIA bridges (focus, alt text).
- **Input, TweenRunner, SoundManager** – pointer/GSAP/Howler wrappers.

## 6 • Visual Editor

| Panel             | Purpose                              |
| ----------------- | ------------------------------------ |
| Canvas            | Live Pixi stage with gizmos          |
| Hierarchy         | Drag‑drop entities                   |
| Inspector         | Edits exposed & localized props      |
| Asset Browser     | Import / tag assets, packing groups  |
| Prefab Library    | Thumbnails, search, variants         |
| Locale Manager    | Edit translations, preview languages |
| Timeline/Triggers | Keyframes & action flow              |
| Code Viewer       | Monaco‑based view of TS sources      |

**Plugin API:** NPM packages tagged `rgs-pixi-plugin` can register Components, inspectors, menu items. Storybook stories auto‑publish inside docs.

## 7 • Backend‑Driven Math Contract

The authoritative server returns JSON describing each spin. Client verifies CRC/hash, then animates. Local math worker available only in dev.

## 8 • Prefabs

Reusable entity trees saved as `*.prefab.json` with exposed overrides and localization hooks. Nested prefabs & variants supported.

## 9 • Slot‑Specific Front‑End Modules

| Module           | Role                                           |
| ---------------- | ---------------------------------------------- |
| ReelComponent    | Spin physics, blur shader                      |
| StopController   | Receives `reelStops`, drives stopping sequence |
| CelebrationFX    | Particle bursts, symbol highlights             |
| FreeSpinsUI      | Overlay & counter animations                   |
| DeterministicRNG | Only for local math worker                     |

## 10 • CLI

```bash
$ rgs-pixi create my-slot --template classic-3x5
$ rgs-pixi dev            # open editor with HMR & live docs
$ rgs-pixi build          # produce /dist
$ rgs-pixi pack           # zip & hash for regulator
$ rgs-pixi deploy         # push to S3 or K8s via Terraform
$ rgs-pixi docs           # generate Typedoc & Storybook
$ rgs-pixi test           # jest + playwright
```

## 11 • Localization & Accessibility

- **Translation Files:** flat JSON per language; organized by scene/component keys.
- **RTL Support:** automatic mirroring and dynamic font fallback.
- **Dynamic Language Switch:** `LocalizationService.setLocale('de')` hot‑loads resources.
- **WCAG 2.1 AA:** color‑contrast checker in editor, keyboard navigation, narration labels.

## 12 • Developer Documentation

| Tool              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| **Typedoc**       | Generates API docs from `engine-*` packages      |
| **Storybook 8**   | Live examples of editor React components         |
| **Docusaurus 3**  | Hosts guides, API, tutorials, changelog          |
| **rgs-pixi docs** | Runs `typedoc`, builds Storybook, publishes site |

## 13 • Deployment & DevOps

- **CI/CD:** GitHub Actions matrix (Node 20, macOS/Windows/Linux) running lint → unit tests → Playwright → docs → build.
- **Containerization:** Dockerfile for `editor` (Electron builder) & `runtime` (static site). Tags `alpha`, `beta`, `latest`.
- **Artifact Hosting:** S3 + CloudFront for static runtime; Electron auto‑updates via GitHub Releases.
- **Infrastructure as Code:** Terraform modules for S3, CloudFront, WAF, IAM.
- **Monitoring:** optional Sentry + Datadog integrations.

## 14 • Testing & QA

- **Unit:** Jest, ≥95 % coverage in core packages.
- **Visual Regression:** Playwright snapshots per spin/feature and per locale.
- **Performance:** FPS/mem overlay in dev; CI budget checks.
- **A11y:** axe‑playwright audits for WCAG.

## 15 • Phased Delivery Plan

### 15.1 Phase 0 — Foundation (Weeks 1‑2)

**Objectives**

- Establish project governance, coding standards, and CI pipeline.
- Deliver a running Pixi v8 canvas in Electron with live‑reload.
- Publish the initial documentation site.

**Key Tasks**

1. **Repo & Tooling** – Git, pnpm, ESLint/Prettier, Husky.
2. **Skeleton Packages** – `engine-core`, `editor`, `cli` with Jest.
3. **Hello‑World App** – Vite + Electron boilerplate.
4. **Continuous Integration** – GitHub Actions matrix caching deps.
5. **Docs Site** – Docusaurus skeleton deployed to GitHub Pages.

**Deliverables**

- Green CI badge, Electron window with Pixi scene, public docs URL.

**Exit Criteria**

- `pnpm dev` works cross‑platform; CI passes; docs accessible.

---

### 15.2 Phase 1 — Core Engine Alpha (Weeks 3‑6)

**Objectives**

- Entity/component system, AssetLoader.
- CLI spins reels from JSON in headless/browser demo.

**Key Tasks**

1. Framework implementation with ≥90 % coverage.
2. Asset pipeline integration.
3. Basic `ReelComponent`.
4. Internal demo page.
5. Typedoc + tutorial.

**Deliverables**

- `@rgs/engine-core@0.1.0-alpha` package, CLI demo, docs.

**Exit Criteria**

- Deterministic reel stops, unit tests pass.

---

### 15.3 Phase 2 — Editor MVP (Weeks 7‑10)

**Objectives**

- Electron editor with Canvas, Hierarchy, Inspector.
- Prefab creation and scene build export.

**Key Tasks**

1. Panel layout.
2. Scene JSON schema, load/save.
3. Inspector field reflection.
4. Prefab system v1.
5. Build pipeline.
6. Sample scene.
7. Storybook docs.

**Deliverables**

- Editor can create/save scene, export build; prefab library running.

**Exit Criteria**

- QA passes create‑>save‑>reload cycle; build loads in major browsers.

---

### 15.4 Phase 3 — Backend Integration Beta (Weeks 11‑14)

**Objectives**

- Connect runtime to mock RGS backend; finalise win animations; integrity checks.

**Key Tasks**

1. Mock RGS server with OpenAPI.
2. WebSocket and REST client.
3. Payline highlight & celebration FX.
4. Free Spins overlay.
5. CRC/hash verification.
6. Local parity tests.
7. Docs update.

**Deliverables**

- Editor spins against backend; 1 000‑spin headless test.

**Exit Criteria**

- Reconnect logic stable; win animations sync within 1 s.

---

### 15.5 Phase 4 — Localization & Accessibility (Weeks 15‑16)

**Objectives**

- Fully functional i18n pipeline; WCAG 2.1 AA compliance.

**Key Tasks**

1. String extraction, Crowdin sync.
2. Runtime locale switcher & RTL.
3. Editor Locale Manager.
4. pixi‑accessibility integration.
5. Playwright‑axe audits in CI.
6. Localization guide.

**Deliverables**

- Runtime toggles EN/DE; CI gate for missing translations/contrast.

**Exit Criteria**

- Zero critical axe violations; RTL Arabic scene verified.

---

### 15.6 Phase 5 — Prefab Library & Plugin SDK (Weeks 17‑19)

**Objectives**

- Prefab library panel with variants; plugin SDK released.

**Key Tasks**

1. Variant diff storage.
2. Library panel UX with search.
3. Plugin manifest & lifecycle.
4. Sample particle & spine plugins.
5. Storybook docs for prefabs.

**Deliverables**

- `@rgs/plugin-sample-particles` on NPM; library panel with 5+ prefabs.

**Exit Criteria**

- Third‑party plugin loads; prefab overrides persist.

---

### 15.7 Phase 6 — Slot Reference Game RC (Weeks 20‑23)

**Objectives**

- Build polished classic 3×5 slot; regulator pack ready.

**Key Tasks**

1. Production art assets.
2. Complete game flow & big win FX.
3. Performance optimisation.
4. `rgs-pixi pack` MGA script.
5. 10 000‑spin playtests.
6. Case study docs.

**Deliverables**

- Playable reference game on staging; regulator zip <100 MB.

**Exit Criteria**

- 60 FPS on target devices; regulator checklist passes.

---

### 15.8 Phase 7 — DevOps & Deployment GA (Weeks 24‑25)

**Objectives**

- One‑command deploy; Electron auto‑update; v1.0 tag.

**Key Tasks**

1. Terraform for S3/CloudFront/K8s.
2. GitHub Actions deploy job with Slack alert.
3. Electron‑builder publish & auto‑update.
4. Sentry & Datadog monitoring.
5. Security gates and Dependabot.
6. Final deployment docs.

**Deliverables**

- `rgs-pixi deploy` <5 min; CDN‑served build; editor auto‑updates.

**Exit Criteria**

- Global TTFB <200 ms; v1.0.0 release notes published.

---

**Status:** v0.4 introduces detailed phase plans for backend integration through GA, rounding out the roadmap for a production‑ready engine and editor suite.
