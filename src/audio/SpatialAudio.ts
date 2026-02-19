/**
 * Spatial Audio System
 * 
 * Handles immersive ambient audio with location-aware mixing.
 * Uses Web Audio API with Three.js audio integration.
 */

import * as THREE from 'three';
import type { Location, AudioConfig } from '../types';

// ============================================================================
// Constants
// ============================================================================

const CROSSFADE_DURATION = 2000; // ms
const AUDIO_BASE_PATH = '/audio/';

// Audio file mapping
const AUDIO_FILES: Record<string, string> = {
  ocean: 'ocean-waves.mp3',
  birds: 'tropical-birds.mp3',
  wind: 'gentle-wind.mp3',
  rain: 'rain-forest.mp3',
  waterfall: 'waterfall.mp3',
  volcanic: 'volcanic-rumble.mp3',
};

// ============================================================================
// Types
// ============================================================================

interface AudioSource {
  name: string;
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  targetVolume: number;
  currentVolume: number;
  loaded: boolean;
}

// ============================================================================
// Spatial Audio Manager
// ============================================================================

export class SpatialAudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sources: Map<string, AudioSource> = new Map();
  private listener: THREE.AudioListener | null = null;
  
  // Settings
  private masterVolume: number = 0.8;
  private ambientVolume: number = 0.6;
  private enabled: boolean = true;
  private muted: boolean = false;
  
  // Current state
  private currentConfig: AudioConfig | null = null;
  private isPlaying: boolean = false;
  
  constructor() {
    // Audio context created on user interaction
  }
  
  /**
   * Initialize audio context (must be called after user interaction)
   */
  async init(): Promise<void> {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new AudioContext();
      
      // Create master gain
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
      
      // Create Three.js audio listener
      this.listener = new THREE.AudioListener();
      
      // Initialize audio sources
      await this.initSources();
      
      console.log('✅ Spatial audio initialized');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }
  
  /**
   * Initialize all audio sources
   */
  private async initSources(): Promise<void> {
    if (!this.audioContext || !this.masterGain) return;
    
    const loadPromises: Promise<void>[] = [];
    
    for (const [name, file] of Object.entries(AUDIO_FILES)) {
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(this.masterGain);
      
      const source: AudioSource = {
        name,
        buffer: null,
        source: null,
        gainNode,
        targetVolume: 0,
        currentVolume: 0,
        loaded: false,
      };
      
      this.sources.set(name, source);
      
      // Load audio file
      loadPromises.push(this.loadAudio(name, AUDIO_BASE_PATH + file));
    }
    
    // Load all audio files
    await Promise.allSettled(loadPromises);
  }
  
  /**
   * Load audio file into buffer
   */
  private async loadAudio(name: string, url: string): Promise<void> {
    if (!this.audioContext) return;
    
    const source = this.sources.get(name);
    if (!source) return;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Audio file not found: ${url}`);
        return;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      source.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
      source.loaded = true;
      
      console.log(`🔊 Loaded audio: ${name}`);
    } catch (error) {
      console.warn(`Failed to load audio ${name}:`, error);
    }
  }
  
  /**
   * Get Three.js audio listener for camera attachment
   */
  getListener(): THREE.AudioListener | null {
    return this.listener;
  }
  
  /**
   * Update audio mix for a location
   */
  setLocationAudio(location: Location): void {
    if (!this.enabled || !this.audioContext) return;
    
    this.currentConfig = location.audio;
    
    // Update target volumes for each source
    for (const [name, source] of this.sources) {
      const configValue = (location.audio as Record<string, number>)[name] || 0;
      source.targetVolume = configValue * this.ambientVolume;
    }
    
    // Start playing if not already
    if (!this.isPlaying) {
      this.startAll();
    }
  }
  
  /**
   * Start all audio sources (looped)
   */
  private startAll(): void {
    if (!this.audioContext || this.isPlaying) return;
    
    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    for (const [name, source] of this.sources) {
      if (source.loaded && source.buffer && !source.source) {
        this.startSource(source);
      }
    }
    
    this.isPlaying = true;
  }
  
  /**
   * Start a single audio source
   */
  private startSource(source: AudioSource): void {
    if (!this.audioContext || !source.buffer) return;
    
    // Create new buffer source
    const bufferSource = this.audioContext.createBufferSource();
    bufferSource.buffer = source.buffer;
    bufferSource.loop = true;
    bufferSource.connect(source.gainNode);
    
    // Start at random position for variety
    const randomOffset = Math.random() * source.buffer.duration;
    bufferSource.start(0, randomOffset);
    
    source.source = bufferSource;
  }
  
  /**
   * Stop all audio
   */
  stop(): void {
    for (const source of this.sources.values()) {
      if (source.source) {
        source.source.stop();
        source.source = null;
      }
    }
    this.isPlaying = false;
  }
  
  /**
   * Update audio (call every frame for smooth crossfading)
   */
  update(deltaTime: number): void {
    if (!this.enabled || this.muted) return;
    
    const fadeSpeed = deltaTime / (CROSSFADE_DURATION / 1000);
    
    for (const source of this.sources.values()) {
      // Smooth interpolation to target volume
      if (source.currentVolume < source.targetVolume) {
        source.currentVolume = Math.min(
          source.currentVolume + fadeSpeed,
          source.targetVolume
        );
      } else if (source.currentVolume > source.targetVolume) {
        source.currentVolume = Math.max(
          source.currentVolume - fadeSpeed,
          source.targetVolume
        );
      }
      
      // Apply volume
      source.gainNode.gain.value = source.currentVolume;
    }
  }
  
  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterVolume;
    }
  }
  
  /**
   * Set ambient volume multiplier (0-1)
   */
  setAmbientVolume(volume: number): void {
    this.ambientVolume = Math.max(0, Math.min(1, volume));
    
    // Recalculate target volumes
    if (this.currentConfig) {
      for (const [name, source] of this.sources) {
        const configValue = (this.currentConfig as Record<string, number>)[name] || 0;
        source.targetVolume = configValue * this.ambientVolume;
      }
    }
  }
  
  /**
   * Toggle mute
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.masterVolume;
    }
  }
  
  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }
  
  /**
   * Get current audio levels (for visualization)
   */
  getLevels(): Record<string, number> {
    const levels: Record<string, number> = {};
    for (const [name, source] of this.sources) {
      levels[name] = source.currentVolume;
    }
    return levels;
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.sources.clear();
  }
}

// ============================================================================
// UI Sound Effects
// ============================================================================

export class UISoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  
  // Pre-generated UI sounds
  private sounds: Map<string, AudioBuffer> = new Map();
  
  async init(audioContext: AudioContext): Promise<void> {
    this.audioContext = audioContext;
    
    // Generate procedural UI sounds
    this.generateSounds();
  }
  
  /**
   * Generate simple procedural UI sounds
   */
  private generateSounds(): void {
    if (!this.audioContext) return;
    
    // Click sound - short sine wave blip
    this.sounds.set('click', this.generateTone(880, 0.05, 'sine'));
    
    // Hover sound - softer, lower
    this.sounds.set('hover', this.generateTone(660, 0.03, 'sine'));
    
    // Select sound - two-tone confirmation
    this.sounds.set('select', this.generateTwoTone(660, 880, 0.1));
    
    // Back sound - descending
    this.sounds.set('back', this.generateTwoTone(880, 660, 0.1));
    
    // Error sound - dissonant
    this.sounds.set('error', this.generateTone(220, 0.15, 'sawtooth'));
    
    // Zoom tick - subtle
    this.sounds.set('zoom', this.generateTone(1200, 0.02, 'sine'));
  }
  
  /**
   * Generate a simple tone
   */
  private generateTone(
    frequency: number,
    duration: number,
    type: OscillatorType
  ): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext!.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = 1 - (i / samples); // Linear decay
      
      let sample: number;
      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'sawtooth':
          sample = 2 * ((frequency * t) % 1) - 1;
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * t);
      }
      
      data[i] = sample * envelope * 0.3;
    }
    
    return buffer;
  }
  
  /**
   * Generate two-tone sound
   */
  private generateTwoTone(freq1: number, freq2: number, duration: number): AudioBuffer {
    const sampleRate = this.audioContext!.sampleRate;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext!.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);
    
    const halfPoint = samples / 2;
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const freq = i < halfPoint ? freq1 : freq2;
      const envelope = 1 - (i / samples);
      
      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
    }
    
    return buffer;
  }
  
  /**
   * Play a UI sound
   */
  play(soundName: string): void {
    if (!this.enabled || !this.audioContext) return;
    
    const buffer = this.sounds.get(soundName);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = this.volume;
    
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    
    source.start();
  }
  
  /**
   * Set UI sound volume
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Enable/disable UI sounds
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}
