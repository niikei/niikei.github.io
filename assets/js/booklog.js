document.addEventListener("DOMContentLoaded", function () {
    const fetchBooksButton = document.getElementById("fetch-books");
    const categorySelect = document.getElementById("category");
    const statusSelect = document.getElementById("status");
    const bookshelfDiv = document.getElementById("bookshelf");

    fetchBooksButton.addEventListener("click", function () {
        const category = categorySelect.value;
        const status = statusSelect.value;

        const script1 = document.createElement("script");
        script1.type = "text/javascript";
        script1.src = "https://widget.booklog.jp/blogparts/js/booklog_minishelf.js?black_disp";
        script1.id = "booklog_minishelf";

        const script2 = document.createElement("script");
        script2.type = "text/javascript";
        script2.src = `https://api.booklog.jp/json/niikei?category=${category}&status=${status}&callback=booklog_minishelf`;

        // Clear previous bookshelf content
        bookshelfDiv.innerHTML = "";
        bookshelfDiv.appendChild(script1);
        bookshelfDiv.appendChild(script2);
    });
});
