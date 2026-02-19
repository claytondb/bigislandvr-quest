# UX Design Document: Big Island VR Quest

**Version:** 1.0  
**Last Updated:** February 18, 2026  
**Platform:** Meta Quest (WebXR)  
**Target Audience:** VR newcomers to experienced users

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [First-Time Experience](#first-time-experience)
3. [Navigation & Locomotion](#navigation--locomotion)
4. [Controller Mappings](#controller-mappings)
5. [Zoom Interaction](#zoom-interaction)
6. [3D UI Design](#3d-ui-design)
7. [Information Display](#information-display)
8. [Comfort Features](#comfort-features)
9. [Audio UX](#audio-ux)
10. [Visual Language](#visual-language)
11. [Error States](#error-states)
12. [Accessibility Considerations](#accessibility-considerations)

---

## Design Philosophy

Big Island VR Quest is built on four core UX principles that inform every design decision:

### 1. Comfort First
Motion sickness is the fastest way to lose a user forever. Every movement, transition, and interaction must prioritize vestibular comfort. We never sacrifice comfort for "cool" effects.

### 2. Intuitive for Newcomers
Many users will be experiencing VR for the first time. Controls must feel natural, interfaces must be self-explanatory, and help must always be accessible without breaking immersion.

### 3. Efficient for Power Users
Experienced VR users should never feel slowed down by training wheels. Quick shortcuts, muscle memory-friendly controls, and streamlined workflows keep experts engaged.

### 4. Presence & Immersion
The goal is to transport users to Hawaii. UI should be present when needed but invisible when not. Environmental audio, natural lighting, and minimal HUD elements maintain the sense of "being there."

---

## First-Time Experience

The first 5 minutes determine whether a user becomes a regular or uninstalls. Our onboarding is designed to be welcoming, educational, and—most importantly—skippable for returning users.

### Welcome Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         🌺 ALOHA! 🌺                            │
│                                                                 │
│              Welcome to Big Island VR Quest                     │
│                                                                 │
│        You're about to explore the wonders of Hawai'i           │
│              from the comfort of your headset.                  │
│                                                                 │
│  ┌─────────────────────┐     ┌─────────────────────┐           │
│  │                     │     │                     │           │
│  │   🎓 TUTORIAL       │     │   🚀 JUMP IN        │           │
│  │   (5 minutes)       │     │   (I know VR)       │           │
│  │                     │     │                     │           │
│  └─────────────────────┘     └─────────────────────┘           │
│                                                                 │
│              Press trigger on your choice                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The welcome scene places users in a serene Hawaiian beach environment at golden hour—non-threatening, beautiful, and immediately setting the tone. Users can look around freely while making their choice.

### Controller Familiarization Tutorial

For users selecting the tutorial, we walk through each controller in a hands-on, interactive way:

#### Step 1: Look Around (30 seconds)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              👀 LOOK AROUND                                     │
│                                                                 │
│     Turn your head to see the world around you.                 │
│     There's no wrong way to do this!                            │
│                                                                 │
│              ↺ Turn left... Turn right... ↻                    │
│                                                                 │
│     ┌─────────────────────────────────────────┐                │
│     │  Progress: ████████░░░░░░░░  50%       │                │
│     └─────────────────────────────────────────┘                │
│                                                                 │
│     ✓ Looked left    ✓ Looked right    ○ Looked up             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 2: Find Your Controllers (20 seconds)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🎮 YOUR CONTROLLERS                                │
│                                                                 │
│     Look at your hands. These are your tools.                   │
│                                                                 │
│         LEFT HAND                    RIGHT HAND                 │
│     ┌─────────────────┐          ┌─────────────────┐           │
│     │   [3D Model]    │          │   [3D Model]    │           │
│     │   of Quest      │          │   of Quest      │           │
│     │   Touch Left    │          │   Touch Right   │           │
│     └─────────────────┘          └─────────────────┘           │
│           │                              │                      │
│           ▼                              ▼                      │
│     Navigation &                  Actions &                     │
│     Menu                          Selection                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 3: Point and Select (45 seconds)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              👆 POINTING & SELECTING                            │
│                                                                 │
│     Point your right controller at targets.                     │
│     Squeeze the TRIGGER to select.                              │
│                                                                 │
│                    [Target 1]  [Target 2]  [Target 3]          │
│                       ◯           ◯           ◯                │
│                                                                 │
│     ──────────────────●                                         │
│         Your laser    │                                         │
│                       ▼                                         │
│               (aim here)                                        │
│                                                                 │
│     Tip: You can use either hand to point!                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 4: Teleportation (60 seconds)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🚀 TELEPORTING TO LOCATIONS                        │
│                                                                 │
│     Push LEFT THUMBSTICK forward to show teleport arc.          │
│     Release when aiming at a destination.                       │
│                                                                 │
│                           ╱ ╲                                   │
│                          ╱   ╲                                  │
│                         ╱     ╲                                 │
│                        ╱       ╲                                │
│                       ╱         ╲                               │
│                      ●           ◎ ← Destination marker         │
│                    You                                          │
│                                                                 │
│     ┌─────────────────────────────────────────────┐            │
│     │  ⚠️  The screen will briefly dim when       │            │
│     │     teleporting. This is normal and helps   │            │
│     │     prevent motion sickness.                │            │
│     └─────────────────────────────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 5: Zoom Feature (45 seconds)
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              🔍 ZOOM IN FOR DETAILS                             │
│                                                                 │
│     See something interesting? Get a closer look!               │
│                                                                 │
│     1. Point at what you want to see                            │
│     2. Hold RIGHT GRIP to zoom                                  │
│     3. Release to return to normal view                         │
│                                                                 │
│              ┌───────────────────────┐                          │
│              │                       │                          │
│              │    🌋 VOLCANO         │ ← Zoomed view            │
│              │    (Close-up)         │                          │
│              │                       │                          │
│              └───────────────────────┘                          │
│                                                                 │
│     Try it now! Zoom in on the palm tree.                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Comfort Settings Wizard

After basic controls, users configure their comfort preferences:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              ⚙️ COMFORT SETTINGS                                │
│                                                                 │
│     Let's make sure you're comfortable.                         │
│     You can change these anytime in Settings.                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  HOW DO YOU USUALLY PLAY VR?                            │   │
│  │                                                         │   │
│  │    ○ Standing (recommended)                             │   │
│  │    ○ Seated                                             │   │
│  │    ○ Roomscale                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TURNING STYLE                                          │   │
│  │                                                         │   │
│  │    ○ Snap Turn (recommended for comfort)                │   │
│  │    ○ Smooth Turn (for experienced VR users)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  VR EXPERIENCE LEVEL                                    │   │
│  │                                                         │   │
│  │    ○ New to VR (extra comfort features ON)              │   │
│  │    ○ Some experience                                    │   │
│  │    ○ VR Veteran (minimal comfort assists)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│              [CONTINUE TO HAWAII →]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Based on selections:
- **New to VR:** Maximum vignette, snap turn at 45°, extra tooltips, slower transitions
- **Some experience:** Medium vignette, snap turn at 30°, minimal tooltips
- **VR Veteran:** Vignette off, smooth turn available, no tooltips, fast transitions

---

## Navigation & Locomotion

Movement is the #1 source of VR discomfort. We use teleportation exclusively—no smooth locomotion option exists because even offering it leads to users making themselves sick.

### Location-Based Teleportation

Unlike traditional VR teleportation (point anywhere on the ground), Big Island VR Quest uses **node-based teleportation** aligned with Street View coverage points:

```
                      CURRENT VIEW
    ┌─────────────────────────────────────────────┐
    │                                             │
    │         ◎ ←── Available destination         │
    │        /                                    │
    │       /    🌴                               │
    │      /                                      │
    │  ◎──●──◎                                   │
    │     │   \                                   │
    │     │    \                                  │
    │     ◎     ◎                                │
    │                                             │
    │   ● = Your current position                 │
    │   ◎ = Teleport destinations                 │
    │                                             │
    └─────────────────────────────────────────────┘
```

### Teleportation Flow

1. **Initiation:** Push left thumbstick forward
2. **Targeting:** Move thumbstick to highlight different destination nodes
3. **Preview:** Highlighted destination shows a ghostly preview of what you'll see
4. **Confirm:** Release thumbstick
5. **Transition:** Quick fade to black (200ms), load new panorama, fade in (200ms)

### Destination Markers Visual Design

```
    IDLE STATE              HOVER STATE             SELECTED STATE
    
        ◠                       ◠◡◠                     ╱◯╲
       ◯                       ( ◯ )                   ◯   ◯
        ◡                       ◡◠◡                     ╲◯╱
                                                     
    Subtle pulse            Expands, glows          Brief flash,
    animation               brighter                 then fade
```

Markers are rendered as floating orbs approximately 1 meter above ground level, visible through scenery with a subtle outline to ensure visibility against any background.

### Smooth vs Snap Turning

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    TURNING OPTIONS                              │
│                                                                 │
│   SNAP TURN (Default)              SMOOTH TURN                  │
│   ━━━━━━━━━━━━━━━━━                ━━━━━━━━━━━━━━━              │
│                                                                 │
│   ⟲────┃────⟳                     ⟲═════════⟳                  │
│       45°                         Continuous                    │
│                                                                 │
│   • Instant rotation              • Gradual rotation            │
│   • Prevents motion sickness      • More natural feel           │
│   • Best for new users            • Can cause discomfort        │
│                                                                 │
│   Snap angles: 15° | 30° | 45° | 60° | 90°                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Transition Vignette

During any artificial movement, a vignette (darkening around peripheral vision) reduces motion sickness:

```
┌─────────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓│
│▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓│
│▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓│
│▓░░░░░░░░░░░░░░░░░░  CLEAR CENTER  ░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓│
│▓░░░░░░░░░░░░░░░░░░    VISION      ░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓│
│▓░░░░░░░░░░░░░░░░░░                ░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓│
│▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓│
│▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓│
│▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────────────────────────────┘
                    ▓ = Darkened peripheral
                    ░ = Semi-transparent
                    Center = Clear view
```

Vignette intensity levels: **Off | Light | Medium | Strong | Maximum**

---

## Controller Mappings

Quest Touch controllers provide rich input options. Our mapping prioritizes intuitive, discoverable controls:

### Complete Controller Map

```
                    LEFT CONTROLLER                 RIGHT CONTROLLER
                    ═══════════════                 ════════════════
                    
                      ┌─────┐                         ┌─────┐
                      │MENU │ ←─ Main Menu            │ (O) │ ←─ Oculus Button
                      └─────┘                         └─────┘
                      
          ┌───┐                                               ┌───┐
          │ Y │ ←─ Toggle UI                                  │ B │ ←─ Cancel/Back
          ├───┤                                               ├───┤
          │ X │ ←─ Quick Travel                               │ A │ ←─ Confirm/Select
          └───┘                                               └───┘
          
     ┌──────────┐                                       ┌──────────┐
     │ Joystick │ ←─ Teleport                           │ Joystick │ ←─ Turn
     │    ◉     │    Navigation                         │    ◉     │    (Snap/Smooth)
     └──────────┘                                       └──────────┘
     
     ╔══════════╗                                       ╔══════════╗
     ║  GRIP    ║ ←─ Grab UI panels                     ║  GRIP    ║ ←─ ZOOM (Hold)
     ║  BUTTON  ║    (reposition)                       ║  BUTTON  ║
     ╚══════════╝                                       ╚══════════╝
     
     ╔══════════╗                                       ╔══════════╗
     ║ TRIGGER  ║ ←─ Secondary                          ║ TRIGGER  ║ ←─ PRIMARY SELECT
     ║          ║    Select                             ║          ║    (Click, confirm)
     ╚══════════╝                                       ╚══════════╝
```

### Detailed Control Reference

| Input | Primary Function | Secondary Function (with modifier) |
|-------|------------------|-----------------------------------|
| **Left Thumbstick** | Teleport navigation | - |
| **Right Thumbstick** | Snap/smooth turn | In menus: scroll up/down |
| **Left Trigger** | Secondary select | - |
| **Right Trigger** | Primary select | - |
| **Left Grip** | Grab and reposition UI | - |
| **Right Grip** | **ZOOM** (hold to zoom) | - |
| **A Button** | Confirm selection | - |
| **B Button** | Cancel / Back | - |
| **X Button** | Quick Travel menu | - |
| **Y Button** | Toggle HUD / UI | Double-tap: Reset UI positions |
| **Menu Button** | Open main menu | Long press: Recenter view |

### Controller Visualization

In-game, controllers are rendered as simplified, stylized hands that match user hand movements. When hovering over interactive elements, the index finger extends to indicate "pointing":

```
    IDLE HAND              POINTING               GRIPPING
    
      ╭───╮                 ╭───╮                  ╭───╮
     ╱│   │╲               ╱│   │                 ╔│   │╗
    │ │   │ │             │ │   │───►            ║│   │║
    │ │   │ │             │ │   │ │              ║│   │║
    │ ╰───╯ │             │ ╰───╯ │              ║╰───╯║
     ╲─────╱               ╲─────╱                ╚═════╝
```

---

## Zoom Interaction

Zoom is a cornerstone feature, allowing users to inspect distant details in panoramic scenes. The interaction must feel natural and provide clear feedback.

### Zoom Activation

**Primary Method:** Hold Right Grip

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    ZOOM INTERACTION FLOW                        │
│                                                                 │
│   1. IDLE                2. AIM                3. ZOOM          │
│   ─────────              ─────                 ──────           │
│                                                                 │
│   Normal view            Point at target       Hold right grip  │
│   No reticle             Subtle reticle        Zoom activates   │
│                          appears                                │
│                                                                 │
│   ┌─────────┐            ┌─────────┐          ┌─────────┐      │
│   │         │            │    ·    │          │ ╔═════╗ │      │
│   │  🌋     │            │  🌋     │          │ ║ 🌋  ║ │      │
│   │         │            │         │          │ ╚═════╝ │      │
│   └─────────┘            └─────────┘          └─────────┘      │
│                                                                 │
│   4. ZOOMING             5. ADJUSTING         6. EXIT          │
│   ───────────            ────────────         ──────           │
│                                                                 │
│   Zoom level             A/B or thumbstick    Release grip     │
│   indicator visible      changes zoom level   Smooth unzoom    │
│                                                                 │
│   ┌─────────┐            ┌─────────┐          ┌─────────┐      │
│   │ [2x 🔍] │            │ [4x 🔍] │          │         │      │
│   │ ╔═════╗ │            │ ╔═════╗ │          │  🌋     │      │
│   │ ║▓▓▓▓▓║ │            │ ║▓▓▓▓▓║ │          │         │      │
│   │ ╚═════╝ │            │ ╚═════╝ │          └─────────┘      │
│   └─────────┘            └─────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Zoom Reticle Design

The reticle provides precise aiming feedback without being intrusive:

```
    STANDARD RETICLE           OVER INTERACTIVE           OVER INFO POINT
    
          ╷                         ╷                          ╷
         ─┼─                       ─◉─                        ─ℹ─
          ╵                         ╵                          ╵
                                                               
    Thin crosshair            Filled center              Info icon
    appears on aim            indicates clickable        shows detail
```

### Zoom Levels and Feedback

| Level | Magnification | Use Case | Visual Feedback |
|-------|---------------|----------|-----------------|
| 1x | Normal | Default view | No indicator |
| 2x | 2× | General detail | "2×" badge |
| 4x | 4× | Reading signs | "4×" badge |
| 8x | 8× | Maximum detail | "8× MAX" badge |

**Adjusting zoom while zoomed:**
- **A button:** Zoom in one level
- **B button:** Zoom out one level
- **Right thumbstick up/down:** Smooth zoom adjustment

### Zoom Viewport Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│    Normal peripheral vision remains                             │
│    but darkened (vignette effect)                              │
│                                                                 │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                      │
│         ▓▓▓▓╔═══════════════════════╗▓▓▓▓                      │
│         ▓▓▓▓║                       ║▓▓▓▓                      │
│         ▓▓▓▓║     ZOOMED VIEW       ║▓▓▓▓                      │
│         ▓▓▓▓║                       ║▓▓▓▓   ┌────────┐         │
│         ▓▓▓▓║   🌺 Detailed         ║▓▓▓▓   │  4×    │         │
│         ▓▓▓▓║      Hibiscus         ║▓▓▓▓   │  🔍    │         │
│         ▓▓▓▓║                       ║▓▓▓▓   └────────┘         │
│         ▓▓▓▓║                       ║▓▓▓▓   Zoom level         │
│         ▓▓▓▓╚═══════════════════════╝▓▓▓▓   indicator          │
│         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                      │
│                                                                 │
│              Release GRIP to exit zoom                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Comfort During Zoom

- Zoom happens instantly (no animation) to prevent discomfort
- Peripheral vignette increases during zoom to maintain spatial stability
- Head movement while zoomed is slightly dampened to reduce jitter
- Maximum zoom time suggested: 30 seconds (gentle reminder appears)

---

## 3D UI Design

UI in VR requires fundamentally different thinking than 2D screens. Panels exist in 3D space, must be ergonomic, and should enhance rather than break presence.

### Panel Placement Ergonomics

```
                        OVERHEAD VIEW
                        
                            180°
                             │
                             │
                  120°───────┼───────60°
                       ╲     │     ╱
                        ╲    │    ╱
                         ╲   │   ╱
                          ╲  │  ╱
               SECONDARY   ╲ │ ╱   PRIMARY
               UI ZONE      ╲│╱    UI ZONE
                             ●
                           USER
                             
              ├──── 2-3 meters ────┤
                   optimal distance
```

**Vertical placement:**
```
                    SIDE VIEW
                    
            ╭───────────╮ ← Too high (neck strain)
            │ Avoid     │
            ╰───────────╯
            
       ╭─────────────────────╮
       │  COMFORTABLE ZONE   │ ← 15° above to 30° below eye level
       │  Place UI here      │
       ╰─────────────────────╯
       
            ╭───────────╮ ← Too low (neck strain)
            │ Avoid     │
            ╰───────────╯
            
            ══════════════ ← Floor
```

### Tour Guide Panel

The Tour Guide is the primary information interface, appearing when users arrive at notable locations:

```
┌─────────────────────────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════════════════════════╗│
│ ║  🌴 TOUR GUIDE                                        [X] Close ║│
│ ╠══════════════════════════════════════════════════════════════════╣│
│ ║                                                                  ║│
│ ║  ┌──────────────────────────────────────────────────────────┐   ║│
│ ║  │                                                          │   ║│
│ ║  │                   📷 LOCATION IMAGE                      │   ║│
│ ║  │                                                          │   ║│
│ ║  └──────────────────────────────────────────────────────────┘   ║│
│ ║                                                                  ║│
│ ║  ══════════════════════════════════════════════════════════════ ║│
│ ║  KILAUEA VOLCANO                                                 ║│
│ ║  Hawai'i Volcanoes National Park                                 ║│
│ ║  ══════════════════════════════════════════════════════════════ ║│
│ ║                                                                  ║│
│ ║  Kīlauea is one of the world's most active volcanoes and        ║│
│ ║  the most active of the five volcanoes that together form       ║│
│ ║  the island of Hawaiʻi. Located along the southeastern          ║│
│ ║  shore of the island, the volcano is between 210,000 and        ║│
│ ║  280,000 years old...                                           ║│
│ ║                                                                  ║│
│ ║  ┌────────────┐ ┌────────────┐ ┌────────────┐                   ║│
│ ║  │ 🔊 Listen  │ │ 📍 Map     │ │ 📚 More    │                   ║│
│ ║  └────────────┘ └────────────┘ └────────────┘                   ║│
│ ║                                                                  ║│
│ ╚══════════════════════════════════════════════════════════════════╝│
└─────────────────────────────────────────────────────────────────────┘
```

**Panel behaviors:**
- Auto-appears when entering significant locations (can be disabled)
- Positioned 2m in front of user, 10° below eye level
- Can be grabbed (left grip) and repositioned
- Double-tap Y to reset to default position
- Follows head rotation loosely (lazy follow, not locked)

### Location Browser

The location browser allows users to jump to any explored or discoverable location:

```
┌─────────────────────────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════════════════════════╗│
│ ║  🗺️ EXPLORE THE BIG ISLAND                            [X] Close ║│
│ ╠══════════════════════════════════════════════════════════════════╣│
│ ║                                                                  ║│
│ ║  VIEW:  [🗺️ Map]  [📋 List]  [⭐ Favorites]                      ║│
│ ║                                                                  ║│
│ ║  ┌──────────────────────────────────────────────────────────┐   ║│
│ ║  │                        KOHALA                            │   ║│
│ ║  │              ●                                           │   ║│
│ ║  │        WAIMEA ●                                          │   ║│
│ ║  │                              MAUNA               HAMAKUA │   ║│
│ ║  │    KONA ●                    KEA ▲                  ●    │   ║│
│ ║  │                                                          │   ║│
│ ║  │                    ★ YOU ARE HERE                        │   ║│
│ ║  │                        (Kilauea)                         │   ║│
│ ║  │            KA'U ●                            PUNA ●      │   ║│
│ ║  │                                                          │   ║│
│ ║  └──────────────────────────────────────────────────────────┘   ║│
│ ║                                                                  ║│
│ ║  Selected: Waimea - Cowboy Country                               ║│
│ ║  Distance: 45 km | Est. time: ~15 locations                      ║│
│ ║                                                                  ║│
│ ║  ┌────────────────────┐                                          ║│
│ ║  │   🚀 TRAVEL HERE   │                                          ║│
│ ║  └────────────────────┘                                          ║│
│ ║                                                                  ║│
│ ╚══════════════════════════════════════════════════════════════════╝│
└─────────────────────────────────────────────────────────────────────┘
```

**Map vs List debate resolution:** We offer both. Map provides spatial context and discovery, while list provides efficient navigation for return users.

### Settings Panel

```
┌─────────────────────────────────────────────────────────────────────┐
│ ╔══════════════════════════════════════════════════════════════════╗│
│ ║  ⚙️ SETTINGS                                          [X] Close ║│
│ ╠══════════════════════════════════════════════════════════════════╣│
│ ║                                                                  ║│
│ ║  NAVIGATION          COMFORT            AUDIO                    ║│
│ ║  ──────────          ───────            ─────                    ║│
│ ║  │▓▓▓▓▓▓▓│           │▓▓▓▓▓▓▓│          │░░░░░░░│               ║│
│ ║                                                                  ║│
│ ╠══════════════════════════════════════════════════════════════════╣│
│ ║                                                                  ║│
│ ║  ┌─ COMFORT ─────────────────────────────────────────────────┐  ║│
│ ║  │                                                           │  ║│
│ ║  │  Vignette Intensity                                       │  ║│
│ ║  │  ○ Off   ○ Light   ● Medium   ○ Strong   ○ Maximum       │  ║│
│ ║  │                                                           │  ║│
│ ║  │  ─────────────────────────────────────────────────────   │  ║│
│ ║  │                                                           │  ║│
│ ║  │  Turning Style                                            │  ║│
│ ║  │  ● Snap Turn          ○ Smooth Turn                       │  ║│
│ ║  │                                                           │  ║│
│ ║  │  Snap Angle: [◀ 30° ▶]                                   │  ║│
│ ║  │                                                           │  ║│
│ ║  │  ─────────────────────────────────────────────────────   │  ║│
│ ║  │                                                           │  ║│
│ ║  │  Play Mode                                                │  ║│
│ ║  │  ● Standing          ○ Seated          ○ Roomscale        │  ║│
│ ║  │                                                           │  ║│
│ ║  └───────────────────────────────────────────────────────────┘  ║│
│ ║                                                                  ║│
│ ║  [↺ Reset to Defaults]                      [✓ Apply & Close]   ║│
│ ║                                                                  ║│
│ ╚══════════════════════════════════════════════════════════════════╝│
└─────────────────────────────────────────────────────────────────────┘
```

### Summoning and Dismissing UI

| Action | Result |
|--------|--------|
| **Y button (tap)** | Toggle main UI visibility |
| **Y button (double-tap)** | Reset all UI to default positions |
| **X button** | Open Quick Travel (location browser) |
| **Menu button** | Open full settings menu |
| **Look away + timer** | UI auto-fades after 10 seconds of no interaction |
| **Look at UI** | UI fades back in |

---

## Information Display

### Location Name and History

Minimal HUD that appears when entering a new area:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────┐               │
│  │  📍 AKAKA FALLS STATE PARK                  │               │
│  │     "The tallest waterfall on the island"   │               │
│  │     ────────────────────                    │               │
│  │     Press A for more info                   │               │
│  └─────────────────────────────────────────────┘               │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This notification:
- Fades in over 0.5s when entering a location
- Remains for 5 seconds
- Fades out over 0.5s
- Positioned lower-center to avoid blocking the view

### Compass / Mini-Map

A subtle compass in peripheral vision provides orientation:

```
                    COMPASS HUD (upper right peripheral)
                    
                         N
                         │
                    W ───┼─── E
                         │
                         S
                         
                    Rotates with head movement
                    Shows cardinal direction facing
```

**Optional mini-map** (can be toggled):

```
┌────────────────┐
│    N           │
│    ▲           │
│  ◦   ◦   ◦    │  ◦ = Nearby viewpoints
│    ★           │  ★ = Your position
│  ◦       ◦    │  ▲ = Direction facing
│                │
└────────────────┘
```

### Progress Indicators

For users who want to "complete" areas:

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  HAWAI'I VOLCANOES NATIONAL PARK                            │
│  ════════════════════════════════                           │
│                                                              │
│  Viewpoints discovered: 12 / 28                             │
│  ████████████░░░░░░░░░░░░░░  43%                           │
│                                                              │
│  Hidden gems found: 2 / 5  🔍                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Comfort Features

### Comprehensive Comfort Settings

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              COMFORT PRESETS                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🐢 MAXIMUM COMFORT                                      │   │
│  │  Best for VR newcomers or those sensitive to motion     │   │
│  │  • Snap turn 45°                                         │   │
│  │  • Strong vignette                                       │   │
│  │  • Slow transitions                                      │   │
│  │  • Seated mode                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🚶 BALANCED (Default)                                   │   │
│  │  Good mix of comfort and immersion                       │   │
│  │  • Snap turn 30°                                         │   │
│  │  • Medium vignette                                       │   │
│  │  • Standard transitions                                  │   │
│  │  • Standing mode                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏃 MINIMAL ASSISTANCE                                   │   │
│  │  For experienced VR users                                │   │
│  │  • Smooth turn available                                 │   │
│  │  • Light/no vignette                                     │   │
│  │  • Fast transitions                                      │   │
│  │  • Roomscale enabled                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [⚙️ Custom Settings...]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Vignette Intensity Visual Reference

```
    OFF              LIGHT           MEDIUM          STRONG          MAXIMUM
    
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│          │    │░         │    │▒░        │    │▓▒░       │    │▓▓▓▒░    │
│          │    │          │    │░         │    │▒░        │    │▓▒░      │
│    🌺    │    │    🌺    │    │   🌺     │    │   🌺     │    │   🌺    │
│          │    │          │    │░         │    │▒░        │    │▓▒░      │
│          │    │░         │    │▒░        │    │▓▒░       │    │▓▓▓▒░    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘

  No edge         Subtle        Noticeable      Prominent       Significant
  darkening       darkening      edges          tunneling        tunnel
```

### Snap Turn Angles

```
    15°             30°             45°             60°             90°
    
    ╭──╮            ╭───╮           ╭────╮          ╭─────╮         ╭──────╮
    │▲ │            │ ▲ │           │  ▲ │          │  ▲  │         │   ▲  │
    ╰──╯            ╰───╯           ╰────╯          ╰─────╯         ╰──────╯
    
  Very fine      Fine turn       Medium turn     Large turn      Quarter turn
  (slow nav)     (default new)   (default)       (quick nav)     (fastest)
```

### Seated vs Standing Mode Differences

| Feature | Seated | Standing | Roomscale |
|---------|--------|----------|-----------|
| Floor height | Adjusted +0.5m | Real floor | Real floor |
| UI placement | Lower | Standard | Adaptive |
| Teleport height | Seated eye level | Standing | Variable |
| Physical crouch | Disabled | Optional | Enabled |

### Brightness and Contrast

For scenes with extreme lighting (midday sun, volcanic glow), users can adjust:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  DISPLAY SETTINGS                                               │
│                                                                 │
│  Brightness                                                     │
│  ☼────────────────●────────────────☀                           │
│  Darker          Default          Brighter                      │
│                                                                 │
│  Contrast                                                       │
│  ◐────────────────●────────────────◑                           │
│  Lower           Default          Higher                        │
│                                                                 │
│  Night Mode (warm colors, reduced blue)                         │
│  [ OFF ] ─────────●───────────────── [ ON ]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Audio UX

Sound design in VR is crucial for presence. Our audio system provides both feedback and immersion.

### Spatial Audio Cues

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    SPATIAL AUDIO MAP                            │
│                                                                 │
│                         🌊                                      │
│                    (ocean waves)                                │
│                      behind                                     │
│                                                                 │
│           🐦                              🎵                    │
│      (bird call)                    (ukulele music)            │
│         left                           right                    │
│                                                                 │
│                         👤                                      │
│                       (user)                                    │
│                                                                 │
│                         🌋                                      │
│                   (volcanic rumble)                             │
│                       front                                     │
│                                                                 │
│  Audio sources positioned in 3D space                           │
│  Volume decreases with distance                                 │
│  Provides environmental presence                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### UI Feedback Sounds

| Action | Sound | Character |
|--------|-------|-----------|
| Button hover | Soft tick | Subtle, 100ms |
| Button select | Gentle pling | Satisfying, 200ms |
| Teleport initiate | Whoosh (rising) | Building anticipation |
| Teleport complete | Whoosh (falling) + arrival tone | Arrival confirmation |
| Zoom in | Focus sound (tightening) | Mechanical, precise |
| Zoom out | Release sound (opening) | Relief, expansion |
| Error | Low bonk | Non-jarring, informative |
| Success | Harmonious chime | Rewarding |
| Panel open | Paper unfold | Physical, tactile |
| Panel close | Paper fold | Matching pair |

### Volume Controls

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  AUDIO SETTINGS                                                 │
│                                                                 │
│  Master Volume                                                  │
│  🔇 ────────────────────●─────────────────── 🔊                │
│                       70%                                       │
│                                                                 │
│  ─────────────────────────────────────────────────             │
│                                                                 │
│  Environment Sounds (nature, ambient)                           │
│  🔇 ────────────────────────●───────────────── 🔊              │
│                            85%                                  │
│                                                                 │
│  UI Sounds (clicks, feedback)                                   │
│  🔇 ──────────●──────────────────────────────── 🔊              │
│             40%                                                 │
│                                                                 │
│  Narration / Guide Voice                                        │
│  🔇 ────────────────────────────────●───────── 🔊              │
│                                   100%                          │
│                                                                 │
│  [ ] Mute when headset removed                                  │
│  [✓] Spatial audio enabled                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Visual Language

### Color Palette

Colors must work across Hawaii's diverse environments—from bright sunny beaches to dark lava fields to misty rainforests.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  PRIMARY UI COLORS                                              │
│  ─────────────────                                              │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │▓▓▓▓▓▓▓▓▓│ │░░░░░░░░░│ │▓▓▓▓▓▓▓▓▓│ │░░░░░░░░░│ │▓▓▓▓▓▓▓▓▓│  │
│  │▓ DEEP  ▓│ │░ LIGHT ░│ │▓ OCEAN ▓│ │░ SAND  ░│ │▓ LAVA  ▓│  │
│  │▓ BLUE  ▓│ │░ CREAM ░│ │▓ TEAL  ▓│ │░ BEIGE ░│ │▓  RED  ▓│  │
│  │▓▓▓▓▓▓▓▓▓│ │░░░░░░░░░│ │▓▓▓▓▓▓▓▓▓│ │░░░░░░░░░│ │▓▓▓▓▓▓▓▓▓│  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│   #1E3A5F    #FDF6E3     #2C8C99     #D4C5A9     #8B2500      │
│   Backgrounds Text/Icons  Highlights  Secondry   Alerts       │
│                                                                 │
│  SEMANTIC COLORS                                                │
│  ───────────────                                                │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │░░░░░░░░░│ │▓▓▓▓▓▓▓▓▓│ │▒▒▒▒▒▒▒▒▒│ │▓▓▓▓▓▓▓▓▓│              │
│  │░SUCCESS░│ │▓WARNING▓│ │▒ ERROR ▒│ │▓  INFO ▓│              │
│  │░░░░░░░░░│ │▓▓▓▓▓▓▓▓▓│ │▒▒▒▒▒▒▒▒▒│ │▓▓▓▓▓▓▓▓▓│              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│   #2E7D32    #F9A825     #C62828     #1565C0                   │
│   Green      Amber       Red         Blue                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Adaptive UI Backgrounds

UI panels use semi-transparent backgrounds that adapt to scene brightness:

```
    BRIGHT SCENE                    DARK SCENE
    (sunny beach)                   (lava field at night)
    
    ╔═══════════════════╗          ╔═══════════════════╗
    ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║          ║░░░░░░░░░░░░░░░░░░░║
    ║▓  Dark panel     ▓║          ║░  Light panel    ░║
    ║▓  with light     ▓║          ║░  with dark      ░║
    ║▓  text           ▓║          ║░  text           ░║
    ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║          ║░░░░░░░░░░░░░░░░░░░║
    ╚═══════════════════╝          ╚═══════════════════╝
    
    Provides contrast              Provides contrast
    in bright scenes               in dark scenes
```

### Icons and Typography

**Icon style:** Outlined, rounded, simple silhouettes that read clearly at VR distances.

```
    ICON EXAMPLES (simplified VR-readable designs)
    
    ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
    │  ⚙   │ │  🗺   │ │  🔍  │ │  ◀  │ │  ●   │ │  ⓧ  │
    │      │ │      │ │      │ │      │ │      │ │      │
    │ Set- │ │ Map  │ │ Zoom │ │ Back │ │ Info │ │Close │
    │ tings│ │      │ │      │ │      │ │      │ │      │
    └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
    
    Minimum size: 48px equivalent (larger in VR)
    Generous padding around touch targets
```

**Typography:**
- **Headlines:** Sans-serif, bold, minimum 24pt equivalent
- **Body text:** Sans-serif, regular, minimum 18pt equivalent
- **Captions:** Sans-serif, light, minimum 14pt equivalent
- **All text:** High contrast, no thin fonts, adequate letter-spacing

### Selection and Highlight States

```
    NORMAL              HOVER               SELECTED            DISABLED
    
    ╭──────────╮       ╭──────────╮       ╭──────────╮       ╭──────────╮
    │          │       │▒▒▒▒▒▒▒▒▒▒│       │██████████│       │░░░░░░░░░░│
    │  Button  │       │  Button  │       │  Button  │       │  Button  │
    │          │       │▒▒▒▒▒▒▒▒▒▒│       │██████████│       │░░░░░░░░░░│
    ╰──────────╯       ╰──────────╯       ╰──────────╯       ╰──────────╯
    
    Standard           Subtle glow         Solid fill          Faded, no
    appearance         + scale 1.05x       + checkmark         interaction
```

---

## Error States

### No Street View Coverage

When users try to navigate to areas without coverage:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│              ┌───────────────────────────────────┐             │
│              │                                   │             │
│              │        🚫 AREA UNAVAILABLE        │             │
│              │                                   │             │
│              │   This location doesn't have      │             │
│              │   360° imagery available.         │             │
│              │                                   │             │
│              │   ┌───────────────────────────┐  │             │
│              │   │  Nearest viewpoint: 120m  │  │             │
│              │   │  [🚀 GO THERE]            │  │             │
│              │   └───────────────────────────┘  │             │
│              │                                   │             │
│              │   [← Back]        [🗺️ Open Map]  │             │
│              │                                   │             │
│              └───────────────────────────────────┘             │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Loading States

**Location Loading:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓       🌺 Loading...             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓       Kilauea Caldera             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓       ████████░░░░ 67%          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│                                                                 │
│  Scene fades to gentle environment during load                  │
│  Hawaiian music plays softly                                    │
│  No harsh loading screens                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Texture Streaming (low to high res):**
```
    STAGE 1             STAGE 2             STAGE 3 (Final)
    Placeholder         Medium res          Full resolution
    
    ┌──────────┐       ┌──────────┐       ┌──────────┐
    │▓▓▓▓▓▓▓▓▓▓│       │▒▒▒▒▒▒▒▒▒▒│       │ Detailed │
    │▓▓▓▓▓▓▓▓▓▓│       │▒▒🌋▒▒▒▒▒▒│       │ 🌋 image │
    │▓▓▓▓▓▓▓▓▓▓│       │▒▒▒▒▒▒▒▒▒▒│       │  crisp   │
    └──────────┘       └──────────┘       └──────────┘
    
    Solid color        Recognizable        Full fidelity
    (immediate)        (1-2 seconds)       (progressive)
```

### Network Issues

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                                                                 │
│              ┌───────────────────────────────────┐             │
│              │                                   │             │
│              │        📡 CONNECTION ISSUE        │             │
│              │                                   │             │
│              │   Having trouble reaching the     │             │
│              │   servers. This might help:       │             │
│              │                                   │             │
│              │   • Check your WiFi connection    │             │
│              │   • Move closer to your router    │             │
│              │   • Try again in a moment         │             │
│              │                                   │             │
│              │   ┌─────────────────────────────┐│             │
│              │   │       [🔄 TRY AGAIN]        ││             │
│              │   └─────────────────────────────┘│             │
│              │                                   │             │
│              │   [Continue offline with cached]  │             │
│              │                                   │             │
│              └───────────────────────────────────┘             │
│                                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Timeout / Long Load

If loading exceeds 15 seconds:

```
┌─────────────────────────────────────────────────────────────────┐
│              ┌───────────────────────────────────┐             │
│              │                                   │             │
│              │        ⏳ TAKING A WHILE...       │             │
│              │                                   │             │
│              │   This location has high-res      │             │
│              │   imagery that's taking time      │             │
│              │   to download.                    │             │
│              │                                   │             │
│              │   ████████████░░░░░░░ 75%        │             │
│              │                                   │             │
│              │   Options:                        │             │
│              │   [⏳ Keep Waiting]               │             │
│              │   [⚡ Load Low-Res Version]       │             │
│              │   [← Cancel]                      │             │
│              │                                   │             │
│              └───────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Accessibility Considerations

### Visual Accessibility

- **Color blindness modes:** Deuteranopia, Protanopia, Tritanopia filters
- **High contrast mode:** Stronger outlines, bolder colors
- **Text scaling:** 100% / 125% / 150% / 175%
- **Reduce motion:** Disables animations, instant transitions

### Hearing Accessibility

- **Visual sound indicators:** Icons show ambient sounds spatially
- **Subtitles:** For narration and guide audio
- **UI sounds optional:** Full visual feedback available without audio

### Motor Accessibility

- **One-handed mode:** All functions accessible with single controller
- **Dwell selection:** Look at buttons for 2 seconds to select (no trigger needed)
- **Simplified controls:** Reduce to essential buttons only
- **Larger targets:** 2x button/target sizes

### Cognitive Accessibility

- **Simple mode:** Removes progress tracking, reduces UI
- **Always-on hints:** Persistent controller labels
- **Pause anytime:** Experience saves state constantly
- **No time pressure:** Nothing expires or requires speed

---

## Appendix: Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              BIG ISLAND VR QUEST - QUICK CONTROLS              │
│              ═════════════════════════════════════              │
│                                                                 │
│   LEFT CONTROLLER              RIGHT CONTROLLER                 │
│                                                                 │
│   [Thumbstick] Move/Teleport   [Thumbstick] Turn left/right    │
│   [Trigger]    Secondary pick  [Trigger]    Select/Confirm     │
│   [Grip]       Grab UI panels  [Grip]       ZOOM (hold)        │
│   [X]          Quick Travel    [A]          Confirm            │
│   [Y]          Toggle UI       [B]          Back/Cancel        │
│   [Menu]       Settings                                         │
│                                                                 │
│   TIPS:                                                         │
│   • Feeling sick? Take a break, adjust comfort settings         │
│   • Lost? Press X for the map                                   │
│   • Double-tap Y to reset all UI positions                      │
│   • Long-press Menu to recenter view                            │
│                                                                 │
│                         🌺 Enjoy your journey! 🌺              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*Document maintained by the Big Island VR Quest UX Team*  
*For implementation questions, refer to ARCHITECTURE.md*
