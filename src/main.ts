/**
 * Big Island VR Quest - Main Entry Point
 * Simplified version for debugging
 */

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { LOCATIONS, REGIONS } from './data/locations';

// ============================================================================
// Simple App
// ============================================================================

class BigIslandVRApp {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private panoramaSphere: THREE.Mesh;
  private clock: THREE.Clock;
  
  private currentLocationIndex = 0;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = new THREE.Spherical(1, Math.PI / 2, 0);
  
  constructor() {
    console.log('🌴 Big Island VR Quest starting...');
    
    this.clock = new THREE.Clock();
    
    // Get canvas
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.xr.enabled = true;
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1A6B7C);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.6, 0);
    
    // Create panorama sphere with gradient texture
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1);
    
    // Create a gradient texture
    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.width = 512;
    gradientCanvas.height = 256;
    const ctx = gradientCanvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#87CEEB');  // Sky blue
    gradient.addColorStop(0.5, '#98D8C8'); // Seafoam
    gradient.addColorStop(1, '#2A9D8F');   // Teal (ground)
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    
    // Add some text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌴 Big Island VR Quest 🌴', 256, 100);
    ctx.font = '16px sans-serif';
    ctx.fillText('Drag to look around • Arrow keys to change location', 256, 140);
    
    const texture = new THREE.CanvasTexture(gradientCanvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    
    this.panoramaSphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.panoramaSphere);
    
    // Set up VR
    this.setupVR();
    
    // Set up controls
    this.setupControls();
    
    // Update UI
    this.updateLocationUI();
    
    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) loading.classList.add('hidden');
    
    // Start render loop
    this.renderer.setAnimationLoop(() => this.render());
    
    console.log('✅ App ready! Locations:', LOCATIONS.length);
  }
  
  private setupVR(): void {
    if ('xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
        if (supported) {
          const vrButton = VRButton.createButton(this.renderer);
          document.body.appendChild(vrButton);
          
          const customBtn = document.getElementById('vr-button');
          if (customBtn) {
            customBtn.removeAttribute('disabled');
            customBtn.textContent = '🥽 Enter VR';
          }
        }
      });
    }
  }
  
  private setupControls(): void {
    const canvas = this.renderer.domElement;
    
    // Mouse drag
    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      
      this.spherical.theta -= deltaX * 0.005;
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.spherical.phi + deltaY * 0.005));
      
      const target = new THREE.Vector3().setFromSpherical(this.spherical);
      this.camera.lookAt(target);
      
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    // Scroll zoom
    canvas.addEventListener('wheel', (e) => {
      const delta = e.deltaY > 0 ? 1.1 : 0.9;
      this.camera.fov = Math.max(20, Math.min(100, this.camera.fov * delta));
      this.camera.updateProjectionMatrix();
    });
    
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        this.currentLocationIndex = (this.currentLocationIndex + 1) % LOCATIONS.length;
        this.updateLocationUI();
      } else if (e.key === 'ArrowLeft') {
        this.currentLocationIndex = (this.currentLocationIndex - 1 + LOCATIONS.length) % LOCATIONS.length;
        this.updateLocationUI();
      }
    });
    
    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  
  private updateLocationUI(): void {
    const location = LOCATIONS[this.currentLocationIndex];
    
    // Update info panel
    const nameEl = document.getElementById('location-name');
    const descEl = document.getElementById('location-desc');
    if (nameEl) nameEl.textContent = location.name;
    if (descEl) descEl.textContent = location.summary || location.desc;
    
    // Update sphere color based on region
    const regionInfo = REGIONS[location.region];
    const color = regionInfo?.color || '#2A9D8F';
    
    // Create new gradient texture with location info
    const gradientCanvas = document.createElement('canvas');
    gradientCanvas.width = 1024;
    gradientCanvas.height = 512;
    const ctx = gradientCanvas.getContext('2d')!;
    
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.4, '#98D8C8');
    gradient.addColorStop(0.6, color);
    gradient.addColorStop(1, '#1A4A3A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    // Location info
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📍 ${location.name}`, 512, 200);
    
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`${location.region} • Location ${this.currentLocationIndex + 1} of ${LOCATIONS.length}`, 512, 240);
    
    ctx.font = '16px sans-serif';
    ctx.fillText('← → Arrow keys to navigate • Drag to look around • Scroll to zoom', 512, 300);
    
    // Update texture
    const texture = new THREE.CanvasTexture(gradientCanvas);
    const material = this.panoramaSphere.material as THREE.MeshBasicMaterial;
    if (material.map) material.map.dispose();
    material.map = texture;
    material.needsUpdate = true;
    
    // Update camera heading
    this.spherical.theta = THREE.MathUtils.degToRad(location.heading - 90);
    this.spherical.phi = THREE.MathUtils.degToRad(90 - (location.pitch || 0));
    const target = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.lookAt(target);
    
    console.log(`📍 ${location.name} (${location.region})`);
  }
  
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}

// Start app
window.addEventListener('DOMContentLoaded', () => {
  try {
    new BigIslandVRApp();
  } catch (error) {
    console.error('Failed to start app:', error);
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `<h1>Error</h1><p>${error}</p>`;
    }
  }
});
