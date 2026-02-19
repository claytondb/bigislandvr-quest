/**
 * VR UI Panel System
 * 
 * World-space UI panels for VR that float in 3D space.
 * Supports curved panels, gaze + controller interaction.
 */

import * as THREE from 'three';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_PANEL_DISTANCE = 2; // meters from user
const DEFAULT_PANEL_HEIGHT = 1.5; // meters
const CURVE_SEGMENTS = 32;
const FOLLOW_SPEED = 0.05;

// ============================================================================
// Types
// ============================================================================

export interface PanelConfig {
  id: string;
  width: number;
  height: number;
  curved?: boolean;
  curveRadius?: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  followUser?: boolean;
  backgroundColor?: number;
  backgroundOpacity?: number;
  borderColor?: number;
  borderWidth?: number;
}

export interface PanelElement {
  type: 'text' | 'button' | 'image' | 'slider' | 'divider';
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  color?: number;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

// ============================================================================
// VR UI Panel
// ============================================================================

export class VRUIPanel {
  readonly id: string;
  readonly mesh: THREE.Mesh;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private elements: PanelElement[] = [];
  private hoveredElement: string | null = null;
  private config: PanelConfig;
  
  // For follow behavior
  private targetPosition: THREE.Vector3;
  private targetRotation: THREE.Euler;
  
  constructor(config: PanelConfig) {
    this.id = config.id;
    this.config = {
      curved: false,
      curveRadius: 3,
      followUser: false,
      backgroundColor: 0x1A1A1A,
      backgroundOpacity: 0.9,
      borderColor: 0x7FCDCD,
      borderWidth: 2,
      ...config,
    };
    
    // Create canvas for rendering UI
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.width * 512; // 512 pixels per meter
    this.canvas.height = config.height * 512;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Create texture from canvas
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    
    // Create geometry (flat or curved)
    const geometry = this.config.curved
      ? this.createCurvedGeometry(config.width, config.height, this.config.curveRadius!)
      : new THREE.PlaneGeometry(config.width, config.height);
    
    // Create material with transparency
    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
    });
    
    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData.panelId = this.id;
    
    // Set initial position
    const pos = config.position || new THREE.Vector3(0, DEFAULT_PANEL_HEIGHT, -DEFAULT_PANEL_DISTANCE);
    this.mesh.position.copy(pos);
    this.targetPosition = pos.clone();
    
    if (config.rotation) {
      this.mesh.rotation.copy(config.rotation);
    }
    this.targetRotation = this.mesh.rotation.clone();
    
    // Initial render
    this.render();
  }
  
  /**
   * Create curved geometry for comfortable viewing
   */
  private createCurvedGeometry(width: number, height: number, radius: number): THREE.BufferGeometry {
    const geometry = new THREE.BufferGeometry();
    
    const segmentsX = CURVE_SEGMENTS;
    const segmentsY = 1;
    const theta = width / radius; // Arc angle
    
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    
    for (let y = 0; y <= segmentsY; y++) {
      const v = y / segmentsY;
      const yPos = (v - 0.5) * height;
      
      for (let x = 0; x <= segmentsX; x++) {
        const u = x / segmentsX;
        const angle = (u - 0.5) * theta;
        
        positions.push(
          Math.sin(angle) * radius,
          yPos,
          -Math.cos(angle) * radius + radius
        );
        
        uvs.push(u, 1 - v);
      }
    }
    
    for (let y = 0; y < segmentsY; y++) {
      for (let x = 0; x < segmentsX; x++) {
        const a = x + (segmentsX + 1) * y;
        const b = x + (segmentsX + 1) * (y + 1);
        const c = (x + 1) + (segmentsX + 1) * (y + 1);
        const d = (x + 1) + (segmentsX + 1) * y;
        
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return geometry;
  }
  
  /**
   * Add UI element to panel
   */
  addElement(element: PanelElement): void {
    this.elements.push(element);
    this.render();
  }
  
  /**
   * Remove element by ID
   */
  removeElement(id: string): void {
    this.elements = this.elements.filter(e => e.id !== id);
    this.render();
  }
  
  /**
   * Clear all elements
   */
  clearElements(): void {
    this.elements = [];
    this.render();
  }
  
  /**
   * Render panel to canvas texture
   */
  render(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Background with rounded corners
    ctx.fillStyle = this.hexToRgba(this.config.backgroundColor!, this.config.backgroundOpacity!);
    this.roundRect(ctx, 0, 0, w, h, 24);
    ctx.fill();
    
    // Border
    if (this.config.borderWidth! > 0) {
      ctx.strokeStyle = this.hexToColor(this.config.borderColor!);
      ctx.lineWidth = this.config.borderWidth! * 2;
      this.roundRect(ctx, 0, 0, w, h, 24);
      ctx.stroke();
    }
    
    // Render elements
    for (const element of this.elements) {
      this.renderElement(ctx, element);
    }
    
    // Update texture
    this.texture.needsUpdate = true;
  }
  
  /**
   * Render a single UI element
   */
  private renderElement(ctx: CanvasRenderingContext2D, element: PanelElement): void {
    const x = element.position.x * 512;
    const y = element.position.y * 512;
    const w = element.width * 512;
    const h = element.height * 512;
    
    const isHovered = this.hoveredElement === element.id;
    
    switch (element.type) {
      case 'text':
        ctx.fillStyle = this.hexToColor(element.color || 0xFAF8F5);
        ctx.font = `${element.fontSize || 24}px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(element.content || '', x, y);
        break;
        
      case 'button':
        // Button background
        const bgColor = isHovered ? 0x2A9D8F : 0x4A4A4A;
        ctx.fillStyle = this.hexToColor(bgColor);
        this.roundRect(ctx, x, y, w, h, 12);
        ctx.fill();
        
        // Button text
        ctx.fillStyle = this.hexToColor(0xFAF8F5);
        ctx.font = `600 ${element.fontSize || 20}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content || '', x + w / 2, y + h / 2);
        break;
        
      case 'divider':
        ctx.strokeStyle = this.hexToColor(element.color || 0x4A4A4A);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
        break;
        
      case 'slider':
        // Track
        ctx.fillStyle = this.hexToColor(0x4A4A4A);
        this.roundRect(ctx, x, y + h / 2 - 4, w, 8, 4);
        ctx.fill();
        
        // Fill (assuming content is 0-100 value)
        const value = parseInt(element.content || '50') / 100;
        ctx.fillStyle = this.hexToColor(0x2A9D8F);
        this.roundRect(ctx, x, y + h / 2 - 4, w * value, 8, 4);
        ctx.fill();
        
        // Thumb
        ctx.fillStyle = this.hexToColor(isHovered ? 0x7FCDCD : 0xFAF8F5);
        ctx.beginPath();
        ctx.arc(x + w * value, y + h / 2, 12, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
  }
  
  /**
   * Handle ray intersection for interaction
   */
  handleRaycast(raycaster: THREE.Raycaster): string | null {
    const intersects = raycaster.intersectObject(this.mesh);
    
    if (intersects.length === 0) {
      if (this.hoveredElement) {
        const prevElement = this.elements.find(e => e.id === this.hoveredElement);
        prevElement?.onHover?.(false);
        this.hoveredElement = null;
        this.render();
      }
      return null;
    }
    
    const uv = intersects[0].uv;
    if (!uv) return null;
    
    // Find element at UV coordinates
    const panelX = uv.x * this.config.width;
    const panelY = (1 - uv.y) * this.config.height;
    
    for (const element of this.elements) {
      if (
        panelX >= element.position.x &&
        panelX <= element.position.x + element.width &&
        panelY >= element.position.y &&
        panelY <= element.position.y + element.height
      ) {
        if (this.hoveredElement !== element.id) {
          // Unhover previous
          if (this.hoveredElement) {
            const prevElement = this.elements.find(e => e.id === this.hoveredElement);
            prevElement?.onHover?.(false);
          }
          // Hover new
          this.hoveredElement = element.id;
          element.onHover?.(true);
          this.render();
        }
        return element.id;
      }
    }
    
    // No element hit
    if (this.hoveredElement) {
      const prevElement = this.elements.find(e => e.id === this.hoveredElement);
      prevElement?.onHover?.(false);
      this.hoveredElement = null;
      this.render();
    }
    
    return null;
  }
  
  /**
   * Handle click on hovered element
   */
  click(): boolean {
    if (this.hoveredElement) {
      const element = this.elements.find(e => e.id === this.hoveredElement);
      if (element?.onClick) {
        element.onClick();
        return true;
      }
    }
    return false;
  }
  
  /**
   * Update panel (call every frame)
   */
  update(camera: THREE.Camera, deltaTime: number): void {
    if (this.config.followUser) {
      // Get camera world position and direction
      const cameraPos = new THREE.Vector3();
      camera.getWorldPosition(cameraPos);
      
      const cameraDir = new THREE.Vector3(0, 0, -1);
      camera.getWorldDirection(cameraDir);
      cameraDir.y = 0; // Keep horizontal
      cameraDir.normalize();
      
      // Target position: in front of camera
      this.targetPosition.copy(cameraPos)
        .add(cameraDir.multiplyScalar(DEFAULT_PANEL_DISTANCE));
      this.targetPosition.y = cameraPos.y + 0.2; // Slightly above eye level
      
      // Target rotation: face camera
      this.mesh.lookAt(cameraPos);
      
      // Smooth follow
      this.mesh.position.lerp(this.targetPosition, FOLLOW_SPEED);
    }
  }
  
  /**
   * Show panel with animation
   */
  show(): void {
    this.mesh.visible = true;
    // Could add fade-in animation
  }
  
  /**
   * Hide panel with animation
   */
  hide(): void {
    this.mesh.visible = false;
    // Could add fade-out animation
  }
  
  /**
   * Toggle visibility
   */
  toggle(): void {
    if (this.mesh.visible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * Set panel position
   */
  setPosition(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.targetPosition.copy(position);
  }
  
  /**
   * Utility: hex to CSS color string
   */
  private hexToColor(hex: number): string {
    return `#${hex.toString(16).padStart(6, '0')}`;
  }
  
  /**
   * Utility: hex to rgba string
   */
  private hexToRgba(hex: number, alpha: number): string {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  /**
   * Utility: draw rounded rectangle
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    this.texture.dispose();
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

// ============================================================================
// UI Manager
// ============================================================================

export class VRUIManager {
  private panels: Map<string, VRUIPanel> = new Map();
  private scene: THREE.Scene;
  private activePanel: string | null = null;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Create and add a panel
   */
  createPanel(config: PanelConfig): VRUIPanel {
    const panel = new VRUIPanel(config);
    this.panels.set(config.id, panel);
    this.scene.add(panel.mesh);
    return panel;
  }
  
  /**
   * Get panel by ID
   */
  getPanel(id: string): VRUIPanel | undefined {
    return this.panels.get(id);
  }
  
  /**
   * Remove panel
   */
  removePanel(id: string): void {
    const panel = this.panels.get(id);
    if (panel) {
      this.scene.remove(panel.mesh);
      panel.dispose();
      this.panels.delete(id);
    }
  }
  
  /**
   * Handle raycasting for all panels
   */
  handleRaycast(raycaster: THREE.Raycaster): { panelId: string; elementId: string } | null {
    for (const [panelId, panel] of this.panels) {
      if (!panel.mesh.visible) continue;
      
      const elementId = panel.handleRaycast(raycaster);
      if (elementId) {
        this.activePanel = panelId;
        return { panelId, elementId };
      }
    }
    
    this.activePanel = null;
    return null;
  }
  
  /**
   * Click active panel
   */
  click(): boolean {
    if (this.activePanel) {
      const panel = this.panels.get(this.activePanel);
      return panel?.click() || false;
    }
    return false;
  }
  
  /**
   * Update all panels
   */
  update(camera: THREE.Camera, deltaTime: number): void {
    for (const panel of this.panels.values()) {
      panel.update(camera, deltaTime);
    }
  }
  
  /**
   * Dispose all panels
   */
  dispose(): void {
    for (const panel of this.panels.values()) {
      this.scene.remove(panel.mesh);
      panel.dispose();
    }
    this.panels.clear();
  }
}
