// Data loading and parsing
const PostsData = (() => {
  const INDEX_URL = "posts/index.json";

  function parseFrontMatter(markdown) {
    const normalized = String(markdown).replaceAll("\r\n", "\n");
    if (!normalized.startsWith("---\n"))
      return { meta: {}, body: normalized.trimStart() };

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
      meta[key] = valueRaw
        .replace(/^"(.*)"$/, "$1")
        .replace(/^'(.*)'$/, "$1")
        .trim();
    }

    return { meta, body };
  }

  async function loadIndex() {
    const response = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!response.ok)
      throw new Error(`Failed to load ${INDEX_URL}: ${response.status}`);
    return response.json();
  }

  async function loadMarkdown(file) {
    const response = await fetch(`posts/${file}`, { cache: "no-cache" });
    if (!response.ok)
      throw new Error(`Failed to load post: ${response.status}`);
    return response.text();
  }

  return {
    parseFrontMatter,
    loadIndex,
    loadMarkdown,
  };
})();
