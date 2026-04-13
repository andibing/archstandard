// Accessibility: add scope="col" to table headers for screen readers (WCAG 1.3.1)
(function() {
  function addTableScope() {
    document.querySelectorAll('th').forEach(function(th) {
      if (!th.getAttribute('scope')) {
        th.setAttribute('scope', 'col');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addTableScope);
  } else {
    addTableScope();
  }
})();

// Unified Theme + Visual Stress control
// Replaces both Starlight's theme toggle and the overlay dropdown
(function() {
  var tints = {
    cream: '#fdf6e3',
    blue: '#e8f4fd',
    green: '#e8f5e9',
    pink: '#fce4ec',
    peach: '#fff3e0'
  };

  function apply(v) {
    // Remove any existing overlay
    document.documentElement.style.removeProperty('--ads-overlay-bg');
    document.documentElement.removeAttribute('data-ads-overlay');

    if (v === 'auto') {
      // Follow OS/browser preference
      var osPref = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      document.documentElement.dataset.theme = osPref;
      StarlightThemeProvider.updatePickers('auto');
    } else if (v === 'dark') {
      // Use Starlight's dark mode
      document.documentElement.dataset.theme = 'dark';
      StarlightThemeProvider.updatePickers('dark');
    } else if (tints[v]) {
      // Light mode with tint
      document.documentElement.dataset.theme = 'light';
      StarlightThemeProvider.updatePickers('light');
      document.documentElement.style.setProperty('--ads-overlay-bg', tints[v]);
      document.documentElement.setAttribute('data-ads-overlay', v);
    } else {
      // Plain light
      document.documentElement.dataset.theme = 'light';
      StarlightThemeProvider.updatePickers('light');
    }

    try { localStorage.setItem('ads-theme', v); } catch(e) {}
  }

  var saved = 'auto';
  try { saved = localStorage.getItem('ads-theme') || 'auto'; } catch(e) {}
  apply(saved);

  // Listen for OS theme changes when in Auto mode
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', function() {
    var current = 'auto';
    try { current = localStorage.getItem('ads-theme') || 'auto'; } catch(e) {}
    if (current === 'auto') apply('auto');
  });

  function inject() {
    // Find and replace Starlight's theme select
    var themeSelect = document.querySelector('starlight-theme-select');
    if (!themeSelect || document.getElementById('ads-theme-select')) return;

    var label = document.createElement('label');
    label.style.cssText = 'display:inline-flex;align-items:center;gap:0.375rem;color:var(--sl-color-gray-1);cursor:pointer;';

    // Monitor icon
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'currentColor');
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = '<path d="M21 14h-1V7a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v7H3a1 1 0 0 0-1 1v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a1 1 0 0 0-1-1ZM6 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7H6V7Zm14 10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1h16v1Z"/>';

    var sel = document.createElement('select');
    sel.id = 'ads-theme-select';
    sel.autocomplete = 'off';
    sel.style.cssText = 'border:0;padding:0.125rem 0.25rem;background:transparent;color:inherit;cursor:pointer;font-size:var(--sl-text-xs);font-family:inherit;';

    var options = [
      ['auto', 'Auto'],
      ['light', 'Light'],
      ['dark', 'Dark'],
      ['cream', 'Cream'],
      ['blue', 'Blue'],
      ['green', 'Green'],
      ['pink', 'Pink'],
      ['peach', 'Peach']
    ];

    options.forEach(function(opt) {
      var o = document.createElement('option');
      o.value = opt[0];
      o.textContent = opt[1];
      if (opt[0] === saved) o.selected = true;
      sel.appendChild(o);
    });

    sel.addEventListener('change', function(e) { apply(e.target.value); });

    label.appendChild(icon);
    label.appendChild(sel);

    // Replace Starlight's theme select
    themeSelect.replaceWith(label);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
