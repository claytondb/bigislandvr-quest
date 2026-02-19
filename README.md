# Big Island VR Quest

**Immersive VR tour of Hawaii's Big Island for Meta Quest**

A WebXR-powered virtual reality experience that lets you explore the Big Island of Hawaii through high-quality 360° panoramas with Quest controller support, AI-upscaled imagery, and rich historical context.

## Vision

Beat Wander VR by offering:
- 🔍 **Optical zoom** - Get closer to any part of the scene
- 🤖 **AI-upscaled imagery** - Sharper than native Street View
- 📖 **Historical context** - Rich stories about each location
- 🎧 **Immersive audio** - Location-aware ambient soundscapes
- 🌅 **Atmospheric effects** - Time of day, weather, mist
- 🎮 **Intuitive controls** - Designed for Quest controllers

## Tech Stack

- **Three.js** - 3D rendering engine
- **WebXR API** - Native VR support for Quest browser
- **Custom Panorama Renderer** - Direct tile fetching with sphere projection
- **AI Upscaling** - Real-ESRGAN or similar for image enhancement
- **TypeScript** - Type-safe development
- **Vite** - Fast development and optimized builds

## Project Structure

```
dc-bigislandvr-quest/
├── docs/
│   ├── REQUIREMENTS.md      # Product requirements
│   ├── ARCHITECTURE.md      # Technical architecture
│   ├── UX_DESIGN.md         # VR UX patterns and flows
│   └── API.md               # Internal API documentation
├── src/
│   ├── core/                # Core VR engine
│   ├── panorama/            # Panorama loading and rendering
│   ├── controllers/         # Quest controller handling
│   ├── ui/                  # 3D UI components
│   ├── audio/               # Spatial audio system
│   ├── effects/             # Visual effects
│   └── upscale/             # AI upscaling integration
├── assets/
│   ├── audio/               # Ambient sounds
│   ├── textures/            # UI textures
│   └── models/              # 3D models (controllers, UI)
└── tests/                   # Test suite
```

## Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
```

## Deployment

Optimized for Quest browser via GitHub Pages or any static host.

## Status

🚧 In Development

---

*A project to bring Hawaii home through virtual reality.*
