/**
 * Big Island VR Quest - Main Entry Point
 * 
 * Immersive VR tour of Hawaii's Big Island for Meta Quest
 */

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import type { AppState, Location, UserSettings } from './types';
import { LOCATIONS, REGIONS, TOURS } from './data/locations';
import { PanoramaLoader, ProgressivePanoramaLoader } from './panorama/PanoramaLoader';
import { ZoomController, VRZoomController } from './core/ZoomController';
import { QuestControllerManager } from './controllers/QuestControllerManager';
import { VRUIPanel, VRUIManager } from './ui/VRUIPanel';
import { SpatialAudioManager, UISoundManager } from './audio/SpatialAudio';
import { AtmosphereManager, ComfortVignette } from './effects/AtmosphereManager';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  API_KEY: 'AIzaSyBmSDHrsQunVjxhZ4UHQ0asdUY6vZVFszY',
  SNAP_TURN_ANGLE: 45,
  DEFAULT_LOCATION_INDEX: 0,
};

// ============================================================================
// Application Class
// ============================================================================

class BigIslandVRApp {
  // Three.js core
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  
  // VR
  private vrButton: HTMLElement | null = null;
  private controllerModelFactory!: XRControllerModelFactory;
  private questControllers: QuestControllerManager | null = null;
  
  // Panorama
  private panoramaSphere: THREE.Mesh | null = null;
  private panoramaLoader!: ProgressivePanoramaLoader;
  
  // Systems
  private zoomController!: ZoomController;
  private uiManager!: VRUIManager;
  private audioManager!: SpatialAudioManager;
  private uiSounds!: UISoundManager;
  private atmosphereManager!: AtmosphereManager;
  private vignette!: ComfortVignette;
  
  // State
  private state: AppState;
  private currentLocationIndex: number = 0;
  
  // DOM elements
  private canvas!: HTMLCanvasElement;
  private loadingEl!: HTMLElement;
  private locationNameEl!: HTMLElement;
  private locationDescEl!: HTMLElement;
  
  // Desktop controls
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = new THREE.Spherical(1, Math.PI / 2, 0);
  private userRotation = 0; // For snap turn
  
  constructor() {
    this.clock = new THREE.Clock();
    this.state = this.createInitialState();
    
    this.init();
  }
  
  private async init(): Promise<void> {
    console.log('🌴 Big Island VR Quest initializing...');
    
    // Get DOM elements
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.loadingEl = document.getElementById('loading')!;
    this.locationNameEl = document.getElementById('location-name')!;
    this.locationDescEl = document.getElementById('location-desc')!;
    
    // Initialize Three.js
    this.initRenderer();
    this.initScene();
    this.initCamera();
    
    // Initialize VR
    this.controllerModelFactory = new XRControllerModelFactory();
    await this.initVR();
    
    // Initialize systems
    this.initPanorama();
    this.initZoom();
    this.initUI();
    this.initAudio();
    this.initAtmosphere();
    
    // Set up desktop controls
    this.setupDesktopControls();
    
    // Load first location
    await this.goToLocation(CONFIG.DEFAULT_LOCATION_INDEX);
    
    // Hide loading screen
    this.loadingEl.classList.add('hidden');
    this.state.mode = 'desktop';
    
    // Start render loop
    this.renderer.setAnimationLoop((time, frame) => this.render(time, frame));
    
    console.log('✅ Big Island VR Quest ready!');
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
  
  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.xr.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    
    window.addEventListener('resize', () => this.onResize());
  }
  
  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0D3B66);
  }
  
  private initCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.6, 0); // Average eye height
  }
  
  private initPanorama(): void {
    // Create panorama sphere
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    geometry.scale(-1, 1, 1); // Invert for interior viewing
    
    const material = new THREE.MeshBasicMaterial({
      color: 0x333333,
      side: THREE.BackSide,
    });
    
    this.panoramaSphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.panoramaSphere);
    
    // Initialize panorama loader
    this.panoramaLoader = new ProgressivePanoramaLoader(CONFIG.API_KEY);
  }
  
  private initZoom(): void {
    this.zoomController = new VRZoomController(this.camera, this.scene);
    
    this.zoomController.setOnZoomChange((level, fov) => {
      console.log(`Zoom: ${level.toFixed(1)}x (FOV: ${fov.toFixed(0)}°)`);
    });
    
    this.zoomController.setOnHighQualityRequest(() => {
      // Request higher quality panorama when zoomed
      if (this.state.currentLocation) {
        console.log('Requesting high quality panorama...');
        // TODO: Implement high-quality tile loading
      }
    });
  }
  
  private initUI(): void {
    this.uiManager = new VRUIManager(this.scene);
    
    // Create Tour Guide panel
    const tourGuide = this.uiManager.createPanel({
      id: 'tour-guide',
      width: 0.8,
      height: 0.6,
      curved: true,
      curveRadius: 2.5,
      position: new THREE.Vector3(-1.2, 1.5, -1.5),
      followUser: false,
      backgroundColor: 0x1A1A1A,
      backgroundOpacity: 0.9,
    });
    
    // Add title
    tourGuide.addElement({
      type: 'text',
      id: 'title',
      position: { x: 0.05, y: 0.05 },
      width: 0.7,
      height: 0.08,
      content: '🗺️ Tour Guide',
      fontSize: 32,
      color: 0x7FCDCD,
    });
    
    // Add location name
    tourGuide.addElement({
      type: 'text',
      id: 'location-name',
      position: { x: 0.05, y: 0.15 },
      width: 0.7,
      height: 0.06,
      content: 'Loading...',
      fontSize: 28,
      color: 0xFAF8F5,
    });
    
    // Add prev/next buttons
    tourGuide.addElement({
      type: 'button',
      id: 'prev-btn',
      position: { x: 0.05, y: 0.45 },
      width: 0.35,
      height: 0.1,
      content: '◀ Previous',
      onClick: () => this.prevLocation(),
    });
    
    tourGuide.addElement({
      type: 'button',
      id: 'next-btn',
      position: { x: 0.42, y: 0.45 },
      width: 0.35,
      height: 0.1,
      content: 'Next ▶',
      onClick: () => this.nextLocation(),
    });
    
    tourGuide.hide(); // Hidden by default
  }
  
  private initAudio(): void {
    this.audioManager = new SpatialAudioManager();
    this.uiSounds = new UISoundManager();
    
    // Audio will be initialized on first user interaction
    const initAudioOnInteraction = async () => {
      await this.audioManager.init();
      document.removeEventListener('click', initAudioOnInteraction);
      document.removeEventListener('touchstart', initAudioOnInteraction);
    };
    
    document.addEventListener('click', initAudioOnInteraction, { once: true });
    document.addEventListener('touchstart', initAudioOnInteraction, { once: true });
  }
  
  private initAtmosphere(): void {
    this.atmosphereManager = new AtmosphereManager(this.scene, this.camera);
    this.vignette = new ComfortVignette(this.camera);
    
    // Apply settings
    this.vignette.setEnabled(this.state.settings.vignette);
    this.vignette.setIntensity(this.state.settings.vignetteIntensity);
    this.atmosphereManager.setEnabled(this.state.settings.atmosphericEffects);
  }
  
  private async initVR(): Promise<void> {
    if (!('xr' in navigator)) {
      console.log('WebXR not available');
      this.updateVRButtonState(false, 'VR Not Supported');
      return;
    }
    
    const isSupported = await (navigator as any).xr.isSessionSupported('immersive-vr');
    
    if (isSupported) {
      // Create VR button
      this.vrButton = VRButton.createButton(this.renderer);
      document.body.appendChild(this.vrButton);
      
      // Enable custom button
      const customVRButton = document.getElementById('vr-button');
      if (customVRButton) {
        customVRButton.removeAttribute('disabled');
        customVRButton.addEventListener('click', () => this.enterVR());
      }
      
      // Set up controllers
      this.setupVRControllers();
      
      // VR session events
      this.renderer.xr.addEventListener('sessionstart', () => this.onVRSessionStart());
      this.renderer.xr.addEventListener('sessionend', () => this.onVRSessionEnd());
    } else {
      console.log('WebXR immersive-vr not supported');
      this.updateVRButtonState(false, 'VR Not Available');
    }
  }
  
  private setupVRControllers(): void {
    this.questControllers = new QuestControllerManager(this.renderer);
    this.questControllers.setupControllers(this.scene);
    
    this.questControllers.setEvents({
      onZoomChange: (value) => {
        if (this.zoomController instanceof VRZoomController) {
          this.zoomController.updateFromController(value, 0);
        }
      },
      onTurnLeft: () => {
        this.userRotation -= THREE.MathUtils.degToRad(this.state.settings.snapTurnAngle);
        this.vignette.show();
        setTimeout(() => this.vignette.hide(), 200);
      },
      onTurnRight: () => {
        this.userRotation += THREE.MathUtils.degToRad(this.state.settings.snapTurnAngle);
        this.vignette.show();
        setTimeout(() => this.vignette.hide(), 200);
      },
      onTourGuideToggle: () => {
        const panel = this.uiManager.getPanel('tour-guide');
        if (panel) panel.toggle();
      },
      onSelect: () => {
        this.uiManager.click();
      },
      onBack: () => {
        const panel = this.uiManager.getPanel('tour-guide');
        if (panel?.mesh.visible) panel.hide();
      },
    });
  }
  
  private updateVRButtonState(enabled: boolean, text: string): void {
    const button = document.getElementById('vr-button');
    if (button) {
      const textSpan = button.querySelector('span:last-child') || button;
      textSpan.textContent = text;
      if (!enabled) {
        button.setAttribute('disabled', 'true');
      }
    }
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
    console.log('🥽 VR session started');
    
    // Hide desktop UI
    document.getElementById('info')!.style.display = 'none';
    document.getElementById('desktop-hint')!.style.display = 'none';
    document.getElementById('vr-button')!.style.display = 'none';
    
    // Show VR UI
    const tourGuide = this.uiManager.getPanel('tour-guide');
    if (tourGuide) tourGuide.show();
  }
  
  private onVRSessionEnd(): void {
    this.state.mode = 'desktop';
    this.state.vr.active = false;
    console.log('VR session ended');
    
    // Show desktop UI
    document.getElementById('info')!.style.display = 'block';
    document.getElementById('desktop-hint')!.style.display = 'block';
    document.getElementById('vr-button')!.style.display = 'flex';
    
    // Hide VR UI
    const tourGuide = this.uiManager.getPanel('tour-guide');
    if (tourGuide) tourGuide.hide();
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
    
    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (this.state.vr.active) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          this.prevLocation();
          break;
        case 'ArrowRight':
          this.nextLocation();
          break;
        case 'g':
        case 'G':
          const panel = this.uiManager.getPanel('tour-guide');
          if (panel) panel.toggle();
          break;
      }
    });
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
  
  // ============================================================================
  // Location Navigation
  // ============================================================================
  
  private async goToLocation(index: number): Promise<void> {
    if (index < 0 || index >= LOCATIONS.length) return;
    
    const location = LOCATIONS[index];
    this.currentLocationIndex = index;
    this.state.currentLocation = location;
    this.state.currentLocationIndex = index;
    
    console.log(`📍 Loading: ${location.name}`);
    
    // Update desktop UI
    this.locationNameEl.textContent = location.name;
    this.locationDescEl.textContent = location.summary || location.desc;
    
    // Update VR UI
    const tourGuide = this.uiManager.getPanel('tour-guide');
    if (tourGuide) {
      tourGuide.removeElement('location-name');
      tourGuide.addElement({
        type: 'text',
        id: 'location-name',
        position: { x: 0.05, y: 0.15 },
        width: 0.7,
        height: 0.06,
        content: location.name,
        fontSize: 28,
        color: 0xFAF8F5,
      });
    }
    
    // Set camera direction
    this.spherical.theta = THREE.MathUtils.degToRad(location.heading - 90);
    this.spherical.phi = THREE.MathUtils.degToRad(90 - (location.pitch || 0));
    this.updateCameraFromSpherical();
    
    // Load panorama
    try {
      await this.panoramaLoader.loadProgressive(
        location,
        (texture, quality) => {
          if (this.panoramaSphere) {
            const material = this.panoramaSphere.material as THREE.MeshBasicMaterial;
            if (material.map) material.map.dispose();
            material.map = texture;
            material.color.setHex(0xFFFFFF);
            material.needsUpdate = true;
            console.log(`📷 Loaded ${quality} quality panorama`);
          }
        }
      );
    } catch (error) {
      console.warn('Failed to load panorama:', error);
      // Set region color as fallback
      const regionColor = REGIONS[location.region]?.color || '#333333';
      if (this.panoramaSphere) {
        const material = this.panoramaSphere.material as THREE.MeshBasicMaterial;
        material.color.set(regionColor);
        material.map = null;
      }
    }
    
    // Update audio
    this.audioManager.setLocationAudio(location);
    
    // Update atmosphere
    this.atmosphereManager.applyLocation(location);
    
    // Show vignette during transition
    this.vignette.show();
    setTimeout(() => this.vignette.hide(), 500);
  }
  
  private nextLocation(): void {
    const newIndex = (this.currentLocationIndex + 1) % LOCATIONS.length;
    this.goToLocation(newIndex);
  }
  
  private prevLocation(): void {
    const newIndex = (this.currentLocationIndex - 1 + LOCATIONS.length) % LOCATIONS.length;
    this.goToLocation(newIndex);
  }
  
  // ============================================================================
  // Render Loop
  // ============================================================================
  
  private render(time: number, frame?: XRFrame): void {
    const deltaTime = this.clock.getDelta();
    
    // Update VR controllers
    if (frame && this.state.vr.active && this.questControllers) {
      this.questControllers.update(frame, deltaTime);
      
      // Apply user rotation (snap turn)
      this.camera.rotation.y = this.userRotation;
    }
    
    // Update systems
    this.zoomController.update(deltaTime);
    this.uiManager.update(this.camera, deltaTime);
    this.audioManager.update(deltaTime);
    this.atmosphereManager.update(deltaTime);
    this.vignette.update(deltaTime);
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================================================
// Initialize App
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  new BigIslandVRApp();
});
