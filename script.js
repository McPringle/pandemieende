const oneHour = 60 * 60 * 1000; // minutes * seconds * milliseconds
const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
const residents = 8606033 + 38650; // Schweiz und Liechtenstein (Stand 2019, Bundesamt für Statistik)

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

    return years + " " + yearText + ", " + months + " " + monthText + ", " + days + " " + dayText;
}

function toPercent(vaccinatedPersons) {
    return Math.round(vaccinatedPersons * 100 / residents * 100) / 100;
}

function updateChart(vaccinationDataHistory) {
    const vaccinationStatusDates = vaccinationDataHistory.map(function (row) { return row['statusDate']; });
    const vaccinationDataPercent = vaccinationDataHistory.map(function (row) { return row['vaccinationRate']; });
    const vaccinationDataPercentImmune = vaccinationDataHistory.map(function (row) { return toPercent(row['vaccinatedPersons'] + row['laboratoryConfirmedCases'] - row['laboratoryConfirmedDeaths']); });
    const threshold = new Array(vaccinationDataPercent.length).fill(70);
    const ctx = document.getElementById('vaccinationChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: vaccinationStatusDates,
            datasets: [
                { label: 'vollständig geimpfte Personen', data: vaccinationDataPercent, borderColor: '#dc1c13', borderWidth: 3, fill: false },
                { label: 'vollständig geimpfte & gesundete Personen', data: vaccinationDataPercentImmune, borderColor: '#f9842c', borderWidth: 3, fill: false },
                { label: 'nötige Herdenimmunität (70%)', data: threshold, borderColor: '#69f0ae', borderWidth: 1, fill: false }
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
    const administeredVaccineDoses = vaccinationDataHistory[vaccinationDataHistory.length - 1]['administeredVaccineDoses'];

    const toBeVaccinated = Math.round(residents * .7);
    const vaccinatedPersons = vaccinationDataHistory[vaccinationDataHistory.length - 1]['vaccinatedPersons'];
    const stillToBeVaccinated = toBeVaccinated - vaccinatedPersons;
    const stillRequiredVaccineDoses = stillToBeVaccinated * 2;

    const vaccinationRateDays = 7;
    const vaccinationRateDaysIndex = vaccinationRateDays + 1;
    const administeredVaccineDosesBefore = vaccinationDataHistory[vaccinationDataHistory.length - vaccinationRateDaysIndex]['administeredVaccineDoses'];
    const vaccinationRateLast = Math.round((administeredVaccineDoses - administeredVaccineDosesBefore) / vaccinationRateDays);

    const deviation = Math.ceil(Math.abs(Date.now() - statusDate) / oneDay) - 1;
    const daysToGo = Math.round(stillRequiredVaccineDoses / vaccinationRateLast) - deviation;
    const endDate = new Date().setDate(new Date().getDate() + daysToGo);

    document.getElementById("endDate").innerHTML = toDateString(new Date(endDate));
    document.getElementById("daysToGo").innerHTML = toNumberString(daysToGo);
    document.getElementById("daysToGoText").innerHTML = toDurationString(daysToGo);

    document.getElementById("residents").innerHTML = toNumberString(residents);
    document.getElementById("toBeVaccinated").innerHTML = toNumberString(toBeVaccinated);
    document.getElementById("vaccinatedPersons").innerHTML = toNumberString(vaccinatedPersons);
    document.getElementById("vaccinationRateLast").innerHTML = toNumberString(vaccinationRateLast);

    document.getElementById("laboratoryConfirmedCases").innerHTML = toNumberString(vaccinationDataHistory[vaccinationDataHistory.length - 1]['laboratoryConfirmedCases']);
    document.getElementById("laboratoryConfirmedDeaths").innerHTML = toNumberString(vaccinationDataHistory[vaccinationDataHistory.length - 1]['laboratoryConfirmedDeaths']);

    const vaccinationRateDaysElements = document.getElementsByClassName("vaccinationRateDays");
    for (let i = 0; i < vaccinationRateDaysElements.length; i++) {
        vaccinationRateDaysElements[i].innerHTML = toNumberString(vaccinationRateDays);
    }

    const statusDateElements = document.getElementsByClassName("statusDate");
    for (let i = 0; i < statusDateElements.length; i++) {
        statusDateElements[i].innerHTML = vaccinationDataHistory[vaccinationDataHistory.length - 1]['statusDate'];
    }

    const statusDateBeforeElements = document.getElementsByClassName("statusDateBefore");
    for (let i = 0; i < statusDateBeforeElements.length; i++) {
        statusDateBeforeElements[i].innerHTML = vaccinationDataHistory[vaccinationDataHistory.length - vaccinationRateDaysIndex]['statusDate'];
    }

    document.getElementById("lastUpdate").innerHTML = lastUpdate;
}

function loadVaccineData() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.json', true);
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
