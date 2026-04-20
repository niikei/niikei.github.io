// DOM rendering and manipulation
const PostsRender = (() => {
  function renderPostList(
    container,
    posts,
    { limit = null, emptyMessage = "記事がありません。" } = {},
  ) {
    const slice = limit ? posts.slice(0, limit) : posts;
    if (slice.length === 0) {
      container.innerHTML = `<p class="muted">${PostsUtils.escapeHtml(emptyMessage)}</p>`;
      return;
    }

    container.innerHTML = slice
      .map((post) => {
        const title = PostsUtils.escapeHtml(post.title);
        const date = PostsUtils.escapeHtml(PostsUtils.formatDate(post.date));
        const excerpt =
          post.excerpt ?
            `<div class="tile__meta">${PostsUtils.escapeHtml(post.excerpt)}</div>`
          : "";
        return `
          <div class="post-item">
            <div>
              <a href="post.html?post=${encodeURIComponent(post.slug)}">${title}</a>
              ${excerpt}
            </div>
            <div class="post-item__date">${date}</div>
          </div>
        `.trim();
      })
      .join("\n");
  }

  function getTagContainers() {
    return Array.from(document.querySelectorAll("[data-posts-tag]"));
  }

  function parseTagsValue(value) {
    if (!value) return [];
    return String(value)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function filterByTags(posts, tags) {
    if (!Array.isArray(posts) || tags.length === 0) return [];
    return posts.filter((post) => {
      const postTags = Array.isArray(post.tags) ? post.tags : [];
      return tags.some((tag) => postTags.includes(tag));
    });
  }

  async function renderSinglePost({ index, slug, titleEl, dateEl, contentEl }) {
    const hit = index.posts.find((p) => p.slug === slug) || null;
    if (!hit) throw new Error("記事が見つかりませんでした。");

    const raw = await PostsData.loadMarkdown(hit.file);
    const { meta, body } = PostsData.parseFrontMatter(raw);
    const title = meta.title || hit.title;
    const date = meta.date || hit.date;

    if (titleEl) titleEl.textContent = title;
    if (dateEl) dateEl.textContent = PostsUtils.formatDate(date);
    if (contentEl) contentEl.innerHTML = PostsMarkdown.renderMarkdown(body);

    document.title = `${title} | niikei`;
  }

  return {
    renderPostList,
    getTagContainers,
    parseTagsValue,
    filterByTags,
    renderSinglePost,
  };
})();
