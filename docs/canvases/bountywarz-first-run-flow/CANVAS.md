---
name: "bountywarz-first-run-flow"
title: "BountyWarz First-Run Flow - Clean Funnel Diagram"
type: "mermaid"
---

flowchart TD
    %% ===== CLEAN FUNNEL - SYNTHESIS =====
    
    %% Styles
    classDef primary fill:#00ff8820,stroke:#00ff88,stroke-width:2px,color:#000
    classDef secondary fill:#0088ff20,stroke:#0088ff,stroke-width:2px,color:#fff
    classDef action fill:#ff444420,stroke:#ff4444,stroke-width:2px,color:#fff
    classDef decision fill:#ffff0020,stroke:#ffd700,stroke-width:2px,color:#000
    classDef success fill:#00ff0020,stroke:#00ff00,stroke-width:2px,color:#000
    
    %% ===== MAIN FLOW =====
    A[Landing Page\n\nFly recon drones over real London.\nBreach live targets. Earn certification skills.]:::primary
    
    A --> B{Choose Path}:::decision
    
    B -->|🎮 Play instantly| C[Guest Mission Intro\n\n"Try the game immediately\nNo signup required"]:::primary
    B -->|👤 Save progress| D[Captain Creation\n\n"Create your identity\n2 minutes"]:::secondary
    
    C --> E[First Mission\n\nCore Loop:\n1. Fly to target\n2. Hold hack\n3. Answer quiz\n4. Earn card]:::action
    D --> E
    
    E --> F[Earn First Card\n\n✓ Skill card sealed\n✓ Core gameplay experienced]:::success
    
    F --> G{Guest or Captain?}:::decision
    
    G -->|Guest| H[Prompt: Save Progress?\n\n"Create a captain to keep\nyour nation, cards, and progression"]:::secondary
    G -->|Captain| I[Continue Progression\n\nNext mission\nLeaderboard climb]:::primary
    
    H -->|Yes| D
    H -->|No| J[Exit - No Loss\n\nReturn anytime via /demo]:::action
    
    %% ===== SECONDARY FLOWS =====
    I --> K[Level Up\n\nNew weapons\nNew nations\nNew CVEs]:::primary
    K --> L[Returning Player?\n\nLogin with captain key]:::secondary
    L --> I
    
    D --> M[Captain Created\n\n🔑 Save your captain key\nThis is your password\nSave it somewhere safe]:::success
    M --> I
    
    %% ===== ERROR HANDLING =====
    L -->|Invalid key| N[Error: Invalid captain key\n\nOnly shown AFTER failed attempt\nWith recovery path]:::action
    N --> L
    
    %% ===== LOGIN FLOW =====
    O[Returning Captain?\n\nLogin section below fold\nNot primary focus]:::secondary
    O --> P[Enter username + captain key]:::action
    P -->|Valid| I
    P -->|Invalid| N
    
    %% ===== KEY PRINCIPLES =====
    subgraph Principles
      Q["✓ Fly first, explain second"]
      R["✓ Defer friction until first win"]
      S["✓ No error messages on default state"]
      T["✓ Clear path hierarchy"]
      U["✓ Guest mode = instant trial"]
      V["✓ Captain mode = persistence"]
    end
    
    style Q fill:#00ff8820,stroke:#00ff88
    style R fill:#00ff8820,stroke:#00ff88
    style S fill:#00ff8820,stroke:#00ff88
    style T fill:#00ff8820,stroke:#00ff88
    style U fill:#00ff8820,stroke:#00ff88
    style V fill:#00ff8820,stroke:#00ff88

flowchart LR
    %% ===== PAGE HIERARCHY =====
    subgraph Homepage
      A1[Hero\n\nPrimary CTAs:\n🎮 Play First Mission\n👤 Create Captain]:::primary
      A2[Secondary Explanation\n\nGuest vs Captain vs Key]:::secondary
      A3[Features\n\nNations, Arsenal, etc.]:::action
      A4[Login\n\nReturning players only]:::secondary
    end
    
    subgraph Demo
      B1[Guest Mission\n\nFull HUD\nSample targets\nCore loop]:::primary
      B2[Post-Mission\n\nSave prompt\nOr continue guest]:::decision
    end
    
    subgraph Captain
      C1[Creation Flow\n\nName + Nation\nKey generation]:::secondary
      C2[First Mission\n\nPersistent progress]:::primary
    end
    
    A1 --> B1
    A1 --> C1
    A4 --> C2
    B1 --> B2
    B2 --> C1
    C1 --> C2

flowchart TD
    %% ===== COPY HIERARCHY =====
    subgraph Homepage Copy
      H1[Headline:\nFly recon drones over real London.\nBreach live targets. Earn certification skills.]:::primary
      H2[Primary CTAs:\n🎮 PLAY FIRST MISSION\n👤 CREATE CAPTAIN]:::primary
      H3[Subtitle:\nFree · Browser-native · No install · No crypto]:::secondary
      H4[Secondary:\nGuest Mode: Instant trial, no saved progress\nCaptain Mode: Keeps nation, cards, progression\nCaptain Key: Your password to return]:::secondary
    end
    
    subgraph Login Copy
      L1[Header:\nReturn to Your Captain]:::secondary
      L2[Subheader:\nContinue your hunt with your existing identity]:::secondary
      L3[Form:\nUsername\nPassword]:::action
      L4[Links:\nCreate new captain\nForgot captain key?]:::action
    end
    
    subgraph Captain Creation Copy
      C1[Header:\nWelcome, Captain]:::success
      C2[Key Display:\n🔑 Your Captain Key\nSave this to return on any device]:::success
      C3[Button:\nCopy to Clipboard\nI've Saved It]:::primary
    end
    
    H1 --> H2
    H2 --> H3
    H3 --> H4
    H4 --> L1
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> C1
    C1 --> C2
    C2 --> C3
