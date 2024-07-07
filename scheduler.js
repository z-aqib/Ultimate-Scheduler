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
    return [timetables, courses];
}

async function getCourses(stringsFinding, fileInput) {
    let courses = [];
    let filteredRows = await getFilteredRows(stringsFinding, fileInput);
    if (filteredRows === null)
        return null;
    // format is time - name-batch-room-classNum-teacher - name-batch-room-classNum-teacher - name-batch-room-classNum-teacher
    for (let i = 0; i < filteredRows.length; i++) {
        let time = filteredRows[i][0].includes("8:30") ? 0 : filteredRows[i][0].includes("10:00") ? 1 : filteredRows[i][0].includes("11:30") ? 2 : filteredRows[i][0].includes("1:00") ? 3 : filteredRows[i][0].includes("2:30") ? 4 : filteredRows[i][0].includes("4:00") ? 5 : filteredRows[i][0].includes("5:30") ? 6 : -1;
        for (let j = 2; j < filteredRows[i].length; j += 5) {
            if (checkString(filteredRows[i][j], stringsFinding)) {
                let day = j == 2 ? "MW" : j == 7 ? "TTH" : j == 12 ? "FS" : "";
                let name = filteredRows[i][j - 1] + "";
                console.log("Initial name: '" + name + "'");
                if (name === null || name === undefined || name === "" || name === "undefined")
                    continue;
                console.log(name);
                if (name.includes("only")) {
                    name = name.split("only");
                    name = name[0];
                } else if (name.includes("Only")) {
                    name = name.split("Only");
                    name = name[0];
                }
                let course = { time: time, name: name.trim(), room: filteredRows[i][j + 1], classNum: filteredRows[i][j + 2], teacher: filteredRows[i][j + 3], day: day };
                courses.push(course);
            }
        }
    }
    return courses;
}

function checkString(string, stringsFinding) {
    if (string === null || string === undefined || string === "" || string === "undefined")
        return false;
    for (let i = 0; i < stringsFinding.length; i++) {
        if (string == stringsFinding[i])
            return true;
    }
    return false;
}

async function getFilteredRows(stringsFinding, fileInput) {
    const file = fileInput.files[0];
    if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            try {
                const filteredRows = await readExcelFile(stringsFinding, file);
                return filteredRows;
            } catch (error) {
                console.error("Error reading file:", error);
            }
        }
    }
    return null;
}

function readExcelFile(stringsFinding, file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Manually fill in missing time values
            let lastTime = null;
            const filledData = jsonData.map(row => {
                if (row[0]) {
                    lastTime = row[0];
                } else {
                    row[0] = lastTime;
                }
                return row;
            });

            const filteredRows = [];
            for (let i = 0; i < stringsFinding.length; i++) {
                const filteredData = filledData.filter(row => row.some(cell => String(cell).includes(stringsFinding[i])));
                for (let j = 0; j < filteredData.length; j++) {
                    let same = false;
                    for (let k = 0; k < filteredRows.length; k++) {
                        if (filteredData[j] === filteredRows[k]) {
                            same = true;
                        }
                    }
                    if (!same) {
                        filteredRows.push(filteredData[j]);
                    }
                }
            }
            resolve(filteredRows);
        };

        reader.onerror = function (error) {
            reject(error);
        };

        try {
            reader.readAsArrayBuffer(file);
        }
        catch (e) {
            console.log("error: " + e);
        }
    });
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
            let string = timetables[i][j].name + ", " + timetables[i][j].classNum;
            timetable[day][timetables[i][j].time] = string;
            if (day != 4)
                timetable[day + 2][timetables[i][j].time] = string;
            else
                timetable[day + 1][timetables[i][j].time] = string;
            timetable[6].push(timetables[i][j].classNum);
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
        if ((existingCourse.time === course.time && existingCourse.day === course.day) || existingCourse.name === course.name || existingCourse.name.includes(course.name) || course.name.includes(existingCourse.name)) {
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
            backtrack(timetables, currentTimetable, courses, i + 1);
            currentTimetable.pop(); // Backtrack
        }
    }
}