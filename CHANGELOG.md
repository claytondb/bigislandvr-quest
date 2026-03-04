# Changelog

All notable changes to Big Island VR Quest.

## [0.5.0] - 2026-02-21

### Added
- **PWA Support** - Installable on mobile devices
- Meta tags and favicon for better mobile experience

## [0.4.0] - 2026-02-20

### Added
- **Google-Style Navigation** - Ground cursor, chevron indicator, smooth transitions
- **Navigation Arrows** - Click to move between panoramas
- **2x Resolution** - 2x2 tile grid per cube face for sharper images
- **Transition Animations** - Smooth fades between panoramas

### Fixed
- Debug logging for easier troubleshooting
- Larger arrows at eye level for easier clicking
- FPS-style camera control (yaw/pitch)
- Y-axis drag control inversion
- Panorama tile stitching math (correct FOV coverage)

### Changed
- Switched to cube map approach (6 perspective images for skybox)
- Switched to Street View Static API for better CORS support

## [0.3.0] - 2026-02-19

### Added
- **GitHub Pages Deployment** - Live demo at claytondb.github.io
- Filter for official Google Street View only (source=outdoor)
- 500m radius for Street View panorama search
- Street View panorama loading with fallback handling

### Changed
- Simplified app for debugging - basic panorama viewer with location info

## [0.2.0] - 2026-02-19

### Added
- **Tour Guide Panel** - Enhanced location info with history
- **Location Browser Panel** - Navigate between locations
- All core systems wired up and building

## [0.1.0] - 2026-02-18

### Added
- Initial release - WebXR foundation
- **Spatial Audio System** - Location-aware ambient soundscapes
- **UI Sound Effects** - Interaction feedback
- **Atmosphere Effects** - Visual enhancements
- **Comfort Vignette** - Reduce motion sickness
- **VR UI Panel System** - 3D menus for Quest
- **Quest Controller Manager** - Native controller support
- Architecture documentation
- TypeScript + Vite build system

---

**Play Now:** https://claytondb.github.io/bigislandvr-quest/  
**For Meta Quest Browser**
