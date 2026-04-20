(() => {
  async function boot() {
    const latest = document.getElementById("latest-posts");
    const all = document.getElementById("all-posts");
    const postTitle = document.getElementById("post-title");
    const postDate = document.getElementById("post-date");
    const postContent = document.getElementById("post-content");
    const tagContainers = PostsRender.getTagContainers();

    if (!latest && !all && !postContent && tagContainers.length === 0) return;

    try {
      const index = await PostsData.loadIndex();

      if (latest) PostsRender.renderPostList(latest, index.posts, { limit: 5 });
      if (all) PostsRender.renderPostList(all, index.posts);

      for (const container of tagContainers) {
        const tags = PostsRender.parseTagsValue(container.dataset.postsTag);
        const emptyMessage =
          container.dataset.postsEmpty || "記事がありません。";
        const filtered = PostsRender.filterByTags(index.posts, tags);
        PostsRender.renderPostList(container, filtered, { emptyMessage });
      }

      if (postContent) {
        const slug = new URLSearchParams(window.location.search).get("post");
        if (!slug) throw new Error("記事の指定がありません。");
        await PostsRender.renderSinglePost({
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
      if (target) target.innerHTML = `<p>${PostsUtils.escapeHtml(message)}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
