document.addEventListener("DOMContentLoaded", function() {
    const rows = document.querySelectorAll("#books-table-body tr");

    rows.forEach(row => {
        const startDate = row.cells[4].textContent;
        const daysSinceStartedCell = row.querySelector(".days-since-started");
        const timeSpentReadingCell = row.querySelector(".time-spent-reading");

        const daysSinceStarted = calculateDaysSinceStarted(startDate);
        daysSinceStartedCell.textContent = `${daysSinceStarted} days`;
        timeSpentReadingCell.textContent = `${daysSinceStarted} days`;
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("books-table-body");
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    function calculateReadingDuration(startDate) {
        const start = new Date(startDate);
        const today = new Date();
        const timeDifference = today - start;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return daysDifference;
    }

    // 各行の Reading Duration (Days) を計算してセットする
    rows.forEach(row => {
        const startDate = row.cells[3].textContent;
        const duration = calculateReadingDuration(startDate);
        row.querySelector(".time-spent-reading").textContent = duration;
    });
});


document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("books-table-body");
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    let ascending = true;
    let sortedColumnIndex = null;

    function sortRows(columnIndex) {
        rows.sort((rowA, rowB) => {
            const valueA = rowA.cells[columnIndex].textContent;
            const valueB = rowB.cells[columnIndex].textContent;

            if (columnIndex === 3) {
                // Start Date
                return ascending ? new Date(valueA) - new Date(valueB) : new Date(valueB) - new Date(valueA);
            } else if (columnIndex === 4) {
                // Reading Duration (Days)
                return ascending ? parseInt(valueA) - parseInt(valueB) : parseInt(valueB) - parseInt(valueA);
            } else {
                // その他の列
                return ascending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
        });

        rows.forEach(row => {
            tableBody.appendChild(row);
        });
    }

    function toggleSortDirection() {
        ascending = !ascending;
    }

    function updateSortIndicator(target) {
        const indicators = document.querySelectorAll(".sortable");
        indicators.forEach(indicator => {
            indicator.classList.remove("ascending", "descending");
        });

        target.classList.add(ascending ? "ascending" : "descending");
    }

    const sortableHeaders = document.querySelectorAll(".sortable");
    sortableHeaders.forEach((header, index) => {
        header.addEventListener("click", function() {
            if (index === sortedColumnIndex) {
                toggleSortDirection();
            } else {
                ascending = true;
                sortedColumnIndex = index;
            }
            sortRows(index);
            updateSortIndicator(header);
        });
    });

    // 初期表示: title列で昇順にソート
    const initialSortColumnIndex = 0; // title列のインデックス
    sortedColumnIndex = initialSortColumnIndex;
    sortRows(initialSortColumnIndex);
    updateSortIndicator(sortableHeaders[initialSortColumnIndex]);
});

