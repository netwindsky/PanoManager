# PanoManager Knowledge Base

**Path:** `PanoManager/`
**Purpose:** Admin management interface

## OVERVIEW

Vue 3 + TypeScript admin dashboard for managing panoramic content, users, and system settings. Standalone app with no dependency on PanoViewV2 engine.

## STRUCTURE

```
PanoManager/
├── src/
│   ├── api/           # Axios HTTP client
│   ├── components/    # Vue components (8 files)
│   ├── composables/   # Reusable composition functions
│   ├── router/        # Vue Router
│   ├── stores/        # Pinia stores
│   ├── styles/        # CSS/styling
│   ├── types/         # TypeScript types
│   └── views/         # Admin pages (9 files)
└── vite.config.ts     # Dev server port 5003, proxies /api and /uploads
```

## CONVENTIONS

- **Standalone:** No `@panoview` imports; self-contained admin UI
- **Element Plus:** UI component library
- **Axios:** HTTP client with configured baseURL

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Admin pages | `src/views/` |
| HTTP client | `src/api/` |
| Routes | `src/router/` |

## NOTES

- **Port:** 5003
- **No Three.js dependency:** Pure admin UI without panorama rendering
