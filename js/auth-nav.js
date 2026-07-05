/* ================================================================
   OPTIMA LABS — Navbar Google auth control
   Renders into <div id="navAuth"></div>:
     signed out -> "Sign in" pill with the Google logo
     signed in  -> avatar button + dropdown (name/email/Sign out)
   Shares the same Firebase Auth session as checkout.js.
   ================================================================ */
(function () {
  function googleG() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>' +
      '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
      '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>' +
      '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>';
  }

  function signIn() {
    if (!window.fbAuth) return;
    window.fbAuth.signInWithPopup(window.fbGoogle).catch(function () {
      if (window.showToast) window.showToast('Sign-in failed. Please try again.');
    });
  }

  function adminGear() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.2M12 18.8V21M4.6 7.2l1.6 1M17.8 15.8l1.6 1M3 12h2.2M18.8 12H21M4.6 16.8l1.6-1M17.8 8.2l1.6-1"/></svg>';
  }

  function render(user, isAdmin) {
    var el = document.getElementById('navAuth');
    if (!el) return;

    if (!user) {
      el.innerHTML = '<button class="nav-signin" id="navSignInBtn" type="button">' + googleG() + '<span>Sign in</span></button>';
      document.getElementById('navSignInBtn').addEventListener('click', signIn);
      return;
    }

    var avatar = user.photoURL
      ? '<img src="' + user.photoURL + '" alt="" referrerpolicy="no-referrer">'
      : '<span class="nav-avatar-ini">' + (user.displayName || user.email || 'U').charAt(0).toUpperCase() + '</span>';

    // Admin dashboard shortcut — only rendered for users with the admin claim.
    var adminLink = isAdmin
      ? '<a class="nav-admin" href="admin.html" title="Admin dashboard">' + adminGear() + '<span>Admin</span></a>'
      : '';

    el.innerHTML = adminLink +
      '<button class="nav-avatar" id="navAvatarBtn" type="button" aria-label="Account">' + avatar + '</button>' +
      '<div class="nav-menu" id="navMenu">' +
        '<div class="nav-menu-name">' + (user.displayName || 'Signed in') + '</div>' +
        '<div class="nav-menu-email">' + (user.email || '') + '</div>' +
        (isAdmin ? '<a class="nav-menu-admin" href="admin.html">Admin dashboard →</a>' : '') +
        '<button class="nav-menu-out" id="navSignOut" type="button">Sign out</button>' +
      '</div>';

    var btn = document.getElementById('navAvatarBtn');
    var menu = document.getElementById('navMenu');
    btn.addEventListener('click', function (e) { e.stopPropagation(); menu.classList.toggle('open'); });
    document.addEventListener('click', function () { menu.classList.remove('open'); });
    document.getElementById('navSignOut').addEventListener('click', function () {
      window.fbAuth.signOut().then(function () {
        if (window.showToast) window.showToast('Signed out.');
      });
    });
  }

  // Resolve the admin custom claim, then render (falls back to non-admin on error).
  function renderWithClaim(user) {
    if (!user) { render(null, false); return; }
    user.getIdTokenResult().then(function (tok) {
      render(user, !!(tok.claims && tok.claims.admin));
    }).catch(function () { render(user, false); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var el = document.getElementById('navAuth');
    if (!el) return;
    if (!window.fbAuth) { el.style.display = 'none'; return; } // Firebase not available: hide gracefully
    render(null, false);                                 // show "Sign in" instantly, no async gap
    window.fbAuth.onAuthStateChanged(renderWithClaim);   // upgrade to avatar (+ Admin if claim) once auth resolves
  });
})();
