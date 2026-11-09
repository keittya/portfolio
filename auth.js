/* =============================================
   auth.js — Keith Ann Portfolio
   Two modes, chosen automatically:
   • XAMPP / PHP host  -> PHP + MySQL (api/ folder)
   • GitHub Pages      -> browser-only demo login (localStorage)
   ============================================= */
(function () {
    'use strict';

    /* true  = visitors must log in to see pages
       false = pages stay public, login is optional */
    var REQUIRE_LOGIN = true;

    /* GitHub Pages cannot run PHP, so it uses the browser-only login.
       (Opening the files by double-clicking also uses it.) */
    var STATIC_MODE = /\.github\.io$/i.test(location.hostname) || location.protocol === 'file:';

    var serverAvailable = !STATIC_MODE;   // becomes false if the api/ folder isn't there

    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var onLoginPage = page === 'login.html';

    /* ───────────── DRIVER A: PHP + MySQL ───────────── */
    var API = 'api/';

    function call(endpoint, body) {
        if (!serverAvailable) return Promise.reject(new Error('No server available in this mode.'));
        return fetch(API + endpoint, {
            method: body ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: body ? JSON.stringify(body) : undefined
        }).then(function (res) {
            return res.json().catch(function () {
                throw new Error('Server error. Check that Apache and MySQL are running.');
            });
        }, function () {
            throw new Error('Cannot reach the server. Is Apache running in XAMPP?');
        }).then(function (data) {
            if (!data.ok) throw new Error(data.error || 'Something went wrong.');
            return data;
        });
    }

    var phpDriver = {
        me: function () { return call('me.php').then(function (d) { return d.user; }, function () { return null; }); },
        register: function (name, email, password) { return call('register.php', { name: name, email: email, password: password }); },
        login: function (email, password, remember) { return call('login.php', { email: email, password: password, remember: !!remember }); },
        logout: function () { return call('logout.php', {}).catch(function () {}); }
    };

    /* ───────────── DRIVER B: browser-only (GitHub Pages) ─────────────
       Demo login: accounts live in the visitor's own browser, so this is
       NOT real security. */
    var USERS_KEY = 'ka_users', SESSION_KEY = 'ka_session';

    function readJSON(store, key, fallback) {
        try { return JSON.parse(store.getItem(key)) || fallback; } catch (e) { return fallback; }
    }
    function getSession() {
        return readJSON(sessionStorage, SESSION_KEY, null) || readJSON(localStorage, SESSION_KEY, null);
    }
    async function sha(text) {
        if (window.crypto && crypto.subtle) {
            var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
            return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
        }
        var h = 5381;
        for (var i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
        return 'f' + (h >>> 0).toString(16);
    }

    var staticDriver = {
        me: function () { return Promise.resolve(getSession()); },

        register: async function (name, email, password) {
            email = (email || '').trim().toLowerCase(); name = (name || '').trim();
            if (!name || !email || !password) throw new Error('Please fill in all fields.');
            if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email.');
            if (password.length < 6) throw new Error('Password must be at least 6 characters.');
            var users = readJSON(localStorage, USERS_KEY, {});
            if (users[email]) throw new Error('An account with this email already exists.');
            var salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
            users[email] = { name: name, salt: salt, hash: await sha(salt + password) };
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            return staticDriver.login(email, password, true);
        },

        login: async function (email, password, remember) {
            email = (email || '').trim().toLowerCase();
            var u = readJSON(localStorage, USERS_KEY, {})[email];
            if (!u || (await sha(u.salt + password)) !== u.hash) throw new Error('Incorrect email or password.');
            var session = JSON.stringify({ email: email, name: u.name });
            sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY);
            (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, session);
            return { ok: true };
        },

        logout: function () {
            sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY);
            return Promise.resolve();
        }
    };

    /* ───────────── PUBLIC API ───────────── */
    var driver = STATIC_MODE ? staticDriver : phpDriver;
    var currentUser = null;

    window.Auth = {
        hasBackend: serverAvailable,
        call: call,
        user: function () { return currentUser; },
        isLoggedIn: function () { return !!currentUser; },
        register: function (n, e, p) { return driver.register(n, e, p); },
        login: function (e, p, r) { return driver.login(e, p, r); },
        logout: function () { return driver.logout().then(function () { location.href = 'login.html'; }); }
    };

    /* hide the page until we know who is visiting (no flash of content) */
    if (REQUIRE_LOGIN || onLoginPage) document.documentElement.style.visibility = 'hidden';

    /* If there is no PHP backend (e.g. the code was downloaded from GitHub
       into XAMPP without the api/ folder), switch to the browser-only login. */
    function probeServer() {
        if (!serverAvailable) return Promise.resolve();
        return fetch(API + 'me.php', { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function () {}, function () {
                serverAvailable = false;
                driver = staticDriver;
                window.Auth.hasBackend = false;
            });
    }

    probeServer().then(function () { return driver.me(); }).then(function (user) {
        currentUser = user;
        if (REQUIRE_LOGIN && !onLoginPage && !user) { location.replace('login.html'); return; }
        if (onLoginPage && user)                    { location.replace('index.html'); return; }
        document.documentElement.style.visibility = '';
        setupProfileMenu();
    });

    /* ───────────── PROFILE ICON DROPDOWN ───────────── */
    function menuItem(href, icon, label) {
        var a = document.createElement('a');
        a.href = href;
        a.setAttribute('role', 'menuitem');
        var i = document.createElement('i');
        i.className = 'fas ' + icon;
        a.appendChild(i);
        a.appendChild(document.createTextNode(' ' + label));
        return a;
    }

    function setupProfileMenu() {
        function build() {
            var icon   = document.querySelector('.profile_icon');
            var header = document.querySelector('.header');
            if (!icon || !header || onLoginPage) return;

            var menu = document.createElement('div');
            menu.className = 'profile_dropdown';
            menu.setAttribute('role', 'menu');

            if (currentUser) {
                var info = document.createElement('div');
                info.className = 'pd_info';
                var n = document.createElement('strong'); n.textContent = currentUser.name;
                var m = document.createElement('span');   m.textContent = currentUser.email;
                info.appendChild(n); info.appendChild(m);
                menu.appendChild(info);
                menu.appendChild(menuItem('contacts.html', 'fa-envelope', 'Contact me'));
                var out = menuItem('#', 'fa-right-from-bracket', 'Log out');
                out.classList.add('pd_logout');
                out.addEventListener('click', function (e) { e.preventDefault(); Auth.logout(); });
                menu.appendChild(out);
            } else {
                menu.appendChild(menuItem('login.html', 'fa-right-to-bracket', 'Log in / Sign up'));
            }

            var wrap = document.createElement('div');
            wrap.className = 'profile_wrap';
            icon.parentNode.insertBefore(wrap, icon);
            wrap.appendChild(icon);
            wrap.appendChild(menu);

            icon.setAttribute('aria-haspopup', 'true');
            icon.addEventListener('click', function (e) { e.preventDefault(); menu.classList.toggle('open'); });
            document.addEventListener('click', function (e) {
                if (!menu.contains(e.target) && !icon.contains(e.target)) menu.classList.remove('open');
            });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.classList.remove('open'); });
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
        else build();
    }
})();
