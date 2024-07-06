export async function computeTimetable(stringsFinding, file) {
    // let courses = [
    //     { time: 0, name: "Data Analytics", batch: "BSCS-4", classNum: 71403, teacher: "Sir X", day: "MW" },
    //     { time: 3, name: "Artificial Intelligence", batch: "BSCS-2", classNum: 71890, teacher: "Sir Z", day: "TTH" },
    //     { time: 1, name: "Artificial Intelligence", batch: "BSCS-4", classNum: 72001, teacher: "Sir W", day: "FS" },
    //     { time: 0, name: "Software Engineering", batch: "BSCS-1", classNum: 72567, teacher: "Sir X", day: "MW" },
    //     { time: 2, name: "Machine Learning", batch: "BSCS-5", classNum: 73042, teacher: "Sir V", day: "FS" }
    // ]
    console.log("start file");
    let courses = await getCourses(stringsFinding, file);
    if (courses == null)
        return null;
    console.log("end file");
    console.log("courses " + courses);
    let timetables = [];
    if (courses.length <= 9) {
        console.log("start perms");
        let coursesPerms = permutations(courses);
        console.log("end perms");
        console.log("coursePerms " + coursesPerms);
        for (let k = 0; k < coursesPerms.length; k++) {
            let timetable = getTimetable(coursesPerms[k]);
            let index = -1;
            for (let i = 0; i < timetables.length; i++) {
                let allSame = true;
                for (let j = 0; j < timetable[6].length; j++) {
                    if (timetables[i][6].indexOf(timetable[6][j]) == -1)
                        allSame = false;
                }
                console.log("allSame " + allSame);
                if (allSame == true)
                    index = i;
            }
            if (index == -1) {
                timetables.push(timetable);
                console.log(timetable[6]);
            }
        }
        console.log("timetables " + timetables);
    } else {
        console.log("start backtrack");
        const currentTimetable = [];
        // Start the backtracking process
        backtrack(timetables, currentTimetable, courses, 0);
        console.log("end backtrack");
        console.log(timetables);
    }
    return [timetables, courses];
}

async function getCourses(stringsFinding, fileInput) {
    console.log(stringsFinding);
    let courses = [];
    let filteredRows = await getFilteredRows(stringsFinding, fileInput);
    console.log(filteredRows);
    if (filteredRows === null)
        return null;
    // format is time - name-batch-room-classNum-teacher - name-batch-room-classNum-teacher - name-batch-room-classNum-teacher
    console.log("running get courses");
    for (let i = 0; i < filteredRows.length; i++) {
        let time = filteredRows[i][0];
        for (let j = 2; j < filteredRows[i].length; j += 5) {
            if (checkString(filteredRows[i][j], stringsFinding)) {
                let day = j == 2 ? "MW" : j == 7 ? "TTH" : j == 12 ? "FS" : "";
                let course = { time: time, name: filteredRows[i][j - 1], room: filteredRows[i][j + 1], classNum: filteredRows[i][j + 2], teacher: filteredRows[i][j + 3], day: day };
                console.log(course);
                courses.push(course);
            }
        }
    }
    return courses;
}

function checkString(string, stringsFinding) {
    for (let i = 0; i < stringsFinding.length; i++) {
        if (string == stringsFinding[i])
            return true;
    }
    return false;
}

async function getFilteredRows(stringsFinding, fileInput) {
    console.log(stringsFinding);
    console.log(fileInput);
    const file = fileInput.files[0];
    console.log(file);
    if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            console.log("read xlsx");
            try {
                console.log(file);
                const filteredRows = await readExcelFile(stringsFinding, file);
                console.log("Filtered Rows:", filteredRows);
                return filteredRows;
            } catch (error) {
                console.error("Error reading file:", error);
            }
        }
    }
    return null;
}

function readExcelFile(stringsFinding, file) {
    console.log(stringsFinding);
    console.log(file);
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            console.log("reader.onload running");
            const data = new Uint8Array(e.target.result);
            console.log(data);
            const workbook = XLSX.read(data, { type: 'array' });
            console.log(workbook);
            const sheetName = workbook.SheetNames[0];
            console.log(sheetName);
            const worksheet = workbook.Sheets[sheetName];
            console.log(worksheet);
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log(jsonData);

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

            console.log(filledData);
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
            console.log("ERROR: " + error);
            reject(error);
        };

        try {
            console.log(file);
            reader.readAsArrayBuffer(file);
        }
        catch (e) {
            console.log("error: " + e);
        }
    });
}

function isValidTimetable(timetable, course) {
    // Implement your logic to check for conflicts in the timetable
    // Example: Check if the course time conflicts with any existing courses
    for (let existingCourse of timetable) {
        if (existingCourse.time === course.time && existingCourse.day === course.day) {
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

function getTimetable(courses) {
    // 6 tables for each day, each day has 7 slots (8:30, 10:00, 11:30, 1:00, 2:30, 4:00, 5:30)
    let timetable = [
        [null, null, null, null, null, null, null], // mon
        [null, null, null, null, null, null, null], // tues
        [null, null, null, null, null, null, null], // wed
        [null, null, null, null, null, null, null], // thurs
        [null, null, null, null, null, null, null], // fri
        [null, null, null, null, null, null, null], // sat
        [] // class numbers to be appended here
    ]
    for (let i = 0; i < courses.length; i++) {
        const day = courses[i].day == "MW" ? 0 : courses[i].day == "TTH" ? 1 : 4;
        if (checkNameValidity(timetable, courses[i].name) == false)
            if (checkTimeValidity(timetable, day, courses[i].time) == false) {
                // console.log("course " + courses[i].name + " is valid to be placed ");
                let string = courses[i].name + ", " + courses[i].classNum;
                timetable[day][courses[i].time] = string;
                if (day != 4)
                    timetable[day + 2][courses[i].time] = string;
                else
                    timetable[day + 1][courses[i].time] = string;
                timetable[6].push(courses[i].classNum);
            }
        // } else
        // console.log("ERROR: '" + courses[i].name + "' cannot be placed on the timetable as another course is added at the same time. ");
        // else
        // console.log("ERROR: '" + courses[i].name + "' cannot be placed on the timetable as it is already added to the timetable. ");
    }
    return timetable;
}

function checkNameValidity(timetable, courseName) {
    for (let i = 0; i < 6; i++)
        for (let j = 0; j < timetable[i].length; j++)
            if (timetable[i][j] != null && timetable[i][j].includes(courseName) == true)
                return true;
    return false;
}

/**
 * 
 * @param {number} day 
 * @param {String} time 
 * @returns {boolean}
 */
function checkTimeValidity(timetable, day, time) {
    if (day != 4)
        if (timetable[day][time] == null && timetable[day + 2][time] == null)
            return false;
        else
            return true;
    else
        if (timetable[day][time] == null && timetable[day + 1][time] == null)
            return false;
        else
            return true;
}

function permutations(arr) {
    console.log(arr.length);
    if (arr.length === 1) {
        return [arr];
    }
    let perms = [];
    for (let i = 0; i < arr.length; i++) {
        let first = arr[i];
        let rest = arr.slice(0, i).concat(arr.slice(i + 1));
        let restPerms = permutations(rest);
        for (let p of restPerms) {
            perms.push([first].concat(p));
        }
    }
    return perms;
}

function runningPermutations() {
    let arr = [10, 5, 15, 0, 20];
    let targetArray = [0, 5, 10, 15, 20];

    // Generate permutations
    let perms = permutations(arr);
    console.log(perms);
    for (let i = 0; i < perms.length; i++) {
        console.log(i + ": [" + perms[i] + "]");
    }

    // Convert target array to string for comparison
    let targetString = JSON.stringify(targetArray);
    console.log(targetString);

    // Find index of target array in perms
    let index = perms.findIndex(permutation => JSON.stringify(permutation) === targetString);

    // Output index
    console.log(index); // This will output the index of [0, 5, 10, 15, 20] in perms
}