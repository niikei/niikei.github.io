async function fetchBooks() {
    const response = await fetch('https://api.booklog.jp/json/niikei?category=0&count=10');
    const json = await response.json();

    let html = "";

    json.books.forEach(elem => {
        html +=
            '<div class="book">' +
            '<div class="book_image">' +
            '<a href="' + elem["url"] + '" target="_blank">' +
            '<img src="' + elem["image"] + '" title="' + elem["title"] + '" width="52" height="75" alt="No Image" />' +
            '</a>' +
            '</div>' +
            '<div class="book_title">' +
            '<a href="' + elem["url"] + '" target="_blank">' + elem["title"] + '</a>' +
            '<div class="book_author">' + elem["author"] + '</div>' +
            '</div>' +
            '</div>';
    });

    document.getElementById("recent_books").innerHTML = html;
}

// 実行
fetchBooks();
