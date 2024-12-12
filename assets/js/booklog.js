document.addEventListener('DOMContentLoaded', () => {
    const categorySelect = document.getElementById("category");
    const statusSelect = document.getElementById("status");
    const bookshelf = document.getElementById("bookshelf");

    const resizeBookshelf = () => {
        const headerHeight = document.querySelector('header').offsetHeight;
        const footerHeight = document.querySelector('footer').offsetHeight;
        const availableHeight = window.innerHeight - headerHeight - footerHeight;

        // コンソールで値を確認
        console.log("headerHeight:", headerHeight, "footerHeight:", footerHeight, "availableHeight:", availableHeight);

        bookshelf.style.height = `${availableHeight}px`;
    };

    function fetchBooks() {
        const category = categorySelect.value;
        const status = statusSelect.value;

        // 既存の書棚クリア
        bookshelf.innerHTML = "";

        // 既存スクリプト削除
        const existingScript = document.getElementById("booklog_minishelf");
        if (existingScript) existingScript.remove();

        // Booklog用スクリプト
        const script1 = document.createElement("script");
        script1.type = "text/javascript";
        script1.src = "https://widget.booklog.jp/blogparts/js/booklog_minishelf.js?black_disp";
        script1.id = "booklog_minishelf";

        const script2 = document.createElement("script");
        script2.type = "text/javascript";
        script2.src = `https://api.booklog.jp/json/niikei?category=${category}&status=${status}&callback=booklog_minishelf`;

        bookshelf.appendChild(script1);
        bookshelf.appendChild(script2);
    }

    // 初期設定
    resizeBookshelf();
    fetchBooks();

    // ウィンドウサイズ変更時に本棚サイズ更新
    window.addEventListener('resize', resizeBookshelf);

    // カテゴリー・ステータス変更時に更新
    categorySelect.addEventListener("change", fetchBooks);
    statusSelect.addEventListener("change", fetchBooks);
});
