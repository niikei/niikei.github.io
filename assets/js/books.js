document.addEventListener("DOMContentLoaded", async function () {
    const response = await fetch('https://script.google.com/macros/s/AKfycbwPO8l2yMdYAKR7u2J-BGquTz90qKe_8SESChs17DDDd7kQxeQzHkldRRRmtFI1r0pd/exec');
    const data = await response.json();

    function formatDate(dateString) {
        const startDate = new Date(dateString);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        return startDate.toLocaleDateString(undefined, options);
    }

    function calculateReadingDuration(startDate) {
        const start = new Date(startDate);
        const today = new Date();
        const timeDifference = today - start;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return daysDifference;
    }

    const tableBody = document.getElementById("books-table-body");
    data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item['Title']}</td>
            <td>${item['Type']}</td>
            <td>${item['Progress']}</td>
            <td>${formatDate(item['Start Date'])}</td>
            <td class="reading-duration">${calculateReadingDuration(item['Start Date'])}</td>
        `;
        tableBody.appendChild(row);
    });

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

        // 元のDOMツリーから行を一旦削除
        rows.forEach(row => {
            tableBody.removeChild(row);
        });

        // ソートされた順に行を再挿入
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
        header.addEventListener("click", function () {
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
