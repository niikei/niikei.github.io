document.addEventListener("DOMContentLoaded", main);

async function main() {
    const tableBody = document.getElementById("books-table-body");
    const data = await fetchData('https://script.google.com/macros/s/AKfycbwPO8l2yMdYAKR7u2J-BGquTz90qKe_8SESChs17DDDd7kQxeQzHkldRRRmtFI1r0pd/exec');

    checkWindowSizeAndUpdateDisplay();
    window.addEventListener('resize', checkWindowSizeAndUpdateDisplay);

    async function fetchData(url) {
        const response = await fetch(url);
        return await response.json();
    }

    function formatPages(pagesRead, totalPages) {
        return `${pagesRead} / ${totalPages}`;
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    function calculateReadingDuration(startDate) {
        return Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
    }

    function isSmartPhone() {
        return window.matchMedia('(max-width: 640px)').matches;
    }

    function checkWindowSizeAndUpdateDisplay() {
        const isPhone = isSmartPhone();
        tableBody.innerHTML = "";

        data.forEach(item => {
            const row = isPhone ? createPhoneView(item) : createDesktopView(item);
            tableBody.appendChild(row);
        });

        setupSortableHeaders();
    }

    function createPhoneView(item) {
        const table = document.createElement("table");
        const titleRow = document.createElement("tr");
        titleRow.classList.add("title-row");
        titleRow.innerHTML = `<th colspan="5" class="title">${item['Title']}</th>`;
        table.appendChild(titleRow);

        const dataRow = document.createElement("tr");
        dataRow.classList.add("data-row");
        dataRow.innerHTML = `
            <td>${item['Type']}</td>
            <td>${formatPages(item['Pages Read'], item['Total Pages'])}</td>
            <td>${Math.floor((item['Pages Read'] / item['Total Pages']) * 100)}%</td>
            <td>${formatDate(item['Start Date'])}</td>
            <td>${calculateReadingDuration(item['Start Date'])} Days</td>
        `;
        table.appendChild(dataRow);

        return table;
    }

    function createDesktopView(item) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="title">${item['Title']}</td>
            <td>${item['Type']}</td>
            <td>${formatPages(item['Pages Read'], item['Total Pages'])}</td>
            <td>${Math.floor((item['Pages Read'] / item['Total Pages']) * 100)}%</td>
            <td>${formatDate(item['Start Date'])}</td>
            <td>${calculateReadingDuration(item['Start Date'])}</td>
        `;
        return row;
    }

    function setupSortableHeaders() {
        const sortableHeaders = document.querySelectorAll(".sortable");
        let ascending = true;
        let sortedColumnIndex = 0;

        sortRows(0);
        updateSortIndicator(sortableHeaders[0]);

        sortableHeaders.forEach((header, index) => {
            header.addEventListener("click", function () {
                ascending = (index === sortedColumnIndex) ? !ascending : true;
                sortedColumnIndex = index;
                sortRows(index);
                updateSortIndicator(header);
            });
        });

        function sortRows(columnIndex) {
            const rows = Array.from(tableBody.querySelectorAll("tr")).sort((rowA, rowB) => {
                const cellA = rowA.cells[columnIndex].textContent;
                const cellB = rowB.cells[columnIndex].textContent;
                return compareCells(cellA, cellB, columnIndex);
            });

            tableBody.innerHTML = "";
            rows.forEach(row => tableBody.appendChild(row));
        }

        function compareCells(cellA, cellB, columnIndex) {
            if (columnIndex === 2) {
                return ascending ? parseInt(cellA.split(' / ')[0]) - parseInt(cellB.split(' / ')[0]) : parseInt(cellB.split(' / ')[0]) - parseInt(cellA.split(' / ')[0]);
            }
            else if (columnIndex === 3) {
                return ascending ? parseInt(cellA.replace('%', '')) - parseInt(cellB.replace('%', '')) : parseInt(cellB.replace('%', '')) - parseInt(cellA.replace('%', ''));
            } else if (columnIndex === 4) {
                return ascending ? new Date(cellA) - new Date(cellB) : new Date(cellB) - new Date(cellA);
            } else if (columnIndex === 5) {
                return ascending ? parseInt(cellA) - parseInt(cellB) : parseInt(cellB) - parseInt(cellA);
            } else {
                return ascending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
            }
        }

        function updateSortIndicator(target) {
            document.querySelectorAll(".sortable").forEach(indicator => indicator.classList.remove("ascending", "descending"));
            target.classList.add(ascending ? "ascending" : "descending");
        }
    }
}
