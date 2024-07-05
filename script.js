import { computeTimetable } from "./scheduler.js"
let information = null;

/**
 * displays the timetable on the screen using user-entered information. this method runs when user clicks the button. scheduler.js is called and timetable is computed, which returns the timetable and all the courses found of that user. using two for-loops, the timetable is displayed on screen, and then all the courses information is displayed on the screen. 
 * @param {Event} event when the user presses submit, its information is deleted. to prevent this, pass the event and call preventDefault()
 */
function displayTimeTable(event) {
    event.preventDefault(); // Prevent form submission

    // compute the timetable and break the information received into timetable and courses
    information = computeTimetable();
    let timetable = information[0];
    let courses = information[1];

    // get the timetable table and make sure it is visible
    const table = document.getElementById('timetable');
    if (getComputedStyle(table).display === 'none')
        table.style.display = 'table';

    // each row of timetable is to be represented as a column. flip the row, col vertices
    for (let dayIndex = 0; dayIndex < timetable.length; dayIndex++) {
        for (let timeIndex = 0; timeIndex < timetable[dayIndex].length; timeIndex++) {
            const dayRow = table.rows[timeIndex + 1]; // Start from index 1 to skip the header row
            const cell = dayRow.cells[dayIndex + 1]; // Start from index 1 to skip the first column (time slot)
            cell.textContent = timetable[dayIndex][timeIndex];
        }
    }

    // get the courses table and make sure it is visible
    let coursesTable = document.getElementById("courses");
    if (getComputedStyle(coursesTable).display === 'none')
        coursesTable.style.display = 'table';

    // get each course information and display accordingly
    let keys = ["time", "name", "classNum", "teacher", "day"];
    for (let i = 0; i < courses.length; i++) {
        let tableBody = coursesTable.getElementsByTagName('tbody')[0]; // get the table body
        const tableRow = document.createElement("tr");// create a new table row
        for (let j = 0; j < keys.length; j++) {
            // create columns in that row and add it to row
            const cell = document.createElement('td');
            if (j == 0)
                cell.textContent = courses[i]["time"] == 0 ? "8:30 to 9:45" : courses[i]["time"] == 1 ? "10:00 to 11:15" : courses[i]["time"] == 2 ? "11:30 to 12:45" : courses[i]["time"] == 3 ? "1:00 to 2:15" : courses[i]["time"] == 4 ? "2:30 to 3:45" : courses[i]["time"] == 5 ? "4:00 to 5:15" : "5:30 to 6:45";
            else
                cell.textContent = courses[i][keys[j]];
            tableRow.appendChild(cell);
        }
        tableBody.appendChild(tableRow);
    }

}

window.displayTimeTable = displayTimeTable; // Make function globally accessible
