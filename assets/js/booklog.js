document.addEventListener("DOMContentLoaded", () => {
  const categorySelect = document.getElementById("category");
  const statusSelect = document.getElementById("status");
  const countSelect = document.getElementById("count");
  const bookshelf = document.getElementById("bookshelf");
  const status = document.getElementById("bookshelf-status");

  if (!(categorySelect instanceof HTMLSelectElement)) return;
  if (!(statusSelect instanceof HTMLSelectElement)) return;
  if (!(bookshelf instanceof HTMLElement)) return;

  const USER = "niikei";
  const SCRIPT_ID = "booklog-jsonp";

  let requestCounter = 0;

  function setBusy(isBusy) {
    bookshelf.setAttribute("aria-busy", isBusy ? "true" : "false");
  }

  function setStatusMessage(message) {
    if (!status) return;
    status.textContent = message;
  }

  function safeUrl(url) {
    const trimmed = String(url || "").trim();
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("javascript:") || lower.startsWith("data:")) return null;
    return trimmed;
  }

  function normalizeImageUrl(url) {
    const safe = safeUrl(url);
    if (!safe) return null;
    return safe.replace(/^http:\/\//i, "https://");
  }

  function clearBookshelf(message = "") {
    bookshelf.innerHTML = "";
    if (!message) return;
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = message;
    bookshelf.appendChild(p);
  }

  function renderBooks(books) {
    bookshelf.innerHTML = "";

    const fragment = document.createDocumentFragment();
    for (const book of books) {
      const href = safeUrl(book?.url);
      if (!href) continue;

      const card = document.createElement("a");
      card.className = "book-card";
      card.href = href;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const titleText = String(book?.title || "Untitled");
      const authorText = String(book?.author || "");

      const imageUrl = normalizeImageUrl(book?.image);
      if (imageUrl) {
        const img = document.createElement("img");
        img.className = "book-card__image";
        img.src = imageUrl;
        img.alt = `${titleText} の表紙`;
        img.loading = "lazy";
        img.decoding = "async";
        img.referrerPolicy = "no-referrer";
        card.appendChild(img);
      }

      const body = document.createElement("div");
      body.className = "book-card__body";

      const title = document.createElement("div");
      title.className = "book-card__title";
      title.textContent = titleText;
      body.appendChild(title);

      if (authorText) {
        const author = document.createElement("div");
        author.className = "book-card__meta";
        author.textContent = authorText;
        body.appendChild(author);
      }

      card.appendChild(body);
      fragment.appendChild(card);
    }

    if (fragment.childNodes.length === 0) {
      clearBookshelf("表示できる本がありません。");
      return;
    }

    bookshelf.appendChild(fragment);
  }

  function cleanupCallback(callbackName) {
    window.setTimeout(() => {
      try {
        delete window[callbackName];
      } catch { }
    }, 0);
  }

  function fetchBooks() {
    const category = categorySelect.value;
    const statusValue = statusSelect.value;
    const countValue = countSelect instanceof HTMLSelectElement ? countSelect.value : "24";

    requestCounter += 1;
    const currentRequest = requestCounter;

    setBusy(true);
    setStatusMessage("読み込み中…");
    clearBookshelf("");

    const callbackName = `__booklog_cb_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    window[callbackName] = (json) => {
      try {
        if (currentRequest !== requestCounter) return;

        const books = Array.isArray(json?.books) ? json.books : [];
        if (books.length === 0) {
          setStatusMessage("該当する本がありません。");
          clearBookshelf("該当する本がありません。");
          return;
        }

        setStatusMessage(`${books.length}件 表示`);
        renderBooks(books);
      } finally {
        if (currentRequest === requestCounter) setBusy(false);
        cleanupCallback(callbackName);
      }
    };

    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) existingScript.remove();

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.onerror = () => {
      if (currentRequest !== requestCounter) {
        cleanupCallback(callbackName);
        return;
      }
      setBusy(false);
      setStatusMessage("読み込みに失敗しました。");
      clearBookshelf("読み込みに失敗しました。時間をおいて再度お試しください。");
      cleanupCallback(callbackName);
    };

    const url =
      `https://api.booklog.jp/json/${encodeURIComponent(USER)}` +
      `?category=${encodeURIComponent(category)}` +
      `&status=${encodeURIComponent(statusValue)}` +
      `&count=${encodeURIComponent(countValue)}` +
      `&callback=${encodeURIComponent(callbackName)}` +
      `&_=${Date.now()}`;
    script.src = url;

    document.body.appendChild(script);
  }

  categorySelect.addEventListener("change", fetchBooks);
  statusSelect.addEventListener("change", fetchBooks);
  if (countSelect instanceof HTMLSelectElement) countSelect.addEventListener("change", fetchBooks);

  fetchBooks();
});
