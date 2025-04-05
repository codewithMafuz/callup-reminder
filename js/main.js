// Initialize local storage defaults
nullHandleForThisLocalStorageProperty("allAlarmSavedList", []);
nullHandleForThisLocalStorageProperty("mode", {
    modeClassName: "bg-light",
    modeSelectedIndex: 0
});

// Default audio sources
const defaultAzanSource = "audio/Azan0.mp3";
const defaultAlarmSource = "audio/Alarm0.mp3";

// Initialize more local storage defaults
nullHandleForThisLocalStorageProperty("defaultAzanTone", {
    selectedToneIndex: 0,
    source: defaultAzanSource
});
nullHandleForThisLocalStorageProperty("defaultAlarmTone", {
    selectedToneIndex: 0,
    source: defaultAlarmSource
});
nullHandleForThisLocalStorageProperty("setting", {
    autoDeleteRingedAlarms: false
});
nullHandleForThisLocalStorageProperty("userInfo", []);
nullHandleForThisLocalStorageProperty("todayTimings", []);

// Audio setup
let isAudioPlaying = false;
const azanAudio = new Audio(defaultAzanSource);
azanAudio.setAttribute("preload", "metadata");
const alarmAudio = new Audio(defaultAlarmSource);
alarmAudio.setAttribute("preload", "metadata");
alarmAudio.loop = true;

// DOM element references
const setAlarmButton = document.getElementById("setAlarm");
const alarmTimeInput = document.getElementById("alarmInput");
const alarmNotesInput = document.getElementById("notesAlarmInput");
const alarmListContainer = document.getElementById("setAlarmList");
const alertContainer = document.getElementById("alertBox");
const deleteAllAlarmsButton = document.getElementById("deleteAllAlarms");
const totalAlarmDisplay = document.getElementById("totalAlarm");
const filterMessageBox = document.getElementById("filtering-msg");
const pageElements = document.getElementsByClassName("pages");
const tackleElements = Array.from(document.getElementsByClassName("tackle"));
const countrySelectOptions = $("#country option");
const cityInput = document.getElementById("city");
const locationSubmitButton = document.getElementById("setLocation");
const todayAzanDisplay = document.getElementById("azanDataDisplayToday");
const monthAzanDisplay = document.getElementById("azanDataDisplayMonth");
const todayTimingsTableBody = document.getElementById("tbody");
const monthTimingsTableBody = document.getElementById("tbody2");
const azanContainer = document.getElementById("azanVoice");

// Audio control buttons
const azanPlayButton = document.getElementById("playAudio1");
const azanPauseButton = document.getElementById("pauseAudio1");
const azanStopButton = document.getElementById("stopAudio1");
const alarmPlayButton = document.getElementById("playAudio2");
const alarmPauseButton = document.getElementById("pauseAudio2");
const alarmStopButton = document.getElementById("stopAudio2");

function goToPage(element) {
    const targetPage = element.id.replace("Btn", "") + "Page";
    Array.from(pageElements).forEach(function (pageElement) {
        pageElement.classList.add("none");
    }),
        document.getElementById(targetPage).classList.remove("none");
}
$(".navbar-nav li").click(function () {
    $("#toggleMenuBar").click();
});
let defaultTone,
    collapseIds = [];
const today = new Date();
function clearAllTimeouts() {
    const lastTimeoutId = window.setTimeout(() => {
        for (let timeoutId = lastTimeoutId; timeoutId >= 0; timeoutId--) window.clearInterval(timeoutId);
    }, 0);
}
function formatTime(timeString) {
    timeString = timeString.split(" ")[0].split(":");
    let hours = parseInt(timeString[0]),
        minutes = ":" + parseInt(timeString[1]);
    return hours > 12 ? ((hours -= 12), hours + minutes + " PM") : hours + minutes + " AM";
}
function removeUnknownLocalStorageProperties() {
    const localStorageLength = localStorage.length,
        allowedProperties = ["fetchedLastTime", "dontShowAgain", "isEndMaxDone", "allAlarmSavedList", "defaultAlarmTone", "defaultAzanTone", "mode", "setting", "aboutAzan", "userInfo", "todayTimings", "autoTurnOnAzan"];
    for (let index = 0; index < localStorageLength; index++) {
        const key = localStorage.key(index);
        allowedProperties.includes(key) || localStorage.removeItem(key);
    }
}
function getAzanObjects() {
    const azanObjects = [],
        allAlarmSavedList = JSON.parse(localStorage.allAlarmSavedList),
        listLength = allAlarmSavedList.length;
    for (let index = 0; index < listLength; index++) {
        const alarmObject = allAlarmSavedList[index];
        alarmObject.isItForAzan && azanObjects.push(alarmObject);
    }
    return azanObjects;
}
function removeAzanObjectsFromSaved() {
    clearAllTimeouts();
    const remainingAlarms = [],
        allAlarmSavedList = JSON.parse(localStorage.allAlarmSavedList),
        listLength = allAlarmSavedList.length;
    for (let index = 0; index < listLength; index++) {
        const alarmObject = allAlarmSavedList[index];
        alarmObject.isItForAzan || remainingAlarms.push(alarmObject);
    }
    return localStorage.setItem("allAlarmSavedList", JSON.stringify(remainingAlarms)), remainingAlarms;
}
function getDateTimeLocalToDateObj(dateTimeLocal) {
    return new Date(dateTimeLocal);
}
function makeRandomString(length = 30, customCharset = false) {
    let result = "";
    const charset = customCharset || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const charsetLength = charset.length;
    for (let index = 0; index < length; index++) result += charset.charAt(Math.floor(Math.random() * charsetLength));
    return result;
}
function removeNullsFromThisList(list) {
    return list.filter((item) => null !== item);
}
function removeThisValuesItemsFromObjectsList(objectsList, property, value) {
    return objectsList.filter((object) => object[property] === value);
}
function getLocalStorageSizeInKB(asPercentage = false) {
    let byteSize,
        key,
        totalBytes = 0;
    for (key in localStorage) localStorage.hasOwnProperty(key) && ((byteSize = 2 * (localStorage[key].length + key.length)), (totalBytes += byteSize));
    return asPercentage ? parseFloat(((totalBytes / 1024 / 5120) * 100).toFixed(2)) : totalBytes / 1024;
}
function getGroupingResult(currentDate, targetDate) {
    const currentTime = currentDate.getTime(),
        targetTime = targetDate.getTime(),
        currentDay = currentDate.getDate(),
        currentMonth = currentDate.getMonth(),
        currentYear = currentDate.getFullYear(),
        targetDay = targetDate.getDate(),
        targetMonth = targetDate.getMonth(),
        targetYear = targetDate.getFullYear(),
        isSameDay = targetDay == currentDay,
        isSameMonth = currentMonth == targetMonth,
        isSameYear = currentYear == targetYear,
        isWithinWeek = parseInt((targetTime - currentTime) / 1e3 / 60) < 10081;
    return `
    <box class="d-flex align-items-center justify-space-between">
        <p class="title my-2 w-100 text-center border rm-bg-info bg-secondary white">${currentTime > targetTime
            ? "Past"
            : isSameDay && isSameMonth && isSameYear
                ? "Today"
                : targetDay === currentDay + 1 && isSameMonth && isSameYear
                    ? "Tomorrow"
                    : isWithinWeek
                        ? "This Week"
                        : isSameMonth && isSameYear
                            ? "This Month"
                            : (isSameYear && currentMonth === targetMonth + 1) || (targetYear === currentYear + 1 && targetMonth === currentMonth - 11)
                                ? "Next Month"
                                : isSameYear
                                    ? "This Year"
                                    : targetYear === currentYear + 1
                                        ? "Next Year"
                                        : "After"
        }</p>
        <i class="px-3 bg-secondary white bi bi-arrows-angle-expand expandOrCollapseItems" onclick="collapseTillNext(this)"></i>
    </box>
        `;
}
function sortBeutify() {
    const titles = [];
    $("p.title").each(function () {
        titles.includes(this.innerText) ? this.parentElement.remove() : titles.push(this.innerText);
    });
}
function collapseTillNext(element) {
    let iterationCount = 0;
    var nextElement;
    element.classList.toggle("bi-arrows-angle-contract");
    nextElement = element.parentElement.nextElementSibling.nextElementSibling;
    console.log(nextElement);
    while (true) {
        iterationCount++;
        nextElement.classList.toggle("show");
        const nextParentElement = nextElement.parentElement.nextElementSibling;
        if (nextParentElement === null || nextParentElement.firstElementChild.nodeName === "BOX") {
            break;
        } else {
            nextElement = nextParentElement.firstElementChild.nextElementSibling;
        }
        if (iterationCount > 50) {
            break;
        }
    }
}
function nullHandleForThisLocalStorageProperty(property, defaultValue = false, useLocalStorage = true) {
    let emptyArray = [];
    const storedValue = JSON.parse(localStorage.getItem(property));
    (null !== storedValue && storedValue !== JSON.parse('[]')) || (defaultValue ? (useLocalStorage ? localStorage.setItem(property, JSON.stringify(defaultValue)) : sessionStorage.setItem(property, JSON.stringify(defaultValue))) : useLocalStorage ? localStorage.setItem(property, JSON.stringify(emptyArray)) : sessionStorage.setItem(property, JSON.stringify(defaultValue))),
        (toSave = JSON.parse(localStorage.getItem("allAlarmSavedList")));
}
function isObLnN(objectString, length) {
    return Object.keys(JSON.parse(objectString)).length === length;
}
var mode = localStorage.getItem("mode"),
    toSave = [];
function isThereNoAlarm() {
    nullHandleForThisLocalStorageProperty("allAlarmSavedList");
    return 0 === removeThisValuesItemsFromObjectsList(JSON.parse(localStorage.getItem("allAlarmSavedList")), "isItForAzan", !1).length;
}
function btnsClearify() {
    isThereNoAlarm() ? deleteAllAlarmsButton.setAttribute("disabled", !0) : deleteAllAlarmsButton.removeAttribute("disabled");
}
function getLocalStorageItem(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return defaultValue;
    }
}
function addInLocalStorage(title, dateTime, isAzan = true, isTurnedOn = true, endMax = false, realTime = false) {
    0 === title.length && (title = "Alarm");
    let alarmObject = { isItForAzan: !isAzan, id: "id" + new Date(dateTime).getTime(), title: title, datetime: dateTime, isRunningSetTimeout: !1, isTurnedOn: isTurnedOn, isDoneRingingOrStarted: !1, endMax: endMax, realTime: realTime };
    nullHandleForThisLocalStorageProperty("allAlarmSavedList"), toSave.push(alarmObject), localStorage.setItem("allAlarmSavedList", JSON.stringify(toSave));
}
function showMsgIfNoAlarm() {
    isThereNoAlarm() && (alarmListContainer.innerHTML = "<h3 style=\"font-size:1.3rem;text-align:center;font-family:'Arial';opacity:.4;\">No Alarm</h3>");
}
function showAlert(message = "Something went wrong, please try again", duration = 3e3, isSuccess = true, additionalMessage = false, zIndex = 1e7) {
    const alertId = makeRandomString(10),
        alertHtml = `\n    <div id="${alertId}" class="alert ${isSuccess ? "alert-success" : "alert-danger"} alert-dismissible fade show text-center fixed-top alert-div" role="alert" style="zindex:${zIndex}">\n        ${isSuccess ? '<i class="bi bi-check-circle-fill alert-icon"></i>' : '<i class="bi bi-exclamation-circle-fill alert-icon"></i>'
            }\n        <span>${message}</span>\n        <strong> ${additionalMessage || ""}</strong>\n        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>\n    </div>\n    `;
    alertContainer.innerHTML = alertHtml;
    const alertElement = $("#" + alertId);
    return (
        setTimeout(() => {
            alertElement.remove();
        }, duration),
        alertId
    );
}
function stopAlarm() { }
function deleteAlarmFromLocalStorage(alarmId) {
    for (let index = 0; index < toSave.length; index++) toSave[index].id === alarmId && (delete toSave[index], localStorage.setItem("allAlarmSavedList", JSON.stringify(toSave)));
    showAlarmList(!0), btnsClearify();
}
function deleteAlarmsAllFromLocalStorage() {
    $(".alarmBoxPieces").hide(510),
        setTimeout(() => {
            0 !== $(".armlaBoxPieces").length && $(".alarmBoxPieces").remove(), $("#setAlarmList").empty(1010), (toSave = []), localStorage.setItem("allAlarmSavedList", JSON.stringify(toSave)), showAlarmList(!0), btnsClearify();
        }, 500);
}
function getDateObjectOfNextDayIfInFuture(dateTime) {
    const currentTime = new Date().getTime();
    let nextDayTime = new Date(dateTime).getTime() + 864e5;
    for (; nextDayTime < currentTime;) nextDayTime += 864e5;
    return new Date(nextDayTime);
}
function getAlarmObjectPropertyValueById(alarmId, property, returnFullObject = false) {
    const allAlarmSavedList = JSON.parse(localStorage.getItem("allAlarmSavedList")),
        listLength = allAlarmSavedList.length;
    for (let index = 0; index < listLength; index++) {
        const alarmObject = allAlarmSavedList[index];
        if (alarmObject.id === alarmId) return returnFullObject ? alarmObject : alarmObject[property];
    }
}
function setAlarmObjectProperty(alarmId, property, value, resetProperties = false) {
    const updatedAlarms = [],
        allAlarmSavedList = JSON.parse(localStorage.getItem("allAlarmSavedList")),
        listLength = allAlarmSavedList.length;
    for (let index = 0; index < listLength; index++) {
        const alarmObject = allAlarmSavedList[index];
        null !== alarmObject && alarmObject.id === alarmId ? ((alarmObject[property] = value), resetProperties && ((alarmObject.isRunningSetTimeout = !1), (alarmObject.isDoneRingingOrStarted = !1), (alarmObject.isTurnedOn = !0)), updatedAlarms.push(alarmObject)) : updatedAlarms.push(alarmObject);
    }
    localStorage.setItem("allAlarmSavedList", JSON.stringify(updatedAlarms));
}
function setAllPastTimeCorrected() {
    if (0 !== JSON.parse(localStorage.getItem("allAlarmSavedList")).length) {
        const autoDeleteRingedAlarms = !!JSON.parse(localStorage.getItem("setting")).autoDeleteRingedAlarms,
            allAlarmSavedList = JSON.parse(localStorage.allAlarmSavedList),
            listLength = allAlarmSavedList.length,
            updatedAlarms = [],
            currentTime = new Date().getTime();
        for (let index = 0; index < listLength; index++) {
            const alarmObject = allAlarmSavedList[index];
            new Date(alarmObject.datetime).getTime() > currentTime ? updatedAlarms.push(alarmObject) : autoDeleteRingedAlarms || ((alarmObject.isDoneRingingOrStarted = !0), (alarmObject.isRunningSetTimeout = !1), updatedAlarms.push(alarmObject));
        }
        return localStorage.setItem("allAlarmSavedList", JSON.stringify(updatedAlarms)), updatedAlarms;
    }
    updatedAlarms = nullHandleForThisLocalStorageProperty("allAlarmSavedList", []);
}
function editButtonClearifyAzan() {
    const allAlarmSavedList = JSON.parse(localStorage.getItem("allAlarmSavedList")),
        listLength = allAlarmSavedList.length;
    for (let index = 0; index < listLength; index++) {
        const alarmObject = allAlarmSavedList[index];
        alarmObject.isItForAzan && new Date(alarmObject.datetime).getTime() < new Date().getTime() && document.getElementById(alarmObject.id).firstElementChild.firstElementChild.setAttribute("disabled", !0);
    }
}
function correctIsRunnningSetTimeoutPropertyOfAllUnringed() {
    const updatedAlarms = [];
    toSave = removeNullsFromThisList(JSON.parse(localStorage.getItem("allAlarmSavedList")));
    const currentTime = new Date().getTime();
    for (let index = 0; index < toSave.length; index++) {
        const alarmObject = toSave[index];
        new Date(alarmObject.datetime).getTime() > currentTime && !alarmObject.isDoneRingingOrStarted && (alarmObject.isRunningSetTimeout = !1), updatedAlarms.push(alarmObject);
    }
    localStorage.setItem("allAlarmSavedList", JSON.stringify(updatedAlarms));
}
function tackle(enable = !0) {
    tackleElements.forEach(function (element) {
        enable ? element.removeAttribute("disabled") : element.setAttribute("disabled", !0);
    });
}
function closeToneAndCorrectionAfterToneEnding(buttonElement) {
    try {
        if (buttonElement?.parentElement?.parentElement?.parentElement) {
            buttonElement.parentElement.parentElement.parentElement.remove();
        }
    } catch (error) {
        console.error("Error removing audio element:", error);
    }

    tackle(true);

    // Proper audio cleanup
    if (azanAudio) {
        azanAudio.pause();
        azanAudio.currentTime = 0;
    }

    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
    }
}
function toggleMuteAzanAudio(buttonElement) {
    azanAudio.muted ? ((azanAudio.muted = !1), (buttonElement.innerText = "Mute")) : ((azanAudio.muted = !0), (buttonElement.innerText = "Unmute"));
}
function sideCollapseDisplayAudio(expand = !1) {
    const audioRingingDisplay = $("#audioRingingDisplay"),
        firstOfRingingDisplay = $("#firstOfRingingDisplay");
    expand ? ($(".toHideOnSideCollapse").removeClass("none"), $(".toShowOnSideCollapse").addClass("none")) : (audioRingingDisplay.css({ height: "200px" }), $(".toHideOnSideCollapse").addClass("none"), $(".toShowOnSideCollapse").removeClass("none")),
        audioRingingDisplay.toggleClass("leftSlide"),
        firstOfRingingDisplay.toggleClass("widthSetAlarmAudioDisplay");
}
function correctAfterToneEnding() {
    try {
        (isAudioPlaying = !1), $(".tackle").removeAttr("disabled");
        const audioRingingDisplay = document.getElementById("audioRingingDisplay");
        null != audioRingingDisplay && audioRingingDisplay.remove();
    } catch (error) { }
}
function displayAudioRinging(isAlarm = true, title = "No Title", duration = 180000) {
    if (isAlarm) {
        alarmAudio.play();
    } else {
        azanAudio.play();
    }

    tackle(false);
    const currentDate = new Date();

    if (document.getElementById("audioRingingDisplay") === null) {
        const audioRingingDisplay = document.createElement("div");
        audioRingingDisplay.innerHTML = `
            <div class="fixed position-fixed fixed-center-custom" 
                 style="background: transparent !important;" 
                 id="audioRingingDisplay">
                <div class="card text-center shadow-lg" id="firstOfRingingDisplay">
                    <div class="toHideOnSideCollapse card-header d-flex justify-content-between">
                        <h5 class="toHideOnSideCollapse">${title}</h5>
                        <button class="btn btn-close" 
                                onclick="closeToneAndCorrectionAfterToneEnding(this), correctAfterToneEnding()">
                        </button>
                    </div>
                    
                    <div class="toHideOnSideCollapse card-body">
                        <h1>
                            <span class="badge px-4 py-2 m-hide text-bg-info mx-3 getCurrentTimeClass">
                                ${currentDate.toLocaleString(undefined, { timeStyle: "short" })}
                            </span>
                        </h1>
                        <h2>
                            <span class="badge px-4 py-2 m-hide text-bg-info mx-3 getCurrentTimeClass">
                                ${currentDate.toLocaleString(undefined, { dateStyle: "medium" })}
                            </span>
                        </h2>
                        <button class="btn btn-danger" ${isAlarm ?
                'onclick="closeToneAndCorrectionAfterToneEnding(this)">Stop' :
                'onclick="toggleMuteAzanAudio(this)">Mute'}
                        </button>
                    </div>
                    
                    <div class="card-footer d-flex justify-content-between">
                        <h5 class="toHideOnSideCollapse">
                            ${isAlarm ? "Alarm Ringing" : "Azan | Adhan voice"} ...
                        </h5>
                        <div class="p-1">
                            <i onclick="sideCollapseDisplayAudio()" 
                               class="bi bi-chevron-right toHideOnSideCollapse" 
                               style="font-size: 1.3rem;">
                            </i>
                        </div>
                        <div class="p-1" style="transform: translate(-15px, 0px) !important;">
                            <i onclick="sideCollapseDisplayAudio(true)" 
                               class="bi bi-chevron-left toShowOnSideCollapse none" 
                               style="font-size: 1.3rem;">
                            </i>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(audioRingingDisplay);
    }

    try {
        setTimeout(() => {
            closeToneAndCorrectionAfterToneEnding();
            correctAfterToneEnding();
        }, duration);
    } catch (error) {
        console.error("Error in display audio ringing:", error);
    }
}
function removeAllAzanObjsFromLocalStorage() {
    const remainingAlarms = [],
        allAlarmSavedList = JSON.parse(localStorage.getItem("allAlarmSavedList")),
        listLength = allAlarmSavedList.length;
    for (let index = 0; index < listLength; index++) {
        const alarmObject = allAlarmSavedList[index];
        null === alarmObject || alarmObject.isItForAzan || remainingAlarms.push(alarmObject);
    }
    localStorage.setItem("allAlarmSavedList", JSON.stringify(remainingAlarms));
}
function checkAndRingAlarm() {
    clearAllTimeouts();
    const currentTime = new Date().getTime();
    (toSave = removeNullsFromThisList(toSave)).forEach(function (alarmObject) {
        const alarmTime = new Date(alarmObject.datetime).getTime(),
            alarmTitle = alarmObject.title,
            alarmId = alarmObject.id;
        alarmTime > currentTime &&
            alarmTime - currentTime > 2e3 &&
            alarmObject.isTurnedOn &&
            !alarmObject.isRunningSetTimeout &&
            alarmTime - currentTime < 2592e5 &&
            (setAlarmObjectProperty(alarmId, "isRunningSetTimeout", !0),
                setTimeout(() => {
                    if (getAlarmObjectPropertyValueById(alarmId, "isTurnedOn") && !getAlarmObjectPropertyValueById(alarmId, "isRunningSetTimeout")) {
                        if ((setAlarmObjectProperty(alarmId, "isRunningSetTimeout", !1), (isAudioPlaying = !0), getAlarmObjectPropertyValueById(alarmId, "isItForAzan"))) {
                            azanAudio.src = JSON.parse(localStorage.getItem("defaultAzanTone")).source;
                            const azanDuration = 0 === JSON.parse(localStorage.getItem("defaultAzanTone")).selectedToneIndex ? 247500 : 152500;
                            displayAudioRinging(!1, alarmTitle, azanDuration);
                        } else (alarmAudio.src = JSON.parse(localStorage.getItem("defaultAlarmTone")).source), displayAudioRinging(!0, alarmTitle);
                        setAlarmObjectProperty(alarmId, "isTurnedOn", !1), setAlarmObjectProperty(alarmId, "isDoneRingingOrStarted", !0);
                    }
                    showAlarmList(!0, !1, !1, !0), btnsClearify();
                }, alarmTime - currentTime)),
            alarmTime < currentTime && alarmObject.isTurnedOn && setAlarmObjectProperty(alarmId, "isTurnedOn", !1);
    });
}
function sortForGrouping(list) {
    return list.sort(function (a, b) {
        return parseInt(a.id.replace("id", "")) - parseInt(b.id.replace("id", ""));
    });
}
function editObject(element) {
    const editDiv = document.getElementById("editDiv");
    null !== editDiv && editDiv.remove();
    const alarmId = element.id,
        alarmObject = getAlarmObjectPropertyValueById(alarmId, "", !0),
        isAzan = !!alarmObject.isItForAzan,
        alarmTitle = alarmObject.title,
        realTime = alarmObject.realTime,
        alarmDateTime = new Date(alarmObject.datetime),
        editContainer = document.createElement("div");
    (editContainer.id = "editDiv"),
        (editContainer.innerHTML = `\n    <div class="card-body">\n    <div class="flex-center">\n        <h5 class="card-title my-3 text-center">${isAzan ? "Customize Today's Azan Time" : "Edit Alarm"
            }</h5>\n        <button class="btn btn-close" id="cancelEdit"></button>\n    </div>\n    <hr>\n    <h5 class="p-title my-2 text-center">${isAzan ? "Azan's" : "Alarm's"
            } Info</h5>\n    <div class="prevInfo">\n    <h6 class="mb-2 text-muted">${isAzan ? "For " : "Title"} : ${alarmTitle}</h6>\n    ${isAzan ? `<h6 class="mb-2 text-muted">Real Time Start : ${new Date(realTime).toLocaleString(void 0, { dateStyle: "medium", timeStyle: "short" })}</h6>` : ""
            }\n    <h6 class="mb-2 text-muted">Datetime : ${alarmDateTime.toLocaleString(void 0, { dateStyle: "medium", timeStyle: "short" })}</h6>\n    </div>\n    <hr>\n    ${isAzan ? "" : '<h6 class="card-subtitle mb-2">Edit note title if you want</h6>\n    <input id="notesAlarmInputEdit" type="text" class="mb-3 w-50 form-control"\n    placeholder="Something.."></input>'
            }\n\n    <h6 class="card-subtitle mb-2">Edit the date and time</h6>\n    <input id="alarmInputEdit" type="datetime-local" class="mb-3 w-50 form-control"></input>\n    <br>\n    <button disabled id="setAlarmEdit" class="btn btn-primary">Save Changes</button>\n    </div>\n\n    `),
        document.body.appendChild(editContainer);
    const notesAlarmInputEdit = document.getElementById("notesAlarmInputEdit"),
        alarmInputEdit = document.getElementById("alarmInputEdit"),
        setAlarmEditButton = document.getElementById("setAlarmEdit"),
        cancelEditButton = document.getElementById("cancelEdit"),
        alarmDateTimeMillis = alarmDateTime.getTime();
    let isTitleChanged = !1,
        isDateTimeChanged = !1;
    isAzan ||
        notesAlarmInputEdit.addEventListener("input", function () {
            const newTitle = this.value;
            newTitle !== alarmTitle && "" !== newTitle ? ((isTitleChanged = !0), setAlarmEditButton.removeAttribute("disabled")) : setAlarmEditButton.setAttribute("disabled", !0);
        }),
        alarmInputEdit.addEventListener("input", function () {
            const newDateTimeMillis = new Date(this.value).getTime();
            newDateTimeMillis !== alarmDateTimeMillis ? (isAzan ? (newDateTimeMillis > realTime && newDateTimeMillis < alarmObject.endMax ? ((isDateTimeChanged = !0), setAlarmEditButton.removeAttribute("disabled")) : setAlarmEditButton.setAttribute("disabled", !0)) : isAzan || ((isDateTimeChanged = !0), setAlarmEditButton.removeAttribute("disabled"))) : setAlarmEditButton.setAttribute("disabled", !0);
        }),
        setAlarmEditButton.addEventListener("click", function () {
            isTitleChanged && setAlarmObjectProperty(alarmId, "title", notesAlarmInputEdit.value),
                isDateTimeChanged && setAlarmObjectProperty(alarmId, "datetime", alarmInputEdit.value, !0),
                (isTitleChanged || isDateTimeChanged) && toReload(),
                isAzan ? (showAlarmList(!0), showAlarmList(!0, !1, !1, !0)) : (showAlarmList(!0, !1, !1, !0), showAlarmList(!0)),
                checkAndRingAlarm(),
                editContainer.remove();
        }),
        cancelEditButton.addEventListener("click", function () {
            editContainer.remove();
        });
}
function showAlarmList(refresh = false, showLatest = false, collapseId, showAzan = false) {
    const filterMessage = filterMessageBox.innerText;
    const currentDate = new Date();
    let list;

    // Setup and validation 
    nullHandleForThisLocalStorageProperty("allAlarmSavedList");

    if (!refresh && JSON.parse(localStorage.getItem("allAlarmSavedList")).length > 0) {
        checkAndRingAlarm();
    }

    // Clear containers
    alarmListContainer.innerHTML = "";
    azanContainer.innerHTML = "";

    // Process list
    toSave = removeNullsFromThisList(toSave);
    localStorage.setItem("allAlarmSavedList", JSON.stringify(toSave));
    toSave = setAllPastTimeCorrected();

    let alarmCount = 0,
        isGroupingEnabled = !1;
    if (((list = toSave), void 0 !== toSave)) {
        "Oldest First" === filterMessage || ("Latest First" === filterMessage ? (list = toSave.reverse()) : ((isGroupingEnabled = !0), (list = sortForGrouping(list))));
        let alarmIndex = -1;
        if (
            (list.forEach(function (alarmObject, index) {
                if (alarmObject.isItForAzan) {
                    if (showAzan) {
                        const alarmDateTime = new Date(alarmObject.datetime),
                            alarmId = alarmObject.id,
                            isTurnedOn = !!alarmObject.isTurnedOn,
                            azanAccordionItem = document.createElement("div");
                        (azanAccordionItem.className = "accordion-item border azanAccordionItem"),
                            (azanAccordionItem.innerHTML = `\n            <h2 class="px-4 accordion-button alarmBoxPieces" data-bs-target="#${alarmId}" data-bs-toggle="collapse">${alarmObject.title
                                }\n            <span class="mx-4 badge text-bg-success m-hide">${alarmDateTime.toLocaleString(void 0, { timeStyle: "short" })}</span>\n            <span class="mx-4 badge text-bg-${isTurnedOn ? "success" : "secondary"} m-px">${isTurnedOn ? "On" : "Off"
                                }</span>\n            </h2>\n            </div>\n            <div class="az accordion-collapse ${collapseId === alarmId || collapseIds.includes(alarmId) ? "show" : ""
                                } collapse alarmBoxPieces" id="${alarmId}">\n            <div class="accordion-body position-relative azanAccordionBody">\n            <button id="editAzan" onclick="editObject(this.parentElement.parentElement)" class="btn btn-secondary  btn-sm mt-3 float-right position-absolute end-0 top-0 my-1" title="Customize">Customize timing</button>\n            <p><b>Date and time :</b> ${alarmDateTime.toLocaleString(
                                    void 0,
                                    { dateStyle: "long", timeStyle: "short" }
                                )}</p>\n            <div class="form-check form-switch">\n            <input title="Turn on or off this alarm" class="turnOnOrOff form-check-input switches" type="checkbox" role="switch" id="flexSwitchCheckDefault${index}" ${isTurnedOn ? "checked" : ""
                                } ${alarmObject.isDoneRingingOrStarted ? "disabled" : ""
                                }>\n            <label class="form-check-label" for="flexSwitchCheckDefault${index}" style="user-select:none;" title="Turn on or off this alarm">Azan on</label>\n            </div>\n             </div>\n            `),
                            azanContainer.appendChild(azanAccordionItem);
                    }
                } else {
                    alarmIndex++, alarmCount++;
                    const alarmDateTime = new Date(alarmObject.datetime),
                        alarmId = alarmObject.id,
                        isTurnedOn = !!alarmObject.isTurnedOn,
                        accordionItem = document.createElement("div");
                    (accordionItem.className = "accordion-item"),
                        0 === alarmIndex && (accordionItem.id = "latestOneAlarm"),
                        (accordionItem.innerHTML = `\n            ${isGroupingEnabled ? getGroupingResult(currentDate, alarmDateTime) : ""}\n\n            <h2 class="accordion-button alarmBoxPieces" data-bs-target="#${alarmId}" data-bs-toggle="collapse">${alarmIndex + 1}. ${alarmObject.title
                            }\n            <span class="mx-4 badge text-bg-success m-hide">${alarmDateTime.toLocaleString(void 0, { timeStyle: "short" })}</span>\n            <span class="mx-4 badge text-bg-success m-hide">${alarmDateTime.toLocaleString(void 0, {
                                dateStyle: "medium",
                            })}</span>\n            <span class="mx-4 badge text-bg-${isTurnedOn ? "success" : "secondary"} m-px">${isTurnedOn ? "On" : "Off"}</span>\n            </h2>\n            </div>\n            <div class="accordion-collapse ${collapseId === alarmId || collapseIds.includes(alarmId) ? "show" : ""
                            } collapse alarmBoxPieces" id="${alarmId}">\n            <div class="accordion-body position-relative">\n            <div class="position-absolute end-0">\n            </div>\n            <p><b>Date and time :</b> ${alarmDateTime.toLocaleString(
                                void 0,
                                { dateStyle: "long", timeStyle: "short" }
                            )}</p>\n            <div class="form-check form-switch">\n            <input title="Turn on or off this alarm" class="turnOnOrOff form-check-input switches" type="checkbox" role="switch" id="flexSwitchCheckDefault${alarmIndex}" ${isTurnedOn ? "checked" : ""
                            } ${alarmObject.isDoneRingingOrStarted ? "disabled" : ""
                            }>\n            <label class="form-check-label" for="flexSwitchCheckDefault${alarmIndex}" style="user-select:none;" title="Turn on or off this alarm">Alarm on</label>\n            </div>\n            <div class="position-relative">\n            <button id="setTomorrowBtn${alarmId}" class="btn btn-sm btn-secondary mt-3 position-absolute start-0" title="Set alarm for next day at this time" onclick="setAlarm(getDateObjectOfNextDayIfInFuture('${alarmDateTime}'),'${alarmObject.title
                            }')">Set For Next Day</button>\n            <button id="deleteBtnAlarm${alarmIndex}" class="btn btn-danger  btn-sm mt-3 deleteAlarm float-right position-absolute end-0" title="Delete this alarm" onclick="hideIt(this);deleteAlarm(this)">Delete alarm</button>\n            <button id="editAlarm" onclick="editObject(this.parentElement.parentElement.parentElement)" class="btn btn-secondary  btn-sm mt-3 float-right position-absolute start-50" title="Edit This Alarm">Edit Alarm</button>\n            </div>\n            </div>\n            `),
                        alarmListContainer.appendChild(accordionItem);
                }
            }),
                showAzan && editButtonClearifyAzan(),
                showLatest)
        ) {
            const latestOneAlarm = $("#latestOneAlarm");
            latestOneAlarm.attr("style", "display:none;"), latestOneAlarm.show(300);
        }
        $(".turnOnOrOff").each(function () {
            const switchElement = this,
                switchJQueryElement = $(switchElement);
            $(switchJQueryElement).click(function () {
                const scrollOffset = this.offsetHeight - this.clientHeight;
                sessionStorage.setItem("s", JSON.stringify(scrollOffset));
                const alarmId = switchElement.parentElement.parentElement.parentElement.id;
                !0 === getAlarmObjectPropertyValueById(alarmId, "isTurnedOn")
                    ? (setAlarmObjectProperty(alarmId, "isTurnedOn", !1),
                        setTimeout(() => {
                            if ((showAlarmList(), showAlarmList(!0, !1, alarmId, !0), !1 === getAlarmObjectPropertyValueById(alarmId, "isItForAzan"))) {
                                doScroll(JSON.parse(sessionStorage.s));
                            }
                        }, 60))
                    : (setAlarmObjectProperty(alarmId, "isTurnedOn", !0),
                        setTimeout(() => {
                            if ((showAlarmList(), showAlarmList(!0, !1, alarmId, !0), !1 === getAlarmObjectPropertyValueById(alarmId, "isItForAzan"))) {
                                doScroll(JSON.parse(sessionStorage.getItem("s")));
                            }
                        }, 60));
            });
        }),
            $(".accordion-item").each(function () {
                $(this).click(function () {
                    try {
                        const nextElementId = this.nextElementSbling.id;
                        collapseIds.includes(nextElementId)
                            ? (collapseIds = collapseIds.filter(function (id) {
                                return id !== nextElementId;
                            }))
                            : collapseIds.push(nextElementId);
                    } catch (error) { }
                });
            }),
            Array.from(document.getElementsByClassName("expandOrCollapseItems")).forEach(function (expandOrCollapseItem) {
                expandOrCollapseItem.addEventListener("click", function () {
                    this.classList.toggle("bi-arrows-angle-expand"), collapseTillNext(this);
                });
            });
    }
    (totalAlarmDisplay.innerText = alarmCount), showMsgIfNoAlarm(), sortBeutify();
}
function doScroll(scrollOffset) {
    window.scrollBy(0, scrollOffset);
}
function setAlarm(dateTime, title) {
    let isDuplicate = !1;
    if (title.length > 60) return showAlert("alarm title should short", 3e3, !1);
    const allAlarmSavedList = JSON.parse(localStorage.getItem("allAlarmSavedList")),
        listLength = allAlarmSavedList.length;
    for (let index = 0; index < listLength; index++) {
        const alarmObject = allAlarmSavedList[index];
        if (parseInt(new Date(alarmObject.datetime).getTime() / 6e4) === parseInt(new Date(dateTime).getTime() / 6e4)) {
            isDuplicate = !0;
            break;
        }
    }
    if (!isDuplicate && JSON.parse(localStorage.allAlarmSavedList).length < 50) {
        let alarmTitle = title;
        (dateTime = getDateTimeLocalToDateObj(dateTime)), (toSave = []);
        const currentTime = new Date().getTime();
        if (dateTime.getTime() >= currentTime + 4e3) {
            const alertId = showAlert("Alarm has been set for ", 3e3, !0, `${dateTime.toLocaleString()}`);
            addInLocalStorage(alarmTitle, dateTime),
                showAlarmList(!1, !0),
                btnsClearify(),
                setTimeout(() => {
                    const alertElement = document.getElementById(alertId);
                    null !== alertElement && alertElement.remove();
                }, 3e3);
        } else showAlert("alarm must be a time of future", 3e3, !1);
    } else showAlert(isDuplicate ? "You already  have set an alarm at this time" : "Maximum 50 alarm could be set or store, please delete some to add more", 4e3, !1);
}
function resetPage() {
    confirm("Are you sure you want to reset this page") && (localStorage.clear(), location.reload());
}
function localStorageSettingObj() {
    return JSON.parse(localStorage.getItem("setting"));
}
function ringedAlarmDeleteOnOrOff(checkboxElement) {
    const setting = localStorageSettingObj();
    checkboxElement.checked ? (setting.autoDeleteRingedAlarms = !0) : (setting.autoDeleteRingedAlarms = !1), localStorage.setItem("setting", JSON.stringify(setting));
}
function hideIt(buttonElement) {
    $(buttonElement).parent().parent().parent().hide(310), $(buttonElement).parent().parent().parent().prev().hide(310);
}
function deleteAlarm(buttonElement) {
    const alarmId = buttonElement.parentElement.parentElement.parentElement.id;
    setTimeout(() => {
        deleteAlarmFromLocalStorage(alarmId);
    }, 300);
}
function correctionOfStorageSizeRelated() {
    const storagePercentage = getLocalStorageSizeInKB(!0).toFixed(2),
        storageSize = getLocalStorageSizeInKB().toFixed(2);
    $(".storageFullNowPercentage").each(function () {
        $(this).text(storageSize + "KB"), $(this).attr("aria-valuenow", storagePercentage), $(this).attr("style", `width:${storagePercentage}%;`);
    }),
        $(".storageFullNowValue").text(storageSize),
        $(".storageFullNowValueRemaining").text(5120 - storageSize);
}
function setModeOfTheme(modeClassName, selectedIndex) {
    "bg-dark" === modeClassName
        ? ($(".mode-changable-dark").addClass("bg-dark"),
            $(".mode-changable-light").addClass("bg-light"),
            $(".btn-primary").addClass("white"),
            $(".btn-primary").addClass("bg-dark"),
            $('input[type="search"]').addClass("bg-light"),
            $(".rm-bg-info").removeClass("bg-info"))
        : ($(".mode-changable-dark").removeClass("bg-dark"),
            $(".mode-changable-light").removeClass("bg-light"),
            $(".btn-primary").removeClass("white"),
            $(".btn-primary").removeClass("bg-dark"),
            $('input[type="search"]').removeClass("bg-light"),
            $(".rm-bg-info").addClass("bg-info"));
    let modeOptions = $("#settingSelectMode").children();
    modeOptions.attr("selected", !1), $(modeOptions[selectedIndex]).attr("selected", !0);
}
function getUserGeoLocation() {
    fetch("https://api.bigdatacloud.net/data/reverse-geocode-client")
        .then(function (response) {
            return response.json();
        })
        .then(function (geoData) {
            let selectedIndex = 0; // Initialize selectedIndex
            const defaultCountryCode = geoData.countryCode || "BD";
            const cityName = geoData.city || geoData.locality || "Sylhet";

            countrySelectOptions.removeAttr("selected");
            cityInput.value = cityName;

            countrySelectOptions.each(function (index) {
                if (this.value === defaultCountryCode) {
                    selectedIndex = index;
                    this.setAttribute("selected", true);
                }
            });

            const userInfo = {
                selectedIndex: selectedIndex,
                countryCode: defaultCountryCode,
                city: cityName
            };

            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            sendRequestForAzan(userInfo.selectedIndex, userInfo.countryCode, userInfo.city, true);
        })
        .catch(function (error) {
            console.error("Error getting geolocation:", error);
        });
}
function sendRequestForAzan(selectedIndex = 0, countryCode, city, forceFetch = !1) {
    if (
        ((todayTimingsTableBody.innerHTML = '\n    <div class="flex-center spinner">\n    <div class="spinner-grow" role="status">\n        <span class="visually-hidden">Loading...</span>\n    </div>\n</div>\n    '),
            (monthTimingsTableBody.innerHTML = '\n    <div class="flex-center spinner">\n    <div class="spinner-grow" role="status">\n        <span class="visually-hidden">Loading...</span>\n    </div>\n</div>\n    '),
            $(".spinner").show(),
            null !== JSON.parse(localStorage.getItem("aboutAzan")) && !forceFetch)
    )
        return;
    const currentDate = new Date(),
        requestUrl = new URL(`https://api.aladhan.com/v1/calendarByCity?city=${city}&country=${countryCode}&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}&method=3`);
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (azanData) {
            "OK" !== azanData.status
                ? (localStorage.removeItem("aboutAzan"), localStorage.removeItem("userInfo"))
                : (localStorage.setItem("aboutAzan", JSON.stringify({ lastDataFetched: currentDate, data: azanData.data })),
                    setTimeout(() => {
                        showAzanDisplay(selectedIndex, city);
                    }, 0));
        })
        .catch(function () { });
}
function showTimingsData(azanData, selectedCity) {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.toLocaleDateString(undefined, { dateStyle: "medium" }).split(" ")[0];

    try {
        const monthData = azanData;
        const daysInMonth = monthData.length;
        const todayData = monthData[currentDate.getDate() - 1];
        const todayTimings = todayData.timings;

        // Display today's timings
        todayTimingsTableBody.appendChild(createTimingRow(todayData.timings, todayData.date.readable));

        // Remove unnecessary prayer times
        delete todayTimings.Sunrise;
        delete todayTimings.Sunset;
        delete todayTimings.Imsak;
        delete todayTimings.Midnight;
        delete todayTimings.Firstthird;
        delete todayTimings.Lastthird;

        // Save today's timings
        localStorage.setItem("todayTimings", JSON.stringify(todayTimings));
        localStorage.setItem("fetchedLastTime", JSON.stringify(new Date().getTime()));

        // Display remaining days of the month
        let remainingDaysCount = 0;
        for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
            const dayData = monthData[dayIndex];
            const dateReadable = dayData.date.readable;
            if (parseInt(dateReadable.split(" ")[0]) > currentDay) {
                monthTimingsTableBody.appendChild(createTimingRow(dayData.timings, dateReadable));
                remainingDaysCount++;
            }
        }

        // Update UI elements
        if (remainingDaysCount === 0) {
            $(".tab2").remove();
        }

        $(".todayDate").text(currentDate.toLocaleDateString(undefined, { dateStyle: "medium" }));
        $(".todayMonth").text(currentMonth);
        $(".spinner").hide();
        $("#cityOf").text(selectedCity);
        $("#showAccordingToCity").text(JSON.parse(localStorage.getItem("userInfo")).city);

        // Clean up and setup new alarms
        removeAllAzanObjsFromLocalStorage();
        setupDailyPrayerAlarms();
    } catch (error) {
        console.error("Error displaying timings:", error);
    }
}
function showAzanDisplay(selectedIndex, city) {
    void 0 !== selectedIndex && (countrySelectOptions.removeAttr("selected"), $(countrySelectOptions[selectedIndex]).attr("selected", !0)), void 0 !== city && (cityInput.value = city);
    const currentDate = new Date(),
        currentDay = currentDate.getDate(),
        currentMonth = currentDate.toLocaleDateString(void 0, { dateStyle: "medium" }).split(" ")[0];
    function createTimingRow(timings, readableDate) {
        delete timings.Firstthird, delete timings.Lastthird;
        let row = document.createElement("tr");
        for (prop in ((row.innerHTML += `<th>${readableDate}</th>`), timings)) {
            const formattedTime = formatTime(timings[prop]);
            row.innerHTML += `<td>${formattedTime}</td>`;
        }
        return row;
    }
    try {
        const azanData = JSON.parse(localStorage.getItem("aboutAzan")).data,
            daysInMonth = azanData.length,
            todayData = azanData[currentDate.getDate() - 1],
            todayTimings = todayData.timings;
        todayTimingsTableBody.appendChild(createTimingRow(todayData.timings, todayData.date.readable)),
            delete todayTimings.Sunrise,
            delete todayTimings.Sunset,
            delete todayTimings.Imsak,
            delete todayTimings.Midnight,
            delete todayTimings.Firstthird,
            delete todayTimings.Lastthird,
            localStorage.setItem("todayTimings", JSON.stringify(todayTimings)),
            localStorage.setItem("fetchedLastTime", JSON.stringify(new Date().getTime()));
        let remainingDaysCount = 0;
        for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
            const dayData = azanData[dayIndex],
                readableDate = dayData.date.readable;
            parseInt(readableDate.split(" ")[0]) > currentDay && (monthTimingsTableBody.appendChild(createTimingRow(dayData.timings, readableDate)), remainingDaysCount++);
        }
        0 === remainingDaysCount && $(".tab2").remove(),
            $(".todayDate").text(currentDate.toLocaleDateString(void 0, { dateStyle: "medium" })),
            $(".todayMonth").text(currentMonth),
            $(".spinner").hide(),
            $("#cityOf").text(city),
            $("#showAccordingToCity").text(JSON.parse(localStorage.getItem("userInfo")).city),
            removeAllAzanObjsFromLocalStorage(),
            setupDailyPrayerAlarms(),
            showAlarmList(!1, !1, !1, !0);
    } catch (error) { }
}
function convToTody(timeString) {
    const currentDate = new Date(),
        timeParts = (timeString = timeString.split(" ")[0].split(":"))[0],
        minutes = timeParts[1];
    return currentDate.setHours(parseInt(timeParts), parseInt(minutes), 0), currentDate;
}
function setAutoTurnOnAzanOnOrOff(checkboxElement) {
    checkboxElement.checked ? localStorage.setItem("autoTurnOnAzan", JSON.stringify(!0)) : localStorage.setItem("autoTurnOnAzan", JSON.stringify(!1)), removeAzanObjectsFromSaved(), toReload();
}
function toReload() {
    location.reload();
}
setAlarmButton.addEventListener("click", function () {
    setAlarm(alarmTimeInput.value, alarmNotesInput.value);
}),
    $(window).on("load", function () {
        correctIsRunnningSetTimeoutPropertyOfAllUnringed(), btnsClearify(), (dnShowing = !0);
        let mode = JSON.parse(localStorage.getItem("mode"));
        setModeOfTheme(mode.modeClassName, mode.modeSelectedIndex),
            correctionOfStorageSizeRelated(),
            $(".pagesBtn").each(function () {
                $(this).click(function () {
                    $(".pagesBtn").removeClass("border2px"), $(this).addClass("border2px");
                });
            }),
            removeUnknownLocalStorageProperties(),
            JSON.parse(localStorage.getItem("setting")).autoDeleteRingedAlarms ? $("#deleteRingedAlarm").attr("checked", !0) : $("#deleteRingedAlarm").removeAttr("checked");
    }),
    jQuery(document).ready(function (jQueryInstance) {
        let dontShowAgainSetting = JSON.parse(localStorage.getItem("dontShowAgain"));

        function updateRingtoneSelections() {
            const azanToneSettings = JSON.parse(localStorage.getItem("defaultAzanTone"));
            const alarmToneSettings = JSON.parse(localStorage.getItem("defaultAlarmTone"));
            const azanSelect = jQueryInstance("#settingSelectRingtoneAzan");
            const alarmSelect = jQueryInstance("#settingSelectRingtoneAlarm");

            azanSelect.removeAttr("selected");
            alarmSelect.removeAttr("selected");
            jQueryInstance(azanSelect.children()[azanToneSettings.selectedToneIndex]).attr("selected", true);
            jQueryInstance(alarmSelect.children()[alarmToneSettings.selectedToneIndex]).attr("selected", true);
        }

        jQueryInstance(".mobileDetectedOk").click(function () {
            location = "https://www.google.com/";
        }),
            fetch("https://api.bigdatacloud.net/data/client-info")
                .then(function (response) {
                    return response.json();
                })
                .then(function (clientInfo) {
                    1 == clientInfo.isMobile ? ((mb = !0), jQueryInstance("#mobileDetected").modal("show"), localStorage.clear(), clearAllTimeouts()) : null === dontShowAgainSetting && jQueryInstance("#askForPermissionToPlayAudioPrompt").modal("show");
                })
                .catch(function () {
                    null === dontShowAgainSetting && jQueryInstance("#askForPermissionToPlayAudioPrompt").modal("show");
                }),
            jQueryInstance('input[role="switch"],.turnOnOrOff').each(function () {
                (this.style.userSelect = "none"), (this.nextElementSibling.style.userSelect = "none");
            }),
            jQueryInstance("#cancelConfirmation").click(function () {
                let selectedIndex = this.selectedIndex,
                    modeClassName = jQueryInstance(this).children()[selectedIndex].value;
                (obj = { modeClassName: modeClassName, modeSelectedIndex: selectedIndex }), localStorage.setItem("mode", JSON.stringify(obj)), setModeOfTheme(modeClassName, selectedIndex);
            }),
            jQueryInstance("#copyDataLocalStorage").click(function () {
                navigator.clipboard.writeText(JSON.stringify(localStorage)),
                    jQueryInstance(this).text("Copied"),
                    setTimeout(() => {
                        jQueryInstance(this).text("Copy Data");
                    }, 3e3);
            }),
            jQueryInstance("#importDataText").on("input", function () {
                !(function (importedData) {
                    try {
                        const parsedData = JSON.parse(importedData);
                        return !!(Array.isArray(JSON.parse(parsedData.allAlarmSavedList)) && isObLnN(parsedData.defaultAlarmTone, 2) && isObLnN(parsedData.defaultAzanTone, 2) && isObLnN(parsedData.mode, 2) && isObLnN(parsedData.setting, 1));
                    } catch (error) {
                        return !1;
                    }
                })(this.value)
                    ? (this.classList.add("bred"), this.classList.remove("blime"))
                    : (this.classList.remove("bred"), this.classList.add("blime"));
            }),
            jQueryInstance("#saveDataSection").click(function () {
                try {
                    const importedData = JSON.parse(this.previousElementSibling.value);
                    for (const [key, value] of Object.entries(importedData)) localStorage.setItem(key, value);
                    location.reload();
                } catch (error) {
                    showAlert("sorry something went wrong while saving and set data", 3e3, !1, "", 1e5);
                }
            });
        let defaultToneSettings = { selectedToneIndex: 0, source: "audio/Alarm0.mp3" };
        jQueryInstance("#settingSelectRingtoneAzan, #settingSelectRingtoneAlarm").on("change", function () {
            const selectedIndex = this.selectedIndex;
            defaultToneSettings.selectedToneIndex = selectedIndex;
            const toneType = this.id.includes("Alarm") ? "Alarm" : "Azan";
            const audioSource = `audio/${toneType + selectedIndex}.mp3`;
            defaultToneSettings.source = audioSource;

            if (toneType === "Azan") {
                azanAudio.src = audioSource;
            } else {
                alarmAudio.src = audioSource;
            }

            localStorage.setItem(`default${toneType}Tone`, JSON.stringify(defaultToneSettings));
            updateRingtoneSelections();
        });

        updateRingtoneSelections();
    }),
    !0 === JSON.parse(localStorage.getItem("autoTurnOnAzan")) ? document.getElementById("autoTurnOnAzan").setAttribute("checked", !0) : document.getElementById("autoTurnOnAzan").removeAttribute("checked"),
    jQuery(document).ready(function () {
        if (
            ($("#country, #city").on("change input", function () {
                locationSubmitButton.removeAttribute("disabled");
            }),
                Array.isArray(JSON.parse(localStorage.getItem("userInfo"))))
        )
            getUserGeoLocation();
        else {
            const userInfo = JSON.parse(localStorage.userInfo);
            sendRequestForAzan(userInfo.selectedIndex, userInfo.countryCode, userInfo.city, !0);
        }
        $("#locationSubmitButton").click(function () {
            removeAllAzanObjsFromLocalStorage();
            let countryCode = $("#country").val(),
                city = $("#city").val();
            city = city[0].toUpperCase() + city.slice(1);
            let selectedIndex = document.getElementById("country").selectedIndex;
            localStorage.setItem("userInfo", JSON.stringify({ selectedIndex: selectedIndex, countryCode: countryCode, city: city })), this.setAttribute("disabled", !0), sendRequestForAzan(selectedIndex, countryCode, city, !0);
        }),
            $("#azanBtn").click(function () {
                azanContainer.innerHTML.length < 10 && showAlarmList(!1, !1, !1, !0);
            }),
            $(".toneTackle1").each(function () {
                $(this).click(function () {
                    $(".toneTackle1").removeAttr("disabled"), $(this).attr("disabled", !0);
                });
            }),
            $(".toneTackle2").each(function () {
                $(this).click(function () {
                    $(".toneTackle2").removeAttr("disabled"), $(this).attr("disabled", !0);
                });
            }),
            azanPlayButton.addEventListener("click", function () {
                azanAudio.play();
            }),
            azanPauseButton.addEventListener("click", function () {
                azanAudio.pause();
            }),
            azanStopButton.addEventListener("click", function () {
                azanAudio.pause(), (azanAudio.currentTime = 0);
            }),
            alarmPlayButton.addEventListener("click", function () {
                alarmAudio.play();
            }),
            alarmPauseButton.addEventListener("click", function () {
                alarmAudio.pause();
            }),
            alarmStopButton.addEventListener("click", function () {
                alarmAudio.pause(), (alarmAudio.currentTime = 0);
            }),
            $("#allowAudioSound").click(function () {
                document.getElementById("dontShowAgain").checked && localStorage.setItem("dontShowAgain", JSON.stringify(!0));
            });
    }),
    setTimeout(() => {
        toReload();
    }, 2592e5);

// Event handlers for audio controls
azanPlayButton.addEventListener("click", function () {
    azanAudio.play();
});

azanPauseButton.addEventListener("click", function () {
    azanAudio.pause();
});

azanStopButton.addEventListener("click", function () {
    azanAudio.pause();
    azanAudio.currentTime = 0;
});

alarmPlayButton.addEventListener("click", function () {
    alarmAudio.play();
});

alarmPauseButton.addEventListener("click", function () {
    alarmAudio.pause();
});

alarmStopButton.addEventListener("click", function () {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
});

// Location related functions
function getUserGeoLocation() {
    fetch("https://api.bigdatacloud.net/data/reverse-geocode-client")
        .then(function (response) {
            return response.json();
        })
        .then(function (geoData) {
            const defaultCountryCode = geoData.countryCode || "BD";
            const cityName = geoData.city || geoData.locality || "Sylhet";

            countrySelectOptions.removeAttr("selected");
            cityInput.value = cityName;

            // Find and set the correct country option
            countrySelectOptions.each(function (index) {
                if (this.value === defaultCountryCode) {
                    selectedIndex = index;
                    this.setAttribute("selected", true);
                    return;
                }
            });

            const userInfo = {
                selectedIndex: selectedIndex,
                countryCode: defaultCountryCode,
                city: cityName
            };

            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            sendRequestForAzan(userInfo.selectedIndex, userInfo.countryCode, userInfo.city, true);
        })
        .catch(function (error) {
            console.error("Error getting geolocation:", error);
        });
}

// Auto refresh page after 3 days (in milliseconds)
setTimeout(() => {
    toReload();
}, 259200000); // 3 * 24 * 60 * 60 * 1000

// Initialization on window load
$(window).on("load", function () {
    correctIsRunnningSetTimeoutPropertyOfAllUnringed();
    btnsClearify();
    dnShowing = true;

    const mode = JSON.parse(localStorage.getItem("mode"));
    setModeOfTheme(mode.modeClassName, mode.modeSelectedIndex);
    correctionOfStorageSizeRelated();

    // Initialize page buttons
    $(".pagesBtn").each(function () {
        $(this).click(function () {
            $(".pagesBtn").removeClass("border2px");
            $(this).addClass("border2px");
        });
    });

    removeUnknownLocalStorageProperties();

    // Set auto delete ringed alarms checkbox
    const settings = JSON.parse(localStorage.getItem("setting"));
    if (settings.autoDeleteRingedAlarms) {
        $("#deleteRingedAlarm").attr("checked", true);
    } else {
        $("#deleteRingedAlarm").removeAttr("checked");
    }
});

// jQuery initialization and event handlers
$(document).ready(function () {
    const settingsConfig = {
        audioPermission: JSON.parse(localStorage.getItem("dontShowAgain")),
        mobileRedirectUrl: "https://www.google.com/"
    };

    // Mobile detection handlers
    function handleMobileDetection() {
        $(".mobileDetectedOk").click(function () {
            location = settingsConfig.mobileRedirectUrl;
        });

        fetch("https://api.bigdatacloud.net/data/client-info")
            .then(response => response.json())
            .then(clientInfo => {
                if (clientInfo.isMobile) {
                    window.mb = true;
                    $("#mobileDetected").modal("show");
                    localStorage.clear();
                    clearAllTimeouts();
                } else if (settingsConfig.audioPermission === null) {
                    $("#askForPermissionToPlayAudioPrompt").modal("show");
                }
            })
            .catch(() => {
                if (settingsConfig.audioPermission === null) {
                    $("#askForPermissionToPlayAudioPrompt").modal("show");
                }
            });
    }

    // Initialize UI elements
    function initializeUserInterface() {
        // Initialize switch inputs with no text selection
        $('input[role="switch"], .turnOnOrOff').each(function () {
            const element = $(this);
            element.css('user-select', 'none');
            element.next().css('user-select', 'none');
        });

        // Initialize delete confirmation dialog
        $("#cancelConfirmation").click(function () {
            $(".btn-close").click();
            $("body").css({ "overflow-y": "scroll !important" });
        });

        $("#acceptConfirmation").click(deleteAlarmsAllFromLocalStorage);

        // Initialize filter handlers
        $(".filter-alarms").each(function () {
            $(this).click(function () {
                const filterElement = $(this);
                filterElement.addClass("none");

                if (this.id === "Grouping") {
                    filterElement.prev().prev().toggleClass("none");
                    filterMessageBox.innerText = "Latest First";
                } else {
                    filterElement.next().toggleClass("none");
                    filterMessageBox.innerText = this.nextElementSibling.id.replace("-", " ");
                }
                showAlarmList(true);
            });
        });

        // Initialize settings panel
        $("#setting").click(() => $("#settingPage").show(500));

        // Initialize location inputs
        $("#country, #city").on("change input", function () {
            locationSubmitButton.removeAttribute("disabled");
        });

        if (Array.isArray(JSON.parse(localStorage.getItem("userInfo")))) {
            getUserGeoLocation();
        } else {
            const userInfo = JSON.parse(localStorage.userInfo);
            sendRequestForAzan(
                userInfo.selectedIndex,
                userInfo.countryCode,
                userInfo.city,
                true
            );
        }
    }

    // Initialize audio controls
    function initializeAudioControls() {
        $(".toneTackle1, .toneTackle2").each(function () {
            $(this).click(function () {
                const buttonClass = $(this).hasClass("toneTackle1") ?
                    ".toneTackle1" : ".toneTackle2";
                $(buttonClass).removeAttr("disabled");
                $(this).attr("disabled", true);
            });
        });

        $("#allowAudioSound").click(function () {
            if ($("#dontShowAgain").prop("checked")) {
                localStorage.setItem("dontShowAgain", "true");
            }
        });
    }

    // Start initialization
    handleMobileDetection();
    initializeUserInterface();
    initializeAudioControls();
});

// Settings and data management handlers
$("#settingSelectMode").on("change", function () {
    const selectedIndex = this.selectedIndex;
    const modeClassName = $(this).children()[selectedIndex].value;
    const modeConfig = {
        modeClassName: modeClassName,
        modeSelectedIndex: selectedIndex
    };

    localStorage.setItem("mode", JSON.stringify(modeConfig));
    setModeOfTheme(modeClassName, selectedIndex);
});

// Data import/export handlers
$("#copyDataLocalStorage").click(function () {
    navigator.clipboard.writeText(JSON.stringify(localStorage));
    $(this).text("Copied");

    setTimeout(() => {
        $(this).text("Copy Data");
    }, 3000);
});

$("#importDataText").on("input", function () {
    const isValidData = validateImportedData(this.value);
    if (!isValidData) {
        this.classList.add("bred");
        this.classList.remove("blime");
    } else {
        this.classList.remove("bred");
        this.classList.add("blime");
    }
});

// Timing and prayer schedule functions
function setupDailyPrayerAlarms() {
    const prayerNames = ["Isha", "Magrib", "Asar", "Dhuhor", "Fajr"];
    const prayerDurations = [
        7200000,  // 2 hours
        600000,   // 10 minutes
        2100000,  // 35 minutes
        3600000,  // 1 hour
        3000000   // 50 minutes
    ];

    const todayTimings = Object.values(JSON.parse(localStorage.getItem("todayTimings"))).reverse();
    const prayerCount = todayTimings.length;
    const autoTurnOnAzan = JSON.parse(localStorage.getItem("autoTurnOnAzan"));
    const isEndMaxDone = JSON.parse(localStorage.getItem("isEndMaxDone"));

    for (let index = 0; index < prayerCount; index++) {
        const prayerTime = convertToToday(todayTimings[index]);
        prayerTime.setTime(prayerTime.getTime() + index);

        if (autoTurnOnAzan === true) {
            if (isEndMaxDone === true) {
                addInLocalStorage(
                    prayerNames[index],
                    new Date(prayerTime),
                    false,
                    true
                );
            } else {
                addInLocalStorage(
                    prayerNames[index],
                    new Date(prayerTime),
                    false,
                    true,
                    prayerTime.getTime() + prayerDurations[index],
                    prayerTime.getTime()
                );
            }
        } else {
            if (isEndMaxDone === true) {
                addInLocalStorage(
                    prayerNames[index],
                    new Date(prayerTime),
                    false,
                    false
                );
            } else {
                addInLocalStorage(
                    prayerNames[index],
                    new Date(prayerTime),
                    false,
                    false,
                    prayerTime.getTime() + prayerDurations[index],
                    prayerTime.getTime()
                );
            }
        }
    }

    if (isEndMaxDone === null) {
        localStorage.setItem("isEndMaxDone", JSON.stringify(true));
    }
}

function convertToToday(timeString) {
    const currentDate = new Date();
    const [hours, minutes] = timeString.split(" ")[0].split(":");

    currentDate.setHours(parseInt(hours), parseInt(minutes), 0);
    return currentDate;
}

// Data validation functions
function validateImportedData(importedData) {
    try {
        const parsedData = JSON.parse(importedData);
        const isValid = (
            Array.isArray(JSON.parse(parsedData.allAlarmSavedList)) &&
            isObjectWithLength(parsedData.defaultAlarmTone, 2) &&
            isObjectWithLength(parsedData.defaultAzanTone, 2) &&
            isObjectWithLength(parsedData.mode, 2) &&
            isObjectWithLength(parsedData.setting, 1)
        );
        return isValid;
    } catch (error) {
        return false;
    }
}

function isObjectWithLength(objectString, length) {
    return Object.keys(JSON.parse(objectString)).length === length;
}

// Save imported data
$("#saveDataSection").click(function () {
    try {
        const importedData = JSON.parse(this.previousElementSibling.value);
        for (const [key, value] of Object.entries(importedData)) {
            localStorage.setItem(key, value);
        }
        location.reload();
    } catch (error) {
        showAlert("Sorry, something went wrong while saving and setting data", 3000, false, "", 100000);
    }
});

// Ringtone selection handlers
let defaultToneSettings = { selectedToneIndex: 0, source: "audio/Alarm0.mp3" };
$("#settingSelectRingtoneAzan, #settingSelectRingtoneAlarm").on("change", function () {
    const selectedIndex = this.selectedIndex;
    defaultToneSettings.selectedToneIndex = selectedIndex;
    const toneType = this.id.includes("Alarm") ? "Alarm" : "Azan";
    const audioSource = `audio/${toneType + selectedIndex}.mp3`;
    defaultToneSettings.source = audioSource;

    if (toneType === "Azan") {
        azanAudio.src = audioSource;
    } else {
        alarmAudio.src = audioSource;
    }

    localStorage.setItem(`default${toneType}Tone`, JSON.stringify(defaultToneSettings));
    updateRingtoneSelections();
});

function updateRingtoneSelections() {
    const azanToneSettings = JSON.parse(localStorage.getItem("defaultAzanTone"));
    const alarmToneSettings = JSON.parse(localStorage.getItem("defaultAlarmTone"));
    const azanSelect = $("#settingSelectRingtoneAzan");
    const alarmSelect = $("#settingSelectRingtoneAlarm");

    azanSelect.removeAttr("selected");
    alarmSelect.removeAttr("selected");
    $(azanSelect.children()[azanToneSettings.selectedToneIndex]).attr("selected", true);
    $(alarmSelect.children()[alarmToneSettings.selectedToneIndex]).attr("selected", true);
}

updateRingtoneSelections();

// Auto turn on Azan checkbox handler
if (JSON.parse(localStorage.getItem("autoTurnOnAzan")) === true) {
    document.getElementById("autoTurnOnAzan").setAttribute("checked", true);
} else {
    document.getElementById("autoTurnOnAzan").removeAttribute("checked");
}

// Location input change handler
$("#country, #city").on("change input", function () {
    locationSubmitButton.removeAttribute("disabled");
});

// Location submit button handler
$("#locationSubmitButton").click(function () {
    removeAllAzanObjsFromLocalStorage();
    const countryCode = $("#country").val();
    let city = $("#city").val();
    city = city[0].toUpperCase() + city.slice(1);
    const selectedIndex = document.getElementById("country").selectedIndex;
    const userInfo = { selectedIndex: selectedIndex, countryCode: countryCode, city: city };

    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    this.setAttribute("disabled", true);
    sendRequestForAzan(selectedIndex, countryCode, city, true);
});

// Azan button handler
$("#azanBtn").click(function () {
    if (azanContainer.innerHTML.length < 10) {
        showAlarmList(false, false, false, true);
    }
});

// Tone tackle button handlers
$(".toneTackle1").each(function () {
    $(this).click(function () {
        $(".toneTackle1").removeAttr("disabled");
        $(this).attr("disabled", true);
    });
});

$(".toneTackle2").each(function () {
    $(this).click(function () {
        $(".toneTackle2").removeAttr("disabled");
        $(this).attr("disabled", true);
    });
});

// Audio control button handlers
azanPlayButton.addEventListener("click", function () {
    azanAudio.play();
});

azanPauseButton.addEventListener("click", function () {
    azanAudio.pause();
});

azanStopButton.addEventListener("click", function () {
    azanAudio.pause();
    azanAudio.currentTime = 0;
});

alarmPlayButton.addEventListener("click", function () {
    alarmAudio.play();
});

alarmPauseButton.addEventListener("click", function () {
    alarmAudio.pause();
});

alarmStopButton.addEventListener("click", function () {
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
});

// Allow audio sound button handler
$("#allowAudioSound").click(function () {
    if (document.getElementById("dontShowAgain").checked) {
        localStorage.setItem("dontShowAgain", JSON.stringify(true));
    }
});
