// JavaScript to load the news section
document.addEventListener("DOMContentLoaded", function() {
    fetch('/templates/news.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('news-container').innerHTML = data;
        });
});
