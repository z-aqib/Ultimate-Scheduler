import { getCourses } from "./fileReader.js"

window.computeTimetable = computeTimetable;

/**
 * 
 * @param {string[]} stringsFinding - the strings instances we need to find in the file, there is an array of them as it could be any of them
 * @param {File} file - the excel sheet we are reading
 * @returns {Array} first index is timetable(s) and second index is course(s)
 */
export async function computeTimetable(stringsFinding, file) {
    let courses = await getCourses(stringsFinding, file);
    if (courses == null)
        return null;
    let timetables = [];
    const currentTimetable = [];
    // Start the backtracking process
    backtrack(timetables, currentTimetable, courses, 0);
    let timetablesProper = convertToTable(timetables);
    timetables = timetablesProper;
    // sort courses on name basis
    courses.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
    return [timetables, courses];
}

function convertToTable(timetables) {
    let tables = [];
    for (let i = 0; i < timetables.length; i++) {
        let timetable = [
            [null, null, null, null, null, null, null], // mon
            [null, null, null, null, null, null, null], // tues
            [null, null, null, null, null, null, null], // wed
            [null, null, null, null, null, null, null], // thurs
            [null, null, null, null, null, null, null], // fri
            [null, null, null, null, null, null, null], // sat
            [] // class numbers to be appended here
        ]
        // append all the courses to the timetable
        for (let j = 0; j < timetables[i].length; j++) {
            const day = timetables[i][j].day == "MW" ? 0 : timetables[i][j].day == "TTH" ? 1 : 4;
            let string = timetables[i][j].name + ", " + timetables[i][j].teacher;
            timetable[day][timetables[i][j].time] = string;
            if (day != 4)
                timetable[day + 2][timetables[i][j].time] = string;
            else
                timetable[day + 1][timetables[i][j].time] = string;

            timetable[6].push(timetables[i][j].number);
        }
        // now check if its the same to an exisitng timetable
        let index = -1;
        for (let i = 0; i < tables.length; i++) {
            let allSame = true;
            for (let j = 0; j < timetable[6].length; j++) {
                if (tables[i][6].indexOf(timetable[6][j]) == -1)
                    allSame = false;
            }
            if (allSame == true)
                index = i;
        }
        if (index == -1) {
            tables.push(timetable);
        }
    }
    return tables;
}

function isValidTimetable(timetable, course) {
    // Implement your logic to check for conflicts in the timetable
    // Example: Check if the course time conflicts with any existing courses
    for (let existingCourse of timetable) {
        course.name += "";
        existingCourse.name += "";
        if ((existingCourse.time === course.time && existingCourse.day === course.day) || existingCourse.name.toLowerCase() === course.name.toLowerCase()) {
            return false;
        }
    }
    return true;
}

// Recursive backtracking function to generate timetables
function backtrack(timetables, currentTimetable, courses, start) {
    // If the current timetable has the same number of courses, add it to the results
    if (start >= courses.length) {
        timetables.push([...currentTimetable]);
        return;
    }

    // Try adding each course to the current timetable
    for (let i = start; i < courses.length; i++) {
        if (isValidTimetable(currentTimetable, courses[i])) {
            currentTimetable.push(courses[i]);
            if (courses[i]["name"].toLowerCase().includes("lab")) {
                let course = { ...courses[i] };
                course["time"] += 1;
                currentTimetable.push(course)
            }
            backtrack(timetables, currentTimetable, courses, i + 1);
            currentTimetable.pop(); // Backtrack
            if (courses[i]["name"].toLowerCase().includes("lab")) {
                currentTimetable.pop(); // Backtrack
            }
        }
    }
}