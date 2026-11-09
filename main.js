/* =============================================
   main.js — Keith Ann Portfolio
   Shared across all pages
   ============================================= */

/* ── CUSTOM CURSOR ────────────────────────── */
const cursor       = document.querySelector('.cursor');
const cursorFollow = document.querySelector('.cursor-follower');

if (cursor && cursorFollow) {
    let mx = 0, my = 0, fx = 0, fy = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top  = my + 'px';
    });

    (function followLoop() {
        fx += (mx - fx) * 0.12;
        fy += (my - fy) * 0.12;
        cursorFollow.style.left = fx + 'px';
        cursorFollow.style.top  = fy + 'px';
        requestAnimationFrame(followLoop);
    })();

    // Scale on interactive elements
    document.querySelectorAll('a, button, .flip_card, .work_card, .hobby_card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.width  = '18px';
            cursor.style.height = '18px';
            cursorFollow.style.width  = '48px';
            cursorFollow.style.height = '48px';
            cursorFollow.style.opacity = '0.2';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.width  = '';
            cursor.style.height = '';
            cursorFollow.style.width  = '';
            cursorFollow.style.height = '';
            cursorFollow.style.opacity = '';
        });
    });
}

/* ── HAMBURGER MENU ──────────────────────── */
const hamburger = document.getElementById('hamburger');
const nav       = document.getElementById('nav');

if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        nav.classList.toggle('open');
    });
    // Close on link click
    nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            hamburger.classList.remove('open');
            nav.classList.remove('open');
        });
    });
}

/* ── HEADER SCROLL SHRINK ─────────────────── */
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    });
}

/* ── SCROLL REVEAL ───────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Animate skill bars when skills section is visible
            if (entry.target.classList.contains('skill')) {
                const bar = entry.target.querySelector('.progress');
                if (bar) {
                    const w = bar.dataset.width || getComputedClassWidth(bar);
                    bar.style.width = w + '%';
                }
            }
            // Count up numbers
            if (entry.target.classList.contains('stat')) {
                const numEl = entry.target.querySelector('.stat-num');
                if (numEl && !numEl.dataset.counted) {
                    numEl.dataset.counted = true;
                    countUp(numEl, parseInt(numEl.dataset.target));
                }
            }
        }
    });
}, { threshold: 0.18 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

function getComputedClassWidth(el) {
    const cls = el.className.split(' ').find(c => ['video','cooking','crafts','singing'].includes(c));
    const map = { video: 70, cooking: 90, crafts: 50, singing: 40 };
    return map[cls] || 60;
}

/* ── COUNT UP ANIMATION ───────────────────── */
function countUp(el, target) {
    let current = 0;
    const step  = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
    }, 35);
}

/* ── TYPING EFFECT (index only) ──────────── */
const typedEl = document.getElementById('typed');
if (typedEl) {
    const words = ['BSIT Student', 'Video Editor', 'Digital Artist', 'Creative Thinker'];
    let wIdx = 0, cIdx = 0, deleting = false;

    function typeLoop() {
        const word = words[wIdx];
        if (!deleting) {
            typedEl.textContent = word.slice(0, ++cIdx);
            if (cIdx === word.length) {
                deleting = true;
                setTimeout(typeLoop, 1800);
                return;
            }
        } else {
            typedEl.textContent = word.slice(0, --cIdx);
            if (cIdx === 0) {
                deleting = false;
                wIdx = (wIdx + 1) % words.length;
            }
        }
        setTimeout(typeLoop, deleting ? 55 : 90);
    }
    setTimeout(typeLoop, 600);
}

/* ── FLOATING PARTICLES (hero only) ─────── */
const particleContainer = document.getElementById('particles');
if (particleContainer) {
    for (let i = 0; i < 22; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 5 + 2;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random() * 100}%;
            bottom:${Math.random() * 30}%;
            --dur:${6 + Math.random() * 10}s;
            --del:${Math.random() * 8}s;
        `;
        particleContainer.appendChild(p);
    }
}

/* ── SMOOTH SKILL BAR TRIGGER ────────────── */
// Also trigger on any existing visible skills at page load
document.querySelectorAll('.skill').forEach(skill => {
    revealObserver.observe(skill);
    // Also observe skills with data-width directly
});

/* ── UI EXTRAS: scroll progress, back-to-top, lazy images ─── */
(function uiExtras() {
    // scroll progress bar
    const bar = document.createElement('div');
    bar.id = 'scrollProgress';
    document.body.appendChild(bar);

    // back-to-top button
    const topBtn = document.createElement('button');
    topBtn.className = 'to_top';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(topBtn);

    function onScroll() {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
        topBtn.classList.toggle('show', window.scrollY > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // lazy-load + fade-in images (skip the header avatar)
    document.querySelectorAll('img').forEach(img => {
        if (img.closest('.header')) return;
        if (!img.hasAttribute('loading')) img.loading = 'lazy';
        if (!img.complete) {
            img.classList.add('img_fade');
            img.addEventListener('load', () => img.classList.add('img_loaded'), { once: true });
            img.addEventListener('error', () => img.classList.add('img_loaded'), { once: true });
        }
    });
})();


/* ── ADVANCED BACKGROUND (aurora blobs, dot grid, cursor spotlight, grain) ── */
(function backgroundFx() {
    const fx = document.createElement('div');
    fx.className = 'bg_fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML =
        '<span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span>' +
        '<span class="bg_grid"></span><span class="bg_spot"></span><span class="bg_grain"></span>';
    document.body.prepend(fx);

    if (window.matchMedia('(hover: hover)').matches) {
        let x = 0, y = 0, raf = null;
        window.addEventListener('mousemove', e => {
            x = e.clientX; y = e.clientY;
            if (!raf) raf = requestAnimationFrame(() => {
                fx.style.setProperty('--mx', x + 'px');
                fx.style.setProperty('--my', y + 'px');
                raf = null;
            });
        }, { passive: true });
    }
})();


/* ── README MANUAL (button + pop-up) ─────────────────────────
   Edit the two values below with your GitHub username and repository name.
   (When the site is opened on github.io they are detected automatically.) */
(function readmeManual() {
    const CONFIG = { user: 'YOUR-USERNAME', repo: 'portfolio' };
    let user = CONFIG.user, repo = CONFIG.repo;
    if (/\.github\.io$/i.test(location.hostname)) {
        user = location.hostname.split('.')[0];
        const seg = location.pathname.split('/')[1];
        if (seg && !/\.html$/i.test(seg)) repo = seg;
    }
    const liveUrl  = `https://${user}.github.io/${repo}/`;
    const repoUrl  = `https://github.com/${user}/${repo}`;
    const localUrl = 'http://localhost/portfolio/';

    const link = (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`;
    const copy = (t) => `<button type="button" class="copy_btn" data-copy="${t}"><i class="fas fa-copy"></i> Copy</button>`;

    const githubPanel = `
        <h4>Part 1 — Open the live website</h4>
        <ol class="steps">
            <li><b>Open the link</b> in Chrome, Edge, Firefox or Safari:<br>${link(liveUrl)} ${copy(liveUrl)}<br><small>Give it a few seconds to load.</small></li>
            <li><b>Create an account.</b> On the login page click <b>Sign Up</b>, type your name, email and a password (at least 6 characters), then click <b>Create Account</b>. Next time just use <b>Log In</b>. Tick <b>Keep me logged in</b> to stay signed in.</li>
            <li><b>Look around.</b> Use the menu at the top: <b>Home</b>, <b>Works</b> (filter by category, click an illustration to enlarge it, press the demo reel to watch it), <b>About</b> and <b>Contact</b>.</li>
            <li><b>Log out.</b> Hover your profile picture (top-left) and click <b>Log out</b>.</li>
        </ol>
        <div class="readme_note">On the live site your account is saved <b>in your own browser only</b>. It is a demo login, so it is not shared between devices. The Contact form opens your email app with the message already filled in — just press send.</div>

        <h4>Part 2 — View or download the code</h4>
        <ol class="steps">
            <li>Open the code page on GitHub:<br>${link(repoUrl)} ${copy(repoUrl)}</li>
            <li>Click any file name (for example <code>index.html</code>) to read its code.</li>
            <li>To get everything: click the green <b>Code</b> button, then <b>Download ZIP</b>.</li>
            <li>Find the ZIP in your Downloads folder, right-click it and choose <b>Extract All</b>.</li>
        </ol>

        <h4>Not working?</h4>
        <ul class="tips">
            <li><b>"404 – page not found":</b> the site may still be publishing. Wait 1–2 minutes and refresh.</li>
            <li><b>Old version showing:</b> press <b>Ctrl + F5</b> to force a fresh load.</li>
            <li><b>Videos or demo reel not playing:</b> the video files may not be uploaded yet.</li>
        </ul>`;

    const xamppPanel = `
        <h4>Run the website on your own computer</h4>
        <ol class="steps">
            <li><b>Install XAMPP.</b> Download it from <a href="https://www.apachefriends.org" target="_blank" rel="noopener">apachefriends.org</a>, run the installer and keep the default options.</li>
            <li><b>Get the code.</b> Open ${link(repoUrl)}, click the green <b>Code</b> button, then <b>Download ZIP</b>. Right-click the ZIP and choose <b>Extract All</b>.</li>
            <li><b>Copy it into XAMPP.</b> Create the folder <code>C:\\xampp\\htdocs\\portfolio</code> and put <b>all</b> the extracted files inside it. Check that <code>index.html</code> is directly at <code>C:\\xampp\\htdocs\\portfolio\\index.html</code>, not inside another folder.</li>
            <li><b>Start Apache.</b> Open the <b>XAMPP Control Panel</b> and click <b>Start</b> next to <b>Apache</b>. It turns green.</li>
            <li><b>Open the site</b> in your browser:<br>${link(localUrl)} ${copy(localUrl)}<br><small>If Apache uses port 8080, the address is <code>http://localhost:8080/portfolio/</code>. Don't double-click the HTML files.</small></li>
            <li><b>Sign up and log in.</b> Click <b>Sign Up</b> on the first page, create an account, and you're in. Hover your profile picture and click <b>Log out</b> when you're done.</li>
        </ol>

        <h4>Optional — save accounts in a MySQL database</h4>
        <p class="readme_p">This needs the <code>api</code> folder from the project owner (it isn't published on GitHub). Without it, the site still works using a browser-only login.</p>
        <ol class="steps">
            <li>Put the <code>api</code> folder inside <code>C:\\xampp\\htdocs\\portfolio\\</code>.</li>
            <li>In the XAMPP Control Panel, click <b>Start</b> next to <b>MySQL</b> as well.</li>
            <li>Open ${link('http://localhost/portfolio/api/setup.php')} once. Wait for <b>"All done — your database is ready."</b></li>
            <li>Sign up on the website, then open ${link('http://localhost/portfolio/api/check.php')} to see your saved account.</li>
            <li>You can also look in <b>phpMyAdmin</b> (${link('http://localhost/phpmyadmin')}) → <code>portfolio_db</code> → <code>users</code> → <b>Browse</b>.</li>
        </ol>

        <h4>Adding the videos</h4>
        <p class="readme_p">Place the video files in <code>demoreel/</code> and <code>multimedia_projects/</code> using these exact names: <code>demoreel_click.mp4</code>, <code>vlog.mp4</code>, <code>commercial.mp4</code>, <code>podcast.mp4</code>, <code>movie.mp4</code>, <code>game.mp4</code>, <code>roleplay.mp4</code>.</p>

        <h4>Not working?</h4>
        <ul class="tips">
            <li><b>Apache won't start:</b> another program (Skype, IIS) is using port 80. Close it, or change Apache's port in XAMPP → Config.</li>
            <li><b>"Not Found" page:</b> check the folder name is exactly <code>portfolio</code> and the address matches.</li>
            <li><b>Pictures missing:</b> make sure the <code>images</code>, <code>digital_art</code> and <code>web_design</code> folders are copied too.</li>
            <li><b>Press Ctrl + F5</b> after changing files so the browser doesn't show an old copy.</li>
        </ul>`;

    // button
    const fab = document.createElement('button');
    fab.className = 'readme_fab';
    fab.type = 'button';
    fab.setAttribute('aria-haspopup', 'dialog');
    fab.innerHTML = '<i class="fas fa-book-open"></i> README';

    // pop-up
    const overlay = document.createElement('div');
    overlay.className = 'readme_overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'How to open this project');
    overlay.innerHTML = `
        <div class="readme_box">
            <div class="readme_head">
                <div class="readme_title"><i class="fas fa-book-open"></i> README — How to open this project</div>
                <p class="readme_sub">Pick how you want to view it. Follow the steps in order.</p>
                <button type="button" class="readme_close" aria-label="Close">&times;</button>
            </div>
            <div class="readme_tabs">
                <button type="button" class="readme_tab active" data-tab="github"><i class="fab fa-github"></i> GitHub (Live)</button>
                <button type="button" class="readme_tab" data-tab="xampp"><i class="fas fa-server"></i> Local (XAMPP)</button>
            </div>
            <div class="readme_body">
                <div class="readme_panel active" data-panel="github">${githubPanel}</div>
                <div class="readme_panel" data-panel="xampp">${xamppPanel}</div>
            </div>
        </div>`;

    document.body.appendChild(fab);
    document.body.appendChild(overlay);

    function openManual()  { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function closeManual() { overlay.classList.remove('open'); document.body.style.overflow = ''; }

    fab.addEventListener('click', openManual);
    overlay.querySelector('.readme_close').addEventListener('click', closeManual);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeManual(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeManual(); });

    overlay.querySelectorAll('.readme_tab').forEach(tab => {
        tab.addEventListener('click', () => {
            overlay.querySelectorAll('.readme_tab').forEach(t => t.classList.toggle('active', t === tab));
            overlay.querySelectorAll('.readme_panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab.dataset.tab));
            overlay.querySelector('.readme_body').scrollTop = 0;
        });
    });

    // copy buttons
    overlay.addEventListener('click', e => {
        const btn = e.target.closest('.copy_btn');
        if (!btn) return;
        const text = btn.dataset.copy;
        const done = () => {
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 1800);
        };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(done);
        } else {
            const ta = document.createElement('textarea');
            ta.value = text; document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); done(); } catch (err) {}
            ta.remove();
        }
    });
})();
