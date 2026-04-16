(() => {
  const INDEX_URL = "posts/index.json";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function sanitizeUrl(url) {
    const trimmed = String(url).trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("data:")) return "#";
    return trimmed;
  }

  function renderInline(text) {
    const escaped = escapeHtml(text);

    const codeSpans = [];
    const withPlaceholders = escaped.replace(/`([^`]+)`/g, (_, code) => {
      const placeholder = `\u0000CODE${codeSpans.length}\u0000`;
      codeSpans.push(`<code>${code}</code>`);
      return placeholder;
    });

    const withImages = withPlaceholders.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
      const safeAlt = alt.trim();
      const safeUrl = sanitizeUrl(url);
      if (safeUrl === "#") return "";
      return `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy">`;
    });

    const withLinks = withImages.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const safeLabel = label.trim();
      const safeUrl = sanitizeUrl(url);
      const isExternal = /^https?:\/\//i.test(safeUrl);
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${safeUrl}"${attrs}>${safeLabel}</a>`;
    });

    const withStrong = withLinks.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    const withEm = withStrong.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    return withEm.replace(/\u0000CODE(\d+)\u0000/g, (_, index) => codeSpans[Number(index)] ?? "");
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown).replaceAll("\r\n", "\n").split("\n");

    const html = [];
    let paragraph = [];
    let list = null;
    let listItems = [];
    let inCodeBlock = false;
    let codeFenceLang = "";
    let codeLines = [];
    let blockquote = [];

    function flushParagraph() {
      if (paragraph.length === 0) return;
      html.push(`<p>${renderInline(paragraph.join(" ").trim())}</p>`);
      paragraph = [];
    }

    function flushList() {
      if (!list || listItems.length === 0) {
        list = null;
        listItems = [];
        return;
      }
      html.push(`<${list}>${listItems.join("")}</${list}>`);
      list = null;
      listItems = [];
    }

    function flushCodeBlock() {
      if (!inCodeBlock) return;
      const langClass = codeFenceLang ? ` class="language-${escapeHtml(codeFenceLang)}"` : "";
      html.push(`<pre><code${langClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      inCodeBlock = false;
      codeFenceLang = "";
      codeLines = [];
    }

    function flushBlockquote() {
      if (blockquote.length === 0) return;
      html.push(`<blockquote><p>${renderInline(blockquote.join(" ").trim())}</p></blockquote>`);
      blockquote = [];
    }

    for (const rawLine of lines) {
      const line = rawLine.replace(/\s+$/, "");

      const fenceMatch = line.match(/^```(\w+)?\s*$/);
      if (fenceMatch) {
        flushParagraph();
        flushList();
        flushBlockquote();

        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          inCodeBlock = true;
          codeFenceLang = fenceMatch[1] || "";
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(rawLine);
        continue;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        flushBlockquote();
        continue;
      }

      if (line.trim() === "---") {
        flushParagraph();
        flushList();
        flushBlockquote();
        html.push("<hr>");
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushList();
        flushBlockquote();

        const level = headingMatch[1].length;
        html.push(`<h${level}>${renderInline(headingMatch[2].trim())}</h${level}>`);
        continue;
      }

      const blockquoteMatch = line.match(/^>\s?(.*)$/);
      if (blockquoteMatch) {
        flushParagraph();
        flushList();
        blockquote.push(blockquoteMatch[1]);
        continue;
      }

      const olMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
      if (olMatch) {
        flushParagraph();
        flushBlockquote();

        if (list !== "ol") {
          flushList();
          list = "ol";
        }
        listItems.push(`<li>${renderInline(olMatch[2].trim())}</li>`);
        continue;
      }

      const ulMatch = line.match(/^\s*[-*]\s+(.+)$/);
      if (ulMatch) {
        flushParagraph();
        flushBlockquote();

        if (list !== "ul") {
          flushList();
          list = "ul";
        }
        listItems.push(`<li>${renderInline(ulMatch[1].trim())}</li>`);
        continue;
      }

      paragraph.push(line.trim());
    }

    flushParagraph();
    flushList();
    flushBlockquote();

    return html.join("\n");
  }

  function parseFrontMatter(markdown) {
    const normalized = String(markdown).replaceAll("\r\n", "\n");
    if (!normalized.startsWith("---\n")) return { meta: {}, body: normalized.trimStart() };

    const end = normalized.indexOf("\n---\n", 4);
    if (end === -1) return { meta: {}, body: normalized.trimStart() };

    const raw = normalized.slice(4, end).trim();
    const body = normalized.slice(end + "\n---\n".length).trimStart();

    const meta = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = trimmed.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (!match) continue;

      const [, key, valueRaw] = match;
      meta[key] = valueRaw.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1").trim();
    }

    return { meta, body };
  }

  async function loadIndex() {
    const response = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load ${INDEX_URL}: ${response.status}`);
    return response.json();
  }

  async function loadMarkdown(file) {
    const response = await fetch(`posts/${file}`, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Failed to load post: ${response.status}`);
    return response.text();
  }

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function renderPostList(container, posts, { limit = null, emptyMessage = "記事がありません。" } = {}) {
    const slice = limit ? posts.slice(0, limit) : posts;
    if (slice.length === 0) {
      container.innerHTML = `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
      return;
    }

    container.innerHTML = slice
      .map((post) => {
        const title = escapeHtml(post.title);
        const date = escapeHtml(formatDate(post.date));
        const excerpt = post.excerpt ? `<div class="tile__meta">${escapeHtml(post.excerpt)}</div>` : "";
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

    const raw = await loadMarkdown(hit.file);
    const { meta, body } = parseFrontMatter(raw);
    const title = meta.title || hit.title;
    const date = meta.date || hit.date;

    if (titleEl) titleEl.textContent = title;
    if (dateEl) dateEl.textContent = formatDate(date);
    if (contentEl) contentEl.innerHTML = renderMarkdown(body);

    document.title = `${title} | niikei`;
  }

  async function boot() {
    const latest = document.getElementById("latest-posts");
    const all = document.getElementById("all-posts");
    const postTitle = document.getElementById("post-title");
    const postDate = document.getElementById("post-date");
    const postContent = document.getElementById("post-content");
    const tagContainers = getTagContainers();

    if (!latest && !all && !postContent && tagContainers.length === 0) return;

    try {
      const index = await loadIndex();

      if (latest) renderPostList(latest, index.posts, { limit: 5 });
      if (all) renderPostList(all, index.posts);

      for (const container of tagContainers) {
        const tags = parseTagsValue(container.dataset.postsTag);
        const emptyMessage = container.dataset.postsEmpty || "記事がありません。";
        const filtered = filterByTags(index.posts, tags);
        renderPostList(container, filtered, { emptyMessage });
      }

      if (postContent) {
        const slug = new URLSearchParams(window.location.search).get("post");
        if (!slug) throw new Error("記事の指定がありません。");
        await renderSinglePost({
          index,
          slug,
          titleEl: postTitle,
          dateEl: postDate,
          contentEl: postContent,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const target = postContent || all || latest;
      if (target) target.innerHTML = `<p>${escapeHtml(message)}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
