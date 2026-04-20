(() => {
  const NAV_ITEMS = [
    {
      href: "index.html",
      label: "ホーム",
      page: "home",
      icon: "house",
      iconLink: true,
    },
    { href: "booklog.html", label: "本棚", page: "booklog" },
    { href: "music.html", label: "音楽", page: "music" },
    { href: "posts.html", label: "記事", page: "posts" },
  ];

  const SOCIAL_LINKS = [
    {
      href: "https://github.com/niikei/",
      label: "GitHub",
      icon: "https://cdn.simpleicons.org/github",
    },
    {
      href: "https://www.instagram.com/n11_ke1/",
      label: "Instagram",
      icon: "https://cdn.simpleicons.org/instagram",
    },
    {
      href: "https://zenn.dev/niikei/",
      label: "Zenn",
      icon: "https://cdn.simpleicons.org/zenn",
    },
  ];

  function renderHeader(currentPage) {
    const nav = NAV_ITEMS.map((item) => {
      const currentAttr =
        item.page === currentPage ? ' aria-current="page"' : "";
      if (item.iconLink) {
        return `
          <a class="icon-link" href="${item.href}"${currentAttr} aria-label="${item.label}" title="${item.label}">
            <i data-lucide="${item.icon}" class="icon" aria-hidden="true"></i>
          </a>
        `.trim();
      }

      return `<a href="${item.href}"${currentAttr}>${item.label}</a>`;
    }).join("\n");

    const social = SOCIAL_LINKS.map((item) =>
      `
      <a href="${item.href}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}">
        <img src="${item.icon}" alt="${item.label}">
      </a>
    `.trim(),
    ).join("\n");

    return `
      <header class="site-header">
        <div class="container site-header__inner">
          <a class="brand" href="index.html">
            <img class="brand__avatar" src="assets/images/niikei_personal_icon.png" alt="niikei">
            <span class="brand__name">niikei</span>
          </a>

          <button
            id="menu-toggle"
            class="button button--ghost icon-button site-header__menu-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="site-mobile-menu"
            aria-label="メニューを開く"
            title="メニューを開く"
          >
            <i data-lucide="menu" class="icon" aria-hidden="true"></i>
          </button>

          <nav class="nav" aria-label="メイン">
            ${nav}
          </nav>

          <div class="nav__actions">
            <button data-theme-toggle class="button button--ghost icon-button" type="button" aria-pressed="false" aria-label="テーマ切り替え" title="テーマ切り替え">
              <i data-lucide="moon" class="icon" aria-hidden="true"></i>
            </button>
            <div class="social" aria-label="外部リンク">
              ${social}
            </div>
          </div>
        </div>

        <div id="site-mobile-menu" class="site-header__mobile-menu" hidden>
          <nav class="nav site-header__mobile-nav" aria-label="メイン">
            ${nav}
          </nav>

          <div class="nav__actions site-header__mobile-actions">
            <button data-theme-toggle class="button button--ghost icon-button" type="button" aria-pressed="false" aria-label="テーマ切り替え" title="テーマ切り替え">
              <i data-lucide="moon" class="icon" aria-hidden="true"></i>
            </button>
            <div class="social" aria-label="外部リンク">
              ${social}
            </div>
          </div>
        </div>
      </header>
    `.trim();
  }

  function renderFooter() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div>&copy; ${new Date().getFullYear()} niikei</div>
        </div>
      </footer>
    `.trim();
  }

  function mount(selector, html) {
    const target = document.querySelector(selector);
    if (!target) return;
    target.outerHTML = html;
  }

  function boot() {
    const currentPage = document.body?.dataset.page || "";
    mount("[data-site-header]", renderHeader(currentPage));
    mount("[data-site-footer]", renderFooter());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
