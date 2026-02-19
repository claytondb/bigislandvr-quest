/**
 * Panorama Loader
 * 
 * Handles fetching and assembling Google Street View panorama tiles
 * into a complete equirectangular texture for Three.js sphere mapping.
 */

import * as THREE from 'three';
import type { PanoramaData, PanoramaLoadProgress, Location } from '../types';

// ============================================================================
// Constants
// ============================================================================

// Street View tile dimensions
const TILE_SIZE = 512;

// Zoom levels and their tile counts
// Zoom 0: 1x1 tiles (512x256) - preview quality
// Zoom 1: 2x1 tiles (1024x512)
// Zoom 2: 4x2 tiles (2048x1024)
// Zoom 3: 8x4 tiles (4096x2048) - standard quality
// Zoom 4: 16x8 tiles (8192x4096) - high quality
// Zoom 5: 26x13 tiles (13312x6656) - max quality (not always available)
const ZOOM_LEVELS = {
  preview: { zoom: 1, tilesX: 2, tilesY: 1, width: 1024, height: 512 },
  low: { zoom: 2, tilesX: 4, tilesY: 2, width: 2048, height: 1024 },
  medium: { zoom: 3, tilesX: 8, tilesY: 4, width: 4096, height: 2048 },
  high: { zoom: 4, tilesX: 16, tilesY: 8, width: 8192, height: 4096 },
  ultra: { zoom: 5, tilesX: 26, tilesY: 13, width: 13312, height: 6656 },
};

type QualityLevel = keyof typeof ZOOM_LEVELS;

// ============================================================================
// Types
// ============================================================================

interface TileInfo {
  x: number;
  y: number;
  zoom: number;
  url: string;
}

interface PanoMetadata {
  panoId: string;
  lat: number;
  lng: number;
  heading: number;
  tilt: number;
  imageDate: string;
  links: { heading: number; panoId: string }[];
}

// ============================================================================
// PanoramaLoader Class
// ============================================================================

export class PanoramaLoader {
  private apiKey: string;
  private textureLoader: THREE.TextureLoader;
  private cache: Map<string, THREE.Texture> = new Map();
  private metadataCache: Map<string, PanoMetadata> = new Map();
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.textureLoader = new THREE.TextureLoader();
  }
  
  /**
   * Load panorama for a location
   * Returns a texture that can be applied to a sphere
   */
  async loadPanorama(
    location: Location,
    quality: QualityLevel = 'medium',
    onProgress?: (progress: PanoramaLoadProgress) => void
  ): Promise<THREE.Texture> {
    // Check cache first
    const cacheKey = `${location.lat},${location.lng}:${quality}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    onProgress?.({ loaded: 0, total: 100, phase: 'fetching' });
    
    // Get panorama metadata (pano ID)
    const metadata = await this.getPanoMetadata(location.lat, location.lng);
    if (!metadata) {
      throw new Error(`No Street View coverage at ${location.name}`);
    }
    
    onProgress?.({ loaded: 10, total: 100, phase: 'loading' });
    
    // Load tiles and assemble texture
    const texture = await this.loadPanoTiles(metadata.panoId, quality, (loaded, total) => {
      const progress = 10 + (loaded / total) * 80;
      onProgress?.({ loaded: progress, total: 100, phase: 'loading' });
    });
    
    // Cache the result
    this.cache.set(cacheKey, texture);
    
    onProgress?.({ loaded: 100, total: 100, phase: 'complete' });
    
    return texture;
  }
  
  /**
   * Get panorama metadata from coordinates
   */
  private async getPanoMetadata(lat: number, lng: number): Promise<PanoMetadata | null> {
    const cacheKey = `${lat},${lng}`;
    if (this.metadataCache.has(cacheKey)) {
      return this.metadataCache.get(cacheKey)!;
    }
    
    // Use Street View Static API metadata endpoint
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${this.apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK') {
        console.warn('Street View metadata error:', data.status);
        return null;
      }
      
      const metadata: PanoMetadata = {
        panoId: data.pano_id,
        lat: data.location.lat,
        lng: data.location.lng,
        heading: 0,
        tilt: 0,
        imageDate: data.date || 'unknown',
        links: [],
      };
      
      this.metadataCache.set(cacheKey, metadata);
      return metadata;
    } catch (error) {
      console.error('Failed to fetch panorama metadata:', error);
      return null;
    }
  }
  
  /**
   * Load all tiles for a panorama and assemble into a single texture
   */
  private async loadPanoTiles(
    panoId: string,
    quality: QualityLevel,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<THREE.Texture> {
    const level = ZOOM_LEVELS[quality];
    const tiles: TileInfo[] = [];
    
    // Generate tile URLs
    for (let y = 0; y < level.tilesY; y++) {
      for (let x = 0; x < level.tilesX; x++) {
        tiles.push({
          x,
          y,
          zoom: level.zoom,
          url: this.getTileUrl(panoId, x, y, level.zoom),
        });
      }
    }
    
    // Load all tiles in parallel (with concurrency limit)
    const tileImages = await this.loadTilesWithConcurrency(tiles, 4, onProgress);
    
    // Assemble tiles into a single canvas
    const canvas = document.createElement('canvas');
    canvas.width = level.width;
    canvas.height = level.height;
    const ctx = canvas.getContext('2d')!;
    
    for (const { x, y, image } of tileImages) {
      ctx.drawImage(image, x * TILE_SIZE, y * TILE_SIZE);
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;
    
    return texture;
  }
  
  /**
   * Generate Street View tile URL
   * Using the undocumented cbk endpoint that serves tiles directly
   */
  private getTileUrl(panoId: string, x: number, y: number, zoom: number): string {
    // This is the direct tile endpoint
    // Format: https://cbk0.google.com/cbk?output=tile&panoid=PANO_ID&zoom=ZOOM&x=X&y=Y
    return `https://cbk0.google.com/cbk?output=tile&panoid=${panoId}&zoom=${zoom}&x=${x}&y=${y}`;
  }
  
  /**
   * Load tiles with concurrency limit to avoid overwhelming the browser
   */
  private async loadTilesWithConcurrency(
    tiles: TileInfo[],
    concurrency: number,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ x: number; y: number; image: HTMLImageElement }[]> {
    const results: { x: number; y: number; image: HTMLImageElement }[] = [];
    let loaded = 0;
    
    const loadTile = async (tile: TileInfo): Promise<{ x: number; y: number; image: HTMLImageElement }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          loaded++;
          onProgress?.(loaded, tiles.length);
          resolve({ x: tile.x, y: tile.y, image: img });
        };
        
        img.onerror = () => {
          // On error, create a placeholder tile
          console.warn(`Failed to load tile ${tile.x},${tile.y}`);
          const placeholder = this.createPlaceholderImage();
          loaded++;
          onProgress?.(loaded, tiles.length);
          resolve({ x: tile.x, y: tile.y, image: placeholder });
        };
        
        img.src = tile.url;
      });
    };
    
    // Process tiles in batches
    for (let i = 0; i < tiles.length; i += concurrency) {
      const batch = tiles.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(loadTile));
      results.push(...batchResults);
    }
    
    return results;
  }
  
  /**
   * Create a placeholder image for failed tiles
   */
  private createPlaceholderImage(): HTMLImageElement {
    const canvas = document.createElement('canvas');
    canvas.width = TILE_SIZE;
    canvas.height = TILE_SIZE;
    const ctx = canvas.getContext('2d')!;
    
    // Dark blue placeholder
    ctx.fillStyle = '#0D3B66';
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    
    // Grid pattern
    ctx.strokeStyle = '#1A6B7C';
    ctx.lineWidth = 1;
    for (let i = 0; i < TILE_SIZE; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, TILE_SIZE);
      ctx.moveTo(0, i);
      ctx.lineTo(TILE_SIZE, i);
      ctx.stroke();
    }
    
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }
  
  /**
   * Preload panoramas for nearby locations
   */
  async preloadNearby(currentLocation: Location, locations: Location[]): Promise<void> {
    // Find locations within ~5km
    const nearby = locations.filter(loc => {
      if (loc.id === currentLocation.id) return false;
      const dist = this.haversineDistance(
        currentLocation.lat, currentLocation.lng,
        loc.lat, loc.lng
      );
      return dist < 5000; // 5km
    }).slice(0, 3); // Max 3 preloads
    
    // Load at preview quality
    for (const loc of nearby) {
      try {
        await this.loadPanorama(loc, 'preview');
      } catch (e) {
        // Silently fail preloads
      }
    }
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   */
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  /**
   * Clear texture cache
   */
  clearCache(): void {
    for (const texture of this.cache.values()) {
      texture.dispose();
    }
    this.cache.clear();
    this.metadataCache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { textureCount: number; metadataCount: number } {
    return {
      textureCount: this.cache.size,
      metadataCount: this.metadataCache.size,
    };
  }
}

// ============================================================================
// Progressive Loader (for zoom)
// ============================================================================

export class ProgressivePanoramaLoader {
  private loader: PanoramaLoader;
  private currentQuality: QualityLevel = 'preview';
  private upgradeQueue: Map<string, QualityLevel> = new Map();
  
  constructor(apiKey: string) {
    this.loader = new PanoramaLoader(apiKey);
  }
  
  /**
   * Load panorama starting at preview quality, then upgrade on demand
   */
  async loadProgressive(
    location: Location,
    onTexture: (texture: THREE.Texture, quality: QualityLevel) => void,
    onProgress?: (progress: PanoramaLoadProgress) => void
  ): Promise<void> {
    // Load preview immediately
    const preview = await this.loader.loadPanorama(location, 'preview', onProgress);
    onTexture(preview, 'preview');
    this.currentQuality = 'preview';
    
    // Queue medium quality upgrade
    setTimeout(async () => {
      const medium = await this.loader.loadPanorama(location, 'medium');
      onTexture(medium, 'medium');
      this.currentQuality = 'medium';
    }, 100);
  }
  
  /**
   * Request higher quality texture (for zoom)
   */
  async requestHighQuality(
    location: Location,
    onTexture: (texture: THREE.Texture, quality: QualityLevel) => void
  ): Promise<void> {
    if (this.currentQuality === 'high' || this.currentQuality === 'ultra') {
      return; // Already at high quality
    }
    
    const high = await this.loader.loadPanorama(location, 'high');
    onTexture(high, 'high');
    this.currentQuality = 'high';
  }
  
  /**
   * Get current quality level
   */
  getCurrentQuality(): QualityLevel {
    return this.currentQuality;
  }
}
