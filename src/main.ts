/**
 * Big Island VR Quest - Main Entry Point
 * With Street View panorama loading
 */

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { LOCATIONS, REGIONS } from './data/locations';

// Google API key - needs claytondb.github.io in allowed referrers
const API_KEY = 'AIzaSyBmSDHrsQunVjxhZ4UHQ0asdUY6vZVFszY';

// Tile configuration
const TILE_SIZE = 512;
const ZOOM_LEVELS = {
  preview: { zoom: 2, tilesX: 4, tilesY: 2, width: 2048, height: 1024 },
  medium: { zoom: 3, tilesX: 8, tilesY: 4, width: 4096, height: 2048 },
};

class BigIslandVRApp {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private panoramaSphere: THREE.Mesh;
  
  private currentLocationIndex = 0;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private yaw = 0;    // Horizontal rotation (radians)
  private pitch = 0;  // Vertical rotation (radians), clamped to avoid flipping
  private isLoading = false;
  
  // Navigation - Google Street View style
  private currentLat = 0;
  private currentLng = 0;
  private currentPanoId: string | null = null;
  private raycaster = new THREE.Raycaster();
  private groundPlane!: THREE.Mesh;
  private navChevron!: THREE.Group;
  private availableLinks: Array<{ panoId: string; heading: number; lat: number; lng: number }> = [];
  private hoveredLink: { panoId: string; heading: number; lat: number; lng: number } | null = null;
  private isTransitioning = false;
  
  constructor() {
    console.log('🌴 Big Island VR Quest starting...');
    
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.xr.enabled = true;
    
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1A6B7C);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 0);
    
    // Panorama skybox - using a large box that we view from inside
    // This works better with perspective Street View images
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const material = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.BackSide });
    this.panoramaSphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.panoramaSphere);
    
    // Setup
    this.setupVR();
    this.setupControls();
    this.setupNavigation();
    
    // Load first location
    this.goToLocation(0);
    
    // Hide loading, start render
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
    
    this.renderer.setAnimationLoop(() => this.render());
    console.log('✅ App ready!');
  }
  
  private setupVR(): void {
    if ('xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
        if (supported) {
          document.body.appendChild(VRButton.createButton(this.renderer));
          const btn = document.getElementById('vr-button');
          if (btn) {
            btn.removeAttribute('disabled');
            btn.textContent = '🥽 Enter VR';
          }
        }
      });
    }
  }
  
  private setupControls(): void {
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    window.addEventListener('mouseup', () => this.isDragging = false);
    
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.previousMousePosition.x;
      const dy = e.clientY - this.previousMousePosition.y;
      
      // Update yaw (horizontal) and pitch (vertical)
      this.yaw -= dx * 0.005;
      this.pitch -= dy * 0.005;
      
      // Clamp pitch to prevent flipping (roughly -85° to +85°)
      this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));
      
      // Apply rotation to camera using Euler angles (YXZ order for FPS-style)
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.y = this.yaw;
      this.camera.rotation.x = this.pitch;
      
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('wheel', (e) => {
      this.camera.fov = Math.max(20, Math.min(100, this.camera.fov * (e.deltaY > 0 ? 1.1 : 0.9)));
      this.camera.updateProjectionMatrix();
    });
    
    window.addEventListener('keydown', (e) => {
      if (this.isLoading) return;
      if (e.key === 'ArrowRight') this.goToLocation((this.currentLocationIndex + 1) % LOCATIONS.length);
      else if (e.key === 'ArrowLeft') this.goToLocation((this.currentLocationIndex - 1 + LOCATIONS.length) % LOCATIONS.length);
    });
    
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  private async goToLocation(index: number): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;
    
    const location = LOCATIONS[index];
    this.currentLocationIndex = index;
    
    // Update UI
    const nameEl = document.getElementById('location-name');
    const descEl = document.getElementById('location-desc');
    if (nameEl) nameEl.textContent = `⏳ Loading ${location.name}...`;
    if (descEl) descEl.textContent = location.region;
    
    console.log(`📍 Loading: ${location.name}`);
    
    // Set camera direction using yaw/pitch
    // Heading: 0=North, 90=East, 180=South, 270=West
    // Convert to yaw: we want heading 0 to look at -Z (Three.js forward)
    this.yaw = THREE.MathUtils.degToRad(-location.heading);
    this.pitch = THREE.MathUtils.degToRad(location.pitch || 0);
    
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    
    // Try to load Street View panorama as cube map
    try {
      const panoId = await this.getPanoramaId(location.lat, location.lng);
      if (panoId) {
        console.log(`🔍 Found pano: ${panoId}`);
        const materials = await this.loadPanoramaCube(panoId);
        
        // Dispose old materials
        if (Array.isArray(this.panoramaSphere.material)) {
          this.panoramaSphere.material.forEach(m => {
            if ((m as THREE.MeshBasicMaterial).map) {
              (m as THREE.MeshBasicMaterial).map!.dispose();
            }
            m.dispose();
          });
        } else if (this.panoramaSphere.material) {
          const mat = this.panoramaSphere.material as THREE.MeshBasicMaterial;
          if (mat.map) mat.map.dispose();
          mat.dispose();
        }
        
        // Apply new materials (one per cube face)
        this.panoramaSphere.material = materials;
        
        // Store current position for navigation
        this.currentPanoId = panoId;
        this.currentLat = location.lat;
        this.currentLng = location.lng;
        
        // Scan for navigation links
        this.scanForLinks();
        
        console.log(`✅ Loaded panorama cube for ${location.name}`);
      } else {
        throw new Error('No pano ID');
      }
    } catch (error) {
      console.warn(`⚠️ Failed to load panorama:`, error);
      this.showFallbackTexture(location);
    }
    
    // Update UI with final info
    if (nameEl) nameEl.textContent = location.name;
    if (descEl) descEl.textContent = location.summary || location.desc;
    
    this.isLoading = false;
  }
  
  private async getPanoramaId(lat: number, lng: number): Promise<string | null> {
    // Add radius=1000 and source=outdoor to get official Google Street View (not user photospheres)
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=1000&source=outdoor&key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.pano_id) {
        return data.pano_id;
      }
      console.warn('Street View metadata:', data.status);
      return null;
    } catch (error) {
      console.error('Metadata fetch failed:', error);
      return null;
    }
  }
  
  private async loadPanoramaCube(panoId: string): Promise<THREE.Material[]> {
    // Load 6 cube faces, each at higher resolution using 2x2 tile grid
    // Street View: heading 0=north, 90=east, 180=south, 270=west
    // Three.js cube faces order: +X, -X, +Y, -Y, +Z, -Z
    
    const tileSize = 640;  // Max size per request
    const fov = 45;        // Smaller FOV = higher detail, need 2x2 grid per face
    
    // Define the 6 faces with their center headings
    const faces = [
      { name: 'right',  heading: 90,  pitch: 0 },   // +X (East)
      { name: 'left',   heading: 270, pitch: 0 },   // -X (West)
      { name: 'top',    heading: 0,   pitch: 90 },  // +Y (Up)
      { name: 'bottom', heading: 0,   pitch: -90 }, // -Y (Down)
      { name: 'front',  heading: 0,   pitch: 0 },   // +Z (North)
      { name: 'back',   heading: 180, pitch: 0 },   // -Z (South)
    ];
    
    console.log(`🖼️ Loading 6 cube faces (2x2 tiles each) for pano ${panoId}...`);
    
    const materials: THREE.Material[] = [];
    
    for (const face of faces) {
      const texture = await this.loadHighResFaceTexture(panoId, face.heading, face.pitch, tileSize);
      const material = new THREE.MeshBasicMaterial({ 
        map: texture, 
        side: THREE.BackSide 
      });
      materials.push(material);
    }
    
    // DEBUG: Show front face in corner
    const debugCanvas = document.getElementById('debug-canvas') as HTMLCanvasElement;
    if (debugCanvas && materials[4]) {
      const debugCtx = debugCanvas.getContext('2d')!;
      debugCanvas.width = 200;
      debugCanvas.height = 200;
      const frontMat = materials[4] as THREE.MeshBasicMaterial;
      if (frontMat.map?.image) {
        debugCtx.drawImage(frontMat.map.image, 0, 0, 200, 200);
      }
    }
    
    console.log(`📸 Finished loading 6 cube faces`);
    return materials;
  }
  
  private async loadHighResFaceTexture(panoId: string, centerHeading: number, centerPitch: number, tileSize: number): Promise<THREE.Texture> {
    // For top/bottom faces, use single image (they're often less detailed anyway)
    if (Math.abs(centerPitch) > 45) {
      return this.loadFaceTexture(panoId, centerHeading, centerPitch, tileSize, 90);
    }
    
    // For side faces, load 2x2 grid at 45° FOV each for higher resolution
    const canvas = document.createElement('canvas');
    canvas.width = tileSize * 2;
    canvas.height = tileSize * 2;
    const ctx = canvas.getContext('2d')!;
    
    // Fill with fallback
    ctx.fillStyle = '#1A3A4A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2x2 grid offsets: top-left, top-right, bottom-left, bottom-right
    const offsets = [
      { dx: 0, dy: 0, headingOff: -22.5, pitchOff: 22.5 },
      { dx: 1, dy: 0, headingOff: 22.5, pitchOff: 22.5 },
      { dx: 0, dy: 1, headingOff: -22.5, pitchOff: -22.5 },
      { dx: 1, dy: 1, headingOff: 22.5, pitchOff: -22.5 },
    ];
    
    const loadPromises = offsets.map(async (offset) => {
      const heading = (centerHeading + offset.headingOff + 360) % 360;
      const pitch = centerPitch + offset.pitchOff;
      
      const img = await this.loadImageAsync(panoId, heading, pitch, tileSize, 45);
      if (img) {
        ctx.drawImage(img, offset.dx * tileSize, offset.dy * tileSize, tileSize, tileSize);
      }
    });
    
    await Promise.all(loadPromises);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }
  
  private loadImageAsync(panoId: string, heading: number, pitch: number, size: number, fov: number): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const url = `https://maps.googleapis.com/maps/api/streetview?size=${size}x${size}&pano=${panoId}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${API_KEY}`;
      
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
  
  private loadFaceTexture(panoId: string, heading: number, pitch: number, size: number, fov: number): Promise<THREE.Texture> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const url = `https://maps.googleapis.com/maps/api/streetview?size=${size}x${size}&pano=${panoId}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${API_KEY}`;
      
      img.onload = () => {
        console.log(`✓ Loaded face: heading=${heading}°, pitch=${pitch}°`);
        const texture = new THREE.Texture(img);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        resolve(texture);
      };
      
      img.onerror = () => {
        console.error(`❌ Failed to load face: heading=${heading}°, pitch=${pitch}°`);
        // Return a fallback colored texture
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#1A3A4A';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${heading}°`, size/2, size/2);
        const texture = new THREE.CanvasTexture(canvas);
        resolve(texture);
      };
      
      img.src = url;
    });
  }
  
  // Keep old method name for compatibility but redirect to cube
  private async loadPanoramaTiles(panoId: string, quality: 'preview' | 'medium'): Promise<THREE.Texture> {
    // This is now handled by loadPanoramaCube, return dummy
    return new THREE.Texture();
  }
  
  private showFallbackTexture(location: any): void {
    const regionInfo = REGIONS[location.region];
    const color = regionInfo?.color || '#2A9D8F';
    
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, '#1A4A3A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    // Location info
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📍 ${location.name}`, 512, 220);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Street View unavailable for this location', 512, 260);
    ctx.fillText('← → to try another location', 512, 290);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = this.panoramaSphere.material as THREE.MeshBasicMaterial;
    if (material.map) material.map.dispose();
    material.map = texture;
    material.color.setHex(0xFFFFFF);
    material.needsUpdate = true;
  }
  
  private setupNavigation(): void {
    console.log('🎯 Setting up Google-style navigation');
    
    // 1. Create invisible ground plane for raycasting
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshBasicMaterial({ 
      visible: false,
      side: THREE.DoubleSide 
    });
    this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    this.groundPlane.rotation.x = -Math.PI / 2; // Make horizontal
    this.groundPlane.position.y = -1.5; // Below camera eye level
    this.scene.add(this.groundPlane);
    
    // 2. Create navigation chevron (arrow indicator)
    this.navChevron = this.createChevron();
    this.navChevron.visible = false;
    this.scene.add(this.navChevron);
    
    // 3. Event listeners
    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvas.addEventListener('click', (e) => this.handleClick(e));
  }
  
  private createChevron(): THREE.Group {
    const group = new THREE.Group();
    
    // Create chevron shape (two angled bars forming >)
    const barGeometry = new THREE.BoxGeometry(2, 0.15, 0.5);
    const barMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    
    // Left bar of chevron
    const leftBar = new THREE.Mesh(barGeometry, barMaterial);
    leftBar.position.set(-0.6, 0, 0);
    leftBar.rotation.y = Math.PI / 6; // 30 degrees
    group.add(leftBar);
    
    // Right bar of chevron
    const rightBar = new THREE.Mesh(barGeometry, barMaterial.clone());
    rightBar.position.set(0.6, 0, 0);
    rightBar.rotation.y = -Math.PI / 6; // -30 degrees
    group.add(rightBar);
    
    // Add a subtle glow ring
    const ringGeometry = new THREE.RingGeometry(1.5, 1.8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.05;
    group.add(ring);
    
    return group;
  }
  
  private handleMouseMove(event: MouseEvent): void {
    if (this.isLoading || this.isTransitioning || this.isDragging) {
      this.navChevron.visible = false;
      return;
    }
    
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.groundPlane);
    
    if (intersects.length > 0) {
      const hitPoint = intersects[0].point;
      
      // Calculate heading from camera to hit point
      const dx = hitPoint.x - this.camera.position.x;
      const dz = hitPoint.z - this.camera.position.z;
      const headingToPoint = Math.atan2(dx, -dz); // Three.js: -Z is forward
      
      // Check if this heading matches any available link
      const matchedLink = this.findMatchingLink(headingToPoint);
      
      if (matchedLink) {
        // Show chevron at hit point, pointing in link direction
        this.navChevron.position.copy(hitPoint);
        this.navChevron.position.y = -1.4; // Slightly above ground
        this.navChevron.rotation.y = -matchedLink.heading; // Point toward link
        this.navChevron.visible = true;
        this.hoveredLink = matchedLink;
        this.renderer.domElement.style.cursor = 'pointer';
      } else {
        this.navChevron.visible = false;
        this.hoveredLink = null;
        this.renderer.domElement.style.cursor = 'grab';
      }
    } else {
      this.navChevron.visible = false;
      this.hoveredLink = null;
    }
  }
  
  private findMatchingLink(heading: number): { panoId: string; heading: number; lat: number; lng: number } | null {
    const tolerance = Math.PI / 4; // 45 degrees tolerance
    
    for (const link of this.availableLinks) {
      // Convert link heading to radians
      const linkHeadingRad = link.heading;
      
      // Calculate angular difference
      let diff = Math.abs(heading - linkHeadingRad);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      
      if (diff < tolerance) {
        return link;
      }
    }
    return null;
  }
  
  private async handleClick(event: MouseEvent): Promise<void> {
    if (this.isLoading || this.isTransitioning) return;
    
    // If we have a hovered link, navigate to it
    if (this.hoveredLink) {
      console.log(`🚶 Navigating to ${this.hoveredLink.panoId}`);
      await this.transitionToPanorama(this.hoveredLink);
    }
  }
  
  private async transitionToPanorama(link: { panoId: string; heading: number; lat: number; lng: number }): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.navChevron.visible = false;
    
    const nameEl = document.getElementById('location-name');
    if (nameEl) nameEl.textContent = '⏳ Moving...';
    
    // Store original FOV for animation
    const originalFov = this.camera.fov;
    const targetFov = originalFov * 0.7; // Zoom in effect
    
    try {
      // 1. Pre-load new panorama
      const newMaterials = await this.loadPanoramaCube(link.panoId);
      
      // 2. Animate: zoom + fade (simple version)
      const duration = 400; // ms
      const startTime = performance.now();
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Zoom effect
        this.camera.fov = originalFov - (originalFov - targetFov) * Math.sin(eased * Math.PI);
        this.camera.updateProjectionMatrix();
        
        // Fade out old materials at midpoint
        if (progress > 0.3 && Array.isArray(this.panoramaSphere.material)) {
          const fadeProgress = (progress - 0.3) / 0.7;
          this.panoramaSphere.material.forEach(m => {
            (m as THREE.MeshBasicMaterial).opacity = 1 - fadeProgress;
          });
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 3. Snap to new panorama
          if (Array.isArray(this.panoramaSphere.material)) {
            this.panoramaSphere.material.forEach(m => {
              const mat = m as THREE.MeshBasicMaterial;
              if (mat.map) mat.map.dispose();
              mat.dispose();
            });
          }
          
          this.panoramaSphere.material = newMaterials;
          this.currentPanoId = link.panoId;
          this.currentLat = link.lat;
          this.currentLng = link.lng;
          
          // Reset camera
          this.camera.fov = originalFov;
          this.camera.updateProjectionMatrix();
          
          // Scan for new links
          this.scanForLinks();
          
          if (nameEl) nameEl.textContent = `📍 ${link.lat.toFixed(4)}, ${link.lng.toFixed(4)}`;
          
          this.isTransitioning = false;
          console.log(`✅ Transition complete`);
        }
      };
      
      // Make materials transparent for fading
      if (Array.isArray(this.panoramaSphere.material)) {
        this.panoramaSphere.material.forEach(m => {
          (m as THREE.MeshBasicMaterial).transparent = true;
        });
      }
      
      animate();
      
    } catch (error) {
      console.error('Transition failed:', error);
      this.camera.fov = originalFov;
      this.camera.updateProjectionMatrix();
      this.isTransitioning = false;
    }
  }
  
  private async scanForLinks(): Promise<void> {
    if (!this.currentLat || !this.currentLng) return;
    
    console.log('🔍 Scanning for nearby panoramas...');
    this.availableLinks = [];
    
    // Scan 8 directions at ~15m distance
    const distance = 0.00015; // ~15m in degrees
    const directions = [0, 45, 90, 135, 180, 225, 270, 315]; // degrees
    
    const scanPromises = directions.map(async (deg) => {
      const rad = deg * Math.PI / 180;
      const lat = this.currentLat + Math.cos(rad) * distance;
      const lng = this.currentLng + Math.sin(rad) * distance;
      
      const panoId = await this.getPanoramaId(lat, lng);
      
      if (panoId && panoId !== this.currentPanoId) {
        // Convert compass heading to Three.js heading
        // In Three.js: 0 = -Z (north), positive = clockwise
        const heading = -deg * Math.PI / 180;
        
        this.availableLinks.push({ panoId, heading, lat, lng });
        console.log(`  ✓ Found link at ${deg}°: ${panoId}`);
      }
    });
    
    await Promise.all(scanPromises);
    console.log(`📍 Found ${this.availableLinks.length} navigation links`);
  }
  
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  try {
    new BigIslandVRApp();
  } catch (error) {
    console.error('App error:', error);
  }
});
