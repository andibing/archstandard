// Reading Preferences — pill toolbar with icon buttons
(function() {
  var STORAGE_KEY = 'ads-reading-prefs';
  var defaults = { font: 'default', spacing: 'normal', motion: 'system', focus: 'off', overlay: 'none' };

  var overlayColors = {
    none: 'transparent', warm: '#fdf6e3', cool: '#e8f4fd',
    rose: '#fce4ec', mint: '#e8f5e9', forest: '#e0edd1', highcontrast: '#000'
  };

  var fontCycle = ['default', 'atkinson', 'opendyslexic'];
  var fontLabels = { default: 'Default font', atkinson: 'Atkinson Hyperlegible', opendyslexic: 'OpenDyslexic' };
  var spacingCycle = ['normal', 'relaxed', 'loose'];
  var spacingLabels = { normal: 'Normal spacing', relaxed: 'Relaxed spacing', loose: 'Loose spacing' };
  var overlayCycle = ['none', 'warm', 'cool', 'rose', 'mint', 'forest', 'highcontrast'];
  var overlayLabels = { none: 'No overlay', warm: 'Warm', cool: 'Cool', rose: 'Rose', mint: 'Mint', forest: 'Forest green', highcontrast: 'High contrast' };

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved ? Object.assign({}, defaults, saved) : Object.assign({}, defaults);
    } catch(e) { return Object.assign({}, defaults); }
  }

  function save(prefs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch(e) {}
  }

  function applyAll(prefs) {
    var el = document.documentElement;
    el.setAttribute('data-reading-font', prefs.font);
    el.setAttribute('data-reading-spacing', prefs.spacing);
    el.setAttribute('data-reading-motion', prefs.motion);
    el.setAttribute('data-reading-focus', prefs.focus);

    // Overlay
    var c = overlayColors[prefs.overlay] || 'transparent';
    if (prefs.overlay === 'none') {
      el.style.removeProperty('--ads-overlay-bg');
      el.removeAttribute('data-ads-overlay');
    } else if (prefs.overlay === 'highcontrast') {
      el.style.removeProperty('--ads-overlay-bg');
      el.setAttribute('data-ads-overlay', 'highcontrast');
    } else {
      el.style.setProperty('--ads-overlay-bg', c);
      el.setAttribute('data-ads-overlay', prefs.overlay);
    }

    save(prefs);
  }

  // Apply immediately
  var prefs = load();
  applyAll(prefs);

  function cycleValue(arr, current) {
    var i = arr.indexOf(current);
    return arr[(i + 1) % arr.length];
  }

  function createToolbar() {
    if (document.getElementById('ads-a11y-toolbar')) return;
    var rightGroup = document.querySelector('.right-group');
    if (!rightGroup) return;

    var toolbar = document.createElement('div');
    toolbar.id = 'ads-a11y-toolbar';
    toolbar.className = 'ads-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Reading preferences');

    // Font button (Aa)
    var fontBtn = makeBtn('ads-tb-font', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7V5h14v2"/><path d="M10 5v14"/><path d="M7 19h6"/><path d="M15 13v-1h6v1"/><path d="M18 12v7"/><path d="M16.5 19h3"/></svg>', fontLabels[prefs.font]);
    fontBtn.addEventListener('click', function() {
      prefs.font = cycleValue(fontCycle, prefs.font);
      applyAll(prefs);
      fontBtn.title = fontLabels[prefs.font];
      fontBtn.setAttribute('aria-label', fontLabels[prefs.font]);
      showToast(fontLabels[prefs.font]);
      updateActiveStates();
    });

    // Spacing button (↕)
    var spaceBtn = makeBtn('ads-tb-spacing', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8h18"/><path d="M3 16h18"/><path d="M3 12h18"/></svg>', spacingLabels[prefs.spacing]);
    spaceBtn.addEventListener('click', function() {
      prefs.spacing = cycleValue(spacingCycle, prefs.spacing);
      applyAll(prefs);
      spaceBtn.title = spacingLabels[prefs.spacing];
      spaceBtn.setAttribute('aria-label', spacingLabels[prefs.spacing]);
      showToast(spacingLabels[prefs.spacing]);
      updateActiveStates();
    });

    // Overlay button (◐)
    var overlayBtn = makeBtn('ads-tb-overlay', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20" fill="currentColor"/></svg>', 'Colour overlay: ' + overlayLabels[prefs.overlay]);
    overlayBtn.addEventListener('click', function() {
      prefs.overlay = cycleValue(overlayCycle, prefs.overlay);
      applyAll(prefs);
      overlayBtn.title = 'Colour overlay: ' + overlayLabels[prefs.overlay];
      overlayBtn.setAttribute('aria-label', 'Colour overlay: ' + overlayLabels[prefs.overlay]);
      showToast(overlayLabels[prefs.overlay]);
      updateActiveStates();
    });

    // Focus button (⊘)
    var focusBtn = makeBtn('ads-tb-focus', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M2 12h4"/><path d="M18 12h4"/></svg>', 'Focus mode');
    focusBtn.addEventListener('click', function() {
      prefs.focus = prefs.focus === 'on' ? 'off' : 'on';
      applyAll(prefs);
      showToast(prefs.focus === 'on' ? 'Focus mode on' : 'Focus mode off');
      updateActiveStates();
    });

    // Separator
    var sep = document.createElement('span');
    sep.className = 'ads-tb-sep';
    sep.setAttribute('aria-hidden', 'true');

    // Theme: Light
    var lightBtn = makeBtn('ads-tb-light', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>', 'Light mode');
    lightBtn.addEventListener('click', function() {
      setTheme('light');
      updateActiveStates();
    });

    // Theme: Dark
    var darkBtn = makeBtn('ads-tb-dark', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>', 'Dark mode');
    darkBtn.addEventListener('click', function() {
      setTheme('dark');
      updateActiveStates();
    });

    // Theme: Auto
    var autoBtn = makeBtn('ads-tb-auto', '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>', 'Auto (system)');
    autoBtn.addEventListener('click', function() {
      setTheme('auto');
      updateActiveStates();
    });

    toolbar.appendChild(fontBtn);
    toolbar.appendChild(spaceBtn);
    toolbar.appendChild(overlayBtn);
    toolbar.appendChild(focusBtn);
    toolbar.appendChild(sep);
    toolbar.appendChild(lightBtn);
    toolbar.appendChild(darkBtn);
    toolbar.appendChild(autoBtn);

    // Hide Starlight's default theme select
    var starlightTheme = rightGroup.querySelector('starlight-theme-select');
    if (starlightTheme) starlightTheme.style.display = 'none';

    // Insert at start of right group
    rightGroup.insertBefore(toolbar, rightGroup.firstChild);

    function updateActiveStates() {
      fontBtn.classList.toggle('ads-tb-active', prefs.font !== 'default');
      spaceBtn.classList.toggle('ads-tb-active', prefs.spacing !== 'normal');
      overlayBtn.classList.toggle('ads-tb-active', prefs.overlay !== 'none');
      focusBtn.classList.toggle('ads-tb-active', prefs.focus === 'on');

      var currentTheme = getTheme();
      lightBtn.classList.toggle('ads-tb-active', currentTheme === 'light');
      darkBtn.classList.toggle('ads-tb-active', currentTheme === 'dark');
      autoBtn.classList.toggle('ads-tb-active', currentTheme === 'auto');
    }

    updateActiveStates();
  }

  // Theme helpers — interact with Starlight's theme system
  function getTheme() {
    try { return localStorage.getItem('starlight-theme') || 'auto'; } catch(e) { return 'auto'; }
  }

  function setTheme(t) {
    try { localStorage.setItem('starlight-theme', t === 'auto' ? '' : t); } catch(e) {}
    var resolved = t === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
    document.documentElement.dataset.theme = resolved;
    // Update Starlight's hidden select if present
    var sel = document.querySelector('starlight-theme-select select');
    if (sel) sel.value = t;
  }

  // Toast notification
  function showToast(msg) {
    var existing = document.getElementById('ads-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'ads-toast';
    toast.className = 'ads-toast';
    toast.textContent = msg;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);

    setTimeout(function() { toast.classList.add('ads-toast-visible'); }, 10);
    setTimeout(function() {
      toast.classList.remove('ads-toast-visible');
      setTimeout(function() { toast.remove(); }, 300);
    }, 1500);
  }

  function makeBtn(id, svg, label) {
    var btn = document.createElement('button');
    btn.id = id;
    btn.className = 'ads-tb-btn';
    btn.innerHTML = svg;
    btn.title = label;
    btn.setAttribute('aria-label', label);
    return btn;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToolbar);
  } else {
    createToolbar();
  }
})();
