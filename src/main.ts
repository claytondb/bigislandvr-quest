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
  
  // Navigation
  private currentLat = 0;
  private currentLng = 0;
  private currentPanoId: string | null = null;
  private navArrows: THREE.Mesh[] = [];
  private raycaster = new THREE.Raycaster();
  
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
    // Create 4 navigation arrows (forward, back, left, right)
    // Larger arrows for easier clicking
    const arrowGeometry = new THREE.ConeGeometry(1.5, 2, 8);
    arrowGeometry.rotateX(Math.PI / 2); // Point forward
    
    const arrowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88, 
      transparent: true, 
      opacity: 0.8,
      depthTest: false  // Always render on top
    });
    
    // Arrow positions: closer and at eye level for easier clicking
    const directions = [
      { name: 'forward', pos: new THREE.Vector3(0, 0, -6), rot: 0 },
      { name: 'back', pos: new THREE.Vector3(0, 0, 6), rot: Math.PI },
      { name: 'left', pos: new THREE.Vector3(-6, 0, 0), rot: Math.PI / 2 },
      { name: 'right', pos: new THREE.Vector3(6, 0, 0), rot: -Math.PI / 2 },
    ];
    
    console.log('🎯 Setting up navigation arrows');
    
    directions.forEach(dir => {
      const arrow = new THREE.Mesh(arrowGeometry.clone(), arrowMaterial.clone());
      arrow.position.copy(dir.pos);
      arrow.rotation.y = dir.rot;
      arrow.userData = { direction: dir.name };
      this.scene.add(arrow);
      this.navArrows.push(arrow);
    });
    
    // Click handler for navigation
    const canvas = this.renderer.domElement;
    canvas.addEventListener('click', (e) => this.handleNavClick(e));
    
    // Hover effect
    canvas.addEventListener('mousemove', (e) => this.handleNavHover(e));
  }
  
  private handleNavHover(event: MouseEvent): void {
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.navArrows);
    
    // Reset all arrows
    this.navArrows.forEach(arrow => {
      (arrow.material as THREE.MeshBasicMaterial).opacity = 0.7;
      arrow.scale.setScalar(1);
    });
    
    // Highlight hovered arrow
    if (intersects.length > 0) {
      const arrow = intersects[0].object as THREE.Mesh;
      (arrow.material as THREE.MeshBasicMaterial).opacity = 1;
      arrow.scale.setScalar(1.3);
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      this.renderer.domElement.style.cursor = 'grab';
    }
  }
  
  private async handleNavClick(event: MouseEvent): Promise<void> {
    if (this.isLoading) {
      console.log('🚫 Click ignored - still loading');
      return;
    }
    
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.navArrows);
    
    console.log(`🖱️ Click at (${mouse.x.toFixed(2)}, ${mouse.y.toFixed(2)}), intersects: ${intersects.length}`);
    
    if (intersects.length > 0) {
      const direction = intersects[0].object.userData.direction;
      console.log(`➡️ Arrow clicked: ${direction}`);
      await this.navigateInDirection(direction);
    }
  }
  
  private async navigateInDirection(direction: string): Promise<void> {
    console.log(`🚶 Navigate called: ${direction}, currentLat: ${this.currentLat}, currentLng: ${this.currentLng}`);
    
    if (!this.currentLat || !this.currentLng) {
      console.log('❌ No current position set');
      return;
    }
    
    // Calculate new position ~15 meters in the given direction
    // Note: yaw=0 means looking at -Z (north in Three.js convention)
    const distance = 0.00015; // ~15 meters in lat/lng
    
    let bearing = -this.yaw; // Convert from Three.js to compass bearing
    
    switch (direction) {
      case 'forward': break; // Use current yaw
      case 'back': bearing += Math.PI; break;
      case 'left': bearing -= Math.PI / 2; break;
      case 'right': bearing += Math.PI / 2; break;
    }
    
    // Calculate new lat/lng (lat increases going north, lng increases going east)
    const newLat = this.currentLat + Math.cos(bearing) * distance;
    const newLng = this.currentLng + Math.sin(bearing) * distance;
    
    console.log(`🧭 Bearing: ${(bearing * 180 / Math.PI).toFixed(1)}°, target: (${newLat.toFixed(6)}, ${newLng.toFixed(6)})`);
    
    // Try to find a panorama at the new location
    const panoId = await this.getPanoramaId(newLat, newLng);
    
    console.log(`🔍 Found pano: ${panoId} (current: ${this.currentPanoId})`);
    
    if (panoId && panoId !== this.currentPanoId) {
      await this.loadPanoramaAtPosition(panoId, newLat, newLng);
    } else if (panoId === this.currentPanoId) {
      console.log('⚠️ Same panorama - try a different direction');
    } else {
      console.log('❌ No panorama found in that direction');
    }
  }
  
  private async loadPanoramaAtPosition(panoId: string, lat: number, lng: number): Promise<void> {
    this.isLoading = true;
    
    const nameEl = document.getElementById('location-name');
    if (nameEl) nameEl.textContent = '⏳ Loading...';
    
    try {
      console.log(`🔍 Loading pano: ${panoId}`);
      const materials = await this.loadPanoramaCube(panoId);
      
      // Dispose old materials
      if (Array.isArray(this.panoramaSphere.material)) {
        this.panoramaSphere.material.forEach(m => {
          const mat = m as THREE.MeshBasicMaterial;
          if (mat.map) mat.map.dispose();
          mat.dispose();
        });
      }
      
      this.panoramaSphere.material = materials;
      this.currentPanoId = panoId;
      this.currentLat = lat;
      this.currentLng = lng;
      
      if (nameEl) nameEl.textContent = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      console.log(`✅ Loaded panorama`);
    } catch (error) {
      console.error('Failed to load panorama:', error);
    }
    
    this.isLoading = false;
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
