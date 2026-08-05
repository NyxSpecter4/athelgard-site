---
name: "athelgard-io-final-html"
title: "Athelgard.io Final HTML - Production-Ready Landing Page"
type: "text/html"
---

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Athelgard // Builder Mode - The living guide of BountyWarz</title>
    <meta name="description" content="Speak to Athelgard about code, systems, missions, progression, and ethical bounty-hunting design. Train with her inside BountyWarz, or work with her here in Builder Mode.">
    <meta name="keywords" content="Athelgard, Builder Mode, BountyWarz, cybersecurity, ethical bounty hunting, coding agent, AI mentor">
    <meta name="author" content="Kiran Wolfe">
    <meta property="og:title" content="Athelgard // Builder Mode">
    <meta property="og:description" content="The living guide of BountyWarz - now helping you build the world she inhabits.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://athelgard.io">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#0F172A">
    
    <style>
        /* ===== CSS Variables ===== */
        :root {
            --primary: #4F46E5;
            --primary-light: #818CF8;
            --primary-dark: #4338CA;
            --accent: #F59E0B;
            --accent-light: #FCD34D;
            --bg-dark: #0F172A;
            --bg-slate: #1E293B;
            --bg-surface: #334155;
            --text: #F8FAFC;
            --text-secondary: #CBD5E1;
            --text-muted: #94A3B8;
            --border: #334155;
            --border-light: #475569;
            
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
            
            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);
            --shadow-glow: 0 0 20px rgba(79, 70, 229, 0.2);
            
            --radius-sm: 0.375rem;
            --radius: 0.5rem;
            --radius-lg: 0.75rem;
            --radius-xl: 1rem;
            
            --transition: all 0.2s ease;
        }

        /* ===== Reset & Base ===== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: var(--font-sans);
            background-color: var(--bg-dark);
            color: var(--text);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* ===== Typography ===== */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            line-height: 1.2;
            color: var(--text);
        }

        h1 { font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -0.025em; }
        h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); }
        h3 { font-size: clamp(1.25rem, 2.5vw, 1.5rem); }
        h4 { font-size: 1.125rem; }

        p {
            color: var(--text-secondary);
            max-width: 65ch;
        }

        .text-muted {
            color: var(--text-muted);
        }

        .text-accent {
            color: var(--accent);
        }

        /* ===== Layout ===== */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }

        section {
            padding: 4rem 0;
        }

        @media (max-width: 768px) {
            section {
                padding: 3rem 0;
            }
        }

        /* ===== Buttons ===== */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            border-radius: var(--radius);
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
            cursor: pointer;
            border: none;
            white-space: nowrap;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            color: var(--text);
            box-shadow: var(--shadow), var(--shadow-glow);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg), var(--shadow-glow);
        }

        .btn-secondary {
            background: transparent;
            color: var(--text);
            border: 2px solid var(--primary);
        }

        .btn-secondary:hover {
            background: var(--primary);
            transform: translateY(-2px);
        }

        .btn-tertiary {
            background: transparent;
            color: var(--accent);
            border: none;
        }

        .btn-tertiary:hover {
            color: var(--accent-light);
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
            }
        }

        /* ===== Navigation ===== */
        .navbar {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: var(--bg-dark)/80;
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border);
            padding: 1rem 0;
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
            transition: var(--transition);
            padding: 0.5rem 0;
            position: relative;
        }

        .nav-links a:hover {
            color: var(--text);
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary);
            transition: var(--transition);
        }

        .nav-links a:hover::after {
            width: 100%;
        }

        .nav-cta {
            display: flex;
            gap: 1rem;
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
                radial-gradient(ellipse at 10% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 90% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }

        .hero .container {
            position: relative;
            z-index: 1;
        }

        .hero-content {
            max-width: 800px;
        }

        .eyebrow {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 1.5rem;
        }

        .eyebrow::before {
            content: '';
            width: 4px;
            height: 4px;
            background: var(--accent);
            border-radius: 50%;
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
            font-size: 1.25rem;
            line-height: 1.5;
        }

        .hero-tagline {
            margin-top: 2rem;
            font-size: 1rem;
            color: var(--text-muted);
        }

        /* ===== Trust Strip ===== */
        .trust-strip {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .trust-item {
            padding: 1.5rem;
            background: var(--bg-surface);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }

        .trust-item-icon {
            width: 40px;
            height: 40px;
            background: var(--primary)/20;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
            color: var(--primary);
            font-size: 1.25rem;
        }

        .trust-item h4 {
            margin-bottom: 0.5rem;
            color: var(--text);
        }

        .trust-item p {
            font-size: 0.95rem;
            color: var(--text-muted);
        }

        /* ===== Sections ===== */
        .section-title {
            text-align: center;
            margin-bottom: 1rem;
        }

        .section-subtitle {
            text-align: center;
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto 3rem;
            font-size: 1.125rem;
        }

        .section-intro {
            text-align: center;
            max-width: 700px;
            margin: 0 auto 3rem;
            font-size: 1.125rem;
        }

        /* ===== Who She Is ===== */
        .who-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
        }

        @media (max-width: 768px) {
            .who-section {
                grid-template-columns: 1fr;
            }
        }

        .who-content h2 {
            margin-bottom: 1.5rem;
        }

        .who-content p {
            margin-bottom: 1rem;
        }

        .quote-card {
            background: linear-gradient(135deg, var(--bg-surface), var(--bg-slate));
            padding: 2rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
            box-shadow: var(--shadow);
        }

        .quote-card blockquote {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text);
            border-left: 4px solid var(--accent);
            padding-left: 1rem;
            margin: 0;
        }

        /* ===== Surface Map ===== */
        .surface-map {
            text-align: center;
        }

        .surface-map table {
            width: 100%;
            max-width: 600px;
            margin: 2rem auto 0;
            border-collapse: collapse;
        }

        .surface-map th,
        .surface-map td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }

        .surface-map th {
            color: var(--text-muted);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.875rem;
            letter-spacing: 0.05em;
        }

        .surface-map-notes {
            margin-top: 2rem;
            color: var(--text-muted);
            font-style: italic;
        }

        /* ===== Feature Sections ===== */
        .feature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
        }

        @media (max-width: 768px) {
            .feature-section {
                grid-template-columns: 1fr;
            }
        }

        .feature-content h2 {
            margin-bottom: 1.5rem;
        }

        .feature-content p {
            margin-bottom: 1rem;
        }

        .feature-list {
            list-style: none;
            margin: 1.5rem 0;
        }

        .feature-list li {
            padding: 0.75rem 0;
            padding-left: 1.5rem;
            position: relative;
            border-left: 2px solid var(--primary);
        }

        .feature-list li::before {
            content: '•';
            position: absolute;
            left: -0.5rem;
            top: 0.75rem;
            color: var(--primary);
            font-size: 1.25rem;
        }

        .feature-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        .feature-card {
            background: var(--bg-surface);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }

        .feature-card h4 {
            margin-bottom: 0.75rem;
            color: var(--text);
        }

        .feature-card p {
            font-size: 0.95rem;
            color: var(--text-muted);
        }

        .inline-helper {
            margin-top: 1.5rem;
            padding: 1rem;
            background: var(--bg-surface);
            border-radius: var(--radius);
            border-left: 4px solid var(--accent);
        }

        .inline-helper p {
            margin: 0;
            font-size: 0.95rem;
        }

        .inline-helper strong {
            color: var(--accent);
        }

        /* ===== Ethical Section ===== */
        .ethical-section {
            text-align: center;
        }

        .ethical-list {
            list-style: none;
            max-width: 500px;
            margin: 2rem auto;
        }

        .ethical-list li {
            padding: 0.75rem 0;
            position: relative;
            padding-left: 2rem;
        }

        .ethical-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent);
            font-size: 1.25rem;
        }

        .highlight-line {
            margin-top: 2rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, var(--primary)/20, var(--accent)/20);
            border-radius: var(--radius);
            font-weight: 600;
            font-style: italic;
            color: var(--text);
            display: inline-block;
        }

        /* ===== Why Different ===== */
        .why-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            align-items: center;
        }

        @media (max-width: 768px) {
            .why-section {
                grid-template-columns: 1fr;
            }
        }

        .why-section h2 {
            grid-column: 1 / -1;
            text-align: center;
            margin-bottom: 2rem;
        }

        .why-list {
            list-style: none;
        }

        .why-list li {
            padding: 0.5rem 0;
            position: relative;
            padding-left: 1.5rem;
        }

        .why-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--primary);
        }

        /* ===== CLI Section ===== */
        .cli-section {
            text-align: center;
        }

        .cli-intro {
            max-width: 600px;
            margin: 0 auto 2rem;
        }

        .cli-ctas {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }

        /* ===== Final CTA ===== */
        .final-cta {
            background: linear-gradient(135deg, var(--bg-slate), var(--bg-dark));
            padding: 4rem 0;
            text-align: center;
        }

        .final-cta h2 {
            margin-bottom: 2rem;
        }

        .final-cta .btn-group {
            justify-content: center;
            margin-top: 2rem;
        }

        .final-line {
            margin-top: 2rem;
            font-size: 1.125rem;
            color: var(--text-muted);
            font-style: italic;
        }

        /* ===== Footer ===== */
        .footer {
            background: var(--bg-dark);
            padding: 3rem 0;
            border-top: 1px solid var(--border);
        }

        .footer .container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
            transition: var(--transition);
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
                font-size: 1.125rem;
            }

            .trust-strip {
                grid-template-columns: 1fr;
            }

            .footer .container {
                grid-template-columns: 1fr 1fr;
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

        /* ===== Code Blocks ===== */
        code {
            font-family: var(--font-mono);
            background: var(--bg-surface);
            padding: 0.125rem 0.375rem;
            border-radius: var(--radius-sm);
            font-size: 0.9em;
        }

        pre {
            background: var(--bg-surface);
            padding: 1rem;
            border-radius: var(--radius);
            overflow-x: auto;
        }

        pre code {
            background: none;
            padding: 0;
        }

        /* ===== Print ===== */
        @media print {
            .navbar,
            .footer,
            .btn-group {
                display: none;
            }
            
            body {
                background: white;
                color: black;
            }
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
                <li><a href="#bountywarz">BountyWarz</a></li>
                <li><a href="#call">Call</a></li>
                <li><a href="#mobile">Mobile</a></li>
                <li><a href="#about">About</a></li>
            </ul>
            <div class="nav-cta">
                <a href="#builder" class="btn btn-primary">Enter Builder Mode</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content">
                <div class="eyebrow">ATHELGARD // BUILDER MODE</div>
                <h1>The living guide of BountyWarz - now helping you build the world she inhabits.</h1>
                <h2>Speak to Athelgard about code, systems, missions, progression, and ethical bounty-hunting design. Train with her inside BountyWarz, or work with her here in Builder Mode.</h2>
                <div class="btn-group">
                    <a href="#builder" class="btn btn-primary">Enter Builder Mode</a>
                    <a href="https://bountywarz.com" target="_blank" class="btn btn-secondary">Train in BountyWarz</a>
                    <a href="tel:9494702082" class="btn btn-tertiary">Call Athelgard</a>
                </div>
                <p class="hero-tagline">Code. Train. Call. One mind across every surface.</p>
            </div>
        </div>
    </section>

    <!-- Trust Strip -->
    <section class="trust-section">
        <div class="container">
            <div class="trust-strip">
                <div class="trust-item">
                    <div class="trust-item-icon">💻</div>
                    <h4>Builder-aware</h4>
                    <p>Repo-aware coding help for flows, systems, and game logic.</p>
                </div>
                <div class="trust-item">
                    <div class="trust-item-icon">🎮</div>
                    <h4>World-aware</h4>
                    <p>Athelgard understands captains, missions, cards, nations, and trust.</p>
                </div>
                <div class="trust-item">
                    <div class="trust-item-icon">🛡️</div>
                    <h4>Ethics-aware</h4>
                    <p>Built for responsible learning, safe progression, and authorized disclosure readiness.</p>
                </div>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Who She Is Section -->
    <section class="who-section">
        <div class="container">
            <div class="who-content">
                <h2>Athelgard is not a generic coding agent</h2>
                <p>Inside BountyWarz, Athelgard is the adaptive mentor, guide, professor, challenger, and gamemaster who teaches players through real vulnerability stories and mission-based cyber learning.</p>
                <p>Here on Athelgard.io, you meet the same intelligence in Builder Mode - ready to inspect systems, plan fixes, patch flows, and help shape the world she lives in.</p>
            </div>
            <div class="quote-card">
                <blockquote>"I guide the hunt inside the world. I help build it here."</blockquote>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Surface Map Section -->
    <section class="surface-map">
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
                        <td>Builder Mode</td>
                        <td>inspects architecture, traces bugs, patches flows, verifies changes</td>
                    </tr>
                    <tr>
                        <td>BountyWarz</td>
                        <td>teaches ethical cyber reasoning through adaptive missions</td>
                    </tr>
                    <tr>
                        <td>Phone</td>
                        <td>gives live coaching, ethical triage, and short builder briefings</td>
                    </tr>
                    <tr>
                        <td>Mobile</td>
                        <td>carries guidance, progress, voice access, and later AR card experiences</td>
                    </tr>
                </tbody>
            </table>
            <p class="surface-map-notes">Athelgard changes her mode, not her identity.</p>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Builder Mode Section -->
    <section id="builder" class="feature-section">
        <div class="container">
            <div class="feature-content">
                <h2>Build with Athelgard</h2>
                <p>Use Builder Mode when you want Athelgard to help with the code and systems behind BountyWarz - or with general software tasks that benefit from a repo-aware coding agent.</p>
                
                <div class="feature-cards">
                    <div class="feature-card">
                        <h4>Trace systems</h4>
                        <p>Follow the logic behind captain identity, guest flow, mission state, cards, progression, and trust breaks.</p>
                    </div>
                    <div class="feature-card">
                        <h4>Patch intelligently</h4>
                        <p>Plan the smallest safe fix, apply changes, and verify them before calling the work done.</p>
                    </div>
                    <div class="feature-card">
                        <h4>Work with your stack</h4>
                        <p>Inspect code, reason about GitHub workflows, and review Supabase-backed persistence and progression.</p>
                    </div>
                </div>

                <div class="btn-group">
                    <a href="#" class="btn btn-primary">Open Builder Mode</a>
                </div>

                <div class="inline-helper">
                    <p><strong>Best for:</strong> debugging, onboarding fixes, mission logic, copy flow, progression systems, and world-building through code.</p>
                </div>
            </div>
            <div>
                <!-- Placeholder for illustration -->
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- BountyWarz Section -->
    <section id="bountywarz" class="feature-section">
        <div class="container">
            <div>
                <!-- Placeholder for illustration -->
            </div>
            <div class="feature-content">
                <h2>Train with Athelgard inside BountyWarz</h2>
                <p>BountyWarz is where Athelgard lives as mentor and gamemaster. She teaches ethical bounty-hunting logic through recon missions, real CVE-inspired learning, London cybersecurity history, and certification-aligned skill cards.</p>
                
                <div class="feature-cards">
                    <div class="feature-card">
                        <h4>Adaptive teaching</h4>
                        <p>Athelgard adjusts to your level and changes how she guides, challenges, and explains.</p>
                    </div>
                    <div class="feature-card">
                        <h4>Mission-based learning</h4>
                        <p>Learn by flying, reasoning, proving, and progressing - not just by reading.</p>
                    </div>
                    <div class="feature-card">
                        <h4>Readiness progression</h4>
                        <p>Move from simulation to safe practice to real-world ethical participation only when the path is clear.</p>
                    </div>
                </div>

                <div class="btn-group">
                    <a href="https://bountywarz.com" target="_blank" class="btn btn-primary">Enter BountyWarz</a>
                </div>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Phone Section -->
    <section id="call" class="feature-section">
        <div class="container">
            <div class="feature-content">
                <h2>Call Athelgard</h2>
                <p>When you need live guidance, Athelgard can coach by voice. Use the phone surface for mission help, concept explanation, ethical bug bounty triage, and short builder briefings.</p>
                
                <div class="feature-list">
                    <li>mission guidance</li>
                    <li>concept explanation</li>
                    <li>scope and ethics questions</li>
                    <li>reporting structure help</li>
                    <li>short implementation planning</li>
                </div>

                <div class="btn-group">
                    <a href="tel:9494702082" class="btn btn-primary">Call Athelgard</a>
                </div>

                <p class="text-muted" style="margin-top: 1rem;">If the task needs visuals, code diffs, or deeper system work, Athelgard can hand you off to Builder Mode or BountyWarz.</p>
            </div>
            <div>
                <!-- Placeholder for illustration -->
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Ethical Section -->
    <section class="ethical-section">
        <div class="container">
            <h2 class="section-title">Built for ethical bounty hunting</h2>
            <p class="section-intro">Athelgard is designed to guide users toward:</p>
            
            <ul class="ethical-list">
                <li>authorized scope</li>
                <li>minimal-harm reasoning</li>
                <li>responsible disclosure</li>
                <li>clear reporting</li>
                <li>real learning through safe progression</li>
            </ul>

            <p>She can teach real bug bounty logic without becoming a reckless live-target companion.</p>
            <p class="highlight-line">Simulation first. Safe labs next. Authorized participation only when the path is clear.</p>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Why Different Section -->
    <section class="why-section">
        <div class="container">
            <h2>A coding agent with a world to protect</h2>
            <div>
                <p>Most coding agents help edit software. Athelgard helps protect the logic of a living cyber-learning world.</p>
                <p>That means she reasons about:</p>
                <ul class="why-list">
                    <li>first-mission clarity</li>
                    <li>captain identity and recovery</li>
                    <li>progression and trust</li>
                    <li>narrative coherence</li>
                    <li>mission design</li>
                    <li>ethical framing around vulnerability stories</li>
                </ul>
                <p>She doesn't just change files. She helps maintain the world those files create.</p>
            </div>
            <div>
                <!-- Placeholder for illustration -->
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- CLI Section -->
    <section id="mobile" class="cli-section">
        <div class="container">
            <h2 class="section-title">Download Athelgard</h2>
            <p class="cli-intro">Athelgard is expanding into a smooth downloadable builder experience. The long-term shape is:</p>
            
            <ul class="feature-list" style="text-align: left; max-width: 600px; margin: 0 auto 2rem;">
                <li>Desktop CLI for real repo work</li>
                <li>Android companion for mobile access and voice continuity</li>
                <li>Browser Builder Mode for quick starts and guided sessions</li>
            </ul>

            <div class="cli-ctas">
                <a href="#" class="btn btn-primary">Get Builder Access</a>
                <a href="#" class="btn btn-secondary">Join Mobile Waitlist</a>
                <a href="#" class="btn btn-tertiary">See CLI Roadmap</a>
            </div>

            <p class="text-muted" style="margin-top: 1.5rem;">If the CLI is not live yet, do not fake availability. Use waitlist or early-access language.</p>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Final CTA -->
    <section class="final-cta">
        <div class="container">
            <h2>Meet Athelgard where you need her.</h2>
            <div class="btn-group">
                <a href="#builder" class="btn btn-primary">Build with her</a>
                <a href="https://bountywarz.com" target="_blank" class="btn btn-secondary">Train with her</a>
                <a href="tel:9494702082" class="btn btn-tertiary">Call her</a>
            </div>
            <p class="final-line">The same Athelgard. Different mode. Same mission.</p>
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
                    <li><a href="#mobile">Mobile</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>Resources</h4>
                <ul>
                    <li><a href="#">Documentation</a></li>
                    <li><a href="#">GitHub</a></li>
                    <li><a href="#">Roadmap</a></li>
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
            <div class="footer-section">
                <h4>Connect</h4>
                <ul>
                    <li><a href="#">Discord</a></li>
                    <li><a href="#">Twitter</a></li>
                    <li><a href="#">GitHub</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>© 2026 Kinetigor. Athelgard is the living guide of BountyWarz. Not a hacking tool.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling
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

        // Scroll animations
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

        // Mobile menu toggle (if needed)
        // Add hamburger menu for mobile if implementing
    </script>
</body>
</html>
