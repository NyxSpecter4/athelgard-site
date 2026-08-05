---
name: "bountywarz-upgrades"
title: "BountyWarz UX Upgrades - Implementation Guide"
type: "text/markdown"
---

# BountyWarz UX Upgrades - Implementation Guide

This canvas contains all the code changes needed to fix the play funnel issues identified in the UX teardown.

## Priority Order

### P0: Critical Trust Fixes (Do These First - <30 min)
1. Remove pre-visible error message from login form
2. Move login form below the fold

### P1: Core Flow Improvements (2-4 hours)
3. Add "Try Demo" button and guest flow
4. Create `/demo` endpoint

### P2: Clarity Improvements (1-2 hours)
5. Rename fields for clarity
6. Add tooltips and help text

---

## 1. Remove Pre-Visible Error Message

**File:** Your login component (likely `components/LoginForm.jsx` or similar)

**Problem:** The error message "Invalid captain name or recovery key!" appears before any user interaction.

**Fix:** Make error message conditional on failed login attempt.

```jsx
// BEFORE (problematic)
function LoginForm() {
  return (
    <div>
      <p>Invalid captain name or recovery key!</p>  {/* Always visible! */}
      <input type="text" placeholder="Captain name" />
      <input type="password" placeholder="Recovery key" />
      <button>Login</button>
    </div>
  );
}

// AFTER (fixed)
function LoginForm() {
  const [error, setError] = useState(null);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    try {
      await loginUser(formData);
    } catch (err) {
      setError("Invalid captain name or recovery key!");
    }
  };
  
  return (
    <div>
      {error && <p className="error">{error}</p>}  {/* Only shows after failed attempt */}
      <input type="text" placeholder="Captain name" />
      <input type="password" placeholder="Recovery key" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

---

## 2. Move Login Form Below the Fold

**File:** Your main page (`pages/index.jsx` or `pages/index.html`)

**Current Structure (Problematic):**
```html
<!-- Hero section -->
<div class="hero">...</div>

<!-- Login form appears HERE - too early! -->
<div class="login-form">...</div>

<!-- Game features -->
<div class="features">...</div>
```

**New Structure:**
```html
<!-- Hero section with primary CTAs -->
<div class="hero">
  <h1>Fly Recon Drones Over London</h1>
  <p>Breach live targets. Earn real certification skills.</p>
  
  <div class="cta-group">
    <button class="primary" onclick="window.location='/demo'">
      🎮 TRY DEMO (No Account)
    </button>
    <button class="secondary" onclick="window.location='/create-captain'">
      👤 CREATE CAPTAIN (2 min)
    </button>
  </div>
</div>

<!-- How it works -->
<div class="how-it-works">...</div>

<!-- Game features -->
<div class="features">...</div>

<!-- Login form moved HERE - below the fold -->
<div class="login-section">
  <h2>Returning Captain?</h2>
  <LoginForm />
</div>
```

**CSS for CTA buttons:**
```css
.cta-group {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
  justify-content: center;
}

.cta-group .primary {
  background: #00ff88;
  color: #000;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,255,136,0.3);
}

.cta-group .secondary {
  background: transparent;
  color: #00ff88;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: 2px solid #00ff88;
  border-radius: 8px;
  cursor: pointer;
}

.login-section {
  margin-top: 4rem;
  padding: 2rem;
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
}
```

---

## 3. Create Demo Endpoint

**File:** `pages/demo.jsx` (or `demo.html`)

```jsx
// pages/demo.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function DemoPage() {
  const [mission, setMission] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  
  useEffect(() => {
    // Load sample mission
    setMission({
      id: 'demo-001',
      title: 'SF Drone Recon - Demo',
      description: 'Fly to the target ring and answer the quiz to earn a sample skill card.',
      targets: [
        { id: 1, x: 50, y: 30, type: 'cve', name: 'Heartbleed Colossus', difficulty: 'Easy' }
      ]
    });
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleCompleteDemo = () => {
    // Show modal prompting to create account
    alert('Demo complete! Create a captain to save your progress and access all missions.');
    window.location.href = '/create-captain';
  };
  
  if (!mission) return <div>Loading demo...</div>;
  
  return (
    <div className="demo-page">
      <Head>
        <title>BountyWarz Demo - Try Without Account</title>
      </Head>
      
      {/* HUD */}
      <div className="hud">
        <div className="hud-stats">
          <span>Altitude: 100m</span>
          <span>Speed: 30 km/h</span>
          <span>Heading: N</span>
          <span>Battery: 85%</span>
          <span>Score: {score}</span>
          <span>Time: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
        </div>
        <div className="hud-tools">
          <button>Data Sniffer</button>
          <button>Override</button>
          <button>EMP Pulse</button>
        </div>
      </div>
      
      {/* Mission Area */}
      <div className="mission-area">
        <h1>{mission.title}</h1>
        <p>{mission.description}</p>
        
        {/* Simplified map */}
        <div className="map" style={{ position: 'relative', width: '100%', height: '400px', background: '#111' }}>
          {mission.targets.map(target => (
            <div 
              key={target.id}
              className="target-ring"
              style={{
                position: 'absolute',
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: '40px',
                height: '40px',
                border: '2px solid #00ff88',
                borderRadius: '50%',
                animation: 'pulse 2s infinite'
              }}
            >
              <span style={{ color: '#00ff88', fontSize: '12px' }}>⚡</span>
            </div>
          ))}
          <div className="drone" style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '20px',
            height: '20px',
            background: '#00ffff',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)'
          }} />
        </div>
        
        <div className="instructions">
          <h3>Instructions:</h3>
          <ol>
            <li>Fly to the glowing target ring</li>
            <li>Hold hack to breach it</li>
            <li>Answer the quiz to earn a card</li>
          </ol>
        </div>
        
        <button 
          className="hack-button"
          onClick={() => setScore(prev => prev + 100)}
        >
          HOLD TO HACK
        </button>
        
        {score >= 100 && (
          <div className="quiz-modal">
            <h3>Quiz: What is CVE-2014-0160?</h3>
            <button onClick={() => setScore(prev => prev + 500)}>Heartbleed</button>
            <button onClick={() => setScore(prev => prev + 0)}>Log4Shell</button>
            <button onClick={() => setScore(prev => prev + 0)}>EternalBlue</button>
          </div>
        )}
        
        {score >= 600 && (
          <div className="completion-modal">
            <h2>🎉 Demo Complete!</h2>
            <p>You earned a sample skill card!</p>
            <button onClick={handleCompleteDemo}>Create Captain to Save Progress</button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .demo-page {
          min-height: 100vh;
          background: #0a0a0f;
          color: #fff;
          padding: 2rem;
        }
        .hud {
          position: fixed;
          top: 10px;
          left: 10px;
          right: 10px;
          background: rgba(0,0,0,0.7);
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          backdrop-filter: blur(10px);
        }
        .hud-stats {
          display: flex;
          gap: 1.5rem;
          font-family: monospace;
        }
        .mission-area {
          margin-top: 100px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .map {
          margin: 2rem 0;
          border: 1px solid #333;
          border-radius: 8px;
        }
        .hack-button {
          background: #ff4444;
          color: white;
          padding: 1rem 2rem;
          font-size: 1.2rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin: 1rem 0;
        }
        .quiz-modal, .completion-modal {
          background: rgba(0,0,0,0.9);
          padding: 2rem;
          border-radius: 12px;
          margin: 2rem 0;
          text-align: center;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
          50% { box-shadow: 0 0 0 10px rgba(0,255,136,0); }
        }
      `}</style>
    </div>
  );
}
```

**For static HTML version:**

```html
<!-- pages/demo.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BountyWarz Demo</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0a0a0f;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .hud {
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      backdrop-filter: blur(10px);
      z-index: 100;
    }
    .hud-stats {
      display: flex;
      gap: 1.5rem;
      font-family: monospace;
    }
    .hud-tools button {
      margin-left: 0.5rem;
      padding: 0.5rem 1rem;
      background: #333;
      color: #00ff88;
      border: 1px solid #00ff88;
      border-radius: 4px;
      cursor: pointer;
    }
    .mission-area {
      margin-top: 100px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      padding: 2rem;
    }
    .map {
      position: relative;
      width: 100%;
      height: 400px;
      background: #111;
      border: 1px solid #333;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .target-ring {
      position: absolute;
      left: 50%;
      top: 30%;
      width: 40px;
      height: 40px;
      border: 2px solid #00ff88;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .target-ring::after {
      content: '⚡';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #00ff88;
      font-size: 12px;
    }
    .drone {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 20px;
      height: 20px;
      background: #00ffff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
    .instructions {
      background: rgba(0,0,0,0.5);
      padding: 1.5rem;
      border-radius: 8px;
      margin: 2rem 0;
    }
    .hack-button {
      background: #ff4444;
      color: white;
      padding: 1rem 2rem;
      font-size: 1.2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin: 1rem 0;
      display: block;
      width: 100%;
    }
    .quiz-modal, .completion-modal {
      background: rgba(0,0,0,0.9);
      padding: 2rem;
      border-radius: 12px;
      margin: 2rem 0;
      text-align: center;
    }
    .quiz-modal button, .completion-modal button {
      margin: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #00ff88;
      color: #000;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
      50% { box-shadow: 0 0 0 10px rgba(0,255,136,0); }
    }
  </style>
</head>
<body>
  <div class="hud">
    <div class="hud-stats">
      <span>Altitude: 100m</span>
      <span>Speed: 30 km/h</span>
      <span>Heading: N</span>
      <span>Battery: 85%</span>
      <span>Score: <span id="score">0</span></span>
      <span>Time: <span id="timer">5:00</span></span>
    </div>
    <div class="hud-tools">
      <button>Data Sniffer</button>
      <button>Override</button>
      <button>EMP Pulse</button>
    </div>
  </div>
  
  <div class="mission-area">
    <h1>SF Drone Recon - Demo</h1>
    <p>Fly to the target ring and answer the quiz to earn a sample skill card.</p>
    
    <div class="map">
      <div class="target-ring"></div>
      <div class="drone"></div>
    </div>
    
    <div class="instructions">
      <h3>Instructions:</h3>
      <ol>
        <li>Fly to the glowing target ring</li>
        <li>Hold hack to breach it</li>
        <li>Answer the quiz to earn a card</li>
      </ol>
    </div>
    
    <button class="hack-button" onclick="startQuiz()">HOLD TO HACK</button>
    
    <div id="quiz" class="quiz-modal" style="display: none;">
      <h3>Quiz: What is CVE-2014-0160?</h3>
      <button onclick="answerQuiz('heartbleed')">Heartbleed</button>
      <button onclick="answerQuiz('wrong')">Log4Shell</button>
      <button onclick="answerQuiz('wrong')">EternalBlue</button>
    </div>
    
    <div id="completion" class="completion-modal" style="display: none;">
      <h2>🎉 Demo Complete!</h2>
      <p>You earned a sample skill card!</p>
      <button onclick="window.location='/create-captain'">Create Captain to Save Progress</button>
    </div>
  </div>
  
  <script>
    let score = 0;
    let timeLeft = 300;
    
    // Update score display
    function updateScore() {
      document.getElementById('score').textContent = score;
    }
    
    // Timer
    const timer = setInterval(() => {
      timeLeft--;
      const minutes = Math.floor(timeLeft / 60);
      const seconds = String(timeLeft % 60).padStart(2, '0');
      document.getElementById('timer').textContent = minutes + ':' + seconds;
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        document.getElementById('timer').textContent = '0:00';
      }
    }, 1000);
    
    function startQuiz() {
      score += 100;
      updateScore();
      document.getElementById('quiz').style.display = 'block';
      document.querySelector('.hack-button').style.display = 'none';
    }
    
    function answerQuiz(answer) {
      if (answer === 'heartbleed') {
        score += 500;
        updateScore();
        document.getElementById('quiz').style.display = 'none';
        document.getElementById('completion').style.display = 'block';
      } else {
        alert('Wrong answer! Try again.');
      }
    }
  </script>
</body>
</html>
```

---

## 4. Rename Fields for Clarity

**File:** Login form component

```jsx
// BEFORE
<>
  <label>Captain name</label>
  <input type="text" name="captainName" />
  
  <label>Recovery key</label>
  <input type="password" name="recoveryKey" />
</>

// AFTER
<>
  <label>
    Username (Captain name)
    <span class="help">Your unique identifier in the game</span>
  </label>
  <input type="text" name="captainName" placeholder="e.g., CyberPilot7" />
  
  <label>
    Password (Recovery key)
    <span class="help">Save this! It's your only way to log back in</span>
  </label>
  <input type="password" name="recoveryKey" placeholder="••••••••••••" />
</>
```

**CSS for help text:**
```css
.help {
  font-size: 0.8rem;
  color: #666;
  display: block;
  margin-top: 0.25rem;
}
```

---

## 5. Add Tooltips

**Using a simple tooltip library or custom implementation:**

```jsx
// Add to your component
import { Tooltip } from 'react-tooltip';

// In your login form
<>
  <label>
    Username
    <span 
      data-tooltip-id="username-tooltip"
      data-tooltip-content="Your captain name - pick something memorable!"
      style={{ cursor: 'help', marginLeft: '0.5rem' }}
    >ⓘ</span>
  </label>
  <input type="text" name="captainName" />
  
  <Tooltip id="username-tooltip" />
</>
```

Or simple CSS-only tooltips:

```css
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-icon {
  cursor: help;
  margin-left: 0.5rem;
  color: #666;
}

.tooltip-text {
  visibility: hidden;
  width: 200px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 0.5rem;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}
```

```html
<span class="tooltip-container">
  Username
  <span class="tooltip-icon">ⓘ</span>
  <span class="tooltip-text">Your captain name - pick something memorable!</span>
</span>
```

---

## 6. Create Captain Page Improvements

**File:** `pages/create-captain.jsx`

Make sure this page:
1. Has a clear headline: "Create Your Captain"
2. Explains the recovery key system upfront
3. Shows the recovery key prominently with copy button
4. Has a "Back to Demo" link

```jsx
// pages/create-captain.jsx
import { useState } from 'react';
import { copyToClipboard } from '../utils/helpers';

export default function CreateCaptain() {
  const [captainName, setCaptainName] = useState('');
  const [nation, setNation] = useState('usa');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = success
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Generate recovery key
    const newKey = generateRecoveryKey();
    setRecoveryKey(newKey);
    // In real implementation: createCaptain(captainName, nation, newKey)
    setStep(2);
  };
  
  const generateRecoveryKey = () => {
    // Generate a secure random key
    return 'bw_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  if (step === 2) {
    return (
      <div className="success-page">
        <h1>✅ Captain Created!</h1>
        
        <div className="recovery-key-card">
          <h2>🔑 Save Your Recovery Key</h2>
          <p>This is your <strong>only way to log back in</strong>. Screenshot it, copy it, or write it down now.</p>
          
          <div className="key-display">
            <code>{recoveryKey}</code>
            <button 
              onClick={() => copyToClipboard(recoveryKey)}
              className="copy-btn"
            >
              Copy to Clipboard
            </button>
          </div>
          
          <p className="warning">⚠️ If you lose this key, you cannot recover your account!</p>
        </div>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <button 
            className="primary"
            onClick={() => window.location = '/mission'}
          >
            Start Your First Mission
          </button>
          <button 
            className="secondary"
            onClick={() => window.location = '/demo'}
          >
            Try Demo Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="create-page">
      <h1>Create Your Captain</h1>
      <p className="subtitle">Join the hunt. Earn real cybersecurity skills.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Captain Name (Username)
            <span className="help">Choose a unique callsign</span>
          </label>
          <input 
            type="text" 
            value={captainName}
            onChange={(e) => setCaptainName(e.target.value)}
            placeholder="e.g., CyberPilot7, Dr0neMaster"
            required
          />
        </div>
        
        <div className="form-group">
          <label>
            Nation
            <span className="help">Pick your allegiance and cyber specialization</span>
          </label>
          <select value={nation} onChange={(e) => setNation(e.target.value)}>
            <option value="usa">🇺🇸 USA</option>
            <option value="uk">🇬🇧 United Kingdom</option>
            <option value="eu">🇪🇺 European Union</option>
            <option value="japan">🇯🇵 Japan</option>
            <option value="china">🇨🇳 China</option>
            <option value="russia">🇷🇺 Russia</option>
            {/* Add all 18 nations */}
          </select>
        </div>
        
        <p className="info-box">
          ⓘ You'll receive a recovery key after creation. 
          <strong>Save it securely</strong> - it's your only way to log back in!
        </p>
        
        <button type="submit" className="create-btn">
          Create Captain
        </button>
        
        <p className="back-link">
          <a href="/demo">← Try the demo first</a>
        </p>
      </form>
    </div>
  );
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `components/LoginForm.jsx` | Modify | Remove pre-visible error, make error conditional |
| `pages/index.jsx` | Modify | Reorder sections, move login below fold, add CTAs |
| `pages/demo.jsx` | Create | New demo endpoint with guest access |
| `pages/demo.html` | Create | Static HTML alternative for demo |
| `pages/create-captain.jsx` | Modify | Improve onboarding, explain recovery key |
| `styles/main.css` | Modify | Add styles for new CTAs and layout |

---

## Testing Checklist

- [ ] Login form no longer shows error on page load
- [ ] "Try Demo" button visible on homepage
- [ ] Demo page loads without requiring login
- [ ] Demo has working HUD and sample mission
- [ ] Demo prompts to create captain after completion
- [ ] Create captain page explains recovery key clearly
- [ ] Recovery key is auto-copied or easily copyable
- [ ] Login form uses clearer field names
- [ ] Tooltips appear on hover for unclear terms

---

## Quick Start

**To implement the most critical fixes in <30 minutes:**

1. **Fix the error message** (5 min)
   - Edit your LoginForm component
   - Make error state conditional

2. **Move login form** (10 min)
   - Edit your homepage
   - Move login section below features

3. **Add demo button** (10 min)
   - Add "Try Demo" button to homepage
   - Link to `/demo`

4. **Create demo page** (5 min for basic version)
   - Use the static HTML version above
   - Save as `pages/demo.html` or `pages/demo.jsx`

These four steps address the biggest trust and flow issues immediately.