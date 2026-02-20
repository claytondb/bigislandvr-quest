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
  private spherical = new THREE.Spherical(1, Math.PI / 2, 0);
  private isLoading = false;
  
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
    
    // Panorama sphere
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.BackSide });
    this.panoramaSphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.panoramaSphere);
    
    // Setup
    this.setupVR();
    this.setupControls();
    
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
      this.spherical.theta -= dx * 0.005;
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi + dy * 0.005));
      this.camera.lookAt(new THREE.Vector3().setFromSpherical(this.spherical));
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
    
    // Set camera direction
    this.spherical.theta = THREE.MathUtils.degToRad(location.heading - 90);
    this.spherical.phi = THREE.MathUtils.degToRad(90 - (location.pitch || 0));
    this.camera.lookAt(new THREE.Vector3().setFromSpherical(this.spherical));
    
    // Try to load Street View panorama
    try {
      const panoId = await this.getPanoramaId(location.lat, location.lng);
      if (panoId) {
        console.log(`🔍 Found pano: ${panoId}`);
        const texture = await this.loadPanoramaTiles(panoId, 'medium');
        
        const material = this.panoramaSphere.material as THREE.MeshBasicMaterial;
        if (material.map) material.map.dispose();
        material.map = texture;
        material.color.setHex(0xFFFFFF);
        material.needsUpdate = true;
        
        console.log(`✅ Loaded panorama for ${location.name}`);
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
  
  private async loadPanoramaTiles(panoId: string, quality: 'preview' | 'medium'): Promise<THREE.Texture> {
    // Use Street View Static API - has CORS support
    // Load 12 images at 30° intervals for better 360° coverage
    
    const level = ZOOM_LEVELS[quality];
    const canvas = document.createElement('canvas');
    canvas.width = level.width;
    canvas.height = level.height;
    const ctx = canvas.getContext('2d')!;
    
    // Fill with dark background initially
    ctx.fillStyle = '#1A3A4A';
    ctx.fillRect(0, 0, level.width, level.height);
    
    // Load 12 images at 30° intervals with 120° FOV for overlap
    const headings = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
    const fov = 120; // Wide FOV for overlap
    
    console.log(`🖼️ Loading ${headings.length} Street View images for pano ${panoId}...`);
    
    let loadedCount = 0;
    
    const loadPromises = headings.map((heading) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Street View Static API URL - max 640x640
        const url = `https://maps.googleapis.com/maps/api/streetview?size=640x640&pano=${panoId}&heading=${heading}&pitch=0&fov=${fov}&key=${API_KEY}`;
        
        img.onload = () => {
          loadedCount++;
          
          // Map heading to canvas x position (equirectangular projection)
          // heading 0 = center of image, wraps at 360
          const centerX = ((heading + 180) % 360) / 360 * level.width;
          
          // Scale to fill height, maintain aspect ratio
          const drawHeight = level.height;
          const drawWidth = (640 / 640) * drawHeight * (fov / 60); // Scale based on FOV
          
          // Draw centered at the heading position
          ctx.drawImage(img, centerX - drawWidth / 2, 0, drawWidth, drawHeight);
          
          // Wrap around for seamless 360
          if (centerX - drawWidth / 2 < 0) {
            ctx.drawImage(img, level.width + centerX - drawWidth / 2, 0, drawWidth, drawHeight);
          }
          if (centerX + drawWidth / 2 > level.width) {
            ctx.drawImage(img, centerX - drawWidth / 2 - level.width, 0, drawWidth, drawHeight);
          }
          
          console.log(`✓ Loaded heading ${heading}° (${loadedCount}/${headings.length})`);
          resolve();
        };
        
        img.onerror = (e) => {
          console.error(`❌ FAILED to load heading ${heading}°:`, e);
          console.error(`URL was: ${url}`);
          resolve();
        };
        
        img.src = url;
      });
    });
    
    await Promise.all(loadPromises);
    
    console.log(`📸 Finished loading ${loadedCount}/${headings.length} images`);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
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
