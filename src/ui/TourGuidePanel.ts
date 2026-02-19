/**
 * Tour Guide Panel
 * 
 * VR UI panel showing current location info, history, and navigation.
 */

import * as THREE from 'three';
import { VRUIPanel, PanelConfig, PanelElement } from './VRUIPanel';
import type { Location } from '../types';
import { LOCATIONS, REGIONS, TOURS } from '../data/locations';

// ============================================================================
// Tour Guide Panel
// ============================================================================

export class TourGuidePanel extends VRUIPanel {
  private currentLocation: Location | null = null;
  private currentIndex: number = 0;
  private onNavigate: ((index: number) => void) | null = null;
  
  constructor(scene: THREE.Scene) {
    const config: PanelConfig = {
      id: 'tour-guide',
      width: 0.9,
      height: 0.7,
      curved: true,
      curveRadius: 2.5,
      position: new THREE.Vector3(-1.2, 1.6, -1.5),
      followUser: false,
      backgroundColor: 0x1A1A1A,
      backgroundOpacity: 0.92,
      borderColor: 0x2A9D8F,
      borderWidth: 3,
    };
    
    super(config);
    
    // Add static elements
    this.setupStaticElements();
    
    // Start hidden
    this.hide();
  }
  
  /**
   * Set navigation callback
   */
  setOnNavigate(callback: (index: number) => void): void {
    this.onNavigate = callback;
  }
  
  /**
   * Set up initial UI elements
   */
  private setupStaticElements(): void {
    // Header
    this.addElement({
      type: 'text',
      id: 'header',
      position: { x: 0.03, y: 0.02 },
      width: 0.85,
      height: 0.06,
      content: '🗺️ Tour Guide',
      fontSize: 36,
      color: 0x7FCDCD,
    });
    
    // Divider
    this.addElement({
      type: 'divider',
      id: 'divider1',
      position: { x: 0.03, y: 0.08 },
      width: 0.85,
      height: 0.01,
      color: 0x4A4A4A,
    });
    
    // Location counter placeholder
    this.addElement({
      type: 'text',
      id: 'counter',
      position: { x: 0.7, y: 0.02 },
      width: 0.2,
      height: 0.05,
      content: '1/35',
      fontSize: 20,
      color: 0x888888,
    });
    
    // Navigation buttons
    this.addElement({
      type: 'button',
      id: 'prev-btn',
      position: { x: 0.03, y: 0.55 },
      width: 0.28,
      height: 0.1,
      content: '◀ Previous',
      onClick: () => this.navigatePrev(),
    });
    
    this.addElement({
      type: 'button',
      id: 'random-btn',
      position: { x: 0.33, y: 0.55 },
      width: 0.25,
      height: 0.1,
      content: '🎲 Random',
      onClick: () => this.navigateRandom(),
    });
    
    this.addElement({
      type: 'button',
      id: 'next-btn',
      position: { x: 0.6, y: 0.55 },
      width: 0.28,
      height: 0.1,
      content: 'Next ▶',
      onClick: () => this.navigateNext(),
    });
  }
  
  /**
   * Update panel with location info
   */
  setLocation(location: Location, index: number): void {
    this.currentLocation = location;
    this.currentIndex = index;
    
    // Remove old dynamic elements
    this.removeElement('location-name');
    this.removeElement('region');
    this.removeElement('summary');
    this.removeElement('counter');
    
    // Location name
    this.addElement({
      type: 'text',
      id: 'location-name',
      position: { x: 0.03, y: 0.11 },
      width: 0.85,
      height: 0.08,
      content: location.name,
      fontSize: 32,
      color: 0xFAF8F5,
    });
    
    // Region badge
    const regionInfo = REGIONS[location.region];
    this.addElement({
      type: 'text',
      id: 'region',
      position: { x: 0.03, y: 0.19 },
      width: 0.4,
      height: 0.04,
      content: `📍 ${location.region}`,
      fontSize: 18,
      color: parseInt(regionInfo?.color?.replace('#', '') || '888888', 16),
    });
    
    // Summary/History
    const summaryText = location.summary || location.desc;
    this.addElement({
      type: 'text',
      id: 'summary',
      position: { x: 0.03, y: 0.26 },
      width: 0.85,
      height: 0.25,
      content: this.wrapText(summaryText, 45),
      fontSize: 18,
      color: 0xCCCCCC,
    });
    
    // Location counter
    this.addElement({
      type: 'text',
      id: 'counter',
      position: { x: 0.72, y: 0.02 },
      width: 0.15,
      height: 0.05,
      content: `${index + 1}/${LOCATIONS.length}`,
      fontSize: 20,
      color: 0x888888,
    });
    
    // Refresh panel
    this.render();
  }
  
  /**
   * Wrap text to fit panel width
   */
  private wrapText(text: string, maxChars: number): string {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length > maxChars) {
        if (currentLine) lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }
    if (currentLine) lines.push(currentLine.trim());
    
    return lines.slice(0, 5).join('\n'); // Max 5 lines
  }
  
  /**
   * Navigate to previous location
   */
  private navigatePrev(): void {
    const newIndex = (this.currentIndex - 1 + LOCATIONS.length) % LOCATIONS.length;
    this.onNavigate?.(newIndex);
  }
  
  /**
   * Navigate to next location
   */
  private navigateNext(): void {
    const newIndex = (this.currentIndex + 1) % LOCATIONS.length;
    this.onNavigate?.(newIndex);
  }
  
  /**
   * Navigate to random location
   */
  private navigateRandom(): void {
    let newIndex = Math.floor(Math.random() * LOCATIONS.length);
    // Avoid same location
    if (newIndex === this.currentIndex) {
      newIndex = (newIndex + 1) % LOCATIONS.length;
    }
    this.onNavigate?.(newIndex);
  }
}

// ============================================================================
// Location Browser Panel
// ============================================================================

export class LocationBrowserPanel extends VRUIPanel {
  private selectedRegion: string | null = null;
  private onLocationSelect: ((index: number) => void) | null = null;
  private scrollOffset: number = 0;
  
  constructor(scene: THREE.Scene) {
    const config: PanelConfig = {
      id: 'location-browser',
      width: 1.0,
      height: 0.8,
      curved: true,
      curveRadius: 2.5,
      position: new THREE.Vector3(1.2, 1.6, -1.5),
      followUser: false,
      backgroundColor: 0x1A1A1A,
      backgroundOpacity: 0.92,
      borderColor: 0x3DA5D9,
      borderWidth: 3,
    };
    
    super(config);
    
    this.setupUI();
    this.hide();
  }
  
  /**
   * Set location select callback
   */
  setOnLocationSelect(callback: (index: number) => void): void {
    this.onLocationSelect = callback;
  }
  
  /**
   * Set up UI
   */
  private setupUI(): void {
    // Header
    this.addElement({
      type: 'text',
      id: 'header',
      position: { x: 0.03, y: 0.02 },
      width: 0.9,
      height: 0.06,
      content: '🏝️ Explore Locations',
      fontSize: 36,
      color: 0x3DA5D9,
    });
    
    // Region filters
    let xOffset = 0.03;
    const regions = Object.keys(REGIONS);
    
    for (let i = 0; i < regions.length; i++) {
      const region = regions[i];
      this.addElement({
        type: 'button',
        id: `region-${region}`,
        position: { x: xOffset, y: 0.1 },
        width: 0.12,
        height: 0.06,
        content: region.slice(0, 6),
        fontSize: 14,
        onClick: () => this.selectRegion(region),
      });
      xOffset += 0.13;
    }
    
    // Show all locations by default
    this.showAllLocations();
  }
  
  /**
   * Select a region filter
   */
  private selectRegion(region: string): void {
    this.selectedRegion = region;
    this.showLocationsForRegion(region);
  }
  
  /**
   * Show all locations
   */
  private showAllLocations(): void {
    this.clearLocationButtons();
    
    let yOffset = 0.2;
    const visibleCount = Math.min(8, LOCATIONS.length);
    
    for (let i = 0; i < visibleCount; i++) {
      const loc = LOCATIONS[i + this.scrollOffset];
      if (!loc) break;
      
      this.addElement({
        type: 'button',
        id: `loc-${i}`,
        position: { x: 0.03, y: yOffset },
        width: 0.9,
        height: 0.065,
        content: `${loc.name}`,
        fontSize: 16,
        onClick: () => {
          const locIndex = LOCATIONS.findIndex(l => l.id === loc.id);
          this.onLocationSelect?.(locIndex);
        },
      });
      
      yOffset += 0.07;
    }
    
    this.render();
  }
  
  /**
   * Show locations for a specific region
   */
  private showLocationsForRegion(region: string): void {
    this.clearLocationButtons();
    
    const regionLocs = LOCATIONS.filter(l => l.region === region);
    let yOffset = 0.2;
    
    for (let i = 0; i < Math.min(8, regionLocs.length); i++) {
      const loc = regionLocs[i];
      
      this.addElement({
        type: 'button',
        id: `loc-${i}`,
        position: { x: 0.03, y: yOffset },
        width: 0.9,
        height: 0.065,
        content: loc.name,
        fontSize: 16,
        onClick: () => {
          const locIndex = LOCATIONS.findIndex(l => l.id === loc.id);
          this.onLocationSelect?.(locIndex);
        },
      });
      
      yOffset += 0.07;
    }
    
    this.render();
  }
  
  /**
   * Clear location buttons
   */
  private clearLocationButtons(): void {
    for (let i = 0; i < 10; i++) {
      this.removeElement(`loc-${i}`);
    }
  }
  
  /**
   * Scroll locations list
   */
  scroll(direction: number): void {
    this.scrollOffset = Math.max(0, 
      Math.min(LOCATIONS.length - 8, this.scrollOffset + direction));
    
    if (this.selectedRegion) {
      this.showLocationsForRegion(this.selectedRegion);
    } else {
      this.showAllLocations();
    }
  }
}
