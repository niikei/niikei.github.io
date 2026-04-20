(() => {
  const DATA_URL = "assets/data/music-videos.json";

  function isSafeEmbedUrl(url) {
    const value = String(url || "").trim();
    return /^https:\/\/(www\.)?youtube\.com\/embed\//i.test(value);
  }

  function renderEmpty(container, message) {
    container.innerHTML = `<p class="muted">${PostsUtils.escapeHtml(message)}</p>`;
  }

  function renderVideos(container, videos) {
    if (!Array.isArray(videos) || videos.length === 0) {
      renderEmpty(
        container,
        container.dataset.videosEmpty || "音楽関連の動画はまだありません。",
      );
      return;
    }

    const items = videos
      .filter((video) => isSafeEmbedUrl(video.embedUrl))
      .map((video) => {
        const title = PostsUtils.escapeHtml(video.title || "動画");
        const embedUrl = PostsUtils.escapeHtml(video.embedUrl);

        return `
          <article class="video-item">
            <h3 class="video-item__title">${title}</h3>
            <div class="video-item__embed">
              <iframe
                src="${embedUrl}"
                title="${title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </article>
        `.trim();
      });

    if (items.length === 0) {
      renderEmpty(
        container,
        container.dataset.videosEmpty || "音楽関連の動画はまだありません。",
      );
      return;
    }

    container.innerHTML = items.join("\n");
  }

  async function bootMusicVideos() {
    const container = document.getElementById("music-videos");
    if (!container) return;

    try {
      const response = await fetch(DATA_URL, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`Failed to load ${DATA_URL}: ${response.status}`);
      }

      const data = await response.json();
      renderVideos(container, data.videos);
    } catch {
      renderEmpty(
        container,
        container.dataset.videosEmpty || "音楽関連の動画はまだありません。",
      );
    }
  }

  document.addEventListener("DOMContentLoaded", bootMusicVideos);
})();
