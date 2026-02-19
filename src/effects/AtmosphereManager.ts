/**
 * Atmosphere Manager
 * 
 * Handles time-of-day, weather, and atmospheric effects.
 * Creates immersion through visual ambiance.
 */

import * as THREE from 'three';
import type { Location, TimeOfDay, AtmosphereConfig } from '../types';

// ============================================================================
// Constants
// ============================================================================

const TIME_COLORS: Record<TimeOfDay, { sky: number; ambient: number; intensity: number }> = {
  dawn: {
    sky: 0xFF8050,
    ambient: 0xFFB480,
    intensity: 0.6,
  },
  day: {
    sky: 0x87CEEB,
    ambient: 0xFFFFFF,
    intensity: 1.0,
  },
  golden: {
    sky: 0xFFB030,
    ambient: 0xFFD080,
    intensity: 0.8,
  },
  dusk: {
    sky: 0xFF6040,
    ambient: 0xC06080,
    intensity: 0.5,
  },
  night: {
    sky: 0x0A0A1E,
    ambient: 0x202040,
    intensity: 0.2,
  },
};

// ============================================================================
// Atmosphere Manager
// ============================================================================

export class AtmosphereManager {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  
  // Sky sphere
  private skySphere: THREE.Mesh | null = null;
  private skyMaterial: THREE.ShaderMaterial | null = null;
  
  // Fog
  private fogEnabled: boolean = false;
  
  // Mist particles
  private mistParticles: THREE.Points | null = null;
  private mistEnabled: boolean = false;
  
  // Current state
  private currentTime: TimeOfDay = 'day';
  private targetColors: { sky: number; ambient: number; intensity: number };
  private currentColors: { sky: THREE.Color; ambient: THREE.Color; intensity: number };
  
  // Settings
  private enabled: boolean = true;
  private transitionSpeed: number = 0.02;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.targetColors = TIME_COLORS.day;
    this.currentColors = {
      sky: new THREE.Color(TIME_COLORS.day.sky),
      ambient: new THREE.Color(TIME_COLORS.day.ambient),
      intensity: TIME_COLORS.day.intensity,
    };
    
    this.init();
  }
  
  /**
   * Initialize atmosphere elements
   */
  private init(): void {
    this.createMistParticles();
  }
  
  /**
   * Create mist particle system
   */
  private createMistParticles(): void {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in a hemisphere around the viewer
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const radius = 20 + Math.random() * 80;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = -5 + Math.random() * 30; // From ground to mid-height
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      sizes[i] = 2 + Math.random() * 4;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      color: 0xCCCCCC,
      size: 3,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    this.mistParticles = new THREE.Points(geometry, material);
    this.mistParticles.frustumCulled = false;
    this.scene.add(this.mistParticles);
  }
  
  /**
   * Set time of day
   */
  setTimeOfDay(time: TimeOfDay): void {
    if (this.currentTime === time) return;
    
    this.currentTime = time;
    this.targetColors = TIME_COLORS[time];
  }
  
  /**
   * Apply location atmosphere settings
   */
  applyLocation(location: Location): void {
    const atmosphere = location.atmosphere;
    
    // Enable/disable mist
    this.setMistEnabled(atmosphere.mist);
    
    // Volcanic atmosphere adjustments
    if (atmosphere.volcanic) {
      this.setFogEnabled(true, 0x888880, 100, 400);
    } else {
      this.setFogEnabled(false);
    }
    
    // Apply time of day if specified
    if (atmosphere.timeOfDay) {
      this.setTimeOfDay(atmosphere.timeOfDay);
    }
  }
  
  /**
   * Enable/disable mist effect
   */
  setMistEnabled(enabled: boolean): void {
    this.mistEnabled = enabled;
  }
  
  /**
   * Enable/disable fog
   */
  setFogEnabled(enabled: boolean, color?: number, near?: number, far?: number): void {
    this.fogEnabled = enabled;
    
    if (enabled && color !== undefined) {
      this.scene.fog = new THREE.Fog(color, near || 50, far || 200);
    } else {
      this.scene.fog = null;
    }
  }
  
  /**
   * Update atmosphere (call every frame)
   */
  update(deltaTime: number): void {
    if (!this.enabled) return;
    
    // Smooth transition of colors
    const targetSkyColor = new THREE.Color(this.targetColors.sky);
    const targetAmbientColor = new THREE.Color(this.targetColors.ambient);
    
    this.currentColors.sky.lerp(targetSkyColor, this.transitionSpeed);
    this.currentColors.ambient.lerp(targetAmbientColor, this.transitionSpeed);
    this.currentColors.intensity += (this.targetColors.intensity - this.currentColors.intensity) * this.transitionSpeed;
    
    // Update scene background
    this.scene.background = this.currentColors.sky;
    
    // Update mist
    if (this.mistParticles) {
      const material = this.mistParticles.material as THREE.PointsMaterial;
      
      // Fade mist in/out
      if (this.mistEnabled) {
        material.opacity = Math.min(material.opacity + 0.01, 0.3);
      } else {
        material.opacity = Math.max(material.opacity - 0.01, 0);
      }
      
      // Animate mist particles
      if (material.opacity > 0) {
        this.animateMist(deltaTime);
      }
    }
  }
  
  /**
   * Animate mist particle movement
   */
  private animateMist(deltaTime: number): void {
    if (!this.mistParticles) return;
    
    const positions = this.mistParticles.geometry.attributes.position;
    const posArray = positions.array as Float32Array;
    
    for (let i = 0; i < posArray.length; i += 3) {
      // Slow drift
      posArray[i] += (Math.random() - 0.5) * 0.1;
      posArray[i + 1] += (Math.random() - 0.5) * 0.05;
      posArray[i + 2] += (Math.random() - 0.5) * 0.1;
      
      // Keep particles in bounds
      const distance = Math.sqrt(posArray[i] ** 2 + posArray[i + 2] ** 2);
      if (distance > 100) {
        const angle = Math.random() * Math.PI * 2;
        posArray[i] = 20 * Math.cos(angle);
        posArray[i + 2] = 20 * Math.sin(angle);
      }
      
      // Reset if too high/low
      if (posArray[i + 1] > 30) posArray[i + 1] = -5;
      if (posArray[i + 1] < -10) posArray[i + 1] = 30;
    }
    
    positions.needsUpdate = true;
  }
  
  /**
   * Get current time based on real time
   */
  static getTimeFromHour(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 18) return 'golden';
    if (hour >= 18 && hour < 20) return 'dusk';
    return 'night';
  }
  
  /**
   * Enable/disable atmosphere effects
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    if (!enabled) {
      this.scene.fog = null;
      if (this.mistParticles) {
        (this.mistParticles.material as THREE.PointsMaterial).opacity = 0;
      }
    }
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.mistParticles) {
      this.scene.remove(this.mistParticles);
      this.mistParticles.geometry.dispose();
      (this.mistParticles.material as THREE.Material).dispose();
    }
    
    if (this.skySphere) {
      this.scene.remove(this.skySphere);
      this.skySphere.geometry.dispose();
      (this.skySphere.material as THREE.Material).dispose();
    }
  }
}

// ============================================================================
// Comfort Vignette
// ============================================================================

export class ComfortVignette {
  private mesh: THREE.Mesh | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private camera: THREE.Camera;
  
  // Settings
  private enabled: boolean = true;
  private intensity: number = 0.5;
  private currentIntensity: number = 0;
  private targetIntensity: number = 0;
  
  constructor(camera: THREE.Camera) {
    this.camera = camera;
    this.create();
  }
  
  /**
   * Create vignette mesh
   */
  private create(): void {
    // Full-screen quad attached to camera
    const geometry = new THREE.PlaneGeometry(2, 2);
    
    this.material = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        intensity: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform float intensity;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          
          // Vignette falloff
          float vignette = smoothstep(0.3, 0.7, dist);
          
          gl_FragColor = vec4(0.0, 0.0, 0.0, vignette * intensity);
        }
      `,
    });
    
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 9999;
    
    // Attach to camera
    this.camera.add(this.mesh);
    this.mesh.position.z = -0.1;
  }
  
  /**
   * Show vignette (e.g., during movement)
   */
  show(): void {
    if (!this.enabled) return;
    this.targetIntensity = this.intensity;
  }
  
  /**
   * Hide vignette
   */
  hide(): void {
    this.targetIntensity = 0;
  }
  
  /**
   * Update vignette (smooth fade)
   */
  update(deltaTime: number): void {
    if (!this.material) return;
    
    // Smooth interpolation
    this.currentIntensity += (this.targetIntensity - this.currentIntensity) * 0.1;
    this.material.uniforms.intensity.value = this.currentIntensity;
  }
  
  /**
   * Set vignette intensity (0-1)
   */
  setIntensity(intensity: number): void {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }
  
  /**
   * Enable/disable vignette
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.targetIntensity = 0;
    }
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.mesh) {
      this.camera.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.material?.dispose();
    }
  }
}
