// handling null for localstorage properties ----
console.log('----  Do not run any unnecessary script else it can destroy this app ----')
nullHandleForThisLocalStorageProperty('allAlarmSavedList', [])
nullHandleForThisLocalStorageProperty('mode', {
    "modeClassName": "bg-light",
    "modeSelectedIndex": 0
})
var defAznSrc = 'audio/Azan0.mp3'
var defAlrmSrc = 'audio/Alarm0.mp3'
nullHandleForThisLocalStorageProperty('defaultAzanTone', {
    nthNumberSelected: 0,
    src: defAznSrc
})
nullHandleForThisLocalStorageProperty('defaultAlarmTone', {
    nthNumberSelected: 0,
    src: defAlrmSrc
})
nullHandleForThisLocalStorageProperty('setting', {
    automaticallyDeleleRingedAlarms: false
})
nullHandleForThisLocalStorageProperty('userInfo', [])
nullHandleForThisLocalStorageProperty('todayTimings', [])

// -------------------------------------------------------------------------------
let runningAudio = false;

const azanAudio = new Audio(defAznSrc)
azanAudio.setAttribute('preload', 'metadata')

const alarmAudio = new Audio(defAlrmSrc)
alarmAudio.setAttribute('preload', 'metadata')
alarmAudio.loop = true

const setAlarmBtn = document.getElementById('setAlarm'),
    alarmInput = document.getElementById('alarmInput'),
    noteAlarmInput = document.getElementById('notesAlarmInput'),
    setAlarmList = document.getElementById('setAlarmList'),
    alertBox = document.getElementById('alertBox'),
    deleteAllAlarms = document.getElementById('deleteAllAlarms'),
    totalAlarm = document.getElementById('totalAlarm'),
    filteringBox = document.getElementById('filtering-msg'),
    pages = document.getElementsByClassName('pages'),
    tcle = Array.from(document.getElementsByClassName('tackle')),
    countryOptions = $('#country option'),
    cty = document.getElementById('city'),
    setLocation = document.getElementById('setLocation'),
    azanDataDisplayToday = document.getElementById('azanDataDisplayToday'),
    azanDataDisplayMonth = document.getElementById('azanDataDisplayMonth'),
    tbody = document.getElementById('tbody'),
    tbody2 = document.getElementById('tbody2'),
    azanBox = document.getElementById('azanVoice'),
    playAudio1 = document.getElementById('playAudio1'),
    pauseAudio1 = document.getElementById('pauseAudio1'),
    stopAudio1 = document.getElementById('stopAudio1'),
    playAudio2 = document.getElementById('playAudio2'),
    pauseAudio2 = document.getElementById('pauseAudio2'),
    stopAudio2 = document.getElementById('stopAudio2')

// go to another page and nav
function goToPage(b) {
    const i = b.id.replace('Btn', '') + 'Page'
    Array.from(pages).forEach(function (e) {
        e.classList.add('none')
    })
    document.getElementById(i).classList.remove('none')

}
$('.navbar-nav li').click(function () {
    $('#toggleMenuBar').click()
})

// variables for store ---
let collapseIds = []
// setting variables ---
let defaultTone;
// adding default date in alarmInput 
const today = new Date()
// function to use in globally all over in this webpage
function clearAllTimeouts() {
    const h = window.setTimeout(() => {
        for (let i = h; i >= 0; i--) {
            window.clearInterval(i);
        }
    }, 0);
}
function fmt(_) {
    _ = (_.split(' ')[0]).split(':')
    let x = parseInt(_[0])
    let y = ':' + parseInt(_[1])
    if (x > 12) {
        x = x - 12
        return x + y + ' PM'
    }
    else {
        return x + y + ' AM'
    }

}
function removeUnknownLocalStorageProperties() {
    const l = localStorage.length
    const t = ['lastShownOf','isEndMaxDone', 'allAlarmSavedList', 'defaultAlarmTone', 'defaultAzanTone', 'mode', 'setting', 'aboutAzan', 'userInfo', 'todayTimings', 'autoTurnOnAzan']
    for (let i = 0; i < l; i++) {
        const e = localStorage.key(i)
        if (!t.includes(e)) {
            localStorage.removeItem(e)
        }
    }
}
function getAzanObjects() {
    const x = []
    const a = JSON.parse(localStorage.allAlarmSavedList)
    const _ = a.length
    for (let i = 0; i < _; i++) {
        const o = a[i]
        if (o.isItForAzan) {
            x.push(o)
        }
    }
    return x
}
function removeAzanObjectsFromSaved() {
    clearAllTimeouts()
    const x = []
    const a = JSON.parse(localStorage.allAlarmSavedList)
    const _ = a.length
    for (let i = 0; i < _; i++) {
        const o = a[i]
        if (!o.isItForAzan) {
            x.push(o)
        }
    }
    localStorage.setItem('allAlarmSavedList', JSON.stringify(x))
    return x
}
function getDateTimeLocalToDateObj(value) {
    const result = new Date(value)
    return result
}
function makeStr(l = 30, c = false) {
    var result = '';
    var cs = c ? c : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var csLen = cs.length;
    for (var i = 0; i < l; i++) {
        result += cs.charAt(Math.floor(Math.random() * csLen));
    }
    return result;
}
function removeNullsFromThisList(list) {
    return list.filter((i) => {
        return i !== null
    })

}
function removeThisValuesItemsFromObjectsList(objList, p, v) {
    return objList.filter((o) => {
        return o[p] === v
    })
}
function getLocalStorageSizeInKB(returnPercentage = false) {
    let x = 0, L, i;
    for (i in localStorage) {
        if (!localStorage.hasOwnProperty(i)) continue;
        L = (localStorage[i].length + i.length) * 2;
        x += L;
    }
    if (returnPercentage) {
        return parseFloat((((x / 1024) / (5120)) * 100).toFixed(2))
    }
    return (x / 1024);
}
function getGroupingResult(t, s) {
    const tMs = t.getTime()
    const sMs = s.getTime()
    const tD = t.getDate()
    const tM = t.getMonth()
    const tY = t.getFullYear()
    const sD = s.getDate()
    const sM = s.getMonth()
    const sY = s.getFullYear()
    const SD = sD == tD ? true : false
    const SM = tM == sM ? true : false
    const SY = tY == sY ? true : false
    const SW = parseInt((sMs - tMs) / 1000 / 60) < 10081 ? true : false
    var r;
    if (tMs > sMs) {
        r = 'Past'
    }
    else if (SD && SM && SY)
        r = 'Today'

    else if ((sD === (tD + 1)) && SM && SY) {
        r = 'Tomorrow'
    }
    else if (SW) {
        r = 'This Week'
    }
    else if (SM && SY) {
        r = 'This Month'
    }
    else if (SY && (tM === (sM + 1))) {
        r = 'Next Month'
    }
    else if ((sY === (tY + 1)) && (sM === (tM - 11))) {
        r = 'Next Month'
    }
    else if (SY) {
        r = 'This Year'
    }
    else if (sY === tY + 1) {
        r = 'Next Year'
    }
    else {
        r = 'After'
    }
    return `
    <box class="d-flex align-items-center justify-space-between">
        <p class="title my-2 w-100 text-center border rm-bg-info bg-secondary white">${r}</p>
        <i class="px-3 bg-secondary white bi bi-arrows-angle-expand expandOrCollapseItems onclick="collapseTillNext()"></i>
    </box>
        `
}
function sortBeutify() {
    const p = []
    $('p.title').each(function () {
        if (p.includes(this.innerText)) {
            this.parentElement.remove()
        }
        else {
            p.push(this.innerText)
        }
    })
}
function collapseTillNext(e) {
    let i = 0
    var n;
    e.classList.toggle('bi-arrows-angle-contract')
    n = e.parentElement.nextElementSibling.nextElementSibling
    while (true) {
        i++
        n.classList.toggle('show')
        const x = n.nextElementSibling
        if (x === null || x.nodeName === 'BOX') {
            break
        } else {
            n = n.nextElementSibling.nextElementSibling
        }
        if (i > 50) {
            break
        }
    }
}
function nullHandleForThisLocalStorageProperty(propertyNameString, setThisIfNull = false, localStorageItis = true) {
    let e = []
    const p = JSON.parse(localStorage.getItem(propertyNameString))
    if ((p === null) || (p === [])) {
        if (setThisIfNull) {
            localStorageItis ? localStorage.setItem(propertyNameString, JSON.stringify(setThisIfNull)) : sessionStorage.setItem(propertyNameString, JSON.stringify(setThisIfNull))
        }
        else {
            localStorageItis ? localStorage.setItem(propertyNameString, JSON.stringify(e)) : sessionStorage.setItem(propertyNameString, JSON.stringify(setThisIfNull))
        }
    }
    toSave = JSON.parse(localStorage.getItem('allAlarmSavedList'))
}
// isObLnN use json.parse so object must be stringify format
function isObLnN(o, n) {
    return Object.keys(JSON.parse(o)).length === n ? true : false
}
// ============setting ==============

var mode = localStorage.getItem('mode')
// ==================================



// ============alarm ================

// variable (toSave)  is to save data alarm related
var toSave = []
// function related alarms
function isThereNoAlarm() {
    nullHandleForThisLocalStorageProperty("allAlarmSavedList")
    const l = (removeThisValuesItemsFromObjectsList(JSON.parse(localStorage.getItem('allAlarmSavedList')), 'isItForAzan', false)).length
    return l === 0 ? true : false
}

function btnsClearify() {
    if (!isThereNoAlarm()) {
        deleteAllAlarms.removeAttribute("disabled")
    }
    else {
        deleteAllAlarms.setAttribute("disabled", true)

    }
}
function getDateTimeLocalToDateObj(value) {
    return new Date(value)
}
function addInLocalStorage(alarmNote, alarmDateTime, alarm = true, doTurnOn = true, endMax = false, realTime = false) {
    if (alarmNote.length === 0) {
        alarmNote = 'Alarm'
    }
    let alarmObj = {
        isItForAzan: alarm ? false : true,
        id: 'id' + new Date(alarmDateTime).getTime(),
        title: alarmNote,
        datetime: alarmDateTime,
        isRunningSetTimeout: false,
        isTurnedOn: doTurnOn,
        isDoneRingingOrStarted: false,
        endMax: endMax,
        realTime: realTime
    }
    nullHandleForThisLocalStorageProperty('allAlarmSavedList')
    toSave.push(alarmObj)
    localStorage.setItem('allAlarmSavedList', JSON.stringify(toSave))
}
function showMsgIfNoAlarm() {
    if (isThereNoAlarm()) {
        setAlarmList.innerHTML = `<h3 style="font-size:1.3rem;text-align:center;font-family:'Arial';opacity:.4;">No Alarm</h3>`
    }
}
function showAlert(msg = 'Something went wrong, please try again', countMilSecond = 3000, successMsg = true, msgExtra = false, zindex = 10000000) {
    const i = makeStr(10)
    const alert =
        `
    <div id="${i}" class="alert ${successMsg ? 'alert-success' : 'alert-danger'} alert-dismissible fade show text-center fixed-top alert-div" role="alert" style="zindex:${zindex}">
        ${successMsg ? '<i class="bi bi-check-circle-fill alert-icon"></i>' : '<i class="bi bi-exclamation-circle-fill alert-icon"></i>'}
        <span>${msg}</span>
        <strong> ${msgExtra ? msgExtra : ''}</strong>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `
    alertBox.innerHTML = alert
    const e = $('#' + i)
    setTimeout(() => {
        e.remove()
    }, countMilSecond);
    return i
}
function stopAlarm() {

}
function deleteAlarmFromLocalStorage(id) {
    for (let i = 0; i < toSave.length; i++) {
        if (toSave[i].id === id) {
            delete toSave[i]
            localStorage.setItem('allAlarmSavedList', JSON.stringify(toSave))
        }
    }
    showAlarmList(true)
    btnsClearify()
}
function deleteAlarmsAllFromLocalStorage() {
    $('.alarmBoxPieces').hide(510)
    setTimeout(() => {
        if ($('.armlaBoxPieces').length !== 0) {
            $('.alarmBoxPieces').remove()
        }
        $('#setAlarmList').empty(1010)
        toSave = []
        localStorage.setItem("allAlarmSavedList", JSON.stringify(toSave))
        showAlarmList(true)
        btnsClearify()
    }, 500);
}
function getDateObjectOfNextDayIfInFuture(datetimeObj) {
    const t = new Date().getTime()
    let n = new Date(datetimeObj).getTime() + 86400000
    while (true) {
        if (n < t) {
            n += 86400000
        }
        else {
            break
        }
    }
    return new Date(n)
}
function getAlarmObjectPropertyValueById(d, p, _ = false) {
    const a = JSON.parse(localStorage.getItem('allAlarmSavedList'))
    const l = a.length
    for (let i = 0; i < l; i++) {
        const o = a[i]
        if (o.id === d) {
            return !_ ? o[p] : o
        }
    }
}
function setAlarmObjectProperty(x, p, v, c = false) {
    const a = []
    const s = JSON.parse(localStorage.getItem('allAlarmSavedList'))
    const l = s.length
    for (let i = 0; i < l; i++) {
        const o = s[i]
        if ((o !== null) && (o.id === x)) {
            o[p] = v
            if (c) {
                o['isRunningSetTimeout'] = false
                o['isDoneRingingOrStarted'] = false
                o['isTurnedOn'] = true
            }
            a.push(o)
        }
        else {
            a.push(o)
        }
    }
    localStorage.setItem("allAlarmSavedList", JSON.stringify(a))

}
function setAllPastTimeCorrected() {
    if (JSON.parse(localStorage.getItem('allAlarmSavedList')).length !== 0) {
        const d = JSON.parse(localStorage.getItem('setting')).automaticallyDeleleRingedAlarms ? true : false
        const s = JSON.parse(localStorage.allAlarmSavedList)
        const l = s.length
        const a = []
        const t = new Date().getTime()
        for (let i = 0; i < l; i++) {
            const e = s[i]
            if (new Date(e.datetime).getTime() > t) {
                a.push(e)
            }
            else {
                if (!d) {
                    e.isDoneRingingOrStarted = true
                    e.isRunningSetTimeout = false
                    a.push(e)
                }
            }
        }
        localStorage.setItem('allAlarmSavedList', JSON.stringify(a))
        return a
    }
    else {
        a = nullHandleForThisLocalStorageProperty('allAlarmSavedList', [])
    }
}
function editButtonClearifyAzan() {
    const s = JSON.parse(localStorage.getItem('allAlarmSavedList'))
    const l = s.length
    for (let i = 0; i < l; i++) {
        const o = s[i]
        if (o.isItForAzan && (new Date(o.datetime).getTime() < new Date().getTime())) {
            document.getElementById(o.id).firstElementChild.firstElementChild.setAttribute('disabled', true)
        }
    }
}
function correctIsRunnningSetTimeoutPropertyOfAllUnringed() {
    const n = []
    toSave = removeNullsFromThisList(JSON.parse(localStorage.getItem("allAlarmSavedList")))
    const d = new Date().getTime()
    for (let i = 0; i < toSave.length; i++) {
        const a = toSave[i]
        if ((new Date(a.datetime).getTime() > d) && (!a.isDoneRingingOrStarted)) {
            a.isRunningSetTimeout = false
        }
        n.push(a)
    }
    localStorage.setItem("allAlarmSavedList", JSON.stringify(n))
    checkAndRingAlarm()
}
function tackle(d = true) {
    tcle.forEach(function (_) {
        d ? _.removeAttribute('disabled') : _.setAttribute('disabled', true)
    })
}
function closeToneAndCorrectionAfterToneEnding(e) {
    try {
        e.parentElement.parentElement.parentElement.remove()
    } catch (e) {
    }
    tackle(true)
    azanAudio.currentTime = 0
    azanAudio.pause()
    alarmAudio.currentTime = 0
    alarmAudio.pause()

}
function toggleMuteAzanAudio(e) {
    if (azanAudio.muted) {
        azanAudio.muted = false
        e.innerText = 'Mute'
    } else {
        azanAudio.muted = true
        e.innerText = 'Unmute'
    }
}
function sideCollapseDisplayAudio(v = false) {
    const e = $('#audioRingingDisplay')
    const i = $('#firstOfRingingDisplay')
    if (!v) {
        e.css({ 'height': '200px' })
        $('.toHideOnSideCollapse').addClass('none')
        $('.toShowOnSideCollapse').removeClass('none')
    }
    else {
        $('.toHideOnSideCollapse').removeClass('none')
        $('.toShowOnSideCollapse').addClass('none')
    }
    e.toggleClass('leftSlide')
    i.toggleClass('widthSetAlarmAudioDisplay')
}
function correctAfterToneEnding() {
    try {
        runningAudio = false
        $('.tackle').removeAttr('disabled')
        const e = document.getElementById('audioRingingDisplay')
        if (e !== null && e !== undefined) {
            e.remove()

        }
    } catch (e) {

    }
}
function displayAudioRinging(itIsAlarm = true, t = 'No Title', tm = 180000) {
    if (itIsAlarm === true) {
        alarmAudio.play()
    } else {
        azanAudio.play()
    }
    tackle(false)
    const d = new Date()

    if (document.getElementById('audioRingingDisplay') === null) {
        const elm = document.createElement('div')
        elm.innerHTML =
            `
    <div class="fixed position-fixed fixed-center-custom" style="background:transparent!important;" id="audioRingingDisplay">
    <div class="card text-center shadow-lg" id="firstOfRingingDisplay">
        <div class="toHideOnSideCollapse card-header d-flex justify-content-between">
            <h5 class="toHideOnSideCollapse">${t}</h5>
            <button class="btn btn-close" onclick="closeToneAndCorrectionAfterToneEnding(this),correctAfterToneEnding()"></button>
        </div>
        <div class="toHideOnSideCollapse card-body">
            <h1><span class="badge px-4 py-2 m-hide text-bg-info mx-3 getCurrentTimeClass">${d.toLocaleString(undefined, { timeStyle: 'short' })}</span></h1>
            <h2><span class="badge px-4 py-2 m-hide text-bg-info mx-3 getCurrentTimeClass">${d.toLocaleString(undefined, { dateStyle: 'medium' })}</span></h2>
            <button class="btn btn-danger" ${itIsAlarm === true ? 'onclick="closeToneAndCorrectionAfterToneEnding(this)">Stop' : 'onclick="toggleMuteAzanAudio(this)">Mute'}</button>
        </div>
        <div class="card-footer d-flex justify-content-between">
            <h5 class="toHideOnSideCollapse">${itIsAlarm === true ? 'Alarm Ringing' : 'Azan | Adhan voice'} ...</h5>
            <div class="p-1"><i onclick="sideCollapseDisplayAudio()" class="bi bi-chevron-right toHideOnSideCollapse" style="font-size:1.3rem;"></i></div>
            <div class="p-1" style="transform: translate(-15px, 0px)!important;"><i onclick="sideCollapseDisplayAudio(true)" class="bi bi-chevron-left toShowOnSideCollapse none" style="font-size:1.3rem;"></i></div>
        </div>
    </div>
    </div>
        `
        document.body.appendChild(elm)
    }
    try {
        setTimeout(() => {

            closeToneAndCorrectionAfterToneEnding()

            correctAfterToneEnding()

        }, tm);
    } catch (e) {

    }
}
function removeAllAzanObjsFromLocalStorage() {
    const a = []
    const s = JSON.parse(localStorage.getItem('allAlarmSavedList'))
    const l = s.length
    for (let i = 0; i < l; i++) {
        const o = s[i]
        if ((o !== null) && (!(o.isItForAzan))) {
            a.push(o)
        }
    }
    localStorage.setItem("allAlarmSavedList", JSON.stringify(a))
}
function checkAndRingAlarm() {
    clearAllTimeouts()

    const n = new Date().getTime()
    toSave = removeNullsFromThisList(toSave)
    toSave.forEach(function (to) {
        const a = new Date(to.datetime).getTime()
        const t = to.title
        const i = to.id
        if ((a > n) && ((a - n) > 2000) && (to.isTurnedOn) && (!to.isRunningSetTimeout) && ((a - n) < 259200000)) {
            setAlarmObjectProperty(i, 'isRunningSetTimeout', true)
            setTimeout(() => {
                if ((getAlarmObjectPropertyValueById(i, 'isTurnedOn')) && (!(getAlarmObjectPropertyValueById(i, 'isRunningSetTimeout')))) {
                    setAlarmObjectProperty(i, 'isRunningSetTimeout', false)
                    if (!(runningAudio)) {
                        runningAudio = true
                        if (getAlarmObjectPropertyValueById(i, 'isItForAzan')) {
                            azanAudio.src = JSON.parse(localStorage.getItem('defaultAzanTone')).src
                            const d = JSON.parse(localStorage.getItem('defaultAzanTone')).nthNumberSelected === 0 ? 247500 : 152500
                            displayAudioRinging(false, t, d)
                        }
                        else {
                            alarmAudio.src = JSON.parse(localStorage.getItem('defaultAlarmTone')).src
                            // console.log('yes')
                            displayAudioRinging(true, t)
                        }
                    }
                    //----
                    setAlarmObjectProperty(i, 'isTurnedOn', false)
                    setAlarmObjectProperty(i, 'isDoneRingingOrStarted', true)
                }
                showAlarmList(true, false, false, true)
                btnsClearify()
            }, a - n);
        }
        if ((a < n) && (to.isTurnedOn)) {
            setAlarmObjectProperty(i, 'isTurnedOn', false)
        }

    })

}
// function to sort alarms for grouping 
function sortForGrouping(list) {
    const sorted = list.sort(function (a, b) {
        return parseInt(a.id.replace('id', '')) - parseInt(b.id.replace('id', ''));
    });
    return sorted
}
function editObject(e) {
    const prevIf = document.getElementById('editDiv')
    if (prevIf !== null) {
        prevIf.remove()
    }
    const Id = e.id,
        info = getAlarmObjectPropertyValueById(Id, '', true),
        itsAzan = info.isItForAzan ? true : false,
        prevNotes = info.title,
        real = info.realTime,
        prevDatetime = new Date(info.datetime),
        editDiv = document.createElement('div')
    editDiv.id = 'editDiv'
    editDiv.innerHTML = `
    <div class="card-body">
    <div class="flex-center">
        <h5 class="card-title my-3 text-center">${itsAzan ? "Customize Today's Azan Time" : 'Edit Alarm'}</h5>
        <button class="btn btn-close" id="cancelEdit"></button>
    </div>
    <hr>
    <h5 class="p-title my-2 text-center">${itsAzan ? "Azan's" : "Alarm's"} Info</h5>
    <div class="prevInfo">
    <h6 class="mb-2 text-muted">${itsAzan ? 'For ' : 'Title'} : ${prevNotes}</h6>
    ${itsAzan ? `<h6 class="mb-2 text-muted">Real Time Start : ${new Date(real).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</h6>` : ''}
    <h6 class="mb-2 text-muted">Datetime : ${prevDatetime.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</h6>
    </div>
    <hr>
    ${!itsAzan ? `<h6 class="card-subtitle mb-2">Edit note title if you want</h6>
    <input id="notesAlarmInputEdit" type="text" class="mb-3 w-50 form-control"
    placeholder="Something.."></input>` : ''}

    <h6 class="card-subtitle mb-2">Edit the date and time</h6>
    <input id="alarmInputEdit" type="datetime-local" class="mb-3 w-50 form-control"></input>
    <br>
    <button disabled id="setAlarmEdit" class="btn btn-primary">Save Changes</button>
    </div>

    `
    document.body.appendChild(editDiv)
    const notesAlarmInputEdit = document.getElementById('notesAlarmInputEdit'),
        alarmInputEdit = document.getElementById('alarmInputEdit'),
        setAlarmEdit = document.getElementById('setAlarmEdit'),
        cancelEdit = document.getElementById('cancelEdit'),
        prevTime = prevDatetime.getTime()
    let noteOk = false, datetimeOk = false
    if (!itsAzan) {
        notesAlarmInputEdit.addEventListener('input', function () {
            const v = this.value
            if (v !== prevNotes && v !== '') {
                noteOk = true
                setAlarmEdit.removeAttribute('disabled')
            } else {
                setAlarmEdit.setAttribute('disabled', true)
            }
        })
    }
    alarmInputEdit.addEventListener('input', function () {
        const valueTime = new Date(this.value).getTime()
        if (valueTime !== prevTime) {
            if (itsAzan) {
                if ((valueTime > real) && (valueTime < info.endMax)) {
                    datetimeOk = true
                    setAlarmEdit.removeAttribute('disabled')
                }
                else {
                    setAlarmEdit.setAttribute('disabled', true)
                }
            }
            else if (!itsAzan) {
                datetimeOk = true
                setAlarmEdit.removeAttribute('disabled')
            }
        } else {
            setAlarmEdit.setAttribute('disabled', true)
        }
    })

    setAlarmEdit.addEventListener('click', function () {
        if (noteOk) {
            setAlarmObjectProperty(Id, 'title', notesAlarmInputEdit.value)
        }
        if (datetimeOk) {
            setAlarmObjectProperty(Id, 'datetime', alarmInputEdit.value, true)
        }

        if (itsAzan) {
            showAlarmList(true)
            showAlarmList(true, false, false, true)
        } else {
            showAlarmList(true, false, false, true)
            showAlarmList(true)
        }
        editDiv.remove()
        correctIsRunnningSetTimeoutPropertyOfAllUnringed()
        checkAndRingAlarm()
        toReload()
    })
    cancelEdit.addEventListener('click', function () {
        editDiv.remove()
    })


}
function showAlarmList(onlyDisplayShowing = false, setMoment = false, turnedOnMoment, showAzan = false) {
    const filtering = filteringBox.innerText
    const td = new Date()

    nullHandleForThisLocalStorageProperty('allAlarmSavedList')
    if ((JSON.parse(localStorage.getItem('allAlarmSavedList')).length > 0) && (onlyDisplayShowing === false)) {
        checkAndRingAlarm()
    }
    setAlarmList.innerHTML = ''
    azanBox.innerHTML = ''
    toSave = removeNullsFromThisList(toSave)
    localStorage.setItem('allAlarmSavedList', JSON.stringify(toSave))
    // ---correction past time alarms
    toSave = setAllPastTimeCorrected()
    let a;
    let l = 0;
    let grouping = false
    a = toSave
    if (toSave !== undefined) {
        if (filtering === 'Oldest First') {
        }
        else if (filtering === 'Latest First') {
            list = toSave.reverse()
        }
        else {
            grouping = true
            list = sortForGrouping(list)
        }
        let num = -1;
        a.forEach(function (o, i) {
            if (!o.isItForAzan) {
                num++
                l++
                const d = new Date(o.datetime)
                const id = o.id
                const on = o.isTurnedOn ? true : false
                const e = document.createElement('div')
                e.className = 'accordion-item'
                if (num === 0) {
                    e.id = 'latestOneAlarm'
                }
                e.innerHTML =
                    `
            ${grouping ? getGroupingResult(td, d) : ''}

            <h2 class="accordion-button alarmBoxPieces" data-bs-target="#${id}" data-bs-toggle="collapse">${num + 1}. ${o.title}
            <span class="mx-4 badge text-bg-success m-hide">${d.toLocaleString(undefined, { timeStyle: 'short' })}</span>
            <span class="mx-4 badge text-bg-success m-hide">${d.toLocaleString(undefined, { dateStyle: 'medium' })}</span>
            <span class="mx-4 badge text-bg-${on ? 'success' : 'secondary'} m-px">${on ? 'On' : 'Off'}</span>
            </h2>
            </div>
            <div class="accordion-collapse ${(turnedOnMoment === id || collapseIds.includes(id)) ? 'show' : ''} collapse alarmBoxPieces" id="${id}">
            <div class="accordion-body position-relative">
            <div class="position-absolute end-0">
            </div>
            <p><b>Date and time :</b> ${d.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
            <div class="form-check form-switch">
            <input title="Turn on or off this alarm" class="turnOnOrOff form-check-input switches" type="checkbox" role="switch" id="flexSwitchCheckDefault${num}" ${on ? 'checked' : ''} ${o.isDoneRingingOrStarted ? 'disabled' : ''}>
            <label class="form-check-label" for="flexSwitchCheckDefault${num}" style="user-select:none;" title="Turn on or off this alarm">Alarm on</label>
            </div>
            <div class="position-relative">
            <button id="setTomorrowBtn${id}" class="btn btn-sm btn-secondary mt-3 position-absolute start-0" title="Set alarm for next day at this time" onclick="setAlarm(getDateObjectOfNextDayIfInFuture('${d}'),'${o.title}')">Set For Next Day</button>
            <button id="deleteBtnAlarm${num}" class="btn btn-danger  btn-sm mt-3 deleteAlarm float-right position-absolute end-0" title="Delete this alarm" onclick="hideIt(this);deleteAlarm(this)">Delete alarm</button>
            <button id="editAlarm" onclick="editObject(this.parentElement.parentElement.parentElement)" class="btn btn-secondary  btn-sm mt-3 float-right position-absolute start-50" title="Edit This Alarm">Edit Alarm</button>
            </div>
            </div>
            `
                setAlarmList.appendChild(e)

            }
            else {
                if (showAzan) {
                    const d = new Date(o.datetime)
                    const id = o.id
                    const on = o.isTurnedOn ? true : false
                    const e = document.createElement('div')
                    e.className = 'accordion-item border azanAccordionItem'
                    e.innerHTML =

                        `
            <h2 class="px-4 accordion-button alarmBoxPieces" data-bs-target="#${id}" data-bs-toggle="collapse">${o.title}
            <span class="mx-4 badge text-bg-success m-hide">${d.toLocaleString(undefined, { timeStyle: 'short' })}</span>
            <span class="mx-4 badge text-bg-${on ? 'success' : 'secondary'} m-px">${on ? 'On' : 'Off'}</span>
            </h2>
            </div>
            <div class="az accordion-collapse ${(turnedOnMoment === id || collapseIds.includes(id)) ? 'show' : ''} collapse alarmBoxPieces" id="${id}">
            <div class="accordion-body position-relative azanAccordionBody">
            <button id="editAzan" onclick="editObject(this.parentElement.parentElement)" class="btn btn-secondary  btn-sm mt-3 float-right position-absolute end-0 top-0 my-1" title="Customize">Customize timing</button>
            <p><b>Date and time :</b> ${d.toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
            <div class="form-check form-switch">
            <input title="Turn on or off this alarm" class="turnOnOrOff form-check-input switches" type="checkbox" role="switch" id="flexSwitchCheckDefault${i}" ${on ? 'checked' : ''} ${o.isDoneRingingOrStarted ? 'disabled' : ''}>
            <label class="form-check-label" for="flexSwitchCheckDefault${i}" style="user-select:none;" title="Turn on or off this alarm">Azan on</label>
            </div>
             </div>
            `
                    azanBox.appendChild(e)
                }
            }
        });
        if (showAzan) {
            editButtonClearifyAzan()
        }
        // effect of last added
        if (setMoment) {
            const ltAlrm = $('#latestOneAlarm')
            ltAlrm.attr('style', 'display:none;')
            ltAlrm.show(300)
        }
        // adding event listener to tu
        $('.turnOnOrOff').each(function () {
            const E = this
            const e = $(E)
            $(e).click(function () {
                const i = E.parentElement.parentElement.parentElement.id
                if (getAlarmObjectPropertyValueById(i, 'isTurnedOn') === true) {
                    setAlarmObjectProperty(i, 'isTurnedOn', false)
                    setTimeout(() => {
                        showAlarmList()
                        correctIsRunnningSetTimeoutPropertyOfAllUnringed()
                        showAlarmList(true, false, i, true)
                        checkAndRingAlarm()
                    }, 60);
                }
                else {
                    setAlarmObjectProperty(i, 'isTurnedOn', true)
                    setTimeout(() => {
                        showAlarmList()
                        correctIsRunnningSetTimeoutPropertyOfAllUnringed()
                        showAlarmList(true, false, i, true)
                        checkAndRingAlarm()
                    }, 60);
                }
            })
        })
        $('.accordion-item').each(function () {
            $(this).click(function () {
                try {
                    const i = this.nextElementSbling.id
                    if (!(collapseIds.includes(i))) {
                        collapseIds.push(i)
                    }
                    else {
                        collapseIds = collapseIds.filter(function (v) {
                            return v !== i
                        });
                    }
                } catch (e) {

                }
            })
        })
        Array.from(document.getElementsByClassName('expandOrCollapseItems')).forEach(function (e) {
            e.addEventListener('click', function () {
                this.classList.toggle('bi-arrows-angle-expand')
                collapseTillNext(this)
            })
        })
    }
    totalAlarm.innerText = l
    showMsgIfNoAlarm()
    sortBeutify()
    correctIsRunnningSetTimeoutPropertyOfAllUnringed()
}
function setAlarm(dateAndTimeToSet, note) {

    let h = false
    if (note.length > 60) {
        return showAlert('alarm title should short', 3000, false)
    }
    const l = JSON.parse(localStorage.getItem('allAlarmSavedList'))
    const k = l.length
    for (let i = 0; i < k; i++) {
        const o = l[i];
        if (parseInt(new Date(o.datetime).getTime() / 60000) === parseInt(new Date(dateAndTimeToSet).getTime() / 60000)) {
            h = true
            break
        }
    }

    if (!h && JSON.parse(localStorage.allAlarmSavedList).length < 50) {
        let title = note
        dateAndTimeToSet = getDateTimeLocalToDateObj(dateAndTimeToSet)
        toSave = []
        const nowtime = new Date().getTime()
        if (dateAndTimeToSet.getTime() >= (nowtime + 4000)) {
            const i = showAlert('Alarm has been set for ', 3000, true, `${dateAndTimeToSet.toLocaleString()}`)
            addInLocalStorage(title, dateAndTimeToSet)
            showAlarmList(false, true)
            btnsClearify()
            setTimeout(() => {
                const e = document.getElementById(i)
                if (e !== null) {
                    e.remove()
                }
            }, 3000);
        }
        else {
            showAlert('alarm must be a time of future', 3000, false)
        }
    }
    else if (h) {
        showAlert('You already  have set an alarm at this time', 4000, false)
    }
    else {
        showAlert('Maximum 50 alarm could be set or store, please delete some to add more', 4000, false)
    }
}
function resetPage() {
    const conf = confirm('Are you sure you want to reset this page')
    if (conf) {
        localStorage.clear()
        location.reload()
    }
}
function localStorageSettingObj() {
    return JSON.parse(localStorage.getItem('setting'))
}
function ringedAlarmDeleteOnOrOff(e) {
    const s = localStorageSettingObj()
    e.checked ? s.automaticallyDeleleRingedAlarms = true : s.automaticallyDeleleRingedAlarms = false
    localStorage.setItem('setting', JSON.stringify(s))
}
// ==================================



// =============== Events and those ===================
// setAlarm event adding ------------ 
setAlarmBtn.addEventListener('click', function () {
    setAlarm(alarmInput.value, noteAlarmInput.value)
})
function hideIt(e) {
    $(e).parent().parent().parent().hide(310)
    $(e).parent().parent().parent().prev().hide(310)
}
function deleteAlarm(e) {
    const toRemove = e.parentElement.parentElement.parentElement.id
    setTimeout(() => {
        deleteAlarmFromLocalStorage(toRemove)
    }, 300);
}

// function of storage related 
// --> use comma for more class all should be typeof string
function correctionOfStorageSizeRelated() {
    const prcnt = getLocalStorageSizeInKB(true).toFixed(2)
    const kb = getLocalStorageSizeInKB().toFixed(2)
    $('.storageFullNowPercentage').each(function () {
        $(this).text(kb + 'KB')
        $(this).attr('aria-valuenow', prcnt)
        $(this).attr('style', `width:${prcnt}%;`)
    })
    $('.storageFullNowValue').text(kb)
    $('.storageFullNowValueRemaining').text((5120 - kb))
}

// ==================================

// ===================JQuery===============

// window on load actions -- >
function setModeOfTheme(modeValue, selectedIndex) {
    if (modeValue === 'bg-dark') {
        $('.mode-changable-dark').addClass('bg-dark')
        $('.mode-changable-light').addClass('bg-light')
        $('.btn-primary').addClass('white')
        $('.btn-primary').addClass('bg-dark')
        $('input[type="search"]').addClass('bg-light')
        $('.rm-bg-info').removeClass('bg-info')
    }
    else {
        $('.mode-changable-dark').removeClass('bg-dark')
        $('.mode-changable-light').removeClass('bg-light')
        $('.btn-primary').removeClass('white')
        $('.btn-primary').removeClass('bg-dark')
        $('input[type="search"]').removeClass('bg-light')
        $('.rm-bg-info').addClass('bg-info')
    }
    let elements = $('#settingSelectMode').children()
    elements.attr('selected', false)
    $(elements[selectedIndex]).attr('selected', true)

}
$(window).on("load", function () {

    correctIsRunnningSetTimeoutPropertyOfAllUnringed()
    btnsClearify()
    document.body.addEventListener('click', function () {
        showAlarmList()
        document.getElementById('allowAudioSound').click()
    }, { once: true })
    dnShowing = true
    // set ing mode on load 
    let mode = JSON.parse(localStorage.getItem('mode'))
    setModeOfTheme(mode.modeClassName, mode.modeSelectedIndex)
    // hiding youtube tone paste link on load
    correctionOfStorageSizeRelated()
    // adding border on click of nav items
    $('.pagesBtn').each(function () {
        $(this).click(function () {
            $('.pagesBtn').removeClass('border2px')
            $(this).addClass('border2px')
        })
    })
    // removing unknown localstorage properties
    removeUnknownLocalStorageProperties()
    // settings delete ringed alarm on or off on reload
    JSON.parse(localStorage.getItem('setting')).automaticallyDeleleRingedAlarms ? $('#deleteRingedAlarm').attr('checked', true) : $('#deleteRingedAlarm').removeAttr('checked')


    // azanrelated

})

jQuery(document).ready(function ($) {
    // Permissions
    $('.mobileDetectedOk').click(function () {
        location = 'https://www.google.com/'
    })
    fetch('https://api.bigdatacloud.net/data/client-info').
        then(function (r) {
            return r.json()
        }).then(function (r) {
            if (r.isMobile == true) {
                mb = true
                $('#mobileDetected').modal('show')
                localStorage.clear()
                clearAllTimeouts()
            }
            else {
                $('#askForPermissionToPlayAudioPrompt').modal('show')
            }
        }).catch(function (_) {
            $('#askForPermissionToPlayAudioPrompt').modal('show')
        })

    // events on switch inputs
    $('input[role="switch"],.turnOnOrOff').each(function () {
        this.style.userSelect = 'none'
        this.nextElementSibling.style.userSelect = 'none'
    })
    // =====================
    // delete all alarms prompt
    // =====================
    $('#cancelConfirmation').click(function () {
        $('#btn-close-delete-all-alarms').click()
        $('body').css({ 'overflow-y': 'scroll !important' })
    })
    $('#acceptConfirmation').click(function () {
        deleteAlarmsAllFromLocalStorage()
    })
    // event listener of filter alarms
    $('.filter-alarms').each(function () {
        $(this).click(function () {
            this.classList.add('none')
            if ('Grouping' === this.id) {
                this.previousElementSibling.previousElementSibling.classList.toggle('none')
                filteringBox.innerText = 'Latest First'
                showAlarmList(true)
            }
            else {
                this.nextElementSibling.classList.toggle('none')
                filteringBox.innerText = this.nextElementSibling.id.replace('-', ' ')
                showAlarmList(true)
            }
        })
    })

    // adding event listnerer of setting button
    $('#setting').click(function () {
        $('#settingPage').show(500)
    })
    // ===================
    // adding mode in setting changes
    // ===================

    $('#settingSelectMode').on('change', function () {
        let i = this.selectedIndex
        let mode = ($(this).children())[i].value
        obj = {
            modeClassName: mode,
            modeSelectedIndex: i
        }
        localStorage.setItem('mode', JSON.stringify(obj))
        setModeOfTheme(mode, i)
    })

    // ================================
    // related of data and storage
    // ================================
    function isValidLocalStorageItems(v) {
        try {
            const o = JSON.parse(v)
            if ((Array.isArray(JSON.parse(o.allAlarmSavedList)) &&
                isObLnN(o.defaultAlarmTone, 2) &&
                isObLnN(o.defaultAzanTone, 2) &&
                isObLnN(o.mode, 2) &&
                isObLnN(o.setting, 1))) {
                return true
            }
            else {
                return false
            }
        }
        catch (e) {

            return false
        }
    }
    $('#copyDataLocalStorage').click(function () {
        navigator.clipboard.writeText(JSON.stringify(localStorage))
        $(this).text('Copied')
        setTimeout(() => {
            $(this).text('Copy Data')
        }, 3000);

    })
    $('#importDataText').on('input', function () {
        if (!isValidLocalStorageItems(this.value)) {
            this.classList.add('bred')
            this.classList.remove('blime')
        }
        else {
            this.classList.remove('bred')
            this.classList.add('blime')
        }
    })

    // event on click on save after import localstorage data
    $('#saveDataSection').click(function () {
        try {
            const o = JSON.parse(this.previousElementSibling.value)
            for (const [k, v] of Object.entries(o)) {
                localStorage.setItem(k, v)
            }
            location.reload()
        } catch (e) {

            showAlert('sorry something went wrong while saving and set data', 3000, false, '', 100000)
        }

    })

    // ================================
    // setting azan and alarm default voice or tone
    // ================================
    // ----------->>> first alarm page ---------------->>    
    function setAlarmAzanSettingDisplay() {
        const ao = JSON.parse(localStorage.getItem('defaultAzanTone'))
        const lo = JSON.parse(localStorage.getItem('defaultAlarmTone'))
        const allOptionsAzan = $('#settingSelectRingtoneAzan')
        const allOptionsAlarm = $('#settingSelectRingtoneAlarm')
        allOptionsAzan.removeAttr('selected')
        allOptionsAlarm.removeAttr('selected')

        $(allOptionsAzan.children()[ao.nthNumberSelected]).attr('selected', true)
        $(allOptionsAlarm.children()[lo.nthNumberSelected]).attr('selected', true)



    }
    let o = {
        nthNumberSelected: 0,
        src: 'audio/Alarm0.mp3'
    }
    $('#settingSelectRingtoneAzan, #settingSelectRingtoneAlarm').on('change', function () {
        const s = this.selectedIndex
        o.nthNumberSelected = s
        const its = (this.id).includes('Alarm') ? 'Alarm' : 'Azan'
        const sr = `audio/${its + s}.mp3`
        o.src = sr
        its === 'Azan' ? azanAudio.src = sr : alarmAudio.src = sr
        localStorage.setItem(`default${its}Tone`, JSON.stringify(o))
        setAlarmAzanSettingDisplay()
    })
    setAlarmAzanSettingDisplay()






})
// azan related ------------------------------------------
function getUserGeoLocation() {

    fetch('https://api.bigdatacloud.net/data/reverse-geocode-client').then(function (r) {
        return r.json();
    }).then(function (r) {
        let countryCd = r.countryCode === '' ? 'BD' : r.countryCode
        let cit;
        if (r.city !== '') {
            cit = r.city
        } else if (r.locality !== '') {
            cit = r.locality
        } else {
            cit = 'Sylhet'
        }
        countryOptions.removeAttr('selected')
        let inde;
        cty.value = cit
        countryOptions.each(function (index) {
            if (this.value === countryCd) {
                inde = index
                this.setAttribute('selected', true)
                return
            }
        })

        localStorage.setItem('userInfo', JSON.stringify({
            selectedIndex: inde,
            countryCode: countryCd,
            city: cit
        }))

        let obj = JSON.parse(localStorage.getItem('userInfo'))
        sendRequestForAzan(obj.selectedIndex, obj.countryCode, obj.city, true)
    }).catch(function (e) {
        return
    });
}
function sendRequestForAzan(selectedIndx = 0, country = undefined, city = undefined, action = false) {
    tbody.innerHTML =
        `
    <div class="flex-center spinner">
    <div class="spinner-grow" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
</div>
    `
    tbody2.innerHTML =
        `
    <div class="flex-center spinner">
    <div class="spinner-grow" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
</div>
    `
    $('.spinner').show()
    let s = JSON.parse(localStorage.getItem('aboutAzan'))
    if (s !== null && !action) {

        return
    }
    const today = new Date()
    const u = new URL(`https://api.aladhan.com/v1/calendarByCity?city=${city}&country=${country}&month=${today.getMonth()}&year=${today.getFullYear()}&method=3`)

    fetch(u)
        .then(function (r) {
            return r.json();
        }).then(function (r) {
            if (r.status !== 'OK') {
                localStorage.removeItem('aboutAzan')
                localStorage.removeItem('userInfo')
            }
            else {
                localStorage.setItem('aboutAzan', JSON.stringify({
                    lastDataFetched: today,
                    data: r.data,
                }))
                setTimeout(() => {
                    showAzanDisplay(selectedIndx, city)
                }, 0);
            }


        }).catch(function (e) {

        });

}
function showAzanDisplay(selectedIndx = undefined, c = undefined) {
    if (selectedIndx !== undefined) {
        countryOptions.removeAttr('selected')
        $((countryOptions)[selectedIndx]).attr('selected', true)
    }
    if (c !== undefined) {
        cty.value = c
    }
    const ty = new Date()
    const dt = ty.getDate()
    const monthName = (ty.toLocaleDateString(undefined, { dateStyle: 'medium' })).split(' ')[0]
    function getRow(timings, date) {
        delete timings.Firstthird
        delete timings.Lastthird
        let tr = document.createElement('tr')
        tr.innerHTML += `<th>${date}</th>`
        for (prop in timings) {
            const time = fmt(timings[prop])
            tr.innerHTML += `<td>${time}</td>`
        }
        return tr

    }

    try {
        const d = JSON.parse(localStorage.getItem('aboutAzan')).data
        const len = d.length
        const td = d[ty.getDate() - 1]
        const t = td.timings
        tbody.appendChild(getRow(td.timings, td.date.readable))
        delete t.Sunrise
        delete t.Sunset
        delete t.Imsak
        delete t.Midnight
        delete t.Firstthird
        delete t.Lastthird
        localStorage.setItem('todayTimings', JSON.stringify(t))
        let x = 0;
        for (let i = 0; i < len; i++) {
            const di = d[i]
            const readable = di.date.readable
            if (parseInt(readable.split(' ')[0]) > dt) {
                tbody2.appendChild(getRow(di.timings, readable))
                x++
            }
        }
        if (x === 0) {
            $('.tab2').remove()
        }
        $('.todayDate').text(ty.toLocaleDateString(undefined, { dateStyle: 'medium' }))
        $('.todayMonth').text(monthName)
        $('.spinner').hide()
        $('#cityOf').text(c)
        $('#showAccordingToCity').text(JSON.parse(localStorage.getItem('userInfo')).city)

        function setAzanTimes() {
            const n = ['Isha', 'Magrib', 'Asar', 'Dhuhor', 'Fajr']
            let g = [7200000, 600000, 2100000, 3600000, 3000000]
            const tms = Object.values(JSON.parse(localStorage.getItem('todayTimings'))).reverse()
            const l = tms.length
            const v = JSON.parse(localStorage.getItem('autoTurnOnAzan'))
            const isEndMaxDone = JSON.parse(localStorage.getItem('isEndMaxDone'))
            for (let i = 0; i < l; i++) {
                const y = convToTody(tms[i])
                y.setTime(y.getTime() + i)
                if (v === true) {
                    isEndMaxDone === true ? addInLocalStorage(n[i], new Date(y), false, true) : addInLocalStorage(n[i], new Date(y), false, true, y.getTime() + g[i], y.getTime())
                } else {
                    isEndMaxDone === true ? addInLocalStorage(n[i], new Date(y), false, false) : addInLocalStorage(n[i], new Date(y), false, false, y.getTime() + g[i], y.getTime())
                }
            }
            if (isEndMaxDone === null) {
                localStorage.setItem('isEndMaxDone', JSON.stringify(true))
            }
        }

        if (getAzanObjects().length === 0 || ((new Date(JSON.parse(localStorage.getItem('aboutAzan')).lastDataFetched).getDate() !== ty.getDate()))) {
            setAzanTimes()
        }
        showAlarmList(false, false, false, true)

    } catch (e) {

    }
}
function convToTody(s) {
    const t = new Date()
    s = ((s.split(' ')[0]).split(':'))
    const h = s[0]
    const m = s[1]
    t.setHours(parseInt(h), parseInt(m), 0)
    return t
}
if (JSON.parse(localStorage.getItem('autoTurnOnAzan')) === true) {
    document.getElementById('autoTurnOnAzan').setAttribute('checked', true)
} else {
    document.getElementById('autoTurnOnAzan').removeAttribute('checked')
}
function setAutoTurnOnAzanOnOrOff(e) {
    if (e.checked) {
        localStorage.setItem('autoTurnOnAzan', JSON.stringify(true))
    }
    else {
        localStorage.setItem('autoTurnOnAzan', JSON.stringify(false))
    }
    removeAzanObjectsFromSaved()
    toReload()
}
cancelConfirmation
// execute functions >>>>>>>>>>>>>>>>>
jQuery(document).ready(function () {
    // input system of country city 
    $('#country, #city').on('change input', function () {
        setLocation.removeAttribute('disabled')
    })

    // trying to guess location else directly show azan times
    if (Array.isArray(JSON.parse(localStorage.getItem('userInfo')))) {
        getUserGeoLocation()
    } else {
        const o = JSON.parse(localStorage.userInfo)
        sendRequestForAzan(o.selectedIndex, o.countryCode, o.city, true)
    }
    // changing location and set system
    $('#setLocation').click(function () {
        removeAllAzanObjsFromLocalStorage()
        let cnt = $('#country').val()
        let cit = $('#city').val()
        cit = cit[0].toUpperCase() + cit.slice(1)
        let selected = (document.getElementById('country')).selectedIndex
        localStorage.setItem('userInfo', JSON.stringify({
            selectedIndex: selected,
            countryCode: cnt,
            city: cit
        }))
        this.setAttribute('disabled', true)
        sendRequestForAzan(selected, cnt, cit, true)
    })

    // --- Adding azan reminder  
    $('#azanBtn').click(function () {
        if (azanBox.innerHTML.length < 10) {
            showAlarmList(false, false, false, true)
        }
    })
    // setting --tone
    $('.toneTackle1').each(function () {
        $(this).click(function () {
            $('.toneTackle1').removeAttr('disabled')
            $(this).attr('disabled', true)
        })
    })
    $('.toneTackle2').each(function () {
        $(this).click(function () {
            $('.toneTackle2').removeAttr('disabled')
            $(this).attr('disabled', true)
        })
    })
    playAudio1.addEventListener('click', function () {
        azanAudio.play()
    })
    pauseAudio1.addEventListener('click', function () {
        azanAudio.pause()
    })
    stopAudio1.addEventListener('click', function () {
        azanAudio.pause()
        azanAudio.currentTime = 0
    })
    playAudio2.addEventListener('click', function () {
        alarmAudio.play()
    })
    pauseAudio2.addEventListener('click', function () {
        alarmAudio.pause()
    })
    stopAudio2.addEventListener('click', function () {
        alarmAudio.pause()
        alarmAudio.currentTime = 0
    })
})
let nw = new Date().getDate()
const check = JSON.parse(localStorage.getItem('aboutAzan'))
if (check !== null){
    const latest = check['lastDataFetched'].getDate()
    if (nw > latest){
        localStorage.removeItem('aboutAzan')
        localStorage.removeItem('todayTimings')
        localStorage.removeItem('userInfo')
        getUserGeoLocation()
    }
}

// ==================================































// refresh page after every 3 days
function toReload() {
    location.reload()
}
setTimeout(() => {
    toReload()
}, 259200000);




