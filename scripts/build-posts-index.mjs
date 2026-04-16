import { readdir, readFile, writeFile } from "node:fs/promises";

const POSTS_DIR = new URL("../posts/", import.meta.url);
const INDEX_PATH = new URL("../posts/index.json", import.meta.url);

function parseFrontMatter(markdown) {
  const normalized = markdown.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) {
    return { meta: {}, body: normalized.trimStart() };
  }

  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    return { meta: {}, body: normalized.trimStart() };
  }

  const rawMeta = normalized.slice(4, end).trim();
  const body = normalized.slice(end + "\n---\n".length).trimStart();
  const meta = parseSimpleYaml(rawMeta);
  return { meta, body };
}

function parseSimpleYaml(raw) {
  const meta = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) continue;

    const [, key, valueRaw] = match;
    const value = valueRaw.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1").trim();
    meta[key] = value;
  }
  return meta;
}

function stripMarkdown(text) {
  return (
    text
      .replaceAll("\r\n", "\n")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function makeExcerpt(body, maxLen = 160) {
  const paragraphs = body
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return "";

  const plain = stripMarkdown(paragraphs[0]);
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen - 1)}…`;
}

function parseDateValue(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

async function buildIndex() {
  const entries = await readdir(POSTS_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const posts = [];
  for (const file of files) {
    const raw = await readFile(new URL(file, POSTS_DIR), "utf8");
    const { meta, body } = parseFrontMatter(raw);

    const title = meta.title || file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
    const dateString = meta.date || file.slice(0, 10);
    const date = parseDateValue(dateString);

    posts.push({
      slug: file.replace(/\.md$/, ""),
      title,
      date: date ? date.toISOString().slice(0, 10) : dateString,
      excerpt: meta.excerpt || makeExcerpt(body),
      file,
    });
  }

  posts.sort((a, b) => {
    const aDate = parseDateValue(a.date) || new Date(0);
    const bDate = parseDateValue(b.date) || new Date(0);
    if (bDate.getTime() !== aDate.getTime()) return bDate - aDate;
    return a.slug.localeCompare(b.slug);
  });

  await writeFile(INDEX_PATH, `${JSON.stringify({ posts }, null, 2)}\n`, "utf8");
}

await buildIndex();
