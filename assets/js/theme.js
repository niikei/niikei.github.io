(() => {
  const STORAGE_KEY = "theme";
  const SWIPE_ORDER = [
    { page: "home", href: "index.html" },
    { page: "booklog", href: "booklog.html" },
    { page: "music", href: "music.html" },
    { page: "posts", href: "posts.html" },
  ];

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

  function getPageName() {
    return document.body?.dataset.page || "";
  }

  function getSwipeTarget(deltaX) {
    const page = getPageName();
    const currentIndex = SWIPE_ORDER.findIndex((item) => item.page === page);
    if (currentIndex === -1) return null;

    if (deltaX < 0 && currentIndex < SWIPE_ORDER.length - 1) {
      return SWIPE_ORDER[currentIndex + 1].href;
    }

    if (deltaX > 0 && currentIndex > 0) {
      return SWIPE_ORDER[currentIndex - 1].href;
    }

    return null;
  }

  function shouldIgnoreSwipeStart(target) {
    if (!(target instanceof Element)) return false;
    return Boolean(
      target.closest(
        "a, button, input, select, textarea, label, #site-mobile-menu",
      ),
    );
  }

  function setupSwipeNavigation() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 680px)").matches)
      return;

    if (!SWIPE_ORDER.some((item) => item.page === getPageName())) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function navigateWithSwipeAnimation(target, direction) {
      const reduceMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        window.location.href = target;
        return;
      }

      const body = document.body;
      body.classList.remove(
        "is-swipe-navigating-next",
        "is-swipe-navigating-prev",
      );

      window.requestAnimationFrame(() => {
        body.classList.add(
          "is-swipe-navigating",
          direction === "next" ?
            "is-swipe-navigating-next"
          : "is-swipe-navigating-prev",
        );

        window.setTimeout(() => {
          window.location.href = target;
        }, 220);
      });
    }

    document.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) return;
        if (shouldIgnoreSwipeStart(event.target)) return;

        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      },
      { passive: true },
    );

    document.addEventListener(
      "touchend",
      (event) => {
        if (!tracking) return;
        tracking = false;

        const touch = event.changedTouches[0];
        if (!touch) return;

        const deltaX = touch.clientX - startX;
        const deltaY = touch.clientY - startY;

        if (Math.abs(deltaX) < 60 || Math.abs(deltaX) <= Math.abs(deltaY))
          return;

        const target = getSwipeTarget(deltaX);
        if (!target) return;

        navigateWithSwipeAnimation(target, deltaX < 0 ? "next" : "prev");
      },
      { passive: true },
    );
  }

  applyTheme(getInitialTheme());

  document.addEventListener("DOMContentLoaded", () => {
    renderLucideIcons();
    const toggles = document.querySelectorAll("[data-theme-toggle]");
    for (const toggle of toggles) {
      toggle.addEventListener("click", toggleTheme);
    }

    setupSwipeNavigation();

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
