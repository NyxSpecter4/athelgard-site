---
name: "bountywarz-homepage-fix"
title: "BountyWarz Homepage Fix - Quick Implementation"
type: "text/html"
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BountyWarz - London Drone Recon | Breach & Capture</title>
  <meta name="description" content="Fly recon drones over real London. Breach enemy targets, answer live cyber challenges, and earn certification skills from FAA Part 107 to Security+. Free to play, browser & mobile.">
  <style>
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --primary: #00ff88;
      --primary-dark: #00cc6a;
      --secondary: #0088ff;
      --accent: #ff4444;
      --bg-dark: #0a0a0f;
      --bg-darker: #050508;
      --bg-card: rgba(10, 10, 15, 0.8);
      --text: #e0e0e0;
      --text-muted: #888;
      --border: rgba(0, 255, 136, 0.2);
      --glow: rgba(0, 255, 136, 0.1);
    }
    
    body {
      background: var(--bg-dark);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 80px 20px 40px;
      position: relative;
      background: 
        radial-gradient(ellipse at 20% 50%, var(--glow) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 50%, var(--glow) 0%, transparent 50%);
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        linear-gradient(135deg, var(--bg-darker) 0%, var(--bg-dark) 100%),
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="g"><stop offset="0%" stop-color="%2300ff88" stop-opacity="0.03"/><stop offset="100%" stop-color="%2300ff88" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="300" r="200" fill="url(%23g)"/><circle cx="800" cy="700" r="300" fill="url(%23g)"/></svg>');
      pointer-events: none;
    }
    
    .hero-content {
      max-width: 1200px;
      width: 100%;
      position: relative;
      z-index: 2;
    }
    
    /* Logo and Tagline */
    .logo {
      font-size: 4rem;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 20px;
      text-shadow: 0 0 40px var(--primary);
      letter-spacing: 2px;
    }
    
    .tagline {
      font-size: 1.5rem;
      color: var(--text-muted);
      margin-bottom: 40px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    
    /* Mentor Section */
    .mentor-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      margin-bottom: 60px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .mentor-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      box-shadow: 0 0 30px var(--primary);
    }
    
    .mentor-info {
      text-align: left;
    }
    
    .mentor-name {
      font-size: 1.2rem;
      color: var(--primary);
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .mentor-title {
      color: var(--text-muted);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .mentor-message {
      margin-top: 20px;
      color: var(--text);
      font-size: 1.1rem;
      line-height: 1.7;
    }
    
    /* CTA Section - PRIMARY FIX */
    .cta-section {
      margin: 40px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
    
    .cta-group {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .cta-button {
      padding: 18px 40px;
      border-radius: 12px;
      font-size: 1.2rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 250px;
      text-align: center;
    }
    
    .cta-button.primary {
      background: var(--primary);
      color: #000;
      border: 2px solid var(--primary);
      box-shadow: 0 0 30px var(--glow);
    }
    
    .cta-button.primary:hover {
      background: var(--primary-dark);
      transform: translateY(-3px);
      box-shadow: 0 10px 40px var(--glow);
    }
    
    .cta-button.secondary {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
    }
    
    .cta-button.secondary:hover {
      background: var(--glow);
      transform: translateY(-3px);
    }
    
    .cta-button.tertiary {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
      border: 2px solid rgba(255, 255, 255, 0.1);
    }
    
    .cta-button.tertiary:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    
    .cta-description {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 8px;
    }
    
    /* How It Works */
    .how-it-works {
      max-width: 1000px;
      margin: 80px auto;
      padding: 0 20px;
    }
    
    .how-it-works h2 {
      text-align: center;
      font-size: 2rem;
      color: var(--primary);
      margin-bottom: 40px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    
    .step {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .step:hover {
      transform: translateY(-5px);
      border-color: var(--primary);
      box-shadow: 0 10px 30px var(--glow);
    }
    
    .step-number {
      font-size: 3rem;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 16px;
    }
    
    .step h3 {
      color: var(--text);
      margin-bottom: 12px;
      font-size: 1.3rem;
    }
    
    .step p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
    
    /* Features Grid */
    .features {
      max-width: 1200px;
      margin: 80px auto;
      padding: 0 20px;
    }
    
    .features h2 {
      text-align: center;
      font-size: 2rem;
      color: var(--primary);
      margin-bottom: 40px;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }
    
    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 30px;
      transition: all 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      border-color: var(--primary);
    }
    
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
      color: var(--primary);
    }
    
    .feature-card h3 {
      color: var(--text);
      margin-bottom: 12px;
    }
    
    .feature-card p {
      color: var(--text-muted);
    }
    
    /* Login Section - MOVED BELOW FOLD */
    .login-section {
      max-width: 500px;
      margin: 80px auto;
      padding: 40px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .login-section h2 {
      text-align: center;
      color: var(--primary);
      margin-bottom: 24px;
      font-size: 1.5rem;
    }
    
    .login-section p {
      text-align: center;
      color: var(--text-muted);
      margin-bottom: 30px;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      color: var(--text);
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .form-group .help {
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 400;
      cursor: help;
    }
    
    .form-group input {
      padding: 14px 16px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 10px var(--glow);
    }
    
    .form-group input::placeholder {
      color: var(--text-muted);
    }
    
    .error-message {
      color: var(--accent);
      font-size: 0.9rem;
      text-align: center;
      margin-top: -15px;
      margin-bottom: 15px;
      display: none; /* HIDDEN BY DEFAULT - FIX #1 */
    }
    
    .login-button {
      padding: 16px 24px;
      background: var(--primary);
      color: #000;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
    }
    
    .login-button:hover {
      background: var(--primary-dark);
    }
    
    .login-links {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      font-size: 0.9rem;
    }
    
    .login-links a {
      color: var(--primary);
      text-decoration: none;
    }
    
    .login-links a:hover {
      text-decoration: underline;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      margin-top: 80px;
    }
    
    .footer p {
      margin-bottom: 20px;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    
    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .footer-links a:hover {
      color: var(--primary);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .hero {
        padding: 60px 20px 40px;
      }
      
      .logo {
        font-size: 2.5rem;
      }
      
      .tagline {
        font-size: 1.1rem;
      }
      
      .mentor-section {
        flex-direction: column;
        text-align: center;
      }
      
      .cta-group {
        flex-direction: column;
        width: 100%;
      }
      
      .cta-button {
        width: 100%;
      }
      
      .steps {
        grid-template-columns: 1fr;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .login-section {
        margin: 40px 20px;
      }
      
      .login-links {
        flex-direction: column;
        gap: 10px;
      }
    }
    
    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    .hero-content > * {
      animation: fadeIn 0.6s ease forwards;
    }
    
    .hero-content > *:nth-child(1) { animation-delay: 0.1s; }
    .hero-content > *:nth-child(2) { animation-delay: 0.2s; }
    .hero-content > *:nth-child(3) { animation-delay: 0.3s; }
    .hero-content > *:nth-child(4) { animation-delay: 0.4s; }
    
    .cta-button.primary {
      animation: pulse 2s ease-in-out infinite;
    }
    
    /* Tooltip */
    .tooltip {
      position: relative;
    }
    
    .tooltip::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.9);
      color: var(--text);
      border-radius: 6px;
      font-size: 0.8rem;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 100;
    }
    
    .tooltip:hover::after {
      opacity: 1;
      visibility: visible;
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <!-- Logo -->
      <h1 class="logo">BOUNTYWARZ</h1>
      
      <!-- Tagline -->
      <p class="tagline">
        Fly recon drones over real London. Breach live targets. Earn certification skills.
      </p>
      
      <!-- Mentor Introduction -->
      <div class="mentor-section">
        <div class="mentor-avatar">🦉</div>
        <div class="mentor-info">
          <div class="mentor-name">ATHELGARD</div>
          <div class="mentor-title">AI Mentor · Academy Awake</div>
        </div>
      </div>
      <p class="mentor-message">
        Hi — I'm Athelgard, your mentor. In BountyWarz you fly recon drones and build genuine cybersecurity skills. 
        Ready to start?
      </p>
      
      <!-- PRIMARY FIX: Clear CTAs -->
      <div class="cta-section">
        <div class="cta-group">
          <button class="cta-button primary" onclick="window.location.href='/demo'">
            🎮 FLY YOUR FIRST MISSION
          </button>
          <button class="cta-button secondary" onclick="window.location.href='/how-to-play'">
            📖 HOW TO PLAY
          </button>
        </div>
        <div class="cta-group">
          <button class="cta-button secondary" onclick="window.location.href='/create-captain'">
            ⚔️ CREATE CAPTAIN
          </button>
          <button class="cta-button tertiary" onclick="window.location.href='#features'">
            ↓ LEARN MORE
          </button>
        </div>
        <p class="cta-description">
          Free to play · Browser-native · No install · No crypto
        </p>
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section class="how-it-works">
    <h2>How It Works</h2>
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <h3>Choose Nation</h3>
        <p>Pick from 18 nations, each with unique cyber specializations and lore.</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <h3>Hunt CVEs</h3>
        <p>Every bounty is a real vulnerability. Learn pentesting by playing.</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <h3>Capture Flags</h3>
        <p>3v3 CTF rounds. Plant your flag. Climb the leaderboard.</p>
      </div>
      <div class="step">
        <div class="step-number">4</div>
        <h3>Earn Cards</h3>
        <p>Seal skill-cards as proof of mastery. Real certification progress.</p>
      </div>
    </div>
  </section>

  <!-- Features -->
  <section class="features" id="features">
    <h2>Your Arsenal</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🔍</div>
        <h3>Reconnaissance</h3>
        <p>Nmap, Shodan, Google Dorking. Map every target before attacking.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📡</div>
        <h3>Port Scanning</h3>
        <p>SYN scans, stealth scans. Find every open door on the enemy hull.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💉</div>
        <h3>SQL Injection</h3>
        <p>Whisper the right query. Make databases bleed secrets.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎭</div>
        <h3>XSS Attacks</h3>
        <p>Turn screens against enemies. Perfect Trojan horse.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔐</div>
        <h3>Auth Bypass</h3>
        <p>Locks are suggestions. Walk through the front door.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⬆️</div>
        <h3>Privilege Escalation</h3>
        <p>Guest to admin. Climb the permissions ladder.</p>
      </div>
    </div>
  </section>

  <!-- Login Section - MOVED BELOW FOLD -->
  <section class="login-section">
    <h2>Returning Captain?</h2>
    <p>Enter your credentials to continue your hunt</p>
    
    <form class="login-form" id="loginForm">
      <div class="form-group">
        <label>
          Username
          <span class="help tooltip" data-tooltip="Your captain name - your unique identifier">ⓘ</span>
        </label>
        <input type="text" name="captainName" placeholder="e.g., CyberPilot7" required>
      </div>
      
      <div class="form-group">
        <label>
          Password
          <span class="help tooltip" data-tooltip="Your recovery key - save this! No email recovery">ⓘ</span>
        </label>
        <input type="password" name="recoveryKey" placeholder="••••••••••••" required>
      </div>
      
      <!-- ERROR MESSAGE - HIDDEN BY DEFAULT -->
      <p class="error-message" id="loginError">
        Invalid username or password!
      </p>
      
      <button type="submit" class="login-button">
        Login
      </button>
      
      <div class="login-links">
        <a href="/create-captain">Create new captain</a>
        <a href="/forgot-key">Forgot recovery key?</a>
      </div>
    </form>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <p>© 2026 BountyWarz. All rights reserved.</p>
    <div class="footer-links">
      <a href="/how-to-play">How to Play</a>
      <a href="/nations">Nations</a>
      <a href="/arsenal">Arsenal</a>
      <a href="/leaderboard">Leaderboard</a>
      <a href="/demo">Demo</a>
    </div>
  </footer>

  <script>
    // FIX #1: Hide error message by default
    document.addEventListener('DOMContentLoaded', function() {
      const loginForm = document.getElementById('loginForm');
      const loginError = document.getElementById('loginError');
      
      // Error message is hidden by CSS, but ensure it stays hidden
      loginError.style.display = 'none';
      
      // Show error only on failed login
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Simulate login attempt
        const captainName = loginForm.elements.captainName.value;
        const recoveryKey = loginForm.elements.recoveryKey.value;
        
        // In real implementation, this would be an API call
        // For demo purposes, we'll just validate non-empty
        if (!captainName || !recoveryKey) {
          loginError.style.display = 'block';
          return;
        }
        
        // Simulate successful login
        alert('Login successful! Redirecting to dashboard...');
        window.location.href = '/dashboard';
      });
      
      // Hide error when user starts typing
      loginForm.elements.captainName.addEventListener('input', () => {
        loginError.style.display = 'none';
      });
      
      loginForm.elements.recoveryKey.addEventListener('input', () => {
        loginError.style.display = 'none';
      });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  </script>
</body>
</html>
