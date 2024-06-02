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

function calculateDaysSinceStarted(startDate) {
    const start = new Date(startDate);
    const today = new Date();
    const timeDifference = today - start;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
}
