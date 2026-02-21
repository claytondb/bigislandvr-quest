# Street View Navigation Design

## How Google Street View Works

### Navigation Links
- Each panorama has **links** to adjacent panoramas
- Links include: `panoId`, `heading` (direction in degrees), `text` (street name)
- Available via Street View Tiles API metadata endpoint

### User Interaction (Desktop)
1. **Cursor follows ground**: User's cursor raycasts to a "ground plane"
2. **Direction indicator**: When pointing at a valid direction, cursor becomes a chevron/arrow
3. **Click anywhere**: User clicks in a direction (not on a specific object) to move
4. **Visual feedback**: Path lines or chevrons show available routes

### Transition Animation
1. **Zoom toward direction**: Camera FOV narrows, scene zooms toward target
2. **Crossfade**: New panorama fades in while old fades out
3. **Motion blur** (optional): Slight blur during transition
4. **Duration**: ~400-600ms total

## Implementation Plan

### Phase 1: Get Real Links
```
Current: Using getPanoramaId() which only returns pano_id
Need: Use Tiles API metadata endpoint to get full links array
```

**Problem**: Tiles API requires session tokens (more complex auth)
**Solution**: Use the JavaScript API's StreetViewService, OR approximate with coordinate-based search

For MVP, I'll use coordinate-based approach:
- Calculate points at ~15m in 8 directions (N, NE, E, SE, S, SW, W, NW)
- Query each for panorama
- Build our own "links" array from results

### Phase 2: Ground Plane Navigation

```javascript
// Add invisible ground plane for raycasting
const groundPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshBasicMaterial({ visible: false })
);
groundPlane.rotation.x = -Math.PI / 2; // Horizontal
groundPlane.position.y = -2; // Below camera

// On mousemove:
// 1. Raycast from cursor to ground
// 2. Get hit point
// 3. Calculate heading from camera to hit point
// 4. Check if heading matches any available link (within ±30°)
// 5. Show/hide chevron indicator
```

### Phase 3: Chevron Indicator

- Single 3D chevron mesh (or 2D CSS overlay)
- Follows cursor position on ground
- Rotates to point in link direction
- Only visible when pointing at valid direction
- Glows/pulses to indicate clickable

### Phase 4: Click to Navigate

```javascript
// On click:
// 1. If chevron is visible (valid direction):
//    a. Get the matching link
//    b. Start transition animation
//    c. Load new panorama
// 2. If no valid direction: do nothing (or show feedback)
```

### Phase 5: Transition Animation

```javascript
async function transitionToPanorama(targetPanoId, heading) {
  // 1. Calculate target position (direction we're moving)
  const direction = new THREE.Vector3(
    Math.sin(heading),
    0,
    -Math.cos(heading)
  );
  
  // 2. Pre-load new panorama
  const newMaterials = await loadPanoramaCube(targetPanoId);
  
  // 3. Animate camera forward + zoom
  // Using GSAP or manual animation:
  // - Move camera position forward
  // - Narrow FOV (zoom effect)
  // - Duration: 300ms
  
  // 4. Crossfade (at midpoint):
  // - Start fading out old materials
  // - Fade in new materials
  // - Duration: 200ms overlap
  
  // 5. Snap to new panorama
  // - Reset camera position to center
  // - Reset FOV
  // - Apply new materials fully
}
```

## Visual Reference

```
Current approach (BAD):
┌─────────────────────┐
│                     │
│   [↑] [↓] [←] [→]   │  ← Fixed arrows user must click
│                     │
│    (panorama)       │
│                     │
└─────────────────────┘

Google approach (GOOD):
┌─────────────────────┐
│                     │
│    (panorama)       │
│        ▽            │  ← Chevron follows cursor
│     ═══════         │  ← Shows on road surface
│                     │
└─────────────────────┘
```

## Files to Modify

1. **main.ts**
   - Remove old navArrows setup
   - Add ground plane
   - Add chevron mesh
   - Add mousemove handler for ground raycast
   - Add click handler for navigation
   - Add transition animation

2. **New: navigation.ts** (optional, for cleaner code)
   - LinkScanner class: scans for nearby panoramas
   - ChevronIndicator class: manages the visual indicator
   - TransitionManager class: handles smooth transitions
