/**
 * Big Island VR Quest - Main Entry Point
 * 
 * Immersive VR tour of Hawaii's Big Island for Meta Quest
 */

import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import type { AppState, Location, UserSettings } from './types';
import { LOCATIONS } from './data/locations';

// ============================================================================
// Application Class
// ============================================================================

class BigIslandVRApp {
  // Three.js core
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  // VR
  private vrButton: HTMLElement | null = null;
  private controllers: THREE.Group[] = [];
  private controllerGrips: THREE.Group[] = [];
  private controllerModelFactory: XRControllerModelFactory;
  
  // Panorama
  private panoramaSphere: THREE.Mesh | null = null;
  private currentPanoTexture: THREE.Texture | null = null;
  
  // State
  private state: AppState;
  
  // DOM elements
  private canvas: HTMLCanvasElement;
  private loadingEl: HTMLElement;
  private infoEl: HTMLElement;
  private locationNameEl: HTMLElement;
  private locationDescEl: HTMLElement;
  
  // Desktop controls
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = new THREE.Spherical(1, Math.PI / 2, 0);
  
  constructor() {
    // Get DOM elements
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.loadingEl = document.getElementById('loading')!;
    this.infoEl = document.getElementById('info')!;
    this.locationNameEl = document.getElementById('location-name')!;
    this.locationDescEl = document.getElementById('location-desc')!;
    
    // Initialize state
    this.state = this.createInitialState();
    
    // Initialize Three.js
    this.renderer = this.createRenderer();
    this.scene = this.createScene();
    this.camera = this.createCamera();
    
    // Initialize VR
    this.controllerModelFactory = new XRControllerModelFactory();
    this.initVR();
    
    // Create panorama sphere
    this.createPanoramaSphere();
    
    // Set up desktop controls
    this.setupDesktopControls();
    
    // Start
    this.init();
  }
  
  private createInitialState(): AppState {
    return {
      mode: 'loading',
      currentLocation: null,
      currentLocationIndex: 0,
      zoom: {
        active: false,
        level: 1,
        maxZoom: 4,
        targetPosition: new THREE.Vector3(),
        fov: 75,
      },
      vr: {
        active: false,
        mode: null,
        referenceSpace: null,
        controllers: { left: null, right: null },
      },
      ui: {
        tourGuideVisible: false,
        settingsVisible: false,
        mapVisible: false,
      },
      settings: this.loadSettings(),
    };
  }
  
  private loadSettings(): UserSettings {
    const saved = localStorage.getItem('bigislandvr-settings');
    const defaults: UserSettings = {
      snapTurn: true,
      snapTurnAngle: 45,
      vignette: true,
      vignetteIntensity: 0.5,
      aiUpscaling: true,
      timeOfDay: 'auto',
      atmosphericEffects: true,
      masterVolume: 0.8,
      ambientVolume: 0.6,
      uiSounds: true,
      dominantHand: 'right',
      zoomSensitivity: 1,
    };
    
    if (saved) {
      try {
        return { ...defaults, ...JSON.parse(saved) };
      } catch {
        return defaults;
      }
    }
    return defaults;
  }
  
  private createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    return renderer;
  }
  
  private createScene(): THREE.Scene {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0D3B66);
    return scene;
  }
  
  private createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0);
    return camera;
  }
  
  private createPanoramaSphere(): void {
    // Create a large inverted sphere for the panorama
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1); // Invert so texture shows on inside
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      side: THREE.BackSide,
    });
    
    this.panoramaSphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.panoramaSphere);
  }
  
  private async initVR(): Promise<void> {
    // Check for WebXR support
    if ('xr' in navigator) {
      const isSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
      
      if (isSupported) {
        // Create VR button
        this.vrButton = VRButton.createButton(this.renderer);
        document.body.appendChild(this.vrButton);
        
        // Enable the custom button
        const customVRButton = document.getElementById('vr-button');
        if (customVRButton) {
          customVRButton.removeAttribute('disabled');
          customVRButton.addEventListener('click', () => this.enterVR());
        }
        
        // Set up controllers
        this.setupControllers();
        
        // VR session events
        this.renderer.xr.addEventListener('sessionstart', () => this.onVRSessionStart());
        this.renderer.xr.addEventListener('sessionend', () => this.onVRSessionEnd());
      } else {
        console.log('WebXR immersive-vr not supported');
        this.updateVRButtonState(false, 'VR Not Available');
      }
    } else {
      console.log('WebXR not available');
      this.updateVRButtonState(false, 'VR Not Supported');
    }
  }
  
  private updateVRButtonState(enabled: boolean, text: string): void {
    const button = document.getElementById('vr-button');
    if (button) {
      button.textContent = text;
      if (!enabled) {
        button.setAttribute('disabled', 'true');
      }
    }
  }
  
  private setupControllers(): void {
    // Controller 0 (typically right)
    const controller0 = this.renderer.xr.getController(0);
    controller0.addEventListener('selectstart', () => this.onSelectStart(0));
    controller0.addEventListener('selectend', () => this.onSelectEnd(0));
    controller0.addEventListener('squeezestart', () => this.onSqueezeStart(0));
    controller0.addEventListener('squeezeend', () => this.onSqueezeEnd(0));
    this.scene.add(controller0);
    this.controllers.push(controller0);
    
    // Controller 1 (typically left)
    const controller1 = this.renderer.xr.getController(1);
    controller1.addEventListener('selectstart', () => this.onSelectStart(1));
    controller1.addEventListener('selectend', () => this.onSelectEnd(1));
    controller1.addEventListener('squeezestart', () => this.onSqueezeStart(1));
    controller1.addEventListener('squeezeend', () => this.onSqueezeEnd(1));
    this.scene.add(controller1);
    this.controllers.push(controller1);
    
    // Controller grips (for visual models)
    const grip0 = this.renderer.xr.getControllerGrip(0);
    grip0.add(this.controllerModelFactory.createControllerModel(grip0));
    this.scene.add(grip0);
    this.controllerGrips.push(grip0);
    
    const grip1 = this.renderer.xr.getControllerGrip(1);
    grip1.add(this.controllerModelFactory.createControllerModel(grip1));
    this.scene.add(grip1);
    this.controllerGrips.push(grip1);
    
    // Add pointer rays to controllers
    const rayGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5),
    ]);
    const rayMaterial = new THREE.LineBasicMaterial({
      color: 0x7FCDCD,
      transparent: true,
      opacity: 0.6,
    });
    
    const ray0 = new THREE.Line(rayGeometry, rayMaterial);
    controller0.add(ray0);
    
    const ray1 = new THREE.Line(rayGeometry.clone(), rayMaterial.clone());
    controller1.add(ray1);
  }
  
  private async enterVR(): Promise<void> {
    if (this.renderer.xr.isPresenting) return;
    
    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });
      await this.renderer.xr.setSession(session);
    } catch (error) {
      console.error('Failed to enter VR:', error);
    }
  }
  
  private onVRSessionStart(): void {
    this.state.mode = 'vr';
    this.state.vr.active = true;
    console.log('VR session started');
    
    // Hide desktop UI
    this.infoEl.style.display = 'none';
    document.getElementById('desktop-hint')!.style.display = 'none';
    document.getElementById('vr-button')!.style.display = 'none';
  }
  
  private onVRSessionEnd(): void {
    this.state.mode = 'desktop';
    this.state.vr.active = false;
    console.log('VR session ended');
    
    // Show desktop UI
    this.infoEl.style.display = 'block';
    document.getElementById('desktop-hint')!.style.display = 'block';
    document.getElementById('vr-button')!.style.display = 'block';
  }
  
  // Controller event handlers
  private onSelectStart(index: number): void {
    console.log(`Controller ${index} select start (trigger)`);
    // TODO: Implement zoom activation or UI selection
  }
  
  private onSelectEnd(index: number): void {
    console.log(`Controller ${index} select end`);
  }
  
  private onSqueezeStart(index: number): void {
    console.log(`Controller ${index} squeeze start (grip)`);
    // TODO: Implement menu toggle
  }
  
  private onSqueezeEnd(index: number): void {
    console.log(`Controller ${index} squeeze end`);
  }
  
  private setupDesktopControls(): void {
    // Mouse drag to look around
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging || this.state.vr.active) return;
      
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      
      this.spherical.theta -= deltaX * 0.005;
      this.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, 
        this.spherical.phi + deltaY * 0.005));
      
      this.updateCameraFromSpherical();
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    // Scroll to zoom
    this.canvas.addEventListener('wheel', (e) => {
      if (this.state.vr.active) return;
      
      const delta = e.deltaY > 0 ? 1.1 : 0.9;
      this.camera.fov = Math.max(20, Math.min(100, this.camera.fov * delta));
      this.camera.updateProjectionMatrix();
    });
    
    // Window resize
    window.addEventListener('resize', () => this.onResize());
  }
  
  private updateCameraFromSpherical(): void {
    const target = new THREE.Vector3();
    target.setFromSpherical(this.spherical);
    this.camera.lookAt(target);
  }
  
  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  private async init(): Promise<void> {
    console.log('Big Island VR Quest initializing...');
    
    // Load first location
    await this.loadLocation(0);
    
    // Hide loading screen
    this.loadingEl.classList.add('hidden');
    this.state.mode = 'desktop';
    
    // Start render loop
    this.renderer.setAnimationLoop((time, frame) => this.render(time, frame));
    
    console.log('Big Island VR Quest ready!');
  }
  
  private async loadLocation(index: number): Promise<void> {
    if (index < 0 || index >= LOCATIONS.length) return;
    
    const location = LOCATIONS[index];
    this.state.currentLocation = location;
    this.state.currentLocationIndex = index;
    
    // Update UI
    this.locationNameEl.textContent = location.name;
    this.locationDescEl.textContent = location.summary || location.desc;
    
    // Set initial camera direction based on location heading
    this.spherical.theta = THREE.MathUtils.degToRad(location.heading - 90);
    this.spherical.phi = THREE.MathUtils.degToRad(90 - (location.pitch || 0));
    this.updateCameraFromSpherical();
    
    // TODO: Load actual panorama from Street View
    // For now, just update the sphere color based on region
    const regionColors: Record<string, number> = {
      'Hilo': 0x2A9D8F,
      'Hamakua': 0x4CAF50,
      'Puna': 0xE63946,
      'Volcano': 0xFF6B35,
      'Kaʻū': 0xF4A261,
      'Kona': 0x3DA5D9,
      'Kohala': 0x9B5DE5,
    };
    
    if (this.panoramaSphere) {
      (this.panoramaSphere.material as THREE.MeshBasicMaterial).color.setHex(
        regionColors[location.region] || 0x333333
      );
    }
    
    console.log(`Loaded location: ${location.name} (${location.region})`);
  }
  
  private render(time: number, frame?: XRFrame): void {
    // Update VR controllers
    if (frame && this.state.vr.active) {
      this.updateControllers(frame);
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  private updateControllers(frame: XRFrame): void {
    const session = frame.session;
    
    for (let i = 0; i < this.controllers.length; i++) {
      const controller = this.controllers[i];
      const inputSource = session.inputSources[i];
      
      if (inputSource && inputSource.gamepad) {
        const gamepad = inputSource.gamepad;
        
        // Read thumbstick values
        const thumbstickX = gamepad.axes[2] || 0;
        const thumbstickY = gamepad.axes[3] || 0;
        
        // Right thumbstick for turning (or left if left-handed)
        if (i === 0) { // Right controller
          if (this.state.settings.snapTurn) {
            // Snap turn
            if (Math.abs(thumbstickX) > 0.8) {
              // TODO: Implement snap turn
            }
          } else {
            // Smooth turn
            this.spherical.theta -= thumbstickX * 0.02;
            this.updateCameraFromSpherical();
          }
        }
        
        // Left thumbstick for location navigation
        if (i === 1) { // Left controller
          // TODO: Implement location browsing with thumbstick
        }
      }
    }
  }
}

// ============================================================================
// Initialize App
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  new BigIslandVRApp();
});
