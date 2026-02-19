# Big Island VR Quest - Technical Architecture

**Version:** 1.0  
**Last Updated:** February 18, 2026  
**Status:** Draft  

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Module Architecture](#module-architecture)
4. [Panorama System](#panorama-system)
5. [AI Upscaling Pipeline](#ai-upscaling-pipeline)
6. [Zoom System](#zoom-system)
7. [Controller System](#controller-system)
8. [3D UI System](#3d-ui-system)
9. [Audio System](#audio-system)
10. [Performance Optimization](#performance-optimization)
11. [Data Flow](#data-flow)
12. [Build & Deployment](#build--deployment)

---

## System Overview

Big Island VR Quest is a WebXR application designed for Meta Quest browsers. It provides immersive 360° panorama viewing with controller-based navigation and AI-enhanced imagery.

```
┌─────────────────────────────────────────────────────────────┐
│                    Big Island VR Quest                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   WebXR      │  │   Three.js   │  │   Panorama   │       │
│  │   Runtime    │◄─┤   Renderer   │◄─┤   Sphere     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         ▲                 ▲                 ▲               │
│         │                 │                 │               │
│  ┌──────┴─────┐   ┌──────┴──────┐   ┌──────┴──────┐        │
│  │ Controller │   │  UI Manager │   │  Panorama   │        │
│  │  Manager   │   │  (3D Panels)│   │   Loader    │        │
│  └────────────┘   └─────────────┘   └─────────────┘        │
│         ▲                                   ▲               │
│         │                                   │               │
│  ┌──────┴──────┐                   ┌───────┴───────┐       │
│  │    Zoom     │                   │  AI Upscaler  │       │
│  │ Controller  │                   │  (Optional)   │       │
│  └─────────────┘                   └───────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Performance First**: Target 72fps on Quest 2, 90fps on Quest 3
2. **Progressive Loading**: Show content quickly, enhance over time
3. **Modular Architecture**: Easy to extend and maintain
4. **Graceful Degradation**: Works on desktop browsers without VR

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | WebXR API | VR session management, controller input |
| Rendering | Three.js r162+ | 3D rendering, materials, geometry |
| Build | Vite 5.x | Fast HMR, optimized production builds |
| Language | TypeScript 5.x | Type safety, better tooling |
| UI | Canvas 2D → Texture | 3D world-space UI panels |
| Audio | Web Audio API + Three.js Audio | Spatial sound |
| State | Custom EventEmitter | Reactive state management |

### Browser Requirements

- **Quest 2/3/Pro**: Meta Quest Browser with WebXR
- **Desktop**: Chrome 90+, Firefox 90+, Edge 90+ with WebGL 2.0
- **Mobile**: iOS Safari 15.4+, Chrome Android 90+

---

## Module Architecture

```
src/
├── main.ts                 # Application entry point
├── types/
│   └── index.ts            # TypeScript interfaces
├── core/
│   ├── App.ts              # Main application class
│   ├── ZoomController.ts   # Optical zoom system
│   ├── EventBus.ts         # Event system
│   └── StateManager.ts     # Application state
├── panorama/
│   ├── PanoramaLoader.ts   # Tile fetching & assembly
│   ├── PanoramaSphere.ts   # Three.js sphere mesh
│   └── TileCache.ts        # Texture caching
├── controllers/
│   ├── QuestControllerManager.ts  # VR controller input
│   └── DesktopControls.ts  # Mouse/keyboard fallback
├── ui/
│   ├── VRUIPanel.ts        # 3D UI panel component
│   ├── VRUIManager.ts      # Panel orchestration
│   ├── TourGuidePanel.ts   # Tour guide UI
│   └── LocationBrowser.ts  # Location selection UI
├── audio/
│   ├── SpatialAudio.ts     # 3D positional audio
│   └── AmbientMixer.ts     # Location-based mixing
├── effects/
│   ├── AtmosphereManager.ts # Time of day, weather
│   └── ComfortVignette.ts  # Motion sickness reduction
├── upscale/
│   └── AIUpscaler.ts       # Image enhancement
└── data/
    └── locations.ts        # Location database
```

### Module Dependencies

```
main.ts
    └── App.ts
        ├── PanoramaLoader.ts
        │   └── TileCache.ts
        ├── QuestControllerManager.ts
        │   └── ZoomController.ts
        ├── VRUIManager.ts
        │   ├── TourGuidePanel.ts
        │   └── LocationBrowser.ts
        ├── SpatialAudio.ts
        │   └── AmbientMixer.ts
        └── AtmosphereManager.ts
            └── ComfortVignette.ts
```

---

## Panorama System

### Tile-Based Loading

Google Street View panoramas are delivered as tiles. We fetch tiles directly and assemble them into equirectangular textures.

```
Zoom Level    Tiles       Resolution      Use Case
-----------   ------      -----------     --------
0             1×1         512×256         Thumbnail
1             2×1         1024×512        Preview
2             4×2         2048×1024       Low quality
3             8×4         4096×2048       Medium (default)
4             16×8        8192×4096       High quality
5             26×13       13312×6656      Ultra (when zoomed)
```

### Tile URL Format

```
https://cbk0.google.com/cbk?output=tile&panoid={PANO_ID}&zoom={ZOOM}&x={X}&y={Y}
```

### Loading Strategy

```
┌─────────────────────────────────────────────────────────┐
│ 1. User requests location                                │
├─────────────────────────────────────────────────────────┤
│ 2. Fetch metadata → Get pano ID                         │
│    GET /maps/api/streetview/metadata?location={lat,lng} │
├─────────────────────────────────────────────────────────┤
│ 3. Load preview tiles (zoom level 1)                    │
│    → Display immediately on sphere                       │
├─────────────────────────────────────────────────────────┤
│ 4. Load medium tiles (zoom level 3) in background       │
│    → Replace preview when complete                       │
├─────────────────────────────────────────────────────────┤
│ 5. If user zooms: Load high tiles (zoom level 4+)       │
│    → Apply AI upscaling if enabled                       │
└─────────────────────────────────────────────────────────┘
```

### Sphere Rendering

```typescript
// Inverted sphere for interior panorama viewing
const geometry = new THREE.SphereGeometry(500, 64, 32);
geometry.scale(-1, 1, 1); // Flip normals inward

const material = new THREE.MeshBasicMaterial({
  map: panoramaTexture,
  side: THREE.BackSide,
});

const sphere = new THREE.Mesh(geometry, material);
```

---

## AI Upscaling Pipeline

### Architecture Options

| Option | Pros | Cons |
|--------|------|------|
| **Client-side ONNX** | No server, low latency | GPU intensive, model size |
| **Server-side** | Full power GPUs | Latency, hosting costs |
| **Third-party API** | Easy integration | Per-request costs |

### Recommended: Hybrid Approach

1. **Default**: Server-side upscaling with caching
2. **Fallback**: Native resolution if server unavailable
3. **Future**: Client-side when WebGPU matures

### Server Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Original    │────▶│  Upscaler    │────▶│  CDN Cache   │
│  Tile 512px  │     │  Real-ESRGAN │     │  1024px+     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                     ┌──────┴──────┐
                     │ GPU Server  │
                     │ (Lambda/EC2)│
                     └─────────────┘
```

### Caching Strategy

```typescript
interface UpscaleCache {
  // Key: pano_id + tile_coords + scale_factor
  // Value: CDN URL to upscaled image
  getUpscaled(panoId: string, x: number, y: number, zoom: number, scale: 2 | 4): Promise<string>;
}
```

---

## Zoom System

### Implementation

The zoom system is a **key differentiator** from Wander VR. It provides optical zoom into any part of the panorama.

```typescript
class ZoomController {
  // Map trigger pressure to FOV
  // Default FOV: 75°
  // Max zoom (4x): FOV 18.75°
  
  setZoomLevel(triggerValue: number): void {
    const targetFOV = lerp(MAX_FOV, MIN_FOV, triggerValue);
    this.camera.fov = lerp(this.camera.fov, targetFOV, SMOOTH_FACTOR);
    this.camera.updateProjectionMatrix();
  }
}
```

### Zoom Levels & Quality

```
Zoom Level    FOV        Quality Action
----------    ----       --------------
1.0x          75°        Medium tiles (default)
2.0x          37.5°      Request high tiles
3.0x+         25°        Request ultra tiles + AI upscale
4.0x          18.75°     Max zoom
```

### Reticle Feedback

When zooming, a reticle appears at screen center showing:
- Current zoom level (1.0x - 4.0x)
- Crosshair for precision
- Pulse animation during active zoom

---

## Controller System

### Quest Touch Mapping

```
LEFT CONTROLLER                 RIGHT CONTROLLER
┌─────────────────┐            ┌─────────────────┐
│     [Menu]      │            │                 │
│   ┌───────┐     │            │     ┌───────┐   │
│   │Stick  │ [Y] │            │ [B] │Stick  │   │
│   └───────┘ [X] │            │ [A] └───────┘   │
│ [Grip]    [Trig]│            │[Trig]    [Grip] │
└─────────────────┘            └─────────────────┘

LEFT:                           RIGHT:
- Stick: Teleport direction     - Stick X: Turn (snap/smooth)
- Trigger: Confirm teleport     - Trigger: Select/Interact
- Grip: Grab UI panels          - Grip: ZOOM
- X: Quick Travel               - A: Confirm
- Y: Toggle Tour Guide          - B: Back
- Menu: Pause menu              
```

### Input Processing

```typescript
update(frame: XRFrame): void {
  for (const source of frame.session.inputSources) {
    const gamepad = source.gamepad;
    
    // Thumbstick axes
    const thumbX = gamepad.axes[2]; // -1 to 1
    const thumbY = gamepad.axes[3]; // -1 to 1
    
    // Buttons
    const trigger = gamepad.buttons[0].value; // 0 to 1
    const grip = gamepad.buttons[1].value;    // 0 to 1
    const aOrX = gamepad.buttons[4].pressed;  // boolean
    const bOrY = gamepad.buttons[5].pressed;  // boolean
  }
}
```

---

## 3D UI System

### Panel Architecture

UI panels are rendered to Canvas 2D, then applied as textures to Three.js planes.

```
┌─────────────────────────────────────────┐
│           HTML Canvas (2D)              │
│  ┌───────────────────────────────────┐  │
│  │  [Title]                          │  │
│  │  ─────────────────────────        │  │
│  │  [Button 1]    [Button 2]         │  │
│  │  [Slider ========○====]           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│        Three.js Mesh + Texture          │
│   (PlaneGeometry or curved geometry)    │
└─────────────────────────────────────────┘
```

### Curved Panels

For comfortable viewing, panels can be curved to match the user's field of view:

```typescript
// Curved panel wraps around user at fixed radius
const curveRadius = 3; // meters
const arcAngle = panelWidth / curveRadius;

// Generate vertices along the curve
for (let i = 0; i <= segments; i++) {
  const angle = (i / segments - 0.5) * arcAngle;
  const x = Math.sin(angle) * curveRadius;
  const z = -Math.cos(angle) * curveRadius + curveRadius;
  vertices.push(x, y, z);
}
```

### Interaction Model

```
Controller Ray ───────────────▶ Panel
                                  │
                    ┌─────────────┴─────────────┐
                    │     Raycast Hit Test      │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   UV to Panel Coords      │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Element Hit Detection   │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
         [Hover Event]      [Click Event]      [Drag Event]
```

---

## Audio System

### Spatial Audio Architecture

```
┌─────────────────────────────────────────────┐
│              Web Audio Context              │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   │
│  │ Ocean   │   │ Birds   │   │ Wind    │   │
│  │ Source  │   │ Source  │   │ Source  │   │
│  └────┬────┘   └────┬────┘   └────┬────┘   │
│       │             │             │         │
│       ▼             ▼             ▼         │
│  ┌─────────────────────────────────────┐   │
│  │         Ambient Mixer Node          │   │
│  │  (Volume based on location config)  │   │
│  └──────────────────┬──────────────────┘   │
│                     │                       │
│                     ▼                       │
│  ┌─────────────────────────────────────┐   │
│  │          Master Gain Node           │   │
│  └──────────────────┬──────────────────┘   │
│                     │                       │
│                     ▼                       │
│  ┌─────────────────────────────────────┐   │
│  │         Audio Destination           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Location-Based Mixing

Each location defines audio levels:

```typescript
interface AudioConfig {
  ocean?: number;     // 0-1 volume
  birds?: number;
  wind?: number;
  rain?: number;
  waterfall?: number;
  volcanic?: number;
}

// Example: Hilo Bayfront
{ ocean: 0.8, birds: 0.5, wind: 0.2 }

// Example: Kilauea Crater
{ wind: 0.8, volcanic: 0.7 }
```

---

## Performance Optimization

### Frame Budget (Quest 2 @ 72fps)

```
Total frame time: 13.9ms
├── WebXR overhead: ~1ms
├── Three.js render: ~8ms
│   ├── Panorama sphere: ~3ms
│   ├── UI panels: ~2ms
│   ├── Effects: ~2ms
│   └── Post-processing: ~1ms
├── Controller input: ~0.5ms
├── Audio mixing: ~0.5ms
└── Headroom: ~3.9ms
```

### Optimization Techniques

1. **Texture Management**
   - Max 2 panorama textures in VRAM (current + preload)
   - Dispose textures when switching locations
   - Use compressed textures when supported

2. **Draw Call Reduction**
   - Batch UI panel rendering
   - Single panorama sphere draw
   - Instanced rendering for repeated elements

3. **Level of Detail**
   - Preview tiles for initial load
   - Medium tiles for normal viewing
   - High tiles only when zoomed

4. **Occlusion**
   - Frustum culling for UI panels
   - Skip rendering hidden panels

### Memory Budget

```
Quest 2 available: ~2GB

Allocation:
├── Panorama textures: ~50MB (4096×2048 × 2)
├── UI textures: ~10MB
├── Audio buffers: ~20MB
├── Three.js scene: ~20MB
├── Code + Wasm: ~10MB
└── Headroom: ~100MB
```

---

## Data Flow

### Application State

```typescript
interface AppState {
  mode: 'loading' | 'desktop' | 'vr';
  currentLocation: Location | null;
  currentLocationIndex: number;
  zoom: ZoomState;
  vr: VRSessionState;
  ui: UIState;
  settings: UserSettings;
}
```

### Event Flow

```
User Input ──▶ Controller Manager ──▶ Event Bus ──▶ Handlers
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
      ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
      │  Zoom Update  │          │  Location     │          │  UI Update    │
      │               │          │  Change       │          │               │
      └───────┬───────┘          └───────┬───────┘          └───────────────┘
              │                          │
              │                          ▼
              │               ┌───────────────────┐
              │               │ Panorama Loader   │
              │               └─────────┬─────────┘
              │                         │
              ▼                         ▼
      ┌───────────────────────────────────────┐
      │            Render Loop                 │
      └───────────────────────────────────────┘
```

---

## Build & Deployment

### Development

```bash
npm run dev        # Start Vite dev server
                   # Hot reload enabled
                   # http://localhost:5173
```

### Production Build

```bash
npm run build      # TypeScript compile + Vite bundle
                   # Output: dist/
                   # Tree-shaking + minification
```

### Deployment Targets

1. **GitHub Pages** (free, simple)
   ```yaml
   # .github/workflows/deploy.yml
   - uses: peaceiris/actions-gh-pages@v3
     with:
       publish_dir: ./dist
   ```

2. **Vercel** (preview deployments)
   ```bash
   vercel --prod
   ```

3. **Custom CDN** (performance)
   - CloudFront + S3
   - Cloudflare Pages

### Quest Testing

1. Connect Quest to same WiFi as dev machine
2. Open Quest Browser
3. Navigate to `http://{YOUR_IP}:5173`
4. Or use `adb reverse tcp:5173 tcp:5173` for USB

---

## Appendix: Key Interfaces

```typescript
// Location data
interface Location {
  id: number;
  name: string;
  desc: string;
  region: string;
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
  audio: AudioConfig;
  atmosphere: AtmosphereConfig;
  summary: string;
}

// VR Controller state
interface XRControllerState {
  hand: 'left' | 'right';
  thumbstick: { x: number; y: number };
  trigger: number;
  grip: number;
  buttons: { a: boolean; b: boolean; x: boolean; y: boolean };
  pose: { position: Vector3; rotation: Quaternion };
}

// Zoom state
interface ZoomState {
  active: boolean;
  level: number;
  fov: number;
}
```

---

*Architecture designed for extensibility, performance, and maintainability.*
