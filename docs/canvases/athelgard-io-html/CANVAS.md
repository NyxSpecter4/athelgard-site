---
name: "athelgard-io-html"
title: "Athelgard.io HTML Implementation - Ready to Deploy"
type: "text/html"
---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athelgard - The living guide of BountyWarz</title>
    <meta name="description" content="Athelgard is the living guide of BountyWarz - and your coding agent for building the world she inhabits. Build with her. Train with her. Call her.">
    <style>
        /* ===== CSS Variables ===== */
        :root {
            --primary: #4F46E5;
            --primary-hover: #4338CA;
            --secondary: #3B82F6;
            --accent: #F59E0B;
            --bg-dark: #0F172A;
            --bg-slate: #1E293B;
            --bg-surface: #334155;
            --text: #F8FAFC;
            --text-muted: #94A3B8;
            --text-secondary: #CBD5E1;
            --border: #334155;
            --shadow: rgba(0, 0, 0, 0.3);
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }

        /* ===== Reset & Base ===== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg-dark);
            color: var(--text);
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* ===== Typography ===== */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            line-height: 1.2;
        }

        h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
        h2 { font-size: clamp(1.875rem, 4vw, 2.5rem); }
        h3 { font-size: clamp(1.5rem, 3vw, 1.875rem); }
        h4 { font-size: 1.25rem; }

        p {
            font-size: 1.125rem;
            color: var(--text-secondary);
            max-width: 65ch;
        }

        .text-muted {
            color: var(--text-muted);
        }

        /* ===== Layout ===== */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        section {
            padding: 5rem 0;
        }

        @media (max-width: 768px) {
            section {
                padding: 3rem 0;
            }
        }

        /* ===== Buttons ===== */
        .btn {
            display: inline-block;
            padding: 0.875rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            border: none;
        }

        .btn-primary {
            background-color: var(--primary);
            color: var(--text);
        }

        .btn-primary:hover {
            background-color: var(--primary-hover);
            transform: translateY(-2px);
        }

        .btn-secondary {
            background-color: transparent;
            color: var(--text);
            border: 2px solid var(--primary);
        }

        .btn-secondary:hover {
            background-color: var(--primary);
        }

        .btn-tertiary {
            background-color: transparent;
            color: var(--accent);
            border: none;
        }

        .btn-tertiary:hover {
            color: #D97706;
            text-decoration: underline;
        }

        .btn-group {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
            .btn-group {
                flex-direction: column;
            }
            .btn {
                width: 100%;
                text-align: center;
            }
        }

        /* ===== Navigation ===== */
        .navbar {
            position: sticky;
            top: 0;
            background-color: var(--bg-dark)/80;
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 1rem 0;
            border-bottom: 1px solid var(--border);
        }

        .navbar .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text);
            text-decoration: none;
            letter-spacing: -0.05em;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }

        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
        }

        .nav-links a:hover {
            color: var(--text);
        }

        @media (max-width: 768px) {
            .nav-links {
                display: none;
            }
        }

        /* ===== Hero Section ===== */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            position: relative;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(ellipse at 20% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }

        .hero .container {
            position: relative;
            z-index: 1;
        }

        .hero-content {
            max-width: 800px;
        }

        .hero h1 {
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, var(--text), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero h2 {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            font-weight: 500;
        }

        .hero p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
        }

        .hero-tagline {
            margin-top: 2rem;
            font-size: 1.125rem;
            color: var(--text-muted);
        }

        /* ===== Character Illustration ===== */
        .character-container {
            position: absolute;
            right: 5%;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.9;
        }

        .character-container img {
            max-width: 400px;
            height: auto;
        }

        @media (max-width: 1024px) {
            .character-container {
                display: none;
            }
        }

        /* ===== Sections ===== */
        .section-title {
            text-align: center;
            margin-bottom: 3rem;
        }

        .section-subtitle {
            text-align: center;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto 3rem;
        }

        /* ===== Explainer Section ===== */
        .explainer {
            text-align: center;
        }

        .explainer h2 {
            margin-bottom: 2rem;
        }

        .explainer-list {
            list-style: none;
            margin-top: 2rem;
        }

        .explainer-list li {
            padding: 0.5rem 0;
            position: relative;
            padding-left: 2rem;
        }

        .explainer-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent);
            font-size: 1.5rem;
            line-height: 1;
        }

        /* ===== Pillars Section ===== */
        .pillars {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .pillar {
            background-color: var(--bg-surface);
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid var(--border);
        }

        .pillar-icon {
            width: 48px;
            height: 48px;
            background-color: var(--primary)/20;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            color: var(--primary);
        }

        .pillar h3 {
            margin-bottom: 1rem;
        }

        .pillar ul {
            list-style: none;
            margin: 1rem 0;
        }

        .pillar li {
            padding: 0.25rem 0;
            padding-left: 1.25rem;
            position: relative;
        }

        .pillar li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent);
        }

        .pillar-supporting {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border);
            font-size: 0.95rem;
            color: var(--text-muted);
        }

        /* ===== How She Works ===== */
        .how-works {
            text-align: center;
        }

        .how-works table {
            width: 100%;
            max-width: 600px;
            margin: 2rem auto 0;
            border-collapse: collapse;
        }

        .how-works th,
        .how-works td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }

        .how-works th {
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
        }

        .how-works-notes {
            margin-top: 2rem;
            color: var(--text-muted);
        }

        /* ===== Why Different ===== */
        .why-different {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
        }

        @media (max-width: 768px) {
            .why-different {
                grid-template-columns: 1fr;
            }
        }

        .why-different h2 {
            grid-column: 1 / -1;
            text-align: center;
            margin-bottom: 2rem;
        }

        .why-different p {
            margin-bottom: 1rem;
        }

        /* ===== Ethical Section ===== */
        .ethical {
            text-align: center;
        }

        .ethical h2 {
            margin-bottom: 2rem;
        }

        .ethical-list {
            list-style: none;
            max-width: 500px;
            margin: 0 auto 2rem;
        }

        .ethical-list li {
            padding: 0.5rem 0;
            position: relative;
            padding-left: 2rem;
        }

        .ethical-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent);
        }

        .ethical-note {
            font-style: italic;
            color: var(--text-muted);
            margin-top: 1rem;
        }

        /* ===== BountyWarz Connection ===== */
        .connection {
            text-align: center;
        }

        .connection h2 {
            margin-bottom: 2rem;
        }

        .connection p {
            margin: 0 auto 1rem;
            max-width: 600px;
        }

        /* ===== Footer CTA ===== */
        .footer-cta {
            background-color: var(--bg-slate);
            padding: 4rem 0;
            text-align: center;
        }

        .footer-cta h2 {
            margin-bottom: 2rem;
        }

        .footer-cta-list {
            list-style: none;
            margin-bottom: 2rem;
        }

        .footer-cta-list li {
            padding: 0.5rem 0;
            color: var(--text-muted);
        }

        /* ===== Footer ===== */
        .footer {
            background-color: var(--bg-dark);
            padding: 3rem 0;
            border-top: 1px solid var(--border);
        }

        .footer .container {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 2rem;
        }

        .footer-section h4 {
            margin-bottom: 1rem;
            color: var(--text);
        }

        .footer-section ul {
            list-style: none;
        }

        .footer-section li {
            padding: 0.25rem 0;
        }

        .footer-section a {
            color: var(--text-muted);
            text-decoration: none;
        }

        .footer-section a:hover {
            color: var(--text);
        }

        .footer-bottom {
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border);
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        /* ===== Divider ===== */
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--border), transparent);
            margin: 3rem 0;
        }

        /* ===== Responsive ===== */
        @media (max-width: 768px) {
            .hero {
                min-height: auto;
                padding: 4rem 0;
            }

            .hero h1 {
                font-size: 2rem;
            }

            .hero h2 {
                font-size: 1.25rem;
            }

            .btn-group {
                flex-direction: column;
            }

            .footer .container {
                flex-direction: column;
                text-align: center;
            }
        }

        /* ===== Animations ===== */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        section {
            animation: fadeInUp 0.6s ease-out;
        }

        /* ===== Syntax Highlighting ===== */
        code {
            font-family: var(--font-mono);
            background-color: var(--bg-surface);
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.9em;
        }
    </style>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <a href="/" class="logo">ATHELGARD</a>
            <ul class="nav-links">
                <li><a href="#builder">Builder Mode</a></li>
                <li><a href="#train">Train</a></li>
                <li><a href="#call">Call</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="https://github.com" target="_blank">GitHub</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <h1>ATHELGARD</h1>
                <h2>The living guide of BountyWarz - and your coding agent for building the world she inhabits.</h2>
                <p>
                    Talk to Athelgard in Builder Mode to inspect code, plan fixes, and shape game systems. 
                    Train with her inside BountyWarz, where she teaches ethical bounty hunting through 
                    adaptive cyber missions, real vulnerability stories, and certification-aligned skill cards.
                </p>
                <div class="btn-group">
                    <a href="#builder" class="btn btn-primary">Enter Builder Mode</a>
                    <a href="https://bountywarz.com" target="_blank" class="btn btn-secondary">Train in BountyWarz</a>
                    <a href="tel:9494702082" class="btn btn-tertiary">Call Athelgard</a>
                </div>
                <p class="hero-tagline">Code. Train. Call. One mind across every surface.</p>
            </div>
        </div>
        <!-- Character illustration would go here -->
        <!-- <div class="character-container">
            <img src="images/athelgard-character.svg" alt="Athelgard, the living guide">
        </div> -->
    </section>

    <!-- Explainer Section -->
    <section class="explainer">
        <div class="container">
            <h2>Athelgard is not a generic chatbot.</h2>
            <p>She is:</p>
            <ul class="explainer-list">
                <li>the adaptive mentor and gamemaster inside BountyWarz</li>
                <li>the builder-facing coding agent for the systems behind BountyWarz</li>
                <li>the voice guide you can call for mission help, ethical triage, and learning support</li>
            </ul>
            <p>She helps players learn ethical bounty hunting and helps builders create the game that teaches it.</p>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Pillars Section -->
    <section id="builder">
        <div class="container">
            <h2 class="section-title">Build with Athelgard</h2>
            <div class="pillars">
                <!-- Pillar 1: Build -->
                <div class="pillar">
                    <div class="pillar-icon">💻</div>
                    <h3>Build with Athelgard</h3>
                    <p>Use Athelgard as a coding agent to:</p>
                    <ul>
                        <li>inspect repo architecture</li>
                        <li>trace bugs across systems</li>
                        <li>patch onboarding and mission flows</li>
                        <li>review captain persistence and progression logic</li>
                        <li>work with GitHub and Supabase-backed systems</li>
                    </ul>
                    <a href="#" class="btn btn-primary">Open Builder Mode</a>
                    <p class="pillar-supporting">
                        Athelgard understands BountyWarz as a living system - captains, nations, missions, 
                        cards, progression, and trust - not just a pile of files.
                    </p>
                </div>

                <!-- Pillar 2: Train -->
                <div class="pillar">
                    <div class="pillar-icon">🎮</div>
                    <h3>Train with Athelgard</h3>
                    <p>Inside BountyWarz, Athelgard teaches through:</p>
                    <ul>
                        <li>adaptive mission guidance</li>
                        <li>real CVE-inspired learning</li>
                        <li>London cybersecurity history</li>
                        <li>challenge tuning to your skill level</li>
                        <li>certification-aligned skill cards</li>
                    </ul>
                    <a href="https://bountywarz.com" target="_blank" class="btn btn-primary">Enter BountyWarz</a>
                    <p class="pillar-supporting">
                        Fly recon over London, hunt vulnerability stories, and learn the logic of 
                        ethical bounty hunting through guided play.
                    </p>
                </div>

                <!-- Pillar 3: Call -->
                <div class="pillar">
                    <div class="pillar-icon">📞</div>
                    <h3>Call Athelgard</h3>
                    <p>When you need a live guide, call Athelgard for:</p>
                    <ul>
                        <li>mission help</li>
                        <li>concept explanation</li>
                        <li>ethical bug bounty triage</li>
                        <li>report-structure coaching</li>
                        <li>short builder briefings</li>
                    </ul>
                    <a href="tel:9494702082" class="btn btn-primary">Call now: 949-470-2082</a>
                    <p class="pillar-supporting">
                        The same Athelgard who teaches inside the game and helps build the codebase 
                        can guide you by voice when you're stuck or on the move.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- How She Works -->
    <section class="how-works">
        <div class="container">
            <h2 class="section-title">One mind. Four surfaces.</h2>
            <table>
                <thead>
                    <tr>
                        <th>Surface</th>
                        <th>What Athelgard does</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Builder</td>
                        <td>audits systems, patches code, verifies fixes</td>
                    </tr>
                    <tr>
                        <td>BountyWarz</td>
                        <td>mentors players, teaches cyber concepts, adapts missions</td>
                    </tr>
                    <tr>
                        <td>Phone</td>
                        <td>guides by voice, explains, triages, redirects</td>
                    </tr>
                    <tr>
                        <td>Mobile</td>
                        <td>carries progress, guidance, and voice access with you</td>
                    </tr>
                </tbody>
            </table>
            <p class="how-works-notes">
                Athelgard changes her mode, not her identity. 
                She can be your guide, coach, professor, challenger, builder, or operator depending on what you need.
            </p>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Why Different -->
    <section class="why-different">
        <div class="container">
            <h2 class="section-title">A coding agent with a world to protect</h2>
            <div>
                <p>Most coding agents help you edit software.</p>
                <p>Athelgard helps you shape a living cyber-learning world.</p>
            </div>
            <div>
                <p>That means she reasons about:</p>
                <ul class="explainer-list">
                    <li>player trust</li>
                    <li>first-mission clarity</li>
                    <li>captain identity and recovery</li>
                    <li>progression and skill cards</li>
                    <li>ethical framing around real vulnerability stories</li>
                    <li>the continuity between learning, practice, and real-world readiness</li>
                </ul>
                <p>She doesn't just change code. She protects the logic of the world the code creates.</p>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Ethical Section -->
    <section class="ethical">
        <div class="container">
            <h2 class="section-title">Built for ethical readiness</h2>
            <p>
                Athelgard is designed to guide users toward:
            </p>
            <ul class="ethical-list">
                <li>authorized scope</li>
                <li>responsible disclosure</li>
                <li>minimal-harm reasoning</li>
                <li>clear reporting</li>
                <li>real learning through safe progression</li>
            </ul>
            <p>
                She can teach real bug bounty logic without becoming a reckless live-hacking companion.
            </p>
            <p class="ethical-note">
                Simulation first. Safe labs next. Authorized participation only when the path is clear.
            </p>
        </div>
    </section>

    <div class="divider"></div>

    <!-- BountyWarz Connection -->
    <section class="connection">
        <div class="container">
            <h2 class="section-title">Her home is BountyWarz</h2>
            <p>
                BountyWarz is where Athelgard lives as mentor, guide, coach, professor, and challenger.
            </p>
            <p>
                There, she teaches through:
            </p>
            <ul class="explainer-list">
                <li>recon missions</li>
                <li>real vulnerability stories</li>
                <li>London historical case framing</li>
                <li>skill progression</li>
                <li>adaptive challenge</li>
                <li>card-based mastery tracking</li>
            </ul>
            <p>
                Athelgard.io is where you meet the same intelligence in Builder Mode.
            </p>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Footer CTA -->
    <section class="footer-cta">
        <div class="container">
            <h2>Meet Athelgard where you need her.</h2>
            <ul class="footer-cta-list">
                <li>• Build the system</li>
                <li>• Train inside the world</li>
                <li>• Call for guidance</li>
            </ul>
            <div class="btn-group">
                <a href="#builder" class="btn btn-primary">Enter Builder Mode</a>
                <a href="https://bountywarz.com" target="_blank" class="btn btn-secondary">Play BountyWarz</a>
                <a href="tel:9494702082" class="btn btn-tertiary">Call Athelgard</a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-section">
                <h4>Product</h4>
                <ul>
                    <li><a href="#builder">Builder Mode</a></li>
                    <li><a href="https://bountywarz.com" target="_blank">BountyWarz</a></li>
                    <li><a href="#call">Voice</a></li>
                    <li><a href="#">Mobile</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Resources</h4>
                <ul>
                    <li><a href="#">Documentation</a></li>
                    <li><a href="https://github.com" target="_blank">GitHub</a></li>
                    <li><a href="#">Ethical Framework</a></li>
                    <li><a href="#">Founder Memo</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Legal</h4>
                <ul>
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Terms</a></li>
                    <li><a href="#">Safe Harbor Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2026 Kinetigor. Athelgard is a persistent ethical intelligence. Not a hacking tool.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
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

        // Add scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(section);
        });
    </script>
</body>
</html>
