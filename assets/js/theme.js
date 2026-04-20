(() => {
  const STORAGE_KEY = "theme";
  const ICONS = {
    sun: `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
        <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3"
          fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>
    `.trim(),
    moon: `
      <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.6 3.1a8.8 8.8 0 1 0 6.3 14.9 8.1 8.1 0 0 1-6.3 2.6A8.8 8.8 0 0 1 14.6 3.1z"
          fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `.trim(),
  };

  function safeGetItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function getInitialTheme() {
    const saved = safeGetItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return getSystemTheme();
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;

    const isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    const nextLabel = isDark ? "ライトモードに切り替え" : "ダークモードに切り替え";
    toggle.setAttribute("aria-label", nextLabel);
    toggle.setAttribute("title", nextLabel);
    toggle.innerHTML = isDark ? ICONS.sun : ICONS.moon;
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    safeSetItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  applyTheme(getInitialTheme());

  document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.addEventListener("click", toggleTheme);

    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (!media) return;

    media.addEventListener("change", () => {
      const saved = safeGetItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return;
      applyTheme(getSystemTheme());
    });
  });
})();
