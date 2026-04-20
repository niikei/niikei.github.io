(() => {
  try {
    const saved = window.localStorage.getItem("theme");
    const theme =
      saved === "light" || saved === "dark" ? saved
      : (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) ?
        "dark"
      : "light";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
