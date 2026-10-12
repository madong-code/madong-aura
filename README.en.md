# MaDong-Aura

> [中文 → README.md](./README.md)

---

**MaDong-Aura** is the companion frontend UI for the [MaDong Admin](https://github.com/madong-code/madong-admin) backend framework. It is also a standalone admin template. The business layer structure, API contracts, and plugin mechanism are fully aligned with the reference project madong-single — only the container layout is borrowed from art-design-pro, enabling dual-UI maintenance and seamless plugin reuse.

- 🏠 **Repository:** <https://github.com/madong-code/madong-aura>

### ✨ Features

- **🔌 Plugin System** — Plugins under `src/plugin/` support dynamic registration via backend menus or static declaration via `routes/index.ts` in dev. Business components, APIs, and mocks can be packaged independently per plugin
- **🎯 Standalone Template** — Built-in Nitro Mock server (port 5320) with API contracts matching the real backend. Full functionality without running the backend
- **🧩 CRUD Components** — Ready-to-use list/form/dialog/drawer components with full vxe-table support (virtual scroll, cell editing, tree tables, etc.)
- **🎨 Designers** — Integrated VForm3 form designer (UMD) and LogicFlow flow designer (ESM), ready out of the box
- **🌐 I18n** — Complete zh-CN / en-US bilingual support. Plugin i18n auto-loaded by directory convention
- **🔐 Access Control** — Frontend/backend permission modes. Role permission codes, button-level auth via `v-access` / `v-roles` directives
- **📦 Dual Build Modes** — Independent domain (`pnpm build`) and same-domain subpath (`pnpm build:integrated`) deployments supported

### 🛠 Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Vue 3.5 · TypeScript · Vite 7 |
| State | Pinia 3 |
| UI | Element Plus 2.13 (on-demand) · Tailwind CSS v4 · ReKa UI |
| Tables | vxe-table 4 |
| Charts | ECharts 6 |
| Rich Text | Tiptap 3 · WangEditor 5 |
| Flow | LogicFlow |
| Form Designer | VForm3 (UMD) |
| i18n | Vue I18n 11 |
| Mock | Nitro 2 (adminapi-aligned contracts) |
| Router | Vue Router 4 |
| HTTP | Axios |

### 🚀 Quick Start

**Requirements:** Node.js >= 22 · pnpm >= 10

```bash
# Install dependencies
pnpm install

# Start dev (frontend :5500 + Mock :5320 auto-launched)
pnpm dev
```

**Default login:** `admin / 123456` (parameter name is `user_name`)

Manual Mock commands:

```bash
pnpm mock          # Start Mock server only
pnpm mock:build    # Build Mock artifacts
```

### 📦 Build & Deploy

| Mode | Command | base | API | Use Case |
| --- | --- | --- | --- | --- |
| Dev | `pnpm dev` | `/` | Mock `:5320` | Local dev · Learning |
| Prod (standalone domain) | `pnpm build` | `/` | `/adminapi` (gateway forward) | Independent deployment |
| Prod (same domain) | `pnpm build:integrated` | `/admin/` | relative `/adminapi` | Embedded under PHP subpath |

**Switch to real backend:** Set `VITE_NITRO_MOCK = false` in `.env.development`. The proxy target points to the real backend (default `http://127.0.0.1:8500`). No frontend code changes needed.

### 📂 Directory Structure

```
madong-aura/
├── build/plugins/          # Vite plugins (Nitro Mock auto-launch, UMD static asset handling)
├── tooling/mock/           # Nitro Mock server (:5320, adminapi-aligned contracts)
│   ├── handlers/           # Route handlers (auth / system / plugin / content …)
│   └── utils/admin/        # Mock datasets, menu seeds, JWT utilities
├── lib/                    # External designer static assets
│   ├── visual-form/        # VForm3 UMD form designer
│   └── visual-flow/        # LogicFlow ESM flow designer
├── public/                 # Static assets (favicon, logo)
└── src/
    ├── core/               # Framework adapter layer (no business dependency)
    │   ├── ui/             # Container UI: layouts / popups / form primitives
    │   ├── config/         # Container config: system info / settings panel
    │   ├── utils/          # Container utilities: router nav / storage / event bus
    │   ├── composables/    # Global composables
    │   ├── directives/     # v-access / v-roles / v-auth directives
    │   ├── plugins/        # Plugin wrappers: ECharts / Tiptap / vxe-table / Motion
    │   ├── stores/         # Framework stores (access / user)
    │   └── preferences/    # Preferences
    ├── adapter/            # UI adapter layer (API parity with madong-single)
    ├── api/                # Business API layer (structurally identical to madong-single)
    │   ├── auth/ system/ member/ ops/ content/ web/ devtools/ app/
    │   └── request.ts      # Axios wrapper
    ├── components/         # Business components (isomorphic with madong-single, reusable by plugins)
    │   ├── crud/           # CRUD table component
    │   ├── dialog/         # Dialog component
    │   ├── form/           # Form component
    │   ├── page/           # Page container
    │   ├── icon/ render/
    ├── views/              # Business pages (structure aligned with madong-single)
    │   ├── auth/           # Login / Register
    │   ├── system/         # System management (users / roles / menus / dicts …)
    │   ├── ops/            # Operations (Redis / server / logs / cron)
    │   ├── member/         # Member management
    │   ├── web/            # Site menus / links
    │   ├── content/        # Messages / notepad
    │   └── index/          # Workbench
    ├── plugin/             # Plugin directory
    │   └── demo/           # Demo plugin (37 pages covering CRUD / forms / vxe-table / widgets)
    ├── router/             # Router (with plugin scanner)
    ├── store/              # Business stores (menu / dict / setting / worktab …)
    ├── lang/ enums/ utils/ types/ locales/
    ├── assets/styles/
    └── main.ts             # Entry point
```

### 🔌 Plugin System

Plugins live under `src/plugin/<plugin-name>/` with the following structure:

```
plugin/demo/
├── routes/index.ts      # Dev-time route definitions (production driven by backend menus)
├── views/               # Plugin pages (component field resolved as relative path)
└── mock/api.ts          # Plugin-level Mock data (optional)
```

**Component path resolution supports the following formats (matched by priority):**

| Format | Example | Resolution |
| --- | --- | --- |
| Full standard path | `plugin/demo/views/crud/basic` | `src/plugin/demo/views/crud/basic/index.vue` |
| Colon shorthand | `demo:crud/basic` | `src/plugin/demo/views/crud/basic/index.vue` |
| `{module}/views/` form | `demo/views/crud/basic` | `src/plugin/demo/views/crud/basic/index.vue` |
| Shorthand + `meta.module` | `crud/basic` (module=`demo`) | `src/plugin/demo/views/crud/basic/index.vue` |
| BasicLayout | `BasicLayout` | Built-in framework layout (root nodes only, **must NOT have `meta.module`**) |

**Production:** When a plugin is installed via the backend, `sys_menu` records are auto-written with `meta.module = '<plugin-name>'`. The frontend fetches menus from `GET /system/auth/user-menus` and the plugin scanner dynamically resolves components.

**Development:** Plugins can statically declare routes in `routes/index.ts` (see the demo plugin) — no backend setup needed for preview.

**Plugin Market API:** `src/api/app/plugin/market/` provides type definitions for listing, installing, and purchasing modules.

### 🧪 Mock Development

This project uses Nitro for a complete Mock service with API contracts exactly matching the MaDong Admin backend (adminapi). No frontend code changes are needed when switching to a real backend.

For detailed conventions and development guide, see [tooling/mock/README.md](./tooling/mock/README.md).

Key points:

- **Response envelope:** `{ code: 0, msg: 'ok', data: ... }`. List endpoints return `{ items, total }`
- **Query params:** `EQ_xxx` exact match, `LIKE_xxx` fuzzy match, `keyword` multi-field search
- **Add a CRUD:** Use the `crudRoutes()` factory in `handlers/` — auto-generates full CRUD
- **Menu seed:** Menu structure is defined only in `menu-seed.json`; permission codes in `menu-data.ts`

### ⚙️ Environment Variables

Key configuration lives in [.env](./.env):

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_PORT` | `5500` | Dev server port |
| `VITE_BASE_URL` | `/` | Deployment base path (set to `/admin/` for same-domain) |
| `VITE_ACCESS_MODE` | `backend` | Permission mode (`frontend` / `backend`) |
| `VITE_GLOB_API_URL` | `/adminapi` | API prefix |
| `VITE_NITRO_MOCK` | `true` | Enable local Mock (default `false` in production) |
| `VITE_APP_TITLE` | `Aura-Plus` | App title |
| `VITE_APP_NAMESPACE` | `aura` | Cache / store isolation namespace |

### 📜 License

[MIT](./LICENSE) © SuperManTT
