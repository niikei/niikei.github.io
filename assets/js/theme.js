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
    return (
        window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
      ) ?
        "dark"
      : "light";
  }

  function getInitialTheme() {
    const saved = safeGetItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return getSystemTheme();
  }

  function renderLucideIcons() {
    if (!window.lucide || typeof window.lucide.createIcons !== "function")
      return false;
    window.lucide.createIcons({
      attrs: {
        "stroke-width": 1.8,
      },
    });
    return true;
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;

    const isDark = theme === "dark";
    const nextLabel =
      isDark ? "ライトモードに切り替え" : "ダークモードに切り替え";
    const iconName = isDark ? "sun" : "moon";
    const toggles = document.querySelectorAll("[data-theme-toggle]");
    for (const toggle of toggles) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", nextLabel);
      toggle.setAttribute("title", nextLabel);
      toggle.innerHTML = `<i data-lucide="${iconName}" class="icon" aria-hidden="true"></i>`;
    }
    if (!renderLucideIcons()) {
      for (const toggle of toggles) {
        toggle.textContent = isDark ? "☀" : "🌙";
      }
    }
  }

  function toggleTheme() {
    const current =
      document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    safeSetItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  applyTheme(getInitialTheme());

  document.addEventListener("DOMContentLoaded", () => {
    renderLucideIcons();
    const toggles = document.querySelectorAll("[data-theme-toggle]");
    for (const toggle of toggles) {
      toggle.addEventListener("click", toggleTheme);
    }

    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("site-mobile-menu");
    if (menuToggle && mobileMenu) {
      const setMenuState = (open) => {
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute(
          "aria-label",
          open ? "メニューを閉じる" : "メニューを開く",
        );
        menuToggle.setAttribute(
          "title",
          open ? "メニューを閉じる" : "メニューを開く",
        );
        mobileMenu.hidden = !open;
      };

      setMenuState(false);

      menuToggle.addEventListener("click", () => {
        setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
      });

      mobileMenu.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (target && target.closest("a, button")) {
          setMenuState(false);
        }
      });
    }

    const media =
      window.matchMedia ?
        window.matchMedia("(prefers-color-scheme: dark)")
      : null;
    if (!media) return;

    media.addEventListener("change", () => {
      const saved = safeGetItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return;
      applyTheme(getSystemTheme());
    });
  });
})();
