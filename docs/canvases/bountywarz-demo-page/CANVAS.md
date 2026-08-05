---
name: "bountywarz-demo-page"
title: "BountyWarz Demo Page - Ready to Use"
type: "text/html"
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BountyWarz Demo - Try Without Account</title>
  <meta name="description" content="Try BountyWarz demo mission without creating an account. Fly recon drones over London and breach targets.">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: #0a0a0f;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* HUD Styles */
    .hud {
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.85);
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 255, 136, 0.2);
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
    
    .hud-stats {
      display: flex;
      gap: 24px;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
      font-size: 13px;
      flex-wrap: wrap;
    }
    
    .hud-stats span {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .hud-stats .label {
      color: #888;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .hud-stats .value {
      color: #00ff88;
      font-weight: 600;
    }
    
    .hud-tools {
      display: flex;
      gap: 12px;
    }
    
    .hud-tools button {
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.5);
      color: #00ff88;
      border: 1px solid #00ff88;
      border-radius: 6px;
      font-family: 'SF Mono', monospace;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .hud-tools button:hover {
      background: #00ff88;
      color: #000;
      box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
    }
    
    .hud-tools button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Main Content */
    .demo-container {
      max-width: 1400px;
      margin: 100px auto 40px;
      padding: 0 20px;
    }
    
    .mission-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .mission-header h1 {
      font-size: 2.5rem;
      color: #fff;
      margin-bottom: 12px;
      font-weight: 700;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
    
    .mission-header p {
      font-size: 1.1rem;
      color: #888;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    /* Mission Map */
    .mission-map {
      position: relative;
      width: 100%;
      height: 500px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 30px;
      background-image: 
        radial-gradient(circle at 20% 30%, rgba(0, 255, 136, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(0, 180, 255, 0.05) 0%, transparent 50%);
    }
    
    /* Drone */
    .drone {
      position: absolute;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #00ffff, #0088ff);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 
        0 0 20px rgba(0, 255, 255, 0.5),
        inset 0 0 10px rgba(255, 255, 255, 0.2);
      z-index: 10;
      transition: all 0.3s ease;
    }
    
    .drone::before {
      content: '';
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 8px solid #00ffff;
    }
    
    /* Targets */
    .target-ring {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 3px solid #00ff88;
      border-radius: 50%;
      animation: pulse-glow 2s ease-in-out infinite;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .target-ring:hover {
      border-color: #00ffaa;
      box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
    }
    
    .target-ring::before {
      content: '⚡';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #00ff88;
      font-size: 24px;
      text-shadow: 0 0 10px rgba(0, 255, 136, 0.8);
    }
    
    .target-ring.completed {
      border-color: #00ff88;
      animation: none;
      background: rgba(0, 255, 136, 0.1);
    }
    
    .target-ring.completed::before {
      content: '✓';
      color: #00ff88;
      font-size: 32px;
    }
    
    /* Radar overlay */
    .radar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-conic-gradient(
          from 0deg,
          transparent 0deg,
          transparent 5deg,
          rgba(0, 255, 136, 0.03) 5deg,
          rgba(0, 255, 136, 0.03) 10deg
        );
      animation: radar-sweep 4s linear infinite;
      opacity: 0.3;
      pointer-events: none;
    }
    
    @keyframes radar-sweep {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 
          0 0 0 0 rgba(0, 255, 136, 0.4),
          0 0 0 10px rgba(0, 255, 136, 0),
          0 0 0 20px rgba(0, 255, 136, 0);
      }
      50% {
        box-shadow: 
          0 0 0 10px rgba(0, 255, 136, 0),
          0 0 0 20px rgba(0, 255, 136, 0),
          0 0 0 30px rgba(0, 255, 136, 0);
      }
    }
    
    /* Instructions */
    .instructions {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(0, 255, 136, 0.2);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
    }
    
    .instructions h3 {
      color: #00ff88;
      margin-bottom: 16px;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .instructions ol {
      margin-left: 20px;
      line-height: 1.8;
      color: #ccc;
    }
    
    .instructions li {
      margin-bottom: 8px;
    }
    
    /* Hack Button */
    .hack-button {
      display: block;
      width: 100%;
      max-width: 400px;
      margin: 0 auto 30px;
      padding: 18px 32px;
      background: linear-gradient(135deg, #ff4444, #cc0000);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.3rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 1px;
      box-shadow: 
        0 4px 20px rgba(255, 68, 68, 0.3),
        inset 0 -2px 10px rgba(0, 0, 0, 0.3);
    }
    
    .hack-button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 6px 25px rgba(255, 68, 68, 0.5),
        inset 0 -2px 10px rgba(0, 0, 0, 0.3);
    }
    
    .hack-button:active {
      transform: translateY(0);
    }
    
    .hack-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Modals */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 20px;
    }
    
    .modal {
      background: rgba(10, 10, 15, 0.98);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
      animation: modal-appear 0.3s ease;
    }
    
    @keyframes modal-appear {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    
    .modal h2, .modal h3 {
      color: #00ff88;
      margin-bottom: 20px;
    }
    
    .modal h2 {
      font-size: 2rem;
    }
    
    .modal p {
      color: #ccc;
      line-height: 1.7;
      margin-bottom: 24px;
    }
    
    .modal-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .modal-buttons button {
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .modal-buttons .primary {
      background: #00ff88;
      color: #000;
      border: none;
    }
    
    .modal-buttons .primary:hover {
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.4);
      transform: translateY(-2px);
    }
    
    .modal-buttons .secondary {
      background: transparent;
      color: #888;
      border: 1px solid #444;
    }
    
    .modal-buttons .secondary:hover {
      border-color: #00ff88;
      color: #00ff88;
    }
    
    /* Quiz Options */
    .quiz-options {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin: 20px 0;
    }
    
    @media (min-width: 480px) {
      .quiz-options {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .quiz-options button {
      padding: 16px 24px;
      background: rgba(0, 0, 0, 0.3);
      color: #e0e0e0;
      border: 1px solid #444;
      border-radius: 10px;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }
    
    .quiz-options button:hover {
      background: rgba(0, 255, 136, 0.1);
      border-color: #00ff88;
    }
    
    .quiz-options button.correct {
      background: rgba(0, 255, 136, 0.2);
      border-color: #00ff88;
      color: #00ff88;
    }
    
    .quiz-options button.incorrect {
      background: rgba(255, 68, 68, 0.2);
      border-color: #ff4444;
      color: #ff4444;
    }
    
    /* Score display */
    .score-display {
      background: rgba(0, 0, 0, 0.5);
      padding: 12px 24px;
      border-radius: 10px;
      text-align: center;
      margin: 20px 0;
    }
    
    .score-display .label {
      color: #888;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .score-display .value {
      color: #00ff88;
      font-size: 2rem;
      font-weight: 700;
      font-family: 'SF Mono', monospace;
    }
    
    /* Progress bar */
    .progress-container {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      height: 8px;
      margin: 20px 0;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #00ff88, #0088ff);
      border-radius: 10px;
      transition: width 0.3s ease;
      width: 0%;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .hud {
        flex-direction: column;
        gap: 12px;
        padding: 12px;
      }
      
      .hud-stats {
        gap: 12px;
      }
      
      .mission-header h1 {
        font-size: 1.8rem;
      }
      
      .mission-map {
        height: 350px;
      }
      
      .modal {
        padding: 24px;
        margin: 10px;
      }
    }
    
    /* Animations for drone movement */
    @keyframes drone-move {
      0% { top: 50%; left: 50%; }
      25% { top: 40%; left: 60%; }
      50% { top: 60%; left: 40%; }
      75% { top: 45%; left: 55%; }
      100% { top: 50%; left: 50%; }
    }
    
    .drone.moving {
      animation: drone-move 8s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <!-- HUD -->
  <div class="hud">
    <div class="hud-stats">
      <span><span class="label">Altitude</span><span class="value" id="altitude">100m</span></span>
      <span><span class="label">Speed</span><span class="value" id="speed">30 km/h</span></span>
      <span><span class="label">Heading</span><span class="value" id="heading">N</span></span>
      <span><span class="label">Battery</span><span class="value" id="battery">85%</span></span>
      <span><span class="label">Score</span><span class="value" id="score">0</span></span>
      <span><span class="label">Time</span><span class="value" id="timer">5:00</span></span>
      <span><span class="label">Credits</span><span class="value" id="credits">0</span></span>
    </div>
    <div class="hud-tools">
      <button onclick="useTool('sniffer')" id="tool-sniffer">Data Sniffer</button>
      <button onclick="useTool('override')" id="tool-override">Override</button>
      <button onclick="useTool('emp')" id="tool-emp" disabled>EMP Pulse</button>
    </div>
  </div>

  <!-- Main Demo Container -->
  <div class="demo-container">
    <!-- Mission Header -->
    <div class="mission-header">
      <h1>SF Drone Recon - Demo</h1>
      <p>Fly to the target ring, hold hack to breach it, and answer the quiz to earn a sample skill card.</p>
    </div>

    <!-- Mission Map -->
    <div class="mission-map">
      <div class="radar-overlay"></div>
      <div class="target-ring" id="target-1" onclick="flyToTarget(1)"></div>
      <div class="drone" id="drone" style="left: 50%; top: 50%;"></div>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <h3>🎯 Mission Instructions</h3>
      <ol>
        <li><strong>Fly to the glowing target ring</strong> - Click on the map to move your drone</li>
        <li><strong>Hold hack to breach it</strong> - Click the HOLD TO HACK button</li>
        <li><strong>Answer the quiz</strong> - Test your cybersecurity knowledge</li>
        <li><strong>Earn a skill card</strong> - Complete the demo to unlock a sample</li>
      </ol>
    </div>

    <!-- Hack Button -->
    <button class="hack-button" id="hack-button" onclick="initiateHack()" disabled>
      HOLD TO HACK
    </button>

    <!-- Progress -->
    <div class="progress-container">
      <div class="progress-bar" id="progress-bar" style="width: 0%;"></div>
    </div>
  </div>

  <!-- Quiz Modal -->
  <div class="modal-overlay" id="quiz-modal" style="display: none;">
    <div class="modal">
      <h3>🔐 Security Quiz</h3>
      <p id="quiz-question">What is CVE-2014-0160 commonly known as?</p>
      <div class="quiz-options" id="quiz-options">
        <!-- Options will be populated by JavaScript -->
      </div>
      <div class="score-display">
        <div class="label">Current Score</div>
        <div class="value" id="quiz-score">0</div>
      </div>
    </div>
  </div>

  <!-- Completion Modal -->
  <div class="modal-overlay" id="completion-modal" style="display: none;">
    <div class="modal">
      <h2>🎉 Demo Complete!</h2>
      <p>You've successfully completed the demo mission and earned a sample CompTIA Security+ skill card!</p>
      <div class="score-display">
        <div class="label">Final Score</div>
        <div class="value" id="final-score">0</div>
      </div>
      <div class="modal-buttons">
        <button class="primary" onclick="window.location.href='/create-captain'">
          Create Captain to Save Progress
        </button>
        <button class="secondary" onclick="restartDemo()">
          Try Again
        </button>
      </div>
    </div>
  </div>

  <script>
    // Game State
    let score = 0;
    let timeLeft = 300; // 5 minutes
    let currentTarget = null;
    let hacking = false;
    let hackProgress = 0;
    let quizAnswered = false;
    let dronePosition = { x: 50, y: 50 };
    let targetPosition = { x: 50, y: 30 };
    
    // Target data
    const targets = [
      {
        id: 1,
        x: 50,
        y: 30,
        name: 'Heartbleed Colossus',
        cve: 'CVE-2014-0160',
        question: 'What is CVE-2014-0160 commonly known as?',
        options: [
          { text: 'Heartbleed', correct: true, explanation: 'Correct! Heartbleed is a serious vulnerability in OpenSSL.' },
          { text: 'Log4Shell', correct: false, explanation: 'Log4Shell is CVE-2021-44228, a different vulnerability.' },
          { text: 'EternalBlue', correct: false, explanation: 'EternalBlue is CVE-2017-0144, used in WannaCry.' },
          { text: 'Shellshock', correct: false, explanation: 'Shellshock is CVE-2014-6271, a Bash vulnerability.' }
        ],
        points: 1000,
        completed: false
      }
    ];
    
    // DOM Elements
    const droneEl = document.getElementById('drone');
    const targetEl = document.getElementById('target-1');
    const hackButton = document.getElementById('hack-button');
    const progressBar = document.getElementById('progress-bar');
    const timerEl = document.getElementById('timer');
    const scoreEl = document.getElementById('score');
    const quizModal = document.getElementById('quiz-modal');
    const completionModal = document.getElementById('completion-modal');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizScoreEl = document.getElementById('quiz-score');
    const finalScoreEl = document.getElementById('final-score');
    
    // Initialize
    function init() {
      updateScore();
      startTimer();
      updateDronePosition();
      
      // Randomize target position slightly
      targetPosition = {
        x: 40 + Math.random() * 20,
        y: 20 + Math.random() * 20
      };
      targetEl.style.left = targetPosition.x + '%';
      targetEl.style.top = targetPosition.y + '%';
    }
    
    // Timer
    function startTimer() {
      const timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timerEl.textContent = minutes + ':' + seconds;
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          endDemo();
        }
      }, 1000);
    }
    
    // Update score display
    function updateScore() {
      scoreEl.textContent = score;
      quizScoreEl.textContent = score;
      finalScoreEl.textContent = score;
    }
    
    // Fly to target
    function flyToTarget(targetId) {
      const target = targets.find(t => t.id === targetId);
      if (!target) return;
      
      currentTarget = target;
      
      // Animate drone to target
      dronePosition = { x: target.x, y: target.y };
      updateDronePosition();
      
      // Enable hack button when close enough
      const distance = Math.sqrt(
        Math.pow(dronePosition.x - targetPosition.x, 2) + 
        Math.pow(dronePosition.y - targetPosition.y, 2)
      );
      
      if (distance < 15) {
        hackButton.disabled = false;
        hackButton.textContent = 'HOLD TO HACK';
        
        // Add visual feedback
        targetEl.classList.add('active');
      }
    }
    
    // Update drone position
    function updateDronePosition() {
      droneEl.style.left = dronePosition.x + '%';
      droneEl.style.top = dronePosition.y + '%';
    }
    
    // Initiate hack
    function initiateHack() {
      if (!currentTarget) return;
      
      hacking = true;
      hackProgress = 0;
      hackButton.textContent = 'HACKING...';
      hackButton.disabled = true;
      
      // Start hacking animation
      const hackInterval = setInterval(() => {
        hackProgress += 5;
        progressBar.style.width = hackProgress + '%';
        
        if (hackProgress >= 100) {
          clearInterval(hackInterval);
          hacking = false;
          showQuiz(currentTarget);
        }
      }, 100);
      
      // Allow canceling hack
      hackButton.onclick = function() {
        if (hacking) {
          hacking = false;
          clearInterval(hackInterval);
          hackButton.textContent = 'HOLD TO HACK';
          hackButton.disabled = false;
          progressBar.style.width = '0%';
        }
      };
    }
    
    // Show quiz
    function showQuiz(target) {
      quizModal.style.display = 'flex';
      quizQuestion.textContent = target.question;
      
      // Clear previous options
      quizOptions.innerHTML = '';
      
      // Shuffle options
      const shuffledOptions = [...target.options].sort(() => Math.random() - 0.5);
      
      // Create option buttons
      shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.onclick = () => selectAnswer(option, target);
        quizOptions.appendChild(button);
      });
    }
    
    // Select quiz answer
    function selectAnswer(option, target) {
      const buttons = quizOptions.querySelectorAll('button');
      
      // Disable all buttons
      buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === option.text) {
          btn.classList.add(option.correct ? 'correct' : 'incorrect');
        }
      });
      
      // Update score
      if (option.correct) {
        score += target.points;
        updateScore();
        target.completed = true;
        targetEl.classList.add('completed');
        
        // Show feedback
        setTimeout(() => {
          alert(option.explanation);
          quizModal.style.display = 'none';
          
          // Check if all targets completed
          if (targets.every(t => t.completed)) {
            endDemo();
          } else {
            // Reset for next target
            hackButton.textContent = 'HOLD TO HACK';
            hackButton.disabled = false;
            progressBar.style.width = '0%';
          }
        }, 1000);
      } else {
        setTimeout(() => {
          alert(option.explanation);
          quizModal.style.display = 'none';
          hackButton.textContent = 'HOLD TO HACK';
          hackButton.disabled = false;
          progressBar.style.width = '0%';
        }, 1000);
      }
    }
    
    // Use tool
    function useTool(toolName) {
      const toolButtons = document.querySelectorAll('.hud-tools button');
      toolButtons.forEach(btn => {
        if (btn.id === `tool-${toolName}`) {
          btn.style.background = '#00ff88';
          btn.style.color = '#000';
          setTimeout(() => {
            btn.style.background = '';
            btn.style.color = '';
          }, 200);
        }
      });
      
      // Visual feedback
      const messages = {
        sniffer: 'Scanning for vulnerabilities...',
        override: 'Attempting system override...',
        emp: 'EMP Pulse ready! (Unlock at level 5)'
      };
      
      // Show temporary message
      const message = document.createElement('div');
      message.textContent = messages[toolName] || 'Tool activated';
      message.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: #00ff88;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: monospace;
        z-index: 1001;
        animation: fadeOut 2s ease forwards;
      `;
      document.body.appendChild(message);
      
      setTimeout(() => message.remove(), 2000);
    }
    
    // End demo
    function endDemo() {
      completionModal.style.display = 'flex';
      droneEl.classList.remove('moving');
    }
    
    // Restart demo
    function restartDemo() {
      completionModal.style.display = 'none';
      quizModal.style.display = 'none';
      
      // Reset state
      score = 0;
      timeLeft = 300;
      currentTarget = null;
      hacking = false;
      quizAnswered = false;
      
      // Reset UI
      updateScore();
      timerEl.textContent = '5:00';
      hackButton.textContent = 'HOLD TO HACK';
      hackButton.disabled = false;
      progressBar.style.width = '0%';
      
      // Reset targets
      targets.forEach(t => t.completed = false);
      targetEl.classList.remove('completed', 'active');
      
      // Reset drone
      dronePosition = { x: 50, y: 50 };
      updateDronePosition();
      
      // Restart timer
      startTimer();
      
      // Randomize target again
      targetPosition = {
        x: 40 + Math.random() * 20,
        y: 20 + Math.random() * 20
      };
      targetEl.style.left = targetPosition.x + '%';
      targetEl.style.top = targetPosition.y + '%';
    }
    
    // Make drone move automatically for visual interest
    setInterval(() => {
      if (!hacking && !currentTarget) {
        dronePosition.x += (Math.random() - 0.5) * 0.5;
        dronePosition.y += (Math.random() - 0.5) * 0.5;
        
        // Keep drone within bounds
        dronePosition.x = Math.max(10, Math.min(90, dronePosition.x));
        dronePosition.y = Math.max(10, Math.min(90, dronePosition.y));
        
        updateDronePosition();
      }
    }, 100);
    
    // Add keyboard controls
    document.addEventListener('keydown', (e) => {
      const moveAmount = 2;
      
      switch(e.key) {
        case 'ArrowUp':
          dronePosition.y -= moveAmount;
          break;
        case 'ArrowDown':
          dronePosition.y += moveAmount;
          break;
        case 'ArrowLeft':
          dronePosition.x -= moveAmount;
          break;
        case 'ArrowRight':
          dronePosition.x += moveAmount;
          break;
      }
      
      dronePosition.x = Math.max(5, Math.min(95, dronePosition.x));
      dronePosition.y = Math.max(5, Math.min(95, dronePosition.y));
      updateDronePosition();
      
      // Check proximity to target
      const distance = Math.sqrt(
        Math.pow(dronePosition.x - targetPosition.x, 2) + 
        Math.pow(dronePosition.y - targetPosition.y, 2)
      );
      
      if (distance < 15) {
        hackButton.disabled = false;
        targetEl.classList.add('active');
      } else {
        targetEl.classList.remove('active');
      }
    });
    
    // Add CSS for fade out animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeOut {
        0% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    
    // Initialize the demo
    init();
  </script>
</body>
</html>
