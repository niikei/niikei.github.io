// Markdown rendering engine
const PostsMarkdown = (() => {
  const TRUSTED_IFRAME_ORIGINS = [
    /^https:\/\/www\.youtube\.com\//i,
    /^https:\/\/youtube\.com\//i,
    /^https:\/\/youtu\.be\//i,
    /^https:\/\/player\.vimeo\.com\//i,
  ];

  function hasRichRenderer() {
    return typeof window !== "undefined" && window.marked && window.DOMPurify;
  }

  function sanitizeRichHtml(html) {
    const safe = window.DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_TAGS: ["iframe"],
      ADD_ATTR: [
        "allow",
        "allowfullscreen",
        "frameborder",
        "loading",
        "referrerpolicy",
        "title",
      ],
    });

    const template = document.createElement("template");
    template.innerHTML = safe;

    for (const link of template.content.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href") || "";
      const isExternal = /^https?:\/\//i.test(href);
      if (isExternal) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    }

    for (const iframe of template.content.querySelectorAll("iframe")) {
      const src = (iframe.getAttribute("src") || "").trim();
      const isTrusted = TRUSTED_IFRAME_ORIGINS.some((re) => re.test(src));
      if (!isTrusted) {
        iframe.remove();
        continue;
      }

      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    }

    return template.innerHTML;
  }

  function renderWithMarked(markdown) {
    window.marked.setOptions({
      gfm: true,
      breaks: false,
      headerIds: true,
      mangle: false,
    });

    const rawHtml = window.marked.parse(String(markdown));
    return sanitizeRichHtml(rawHtml);
  }

  function fallbackRenderInline(text) {
    const escaped = PostsUtils.escapeHtml(text);

    const codeSpans = [];
    const withPlaceholders = escaped.replace(/`([^`]+)`/g, (_, code) => {
      const placeholder = `\u0000CODE${codeSpans.length}\u0000`;
      codeSpans.push(`<code>${code}</code>`);
      return placeholder;
    });

    const withImages = withPlaceholders.replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_, alt, url) => {
        const safeAlt = alt.trim();
        const safeUrl = PostsUtils.sanitizeUrl(url);
        if (safeUrl === "#") return "";
        return `<img src="${safeUrl}" alt="${safeAlt}" loading="lazy">`;
      },
    );

    const withLinks = withImages.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_, label, url) => {
        const safeLabel = label.trim();
        const safeUrl = PostsUtils.sanitizeUrl(url);
        const isExternal = /^https?:\/\//i.test(safeUrl);
        const attrs =
          isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${safeUrl}"${attrs}>${safeLabel}</a>`;
      },
    );

    const withStrong = withLinks.replace(
      /\*\*([^*]+)\*\*/g,
      "<strong>$1</strong>",
    );
    const withEm = withStrong.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    return withEm.replace(
      /\u0000CODE(\d+)\u0000/g,
      (_, index) => codeSpans[Number(index)] ?? "",
    );
  }

  function fallbackRenderMarkdown(markdown) {
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
      html.push(`<p>${fallbackRenderInline(paragraph.join(" ").trim())}</p>`);
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
      const langClass =
        codeFenceLang ?
          ` class="language-${PostsUtils.escapeHtml(codeFenceLang)}"`
        : "";
      html.push(
        `<pre><code${langClass}>${PostsUtils.escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      inCodeBlock = false;
      codeFenceLang = "";
      codeLines = [];
    }

    function flushBlockquote() {
      if (blockquote.length === 0) return;
      html.push(
        `<blockquote><p>${fallbackRenderInline(blockquote.join(" ").trim())}</p></blockquote>`,
      );
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
        html.push(
          `<h${level}>${fallbackRenderInline(headingMatch[2].trim())}</h${level}>`,
        );
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
        listItems.push(`<li>${fallbackRenderInline(olMatch[2].trim())}</li>`);
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
        listItems.push(`<li>${fallbackRenderInline(ulMatch[1].trim())}</li>`);
        continue;
      }

      paragraph.push(line.trim());
    }

    flushParagraph();
    flushList();
    flushBlockquote();

    return html.join("\n");
  }

  function renderMarkdown(markdown) {
    if (hasRichRenderer()) return renderWithMarked(markdown);
    return fallbackRenderMarkdown(markdown);
  }

  return {
    renderInline: fallbackRenderInline,
    renderMarkdown,
  };
})();
