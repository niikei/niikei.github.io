(() => {
  const STORAGE_KEY = "theme";

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
    toggle.textContent = isDark ? "ライト" : "ダーク";
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
