// code that was used in scheduler.js but is no longer needed is preserved here. 

/*
if (courses.length <= 9) {
    let coursesPerms = permutations(courses);
    for (let k = 0; k < coursesPerms.length; k++) {
        let timetable = getTimetable(coursesPerms[k]);
        let index = -1;
        for (let i = 0; i < timetables.length; i++) {
            let allSame = true;
            for (let j = 0; j < timetable[6].length; j++) {
                if (timetables[i][6].indexOf(timetable[6][j]) == -1)
                    allSame = false;
            }
            if (allSame == true)
                index = i;
        }
        if (index == -1) {
            timetables.push(timetable);
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

function permutations(arr) {
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
 *
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
*/