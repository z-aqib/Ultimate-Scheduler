window.getCourses = getCourses;

/**
 * gets the courses of the respected user inputs, by file reading and converting to classes
 * 
 * @param {String[]} stringsFinding - the strings we are looking for, given by user in form (batch, section, etc)
 * @param {File} fileInput - the file we have to read
 * @returns {Object[]} courses in the format {time, name, room, classNum, teacher, day, number}
 */
export async function getCourses(stringsFinding, fileInput) {
    // declare a courses array
    let courses = [];

    // get the rows in which the strings occur
    let filteredRows = await getFilteredRows(stringsFinding, fileInput);

    // if no rows are found, error has occured. return null
    if (filteredRows === null)
        return null;

    // declare timings
    let timings = ["8:30", "10:00", "11:30", "1:00", "2:30", "4:00", "5:30"];

    // loop through each row and convert to a course. the format is time - name-batch-room-classNum-teacher - name-batch-room-classNum-teacher - name-batch-room-classNum-teacher
    for (let i = 0; i < filteredRows.length; i++) {
        // first determine which time slot this row is and declare that as time
        let time = -1;
        for (let k = 0; k < timings.length; k++) {
            if (filteredRows[i][0].includes(timings[k])) {
                time = k;
            }
        }
        // now get each batch (cell 2, 7, 12) and check if its the one. if yes, read its course details and make it a course
        for (let j = 2; j < filteredRows[i].length; j += 5) {
            if (checkString(filteredRows[i][j], stringsFinding)) {
                let day = j == 2 ? "MW" : j == 7 ? "TTH" : j == 12 ? "FS" : "";
                let name = filteredRows[i][j - 1].toLowerCase() + "";
                if (name === null || name === undefined || name === "" || name === "undefined")
                    continue;
                if (name.toLowerCase().includes("only")) {
                    name = name.toLowerCase().split("only");
                    name = name[0];
                }
                let course = { time: time, name: name.trim(), room: filteredRows[i][j + 1], classNum: filteredRows[i][j + 2], teacher: filteredRows[i][j + 3], day: day, number: (i * 10) + j };
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
            console.log(filteredRows);
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