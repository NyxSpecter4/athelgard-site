---
name: "bountywarz-refined-homepage"
title: "BountyWarz Refined Homepage - Synthesis Implementation"
type: "text/html"
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BountyWarz - Fly Recon Drones Over London</title>
  <meta name="description" content="Fly recon drones over real London. Breach live targets. Earn certification skills. Free browser-native cyber game.">
  <style>
    :root {
      --primary: #00ff88;
      --primary-dark: #00cc6a;
      --primary-glow: rgba(0, 255, 136, 0.3);
      --secondary: #0088ff;
      --accent: #ff4444;
      --bg-dark: #0a0a0f;
      --bg-darker: #050508;
      --bg-card: rgba(10, 10, 15, 0.85);
      --text: #f0f0f0;
      --text-muted: #888;
      --border: rgba(0, 255, 136, 0.15);
      --border-glow: rgba(0, 255, 136, 0.3);
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background: var(--bg-dark);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
    }
    
    /* ===== HERO SECTION - PRIMARY FIX ===== */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 20px;
      position: relative;
      background: 
        radial-gradient(ellipse 80% 50% at 50% 40%, var(--primary-glow) 0%, transparent 60%),
        linear-gradient(135deg, var(--bg-darker) 0%, var(--bg-dark) 100%);
    }
    
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><radialGradient id="g1" cx="50%" cy="50%" r="50%" fx="20%" fy="30%"><stop offset="0%" stop-color="%2300ff88" stop-opacity="0.03"/><stop offset="100%" stop-color="%2300ff88" stop-opacity="0"/></radialGradient><radialGradient id="g2" cx="50%" cy="50%" r="50%" fx="80%" fy="70%"><stop offset="0%" stop-color="%230088ff" stop-opacity="0.03"/><stop offset="100%" stop-color="%230088ff" stop-opacity="0"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g1)"/><rect width="100%" height="100%" fill="url(%23g2)"/></svg>') center/cover;
      pointer-events: none;
    }
    
    .hero-content {
      max-width: 900px;
      position: relative;
      z-index: 2;
    }
    
    /* Logo */
    .logo {
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
      letter-spacing: 2px;
      text-shadow: 0 0 40px var(--primary);
    }
    
    /* Tagline */
    .tagline {
      font-size: clamp(1.1rem, 2.5vw, 1.5rem);
      color: var(--text-muted);
      margin-bottom: 40px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
    }
    
    /* PRIMARY CTAS - THE CORE FIX */
    .cta-primary-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    @media (min-width: 600px) {
      .cta-primary-group {
        flex-direction: row;
        justify-content: center;
      }
    }
    
    .cta-button {
      padding: 18px 36px;
      border-radius: 12px;
      font-size: clamp(1rem, 2.5vw, 1.2rem);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-width: 220px;
      text-decoration: none;
    }
    
    .cta-button.primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #000;
      box-shadow: 
        0 4px 20px var(--primary-glow),
        inset 0 -2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .cta-button.primary:hover {
      transform: translateY(-3px);
      box-shadow: 
        0 8px 30px var(--primary-glow),
        inset 0 -2px 10px rgba(0, 0, 0, 0.2);
    }
    
    .cta-button.primary:active {
      transform: translateY(-1px);
    }
    
    .cta-button.secondary {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
    }
    
    .cta-button.secondary:hover {
      background: var(--primary-glow);
      transform: translateY(-3px);
    }
    
    .cta-button .icon {
      font-size: 1.3em;
    }
    
    /* Subtitle */
    .hero-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-top: 16px;
      letter-spacing: 0.5px;
    }
    
    .hero-subtitle span {
      color: var(--primary);
      font-weight: 600;
    }
    
    /* ===== SECONDARY EXPLANATION ===== */
    .secondary-explanation {
      max-width: 700px;
      margin: 60px auto 0;
      padding: 0 20px;
      text-align: center;
    }
    
    .secondary-explanation h2 {
      font-size: 1.1rem;
      color: var(--text-muted);
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .explanation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 24px;
    }
    
    .explanation-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      text-align: left;
    }
    
    .explanation-card .icon {
      color: var(--primary);
      font-size: 1.5rem;
      margin-bottom: 12px;
    }
    
    .explanation-card h3 {
      color: var(--text);
      font-size: 1rem;
      margin-bottom: 8px;
    }
    
    .explanation-card p {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }
    
    /* ===== LOGIN SECTION - MOVED BELOW FOLD ===== */
    .login-section {
      max-width: 480px;
      margin: 80px auto 0;
      padding: 40px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }
    
    .login-section h2 {
      text-align: center;
      color: var(--text);
      margin-bottom: 8px;
      font-size: 1.3rem;
    }
    
    .login-section p {
      text-align: center;
      color: var(--text-muted);
      margin-bottom: 30px;
      font-size: 0.95rem;
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
      gap: 6px;
    }
    
    .form-group .help-icon {
      color: var(--text-muted);
      font-size: 0.8rem;
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
      box-shadow: 0 0 15px var(--primary-glow);
    }
    
    .form-group input::placeholder {
      color: var(--text-muted);
    }
    
    /* ERROR MESSAGE - HIDDEN BY DEFAULT */
    .error-message {
      color: var(--accent);
      font-size: 0.9rem;
      text-align: center;
      margin: -15px 0 15px;
      min-height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .error-message.hidden {
      opacity: 0;
      visibility: hidden;
    }
    
    .error-message::before {
      content: '⚠';
    }
    
    .login-button {
      padding: 16px 24px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #000;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .login-button:hover {
      opacity: 0.9;
    }
    
    .login-links {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      font-size: 0.9rem;
    }
    
    .login-links a {
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .login-links a:hover {
      color: var(--secondary);
    }
    
    /* ===== FOOTER ===== */
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
    
    /* ===== RESPONSIVE ===== */
    @media (max-width: 768px) {
      .hero {
        padding: 40px 20px;
      }
      
      .tagline {
        font-size: 1rem;
      }
      
      .cta-primary-group {
        flex-direction: column;
      }
      
      .cta-button {
        width: 100%;
      }
      
      .explanation-grid {
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
    
    /* ===== ANIMATIONS ===== */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
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
    
    /* ===== TOOLTIPS ===== */
    .tooltip-container {
      position: relative;
      display: inline-block;
    }
    
    .tooltip-text {
      visibility: hidden;
      width: 220px;
      background-color: rgba(0, 0, 0, 0.95);
      color: var(--text);
      text-align: center;
      border-radius: 8px;
      padding: 10px;
      position: absolute;
      z-index: 1000;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.3s, visibility 0.3s;
      font-size: 0.85rem;
      line-height: 1.5;
    }
    
    .tooltip-container:hover .tooltip-text {
      visibility: visible;
      opacity: 1;
    }
  </style>
</head>
<body>
  <!-- HERO SECTION -->
  <section class="hero">
    <div class="hero-content">
      <!-- Logo -->
      <h1 class="logo">BOUNTYWARZ</h1>
      
      <!-- Tagline -->
      <p class="tagline">
        Fly recon drones over real London. Breach live targets. Earn certification skills.
      </p>
      
      <!-- PRIMARY CTAS - THE CORE FIX -->
      <div class="cta-primary-group">
        <a href="/demo" class="cta-button primary">
          <span class="icon">🎮</span>
          PLAY FIRST MISSION
        </a>
        <a href="/create-captain" class="cta-button secondary">
          <span class="icon">👤</span>
          CREATE CAPTAIN
        </a>
      </div>
      
      <!-- Subtitle -->
      <p class="hero-subtitle">
        <span>Free</span> · <span>Browser-native</span> · <span>No install</span> · <span>No crypto</span>
      </p>
    </div>
  </section>

  <!-- SECONDARY EXPLANATION -->
  <section class="secondary-explanation">
    <h2>Choose Your Path</h2>
    <p>Start playing immediately or create a captain to save your progress</p>
    
    <div class="explanation-grid">
      <div class="explanation-card">
        <div class="icon">🎮</div>
        <h3>Guest Mode</h3>
        <p>Instant trial, no saved progress. Perfect for trying the game.</p>
      </div>
      <div class="explanation-card">
        <div class="icon">👤</div>
        <h3>Captain Mode</h3>
        <p>Keeps nation, cards, and progression. Your permanent identity.</p>
      </div>
      <div class="explanation-card">
        <div class="icon">🔑</div>
        <h3>Captain Key</h3>
        <p>Your password to return on any device. Save it somewhere safe.</p>
      </div>
    </div>
  </section>

  <!-- LOGIN SECTION - MOVED BELOW FOLD -->
  <section class="login-section">
    <h2>Return to Your Captain</h2>
    <p>Continue your hunt with your existing identity</p>
    
    <form class="login-form" id="loginForm">
      <div class="form-group">
        <label for="username">
          Username
          <span class="help-icon tooltip-container">
            ⓘ
            <span class="tooltip-text">Your captain name - your unique identifier in the game</span>
          </span>
        </label>
        <input type="text" id="username" name="username" placeholder="e.g., CyberPilot7" required>
      </div>
      
      <div class="form-group">
        <label for="password">
          Password
          <span class="help-icon tooltip-container">
            ⓘ
            <span class="tooltip-text">Your captain key - save this! It's your only way to log back in</span>
          </span>
        </label>
        <input type="password" id="password" name="password" placeholder="••••••••••••" required>
      </div>
      
      <!-- ERROR MESSAGE - HIDDEN BY DEFAULT -->
      <p class="error-message hidden" id="loginError">
        Invalid username or password
      </p>
      
      <button type="submit" class="login-button">
        LOGIN
      </button>
      
      <div class="login-links">
        <a href="/create-captain">Create new captain</a>
        <a href="/forgot-key">Forgot captain key?</a>
      </div>
    </form>
  </section>

  <!-- FOOTER -->
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
      
      // Ensure error is hidden
      loginError.classList.add('hidden');
      
      // Show error only on failed login
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = loginForm.elements.username.value;
        const password = loginForm.elements.password.value;
        
        // In real implementation, this would be an API call
        // For now, simulate validation
        if (!username || !password) {
          loginError.classList.remove('hidden');
          return;
        }
        
        // Simulate successful login
        alert('Login successful! Redirecting...');
        window.location.href = '/dashboard';
      });
      
      // Hide error when user starts typing
      loginForm.elements.username.addEventListener('input', () => {
        loginError.classList.add('hidden');
      });
      
      loginForm.elements.password.addEventListener('input', () => {
        loginError.classList.add('hidden');
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
