document.addEventListener("DOMContentLoaded", async function () {
    // ページ数の表示形式を設定する関数
    function formatPages(pagesRead, totalPages) {
        return `${pagesRead} / ${totalPages}`;
    }

    function formatDate(dateString) {
        const startDate = new Date(dateString);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        return startDate.toLocaleDateString(undefined, options);
    }

    // 日数の計算を行う関数
    function calculateReadingDuration(startDate) {
        const start = new Date(startDate);
        const today = new Date();
        const timeDifference = today - start;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        return daysDifference;
    }

    function isSmartPhone() {
        return window.matchMedia('(max-width: 640px)').matches;
    }

    // サーバーからデータを取得してテーブルに挿入する処理
    const response = await fetch('https://script.google.com/macros/s/AKfycbwPO8l2yMdYAKR7u2J-BGquTz90qKe_8SESChs17DDDd7kQxeQzHkldRRRmtFI1r0pd/exec');
    const data = await response.json();

    const tableBody = document.getElementById("books-table-body");

    const isPhone = isSmartPhone();

    if (isPhone) {
        for (const item of data) {
            const table = document.createElement("table");

            const titleRow = document.createElement("tr");
            titleRow.classList.add("title-row");
            titleRow.innerHTML = `
                        <th colspan="5" class="title">${item['Title']}</th>
                    `;
            table.appendChild(titleRow);

            const dataRow = document.createElement("tr");
            dataRow.classList.add("data-row");
            const progress = Math.floor((item['Pages Read'] / item['Total Pages']) * 100);
            dataRow.innerHTML = `
                        <td>${item['Type']}</td>
                        <td>${formatPages(item['Pages Read'], item['Total Pages'])}</td>
                        <td>${progress}%</td>
                        <td>${formatDate(item['Start Date'])}</td>
                        <td>${calculateReadingDuration(item['Start Date'])} Days</td>
                    `;
            table.appendChild(dataRow);

            tableBody.appendChild(table);
        }
    } else {
        for (const item of data) {
            const row = document.createElement("tr");
            const progress = Math.floor((item['Pages Read'] / item['Total Pages']) * 100);
            row.innerHTML = `
                <td class="title">${item['Title']}</td>
                <td>${item['Type']}</td>
                <td>${formatPages(item['Pages Read'], item['Total Pages'])}</td>
                <td>${progress}%</td>
                <td>${formatDate(item['Start Date'])}</td>
                <td>${calculateReadingDuration(item['Start Date'])}</td>
            `;
            tableBody.appendChild(row);
        }
    }

    // ソート可能なヘッダーの取得
    const sortableHeaders = document.querySelectorAll(".sortable");
    let ascending = true;
    let sortedColumnIndex = null;
    const rows = Array.from(tableBody.querySelectorAll("tr"));

    // 初期表示: title列で昇順にソート
    const initialSortColumnIndex = 0; // title列のインデックス
    sortedColumnIndex = initialSortColumnIndex;
    sortRows(initialSortColumnIndex);
    updateSortIndicator(sortableHeaders[initialSortColumnIndex]);

    function sortRows(columnIndex) {
        rows.sort((rowA, rowB) => {
            const cellA = rowA.cells[columnIndex].textContent;
            const cellB = rowB.cells[columnIndex].textContent;
    
            if (columnIndex === 2) {
                // Pages Read
                const pagesReadA = parseInt(cellA.split(' / ')[0]);
                const pagesReadB = parseInt(cellB.split(' / ')[0]);
                return ascending ? pagesReadA - pagesReadB : pagesReadB - pagesReadA;
            } else if (columnIndex === 3) {
                // Progress
                const progressA = parseInt(cellA.replace('%', ''));
                const progressB = parseInt(cellB.replace('%', ''));
                return ascending ? progressA - progressB : progressB - progressA;
            } else if (columnIndex === 4) {
                // Start Date
                return ascending ? new Date(cellA) - new Date(cellB) : new Date(cellB) - new Date(cellA);
            } else if (columnIndex === 5) {
                // Days Read
                const daysReadA = parseInt(cellA);
                const daysReadB = parseInt(cellB);
                return ascending ? daysReadA - daysReadB : daysReadB - daysReadA;
            } else {
                // その他の列
                return ascending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
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
}
);
