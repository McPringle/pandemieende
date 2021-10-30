const oneHour = 60 * 60 * 1000; // minutes * seconds * milliseconds
const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
const residents = 8670300 + 38747; // Schweiz (Stand 2020, Bundesamt für Statistik) und Liechtenstein (Stand 2021, Amt für Statistik)
const vaccinationRateDays = 14; // number of days used to calculate the average vaccination rate

function toDate(dateString) {
    return new Date(dateString + 'T00:00:00.000Z');
}

function toDateString(date) {
    return ('0' + date.getDate()).slice(-2) + '.'
        + ('0' + (date.getMonth()+1)).slice(-2) + '.'
        + date.getFullYear();
}

function toNumberString(number) {
    return typeof number == 'number' ? number.toLocaleString("de-CH") : number;
}

function toDurationString(numberOfDays) {
    let years = 0;
    while (numberOfDays >= 365) {
        years++;
        numberOfDays -= 365;
    }
    const yearText = years === 1 ? "Jahr" : "Jahre";

    let months = 0;
    while (numberOfDays >= 30) {
        months++;
        numberOfDays -= 30;
    }
    const monthText = months === 1 ? "Monat" : "Monate";

    const days = numberOfDays;
    const dayText = days === 1 ? "Tag" : "Tage";

    let text = years > 0 ? years + " " + yearText + ", " : "";
    text += years + months > 0 ? months + " " + monthText + ", " : "";
    text +=  days + " " + dayText;

    return text;
}

function updateChart(vaccinationDataHistory) {
    const vaccinationStatusDates = vaccinationDataHistory.map(function (row) { return row['statusDate']; });
    const vaccinationDataPercent = vaccinationDataHistory.map(function (row) { return row['vaccinationRate']; });
    const threshold = new Array(vaccinationDataPercent.length).fill(80);
    const ctx = document.getElementById('vaccinationChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: vaccinationStatusDates,
            datasets: [
                { label: 'vollständig geimpfte Personen', data: vaccinationDataPercent, borderColor: '#dc1c13', borderWidth: 3, fill: false },
                { label: 'nötige Herdenimmunität (80%)', data: threshold, borderColor: '#69f0ae', borderWidth: 1, fill: false }
            ]
        },
        options: {
            title: {
                display: false
            },
            legend: {
                display: true
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                }]
            },
            responsive: true,
        }
    });
}

function updateTable(vaccinationDataHistory, lastUpdate) {

    const statusDate = toDate(vaccinationDataHistory[vaccinationDataHistory.length - 1]['statusDate']);
    const vaccinationRateDaysIndex = vaccinationRateDays + 1;
    const vaccinationRateBefore = vaccinationDataHistory[vaccinationDataHistory.length - vaccinationRateDaysIndex]['vaccinationRate'];
    const vaccinationRateLast = vaccinationDataHistory[vaccinationDataHistory.length - 1]['vaccinationRate'];
    const vaccinationRateDiff = 80 - vaccinationRateLast;
    const vaccinationRatePerDay = (vaccinationRateLast - vaccinationRateBefore) / vaccinationRateDays;
    const deviation = Math.ceil(Math.abs(Date.now() - statusDate) / oneDay) - 1;
    const daysToGo = Math.round((80 - vaccinationRateLast) / vaccinationRatePerDay) - deviation;
    const endDate = new Date().setDate(new Date().getDate() + daysToGo);

    document.getElementById("endDate").innerHTML = toDateString(new Date(endDate));
    document.getElementById("daysToGo").innerHTML = toNumberString(daysToGo);
    document.getElementById("daysToGoText").innerHTML = toDurationString(daysToGo);
    document.getElementById("vaccinationRateLast").innerHTML = toNumberString(vaccinationRateLast) + " %";
    document.getElementById("vaccinationRateDiff").innerHTML = toNumberString(vaccinationRateDiff) + " %";

    const vaccinationRateDaysElements = document.getElementsByClassName("vaccinationRateDays");
    for (let i = 0; i < vaccinationRateDaysElements.length; i++) {
        vaccinationRateDaysElements[i].innerHTML = toNumberString(vaccinationRateDays);
    }

    const statusDateElements = document.getElementsByClassName("statusDate");
    for (let i = 0; i < statusDateElements.length; i++) {
        statusDateElements[i].innerHTML = vaccinationDataHistory[vaccinationDataHistory.length - 1]['statusDate'];
    }

    document.getElementById("lastUpdate").innerHTML = lastUpdate;
}

function loadVaccineData() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.json?t=' + new Date().getTime(), true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        const status = xhr.status;
        if (status === 200) {
            const vaccinationData = xhr.response;
            updateChart(vaccinationData['history']);
            updateTable(vaccinationData['history'], vaccinationData['lastUpdate']);
        } else {
            alert('Hoppla, ich konnte die Impfdaten nicht vom Server laden!\nFehlercode: ' + status);
        }
    };
    xhr.send();
}

window.onload = function () {
    loadVaccineData();
    setInterval(loadVaccineData, oneHour);
}
