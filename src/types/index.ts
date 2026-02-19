/**
 * Core type definitions for Big Island VR Quest
 */

// ============================================================================
// Location Types
// ============================================================================

export interface Location {
  id: number;
  name: string;
  desc: string;
  region: Region;
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
  audio: AudioConfig;
  atmosphere: AtmosphereConfig;
  summary: string;
  panoId?: string; // Cached Street View panorama ID
}

export type Region = 
  | 'Hilo'
  | 'Hamakua'
  | 'Puna'
  | 'Volcano'
  | 'Kaʻū'
  | 'Kona'
  | 'Kohala';

export interface AudioConfig {
  ocean?: number;
  birds?: number;
  wind?: number;
  rain?: number;
  waterfall?: number;
  volcanic?: number;
}

export interface AtmosphereConfig {
  mist: boolean;
  volcanic: boolean;
  timeOfDay?: TimeOfDay;
}

export type TimeOfDay = 'dawn' | 'day' | 'golden' | 'dusk' | 'night';

// ============================================================================
// Panorama Types
// ============================================================================

export interface PanoramaData {
  panoId: string;
  location: { lat: number; lng: number };
  heading: number;
  tiles: PanoramaTile[];
  originalWidth: number;
  originalHeight: number;
}

export interface PanoramaTile {
  x: number;
  y: number;
  zoom: number;
  url: string;
  texture?: THREE.Texture;
}

export interface PanoramaLoadProgress {
  loaded: number;
  total: number;
  phase: 'fetching' | 'loading' | 'upscaling' | 'complete';
}

// ============================================================================
// VR/Controller Types
// ============================================================================

export interface XRControllerState {
  hand: 'left' | 'right';
  connected: boolean;
  thumbstick: { x: number; y: number };
  trigger: number; // 0-1
  grip: number; // 0-1
  buttons: {
    a: boolean;
    b: boolean;
    x: boolean;
    y: boolean;
    menu: boolean;
  };
  pose: {
    position: THREE.Vector3;
    rotation: THREE.Quaternion;
  };
  ray: THREE.Ray;
}

export interface VRSessionState {
  active: boolean;
  mode: 'immersive-vr' | 'inline' | null;
  referenceSpace: XRReferenceSpace | null;
  controllers: {
    left: XRControllerState | null;
    right: XRControllerState | null;
  };
}

// ============================================================================
// Zoom Types
// ============================================================================

export interface ZoomState {
  active: boolean;
  level: number; // 1 = normal, up to maxZoom
  maxZoom: number;
  targetPosition: THREE.Vector3; // Where on the sphere we're zooming
  fov: number; // Current field of view
}

// ============================================================================
// UI Types
// ============================================================================

export interface UIPanel {
  id: string;
  visible: boolean;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  width: number;
  height: number;
  followsUser: boolean;
}

export interface UIInteraction {
  panel: UIPanel | null;
  element: string | null;
  hovered: boolean;
  pressed: boolean;
}

// ============================================================================
// App State
// ============================================================================

export interface AppState {
  mode: 'loading' | 'desktop' | 'vr';
  currentLocation: Location | null;
  currentLocationIndex: number;
  zoom: ZoomState;
  vr: VRSessionState;
  ui: {
    tourGuideVisible: boolean;
    settingsVisible: boolean;
    mapVisible: boolean;
  };
  settings: UserSettings;
}

export interface UserSettings {
  // Comfort
  snapTurn: boolean;
  snapTurnAngle: 30 | 45 | 60 | 90;
  vignette: boolean;
  vignetteIntensity: number; // 0-1
  
  // Visual
  aiUpscaling: boolean;
  timeOfDay: TimeOfDay | 'auto';
  atmosphericEffects: boolean;
  
  // Audio
  masterVolume: number; // 0-1
  ambientVolume: number; // 0-1
  uiSounds: boolean;
  
  // Controls
  dominantHand: 'left' | 'right';
  zoomSensitivity: number; // 0.5-2
}

// ============================================================================
// Events
// ============================================================================

export type AppEvent = 
  | { type: 'LOCATION_CHANGE'; location: Location }
  | { type: 'ZOOM_START'; position: THREE.Vector3 }
  | { type: 'ZOOM_UPDATE'; level: number }
  | { type: 'ZOOM_END' }
  | { type: 'VR_SESSION_START' }
  | { type: 'VR_SESSION_END' }
  | { type: 'UI_PANEL_TOGGLE'; panel: string; visible: boolean }
  | { type: 'SETTINGS_CHANGE'; settings: Partial<UserSettings> };

// Need to declare THREE namespace for type references
import type * as THREE from 'three';
