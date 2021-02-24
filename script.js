const JAN = 0;
const FEB = 1;
const MAR = 2;
const APR = 3;
const MAI = 4;
const JUN = 5
const JUL = 6;
const AUG = 7;
const SEP = 8;
const OKT = 9;
const NOV = 10;
const DEZ = 11;

const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

const vaccinationData = [
    // Datum, vollständig geimpft Prozent, Absolut, verabreichte Dosen
    [ new Date(2021, FEB, 14), 1.18, 102390, 542848 ],
    [ new Date(2021, FEB, 15), 1.24, 107118, 525334 ],
    [ new Date(2021, FEB, 16), 1.30, 112527, 563073 ],
    [ new Date(2021, FEB, 17), 1.60, 138016, 614066 ],
    [ new Date(2021, FEB, 18), 1.66, 143703, 625196 ],
    [ new Date(2021, FEB, 19), 1.73, 149719, 635089 ],
    [ new Date(2021, FEB, 20), 1.74, 150831, 636780 ],
    [ new Date(2021, FEB, 21), 2.01, 173407, 675556 ],
];

const vaccinationDataStatusDates = vaccinationData.map(function (row) { return toDateString(row[0]); });
const vaccinationDataPercent = vaccinationData.map(function (row) { return row[1]; });

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

function getColor(value, light){
    const hue = ((value)*120).toString(10);
    return ["hsl(",hue,",70%,",light,"%)"].join("");
}

function updateChart() {
    const threshold = new Array(vaccinationDataPercent.length).fill(70);
    const ctx = document.getElementById('vaccinationChart').getContext('2d');
    const vaccinationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: vaccinationDataStatusDates,
            datasets: [
                { label: 'vollständig geimpft', data: vaccinationDataPercent, borderColor: '#dc1c13', borderWidth: 3, fill: false },
                { label: 'Herdenimmunität (70%)', data: threshold, borderColor: '#69f0ae', borderWidth: 1, fill: false }
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

function updateTable() {
    const statusDate = vaccinationData[vaccinationData.length - 1][0];
    const administeredVaccineDoses = vaccinationData[vaccinationData.length - 1][3];

    const residents = 8606033 + 38650; // Schweiz und Liechtenstein (Stand 2019, Bundesamt für Statistik)
    const toBeVaccinated = Math.round(residents * .7);
    const vaccinatedPersons = vaccinationData[vaccinationData.length - 1][2];
    const stillToBeVaccinated = toBeVaccinated - vaccinatedPersons;
    const stillRequiredVaccineDoses = stillToBeVaccinated * 2;

    const statusDateBefore = vaccinationData[vaccinationData.length - 8][0];
    const administeredVaccineDosesBefore = vaccinationData[vaccinationData.length - 8][3];
    const vaccinationRateDays = Math.round(Math.abs((statusDateBefore - statusDate) / oneDay));
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

    const vaccinationRateDaysElements = document.getElementsByClassName("vaccinationRateDays");
    for (let i = 0; i < vaccinationRateDaysElements.length; i++) {
        vaccinationRateDaysElements[i].innerHTML = toNumberString(vaccinationRateDays);
    }

    const statusDateElements = document.getElementsByClassName("statusDate");
    for (let i = 0; i < statusDateElements.length; i++) {
        statusDateElements[i].innerHTML = vaccinationDataStatusDates[vaccinationDataStatusDates.length - 1];
    }

    const statusDateBeforeElements = document.getElementsByClassName("statusDateBefore");
    for (let i = 0; i < statusDateBeforeElements.length; i++) {
        statusDateBeforeElements[i].innerHTML = toDateString(statusDateBefore);
    }
}

window.onload = function () {
    updateChart();
    updateTable();
}
