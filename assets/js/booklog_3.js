// APIデータを取得し本棚を更新する関数
function fetchBooks(category, status) {
    // API URLを動的に生成
    const apiUrl = `https://api.booklog.jp/json/niikei?category=${category}&status=${status}&count=10&callback=displayBooks`;

    // 動的にJSONPスクリプトを挿入
    const script = document.createElement('script');
    script.src = apiUrl;
    script.id = 'jsonp';
    document.body.appendChild(script);
}

// 書籍データを表示するコールバック関数
function displayBooks(json) {
    console.log(json); // デバッグ用にコンソール出力

    const bookshelf = document.getElementById('bookshelf');
    bookshelf.innerHTML = ''; // 既存の本棚をクリア

    if (!json.books || json.books.length === 0) {
        bookshelf.innerHTML = '<p>No books found.</p>';
        return;
    }

    // 書籍データを生成
    const booksHtml = json.books.map(book => `
        <div class="book-card">
            <img src="${book.image}" alt="${book.title}" />
            <h3><a href="${book.url}" target="_blank">${book.title}</a></h3>
            <p>${book.author}</p>
        </div>
    `).join('');
    bookshelf.innerHTML = booksHtml;
}

// カテゴリやステータスの変更を監視
document.getElementById('category').addEventListener('change', updateBooks);
document.getElementById('status').addEventListener('change', updateBooks);

// 選択値に基づいて本棚を更新
function updateBooks() {
    const category = document.getElementById('category').value;
    const status = document.getElementById('status').value;
    fetchBooks(category, status);
}

// 初期表示
updateBooks();
