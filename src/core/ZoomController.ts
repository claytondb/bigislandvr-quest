/**
 * Zoom Controller
 * 
 * Handles optical zoom functionality - the key differentiator from Wander VR.
 * Allows users to zoom into any part of the panorama with smooth transitions.
 */

import * as THREE from 'three';
import type { ZoomState } from '../types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FOV = 75;
const MIN_FOV = 15; // Maximum zoom (narrowest FOV)
const MAX_FOV = 100; // Minimum zoom (widest FOV)
const ZOOM_SPEED = 0.02;
const SMOOTH_FACTOR = 0.1;

// ============================================================================
// Zoom Controller Class
// ============================================================================

export class ZoomController {
  private camera: THREE.PerspectiveCamera;
  private state: ZoomState;
  private targetFOV: number = DEFAULT_FOV;
  private isZoomingIn: boolean = false;
  private zoomReticle: THREE.Mesh | null = null;
  private scene: THREE.Scene;
  
  // Callbacks
  private onZoomChange?: (level: number, fov: number) => void;
  private onHighQualityRequest?: () => void;
  
  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.camera = camera;
    this.scene = scene;
    
    this.state = {
      active: false,
      level: 1,
      maxZoom: 4,
      targetPosition: new THREE.Vector3(0, 0, -1),
      fov: DEFAULT_FOV,
    };
    
    this.createReticle();
  }
  
  /**
   * Create a zoom reticle that shows where the user is zooming
   */
  private createReticle(): void {
    // Outer ring
    const ringGeometry = new THREE.RingGeometry(0.02, 0.025, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x7FCDCD,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    
    this.zoomReticle = new THREE.Mesh(ringGeometry, ringMaterial);
    this.zoomReticle.position.set(0, 0, -2);
    this.zoomReticle.renderOrder = 999;
    
    // Add crosshair
    const crosshairSize = 0.015;
    const crosshairGeometry = new THREE.BufferGeometry();
    const crosshairVertices = new Float32Array([
      -crosshairSize, 0, 0, crosshairSize, 0, 0, // Horizontal
      0, -crosshairSize, 0, 0, crosshairSize, 0, // Vertical
    ]);
    crosshairGeometry.setAttribute('position', new THREE.BufferAttribute(crosshairVertices, 3));
    
    const crosshairMaterial = new THREE.LineBasicMaterial({
      color: 0x7FCDCD,
      transparent: true,
      opacity: 0,
    });
    
    const crosshair = new THREE.LineSegments(crosshairGeometry, crosshairMaterial);
    this.zoomReticle.add(crosshair);
    
    // Add to camera so it follows view
    this.camera.add(this.zoomReticle);
  }
  
  /**
   * Set callback for zoom level changes
   */
  setOnZoomChange(callback: (level: number, fov: number) => void): void {
    this.onZoomChange = callback;
  }
  
  /**
   * Set callback for high quality texture request
   */
  setOnHighQualityRequest(callback: () => void): void {
    this.onHighQualityRequest = callback;
  }
  
  /**
   * Start zooming based on controller input
   * @param direction 1 for zoom in, -1 for zoom out, 0 to stop
   */
  startZoom(direction: number): void {
    if (direction > 0) {
      this.isZoomingIn = true;
      this.state.active = true;
      this.showReticle();
    } else if (direction < 0) {
      this.isZoomingIn = false;
      this.state.active = true;
    } else {
      // direction === 0: stop zooming
      this.isZoomingIn = false;
      this.state.active = false;
    }
  }
  
  /**
   * Set zoom level directly (0-1 normalized)
   */
  setZoomLevel(normalized: number): void {
    // Map 0-1 to FOV range
    normalized = Math.max(0, Math.min(1, normalized));
    this.targetFOV = MAX_FOV - normalized * (MAX_FOV - MIN_FOV);
    this.state.active = normalized > 0;
    
    if (normalized > 0) {
      this.showReticle();
    } else {
      this.hideReticle();
    }
  }
  
  /**
   * Update zoom (call every frame)
   */
  update(deltaTime: number): void {
    // Continuous zoom if active
    if (this.state.active) {
      if (this.isZoomingIn) {
        this.targetFOV -= ZOOM_SPEED * deltaTime * 60;
      } else {
        this.targetFOV += ZOOM_SPEED * deltaTime * 60;
      }
    }
    
    // Clamp target FOV
    this.targetFOV = Math.max(MIN_FOV, Math.min(MAX_FOV, this.targetFOV));
    
    // Smooth interpolation
    const prevFOV = this.camera.fov;
    this.camera.fov += (this.targetFOV - this.camera.fov) * SMOOTH_FACTOR;
    this.camera.updateProjectionMatrix();
    
    // Update state
    this.state.fov = this.camera.fov;
    this.state.level = this.calculateZoomLevel();
    
    // Notify if FOV changed significantly
    if (Math.abs(this.camera.fov - prevFOV) > 0.1) {
      this.onZoomChange?.(this.state.level, this.camera.fov);
      
      // Request high quality when zoomed in past 2x
      if (this.state.level >= 2 && prevFOV > this.camera.fov) {
        this.onHighQualityRequest?.();
      }
    }
    
    // Update reticle visibility based on zoom state
    this.updateReticle();
  }
  
  /**
   * Calculate current zoom level (1x = normal, 4x = max)
   */
  private calculateZoomLevel(): number {
    // Map FOV to zoom level
    // DEFAULT_FOV (75) = 1x
    // MIN_FOV (15) = 5x (75/15)
    return DEFAULT_FOV / this.camera.fov;
  }
  
  /**
   * Show zoom reticle
   */
  private showReticle(): void {
    if (!this.zoomReticle) return;
    
    const material = this.zoomReticle.material as THREE.MeshBasicMaterial;
    material.opacity = 0.8;
    
    // Also show crosshair
    const crosshair = this.zoomReticle.children[0];
    if (crosshair) {
      (crosshair as THREE.LineSegments).material = new THREE.LineBasicMaterial({
        color: 0x7FCDCD,
        transparent: true,
        opacity: 0.8,
      });
    }
  }
  
  /**
   * Hide zoom reticle
   */
  private hideReticle(): void {
    if (!this.zoomReticle) return;
    
    const material = this.zoomReticle.material as THREE.MeshBasicMaterial;
    material.opacity = 0;
    
    // Also hide crosshair
    const crosshair = this.zoomReticle.children[0];
    if (crosshair) {
      (crosshair as THREE.LineSegments).material = new THREE.LineBasicMaterial({
        color: 0x7FCDCD,
        transparent: true,
        opacity: 0,
      });
    }
  }
  
  /**
   * Update reticle based on zoom state
   */
  private updateReticle(): void {
    if (!this.zoomReticle) return;
    
    // Scale reticle based on zoom level (smaller when more zoomed)
    const scale = 1 / this.state.level;
    this.zoomReticle.scale.setScalar(scale);
    
    // Pulse effect when actively zooming
    if (this.state.active) {
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
      this.zoomReticle.scale.multiplyScalar(pulse);
    }
    
    // Fade out when not zoomed
    if (this.state.level < 1.1 && !this.state.active) {
      this.hideReticle();
    }
  }
  
  /**
   * Reset zoom to default
   */
  reset(): void {
    this.targetFOV = DEFAULT_FOV;
    this.state.active = false;
    this.isZoomingIn = false;
    this.hideReticle();
  }
  
  /**
   * Get current zoom state
   */
  getState(): ZoomState {
    return { ...this.state };
  }
  
  /**
   * Get formatted zoom level for display
   */
  getZoomDisplay(): string {
    return `${this.state.level.toFixed(1)}x`;
  }
  
  /**
   * Check if currently zoomed in
   */
  isZoomed(): boolean {
    return this.state.level > 1.1;
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.zoomReticle) {
      this.camera.remove(this.zoomReticle);
      this.zoomReticle.geometry.dispose();
      (this.zoomReticle.material as THREE.Material).dispose();
    }
  }
}

// ============================================================================
// VR Zoom Controller (specialized for Quest)
// ============================================================================

export class VRZoomController extends ZoomController {
  private triggerValue: number = 0;
  private thumbstickY: number = 0;
  
  /**
   * Update from VR controller input
   * @param trigger Right trigger value (0-1)
   * @param thumbstickY Right thumbstick Y (-1 to 1)
   */
  updateFromController(trigger: number, thumbstickY: number): void {
    this.triggerValue = trigger;
    this.thumbstickY = thumbstickY;
    
    // Trigger-based zoom: hold trigger to zoom in
    if (trigger > 0.1) {
      this.setZoomLevel(trigger);
    } else if (Math.abs(thumbstickY) > 0.3) {
      // Thumbstick-based zoom: push forward to zoom in, back to zoom out
      this.startZoom(thumbstickY > 0 ? 1 : -1);
    } else {
      this.startZoom(0);
      if (trigger < 0.1) {
        this.setZoomLevel(0);
      }
    }
  }
  
  /**
   * Get haptic feedback intensity based on zoom level
   */
  getHapticIntensity(): number {
    // Subtle haptic feedback when zooming
    if (this.triggerValue > 0.1) {
      return this.triggerValue * 0.1; // 0-10% intensity
    }
    return 0;
  }
}
