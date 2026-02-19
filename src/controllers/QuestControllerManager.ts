/**
 * Quest Controller Manager
 * 
 * Handles Meta Quest Touch controller input for VR interactions.
 * Based on UX_DESIGN.md controller mappings.
 */

import * as THREE from 'three';
import type { XRControllerState } from '../types';

// ============================================================================
// Controller Mapping (from UX_DESIGN.md)
// ============================================================================
// 
// LEFT CONTROLLER:
// - Thumbstick: Teleport navigation (point + push)
// - Trigger: Confirm teleport
// - Grip: Grab/reposition UI panels
// - X Button: Quick Travel (favorites)
// - Y Button: Toggle Tour Guide panel
// - Menu: Pause / Main menu
//
// RIGHT CONTROLLER:
// - Thumbstick X: Snap/smooth turn
// - Thumbstick Y: (reserved)
// - Trigger: Primary select / interact
// - Grip: ZOOM (key feature)
// - A Button: Confirm / Select
// - B Button: Back / Cancel
//
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export interface ControllerInput {
  // Left controller
  leftThumbstick: { x: number; y: number };
  leftTrigger: number;
  leftGrip: number;
  buttonX: boolean;
  buttonY: boolean;
  buttonMenu: boolean;
  
  // Right controller
  rightThumbstick: { x: number; y: number };
  rightTrigger: number;
  rightGrip: number;
  buttonA: boolean;
  buttonB: boolean;
}

export interface ControllerEvents {
  onTeleportStart?: (direction: THREE.Vector3) => void;
  onTeleportConfirm?: (direction: THREE.Vector3) => void;
  onTeleportCancel?: () => void;
  onZoomChange?: (value: number) => void;
  onTurnLeft?: () => void;
  onTurnRight?: () => void;
  onSelect?: (controller: 'left' | 'right') => void;
  onBack?: () => void;
  onMenuToggle?: () => void;
  onTourGuideToggle?: () => void;
  onQuickTravel?: () => void;
  onUIGrab?: (controller: 'left' | 'right', grabbing: boolean) => void;
}

// ============================================================================
// Quest Controller Manager
// ============================================================================

export class QuestControllerManager {
  private renderer: THREE.WebGLRenderer;
  private leftController: THREE.Group | null = null;
  private rightController: THREE.Group | null = null;
  private leftRay: THREE.Line | null = null;
  private rightRay: THREE.Line | null = null;
  
  private input: ControllerInput;
  private prevInput: ControllerInput;
  private events: ControllerEvents = {};
  
  // Snap turn state
  private snapTurnEnabled: boolean = true;
  private snapTurnAngle: number = 45; // degrees
  private snapTurnCooldown: number = 0;
  private static readonly SNAP_COOLDOWN_MS = 300;
  
  // Teleport state
  private teleportActive: boolean = false;
  private teleportDirection: THREE.Vector3 = new THREE.Vector3();
  private teleportIndicator: THREE.Mesh | null = null;
  
  // Haptics
  private leftHaptic: HapticActuator | null = null;
  private rightHaptic: HapticActuator | null = null;
  
  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer;
    this.input = this.createEmptyInput();
    this.prevInput = this.createEmptyInput();
  }
  
  private createEmptyInput(): ControllerInput {
    return {
      leftThumbstick: { x: 0, y: 0 },
      leftTrigger: 0,
      leftGrip: 0,
      buttonX: false,
      buttonY: false,
      buttonMenu: false,
      rightThumbstick: { x: 0, y: 0 },
      rightTrigger: 0,
      rightGrip: 0,
      buttonA: false,
      buttonB: false,
    };
  }
  
  /**
   * Set event handlers
   */
  setEvents(events: ControllerEvents): void {
    this.events = { ...this.events, ...events };
  }
  
  /**
   * Configure snap turn settings
   */
  setSnapTurn(enabled: boolean, angle?: number): void {
    this.snapTurnEnabled = enabled;
    if (angle) this.snapTurnAngle = angle;
  }
  
  /**
   * Set up controllers from XR session
   */
  setupControllers(scene: THREE.Scene): void {
    // Left controller (index 1 for Quest)
    this.leftController = this.renderer.xr.getController(1);
    this.leftRay = this.createControllerRay(0x7FCDCD);
    this.leftController.add(this.leftRay);
    scene.add(this.leftController);
    
    // Right controller (index 0 for Quest)
    this.rightController = this.renderer.xr.getController(0);
    this.rightRay = this.createControllerRay(0x7FCDCD);
    this.rightController.add(this.rightRay);
    scene.add(this.rightController);
    
    // Set up event listeners (handled in update loop via gamepad API instead)
    
    // Create teleport indicator
    this.createTeleportIndicator(scene);
  }
  
  private createControllerRay(color: number): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5),
    ]);
    
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.6,
    });
    
    return new THREE.Line(geometry, material);
  }
  
  private createTeleportIndicator(scene: THREE.Scene): void {
    // Ring indicator for teleport destination
    const geometry = new THREE.RingGeometry(0.3, 0.35, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x2A9D8F,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    
    this.teleportIndicator = new THREE.Mesh(geometry, material);
    this.teleportIndicator.rotation.x = -Math.PI / 2;
    this.teleportIndicator.position.y = 0.01;
    scene.add(this.teleportIndicator);
  }
  
  /**
   * Update from XR frame
   */
  update(frame: XRFrame, deltaTime: number): void {
    // Store previous input for edge detection
    this.prevInput = { ...this.input };
    
    const session = frame.session;
    
    for (const source of session.inputSources) {
      if (!source.gamepad) continue;
      
      const gamepad = source.gamepad;
      const isLeft = source.handedness === 'left';
      
      if (isLeft) {
        // Left controller input
        this.input.leftThumbstick = {
          x: gamepad.axes[2] || 0,
          y: gamepad.axes[3] || 0,
        };
        this.input.leftTrigger = gamepad.buttons[0]?.value || 0;
        this.input.leftGrip = gamepad.buttons[1]?.value || 0;
        this.input.buttonX = gamepad.buttons[4]?.pressed || false;
        this.input.buttonY = gamepad.buttons[5]?.pressed || false;
        this.input.buttonMenu = gamepad.buttons[3]?.pressed || false;
        
        // Store haptic actuator
        if (gamepad.hapticActuators?.[0]) {
          this.leftHaptic = gamepad.hapticActuators[0] as HapticActuator;
        }
      } else {
        // Right controller input
        this.input.rightThumbstick = {
          x: gamepad.axes[2] || 0,
          y: gamepad.axes[3] || 0,
        };
        this.input.rightTrigger = gamepad.buttons[0]?.value || 0;
        this.input.rightGrip = gamepad.buttons[1]?.value || 0;
        this.input.buttonA = gamepad.buttons[4]?.pressed || false;
        this.input.buttonB = gamepad.buttons[5]?.pressed || false;
        
        // Store haptic actuator
        if (gamepad.hapticActuators?.[0]) {
          this.rightHaptic = gamepad.hapticActuators[0] as HapticActuator;
        }
      }
    }
    
    // Process input
    this.processInput(deltaTime);
  }
  
  private processInput(deltaTime: number): void {
    // === RIGHT GRIP: ZOOM ===
    if (this.input.rightGrip > 0.1) {
      this.events.onZoomChange?.(this.input.rightGrip);
    } else if (this.prevInput.rightGrip > 0.1 && this.input.rightGrip <= 0.1) {
      this.events.onZoomChange?.(0);
    }
    
    // === RIGHT THUMBSTICK: TURNING ===
    this.snapTurnCooldown = Math.max(0, this.snapTurnCooldown - deltaTime * 1000);
    
    if (this.snapTurnEnabled) {
      // Snap turn
      if (Math.abs(this.input.rightThumbstick.x) > 0.7 && this.snapTurnCooldown === 0) {
        if (this.input.rightThumbstick.x > 0) {
          this.events.onTurnRight?.();
        } else {
          this.events.onTurnLeft?.();
        }
        this.snapTurnCooldown = QuestControllerManager.SNAP_COOLDOWN_MS;
        this.pulseHaptic('right', 0.3, 50);
      }
    } else {
      // Smooth turn handled by caller
    }
    
    // === LEFT THUMBSTICK: TELEPORT ===
    const teleportMagnitude = Math.sqrt(
      this.input.leftThumbstick.x ** 2 + this.input.leftThumbstick.y ** 2
    );
    
    if (teleportMagnitude > 0.7) {
      if (!this.teleportActive) {
        this.teleportActive = true;
        this.teleportDirection.set(
          this.input.leftThumbstick.x,
          0,
          -this.input.leftThumbstick.y
        ).normalize();
        this.events.onTeleportStart?.(this.teleportDirection);
      }
      this.updateTeleportIndicator();
    } else if (this.teleportActive) {
      // Teleport was active, now released
      if (this.input.leftTrigger > 0.5) {
        this.events.onTeleportConfirm?.(this.teleportDirection);
      } else {
        this.events.onTeleportCancel?.();
      }
      this.teleportActive = false;
      this.hideTeleportIndicator();
    }
    
    // === BUTTON PRESSES (edge detection) ===
    // Y button: Toggle Tour Guide
    if (this.input.buttonY && !this.prevInput.buttonY) {
      this.events.onTourGuideToggle?.();
      this.pulseHaptic('left', 0.2, 30);
    }
    
    // X button: Quick Travel
    if (this.input.buttonX && !this.prevInput.buttonX) {
      this.events.onQuickTravel?.();
      this.pulseHaptic('left', 0.2, 30);
    }
    
    // A button: Select/Confirm
    if (this.input.buttonA && !this.prevInput.buttonA) {
      this.events.onSelect?.('right');
      this.pulseHaptic('right', 0.2, 30);
    }
    
    // B button: Back
    if (this.input.buttonB && !this.prevInput.buttonB) {
      this.events.onBack?.();
      this.pulseHaptic('right', 0.2, 30);
    }
    
    // Menu button: Toggle menu
    if (this.input.buttonMenu && !this.prevInput.buttonMenu) {
      this.events.onMenuToggle?.();
    }
    
    // === LEFT GRIP: UI GRAB ===
    if (this.input.leftGrip > 0.5 && this.prevInput.leftGrip <= 0.5) {
      this.events.onUIGrab?.('left', true);
    } else if (this.input.leftGrip <= 0.5 && this.prevInput.leftGrip > 0.5) {
      this.events.onUIGrab?.('left', false);
    }
  }
  
  private updateTeleportIndicator(): void {
    if (!this.teleportIndicator || !this.leftController) return;
    
    // Show indicator at teleport direction
    const material = this.teleportIndicator.material as THREE.MeshBasicMaterial;
    material.opacity = 0.8;
    
    // Position indicator (simplified - would need raycasting for proper placement)
    const direction = this.teleportDirection.clone().multiplyScalar(3);
    this.teleportIndicator.position.copy(this.leftController.position).add(direction);
    
    // Pulse animation
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    this.teleportIndicator.scale.setScalar(pulse);
  }
  
  private hideTeleportIndicator(): void {
    if (!this.teleportIndicator) return;
    const material = this.teleportIndicator.material as THREE.MeshBasicMaterial;
    material.opacity = 0;
  }
  
  /**
   * Trigger haptic feedback
   */
  pulseHaptic(controller: 'left' | 'right', intensity: number, duration: number): void {
    const haptic = controller === 'left' ? this.leftHaptic : this.rightHaptic;
    if (haptic && 'pulse' in haptic) {
      (haptic as any).pulse(intensity, duration);
    }
  }
  
  /**
   * Get current input state
   */
  getInput(): ControllerInput {
    return { ...this.input };
  }
  
  /**
   * Get controller ray direction (for UI interaction)
   */
  getControllerRay(controller: 'left' | 'right'): THREE.Ray | null {
    const ctrl = controller === 'left' ? this.leftController : this.rightController;
    if (!ctrl) return null;
    
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);
    
    ctrl.getWorldPosition(origin);
    direction.applyQuaternion(ctrl.quaternion);
    
    return new THREE.Ray(origin, direction);
  }
  
  /**
   * Update controller ray visual (color based on interaction state)
   */
  setRayColor(controller: 'left' | 'right', color: number): void {
    const ray = controller === 'left' ? this.leftRay : this.rightRay;
    if (ray) {
      (ray.material as THREE.LineBasicMaterial).color.setHex(color);
    }
  }
  
  /**
   * Check if actively zooming
   */
  isZooming(): boolean {
    return this.input.rightGrip > 0.1;
  }
  
  /**
   * Get zoom value (0-1)
   */
  getZoomValue(): number {
    return this.input.rightGrip;
  }
  
  /**
   * Check if teleporting
   */
  isTeleporting(): boolean {
    return this.teleportActive;
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    if (this.teleportIndicator) {
      this.teleportIndicator.geometry.dispose();
      (this.teleportIndicator.material as THREE.Material).dispose();
    }
  }
}

// Haptic actuator type (use any to avoid browser API conflicts)
type HapticActuator = any;
