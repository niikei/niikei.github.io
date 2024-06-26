document.addEventListener("DOMContentLoaded", function () {
    fetch('/templates/news.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('news-container').innerHTML = data;

            // Get the news items
            const newsItems = document.querySelectorAll('.news-item');

            // Convert the NodeList to an array
            const newsArray = Array.from(newsItems);

            // Sort the array based on the Posted on dates
            newsArray.sort((a, b) => {
                const dateA = new Date(a.querySelector('small').textContent.replace('Posted on: ', ''));
                const dateB = new Date(b.querySelector('small').textContent.replace('Posted on: ', ''));
                return dateB - dateA;
            });

            // Reorder the news items in the section
            const newsSection = document.getElementById('news');
            newsArray.forEach(item => newsSection.appendChild(item));
        });
});
