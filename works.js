/* =============================================
   works.js — Works page filter + lightbox + reel
   ============================================= */

/* ── FILTER SYSTEM ───────────────────────── */
const buttons  = document.querySelectorAll('.work_filter');
const sections = document.querySelectorAll('.work_item');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;

        sections.forEach(section => {
            if (category === 'all' || section.dataset.category === category) {
                section.classList.remove('hidden');
                section.style.display = 'block';
                // Trigger reflow then fade in
                requestAnimationFrame(() => {
                    section.classList.remove('fade-out');
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                });
            } else {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    section.style.display = 'none';
                }, 400);
            }
        });

        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

/* ── LIGHTBOX ────────────────────────────── */
const lightbox    = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox_img');
const closeBtn    = document.querySelector('#lightbox .close');

document.querySelectorAll('.zoom_img').forEach(img => {
    img.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        document.body.style.overflow = 'hidden';
    });
});

if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
}

lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeLightbox();
        closeReel();
    }
});

function closeLightbox() {
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/* ── DEMO REEL ───────────────────────────── */
const REEL_FILES = [
    'demoreel/demoreel_web.mp4',
    'demoreel/demoreel_click.mp4',
    'demoreel/demoreel.mp4'
];
const reelErrorBox = document.getElementById('reelError');
let reelExplaining = false;

function showReelError(html) {
    if (!reelErrorBox) return;
    reelErrorBox.innerHTML = html;
    reelErrorBox.style.display = 'block';
}
function hideReelError() {
    if (reelErrorBox) reelErrorBox.style.display = 'none';
    reelExplaining = false;
}

// Works out WHY the video isn't playing and tells the visitor / you
async function explainReelFailure() {
    if (reelExplaining) return;
    reelExplaining = true;
    let found = null;
    try {
        for (const f of REEL_FILES) {
            const r = await fetch(f, { method: 'HEAD', cache: 'no-store' });
            if (r.ok) { found = f; break; }
        }
    } catch (e) {
        showReelError('Can\'t reach the video. Open the site through <code>http://localhost/portfolio/</code> (XAMPP), not by double-clicking the HTML file.');
        return;
    }
    if (!found) {
        showReelError('Video file not found. Put it at <code>demoreel/demoreel_click.mp4</code> (same spelling, all lowercase) inside your portfolio folder.');
    } else {
        showReelError('Found <code>' + found + '</code>, but this browser can\'t play it. It is probably encoded as H.265/HEVC. ' +
            'Re-export it as <b>H.264 + AAC</b> (HandBrake preset "Fast 1080p30"), or run:<br>' +
            '<code>ffmpeg -i demoreel_click.mp4 -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart demoreel_web.mp4</code><br>' +
            'Save the result as <code>demoreel/demoreel_web.mp4</code> and it will be picked up automatically.');
    }
}

(function watchReel() {
    const video = document.getElementById('reelVideo');
    if (!video) return;
    const sources = video.querySelectorAll('source');
    if (sources.length) sources[sources.length - 1].addEventListener('error', explainReelFailure);
    video.addEventListener('error', explainReelFailure);
})();

function openReel() {
    const modal = document.getElementById('reelModal');
    const video = document.getElementById('reelVideo');
    if (!modal || !video) return;
    hideReelError();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    video.load();
    const p = video.play();
    if (p && p.catch) {
        p.catch(err => {
            // NotAllowedError = browser wants a tap on the play button; anything else = real problem
            if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') explainReelFailure();
        });
    }
}

function closeReel() {
    const modal = document.getElementById('reelModal');
    const video = document.getElementById('reelVideo');
    if (!modal || !video) return;
    modal.style.display = 'none';
    video.pause();
    video.currentTime = 0;
    hideReelError();
    document.body.style.overflow = '';
}

// Click outside the video to close
document.getElementById('reelModal')?.addEventListener('click', e => {
    if (e.target.id === 'reelModal') closeReel();
});
